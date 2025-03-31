
import React, { useState } from 'react';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';
import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

// Mock featured content for initial implementation
const mockFeaturedContent = [
  {
    id: '1',
    title: 'Featured Creator Showcase',
    description: 'Discover top content from our most popular creators',
    imageUrl: 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c',
    link: '/community',
    linkText: 'Explore Creators'
  },
  {
    id: '2',
    title: 'Popular Videos This Week',
    description: 'Watch the most-viewed videos from the community',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
    link: '/subspacetv',
    linkText: 'Watch Now'
  },
  {
    id: '3',
    title: 'New Photo Albums',
    description: 'Browse the latest visual stories from our members',
    imageUrl: 'https://images.unsplash.com/photo-1617791160536-598cf32026fb',
    link: '/albums',
    linkText: 'View Albums'
  },
];

interface FeaturedContent {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  linkText: string;
}

const FeaturedCarousel = () => {
  const [featuredContent, setFeaturedContent] = useState<FeaturedContent[]>(mockFeaturedContent);

  // This could be replaced with an actual API call when ready
  // const { data, isLoading } = useQuery({
  //   queryKey: ['featuredContent'],
  //   queryFn: async () => {
  //     const { data, error } = await supabase
  //       .from('featured_content')
  //       .select('*')
  //       .order('priority', { ascending: true });
  //       
  //     if (error) throw error;
  //     return data as FeaturedContent[];
  //   }
  // });

  return (
    <div className="relative overflow-hidden rounded-lg">
      <Carousel className="w-full" opts={{ loop: true }}>
        <CarouselContent>
          {featuredContent.map((item) => (
            <CarouselItem key={item.id}>
              <div className="relative h-80 w-full overflow-hidden rounded-lg">
                {/* Gradient Overlay */}
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent z-10"
                />
                
                {/* Background Image */}
                <img 
                  src={item.imageUrl} 
                  alt={item.title}
                  className="w-full h-full object-cover object-center"
                />
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 z-20">
                  <h2 className="text-3xl font-bold text-white mb-2">{item.title}</h2>
                  <p className="text-white/80 mb-4 max-w-md">{item.description}</p>
                  <Button asChild variant="default" className="w-fit">
                    <Link to={item.link}>
                      {item.linkText}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 bg-black/50 hover:bg-black/70 border-none text-white" />
        <CarouselNext className="right-4 bg-black/50 hover:bg-black/70 border-none text-white" />
      </Carousel>
    </div>
  );
};

export default FeaturedCarousel;
