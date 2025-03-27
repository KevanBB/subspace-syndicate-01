
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMediaItem, useMediaItems } from '@/hooks/useMediaItems';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import MediaCommentsSection from '@/components/albums/MediaCommentsSection';
import { 
  Heart, 
  MoreVertical, 
  Trash2, 
  ChevronLeft, 
  Eye, 
  Download, 
  Calendar, 
  Bookmark, 
  Edit,
  Info,
  X,
  Check
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

const MediaDetailPage = () => {
  const { albumId, mediaId } = useParams<{ albumId: string; mediaId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement | null>(null);
  
  const { data: mediaData, isLoading, error } = useMediaItem(mediaId!);
  const { deleteMedia, updateMedia } = useMediaItems(albumId);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  
  // Get media item details
  const media = mediaData;
  
  // Set up liked and bookmarked status
  const { data: isLiked } = media?.useMediaLiked(mediaId!) || { data: false };
  const { data: isBookmarked } = media?.useMediaBookmarked(mediaId!) || { data: false };
  const { data: comments, isLoading: isLoadingComments } = media?.useMediaComments(mediaId!) || { data: [], isLoading: false };
  
  // Set description state when media data loads
  useEffect(() => {
    if (media?.description) {
      setDescription(media.description);
    }
  }, [media]);
  
  // Check if current user is the media owner
  const isOwner = user?.id === media?.user_id;
  
  // Handle actions
  const handleLikeClick = async () => {
    if (!mediaId || !mediaData) return;
    mediaData.likeMedia?.(mediaId);
  };
  
  const handleBookmarkClick = async () => {
    if (!mediaId || !mediaData) return;
    mediaData.bookmarkMedia?.(mediaId);
  };
  
  const handleDeleteMedia = async () => {
    if (!mediaId) return;
    
    const success = await deleteMedia(mediaId);
    if (success) {
      setIsDeleteDialogOpen(false);
      navigate(`/albums/${albumId}`);
    }
  };
  
  const handleUpdateDescription = async () => {
    if (!mediaId) return;
    
    await updateMedia(mediaId, { description });
    setIsEditingDescription(false);
  };
  
  const handleAddComment = async (content: string) => {
    if (!mediaId || !mediaData?.addComment) return null;
    return mediaData.addComment(content);
  };
  
  const handleDeleteComment = async (commentId: string) => {
    if (!mediaId || !mediaData?.deleteComment) return false;
    return mediaData.deleteComment(commentId);
  };
  
  // Disable right-click (context menu) on media to prevent easy downloading
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="container py-8 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crimson"></div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }
  
  if (error || !media) {
    return (
      <AuthenticatedLayout>
        <div className="container py-8 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-2">Media Not Found</h2>
            <p className="text-white/70 mb-6">The media item you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button asChild>
              <Link to={`/albums/${albumId}`}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Album
              </Link>
            </Button>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }
  
  return (
    <AuthenticatedLayout>
      <div className="container py-8 max-w-5xl mx-auto px-4 sm:px-6">
        <Button 
          variant="ghost" 
          className="mb-6" 
          asChild
        >
          <Link to={`/albums/${albumId}`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Album
          </Link>
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Media Display */}
          <div className="lg:col-span-2">
            <div className="bg-black/40 rounded-md overflow-hidden">
              {media.file_type.startsWith('image/') ? (
                <img 
                  ref={mediaRef as React.RefObject<HTMLImageElement>}
                  src={media.url} 
                  alt={media.description || 'Image'} 
                  className="w-full h-auto object-contain max-h-[70vh]"
                  onContextMenu={handleContextMenu}
                  style={{ pointerEvents: 'none' }}
                />
              ) : media.file_type.startsWith('video/') ? (
                <video 
                  ref={mediaRef as React.RefObject<HTMLVideoElement>}
                  src={media.url} 
                  controls 
                  className="w-full h-auto max-h-[70vh]"
                  onContextMenu={handleContextMenu}
                  controlsList="nodownload"
                  disablePictureInPicture
                />
              ) : (
                <div className="w-full h-[50vh] flex items-center justify-center">
                  <p className="text-white/60">Unsupported media type</p>
                </div>
              )}
            </div>
            
            {/* Media Description */}
            <div className="mt-4">
              {isEditingDescription ? (
                <div className="space-y-2">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description..."
                    className="min-h-[80px] bg-black/30 border-white/20"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setDescription(media.description || '');
                        setIsEditingDescription(false);
                      }}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handleUpdateDescription}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {media.description ? (
                    <p className="text-white/80 whitespace-pre-wrap">
                      {media.description}
                    </p>
                  ) : (
                    <p className="text-white/50 italic">No description</p>
                  )}
                  {isOwner && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-0 right-0 h-8 w-8"
                      onClick={() => setIsEditingDescription(true)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            {/* Comments Section */}
            <div className="mt-8">
              <MediaCommentsSection 
                comments={comments || []}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
                isLoading={isLoadingComments}
              />
            </div>
          </div>
          
          {/* Sidebar with Media Info */}
          <div>
            <div className="bg-black/20 border border-white/10 rounded-md p-4 space-y-6">
              {/* Actions */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-4">
                  <Button 
                    variant={isLiked ? "default" : "outline"} 
                    size="sm"
                    onClick={handleLikeClick}
                    className={isLiked ? "bg-crimson hover:bg-crimson/90" : ""}
                  >
                    <Heart className={`mr-2 h-4 w-4 ${isLiked ? "fill-white" : ""}`} />
                    {isLiked ? "Liked" : "Like"}
                  </Button>
                  
                  <Button 
                    variant={isBookmarked ? "default" : "outline"} 
                    size="sm"
                    onClick={handleBookmarkClick}
                  >
                    <Bookmark className={`mr-2 h-4 w-4 ${isBookmarked ? "fill-white" : ""}`} />
                    {isBookmarked ? "Saved" : "Save"}
                  </Button>
                </div>
                
                <div className="flex">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsInfoDialogOpen(true)}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                  
                  {isOwner && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-red-500"
                          onClick={() => setIsDeleteDialogOpen(true)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Media
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-2 bg-black/20 rounded-md">
                  <div className="flex justify-center mb-1">
                    <Eye className="h-5 w-5 text-white/60" />
                  </div>
                  <div className="font-medium">{media.views}</div>
                  <div className="text-xs text-white/60">Views</div>
                </div>
                
                <div className="text-center p-2 bg-black/20 rounded-md">
                  <div className="flex justify-center mb-1">
                    <Heart className="h-5 w-5 text-white/60" />
                  </div>
                  <div className="font-medium">{media.likes}</div>
                  <div className="text-xs text-white/60">Likes</div>
                </div>
              </div>
              
              {/* Uploader Info */}
              <div>
                <h3 className="text-sm font-medium text-white/70 mb-2">Uploaded by</h3>
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage 
                      src={media.profile?.avatar_url || undefined} 
                      alt={media.profile?.username || "User"} 
                    />
                    <AvatarFallback className="bg-crimson text-white">
                      {(media.profile?.username || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-white font-medium">
                      {media.profile?.username || "User"}
                    </p>
                    <p className="text-xs text-white/60">
                      {formatDistanceToNow(new Date(media.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Album Link */}
              <div>
                <h3 className="text-sm font-medium text-white/70 mb-2">Album</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  asChild
                >
                  <Link to={`/albums/${albumId}`}>
                    {media.album?.title || "View Album"}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Delete Media Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Media</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this media? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteMedia}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Media Info Dialog */}
        <Dialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Media Information</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <p className="text-sm text-white/70">File Name</p>
                  <p className="text-sm font-medium truncate">{media.file_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-white/70">File Type</p>
                  <p className="text-sm font-medium">{media.file_type}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <p className="text-sm text-white/70">File Size</p>
                  <p className="text-sm font-medium">{formatFileSize(media.file_size)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-white/70">Uploaded</p>
                  <p className="text-sm font-medium">{format(new Date(media.created_at), 'MMM d, yyyy')}</p>
                </div>
              </div>
              
              {media.width && media.height && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <p className="text-sm text-white/70">Dimensions</p>
                    <p className="text-sm font-medium">{media.width} × {media.height}</p>
                  </div>
                  {media.duration && (
                    <div className="space-y-1">
                      <p className="text-sm text-white/70">Duration</p>
                      <p className="text-sm font-medium">
                        {Math.floor(media.duration / 60)}:{(media.duration % 60).toString().padStart(2, '0')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AuthenticatedLayout>
  );
};

export default MediaDetailPage;
