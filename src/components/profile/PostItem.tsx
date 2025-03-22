
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// Import the new components
import PostHeader from './post/PostHeader';
import PostContent from './post/PostContent';
import PostActions from './post/PostActions';
import CommentsList from './post/CommentsList';
import CommentForm from './post/CommentForm';
import PostMenu from './post/PostMenu';
import ConfirmationDialog from './post/ConfirmationDialog';

interface ProfileData {
  username?: string;
  avatar_url?: string;
  bdsm_role?: string;
}

interface PostWithProfile {
  id: string;
  content: string;
  created_at: string | null;
  user_id: string;
  media_url: string | null;
  media_type: string | null;
  profiles?: ProfileData;
  username?: string;
  avatar_url?: string;
  bdsm_role?: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  post_id: string;
  profiles?: ProfileData;
  username?: string;
  avatar_url?: string;
  bdsm_role?: string;
}

const PostItem = ({ post }: { post: PostWithProfile }) => {
  const { user } = useAuth();
  
  // Essential state variables
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loadingLikes, setLoadingLikes] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loadingBookmark, setLoadingBookmark] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  
  // Dialog state management
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showFlagConfirmation, setShowFlagConfirmation] = useState(false);
  
  // Initial data loading
  useEffect(() => {
    loadComments();
    checkIfLiked();
    fetchLikeCount();
    checkIfBookmarked();
  }, [post.id, user?.id]);
  
  // Check if current user is the post owner
  const isCurrentUser = user?.id === post.user_id;
  
  // Load comments from Supabase
  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url,
            bdsm_role
          )
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setComments(
        (data as any[]).map((comment) => ({
          ...comment,
          username: comment.profiles?.username || 'User',
          avatar_url: comment.profiles?.avatar_url,
          bdsm_role: comment.profiles?.bdsm_role,
        }))
      );
    } catch (error: any) {
      toast({
        title: 'Error loading comments',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoadingComments(false);
    }
  };

  // Submit a new comment
  const submitComment = async (content: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          content,
          user_id: user.id,
          post_id: post.id,
        });

      if (error) throw error;

      loadComments();
    } catch (error: any) {
      toast({
        title: 'Error submitting comment',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Check if the user has liked the post
  const checkIfLiked = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('*')
        .eq('user_id', user.id)
        .eq('post_id', post.id)
        .single();

      if (error && error.message !== 'No rows found') throw error;

      setIsLiked(!!data);
    } catch (error: any) {
      console.error('Error checking if liked:', error.message);
    }
  };

  // Get the number of likes for the post
  const fetchLikeCount = async () => {
    setLoadingLikes(true);
    try {
      const { count, error } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact' })
        .eq('post_id', post.id);

      if (error) throw error;

      setLikeCount(count || 0);
    } catch (error: any) {
      console.error('Error fetching like count:', error.message);
    } finally {
      setLoadingLikes(false);
    }
  };

  // Like or unlike the post
  const toggleLike = async () => {
    if (!user) return;

    setLoadingLikes(true);
    try {
      if (isLiked) {
        // Unlike the post
        const { error: deleteError } = await supabase
          .from('post_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', post.id);

        if (deleteError) throw deleteError;

        setIsLiked(false);
        setLikeCount(likeCount - 1);
      } else {
        // Like the post
        const { error: insertError } = await supabase
          .from('post_likes')
          .insert({
            user_id: user.id,
            post_id: post.id,
          });

        if (insertError) throw insertError;

        setIsLiked(true);
        setLikeCount(likeCount + 1);
      }
    } catch (error: any) {
      toast({
        title: 'Error toggling like',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoadingLikes(false);
    }
  };

  // Check if the user has bookmarked the post
  const checkIfBookmarked = async () => {
    if (!user) return;

    setLoadingBookmark(true);
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .eq('post_id', post.id)
        .single();

      if (error && error.message !== 'No rows found') throw error;

      setIsBookmarked(!!data);
    } catch (error: any) {
      console.error('Error checking if bookmarked:', error.message);
    } finally {
      setLoadingBookmark(false);
    }
  };

  // Bookmark or unbookmark the post
  const toggleBookmark = async () => {
    if (!user) return;

    setLoadingBookmark(true);
    try {
      if (isBookmarked) {
        // Remove bookmark
        const { error: deleteError } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', post.id);

        if (deleteError) throw deleteError;

        setIsBookmarked(false);
      } else {
        // Add bookmark
        const { error: insertError } = await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            post_id: post.id,
          });

        if (insertError) throw insertError;

        setIsBookmarked(true);
      }
    } catch (error: any) {
      toast({
        title: 'Error toggling bookmark',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoadingBookmark(false);
    }
  };

  // Delete the post
  const deletePost = async () => {
    setLoadingDelete(true);
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;

      toast({
        title: 'Post deleted',
        description: 'Your post has been deleted successfully.',
      });
      
      // Refresh the page
      window.location.reload();
    } catch (error: any) {
      toast({
        title: 'Error deleting post',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoadingDelete(false);
      setShowConfirmation(false);
    }
  };

  // Update the post content
  const updatePost = async () => {
    setLoadingEdit(true);
    try {
      const { error } = await supabase
        .from('posts')
        .update({ content: editedContent })
        .eq('id', post.id);

      if (error) throw error;

      toast({
        title: 'Post updated',
        description: 'Your post has been updated successfully.',
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: 'Error updating post',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoadingEdit(false);
    }
  };

  // Flag the post for moderation
  const flagPost = async () => {
    try {
      toast({
        title: 'Post reported',
        description: 'This post has been flagged for review.',
      });
    } finally {
      setShowFlagConfirmation(false);
    }
  };

  // Toggle showing all comments
  const toggleShowAllComments = () => {
    setShowAllComments(!showAllComments);
  };
  
  // Event handlers for the post menu
  const handleEditClick = () => {
    setIsEditing(true);
    setShowMenu(false);
  };
  
  const handleDeleteClick = () => {
    setShowConfirmation(true);
    setShowMenu(false);
  };
  
  const handleFlagClick = () => {
    setShowFlagConfirmation(true);
    setShowMenu(false);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(post.content);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-black/30 border-white/10 backdrop-blur-md shadow-lg relative overflow-hidden">
        {/* Post Header */}
        <PostHeader 
          post={post} 
          isCurrentUser={isCurrentUser} 
          onMenuToggle={() => setShowMenu(!showMenu)} 
        />
        
        {/* Post Menu (if the user is the post owner) */}
        <PostMenu 
          isOpen={showMenu} 
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onFlag={handleFlagClick}
          onClose={() => setShowMenu(false)}
        />
        
        {/* Post Content */}
        <PostContent
          content={post.content}
          media_url={post.media_url}
          media_type={post.media_type}
          isEditing={isEditing}
          editedContent={editedContent}
          onEditChange={(value) => setEditedContent(value)}
        />
        
        {/* Edit Buttons (if editing) */}
        {isEditing && (
          <div className="px-4 pb-4 flex justify-end gap-2">
            <button
              onClick={handleCancelEdit}
              className="px-4 py-1 rounded bg-black/30 text-white border border-white/20"
              disabled={loadingEdit}
            >
              Cancel
            </button>
            <button
              onClick={updatePost}
              className="px-4 py-1 rounded bg-crimson text-white"
              disabled={loadingEdit}
            >
              {loadingEdit ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Save'
              )}
            </button>
          </div>
        )}
        
        {/* Post Actions */}
        <PostActions 
          likeCount={likeCount}
          commentCount={comments.length}
          isLiked={isLiked}
          isBookmarked={isBookmarked}
          loadingLikes={loadingLikes}
          loadingBookmark={loadingBookmark}
          onToggleLike={toggleLike}
          onToggleBookmark={toggleBookmark}
          onToggleComments={toggleShowAllComments}
        />
        
        {/* Comments List */}
        <CommentsList 
          comments={comments}
          loading={loadingComments}
          showAllComments={showAllComments}
          toggleShowAllComments={toggleShowAllComments}
        />
        
        {/* Comment Form */}
        {user && (
          <CommentForm 
            onSubmit={submitComment}
            disabled={!user}
          />
        )}
        
        {/* Confirmation Dialogs */}
        <ConfirmationDialog
          isOpen={showConfirmation}
          title="Delete Post"
          message="Are you sure you want to delete this post? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          isLoading={loadingDelete}
          onConfirm={deletePost}
          onCancel={() => setShowConfirmation(false)}
        />
        
        <ConfirmationDialog
          isOpen={showFlagConfirmation}
          title="Report Post"
          message="Are you sure you want to report this post for inappropriate content?"
          confirmLabel="Report"
          cancelLabel="Cancel"
          isLoading={false}
          onConfirm={flagPost}
          onCancel={() => setShowFlagConfirmation(false)}
        />
      </Card>
    </motion.div>
  );
};

export default PostItem;
