
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
}

interface UserSearchResultProps {
  profile: UserProfile;
  onSelect: (userId: string) => void;
}

const UserSearchResult: React.FC<UserSearchResultProps> = ({ profile, onSelect }) => {
  return (
    <div
      key={profile.id}
      className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-md cursor-pointer"
      onClick={() => onSelect(profile.id)}
    >
      <Avatar>
        <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.username} />
        <AvatarFallback className="bg-crimson text-white">
          {profile.username.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="font-medium">{profile.username}</span>
    </div>
  );
};

export default UserSearchResult;
