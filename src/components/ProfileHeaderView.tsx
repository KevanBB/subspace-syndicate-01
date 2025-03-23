import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import MessageButton from '@/components/messages/MessageButton';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileHeaderViewProps {
  profile: any;
}

const ProfileHeaderView: React.FC<ProfileHeaderViewProps> = ({ profile }) => {
  const { user } = useAuth();
  const username = profile?.username || 'User';
  const orientation = profile?.orientation || '';
  const location = profile?.location || '';
  const avatarUrl = profile?.avatar_url || '';
  const bannerUrl = profile?.banner_url;
  const bdsmRole = profile?.bdsm_role || 'Exploring';
  const profileId = profile?.id || '';
  
  const getBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'dominant': return 'dominant';
      case 'submissive': return 'submissive';
      case 'switch': return 'switch';
      default: return 'exploring';
    }
  };
  
  const isCurrentUser = user?.id === profileId;
  
  return (
    <div className="relative">
      {/* Banner Image */}
      <div className="relative w-full h-48 md:h-64 bg-gradient-to-r from-gray-800 to-abyss rounded-b-lg overflow-hidden">
        {bannerUrl ? (
          <div className="absolute inset-0 bg-cover bg-center" 
               style={{ backgroundImage: `url('${bannerUrl}')` }}>
          </div>
        ) : (
          <div className="absolute inset-0 bg-cover bg-center" 
               style={{ backgroundImage: "url('/placeholder.svg')" }}>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>
      
      {/* Avatar and basic info */}
      <div className="relative px-4 sm:px-6 -mt-12 flex flex-col items-center sm:items-start">
        <div className="relative">
          <Avatar className="w-24 h-24 border-4 border-background shadow-md">
            <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={username} />
            <AvatarFallback className="bg-crimson text-white text-xl">
              {username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        
        {/* User info */}
        <div className="mt-4 w-full text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h2 className="text-2xl font-bold text-white">{username}</h2>
            <Badge variant={getBadgeVariant(bdsmRole)} className="text-xs">
              {bdsmRole}
            </Badge>
          </div>
          <p className="text-gray-400 mt-1">
            {orientation || 'No orientation set'} • {location || 'No location set'}
          </p>
          
          {!isCurrentUser && (
            <div className="mt-4">
              <MessageButton recipientId={profileId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeaderView;
