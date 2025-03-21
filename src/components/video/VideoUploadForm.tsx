
import React, { useState, useRef, useEffect } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { FileVideo, Image as ImageIcon, X, Upload, Loader2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type VideoVisibility = 'public' | 'private' | 'unlisted';

const VideoUploadForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<VideoVisibility>('public');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPageLeaveDialogOpen, setIsPageLeaveDialogOpen] = useState(false);
  const [leavePage, setLeavePage] = useState(false);
  const [leaveDestination, setLeaveDestination] = useState('');
  
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Prevent navigation if upload is in progress
  useEffect(() => {
    const preventNavigation = (e: BeforeUnloadEvent) => {
      if (uploading) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', preventNavigation);
    
    return () => {
      window.removeEventListener('beforeunload', preventNavigation);
    };
  }, [uploading]);

  // Handle attempted navigation
  const handleNavigation = (destination: string) => {
    if (uploading) {
      setLeaveDestination(destination);
      setIsPageLeaveDialogOpen(true);
      return false;
    }
    return true;
  };

  // Effect to navigate if confirmed
  useEffect(() => {
    if (leavePage && leaveDestination) {
      navigate(leaveDestination);
    }
  }, [leavePage, leaveDestination, navigate]);

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
      setUploadProgress(0);
      
      // Generate unique IDs for storage paths
      const videoId = uuidv4();
      const videoFileName = `${videoId}.${videoFile.name.split('.').pop()}`;
      const videoPath = `${user.id}/${videoFileName}`;
      
      // Upload video to storage with progress tracking
      const xhr = new XMLHttpRequest();
      
      // Set up progress tracking
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      });
      
      // Create a promise to track the XHR upload
      const uploadPromise = new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
      });
      
      // Get the upload URL from Supabase
      const { data: uploadData } = await supabase.storage.from('videos').createSignedUploadUrl(videoPath);
      
      if (!uploadData?.signedUrl) {
        throw new Error('Failed to get upload URL');
      }
      
      // Configure XHR request
      xhr.open('PUT', uploadData.signedUrl);
      xhr.setRequestHeader('Content-Type', videoFile.type);
      xhr.send(videoFile);
      
      // Wait for upload to complete
      await uploadPromise;
      
      // Get video URL
      const { data: videoUrl } = supabase.storage.from('videos').getPublicUrl(videoPath);

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
      setVisibility('public');
      setTags([]);
      setCurrentTag('');
      
      // Navigate to My Content page
      navigate('/subspacetv/my-content');
      
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
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white/70">Uploading...</span>
                  <span className="text-sm font-medium text-white">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
                <div className="flex items-center p-3 bg-black/40 rounded-md border border-white/10">
                  <AlertTriangle className="h-5 w-5 text-amber-400 mr-2" />
                  <p className="text-sm text-white/80">
                    Please do not close this page until your video is fully uploaded
                  </p>
                </div>
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

      {/* Alert Dialog for preventing navigation */}
      <AlertDialog open={isPageLeaveDialogOpen} onOpenChange={setIsPageLeaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upload in Progress</AlertDialogTitle>
            <AlertDialogDescription>
              Your video is still uploading. If you leave now, the upload will be canceled.
              Are you sure you want to leave?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay on Page</AlertDialogCancel>
            <AlertDialogAction onClick={() => setLeavePage(true)}>
              Leave Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VideoUploadForm;
