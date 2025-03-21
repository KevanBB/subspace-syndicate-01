
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Image, 
  Smile, 
  Send, 
  X, 
  Bold, 
  Italic, 
  Underline, 
  Heading, 
  List, 
  ListOrdered 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { Input } from '@/components/ui/input';

const PostForm: React.FC = () => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Rich text state and handlers
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setMediaFiles(prev => [...prev, ...newFiles]);
      
      // Generate previews for all selected files
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeMediaFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const applyTextFormat = (format: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let formattedText = '';
    let cursorPosition = 0;
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        cursorPosition = start + 2;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        cursorPosition = start + 1;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        cursorPosition = start + 2;
        break;
      case 'heading':
        formattedText = `## ${selectedText}`;
        cursorPosition = start + 3;
        break;
      case 'list':
        formattedText = `\n- ${selectedText}`;
        cursorPosition = start + 3;
        break;
      case 'ordered-list':
        formattedText = `\n1. ${selectedText}`;
        cursorPosition = start + 4;
        break;
    }
    
    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
    
    // Set focus back to textarea and cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + formattedText.length,
        start + formattedText.length
      );
    }, 0);
  };

  const handleSubmit = async () => {
    if (!content.trim() && mediaFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please enter some content or select files to post",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let mediaUrls: string[] = [];
      let mediaTypes: string[] = [];

      // Upload all files
      if (mediaFiles.length > 0) {
        const uploadPromises = mediaFiles.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const filePath = `${user!.id}/${uuidv4()}.${fileExt}`;
          
          // Determine media type
          let mediaType = 'other';
          if (file.type.startsWith('image/')) {
            mediaType = 'image';
          } else if (file.type.startsWith('video/')) {
            mediaType = 'video';
          }
          
          const { error: uploadError, data } = await supabase.storage
            .from('post_media')
            .upload(filePath, file);

          if (uploadError) {
            throw uploadError;
          }

          // Get the public URL
          const { data: { publicUrl } } = supabase.storage
            .from('post_media')
            .getPublicUrl(filePath);
            
          return { url: publicUrl, type: mediaType };
        });

        const uploadResults = await Promise.all(uploadPromises);
        mediaUrls = uploadResults.map(result => result.url);
        mediaTypes = uploadResults.map(result => result.type);
      }

      // Insert the post
      const { error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: user!.id,
          content: content.trim(),
          media_url: mediaUrls.length > 0 ? mediaUrls.join(',') : null,
          media_type: mediaTypes.length > 0 ? mediaTypes.join(',') : null
        });

      if (insertError) {
        throw insertError;
      }

      // Clear form after successful submission
      setContent('');
      setMediaFiles([]);
      setPreviews([]);
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
          {/* Rich text toolbar */}
          <div className="bg-black/30 border-white/10 border rounded-t-md p-2 flex gap-1 flex-wrap">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8"
              onClick={() => applyTextFormat('bold')}
              type="button"
            >
              <Bold size={16} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8"
              onClick={() => applyTextFormat('italic')}
              type="button"
            >
              <Italic size={16} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8"
              onClick={() => applyTextFormat('underline')}
              type="button"
            >
              <Underline size={16} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8"
              onClick={() => applyTextFormat('heading')}
              type="button"
            >
              <Heading size={16} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8"
              onClick={() => applyTextFormat('list')}
              type="button"
            >
              <List size={16} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8"
              onClick={() => applyTextFormat('ordered-list')}
              type="button"
            >
              <ListOrdered size={16} />
            </Button>
          </div>
          
          <Textarea 
            placeholder="What's on your mind?" 
            className="bg-black/30 border-white/10 border-t-0 rounded-t-none resize-none text-white placeholder:text-white/50 min-h-[120px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            ref={textareaRef}
          />
          
          {/* Preview area for selected media */}
          {previews.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {previews.map((preview, index) => (
                <div key={index} className="relative rounded-md overflow-hidden">
                  <img src={preview} alt={`Preview ${index}`} className="h-32 w-full object-cover rounded-md" />
                  <Button 
                    variant="destructive" 
                    size="icon"
                    className="absolute top-2 right-2 w-6 h-6 opacity-90 rounded-full"
                    onClick={() => removeMediaFile(index)}
                  >
                    <X size={14} />
                  </Button>
                </div>
              ))}
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
                multiple
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
