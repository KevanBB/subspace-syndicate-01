
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import VideoUploadForm from '@/components/video/VideoUploadForm';
import { Card } from '@/components/ui/card';

const SubSpaceTVUpload = () => {
  const { user } = useAuth();

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
