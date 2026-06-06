/**
 * useDebouncedCallback: A Simplified Explanation
 *
 * WHAT IT DOES:
 * This hook takes a function and a delay time, and returns a new function that will only
 * execute after the specified delay has passed without being called again.
 *
 * WHY IT'S USEFUL:
 * 1. PREVENTS RAPID FIRING: When an event might trigger many times in quick succession
 *    (like typing, scrolling, or resizing), this hook prevents your function from being
 *    called too frequently, which can improve performance.
 *
 * 2. WAITS FOR USER TO FINISH: For example, in a search input, you can wait until the user
 *    stops typing before making an API call, rather than calling the API on every keystroke.
 *
 * HOW IT WORKS:
 * - When you call the debounced function, it sets a timer
 * - If you call it again before the timer finishes, it cancels the previous timer and starts a new one
 * - Only when the timer completes without interruption does your original function get called
 * - It's like saying "wait until things calm down before taking action"
 *
 * EXAMPLE USE CASE:
 * Search inputs where you want to wait until the user stops typing before fetching results,
 * or window resize handlers where you want to wait until resizing is complete before recalculating layouts.
 *
 * @see https://github.com/mantinedev/mantine/blob/master/packages/@mantine/hooks/src/use-debounced-callback/use-debounced-callback.ts
 */
import * as React from 'react';

import { useCallbackRef } from './use-callback-ref';

export function useDebouncedCallback<T extends (...args: never[]) => unknown>(
  callback: T, // The function you want to debounce
  delay: number, // The delay in milliseconds before executing the function
) {
  // Use the stable callback reference that will always point to the latest version
  const handleCallback = useCallbackRef(callback);

  // Store the timeout ID so we can cancel it if needed
  const debounceTimerRef = React.useRef(0);

  // Clean up any pending timeout when the component unmounts
  React.useEffect(
    () => () => window.clearTimeout(debounceTimerRef.current),
    [],
  );

  // Create a stable function that manages the debouncing logic
  const setValue = React.useCallback(
    (...args: Parameters<T>) => {
      // Cancel any existing timeout to reset the debounce timer
      window.clearTimeout(debounceTimerRef.current);

      // Set a new timeout that will execute the callback after the delay
      debounceTimerRef.current = window.setTimeout(
        () => handleCallback(...args), // Call the original function with all arguments
        delay,
      );
    },
    [handleCallback, delay], // Only recreate this function if these dependencies change
  );

  // Return the debounced function
  return setValue;
}
