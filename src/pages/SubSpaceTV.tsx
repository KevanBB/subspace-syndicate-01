
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import VideoUploadForm from '@/components/video/VideoUploadForm';
import VideosList from '@/components/video/VideosList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

const SubSpaceTV = () => {
  const { user } = useAuth();

  return (
    <AuthenticatedLayout pageTitle="SubSpaceTV">
      <div className="max-w-6xl mx-auto">
        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="browse">Browse Videos</TabsTrigger>
            <TabsTrigger value="upload">Upload Video</TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse">
            <VideosList />
          </TabsContent>
          
          <TabsContent value="upload">
            <Card className="bg-black/20 border-white/10 backdrop-blur-md p-6 mb-6">
              <VideoUploadForm />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
};

export default SubSpaceTV;
