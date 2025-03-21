
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import PostItem from './PostItem';
import { Card, CardContent } from '@/components/ui/card';

const PostsList: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        // Fetch posts
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Get user profiles for each post (would be more efficient with a join)
        const postsWithUserInfo = await Promise.all(
          data.map(async (post) => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('username, bdsm_role')
              .eq('id', post.user_id)
              .single();
              
            return {
              ...post,
              username: profileData?.username,
              bdsm_role: profileData?.bdsm_role,
            };
          })
        );
        
        setPosts(postsWithUserInfo);
      } catch (err: any) {
        console.error('Error fetching posts:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();

    // Set up real-time subscription
    const channel = supabase
      .channel('posts-channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'posts' 
        }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Add the new post to the list
            setPosts(prevPosts => [payload.new, ...prevPosts]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-crimson"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardContent className="flex justify-center py-8 text-white/70">
          <p>Error loading posts: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-white/70 text-center">No posts yet. Create your first post above!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostsList;
