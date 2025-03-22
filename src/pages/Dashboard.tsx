import React from 'react';
import { Card } from '@/components/ui/card';
import PostForm from '@/components/profile/PostForm';
import PostsList from '@/components/profile/PostsList';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import VideoPlayer from '@/components/video/VideoPlayer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoIcon, MessageSquare, Flame, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  // Sample video URL for demonstration - in a real app this would come from user's most recent video
  // or a featured video from their profile
  const featuredVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  
  return (
    <AuthenticatedLayout pageTitle="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-7xl mx-auto">
        {/* Main content area */}
        <div className="md:col-span-8 space-y-6">
          {/* Content Tabs */}
          <Tabs defaultValue="feed" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Your Feed</h2>
              <TabsList className="bg-black/30 backdrop-blur-md">
                <TabsTrigger value="feed" className="data-[state=active]:bg-crimson">
                  <Flame className="mr-1 h-4 w-4" />
                  <span className="hidden sm:inline">Feed</span>
                </TabsTrigger>
                <TabsTrigger value="trending" className="data-[state=active]:bg-crimson">
                  <TrendingUp className="mr-1 h-4 w-4" />
                  <span className="hidden sm:inline">Trending</span>
                </TabsTrigger>
                <TabsTrigger value="videos" className="data-[state=active]:bg-crimson">
                  <VideoIcon className="mr-1 h-4 w-4" />
                  <span className="hidden sm:inline">Videos</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="feed" className="mt-0">
              {/* Post creation */}
              <Card className="bg-black/30 border-white/10 backdrop-blur-md p-6 mb-6 shadow-lg shadow-crimson/5">
                <PostForm />
              </Card>

              {/* Posts list */}
              <PostsList />
            </TabsContent>
            
            <TabsContent value="trending" className="mt-0">
              <Card className="bg-black/30 border-white/10 backdrop-blur-md p-6 shadow-lg shadow-crimson/5">
                <div className="text-center py-8 text-white/70">
                  <TrendingUp className="mx-auto h-12 w-12 mb-3 text-crimson/50" />
                  <h3 className="text-xl font-semibold mb-2">Trending Content</h3>
                  <p>Discover what's popular in the community right now.</p>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="videos" className="mt-0">
              <Card className="bg-black/30 border-white/10 backdrop-blur-md p-6 shadow-lg shadow-crimson/5">
                <div className="text-center py-8 text-white/70">
                  <VideoIcon className="mx-auto h-12 w-12 mb-3 text-crimson/50" />
                  <h3 className="text-xl font-semibold mb-2">Video Content</h3>
                  <p>Browse the latest videos from your connections.</p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar area */}
        <div className="md:col-span-4 space-y-6">
          {/* Featured Video Player */}
          <Card className="bg-black/30 border-white/10 backdrop-blur-md p-6 shadow-lg shadow-crimson/5">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <VideoIcon className="mr-2 h-5 w-5 text-crimson" />
              Featured Video
            </h2>
            <VideoPlayer 
              videoUrl={featuredVideoUrl} 
              title="Featured Content"
            />
          </Card>
          
          {/* Online Users */}
          <Card className="bg-black/30 border-white/10 backdrop-blur-md p-6 shadow-lg shadow-crimson/5">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-crimson" />
              Active Now
            </h2>
            <div className="space-y-3">
              <p className="text-white/70 text-sm">
                Connect with members who are currently online.
              </p>
              {/* Placeholder for online users list */}
              <div className="flex -space-x-2 overflow-hidden py-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-black bg-gradient-to-br from-purple-500 to-crimson flex items-center justify-center text-xs font-bold">
                    U{i}
                  </div>
                ))}
                <div className="h-10 w-10 rounded-full border-2 border-black bg-black/50 flex items-center justify-center text-xs font-bold text-white">
                  +12
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Dashboard;
