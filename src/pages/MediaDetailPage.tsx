
import React from 'react';
import { useParams } from 'react-router-dom';
import { useMediaItem } from '@/hooks/useMediaItems';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

// Import refactored components
import MediaHeader from '@/components/media/MediaHeader';
import MediaViewer from '@/components/media/MediaViewer';
import MediaInfo from '@/components/media/MediaInfo';
import CommentsSection from '@/components/media/CommentsSection';
import LoadingState from '@/components/media/LoadingState';
import ErrorState from '@/components/media/ErrorState';

const MediaDetailPage: React.FC = () => {
  const { albumId, mediaId } = useParams();
  const { user } = useAuth();
  const { data: mediaItem, isLoading, error } = useMediaItem(mediaId || '');
  
  const getUsername = (profile: any) => {
    if (!profile) return 'Unknown user';
    if (typeof profile === 'string') return 'Unknown user';
    if (!profile.username) return 'Unknown user';
    return profile.username;
  };
  
  const getAvatarUrl = (profile: any) => {
    if (!profile) return undefined;
    if (typeof profile === 'string') return undefined;
    return profile.avatar_url;
  };

  const getBdsmRole = (profile: any) => {
    if (!profile) return 'Exploring';
    if (typeof profile === 'string') return 'Exploring';
    return profile.bdsm_role || 'Exploring';
  };

  if (isLoading) {
    return <LoadingState />;
  }
  
  if (error || !mediaItem) {
    return <ErrorState albumId={albumId} />;
  }
  
  // Make a copy of the mediaItem with corrected profile and album properties
  // to ensure type compatibility
  const processedMediaItem = {
    ...mediaItem,
    profile: mediaItem.profile && typeof mediaItem.profile === 'object' ? {
      username: getUsername(mediaItem.profile),
      avatar_url: getAvatarUrl(mediaItem.profile),
      bdsm_role: getBdsmRole(mediaItem.profile)
    } : undefined,
    album: mediaItem.album && typeof mediaItem.album === 'object' ? {
      id: mediaItem.album.id,
      title: mediaItem.album.title,
      privacy: mediaItem.album.privacy
    } : undefined
  };
  
  const isOwner = user?.id === processedMediaItem.user_id;
  const { data: isLiked } = mediaItem.useMediaLiked(mediaId || '');
  const { data: isBookmarked } = mediaItem.useMediaBookmarked(mediaId || '');
  const { data: commentsData } = mediaItem.useMediaComments(mediaId || '');
  
  // Transform the comments data to make it compatible with the MediaComment type
  const comments = commentsData?.map(comment => ({
    ...comment,
    profile: comment.profile && typeof comment.profile === 'object' ? {
      username: getUsername(comment.profile),
      avatar_url: getAvatarUrl(comment.profile)
    } : { username: 'Unknown user', avatar_url: undefined }
  }));
  
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
  
  const handleCommentSubmit = async (content: string): Promise<boolean> => {
    if (!content.trim()) return false;
    
    const success = await mediaItem.addComment(content);
    return !!success;
  };
  
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    
    await mediaItem.deleteComment(commentId);
  };
  
  return (
    <div className="container py-6">
      <MediaHeader albumId={albumId || ''} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MediaViewer 
            mediaItem={processedMediaItem}
            isLiked={isLiked || false}
            isBookmarked={isBookmarked || false}
            onLike={() => mediaItem.likeMedia(mediaId || '')}
            onBookmark={() => mediaItem.bookmarkMedia(mediaId || '')}
            onDownload={handleDownload}
          />
        </div>
        
        <div>
          <MediaInfo 
            mediaItem={processedMediaItem}
            getUsername={getUsername}
          />
          
          <CommentsSection 
            comments={comments}
            onAddComment={handleCommentSubmit}
            onDeleteComment={handleDeleteComment}
            getUsername={getUsername}
            getAvatarUrl={getAvatarUrl}
          />
        </div>
      </div>
    </div>
  );
};

export default MediaDetailPage;
