import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMediaItem } from '@/hooks/useMediaItems';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Heart, 
  MessageSquare, 
  ArrowLeft, 
  MoreHorizontal,
  DownloadIcon, 
  BookmarkIcon, 
  Eye, 
  Calendar, 
  Users, 
  Send 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const MediaDetailPage: React.FC = () => {
  const { albumId, mediaId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: mediaItem, isLoading, error } = useMediaItem(mediaId || '');
  const [comment, setComment] = useState('');
  
  const getUsername = (profile: any) => {
    if (!profile) return 'Unknown user';
    if (typeof profile === 'string') return 'Unknown user';
    return profile.username || 'Unknown user';
  };
  
  const getAvatarUrl = (profile: any) => {
    if (!profile) return undefined;
    if (typeof profile === 'string') return undefined;
    return profile.avatar_url;
  };

  if (isLoading) {
    return (
      <div className="container py-6">
        <Card className="bg-black/20 border-white/10">
          <CardContent className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-crimson"></div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error || !mediaItem) {
    return (
      <div className="container py-6">
        <Card className="bg-black/20 border-white/10">
          <CardContent className="py-12 text-center">
            <h3 className="text-xl font-medium text-white mb-2">Media Not Found</h3>
            <p className="text-white/70 mb-6">This media doesn't exist or has been deleted</p>
            <Button onClick={() => navigate(`/albums/${albumId}`)}>Go Back to Album</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const isOwner = user?.id === mediaItem.user_id;
  const { data: isLiked } = mediaItem.useMediaLiked(mediaId || '');
  const { data: isBookmarked } = mediaItem.useMediaBookmarked(mediaId || '');
  const { data: comments } = mediaItem.useMediaComments(mediaId || '');
  
  const handleLike = () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to like this media',
        variant: 'destructive'
      });
      return;
    }
    
    mediaItem.likeMedia(mediaId || '');
  };
  
  const handleBookmark = () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to bookmark this media',
        variant: 'destructive'
      });
      return;
    }
    
    mediaItem.bookmarkMedia(mediaId || '');
  };
  
  const handleDownload = () => {
    window.open(mediaItem.url, '_blank');
  };
  
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) return;
    
    const success = await mediaItem.addComment(comment);
    if (success) {
      setComment('');
    }
  };
  
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    
    await mediaItem.deleteComment(commentId);
  };
  
  return (
    <div className="container py-6">
      <div className="mb-4">
        <Button variant="ghost" onClick={() => navigate(`/albums/${albumId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Album
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-black/20 border-white/10 overflow-hidden">
            <div className="relative">
              {mediaItem.file_type.startsWith('image/') ? (
                <img 
                  src={mediaItem.url} 
                  alt={mediaItem.description || 'Media preview'} 
                  className="w-full h-auto"
                />
              ) : mediaItem.file_type.startsWith('video/') ? (
                <video 
                  src={mediaItem.url}
                  controls
                  className="w-full h-auto"
                  poster={mediaItem.thumbnail_url || undefined}
                />
              ) : (
                <div className="w-full aspect-video flex items-center justify-center bg-black/40">
                  <p className="text-white/60">Unsupported media type</p>
                </div>
              )}
            </div>
            
            <CardFooter className="flex justify-between p-4">
              <div className="flex items-center gap-3">
                <Button 
                  variant={isLiked ? "default" : "outline"} 
                  size="sm"
                  onClick={handleLike}
                  className={isLiked ? "bg-crimson hover:bg-crimson/90" : ""}
                >
                  <Heart className={`mr-1 h-4 w-4 ${isLiked ? "fill-white" : ""}`} />
                  {mediaItem.likes}
                </Button>
                
                <Button 
                  variant={isBookmarked ? "default" : "outline"} 
                  size="sm"
                  onClick={handleBookmark}
                  className={isBookmarked ? "bg-crimson hover:bg-crimson/90" : ""}
                >
                  <BookmarkIcon className={`mr-1 h-4 w-4 ${isBookmarked ? "fill-white" : ""}`} />
                  Bookmark
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-white/70 px-3 py-1 rounded-md border border-white/10 bg-black/20">
                  <Eye className="h-4 w-4" />
                  <span>{mediaItem.views}</span>
                </div>
                
                {(isOwner || mediaItem.file_type.startsWith('image/')) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-black/90 border-white/10">
                      {mediaItem.file_type.startsWith('image/') && (
                        <DropdownMenuItem onClick={handleDownload} className="cursor-pointer">
                          <DownloadIcon className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <Card className="bg-black/20 border-white/10 mb-4">
            <CardHeader className="pb-2">
              <h3 className="text-lg font-medium text-white">About this media</h3>
            </CardHeader>
            <CardContent>
              {mediaItem.description && (
                <p className="text-white/70 mb-4">{mediaItem.description}</p>
              )}
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Album</span>
                  <Link to={`/albums/${mediaItem.album.id}`} className="text-crimson hover:underline">
                    {mediaItem.album.title}
                  </Link>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-white/60">Uploaded by</span>
                  <span className="text-white">
                    {getUsername(mediaItem.profile) ? 
                      <Link to={`/profile/${getUsername(mediaItem.profile)}`} className="text-white hover:text-crimson">
                        {getUsername(mediaItem.profile)}
                      </Link> : 
                      'Unknown user'
                    }
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-white/60">Uploaded</span>
                  <span className="text-white">
                    {formatDistanceToNow(new Date(mediaItem.created_at), { addSuffix: true })}
                  </span>
                </div>
                
                {mediaItem.file_type.startsWith('image/') && mediaItem.width && mediaItem.height && (
                  <div className="flex justify-between">
                    <span className="text-white/60">Dimensions</span>
                    <span className="text-white">{mediaItem.width} × {mediaItem.height}</span>
                  </div>
                )}
                
                {mediaItem.file_type.startsWith('video/') && mediaItem.duration && (
                  <div className="flex justify-between">
                    <span className="text-white/60">Duration</span>
                    <span className="text-white">
                      {Math.floor(mediaItem.duration / 60)}m {mediaItem.duration % 60}s
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-white/60">File type</span>
                  <span className="text-white">{mediaItem.file_type.split('/')[1].toUpperCase()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/20 border-white/10">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Comments</h3>
                <div className="flex items-center text-sm text-white/60">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  {comments?.length || 0}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {user ? (
                <form onSubmit={handleCommentSubmit} className="mb-4 flex gap-2">
                  <Input
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="bg-black/30 border-white/10 text-white"
                  />
                  <Button type="submit" size="sm" disabled={!comment.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <p className="text-white/60 text-sm mb-4">
                  <Link to="/login" className="text-crimson hover:underline">Login</Link> to add a comment
                </p>
              )}
              
              {comments && comments.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={getAvatarUrl(comment.profile)} />
                        <AvatarFallback className="bg-crimson/20 text-white">
                          {getUsername(comment.profile).substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Link to={`/profile/${getUsername(comment.profile)}`} className="font-medium text-white hover:text-crimson">
                              {getUsername(comment.profile)}
                            </Link>
                            <span className="text-xs text-white/50">
                              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          {(user?.id === comment.user_id) && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-white/50 hover:text-white"
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-white/80 text-sm mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/50 text-center py-4">No comments yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MediaDetailPage;
