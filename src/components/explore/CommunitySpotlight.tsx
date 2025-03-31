
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import MemberCard from '@/components/community/MemberCard';

// Mock data for initial implementation
const mockMembers = [
  {
    id: '1',
    username: 'DominantArtist',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
    role: 'Dominant',
    isOnline: true,
    location: 'New York',
    last_active: new Date().toISOString()
  },
  {
    id: '2',
    username: 'RopeGirl',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    role: 'Switch',
    isOnline: true,
    location: 'Los Angeles',
    last_active: new Date().toISOString()
  },
  {
    id: '3',
    username: 'LeatherMaster',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36',
    role: 'Dominant',
    isOnline: false,
    location: 'Chicago',
    last_active: new Date(Date.now() - 86400000).toISOString() // 1 day ago
  },
  {
    id: '4',
    username: 'KinkEducator',
    avatar: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e',
    role: 'Switch',
    isOnline: false,
    location: 'Seattle',
    last_active: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
  }
];

const CommunitySpotlight = () => {
  // This will be replaced with actual data fetching
  const { data: spotlightMembers, isLoading } = useQuery({
    queryKey: ['spotlightMembers'],
    queryFn: async () => {
      // Mock API call
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockMembers);
        }, 500);
      });
      
      // Actual implementation would be something like:
      // const { data, error } = await supabase
      //   .from('profiles')
      //   .select('id, username, avatar_url, bdsm_role, location, last_active')
      //   .order('created_at', { ascending: false })
      //   .limit(4);
      // 
      // if (error) throw error;
      // return data;
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 bg-black/50 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {spotlightMembers?.map((member) => (
        <MemberCard key={member.id} member={member} />
      ))}
    </div>
  );
};

export default CommunitySpotlight;
