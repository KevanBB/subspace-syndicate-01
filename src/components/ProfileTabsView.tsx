
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AboutTabView from './profile/AboutTabView';
import PostsTab from './profile/PostsTab';
import MediaTab from './profile/MediaTab';
import ActivityTab from './profile/ActivityTab';

export interface ProfileTabsViewProps {
  userId: string;
  profile: any;
  isCurrentUser?: boolean;
}

const ProfileTabsView = ({ userId, profile, isCurrentUser = false }: ProfileTabsViewProps) => {
  return (
    <Tabs defaultValue="about" className="w-full">
      <TabsList className="grid grid-cols-4 bg-black/20 border border-white/10">
        <TabsTrigger value="about">About</TabsTrigger>
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="media">Media</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
      
      <TabsContent value="about" className="mt-8">
        <AboutTabView profile={profile} />
      </TabsContent>
      
      <TabsContent value="posts" className="mt-8">
        <PostsTab 
          userId={userId} 
          isCurrentUser={isCurrentUser} 
        />
      </TabsContent>
      
      <TabsContent value="media" className="mt-8">
        <MediaTab 
          userId={userId} 
          isCurrentUser={isCurrentUser} 
        />
      </TabsContent>
      
      <TabsContent value="activity" className="mt-8">
        <ActivityTab 
          userId={userId} 
        />
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabsView;
