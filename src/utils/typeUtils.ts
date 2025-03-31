
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
 * Safely converts a nullable value to string or undefined (rejects null)
 * @param value The potentially null/undefined string
 */
export function nullToUndefinedString(value: string | null | undefined): string | undefined {
  return value === null ? undefined : value;
}

/**
 * Safely ensures a value is a string (not null or undefined)
 * @param value The potentially null/undefined string
 * @param fallback The fallback value if null/undefined (default empty string)
 */
export function ensureNonNullString(value: string | null | undefined, fallback: string = ""): string {
  return value === null || value === undefined ? fallback : value;
}

/**
 * Safely converts an array with potentially null items to an array without null items
 * @param array The array with potentially null items
 */
export function filterNulls<T>(array: (T | null)[]): T[] {
  return array.filter((item): item is T => item !== null);
}

/**
 * Safely converts an array with potentially null string items to an array of strings
 * @param array The array with potentially null string items
 */
export function filterNullStrings(array: (string | null)[]): string[] {
  return array.filter((item): item is string => item !== null);
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

/**
 * Safely parse a nullable date string to a Date object or fallback
 * @param dateStr The potentially null/undefined date string
 * @param fallback The fallback value if null/undefined/invalid (default now)
 */
export function parseDateSafe(dateStr: string | null | undefined, fallback: Date = new Date()): Date {
  if (!dateStr) return fallback;
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? fallback : date;
  } catch (e) {
    return fallback;
  }
}

/**
 * Helper to convert arrays of potentially null items to arrays of non-null items
 * Used for database queries that might return null values
 */
export function sanitizeArray<T, K extends keyof T>(
  array: T[] | null | undefined,
  nullableKeys: K[]
): T[] {
  if (!array) return [];
  
  return array.map(item => {
    if (!item) return item;
    
    const newItem = { ...item };
    for (const key of nullableKeys) {
      if (newItem[key] === null) {
        // TypeScript won't let us assign undefined directly due to the type constraint,
        // so we use this assertion
        (newItem[key] as any) = undefined;
      }
    }
    return newItem;
  });
}

/**
 * Helper to convert Set to array for compatibility with older TypeScript targets
 */
export function safeSetToArray<T>(set: Set<T>): T[] {
  const result: T[] = [];
  set.forEach(item => result.push(item));
  return result;
}
