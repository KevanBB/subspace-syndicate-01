import React from 'react';
import ProfileHeaderView from './ProfileHeaderView';
import ProfileTabsView from './ProfileTabsView';

interface UserProfileViewProps {
  profileId: string;
  profile: any;
}

const UserProfileView = ({ profileId, profile }: UserProfileViewProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <ProfileHeaderView profile={profile} />
      <ProfileTabsView 
        userId={profileId} 
        profile={profile}
        isCurrentUser={false}
      />
    </div>
  );
};

export default UserProfileView;
