
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
                  <MoreHorizontal className="h-5 w-5" />
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
                <div className="relative">
                  <AspectRatio ratio={16/9}>
                    <VideoPlayer src={mediaUrls[currentMediaIndex]} />
                  </AspectRatio>
                </div>
              )}
              
              {mediaUrls.length > 1 && (
                <div className="absolute inset-y-0 left-0 right-0 flex justify-between items-center px-3">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={prevMedia}
                    disabled={currentMediaIndex === 0}
                    className="h-10 w-10 rounded-full bg-black/60 text-white border border-white/20 hover:bg-black/80"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={nextMedia}
                    disabled={currentMediaIndex === mediaUrls.length - 1}
                    className="h-10 w-10 rounded-full bg-black/60 text-white border border-white/20 hover:bg-black/80"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              )}
              
              {mediaUrls.length > 1 && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {mediaUrls.map((_, index) => (
                    <div 
                      key={index} 
                      className={`w-2 h-2 rounded-full ${
                        index === currentMediaIndex ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="border-t border-white/10 py-3 px-6 flex justify-between items-center bg-black/20">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLike}
              className={`text-sm p-0 h-auto ${isLiked ? 'text-crimson' : 'text-white/70'}`}
            >
              <Heart className={`h-5 w-5 mr-1 ${isLiked ? 'fill-crimson' : ''}`} />
              <span>{likes > 0 ? likes : ''}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sm p-0 h-auto text-white/70"
            >
              <MessageCircle className="h-5 w-5 mr-1" />
              <span></span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sm p-0 h-auto text-white/70"
            >
              <Share className="h-5 w-5 mr-1" />
            </Button>
          </div>
          
          <div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBookmark}
              className={`text-sm p-0 h-auto ${isBookmarked ? 'text-gold' : 'text-white/70'}`}
            >
              <BookmarkIcon className={`h-5 w-5 ${isBookmarked ? 'fill-gold' : ''}`} />
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Lightbox for images */}
      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={mediaUrls.filter((_, i) => mediaTypes[i] === 'image')}
        startIndex={currentMediaIndex}
      />
    </motion.div>
  );
};

export default PostItem;
