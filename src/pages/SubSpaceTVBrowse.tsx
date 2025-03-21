
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import VideosList from '@/components/video/VideosList';
import { Card } from '@/components/ui/card';

const SubSpaceTVBrowse = () => {
  const { user } = useAuth();

  return (
    <AuthenticatedLayout pageTitle="SubSpaceTV - Browse">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">Browse Videos</h1>
        <VideosList />
      </div>
    </AuthenticatedLayout>
  );
};

export default SubSpaceTVBrowse;
