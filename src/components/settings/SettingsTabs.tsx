
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import ProfileSettings from './ProfileSettings';
import AccountSettings from './AccountSettings';
import PrivacySettings from './PrivacySettings';

const SettingsTabs = () => {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid grid-cols-3 mb-6 bg-black/20 border border-white/10">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="privacy">Privacy</TabsTrigger>
      </TabsList>
      
      <TabsContent value="profile">
        <Card className="bg-black/20 border-white/10 backdrop-blur-md p-6">
          <ProfileSettings />
        </Card>
      </TabsContent>
      
      <TabsContent value="account">
        <Card className="bg-black/20 border-white/10 backdrop-blur-md p-6">
          <AccountSettings />
        </Card>
      </TabsContent>
      
      <TabsContent value="privacy">
        <Card className="bg-black/20 border-white/10 backdrop-blur-md p-6">
          <PrivacySettings />
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default SettingsTabs;
