import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal,
  BookmarkIcon,
  Flame 
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Lightbox } from '@/components/ui/lightbox';
import { formatTextWithHashtags } from '@/utils/hashtags';
import VideoPlayer from '@/components/video/VideoPlayer';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';

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
    bdsm_role?: string;
  };
};

const PostItem: React.FC<PostItemProps> = ({ post }) => {
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const username = post.username || 'User';
  const formattedDate = post.created_at ? format(new Date(post.created_at), 'MMM d, yyyy • h:mm a') : '';
  const bdsmRole = post.bdsm_role || 'Exploring';

  const mediaUrls = post.media_url ? post.media_url.split(',') : [];
  const mediaTypes = post.media_type ? post.media_type.split(',') : [];
  
  const mediaArray = mediaUrls.map((url, index) => ({
    url,
    type: mediaTypes[index] || 'image'
  }));

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setIsLiked(!isLiked);
    // In a real app, you would send this to the backend
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
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
  
  const openLightbox = () => {
    if (mediaUrls.length > 0) {
      setLightboxOpen(true);
    }
  };

  const getBdsmRoleBadgeVariant = () => {
    switch(bdsmRole.toLowerCase()) {
      case 'dominant': return "dominant";
      case 'submissive': return "submissive";
      case 'switch': return "switch";
      default: return "exploring";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-black/30 border-white/10 backdrop-blur-md overflow-hidden hover:border-crimson/30 transition-all hover:shadow-lg hover:shadow-crimson/10">
        <CardHeader className="pb-2 space-y-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link to={`/profile/${post.username}`}>
                <Avatar className="h-12 w-12 border-2 border-crimson/50 ring-2 ring-black/50">
                  <AvatarImage src={post.avatar_url || "/placeholder.svg"} alt={username} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-crimson text-white">
                    {username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Link to={`/profile/${post.username}`} className="font-medium text-white hover:text-crimson transition-colors">
                    {username}
                  </Link>
                  <Badge 
                    variant={getBdsmRoleBadgeVariant()} 
                    className="text-xs px-2 py-0 h-5 rounded-full font-medium"
                  >
                    {bdsmRole}
                  </Badge>
                </div>
                <p className="text-xs text-white/50">{formattedDate}</p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
                  <MoreHorizontal size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-black/90 border-white/10 text-white">
                <DropdownMenuItem className="cursor-pointer hover:bg-white/10">
                  Report Post
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-white/10">
                  Copy Link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="text-white/90 px-0 sm:px-6 pt-2">
          <div className="prose prose-invert prose-sm max-w-none px-6 sm:px-0">
            <div className="whitespace-pre-wrap">
              {formatTextWithHashtags(post.content)}
            </div>
          </div>
          
          {mediaUrls.length > 0 && (
            <div className="mt-3 overflow-hidden relative rounded-lg">
              {mediaTypes[currentMediaIndex] === 'image' && (
                <div 
                  className="cursor-pointer w-full"
                  onClick={openLightbox}
                >
                  <img 
                    src={mediaUrls[currentMediaIndex]} 
                    alt="Post media" 
                    className="w-full object-contain max-h-[85vh] mx-auto rounded-lg"
                  />
                </div>
              )}
              
              {mediaTypes[currentMediaIndex] === 'video' && (
                <div className="w-full">
                  <VideoPlayer 
                    videoUrl={mediaUrls[currentMediaIndex]} 
                    title={`${username}'s video`}
                  />
                </div>
              )}
              
              {mediaUrls.length > 1 && (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 z-10 rounded-full h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      prevMedia();
                    }}
                    disabled={currentMediaIndex === 0}
                  >
                    <ChevronLeft size={isMobile ? 16 : 18} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 z-10 rounded-full h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextMedia();
                    }}
                    disabled={currentMediaIndex === mediaUrls.length - 1}
                  >
                    <ChevronRight size={isMobile ? 16 : 18} />
                  </Button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
                    <div className="flex gap-1 bg-black/40 rounded-full px-2 py-1">
                      {mediaUrls.map((_, index) => (
                        <motion.div 
                          key={index} 
                          className={`w-2 h-2 rounded-full ${index === currentMediaIndex ? 'bg-crimson' : 'bg-white/40'} cursor-pointer`} 
                          whileHover={{ scale: 1.2 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentMediaIndex(index);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          
          <Lightbox 
            isOpen={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
            media={mediaArray}
            initialIndex={currentMediaIndex}
          />
        </CardContent>
        
        <CardFooter className="border-t border-white/10 pt-3 pb-3 flex justify-between">
          <div className="flex gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`${isLiked ? 'text-crimson' : 'text-white/70'} hover:text-crimson hover:bg-white/5 group`}
              onClick={handleLike}
            >
              <motion.div
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
                animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.2 }}
              >
                <Heart size={18} className={`mr-1 ${isLiked ? 'fill-crimson' : 'group-hover:fill-crimson/20'}`} /> 
              </motion.div>
              {likes}
            </Button>
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/5">
              <MessageCircle size={18} className="mr-1" /> 0
            </Button>
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/5">
              <Share size={18} className="mr-1" /> Share
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className={`${isBookmarked ? 'text-crimson' : 'text-white/70'} hover:text-crimson hover:bg-white/5`}
            onClick={handleBookmark}
          >
            <BookmarkIcon size={18} className={isBookmarked ? 'fill-crimson' : ''} />
          </Button>
        </CardFooter>
        
        {/* Hot post indicator */}
        {likes > 5 && (
          <div className="absolute top-2 right-2">
            <Badge variant="crimson" className="flex items-center gap-1 px-2">
              <Flame size={12} className="text-white" />
              Hot
            </Badge>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default PostItem;
