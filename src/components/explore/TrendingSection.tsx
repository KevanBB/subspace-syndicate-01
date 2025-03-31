
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Heart, MessageSquare } from 'lucide-react';

interface TrendingSectionProps {
  contentType: 'all' | 'videos' | 'albums' | 'community';
}

interface TrendingItem {
  id: string;
  title: string;
  thumbnail: string;
  type: 'video' | 'album' | 'post';
  views: number;
  likes: number;
  comments?: number;
  link: string;
  creator?: {
    name: string;
    avatar?: string;
  };
}

// Mock data for initial implementation
const mockTrendingItems: TrendingItem[] = [
  {
    id: '1',
    title: 'Introduction to Rope Techniques',
    thumbnail: 'https://images.unsplash.com/photo-1517697471339-4aa32003c11a',
    type: 'video',
    views: 1254,
    likes: 342,
    comments: 28,
    link: '/subspacetv/watch/123',
    creator: {
      name: 'RopeMaster',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36'
    }
  },
  {
    id: '2',
    title: 'Event Photoshoot Collection',
    thumbnail: 'https://images.unsplash.com/photo-1540575861501-65e5ef1c9f17',
    type: 'album',
    views: 876,
    likes: 213,
    link: '/albums/456',
    creator: {
      name: 'EventCapture',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330'
    }
  },
  {
    id: '3',
    title: 'Community Discussion on Consent',
    thumbnail: 'https://images.unsplash.com/photo-1573511860302-28c524319d2a',
    type: 'post',
    views: 2183,
    likes: 458,
    comments: 89,
    link: '/feed/789',
    creator: {
      name: 'ConsentAdvocate',
      avatar: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e'
    }
  },
  {
    id: '4',
    title: 'Leather Workshop Showcase',
    thumbnail: 'https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd',
    type: 'video',
    views: 945,
    likes: 184,
    comments: 14,
    link: '/subspacetv/watch/234',
    creator: {
      name: 'LeatherArtisan',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'
    }
  }
];

const TrendingSection: React.FC<TrendingSectionProps> = ({ contentType }) => {
  // This will be replaced with actual data fetching in the future
  const { data: trendingItems, isLoading } = useQuery({
    queryKey: ['trending', contentType],
    queryFn: async () => {
      // Mock API call - replace with actual implementation later
      return new Promise<TrendingItem[]>((resolve) => {
        setTimeout(() => {
          if (contentType === 'all') {
            resolve(mockTrendingItems);
          } else {
            resolve(mockTrendingItems.filter(item => 
              (contentType === 'videos' && item.type === 'video') ||
              (contentType === 'albums' && item.type === 'album') ||
              (contentType === 'community' && item.type === 'post')
            ));
          }
        }, 500);
      });
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} variant="dark" className="overflow-hidden border-white/5">
            <Skeleton className="aspect-video bg-black/50" />
            <div className="p-3">
              <Skeleton className="h-5 w-3/4 bg-black/50 mb-2" />
              <Skeleton className="h-4 w-1/2 bg-black/50" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!trendingItems || trendingItems.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-white/60">No trending content available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {trendingItems.map((item) => (
        <Link to={item.link} key={item.id}>
          <Card 
            variant="dark" 
            interactive={true}
            className="overflow-hidden border-white/5 h-full"
          >
            <div className="relative aspect-video">
              <img 
                src={item.thumbnail} 
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                {item.type === 'video' && 'Video'}
                {item.type === 'album' && 'Album'}
                {item.type === 'post' && 'Post'}
              </div>
            </div>
            <CardContent className="p-3">
              <h3 className="font-medium text-white mb-2 line-clamp-1">{item.title}</h3>
              
              {item.creator && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-5 w-5 rounded-full overflow-hidden">
                    <img 
                      src={item.creator.avatar} 
                      alt={item.creator.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs text-white/70">{item.creator.name}</span>
                </div>
              )}
              
              <div className="flex items-center gap-3 text-xs text-white/50">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{item.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  <span>{item.likes}</span>
                </div>
                {item.comments !== undefined && (
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>{item.comments}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default TrendingSection;
