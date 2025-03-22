
import React from 'react';
import { Card } from '@/components/ui/card';
import PostForm from '@/components/profile/PostForm';
import PostsList from '@/components/profile/PostsList';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import VideoPlayer from '@/components/video/VideoPlayer';

const Dashboard = () => {
  // Sample video URL for demonstration - in a real app this would come from user's most recent video
  // or a featured video from their profile
  const featuredVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  
  return (
    <AuthenticatedLayout pageTitle="Dashboard">
      <div className="max-w-3xl mx-auto">
        {/* Featured Video Player */}
        <Card className="bg-black/20 border-white/10 backdrop-blur-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Featured Video</h2>
          <VideoPlayer 
            videoUrl={featuredVideoUrl} 
            title="Featured Content"
          />
        </Card>
        
        {/* Post creation */}
        <Card className="bg-black/20 border-white/10 backdrop-blur-md p-6 mb-6">
          <PostForm />
        </Card>

        {/* Posts list */}
        <PostsList />
      </div>
    </AuthenticatedLayout>
  );
};

export default Dashboard;
