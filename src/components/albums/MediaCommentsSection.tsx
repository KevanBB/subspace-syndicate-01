
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MediaComment } from '@/types/albums';
import { formatDistanceToNow } from 'date-fns';
import { Send, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface MediaCommentsSectionProps {
  comments: MediaComment[];
  onAddComment: (content: string) => Promise<MediaComment | null>;
  onDeleteComment: (commentId: string) => Promise<boolean>;
  isLoading?: boolean;
}

const MediaCommentsSection: React.FC<MediaCommentsSectionProps> = ({
  comments,
  onAddComment,
  onDeleteComment,
  isLoading = false
}) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || submitting) return;
    
    setSubmitting(true);
    
    try {
      const result = await onAddComment(newComment);
      if (result) {
        setNewComment('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    await onDeleteComment(commentId);
  };
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Comments</h3>
      
      {user && (
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] bg-black/30 border-white/20"
          />
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={!newComment.trim() || submitting}
            >
              <Send className="mr-2 h-4 w-4" />
              {submitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </form>
      )}
      
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mx-auto"></div>
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-white/60 py-4">No comments yet</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={comment.profile?.avatar_url || undefined} 
                  alt={comment.profile?.username || "User"} 
                />
                <AvatarFallback className="bg-crimson text-white">
                  {(comment.profile?.username || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-white">
                      {comment.profile?.username || "User"}
                    </span>
                    <span className="text-xs text-white/60">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  {user?.id === comment.user_id && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-white/60 hover:text-white"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <p className="text-white/80 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MediaCommentsSection;
