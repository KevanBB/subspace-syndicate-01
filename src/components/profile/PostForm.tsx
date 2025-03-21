
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Image, Smile, Send, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

const PostForm: React.FC = () => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !selectedFile) {
      toast({
        title: "Error",
        description: "Please enter some content or select a file to post",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let mediaUrl = null;
      let mediaType = null;

      // Upload file if one is selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const filePath = `${user!.id}/${uuidv4()}.${fileExt}`;
        
        // Determine media type
        if (selectedFile.type.startsWith('image/')) {
          mediaType = 'image';
        } else if (selectedFile.type.startsWith('video/')) {
          mediaType = 'video';
        }
        
        const { error: uploadError, data } = await supabase.storage
          .from('post_media')
          .upload(filePath, selectedFile);

        if (uploadError) {
          throw uploadError;
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('post_media')
          .getPublicUrl(filePath);
          
        mediaUrl = publicUrl;
      }

      // Insert the post
      const { error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: user!.id,
          content: content.trim(),
          media_url: mediaUrl,
          media_type: mediaType
        });

      if (insertError) {
        throw insertError;
      }

      // Clear form after successful submission
      setContent('');
      setSelectedFile(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast({
        title: "Success",
        description: "Your post has been published!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Avatar>
          <AvatarImage src="/placeholder.svg" alt={username} />
          <AvatarFallback className="bg-crimson text-white">
            {username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea 
            placeholder="What's on your mind?" 
            className="bg-black/30 border-white/10 resize-none text-white placeholder:text-white/50"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          
          {/* Preview area for selected media */}
          {preview && (
            <div className="relative mt-2 rounded-md overflow-hidden">
              <img src={preview} alt="Preview" className="max-h-48 rounded-md object-cover" />
              <Button 
                variant="destructive" 
                size="icon"
                className="absolute top-2 right-2 w-8 h-8 opacity-90 rounded-full"
                onClick={removeSelectedFile}
              >
                <X size={18} />
              </Button>
            </div>
          )}
          
          <div className="flex justify-between mt-2">
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,video/*"
                id="post-media"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white/70 hover:text-white hover:bg-white/10"
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                <Image size={20} />
              </Button>
              <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
                <Smile size={20} />
              </Button>
            </div>
            <Button 
              className="bg-crimson hover:bg-crimson/80"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <Send size={16} className="mr-2" /> Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostForm;
