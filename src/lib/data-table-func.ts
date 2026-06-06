// Import necessary libraries
import { Column } from '@tanstack/react-table';
// This imports the Column type from TanStack Table library
import { createParser } from 'nuqs/server';
// This imports a function to create URL query parsers
import { z } from 'zod';

// This imports Zod, a validation library

// Define a schema (structure) for sorting items using Zod
// This ensures that each sorting item has an 'id' (string) and 'desc' (boolean) property
const sortingItemSchema = z.object({
  id: z.string(), // The column ID that's being sorted
  desc: z.boolean(), // Whether the sort is descending (true) or ascending (false)
});

// This function creates a parser for sorting state from URL query parameters
export const getSortingStateParser = (columnIds?: string[] | Set<string>) => {
  // Convert the column IDs to a Set for faster lookups, or keep as null if not provided
  const validKeys = columnIds
    ? columnIds instanceof Set
      ? columnIds // If it's already a Set, use it directly
      : new Set(columnIds) // If it's an array, convert to a Set
    : null; // If no columnIds provided, set to null

  // Create and return a parser that can convert between URL strings and JavaScript objects
  return createParser({
    // This function converts a string from the URL to a sorting state object
    parse: (value) => {
      try {
        // Try to parse the JSON string from the URL
        const parsed = JSON.parse(value);
        // Validate the parsed value against our schema
        const result = z.array(sortingItemSchema).safeParse(parsed);

        // If validation fails, return null
        if (!result.success) return null;

        // If we have a list of valid column IDs, check that all sorted columns are valid
        if (validKeys && result.data.some((item) => !validKeys.has(item.id))) {
          return null; // Return null if any column ID is not in our valid list
        }

        // If everything is valid, return the parsed data
        return result.data;
      } catch {
        // If JSON parsing fails, return null
        return null;
      }
    },
    // This function converts a sorting state object to a string for the URL
    serialize: (value) => JSON.stringify(value),

    // This function checks if two sorting states are equal
    // Used to avoid unnecessary URL updates
    eq: (a, b) =>
      a.length === b.length && // Check if they have the same number of items
      a.every(
        (item, index) =>
          item.id === b[index]?.id && item.desc === b[index]?.desc, // Check if each item matches
      ),
  });
};

// This function generates CSS styles for pinned columns in a data table
export function getCommonPinningStyles<TData>({
  column, // The column to generate styles for
  withBorder = false, // Whether to add border shadows (default: false)
}: {
  column: Column<TData>; // The column must be a TanStack Table Column
  withBorder?: boolean; // Optional border parameter
}): React.CSSProperties {
  // Returns a React CSS style object
  // Check if the column is pinned
  const isPinned = column.getIsPinned(); // Can be 'left', 'right', or false

  // Check if this is the last column pinned to the left
  const isLastLeftPinnedColumn =
    isPinned === 'left' && column.getIsLastColumn('left');

  // Check if this is the first column pinned to the right
  const isFirstRightPinnedColumn =
    isPinned === 'right' && column.getIsFirstColumn('right');

  // Return a style object with all the necessary CSS properties
  return {
    // Add a shadow to visually separate pinned columns from the rest
    boxShadow: withBorder
      ? isLastLeftPinnedColumn
        ? '-4px 0 4px -4px var(--border) inset' // Shadow for last left-pinned column
        : isFirstRightPinnedColumn
          ? '4px 0 4px -4px var(--border) inset' // Shadow for first right-pinned column
          : undefined // No shadow for other columns
      : undefined, // No shadow if withBorder is false

    // Position the column correctly when pinned to the left
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,

    // Position the column correctly when pinned to the right
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,

    // Make pinned columns slightly transparent
    opacity: isPinned ? 0.95 : 1,

    // Use 'sticky' positioning for pinned columns so they stay in place when scrolling
    position: isPinned ? 'sticky' : 'relative',

    // Set the background color to match the table background
    background: isPinned ? 'var(--background)' : 'var(--background)',

    // Set the width of the column
    width: column.getSize(),

    padding: '10px',

    // Make sure pinned columns appear above other content
    zIndex: isPinned ? 1 : 0,
  };
}
