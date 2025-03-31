
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { UserRound, Compass, Calendar } from 'lucide-react';

// Mock data for initial implementation
const mockDiscoverItems = [
  {
    id: '1',
    type: 'creator',
    title: 'New Creators',
    subtitle: 'Recently joined members with great content',
    icon: UserRound,
    link: '/community',
    items: [
      { id: 'c1', name: 'RopeArtist', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde' },
      { id: 'c2', name: 'LeatherMaster', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36' },
      { id: 'c3', name: 'WhipsAndChains', avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79' }
    ]
  },
  {
    id: '2',
    type: 'random',
    title: 'Random Discovery',
    subtitle: 'Find something unexpected',
    icon: Compass,
    link: '/explore/random',
    content: {
      title: 'Suspension Techniques Workshop',
      image: 'https://images.unsplash.com/photo-1551818176-60579e574b91'
    }
  },
  {
    id: '3',
    type: 'event',
    title: 'Upcoming Events',
    subtitle: 'Don\'t miss out on these gatherings',
    icon: Calendar,
    link: '/events',
    event: {
      title: 'Annual Play Party',
      date: '2025-05-15',
      location: 'Secret Dungeon'
    }
  }
];

const DiscoverSection = () => {
  // This will be replaced with actual data fetching
  const { data: discoverItems, isLoading } = useQuery({
    queryKey: ['discover'],
    queryFn: async () => {
      // Mock API call
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockDiscoverItems);
        }, 500);
      });
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} variant="dark" className="overflow-hidden h-64 border-white/5">
            <Skeleton className="h-full bg-black/50" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {mockDiscoverItems.map((item) => (
        <Card 
          key={item.id}
          variant="dark"
          interactive={true}
          className="overflow-hidden h-64 border-white/5 relative"
        >
          <Link to={item.link} className="absolute inset-0 z-10">
            <span className="sr-only">{item.title}</span>
          </Link>
          
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/10 p-2 rounded-full">
                <item.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">{item.title}</h3>
                <p className="text-sm text-white/60">{item.subtitle}</p>
              </div>
            </div>
            
            <div className="flex-1">
              {item.type === 'creator' && (
                <div className="flex flex-wrap gap-2">
                  {item.items.map((creator) => (
                    <div key={creator.id} className="text-center">
                      <Avatar className="h-14 w-14 border border-white/10 mb-1">
                        <AvatarImage src={creator.avatar} alt={creator.name} />
                        <AvatarFallback>
                          {creator.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-xs text-white/80">{creator.name}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {item.type === 'random' && item.content && (
                <div className="h-full flex items-center justify-center">
                  <div className="relative h-32 w-full rounded overflow-hidden">
                    <img 
                      src={item.content.image} 
                      alt={item.content.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3">
                      <div className="text-sm text-white font-medium">{item.content.title}</div>
                    </div>
                  </div>
                </div>
              )}
              
              {item.type === 'event' && item.event && (
                <div className="bg-black/30 rounded-lg p-4">
                  <div className="text-lg font-bold text-white mb-2">{item.event.title}</div>
                  <div className="text-sm text-white/70 mb-1">
                    <span>Date: </span>
                    <span>{new Date(item.event.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="text-sm text-white/70">
                    <span>Location: </span>
                    <span>{item.event.location}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default DiscoverSection;
