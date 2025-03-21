
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import VideoPlayer from '@/components/video/VideoPlayer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, Clock, Heart, Tag, User, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { useVideoStatus } from '@/hooks/useVideoStatus';

type VideoData = {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string | null;
  user_id: string;
  created_at: string;
  views: number;
  likes: number;
  category: string;
  tags: string;
  duration: number;
  status: string;
  visibility: string;
  profiles?: {
    username?: string;
    avatar_url?: string;
    bdsm_role?: string;
  };
};

const VideoWatchPage = () => {
  const { id } = useParams<{ id: string }>();
  const [incrementedView, setIncrementedView] = useState(false);
  const { status, metadata } = useVideoStatus({ videoId: id || '' });

  // Fetch the video and creator details
  const { data: video, isLoading, error } = useQuery({
    queryKey: ['video', id],
    queryFn: async () => {
      if (!id) throw new Error('No video ID provided');

      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url,
            bdsm_role
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as VideoData;
    },
    enabled: !!id,
  });

  // Increment view count
  useEffect(() => {
    if (video && !incrementedView) {
      const incrementViews = async () => {
        await supabase
          .from('videos')
          .update({ views: video.views + 1 })
          .eq('id', video.id);
        
        setIncrementedView(true);
      };
      
      incrementViews();
    }
  }, [video, incrementedView]);

  // Format functions
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Loading and error states
  if (isLoading) {
    return (
      <AuthenticatedLayout pageTitle="Loading...">
        <div className="max-w-5xl mx-auto p-4">
          <div className="animate-pulse space-y-4">
            <div className="w-full aspect-video bg-black/30 rounded-lg"></div>
            <div className="h-8 bg-black/30 rounded w-3/4"></div>
            <div className="h-4 bg-black/30 rounded w-1/2"></div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error || !video) {
    return (
      <AuthenticatedLayout pageTitle="Error">
        <div className="max-w-5xl mx-auto p-4">
          <Card className="bg-black/20 border-white/10 backdrop-blur-md">
            <CardContent className="pt-6">
              <p className="text-white/70">Video not found or not available.</p>
            </CardContent>
          </Card>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout pageTitle={`${video.title} - SubSpaceTV`}>
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        {/* Video Player */}
        <div className="w-full">
          <VideoPlayer videoUrl={video.video_url} title={video.title} />
        </div>
        
        {/* Video Information */}
        <Card className="bg-black/20 border-white/10 backdrop-blur-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-bold text-white">{video.title}</CardTitle>
            <div className="flex items-center justify-between text-sm text-white/60 mt-2">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" /> {video.views} views
                </span>
                <span className="flex items-center">
                  <Heart className="h-4 w-4 mr-1" /> {video.likes} likes
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" /> {formatDuration(video.duration || 0)}
                </span>
              </div>
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" /> {formatDate(video.created_at)}
              </span>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4 pt-0">
            <div className="flex items-center gap-3 py-4 border-t border-b border-white/10">
              <Avatar className="h-12 w-12 border border-crimson/30">
                <AvatarImage src={video.profiles?.avatar_url || "/placeholder.svg"} alt={video.profiles?.username || "User"} />
                <AvatarFallback className="bg-crimson/20 text-white">
                  {(video.profiles?.username || "User").substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-white">{video.profiles?.username || "User"}</h3>
                <p className="text-sm text-white/60">{video.profiles?.bdsm_role || "Exploring"}</p>
              </div>
            </div>
            
            {video.description && (
              <div>
                <h3 className="font-medium text-white mb-2">Description</h3>
                <p className="text-white/80 whitespace-pre-line">{video.description}</p>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                {video.category.charAt(0).toUpperCase() + video.category.slice(1)}
              </Badge>
              
              {video.tags && video.tags.split(',').map((tag, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {tag.trim()}
                </Badge>
              ))}
            </div>
            
            {/* Video Technical Details */}
            {(metadata && Object.keys(metadata).length > 0) && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <h3 className="font-medium text-white mb-2">Video Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-white/70">
                  {metadata.width && metadata.height && (
                    <div>Resolution: {metadata.width}x{metadata.height}</div>
                  )}
                  {metadata.format && (
                    <div>Format: {metadata.format}</div>
                  )}
                  {metadata.bitrate && (
                    <div>Bitrate: {Math.round(metadata.bitrate / 1000)} kbps</div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
};

export default VideoWatchPage;
