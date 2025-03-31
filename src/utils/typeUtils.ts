
/**
 * Utility functions to handle TypeScript type conversions and other common operations
 */

/**
 * Converts a possibly null string to a non-null string with a default value
 * @param value The string that might be null
 * @param defaultValue The default value to use if null
 */
export function ensureString(value: string | null | undefined, defaultValue: string = ''): string {
  return value ?? defaultValue;
}

/**
 * Converts a possibly null number to a non-null number with a default value
 * @param value The number that might be null
 * @param defaultValue The default value to use if null
 */
export function ensureNumber(value: number | null | undefined, defaultValue: number = 0): number {
  return value ?? defaultValue;
}

/**
 * Converts a possibly null boolean to a non-null boolean with a default value
 * @param value The boolean that might be null
 * @param defaultValue The default value to use if null
 */
export function ensureBoolean(value: boolean | null | undefined, defaultValue: boolean = false): boolean {
  return value ?? defaultValue;
}

/**
 * Safely iterate over a Set without downlevelIteration issues
 * @param set The set to convert to array
 */
export function setToArray<T>(set: Set<T>): T[] {
  return Array.from(set);
}

/**
 * Helper function to make a bucket exist in Supabase storage
 * This is a replacement for the missing ensureBucketExists function
 */
export async function ensureBucketExists(supabase: any, bucketName: string, options: any = {}): Promise<void> {
  try {
    // First check if bucket exists
    const { data, error } = await supabase.storage.getBucket(bucketName);
    
    // If bucket doesn't exist, create it
    if (error && error.statusCode === 404) {
      const { error: createError } = await supabase.storage.createBucket(bucketName, options);
      if (createError) {
        console.error(`Error creating bucket ${bucketName}:`, createError);
        throw createError;
      }
    } else if (error) {
      console.error(`Error checking bucket ${bucketName}:`, error);
      throw error;
    }
  } catch (err) {
    console.error(`Error ensuring bucket ${bucketName} exists:`, err);
    throw err;
  }
}

/**
 * Helper for type casting in places where TypeScript is too strict
 * Use this with caution as it bypasses type checking
 */
export function assertType<T>(value: any): T {
  return value as T;
}

/**
 * Create a simple DataTable component for apps that need tanstack/react-table
 * but don't have it installed
 */
export interface GenericColumn<T> {
  accessorKey?: keyof T | string;
  header: React.ReactNode;
  cell?: (props: { row: { original: T } }) => React.ReactNode;
  id?: string;
}

