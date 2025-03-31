import { useState } from 'react';
import { supabase, ensureBucketExists } from '@/integrations/supabase/client';

interface UseMediaUploadProps {
  roomId: string;
}

export const useMediaUpload = ({ roomId }: UseMediaUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadMedia = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Check if media bucket exists before trying to upload
      const bucketExists = await ensureBucketExists('media');
      
      if (!bucketExists) {
        throw new Error("Media storage is not available. Please try again later or contact support.");
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
      const filePath = `community/${roomId}/${fileName}`;
      
      // Get a signed URL for upload
      const { data: uploadData } = await supabase.storage
        .from('media')
        .createSignedUploadUrl(filePath);
      
      if (!uploadData?.signedUrl) {
        throw new Error('Failed to get upload URL');
      }

      // Use XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest();
      
      const uploadPromise = new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentComplete);
          }
        });

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Upload failed'));
      });

      xhr.open('PUT', uploadData.signedUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);

      await uploadPromise;
      
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);
      
      return { url: publicUrl, type: mediaType };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    selectedFile,
    setSelectedFile,
    isUploading,
    uploadProgress,
    uploadMedia
  };
};
