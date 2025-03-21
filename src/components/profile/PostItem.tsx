
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

type PostItemProps = {
  post: {
    id: string;
    user_id: string;
    content: string;
    media_url: string | null;
    media_type: string | null;
    created_at: string;
    username?: string;
    avatar_url?: string;
  };
};

const PostItem: React.FC<PostItemProps> = ({ post }) => {
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  
  const username = post.username || 'User';
  const formattedDate = post.created_at ? format(new Date(post.created_at), 'MMM d, yyyy • h:mm a') : '';

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setIsLiked(!isLiked);
    // In a real app, you would send this to the backend
  };

  return (
    <Card className="bg-black/20 border-white/10 backdrop-blur-md">
      <CardHeader className="pb-3 space-y-0">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={post.avatar_url || "/placeholder.svg"} alt={username} />
            <AvatarFallback className="bg-crimson text-white">
              {username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-white">{username}</p>
            <p className="text-xs text-white/50">{formattedDate}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="text-white/80">
        <p className="whitespace-pre-line">{post.content}</p>
        
        {post.media_url && post.media_type === 'image' && (
          <div className="mt-3 rounded-md overflow-hidden">
            <img 
              src={post.media_url} 
              alt="Post media" 
              className="w-full object-cover max-h-96"
            />
          </div>
        )}
        
        {post.media_url && post.media_type === 'video' && (
          <div className="mt-3 rounded-md overflow-hidden">
            <video 
              src={post.media_url} 
              controls
              className="w-full object-cover max-h-96"
            />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t border-white/10 pt-3 pb-3">
        <div className="flex gap-4 w-full">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`${isLiked ? 'text-crimson' : 'text-white/70'} hover:text-white hover:bg-white/10`}
            onClick={handleLike}
          >
            <Heart size={18} className="mr-1" /> {likes}
          </Button>
          <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
            <MessageCircle size={18} className="mr-1" /> 0
          </Button>
          <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
            <Share size={18} className="mr-1" /> Share
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PostItem;
