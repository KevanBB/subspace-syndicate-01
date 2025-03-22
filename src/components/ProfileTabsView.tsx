
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AboutTabView from '@/components/profile/AboutTabView';
import ActivityTab from '@/components/profile/ActivityTab';
import MediaTab from '@/components/profile/MediaTab';

interface ProfileTabsViewProps {
  profileId: string;
  profile: any;
}

const ProfileTabsView: React.FC<ProfileTabsViewProps> = ({ profileId, profile }) => {
  return (
    <Tabs defaultValue="about" className="w-full">
      <TabsList className="grid grid-cols-3 bg-black/20 border border-white/10 backdrop-blur-md">
        <TabsTrigger value="about" className="data-[state=active]:bg-crimson/20">About</TabsTrigger>
        <TabsTrigger value="activity" className="data-[state=active]:bg-crimson/20">Activity</TabsTrigger>
        <TabsTrigger value="media" className="data-[state=active]:bg-crimson/20">Media</TabsTrigger>
      </TabsList>
      
      <TabsContent value="about" className="mt-6">
        <AboutTabView profile={profile} />
      </TabsContent>
      
      <TabsContent value="activity" className="mt-6">
        <ActivityTab userId={profileId} />
      </TabsContent>
      
      <TabsContent value="media" className="mt-6">
        <MediaTab />
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabsView;
