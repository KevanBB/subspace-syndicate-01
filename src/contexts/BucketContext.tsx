import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BucketContextType {
  bucketExists: (bucketName: string) => boolean;
  initializeBuckets: () => Promise<void>;
}

const BucketContext = createContext<BucketContextType | undefined>(undefined);

export const BucketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bucketExistenceCache] = useState(new Map<string, boolean>());

  const bucketExists = (bucketName: string): boolean => {
    return bucketExistenceCache.get(bucketName) ?? false;
  };

  const checkBucketExists = async (bucketName: string): Promise<boolean> => {
    // Check cache first
    if (bucketExistenceCache.has(bucketName)) {
      return bucketExistenceCache.get(bucketName)!;
    }

    try {
      // Try a simple operation that would fail if bucket doesn't exist
      const { error } = await supabase.storage
        .from(bucketName)
        .list('', { limit: 1 });
      
      const exists = !error;
      bucketExistenceCache.set(bucketName, exists);
      return exists;
    } catch (error) {
      console.error(`Error checking bucket ${bucketName}:`, error);
      return false;
    }
  };

  const ensureBucketExists = async (bucketName: string): Promise<boolean> => {
    // Check cache first
    if (bucketExistenceCache.get(bucketName)) {
      return true;
    }

    try {
      // Try to create the bucket directly first
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 50 * 1024 * 1024, // 50MB limit
      });

      if (createError) {
        // If bucket already exists, we'll get a specific error
        if (createError.message.includes('already exists')) {
          bucketExistenceCache.set(bucketName, true);
          return true;
        }
        
        console.error(`Error creating bucket directly:`, createError);
        
        // If direct creation fails, try via Edge Function
        if (bucketName === 'post_media' || bucketName === 'album_media' || bucketName === 'media' || bucketName === 'videos') {
          const response = await fetch(`${process.env.VITE_SUPABASE_URL}/functions/v1/create-media-bucket`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ bucket_name: bucketName })
          });
          
          if (response.ok) {
            bucketExistenceCache.set(bucketName, true);
            return true;
          }
        }
      } else {
        bucketExistenceCache.set(bucketName, true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error handling bucket ${bucketName}:`, error);
      return false;
    }
  };

  const initializeBuckets = async () => {
    const requiredBuckets = ['videos', 'post_media', 'album_media', 'media'];
    for (const bucket of requiredBuckets) {
      await ensureBucketExists(bucket);
    }
  };

  useEffect(() => {
    initializeBuckets();
  }, []);

  return (
    <BucketContext.Provider value={{ bucketExists, initializeBuckets }}>
      {children}
    </BucketContext.Provider>
  );
};

export const useBuckets = () => {
  const context = useContext(BucketContext);
  if (context === undefined) {
    throw new Error('useBuckets must be used within a BucketProvider');
  }
  return context;
}; 