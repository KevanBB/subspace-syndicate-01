
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

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
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  
  const username = post.username || 'User';
  const formattedDate = post.created_at ? format(new Date(post.created_at), 'MMM d, yyyy • h:mm a') : '';

  // Parse media URLs and types
  const mediaUrls = post.media_url ? post.media_url.split(',') : [];
  const mediaTypes = post.media_type ? post.media_type.split(',') : [];

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setIsLiked(!isLiked);
    // In a real app, you would send this to the backend
  };

  const nextMedia = () => {
    if (currentMediaIndex < mediaUrls.length - 1) {
      setCurrentMediaIndex(currentMediaIndex + 1);
    }
  };

  const prevMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(currentMediaIndex - 1);
    }
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
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
        
        {mediaUrls.length > 0 && (
          <div className="mt-3 rounded-md overflow-hidden relative">
            {mediaTypes[currentMediaIndex] === 'image' && (
              <img 
                src={mediaUrls[currentMediaIndex]} 
                alt="Post media" 
                className="w-full object-cover max-h-96"
              />
            )}
            
            {mediaTypes[currentMediaIndex] === 'video' && (
              <video 
                src={mediaUrls[currentMediaIndex]} 
                controls
                className="w-full object-cover max-h-96"
              />
            )}
            
            {mediaUrls.length > 1 && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60"
                  onClick={prevMedia}
                  disabled={currentMediaIndex === 0}
                >
                  <ChevronLeft size={20} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60"
                  onClick={nextMedia}
                  disabled={currentMediaIndex === mediaUrls.length - 1}
                >
                  <ChevronRight size={20} />
                </Button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                  <div className="flex gap-1">
                    {mediaUrls.map((_, index) => (
                      <div 
                        key={index} 
                        className={`w-2 h-2 rounded-full ${index === currentMediaIndex ? 'bg-white' : 'bg-white/40'}`} 
                        onClick={() => setCurrentMediaIndex(index)}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
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
