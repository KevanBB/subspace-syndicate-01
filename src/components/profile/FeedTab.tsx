
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, MessageCircle, Share, Image, Smile, Send } from 'lucide-react';

const FeedTab: React.FC = () => {
  const { user } = useAuth();
  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';

  return (
    <div className="space-y-6">
      {/* Post creation */}
      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarImage src="/placeholder.svg" alt={username} />
              <AvatarFallback className="bg-crimson text-white">
                {username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Textarea 
              placeholder="What's on your mind?" 
              className="bg-black/30 border-white/10 resize-none text-white placeholder:text-white/50"
            />
          </div>
        </CardHeader>
        <CardFooter className="flex justify-between pt-0">
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
              <Image size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
              <Smile size={20} />
            </Button>
          </div>
          <Button className="bg-crimson hover:bg-crimson/80">
            <Send size={16} className="mr-2" /> Post
          </Button>
        </CardFooter>
      </Card>

      {/* Example posts */}
      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardHeader className="pb-3 space-y-0">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="/placeholder.svg" alt={username} />
              <AvatarFallback className="bg-crimson text-white">
                {username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-white">{username}</p>
              <p className="text-xs text-white/50">3 hours ago</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-white/80">
          <p>Just set up my new SubSpace profile! Looking forward to connecting with everyone here.</p>
        </CardContent>
        <CardFooter className="border-t border-white/10 pt-3 pb-3">
          <div className="flex gap-4 w-full">
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
              <Heart size={18} className="mr-1" /> 0
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

      {/* Empty state for no posts */}
      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-white/70 text-center">No posts yet. Create your first post above!</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedTab;
