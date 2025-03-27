
import React, { useState, useRef } from 'react';
import { FileUploader } from '@/components/ui/file-uploader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Upload, X, FileImage, FileVideo, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MediaUploaderProps {
  albumId: string;
  onUpload: (file: File, description?: string) => Promise<void>;
  uploadProgress: Record<string, number>;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const MediaUploader: React.FC<MediaUploaderProps> = ({ albumId, onUpload, uploadProgress }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'File too large',
        description: `Maximum file size is 50MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`,
        variant: 'destructive'
      });
      return;
    }
    
    // Set selected file
    setSelectedFile(file);
    
    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setFilePreview(objectUrl);
    
    // Open dialog
    setIsDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    if (isUploading) return;
    
    setIsDialogOpen(false);
    
    // Clean up preview URL
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    
    // Reset state
    setSelectedFile(null);
    setDescription('');
  };
  
  const handleUpload = async () => {
    if (!selectedFile || isUploading) return;
    
    setIsUploading(true);
    
    try {
      await onUpload(selectedFile, description);
      
      // Reset state
      setSelectedFile(null);
      setDescription('');
      
      // Close dialog
      setIsDialogOpen(false);
      
      // Clean up preview URL
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
        setFilePreview(null);
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Get current upload progress
  const currentProgress = Object.values(uploadProgress)[0] || 0;
  
  return (
    <>
      <FileUploader
        accept="image/*,video/*"
        maxSize={50}
        onFilesSelected={handleFileSelect}
        multiple={false}
      >
        <Button variant="outline" className="w-full h-24">
          <Upload className="mr-2 h-5 w-5" />
          Upload Media
        </Button>
      </FileUploader>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
            <DialogDescription>
              Add this {selectedFile?.type.startsWith('image/') ? 'image' : 'video'} to your album
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            {filePreview && selectedFile && (
              <div className="relative">
                {selectedFile.type.startsWith('image/') ? (
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="w-full max-h-[300px] object-contain rounded-md"
                  />
                ) : selectedFile.type.startsWith('video/') ? (
                  <video
                    src={filePreview}
                    controls
                    className="w-full max-h-[300px] rounded-md"
                  />
                ) : (
                  <div className="w-full h-[200px] flex items-center justify-center bg-black/40 rounded-md">
                    <FileImage className="h-12 w-12 text-white/30" />
                  </div>
                )}
              </div>
            )}
            
            <div>
              <Textarea
                placeholder="Add a description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-black/30 border-white/20"
                rows={3}
              />
            </div>
            
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{currentProgress}%</span>
                </div>
                <Progress value={currentProgress} className="h-2" />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MediaUploader;
