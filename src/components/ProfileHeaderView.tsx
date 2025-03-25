import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { CalendarDays, MapPin, Heart, Lock, ChevronDown, FileText, Search, Shield, AlertCircle } from 'lucide-react';
import MessageButton from '@/components/messages/MessageButton';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

type BadgeVariant = keyof typeof badgeVariants.variants.variant;

interface ProfileHeaderViewProps {
  profile: {
    id: string;
    username?: string;
    avatar_url?: string;
    banner_url?: string;
    bdsm_role?: string;
    orientation?: string;
    location?: string;
    birthday?: string;
    visibility?: string;
    bio?: string;
    looking_for?: string;
    kinks?: string;
    soft_limits?: string;
    hard_limits?: string;
  };
}

const ProfileHeaderView: React.FC<ProfileHeaderViewProps> = ({ profile }) => {
  const { user } = useAuth();
  const username = profile?.username || 'User';
  const orientation = profile?.orientation || '';
  const location = profile?.location || '';
  const avatarUrl = profile?.avatar_url || '';
  const bannerUrl = profile?.banner_url;
  const bdsmRole = profile?.bdsm_role || 'Exploring';
  const birthday = profile?.birthday;
  const visibility = profile?.visibility || 'Public';
  const profileId = profile?.id || '';
  const bio = profile?.bio || 'No bio information provided yet.';
  const lookingFor = profile?.looking_for || 'Not specified';
  const kinks = profile?.kinks || 'Not specified';
  const softLimits = profile?.soft_limits || 'Not specified';
  const hardLimits = profile?.hard_limits || 'Not specified';
  
  const getBadgeVariant = (role: string): BadgeVariant => {
    switch (role.toLowerCase()) {
      case 'dominant': return 'dominant';
      case 'submissive': return 'submissive';
      case 'switch': return 'switch';
      default: return 'exploring';
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Not specified';
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
      <div className="relative px-4 sm:px-6 -mt-12">
        <div className="flex flex-col sm:flex-row items-center">
          <Avatar className="w-24 h-24 border-4 border-background shadow-md">
            <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={username} />
            <AvatarFallback className="bg-crimson text-white text-xl">
              {username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {/* User info */}
          <div className="mt-4 sm:mt-0 sm:ml-6 w-full text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-bold text-white">{username}</h2>
              <div className={cn(badgeVariants({ variant: getBadgeVariant(bdsmRole) }), "text-xs")}>
                {bdsmRole}
              </div>
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

        {/* Detailed user info */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-black/20 p-4 rounded-lg border border-white/10">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-crimson" />
            <div>
              <p className="text-sm text-white/50">Birthday</p>
              <p className="text-white">{formatDate(birthday)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-crimson" />
            <div>
              <p className="text-sm text-white/50">Location</p>
              <p className="text-white">{location || 'Not specified'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 text-crimson" />
            <div>
              <p className="text-sm text-white/50">Orientation</p>
              <p className="text-white">{orientation || 'Not specified'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-crimson" />
            <div>
              <p className="text-sm text-white/50">Profile Visibility</p>
              <p className="text-white">{visibility}</p>
            </div>
          </div>
        </div>

        {/* About Information */}
        <Collapsible className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
            <div className="relative">
              <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-crimson shrink-0 mt-1" />
                  <p className="text-white/80 whitespace-pre-wrap line-clamp-3">{bio}</p>
                </div>
              </div>
            </div>
          </div>
          
          <CollapsibleTrigger className="w-full flex items-center justify-center gap-2 py-2 text-white/60 hover:text-white transition-colors">
            <span className="text-sm">Show more</span>
            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4">
            <div className="bg-black/20 p-4 rounded-lg border border-white/10">
              <div className="flex items-start gap-3">
                <Search className="h-5 w-5 text-crimson shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-medium mb-2">Looking For</h3>
                  <p className="text-white/80 whitespace-pre-wrap">{lookingFor}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-black/20 p-4 rounded-lg border border-white/10">
              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-crimson shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-medium mb-2">Kinks/Fetishes</h3>
                  <p className="text-white/80 whitespace-pre-wrap">{kinks}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-black/20 p-4 rounded-lg border border-white/10">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-crimson shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-medium mb-2">Soft Limits</h3>
                  <p className="text-white/80 whitespace-pre-wrap">{softLimits}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-black/20 p-4 rounded-lg border border-white/10">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-crimson shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-medium mb-2">Hard Limits</h3>
                  <p className="text-white/80 whitespace-pre-wrap">{hardLimits}</p>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default ProfileHeaderView;
