
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import VideoUploadForm from '@/components/video/VideoUploadForm';
import { Card } from '@/components/ui/card';
import { createPortal } from 'react-dom';

// Create a storage bucket for videos if it doesn't exist
// This would normally be done in a SQL migration
import { supabase } from '@/integrations/supabase/client';

// Check if the videos storage bucket exists, create it if it doesn't
const ensureStorageBucket = async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const videosBucketExists = buckets?.some(bucket => bucket.name === 'videos');
    
    if (!videosBucketExists) {
      console.log("Videos bucket doesn't exist, attempting to create it");
      const { error } = await supabase.storage.createBucket('videos', {
        public: true,
        fileSizeLimit: 524288000, // 500MB
      });
      
      if (error) {
        console.error("Error creating videos bucket:", error);
      } else {
        console.log("Videos bucket created successfully");
      }
    }
  } catch (error) {
    console.error("Error checking/creating videos bucket:", error);
  }
};

const SubSpaceTVUpload = () => {
  const { user } = useAuth();
  
  React.useEffect(() => {
    // Ensure the storage bucket exists when the component mounts
    ensureStorageBucket();
  }, []);

  return (
    <AuthenticatedLayout pageTitle="SubSpaceTV - Upload">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">Upload Video</h1>
        <Card className="bg-black/20 border-white/10 backdrop-blur-md p-6 mb-6">
          <VideoUploadForm />
        </Card>
      </div>
    </AuthenticatedLayout>
  );
};

export default SubSpaceTVUpload;
