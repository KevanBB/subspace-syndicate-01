
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
      const filePath = `community/${roomId}/${fileName}`;
      
      const options = {
        cacheControl: '3600',
        upsert: false
      };
      
      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, file, options);
      
      if (error) throw error;
      
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
