
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import VideoPlayer from '@/components/video/VideoPlayer';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, MessageSquare, Share, Flag, Eye, Clock, Calendar
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

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
  profiles?: {
    username?: string;
    avatar_url?: string;
    bdsm_role?: string;
    id?: string;
  };
};

const VideoPage = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  
  // Fetch video data
  const { data: video, isLoading, error } = useQuery({
    queryKey: ['video', videoId],
    queryFn: async () => {
      if (!videoId) throw new Error('Video ID is required');
      
      // Get video data
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            avatar_url,
            bdsm_role
          )
        `)
        .eq('id', videoId)
        .eq('status', 'ready')
        .single();
        
      if (error) throw error;
      if (!data) throw new Error('Video not found');
      
      // Check visibility permissions
      if (data.visibility === 'private' && data.user_id !== user?.id) {
        throw new Error('You do not have permission to view this video');
      }
      
      // Update views count (in production this would be a more robust system)
      try {
        await supabase
          .from('videos')
          .update({ views: data.views + 1 })
          .eq('id', videoId);
      } catch (err) {
        console.error('Failed to update view count:', err);
      }
      
      return data as VideoData;
    },
    enabled: !!videoId && !!user,
  });
  
  // Get related videos
  const { data: relatedVideos } = useQuery({
    queryKey: ['relatedVideos', video?.category, video?.id],
    queryFn: async () => {
      if (!video) return [];
      
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
        .eq('visibility', 'public')
        .eq('status', 'ready')
        .eq('category', video.category)
        .neq('id', video.id)
        .order('views', { ascending: false })
        .limit(4);
        
      if (error) throw error;
      
      return data as VideoData[];
    },
    enabled: !!video,
  });
  
  // Handle like button
  const handleLike = async () => {
    if (!user || !video) return;
    
    try {
      if (isLiked) {
        // In a real app, this would be a proper likes system with a database table
        setLikeCount(prev => prev - 1);
        setIsLiked(false);
        
        await supabase
          .from('videos')
          .update({ likes: video.likes - 1 })
          .eq('id', video.id);
      } else {
        setLikeCount(prev => prev + 1);
        setIsLiked(true);
        
        await supabase
          .from('videos')
          .update({ likes: video.likes + 1 })
          .eq('id', video.id);
      }
    } catch (error) {
      console.error('Error updating like:', error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Share video
  const handleShare = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      
      toast({
        title: "Link copied!",
        description: "Video link has been copied to clipboard.",
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Error",
        description: "Failed to copy link. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Report video
  const handleReport = () => {
    toast({
      title: "Report submitted",
      description: "Thank you for your report. We will review this video.",
    });
  };
  
  // Initialize like count
  useEffect(() => {
    if (video) {
      setLikeCount(video.likes);
    }
  }, [video]);
  
  // Format time
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="container max-w-6xl mx-auto py-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crimson mx-auto"></div>
        </div>
      </AuthenticatedLayout>
    );
  }
  
  if (error || !video) {
    return (
      <AuthenticatedLayout>
        <div className="container max-w-6xl mx-auto py-6">
          <Card className="bg-black/20 border-white/10 backdrop-blur-md">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-white/70 text-center mb-4">
                {error instanceof Error ? error.message : "Video not found"}
              </p>
              <Button 
                onClick={() => navigate('/subspacetv')}
                variant="outline"
              >
                Return to SubSpaceTV
              </Button>
            </CardContent>
          </Card>
        </div>
      </AuthenticatedLayout>
    );
  }
  
  const username = video.profiles?.username || 'User';
  const avatarUrl = video.profiles?.avatar_url;
  const bdsmRole = video.profiles?.bdsm_role || 'Exploring';
  const formattedDate = format(new Date(video.created_at), 'MMM d, yyyy');
  const tagsList = video.tags ? video.tags.split(',') : [];

  return (
    <AuthenticatedLayout>
      <div className="container max-w-6xl mx-auto py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Video player */}
            <div className="bg-black/30 rounded-lg overflow-hidden">
              <VideoPlayer 
                videoUrl={video.video_url}
                title={video.title}
              />
            </div>
            
            {/* Video details */}
            <Card className="bg-black/20 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl">{video.title}</CardTitle>
                <div className="flex flex-wrap items-center gap-4 text-white/60 text-sm mt-2">
                  <span className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" /> {video.views} views
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" /> {formatDuration(video.duration || 0)}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" /> {formattedDate}
                  </span>
                  <Badge variant="outline">
                    {video.category.charAt(0).toUpperCase() + video.category.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={isLiked ? "default" : "outline"} 
                    size="sm"
                    onClick={handleLike}
                    className={isLiked ? "bg-crimson hover:bg-crimson/90" : ""}
                  >
                    <Heart className={`mr-1 h-4 w-4 ${isLiked ? "fill-white" : ""}`} /> 
                    {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleShare}
                  >
                    <Share className="mr-1 h-4 w-4" /> Share
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleReport}
                  >
                    <Flag className="mr-1 h-4 w-4" /> Report
                  </Button>
                </div>
                
                {/* Creator info */}
                <div className="flex items-center pt-2 border-t border-white/10">
                  <Link to={`/profile/${username}`}>
                    <Avatar className="h-10 w-10 border-2 border-crimson/50 mr-3">
                      <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={username} />
                      <AvatarFallback className="bg-crimson text-white">
                        {username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  
                  <div>
                    <Link 
                      to={`/profile/${username}`}
                      className="font-medium text-white hover:text-crimson transition-colors"
                    >
                      {username}
                    </Link>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {bdsmRole}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Tags */}
                {tagsList.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {tagsList.map(tag => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="bg-black/30 hover:bg-black/50 cursor-pointer"
                        onClick={() => navigate(`/hashtag/${tag}`)}
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* Description */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-white/80 whitespace-pre-wrap">{video.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Related videos */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4">Related Videos</h3>
            
            {relatedVideos && relatedVideos.length > 0 ? (
              <div className="space-y-4">
                {relatedVideos.map((relatedVideo) => (
                  <Link 
                    key={relatedVideo.id} 
                    to={`/subspacetv/watch/${relatedVideo.id}`}
                  >
                    <Card className="bg-black/20 border-white/10 backdrop-blur-md overflow-hidden hover:border-crimson/50 transition-all">
                      <div className="grid grid-cols-5 gap-3">
                        <div className="col-span-2">
                          <div className="aspect-video bg-black/50 relative">
                            {relatedVideo.thumbnail_url ? (
                              <img
                                src={relatedVideo.thumbnail_url}
                                alt={relatedVideo.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-white/30 text-xs">No thumbnail</span>
                              </div>
                            )}
                            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded text-[10px]">
                              {formatDuration(relatedVideo.duration || 0)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-span-3 p-2">
                          <h4 className="font-medium text-white text-sm line-clamp-2">{relatedVideo.title}</h4>
                          <div className="flex items-center mt-1">
                            <span className="text-white/60 text-xs">
                              {relatedVideo.profiles?.username || 'User'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-white/50 text-xs">
                            <span>{relatedVideo.views} views</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(relatedVideo.created_at), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/subspacetv')}
                >
                  View More Videos
                </Button>
              </div>
            ) : (
              <Card className="bg-black/20 border-white/10 backdrop-blur-md">
                <CardContent className="py-6 text-center">
                  <p className="text-white/60 text-sm">No related videos found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default VideoPage;
