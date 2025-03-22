
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Heart, MessageCircle, Repeat, BookmarkIcon, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

// Types for the media content
type MediaType = 'image' | 'video' | 'gif';

interface MediaItem {
  url: string;
  type: MediaType;
  aspectRatio?: number;
  duration?: number;
}

// Interface for post statistics
interface PostStats {
  likes: number;
  comments: number;
  reposts: number;
  views: number;
}

// Main PostCard props
export interface PostCardProps {
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
    verified?: boolean;
  };
  content: string;
  media?: MediaItem[];
  stats?: PostStats;
  timestamp: string | Date;
  isLiked?: boolean;
  isBookmarked?: boolean;
  isReposted?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onRepost?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  className?: string;
  showBorder?: boolean;
  showActions?: boolean;
  interactive?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  id,
  author,
  content,
  media = [],
  stats = { likes: 0, comments: 0, reposts: 0, views: 0 },
  timestamp,
  isLiked = false,
  isBookmarked = false,
  isReposted = false,
  onLike,
  onComment,
  onRepost,
  onShare,
  onBookmark,
  className,
  showBorder = true,
  showActions = true,
  interactive = true,
}) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const hasMultipleMedia = media.length > 1;
  const formattedTime = timestamp instanceof Date 
    ? formatDistanceToNow(timestamp, { addSuffix: true })
    : formatDistanceToNow(new Date(timestamp), { addSuffix: true });

  // Media navigation handlers
  const goToPreviousMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex(prev => Math.max(0, prev - 1));
  };

  const goToNextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex(prev => Math.min(media.length - 1, prev + 1));
  };

  // Format numbers for display (e.g., 1200 -> 1.2K)
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  };

  return (
    <Card 
      variant="dark" 
      elevated={interactive}
      interactive={interactive}
      className={cn(
        "overflow-hidden",
        !showBorder && "border-0",
        showBorder && "border-b border-white/10",
        "hover:bg-white/5 transition-colors",
        className
      )}
    >
      <div className="p-4">
        {/* Post Header */}
        <div className="flex items-start gap-3">
          <Link to={`/profile/${author.username}`}>
            <Avatar className="h-10 w-10 rounded-full border border-white/10">
              <AvatarImage src={author.avatarUrl} alt={author.name} />
              <AvatarFallback className="bg-black/40 text-white">
                {author.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <Link to={`/profile/${author.username}`} className="font-bold text-white hover:underline">
                {author.name}
              </Link>
              {author.verified && (
                <Badge variant="default" className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center p-0 ml-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </Badge>
              )}
              <Link to={`/profile/${author.username}`} className="text-white/50 hover:underline">
                @{author.username}
              </Link>
              <span className="text-white/50">·</span>
              <span className="text-white/50">{formattedTime}</span>
            </div>
            
            {/* Post Content */}
            <div className="mt-1 text-white whitespace-pre-wrap break-words">
              {content}
            </div>
            
            {/* Media Content */}
            {media.length > 0 && (
              <div className="mt-3 relative rounded-xl overflow-hidden bg-black/20">
                {media[currentMediaIndex].type === 'image' ? (
                  <img 
                    src={media[currentMediaIndex].url} 
                    alt="Post media" 
                    className="w-full object-cover rounded-xl max-h-[500px]"
                  />
                ) : media[currentMediaIndex].type === 'video' ? (
                  <video 
                    src={media[currentMediaIndex].url} 
                    controls 
                    className="w-full object-contain rounded-xl max-h-[500px]"
                  />
                ) : (
                  <img 
                    src={media[currentMediaIndex].url} 
                    alt="GIF" 
                    className="w-full object-cover rounded-xl max-h-[500px]"
                  />
                )}
                
                {/* Media Navigation */}
                {hasMultipleMedia && (
                  <>
                    <div className="absolute top-1/2 left-2 transform -translate-y-1/2 flex">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-black/60 text-white hover:bg-black/80 disabled:opacity-30"
                        onClick={goToPreviousMedia}
                        disabled={currentMediaIndex === 0}
                      >
                        <ArrowLeft size={16} />
                      </Button>
                    </div>
                    <div className="absolute top-1/2 right-2 transform -translate-y-1/2 flex">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-black/60 text-white hover:bg-black/80 disabled:opacity-30"
                        onClick={goToNextMedia}
                        disabled={currentMediaIndex === media.length - 1}
                      >
                        <ArrowRight size={16} />
                      </Button>
                    </div>
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                      {media.map((_, i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "h-1.5 rounded-full",
                            i === currentMediaIndex 
                              ? "w-6 bg-white" 
                              : "w-1.5 bg-white/50"
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-white/50 hover:text-white hover:bg-black/30"
          >
            <MoreHorizontal size={16} />
          </Button>
        </div>
        
        {/* Post Actions */}
        {showActions && (
          <div className="mt-3 flex justify-between items-center pr-10">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-white/50 hover:text-blue-400 hover:bg-blue-400/10 rounded-full"
              onClick={onComment}
            >
              <MessageCircle size={18} />
              {stats.comments > 0 && (
                <span className="text-xs">{formatNumber(stats.comments)}</span>
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "gap-1 hover:text-green-400 hover:bg-green-400/10 rounded-full",
                isReposted ? "text-green-400" : "text-white/50"
              )}
              onClick={onRepost}
            >
              <Repeat size={18} className={isReposted ? "fill-green-400" : ""} />
              {stats.reposts > 0 && (
                <span className="text-xs">{formatNumber(stats.reposts)}</span>
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "gap-1 hover:text-pink-500 hover:bg-pink-500/10 rounded-full",
                isLiked ? "text-pink-500" : "text-white/50"
              )}
              onClick={onLike}
            >
              <Heart size={18} className={isLiked ? "fill-pink-500" : ""} />
              {stats.likes > 0 && (
                <span className="text-xs">{formatNumber(stats.likes)}</span>
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "gap-1 hover:text-blue-400 hover:bg-blue-400/10 rounded-full",
                isBookmarked ? "text-blue-400" : "text-white/50"
              )}
              onClick={onBookmark}
            >
              <BookmarkIcon size={18} className={isBookmarked ? "fill-blue-400" : ""} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white/50 hover:text-blue-400 hover:bg-blue-400/10 rounded-full"
              onClick={onShare}
            >
              <Share size={18} />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PostCard;
