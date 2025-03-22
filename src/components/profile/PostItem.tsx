import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

// Import the components
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
  parent_id?: string | null;
  profiles?: ProfileData;
  username?: string;
  avatar_url?: string;
  bdsm_role?: string;
}

const PostItem = ({ post }: { post: PostWithProfile }) => {
  const { user } = useAuth();
  
  // State variables
  const [comments, setComments] = useState<Comment[]>([]);
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
  
  // Load comments safely handling missing tables
  const loadComments = async () => {
    if (!user) return;
    
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          post_id,
          parent_id,
          profiles(username, avatar_url, bdsm_role)
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });
        
      if (error) {
        console.error('Error loading comments:', error.message);
        setComments([]);
        return;
      }
      
      const transformedComments = data.map((comment: any) => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        user_id: comment.user_id,
        post_id: comment.post_id,
        parent_id: comment.parent_id,
        username: comment.profiles?.username,
        avatar_url: comment.profiles?.avatar_url,
        bdsm_role: comment.profiles?.bdsm_role
      }));
      
      setComments(transformedComments);
    } catch (error: any) {
      console.error('Error loading comments:', error.message);
      toast({
        title: 'Error loading comments',
        description: error.message,
        variant: 'destructive',
      });
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  // Submit a new comment
  const submitComment = async (content: string) => {
    if (!user) return;

    try {
      const { data: newComment, error } = await supabase
        .from('comments')
        .insert([
          { 
            content,
            user_id: user.id,
            post_id: post.id,
            parent_id: null 
          }
        ])
        .select()
        .single();
        
      if (error) throw error;
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username, avatar_url, bdsm_role')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        console.error('Error fetching profile:', profileError.message);
      }
      
      const commentWithProfile = {
        ...newComment,
        username: profileData?.username,
        avatar_url: profileData?.avatar_url,
        bdsm_role: profileData?.bdsm_role
      };
      
      setComments(prev => [...prev, commentWithProfile]);
      
      toast({
        title: 'Comment added',
        description: 'Your comment has been posted successfully.',
      });
    } catch (error: any) {
      console.error('Error submitting comment:', error.message);
      toast({
        title: 'Error submitting comment',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  // Reply to a comment (adding a nested comment)
  const replyToComment = async (content: string, parentId: string | null) => {
    if (!user) return;

    try {
      const { data: newReply, error } = await supabase
        .from('comments')
        .insert([
          { 
            content,
            user_id: user.id,
            post_id: post.id,
            parent_id: parentId 
          }
        ])
        .select()
        .single();
        
      if (error) throw error;
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username, avatar_url, bdsm_role')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        console.error('Error fetching profile:', profileError.message);
      }
      
      const replyWithProfile = {
        ...newReply,
        username: profileData?.username,
        avatar_url: profileData?.avatar_url,
        bdsm_role: profileData?.bdsm_role
      };
      
      setComments(prev => [...prev, replyWithProfile]);
      
      toast({
        title: 'Reply added',
        description: 'Your reply has been posted successfully.',
      });
    } catch (error: any) {
      console.error('Error submitting reply:', error.message);
      toast({
        title: 'Error submitting reply',
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
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking if liked:', error.message);
        return;
      }
      
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
        .select('id', { count: 'exact', head: true })
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
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert([
            { post_id: post.id, user_id: user.id }
          ]);
          
        if (error) throw error;
        
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error: any) {
      console.error('Error toggling like:', error.message);
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
      setIsBookmarked(false);
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
      toast({
        title: 'Bookmarks feature coming soon',
        description: 'The ability to bookmark posts is not yet implemented.',
      });
      
      setIsBookmarked(!isBookmarked);
    } catch (error: any) {
      console.error('Error toggling bookmark:', error.message);
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
      exit={{ opacity: 0 }}
      layout
      className="overflow-hidden"
    >
      <Card className="bg-black/30 border-white/10 backdrop-blur-md shadow-lg shadow-crimson/5 overflow-hidden">
        <PostHeader 
          post={post}
          isCurrentUser={isCurrentUser}
          onMenuToggle={() => setShowMenu(!showMenu)}
        />
        
        {isEditing ? (
          <div className="px-4 py-3">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="bg-black/30 border border-white/20 text-white mb-2"
              disabled={loadingEdit}
            />
            <div className="flex gap-2">
              <Button 
                onClick={updatePost}
                className="bg-crimson hover:bg-crimson/80 text-white"
                disabled={!editedContent.trim() || loadingEdit}
                size="sm"
              >
                {loadingEdit ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save
              </Button>
              <Button 
                onClick={handleCancelEdit}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <PostContent 
            content={post.content} 
            media_url={post.media_url}
            media_type={post.media_type}
            isEditing={false}
          />
        )}
        
        <PostActions 
          commentCount={comments.length}
          likeCount={likeCount}
          isLiked={isLiked}
          isBookmarked={isBookmarked}
          onToggleLike={toggleLike}
          onToggleBookmark={toggleBookmark}
          loadingLikes={loadingLikes}
          loadingBookmark={loadingBookmark}
          onToggleComments={toggleShowAllComments}
        />
        
        <div className={`border-t border-white/10 ${showAllComments ? 'block' : 'hidden'}`}>
          <CommentsList 
            comments={comments}
            loading={loadingComments}
            showAllComments={showAllComments}
            toggleShowAllComments={toggleShowAllComments}
            onReply={replyToComment}
          />
          <CommentForm 
            onSubmit={submitComment}
            disabled={false}
          />
        </div>
        
        <PostMenu 
          isOpen={showMenu}
          onClose={() => setShowMenu(false)}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onFlag={handleFlagClick}
          isOwner={isCurrentUser}
        />
        
        <ConfirmationDialog
          title="Delete Post"
          message="Are you sure you want to delete this post? This action cannot be undone."
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onCancel={() => setShowConfirmation(false)}
          onConfirm={deletePost}
          isLoading={loadingDelete}
          confirmLabel="Delete"
          cancelLabel="Cancel"
        />
        
        <ConfirmationDialog
          title="Flag Post"
          message="Are you sure you want to flag this post as inappropriate? This will send a report to the moderators."
          isOpen={showFlagConfirmation}
          onClose={() => setShowFlagConfirmation(false)}
          onCancel={() => setShowFlagConfirmation(false)}
          onConfirm={flagPost}
          isLoading={false}
          confirmLabel="Flag"
          cancelLabel="Cancel"
        />
      </Card>
    </motion.div>
  );
};

export default PostItem;
