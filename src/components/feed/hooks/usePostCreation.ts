
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase, ensureBucketExists } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PostMedia {
  id: string;
  url: string;
  type: 'image' | 'video' | 'gif';
  aspectRatio?: number;
  duration?: number;
  file?: File;
  previewUrl?: string;
}

export interface Post {
  id: string;
  content: string;
  media?: PostMedia[];
  hashtags?: string[];
  created_at: string;
  user_id: string;
  user: {
    username: string;
    name?: string;
    avatar_url?: string;
  };
  likes: number;
  comments: number;
}

interface UsePostCreationProps {
  onPostCreated: (post: Post) => void;
}

export const usePostCreation = ({ onPostCreated }: UsePostCreationProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmitPost = async (
    mediaItems: PostMedia[],
    hashtags: string[]
  ) => {
    try {
      if (!content.trim() && mediaItems.length === 0) {
        setError('Please add some content or media to your post');
        return;
      }
      
      setIsPosting(true);
      setError(null);
      
      const uploadedMedia: PostMedia[] = [];
      
      if (mediaItems.length > 0) {
        const bucketExists = await ensureBucketExists('post-media');
        
        if (!bucketExists) {
          setError('Media storage is not available. Please try again later or contact support.');
          setIsPosting(false);
          return;
        }
        
        for (const item of mediaItems) {
          if (item.file) {
            const fileName = `${user?.id}/${uuidv4()}-${item.file.name}`;
            const filePath = `media/${fileName}`;
            
            const { data, error: uploadError } = await supabase.storage
              .from('post-media')
              .upload(filePath, item.file);
              
            if (uploadError) throw uploadError;
            
            const { data: urlData } = supabase.storage
              .from('post-media')
              .getPublicUrl(filePath);
              
            uploadedMedia.push({
              id: item.id,
              url: urlData.publicUrl,
              type: item.type
            });
          }
        }
      }
      
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert({
          content,
          user_id: user?.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (postError) throw postError;
      
      if (uploadedMedia.length > 0) {
        const mediaInserts = uploadedMedia.map((media, index) => ({
          post_id: postData.id,
          url: media.url,
          type: media.type,
          position: index
        }));
        
        const { error: mediaError } = await supabase
          .from('post_media')
          .insert(mediaInserts);
          
        if (mediaError) throw mediaError;
      }
      
      if (hashtags && hashtags.length > 0) {
        const hashtagInserts = hashtags.map(tag => ({
          post_id: postData.id,
          hashtag: tag
        }));
        
        const { error: hashtagError } = await supabase
          .from('post_hashtags')
          .insert(hashtagInserts);
          
        if (hashtagError) throw hashtagError;
      }
      
      await supabase.channel('feed-updates').send({
        type: 'broadcast',
        event: 'new-post',
        payload: { 
          id: postData.id,
          user_id: user?.id,
          hashtags
        }
      });
      
      const newPost: Post = {
        id: postData.id,
        content: postData.content,
        media: uploadedMedia,
        hashtags,
        created_at: postData.created_at,
        user_id: user?.id || '',
        user: {
          username: user?.user_metadata?.username || '',
          avatar_url: user?.user_metadata?.avatar_url
        },
        likes: 0,
        comments: 0
      };
      
      setContent('');
      
      onPostCreated(newPost);
      return true;
    } catch (error: any) {
      console.error('Error creating post:', error);
      setError(error.message);
      return false;
    } finally {
      setIsPosting(false);
    }
  };
  
  return {
    content,
    setContent,
    isPosting,
    error,
    setError,
    handleSubmitPost
  };
};
