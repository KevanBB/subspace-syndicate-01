
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PostsTab from '@/components/profile/PostsTab';
import MediaTab from '@/components/profile/MediaTab';
import AboutTab from '@/components/profile/AboutTab';
import ActivityTab from '@/components/profile/ActivityTab';

interface ProfileTabsViewProps {
  userId: string;
  isCurrentUser: boolean;
  username: string;
  featuredMedia?: any[];
}

/**
 * ProfileTabsView - A component that displays a tabbed interface for a user's profile
 */
const ProfileTabsView: React.FC<ProfileTabsViewProps> = ({ 
  userId, 
  isCurrentUser,
  username,
  featuredMedia = [] 
}) => {
  const [activeTab, setActiveTab] = useState('posts');
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="mt-6 w-full max-w-5xl mx-auto">
      <Tabs 
        defaultValue="posts" 
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="w-full grid grid-cols-4 bg-background/5 backdrop-blur-sm">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="mt-6">
          <PostsTab userId={userId} isCurrentUser={isCurrentUser} />
        </TabsContent>
        
        <TabsContent value="media" className="mt-6">
          <MediaTab userId={userId} isCurrentUser={isCurrentUser} />
        </TabsContent>
        
        <TabsContent value="about" className="mt-6">
          <AboutTab userId={userId} isCurrentUser={isCurrentUser} />
        </TabsContent>
        
        <TabsContent value="activity" className="mt-6">
          <ActivityTab userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileTabsView;
