
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  post_id: string;
  username?: string;
  avatar_url?: string;
  bdsm_role?: string;
}

interface CommentsListProps {
  comments: Comment[];
  loading: boolean;
  showAllComments: boolean;
  toggleShowAllComments: () => void;
}

const CommentsList: React.FC<CommentsListProps> = ({ 
  comments, 
  loading, 
  showAllComments, 
  toggleShowAllComments 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 text-crimson animate-spin" />
      </div>
    );
  }
  
  if (comments.length === 0) {
    return <p className="text-white/50 text-sm p-4 text-center">No comments yet</p>;
  }
  
  // Display either all comments or just the most recent 2
  const displayComments = showAllComments ? comments : comments.slice(0, 2);
  
  return (
    <div className="px-4 py-2 space-y-3">
      {displayComments.map((comment) => (
        <div key={comment.id} className="flex gap-2">
          <Link to={`/profile/${comment.username}`}>
            <Avatar className="h-7 w-7 border border-crimson/30">
              <AvatarImage src={comment.avatar_url || ""} alt={comment.username || "User"} />
              <AvatarFallback className="bg-crimson/20 text-white text-xs">
                {comment.username ? comment.username.substring(0, 2).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
          
          <div className="flex-1">
            <div className="bg-black/20 p-2 rounded-md">
              <div className="flex items-center gap-2">
                <Link to={`/profile/${comment.username}`} className="text-sm font-medium text-white hover:text-crimson">
                  {comment.username || "Anonymous"}
                </Link>
                <span className="text-xs text-crimson/80">{comment.bdsm_role || "Exploring"}</span>
              </div>
              <p className="text-sm text-white/90 mt-1">{comment.content}</p>
            </div>
            <div className="text-xs text-white/40 mt-1">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </div>
          </div>
        </div>
      ))}
      
      {comments.length > 2 && (
        <button
          onClick={toggleShowAllComments}
          className="text-crimson text-sm mt-2 hover:underline w-full text-center"
        >
          {showAllComments ? "Show fewer comments" : `Show all ${comments.length} comments`}
        </button>
      )}
    </div>
  );
};

export default CommentsList;
