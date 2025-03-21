
import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { FileUploader } from '@/components/ui/file-uploader';
import { Tag, Upload, FileVideo, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { v4 as uuidv4 } from 'uuid';

type VideoVisibility = 'public' | 'private' | 'unlisted';
type VideoCategory = 'tutorial' | 'scene' | 'event' | 'other';

const VideoUploadForm = () => {
  const { user } = useAuth();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<VideoCategory>('other');
  const [visibility, setVisibility] = useState<VideoVisibility>('public');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const tagInputRef = useRef<HTMLInputElement>(null);

  const handleVideoSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      // Check if the file type is supported
      if (!['video/mp4', 'video/quicktime', 'video/avi', 'video/x-msvideo'].includes(file.type)) {
        toast({
          title: "Unsupported video format",
          description: "Please upload an MP4, MOV, or AVI file.",
          variant: "destructive"
        });
        return;
      }
      setVideoFile(file);
    }
  };

  const handleThumbnailSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      // Check if the file type is an image
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Unsupported file format",
          description: "Please upload an image file for the thumbnail.",
          variant: "destructive"
        });
        return;
      }
      
      setThumbnailFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && currentTag.trim() !== '') {
      event.preventDefault();
      if (!tags.includes(currentTag.trim()) && tags.length < 5) {
        setTags([...tags, currentTag.trim()]);
        setCurrentTag('');
      } else if (tags.length >= 5) {
        toast({
          title: "Too many tags",
          description: "You can only add up to 5 tags.",
          variant: "destructive"
        });
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleUpload = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload videos.",
        variant: "destructive"
      });
      return;
    }

    if (!videoFile) {
      toast({
        title: "Video required",
        description: "Please select a video to upload.",
        variant: "destructive"
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for your video.",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      
      // Generate unique IDs for storage paths
      const videoId = uuidv4();
      const videoFileName = `${videoId}.${videoFile.name.split('.').pop()}`;
      const videoPath = `${user.id}/${videoFileName}`;
      
      // Upload video to storage
      const { error: videoUploadError, data: videoData } = await supabase.storage
        .from('videos')
        .upload(videoPath, videoFile, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percentage = Math.round((progress.loaded / progress.total) * 100);
            setUploadProgress(percentage);
          }
        });

      if (videoUploadError) throw videoUploadError;

      // Get video URL
      const { data: videoUrl } = supabase.storage
        .from('videos')
        .getPublicUrl(videoPath);

      // Handle thumbnail
      let thumbnailUrl = null;
      if (thumbnailFile) {
        const thumbnailFileName = `${videoId}-thumb.${thumbnailFile.name.split('.').pop()}`;
        const thumbnailPath = `${user.id}/${thumbnailFileName}`;
        
        const { error: thumbnailUploadError } = await supabase.storage
          .from('videos')
          .upload(thumbnailPath, thumbnailFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (thumbnailUploadError) throw thumbnailUploadError;

        const { data: thumbUrl } = supabase.storage
          .from('videos')
          .getPublicUrl(thumbnailPath);

        thumbnailUrl = thumbUrl.publicUrl;
      }

      // Save video metadata to database
      const { error: insertError } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          title,
          description,
          video_url: videoUrl.publicUrl,
          thumbnail_url: thumbnailUrl,
          category,
          visibility,
          tags: tags.join(','),
          duration: 0, // This would be set by a processing function in a real app
          status: 'processing' // Initially set to processing until a backend job completes processing
        });

      if (insertError) throw insertError;

      // Success
      toast({
        title: "Upload successful!",
        description: "Your video has been uploaded and is being processed.",
      });
      
      // Reset form
      setVideoFile(null);
      setThumbnailFile(null);
      setThumbnailPreview(null);
      setTitle('');
      setDescription('');
      setCategory('other');
      setVisibility('public');
      setTags([]);
      setCurrentTag('');
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your video.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Upload New Video</h2>
        <p className="text-white/70">Share your BDSM tutorials, scenes, or event recordings with the community.</p>
      </div>

      {!videoFile ? (
        <div 
          className="border-2 border-dashed border-white/20 rounded-lg p-12 text-center cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => document.getElementById('video-upload')?.click()}
        >
          <FileVideo className="mx-auto h-16 w-16 text-white/40 mb-4" />
          <p className="text-white/70 mb-2">Drag and drop or click to upload</p>
          <p className="text-white/50 text-sm mb-4">MP4, MOV, or AVI (max 500MB)</p>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" /> Select Video
          </Button>
          <input
            id="video-upload"
            type="file"
            accept="video/mp4,video/quicktime,video/avi,video/x-msvideo"
            onChange={(e) => handleVideoSelect(e.target.files)}
            className="hidden"
          />
        </div>
      ) : (
        <div className="border border-white/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileVideo className="h-8 w-8 text-crimson mr-3" />
              <div>
                <p className="text-white font-medium">{videoFile.name}</p>
                <p className="text-white/50 text-sm">
                  {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setVideoFile(null)}
              disabled={uploading}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Enter title for your video"
              className="bg-black/30 border-white/20 text-white"
              disabled={uploading}
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Describe your video"
              className="bg-black/30 border-white/20 text-white min-h-[120px]"
              disabled={uploading}
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category</Label>
            <Select 
              value={category} 
              onValueChange={(value: VideoCategory) => setCategory(value)}
              disabled={uploading}
            >
              <SelectTrigger className="bg-black/30 border-white/20 text-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tutorial">Tutorial</SelectItem>
                <SelectItem value="scene">Scene</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="tags">Tags (up to 5)</Label>
            <div className="flex items-center gap-2 mb-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-white/50" />
              <Input 
                ref={tagInputRef}
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tags and press Enter"
                className="bg-black/30 border-white/20 text-white"
                disabled={uploading || tags.length >= 5}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label>Thumbnail</Label>
            {!thumbnailPreview ? (
              <div 
                className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => document.getElementById('thumbnail-upload')?.click()}
              >
                <ImageIcon className="mx-auto h-10 w-10 text-white/40 mb-2" />
                <p className="text-white/50 text-sm">Upload a custom thumbnail</p>
                <input
                  id="thumbnail-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleThumbnailSelect(e.target.files)}
                  className="hidden"
                  disabled={uploading}
                />
              </div>
            ) : (
              <div className="relative">
                <img 
                  src={thumbnailPreview} 
                  alt="Thumbnail preview" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={() => {
                    setThumbnailFile(null);
                    setThumbnailPreview(null);
                  }}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          <div>
            <Label>Visibility</Label>
            <Select 
              value={visibility} 
              onValueChange={(value: VideoVisibility) => setVisibility(value)}
              disabled={uploading}
            >
              <SelectTrigger className="bg-black/30 border-white/20 text-white">
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public (Everyone can see)</SelectItem>
                <SelectItem value="unlisted">Unlisted (Only those with the link)</SelectItem>
                <SelectItem value="private">Private (Only you can see)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="pt-4">
            {uploading ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white/70">Uploading...</span>
                  <span className="text-sm font-medium text-white">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2.5">
                  <div 
                    className="bg-crimson h-2.5 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-white/50 mt-2">
                  Please do not close this page while your video is uploading
                </p>
              </div>
            ) : (
              <Button 
                className="w-full"
                onClick={handleUpload}
                disabled={!videoFile || !title.trim() || uploading}
              >
                <Upload className="mr-2 h-4 w-4" /> Upload Video
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoUploadForm;
