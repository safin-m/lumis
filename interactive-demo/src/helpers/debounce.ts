/**
 * Debounce Helper Function
 *
 * A utility function that delays the execution of a function until after
 * a specified delay period has elapsed since the last time it was invoked.
 * Useful for optimizing performance in scenarios like search inputs or resize handlers.
 *
 * @param fn - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns A debounced version of the function
 *
 * @example
 * const debouncedSave = debounce((data) => {
 *   saveToServer(data);
 * }, 500);
 */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): T {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function (this: any, ...args: any[]) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  } as T;
}
