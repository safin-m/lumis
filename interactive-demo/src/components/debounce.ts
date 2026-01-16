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
