import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Image as ImageIcon, Film as FilmIcon, Hash, Smile, Upload, Loader2, X } from 'lucide-react';
import { MediaUploader } from './MediaUploader';
import { MediaPreview } from './MediaPreview';
import { HashtagInput } from './HashtagInput';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Post {
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

interface PostMedia {
  id: string;
  url: string;
  type: 'image' | 'video' | 'gif';
  aspectRatio?: number;
  duration?: number;
  file?: File;
  previewUrl?: string;
}

interface PostCreatorProps {
  onPostCreated: (post: Post) => void;
}

const MAX_MEDIA_ITEMS = 5;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const MAX_HASHTAGS = 10;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime'];

const PostCreator: React.FC<PostCreatorProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [mediaItems, setMediaItems] = useState<PostMedia[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setError(null);
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    if (mediaItems.length + files.length > MAX_MEDIA_ITEMS) {
      setError(`You can only add up to ${MAX_MEDIA_ITEMS} media items`);
      return;
    }
    
    Array.from(files).forEach(file => {
      if (!isValidFileType(file)) {
        setError('Invalid file type. Only JPEG, PNG, GIF, MP4, and MOV files are allowed.');
        return;
      }
      
      if (!isValidFileSize(file)) {
        setError(`File size exceeds the limit (${file.type.includes('video') ? '50MB for videos' : '10MB for images'})`);
        return;
      }
      
      const previewUrl = URL.createObjectURL(file);
      
      let mediaType: 'image' | 'video' | 'gif' = 'image';
      if (file.type.includes('video')) {
        mediaType = 'video';
      } else if (file.type.includes('gif')) {
        mediaType = 'gif';
      }
      
      const newMedia: PostMedia = {
        id: uuidv4(),
        url: '',
        previewUrl,
        type: mediaType,
        file
      };
      
      setMediaItems(prev => [...prev, newMedia]);
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const isValidFileType = (file: File): boolean => {
    return [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].includes(file.type);
  };
  
  const isValidFileSize = (file: File): boolean => {
    if (file.type.includes('video')) {
      return file.size <= MAX_VIDEO_SIZE;
    }
    return file.size <= MAX_IMAGE_SIZE;
  };
  
  const handleRemoveMedia = (id: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== id));
  };
  
  const handleReorderMedia = useCallback((dragIndex: number, hoverIndex: number) => {
    setMediaItems(prev => {
      const newItems = [...prev];
      const draggedItem = newItems[dragIndex];
      newItems.splice(dragIndex, 1);
      newItems.splice(hoverIndex, 0, draggedItem);
      return newItems;
    });
  }, []);
  
  const handleAddHashtag = (tag: string) => {
    if (hashtags.length >= MAX_HASHTAGS) {
      setError(`You can only add up to ${MAX_HASHTAGS} hashtags`);
      return;
    }
    
    const formattedTag = tag.startsWith('#') ? tag.substring(1).toLowerCase() : tag.toLowerCase();
    
    if (!formattedTag || hashtags.includes(formattedTag)) return;
    
    setHashtags(prev => [...prev, formattedTag]);
  };
  
  const handleRemoveHashtag = (tag: string) => {
    setHashtags(prev => prev.filter(t => t !== tag));
  };
  
  const handleSubmitPost = async () => {
    try {
      if (!content.trim() && mediaItems.length === 0) {
        setError('Please add some content or media to your post');
        return;
      }
      
      setIsPosting(true);
      setError(null);
      
      const uploadedMedia: PostMedia[] = [];
      
      if (mediaItems.length > 0) {
        const { error: bucketError } = await supabase.storage.createBucket('post-media', {
          public: true,
          fileSizeLimit: 52428800, // 50MB
        });
        
        if (bucketError && bucketError.message !== 'Bucket already exists') {
          console.error('Error creating bucket:', bucketError);
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
      setMediaItems([]);
      setHashtags([]);
      
      onPostCreated(newPost);
    } catch (error: any) {
      console.error('Error creating post:', error);
      setError(error.message);
    } finally {
      setIsPosting(false);
    }
  };
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <DndProvider backend={HTML5Backend}>
      <Card className="bg-black/30 border-white/10">
        <CardContent className="p-4">
          <div className="flex space-x-3">
            <Avatar className="h-10 w-10 border border-white/10">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-black/50">
                {user?.user_metadata?.username?.substring(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <Textarea
                value={content}
                onChange={handleContentChange}
                placeholder="What's on your mind?"
                className="min-h-[120px] bg-black/30 border-white/10 resize-none mb-3"
              />
              
              {mediaItems.length > 0 && (
                <div className="mt-3 mb-4">
                  <MediaPreview
                    items={mediaItems}
                    onRemove={handleRemoveMedia}
                    onReorder={handleReorderMedia}
                  />
                </div>
              )}
              
              {hashtags && hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 mb-4">
                  {hashtags.map(tag => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-blue-900/30 hover:bg-blue-800/40 text-blue-300 flex items-center gap-1"
                    >
                      #{tag}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 rounded-full hover:bg-blue-800/60 p-0"
                        onClick={() => handleRemoveHashtag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
              
              {error && (
                <Alert variant="destructive" className="mt-3 mb-4 bg-red-950/50 border-red-800 text-red-300">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white hover:bg-white/10"
                    onClick={handleUploadClick}
                    disabled={mediaItems.length >= MAX_MEDIA_ITEMS || isPosting}
                  >
                    <ImageIcon className="h-5 w-5 mr-1" />
                    Media
                  </Button>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    accept=".jpg,.jpeg,.png,.gif,.mp4,.mov"
                    className="hidden"
                  />
                  
                  <HashtagInput
                    onAddHashtag={handleAddHashtag}
                    maxHashtags={MAX_HASHTAGS}
                    currentCount={hashtags ? hashtags.length : 0}
                    disabled={isPosting}
                  />
                </div>
                
                <Button
                  variant="default"
                  className="bg-crimson hover:bg-crimson/90"
                  onClick={handleSubmitPost}
                  disabled={isPosting || (!content.trim() && mediaItems.length === 0)}
                >
                  {isPosting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    'Post'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DndProvider>
  );
};

export default PostCreator;
