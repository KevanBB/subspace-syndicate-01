
/**
 * Type utilities to help with TypeScript compatibility
 */

/**
 * Safely converts a nullable string to a non-nullable string with fallback
 * @param value The potentially null/undefined string
 * @param fallback The fallback value if null/undefined (default empty string)
 */
export function ensureString(value: string | null | undefined, fallback: string = ""): string {
  return value === null || value === undefined ? fallback : value;
}

/**
 * Safely converts a nullable value to undefined (useful for props that accept undefined but not null)
 * @param value The potentially null value
 */
export function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

/**
 * Safely converts an array with potentially null items to an array without null items
 * @param array The array with potentially null items
 */
export function filterNulls<T>(array: (T | null)[]): T[] {
  return array.filter((item): item is T => item !== null);
}

/**
 * Safely converts a Set to an Array
 * @param set The Set to convert
 */
export function setToArray<T>(set: Set<T>): T[] {
  return Array.from(set);
}

/**
 * Type assertion helper
 */
export function assertType<T>(value: any): T {
  return value as T;
}
