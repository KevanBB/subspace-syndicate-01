
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAlbum, useAlbums } from '@/hooks/useAlbums';
import { useMediaItems } from '@/hooks/useMediaItems';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import MediaGrid from '@/components/albums/MediaGrid';
import MediaUploader from '@/components/albums/MediaUploader';
import AlbumForm from '@/components/albums/AlbumForm';
import { Heart, MoreVertical, Edit, Trash2, Upload, Lock, ChevronLeft, Eye, Calendar } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { AlbumPrivacy } from '@/types/albums';

const AlbumDetailPage = () => {
  const { albumId } = useParams<{ albumId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: album, isLoading: isLoadingAlbum, error: albumError } = useAlbum(albumId!);
  const { likeAlbum, useAlbumLiked, useAlbumTags, updateAlbum, deleteAlbum } = useAlbums();
  const { data: isLiked } = useAlbumLiked(albumId!);
  const { data: albumTags } = useAlbumTags(albumId!);
  
  const {
    mediaItems,
    isLoadingMedia,
    uploadProgress,
    uploadMedia,
  } = useMediaItems(albumId);
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Check if current user is the album owner
  const isOwner = user?.id === album?.user_id;
  
  // Handle like button click
  const handleLikeClick = () => {
    if (albumId) {
      likeAlbum(albumId);
    }
  };
  
  // Handle media upload
  const handleMediaUpload = async (file: File, description?: string) => {
    if (!albumId) return;
    
    try {
      await uploadMedia({
        albumId,
        file,
        description,
      });
    } catch (error) {
      console.error('Error uploading media:', error);
    }
  };
  
  // Handle album edit
  const handleEditAlbum = async (values: {
    title: string;
    description?: string;
    privacy: AlbumPrivacy;
    tags?: string[];
    coverImage?: File;
  }) => {
    if (!albumId) return;
    
    await updateAlbum(albumId, values);
    setIsEditDialogOpen(false);
  };
  
  // Handle album delete
  const handleDeleteAlbum = async () => {
    if (!albumId) return;
    
    const success = await deleteAlbum(albumId);
    if (success) {
      setIsDeleteDialogOpen(false);
      navigate('/albums');
    }
  };
  
  // If album is private and not owned by current user, redirect
  useEffect(() => {
    if (album && album.privacy !== 'public' && album.user_id !== user?.id) {
      navigate('/albums');
    }
  }, [album, user, navigate]);
  
  if (isLoadingAlbum) {
    return (
      <AuthenticatedLayout>
        <div className="container py-8 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crimson"></div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }
  
  if (albumError || !album) {
    return (
      <AuthenticatedLayout>
        <div className="container py-8 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-2">Album Not Found</h2>
            <p className="text-white/70 mb-6">The album you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button asChild>
              <Link to="/albums">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Albums
              </Link>
            </Button>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }
  
  return (
    <AuthenticatedLayout>
      <div className="container py-8 max-w-7xl mx-auto px-4 sm:px-6">
        <Button 
          variant="ghost" 
          className="mb-6" 
          asChild
        >
          <Link to="/albums">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Albums
          </Link>
        </Button>
        
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Album Cover */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="aspect-square bg-black/30 rounded-md overflow-hidden">
              {album.cover_image_url ? (
                <img 
                  src={album.cover_image_url} 
                  alt={album.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Lock className="h-16 w-16 text-white/20" />
                </div>
              )}
            </div>
          </div>
          
          {/* Album Details */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-white">{album.title}</h1>
                {album.privacy !== 'public' && (
                  <Badge variant="secondary" className="mt-2">
                    <Lock className="h-3 w-3 mr-1" />
                    {album.privacy === 'private' ? 'Private' : 'Friends Only'}
                  </Badge>
                )}
              </div>
              
              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Album
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-500"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Album
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            {/* Creator Info */}
            <div className="flex items-center mt-4">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage 
                  src={album.profiles?.avatar_url || undefined} 
                  alt={album.profiles?.username || "User"} 
                />
                <AvatarFallback className="bg-crimson text-white">
                  {(album.profiles?.username || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-white font-medium">
                  {album.profiles?.username || "User"}
                </p>
                <p className="text-xs text-white/60">
                  Created {formatDistanceToNow(new Date(album.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            
            {/* Album Stats */}
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1 text-white/70" />
                <span className="text-white/70">{album.views}</span>
              </div>
              <div className="flex items-center">
                <Heart 
                  className={`h-4 w-4 mr-1 ${isLiked ? 'text-crimson fill-crimson' : 'text-white/70'}`}
                  onClick={handleLikeClick}
                  role="button"
                />
                <span className="text-white/70">{album.likes}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-white/70" />
                <span className="text-white/70">
                  {format(new Date(album.created_at), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
            
            {/* Description */}
            {album.description && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-white mb-2">Description</h3>
                <p className="text-white/80 whitespace-pre-wrap">{album.description}</p>
              </div>
            )}
            
            {/* Tags */}
            {albumTags && albumTags.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-white mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {albumTags.map(tag => (
                    <Badge key={tag.id} variant="secondary">
                      {tag.tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Upload Section (for owner only) */}
        {isOwner && (
          <div className="mb-8">
            <div className="bg-black/20 border border-white/10 rounded-md p-4">
              <h3 className="text-lg font-medium text-white mb-4">Add Media to Album</h3>
              <MediaUploader
                albumId={albumId!}
                onUpload={handleMediaUpload}
                uploadProgress={uploadProgress}
              />
            </div>
          </div>
        )}
        
        {/* Media Grid */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Media</h2>
          
          {isLoadingMedia ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crimson"></div>
            </div>
          ) : (
            <MediaGrid mediaItems={mediaItems || []} albumId={albumId!} />
          )}
        </div>
        
        {/* Edit Album Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Album</DialogTitle>
            </DialogHeader>
            <AlbumForm 
              onSubmit={handleEditAlbum}
              defaultValues={{
                title: album.title,
                description: album.description || undefined,
                privacy: album.privacy as AlbumPrivacy,
                tags: albumTags?.map(tag => tag.tag) || [],
              }}
              isEditing
            />
          </DialogContent>
        </Dialog>
        
        {/* Delete Album Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Album</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this album? This action cannot be undone and all media in this album will be permanently deleted.
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
                onClick={handleDeleteAlbum}
              >
                Delete Album
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AuthenticatedLayout>
  );
};

export default AlbumDetailPage;
