
import { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface PostMedia {
  id: string;
  url: string;
  type: 'image' | 'video' | 'gif';
  aspectRatio?: number;
  duration?: number;
  file?: File;
  previewUrl?: string;
}

export const MAX_MEDIA_ITEMS = 5;
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime'];

export const useMediaManager = (setError: (error: string | null) => void) => {
  const [mediaItems, setMediaItems] = useState<PostMedia[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isValidFileType = (file: File): boolean => {
    return [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].includes(file.type);
  };
  
  const isValidFileSize = (file: File): boolean => {
    if (file.type.includes('video')) {
      return file.size <= MAX_VIDEO_SIZE;
    }
    return file.size <= MAX_IMAGE_SIZE;
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
  
  const handleRemoveMedia = (id: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== id));
  };
  
  const handleReorderMedia = (dragIndex: number, hoverIndex: number) => {
    setMediaItems(prev => {
      const newItems = [...prev];
      const draggedItem = newItems[dragIndex];
      newItems.splice(dragIndex, 1);
      newItems.splice(hoverIndex, 0, draggedItem);
      return newItems;
    });
  };
  
  const resetMediaItems = () => {
    setMediaItems([]);
  };
  
  return {
    mediaItems,
    setMediaItems,
    fileInputRef,
    handleFileSelect,
    handleRemoveMedia,
    handleReorderMedia,
    resetMediaItems
  };
};
