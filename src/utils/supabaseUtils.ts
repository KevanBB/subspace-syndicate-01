
import { supabase } from '@/integrations/supabase/client';

/**
 * Helper function to make a bucket exist in Supabase storage
 * This is a replacement for the missing ensureBucketExists function
 */
export async function ensureBucketExists(bucketName: string, options: any = {}): Promise<boolean> {
  try {
    // First check if bucket exists
    const { data, error } = await supabase.storage.getBucket(bucketName);
    
    // If bucket doesn't exist, create it
    if (error && error.message?.includes("The resource was not found")) {
      const { error: createError } = await supabase.storage.createBucket(bucketName, options);
      if (createError) {
        console.error(`Error creating bucket ${bucketName}:`, createError);
        throw createError;
      }
    } else if (error) {
      console.error(`Error checking bucket ${bucketName}:`, error);
      throw error;
    }
    
    return true;
  } catch (err) {
    console.error(`Error ensuring bucket ${bucketName} exists:`, err);
    return false;
  }
}

/**
 * Helper function to safely convert possibly null values to their non-null equivalents
 */
export function ensureNonNull<T>(value: T | null | undefined, defaultValue: T): T {
  return value === null || value === undefined ? defaultValue : value;
}

/**
 * Helper function to safely convert Set to Array
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
