
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Image, Film, X, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const MediaTab: React.FC = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const selectedFiles = Array.from(e.target.files);
    const newMediaFiles = [...mediaFiles, ...selectedFiles];
    setMediaFiles(newMediaFiles);
    
    // Create preview URLs
    const newPreviewUrls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviewUrls]);
  };
  
  const removeFile = (index: number) => {
    const newMediaFiles = [...mediaFiles];
    newMediaFiles.splice(index, 1);
    setMediaFiles(newMediaFiles);
    
    const newPreviewUrls = [...previewUrls];
    URL.revokeObjectURL(newPreviewUrls[index]);
    newPreviewUrls.splice(index, 1);
    setPreviewUrls(newPreviewUrls);
  };
  
  const uploadFiles = async () => {
    if (!user || mediaFiles.length === 0) return;
    
    setUploading(true);
    
    try {
      for (let i = 0; i < mediaFiles.length; i++) {
        const file = mediaFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}-${i}.${fileExt}`;
        const filePath = `user-media/${fileName}`;
        
        // Upload file to the media bucket
        const { error } = await supabase.storage
          .from('media')
          .upload(filePath, file);
          
        if (error) throw error;
      }
      
      toast({
        title: "Upload successful",
        description: `${mediaFiles.length} file(s) uploaded successfully.`,
      });
      
      // Clear selected files after upload
      mediaFiles.forEach((_, i) => URL.revokeObjectURL(previewUrls[i]));
      setMediaFiles([]);
      setPreviewUrls([]);
      
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <Button variant="outline" className="border-white/20 bg-black/30 text-white hover:bg-white/10">
          <Image size={18} className="mr-2" /> Photos
        </Button>
        <Button variant="outline" className="border-white/20 bg-black/30 text-white hover:bg-white/10">
          <Film size={18} className="mr-2" /> Videos
        </Button>
      </div>
      
      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white">Media Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          {previewUrls.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group aspect-square rounded-md overflow-hidden">
                    <img 
                      src={url} 
                      alt={`Preview ${index}`} 
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => document.getElementById('media-upload')?.click()}
                >
                  Add More
                </Button>
                <Button 
                  onClick={uploadFiles} 
                  disabled={uploading}
                  className="bg-crimson hover:bg-crimson/80"
                >
                  {uploading ? "Uploading..." : "Upload All"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="min-h-[200px] flex flex-col items-center justify-center border border-dashed border-white/20 rounded-md p-8">
              <Upload className="h-10 w-10 text-white/40 mb-3" />
              <p className="text-white/70 text-center">No media uploaded yet</p>
              <Button 
                className="mt-4 bg-crimson hover:bg-crimson/80"
                onClick={() => document.getElementById('media-upload')?.click()}
              >
                Upload Media
              </Button>
            </div>
          )}
          
          <input
            id="media-upload"
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </CardContent>
      </Card>
      
      <Alert className="bg-amber-900/20 border-amber-500/30 text-amber-200">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Uploaded media is subject to community guidelines. Please ensure your content is appropriate.
        </AlertDescription>
      </Alert>
      
      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white">Recent Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">When you upload photos and videos, they'll appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MediaTab;
