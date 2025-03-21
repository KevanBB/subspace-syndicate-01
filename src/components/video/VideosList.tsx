
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import VideoCard from './VideoCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, Filter } from 'lucide-react';

type VideoData = {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  views: number;
  likes: number;
  category: string;
  tags: string;
  duration: number;
  status: string;
  visibility: string;
  username?: string;
  avatar_url?: string;
  bdsm_role?: string;
};

type SortOption = 'newest' | 'oldest' | 'popular' | 'trending';
type FilterOption = 'all' | 'tutorial' | 'scene' | 'event' | 'other';

const VideosList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [categoryFilter, setCategoryFilter] = useState<FilterOption>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch videos
  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['videos', sortBy, categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from('videos')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url,
            bdsm_role
          )
        `)
        .eq('visibility', 'public')
        .eq('status', 'ready');

      // Apply category filter if not 'all'
      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'popular':
          query = query.order('views', { ascending: false });
          break;
        case 'trending':
          // In a real app, this would use a more complex algorithm
          query = query.order('likes', { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) throw error;

      return data as VideoData[];
    },
  });

  // Filter videos by search query
  const filteredVideos = videos?.filter(video => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      video.title.toLowerCase().includes(query) ||
      video.description.toLowerCase().includes(query) ||
      video.tags.toLowerCase().includes(query) ||
      (video.profiles?.username && video.profiles.username.toLowerCase().includes(query))
    );
  });

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  if (isLoading) {
    return (
      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-crimson"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardContent className="flex justify-center py-8 text-white/70">
          <p>Error loading videos. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  if (!filteredVideos || filteredVideos.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-white/50" />
            <Input
              type="search"
              placeholder="Search videos..."
              className="pl-10 bg-black/30 border-white/20 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            className="ml-2" 
            onClick={toggleFilter}
          >
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
        </div>

        {isFilterOpen && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-black/20 rounded-lg border border-white/10">
            <div>
              <Label htmlFor="sort-by">Sort By</Label>
              <Select
                value={sortBy}
                onValueChange={(value: SortOption) => setSortBy(value)}
              >
                <SelectTrigger id="sort-by" className="bg-black/30 border-white/20 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="popular">Most Viewed</SelectItem>
                  <SelectItem value="trending">Trending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={categoryFilter}
                onValueChange={(value: FilterOption) => setCategoryFilter(value)}
              >
                <SelectTrigger id="category" className="bg-black/30 border-white/20 text-white">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="tutorial">Tutorials</SelectItem>
                  <SelectItem value="scene">Scenes</SelectItem>
                  <SelectItem value="event">Events</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        <Card className="bg-black/20 border-white/10 backdrop-blur-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-white/70 text-center">No videos found. Be the first to upload content!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-white/50" />
          <Input
            type="search"
            placeholder="Search videos..."
            className="pl-10 bg-black/30 border-white/20 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          className="ml-2" 
          onClick={toggleFilter}
        >
          <Filter className="h-4 w-4 mr-2" /> Filter
        </Button>
      </div>

      {isFilterOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-black/20 rounded-lg border border-white/10">
          <div>
            <Label htmlFor="sort-by">Sort By</Label>
            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => setSortBy(value)}
            >
              <SelectTrigger id="sort-by" className="bg-black/30 border-white/20 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="popular">Most Viewed</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={categoryFilter}
              onValueChange={(value: FilterOption) => setCategoryFilter(value)}
            >
              <SelectTrigger id="category" className="bg-black/30 border-white/20 text-white">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="tutorial">Tutorials</SelectItem>
                <SelectItem value="scene">Scenes</SelectItem>
                <SelectItem value="event">Events</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <VideoCard 
            key={video.id} 
            video={video} 
          />
        ))}
      </div>
    </div>
  );
};

export default VideosList;
