import * as React from 'react';

/**
 * @see https://github.com/radix-ui/primitives/blob/main/packages/react/use-callback-ref/src/useCallbackRef.tsx
 */

/**
 * useCallbackRef: A Simplified Explanation
 *
 * WHAT IT DOES:
 * This hook takes a function (callback) and returns a stable version of it that won't change
 * between renders, but will always use the latest version of your original function.
 *
 * WHY IT'S USEFUL:
 * 1. PREVENTS UNNECESSARY RE-RENDERS: When you pass callbacks as props to child components,
 *    using this hook prevents those components from re-rendering unnecessarily.
 *
 * 2. AVOIDS DEPENDENCY ISSUES IN USEEFFECT: When you need to use a function in a useEffect
 *    dependency array, this hook helps avoid infinite loops.
 *
 * HOW IT WORKS:
 * - We store your callback function in a ref (like a box that keeps its contents between renders)
 * - We update what's in the box whenever your original function changes
 * - We create a new function that looks inside the box and calls whatever function is there
 * - This new function never changes, so it's safe to use in dependency arrays and props
 *
 * EXAMPLE USE CASE:
 * When you have an event handler that depends on props or state, but you don't want
 * child components to re-render every time those dependencies change.
 */
function useCallbackRef<T extends (...args: never[]) => unknown>(
  callback: T | undefined,
): T {
  // Store the callback in a ref so we can update it without causing re-renders
  const callbackRef = React.useRef(callback);

  // Update the stored callback whenever the provided callback changes
  React.useEffect(() => {
    callbackRef.current = callback;
  });

  // Create a stable function that calls the latest callback
  // This function never changes between renders (empty dependency array)
  // but it will always call the most recent version of your callback
  return React.useMemo(
    () => ((...args) => callbackRef.current?.(...args)) as T,
    [], // Empty dependency array means this function is created once and never changes
  );
}

export { useCallbackRef };
