
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserPostsList from '@/components/profile/UserPostsList';
import ActivityTab from '@/components/profile/ActivityTab';
import MediaTab from '@/components/profile/MediaTab';
import { FileText } from 'lucide-react';

interface ProfileTabsViewProps {
  profileId: string;
  profile: any;
}

const ProfileTabsView: React.FC<ProfileTabsViewProps> = ({ profileId, profile }) => {
  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="grid grid-cols-3 bg-black/20 border border-white/10 backdrop-blur-md">
        <TabsTrigger value="posts" className="data-[state=active]:bg-crimson/20">
          <FileText className="mr-2 h-4 w-4" />
          Posts
        </TabsTrigger>
        <TabsTrigger value="activity" className="data-[state=active]:bg-crimson/20">Activity</TabsTrigger>
        <TabsTrigger value="media" className="data-[state=active]:bg-crimson/20">Media</TabsTrigger>
      </TabsList>
      
      <TabsContent value="posts" className="mt-6">
        <UserPostsList userId={profileId} />
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
