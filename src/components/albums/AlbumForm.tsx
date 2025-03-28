import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileUploader } from '@/components/ui/file-uploader';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { AlbumPrivacy, Album } from '@/types/albums';

interface AlbumFormProps {
  onSubmit: (values: FormValues) => Promise<void>;
  defaultValues?: Partial<FormValues>;
  isEditing?: boolean;
  isLoading?: boolean;
  onCancel?: () => void;
}

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().optional(),
  privacy: z.enum(['public', 'private', 'friends-only']),
  tags: z.array(z.string()).optional(),
  coverImage: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AlbumForm: React.FC<AlbumFormProps> = ({ 
  onSubmit, 
  defaultValues, 
  isEditing = false,
  isLoading = false,
  onCancel
}) => {
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [currentTag, setCurrentTag] = useState('');
  const tagInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      privacy: defaultValues?.privacy || 'public',
      tags: defaultValues?.tags || [],
      coverImage: undefined,
    },
  });

  const handleCoverImageSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      form.setValue('coverImage', file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveCoverImage = () => {
    form.setValue('coverImage', undefined);
    if (coverImagePreview) {
      URL.revokeObjectURL(coverImagePreview);
      setCoverImagePreview(null);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentTag.trim() !== '') {
      e.preventDefault();
      const tags = form.getValues('tags') || [];
      if (!tags.includes(currentTag.trim())) {
        form.setValue('tags', [...tags, currentTag.trim()]);
        setCurrentTag('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    const tags = form.getValues('tags') || [];
    form.setValue('tags', tags.filter(tag => tag !== tagToRemove));
  };

  const handleFormSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Album Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter album title" 
                  {...field} 
                  className="bg-black/30 border-white/20"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your album (optional)" 
                  {...field} 
                  className="bg-black/30 border-white/20 min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="privacy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Privacy</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="bg-black/30 border-white/20">
                    <SelectValue placeholder="Select privacy setting" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="public">Public (Everyone can see)</SelectItem>
                  <SelectItem value="friends-only">Friends Only</SelectItem>
                  <SelectItem value="private">Private (Only you can see)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription className="text-white/60">
                Control who can view your album
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Tags</FormLabel>
          <div className="flex flex-wrap gap-2 mb-2">
            {form.watch('tags')?.map(tag => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeTag(tag)}
                />
              </Badge>
            ))}
          </div>
          <Input
            ref={tagInputRef}
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Add tags and press Enter"
            className="bg-black/30 border-white/20"
          />
          <p className="text-xs text-white/60 mt-1">
            Tags help others discover your album
          </p>
        </div>

        <div>
          <FormLabel>Cover Image</FormLabel>
          {!coverImagePreview ? (
            <FileUploader
              accept="image/*"
              maxSize={10}
              onFilesSelected={handleCoverImageSelect}
              className="mt-1"
            >
              <Button variant="outline" type="button" className="w-full h-[120px]">
                <ImageIcon className="h-5 w-5 mr-2" />
                {isEditing ? 'Change Cover Image' : 'Upload Cover Image'}
              </Button>
            </FileUploader>
          ) : (
            <div className="relative mt-1">
              <img 
                src={coverImagePreview} 
                alt="Cover preview" 
                className="rounded-md h-[120px] w-full object-cover"
              />
              <Button 
                variant="secondary" 
                size="icon" 
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                onClick={handleRemoveCoverImage}
                type="button"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          
          <Button 
            type="submit" 
            className="flex-1" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>Loading...</>
            ) : isEditing ? (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Save Changes
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Create Album
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AlbumForm;
