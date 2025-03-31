
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AboutTab from './profile/AboutTab';
import ActivityTab from './profile/ActivityTab';
import MediaTab from './profile/MediaTab';
import FeedTab from './profile/FeedTab';

interface ActivityTabProps {
  userId: string;
}

interface MediaTabProps {
  userId: string;
  isCurrentUser: boolean;
}

interface ProfileTabsProps {
  userId: string;
  isCurrentUser?: boolean;
}

const ProfileTabs = ({ userId, isCurrentUser = false }: ProfileTabsProps) => {
  return (
    <Tabs defaultValue="about" className="w-full">
      <TabsList className="grid grid-cols-4 bg-black/20 border border-white/10">
        <TabsTrigger value="about">About</TabsTrigger>
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="media">Media</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
      
      <TabsContent value="about" className="mt-8">
        <AboutTab />
      </TabsContent>
      
      <TabsContent value="posts" className="mt-8">
        <FeedTab />
      </TabsContent>
      
      <TabsContent value="media" className="mt-8">
        <MediaTab userId={userId} isCurrentUser={isCurrentUser} />
      </TabsContent>
      
      <TabsContent value="activity" className="mt-8">
        <ActivityTab userId={userId} />
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
