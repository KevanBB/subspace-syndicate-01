
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, ensureBucketExists } from '@/integrations/supabase/client';
import { Album, AlbumPrivacy, AlbumTag } from '@/types/albums';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface CreateAlbumInput {
  title: string;
  description?: string;
  privacy: AlbumPrivacy;
  tags?: string[];
  coverImage?: File;
}

export const useAlbums = (userId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Get user id either from props or current user
  const targetUserId = userId || user?.id;

  // Fetch albums by user id
  const {
    data: albums,
    isLoading: isLoadingAlbums,
    error: albumsError,
    refetch: refetchAlbums
  } = useQuery({
    queryKey: ['albums', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];

      let query = supabase
        .from('albums')
        .select('*')
        .order('created_at', { ascending: false });

      // If viewing someone else's albums, only fetch public ones
      if (targetUserId !== user?.id) {
        query = query.eq('privacy', 'public');
      }

      // Add user filter
      query = query.eq('user_id', targetUserId);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching albums:', error);
        throw error;
      }

      return data as Album[];
    },
    enabled: !!targetUserId
  });

  // Create new album
  const createAlbum = async (input: CreateAlbumInput): Promise<Album | null> => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to create an album',
        variant: 'destructive'
      });
      return null;
    }

    setLoading(true);

    try {
      // First, check if album_media bucket exists
      const bucketExists = await ensureBucketExists('album_media');
      if (!bucketExists) {
        throw new Error('Album media storage is not available. Please try again later.');
      }

      let coverImageUrl = null;

      // Upload cover image if provided
      if (input.coverImage) {
        const fileExt = input.coverImage.name.split('.').pop();
        const filePath = `covers/${user.id}/${uuidv4()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('album_media')
          .upload(filePath, input.coverImage);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('album_media')
          .getPublicUrl(filePath);

        coverImageUrl = urlData.publicUrl;
      }

      // Insert album record
      const { data: albumData, error: albumError } = await supabase
        .from('albums')
        .insert({
          user_id: user.id,
          title: input.title,
          description: input.description || null,
          privacy: input.privacy,
          cover_image_url: coverImageUrl
        })
        .select()
        .single();

      if (albumError) throw albumError;

      // Add tags if provided
      if (input.tags && input.tags.length > 0 && albumData) {
        const tagPromises = input.tags.map(tag =>
          supabase
            .from('album_tags')
            .insert({
              album_id: albumData.id,
              tag: tag.toLowerCase().trim()
            })
        );

        await Promise.all(tagPromises);
      }

      // Refresh albums list
      queryClient.invalidateQueries({ queryKey: ['albums', user.id] });

      toast({
        title: 'Album created',
        description: 'Your album has been created successfully'
      });

      return albumData;
    } catch (error: any) {
      console.error('Error creating album:', error);
      toast({
        title: 'Failed to create album',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete album
  const deleteAlbum = async (albumId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to delete an album',
        variant: 'destructive'
      });
      return false;
    }

    setLoading(true);

    try {
      // Get all media in the album to delete from storage
      const { data: mediaItems } = await supabase
        .from('media')
        .select('url')
        .eq('album_id', albumId);

      // Delete the album (cascade will remove media entries from database)
      const { error: deleteError } = await supabase
        .from('albums')
        .delete()
        .eq('id', albumId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Clean up storage files
      if (mediaItems && mediaItems.length > 0) {
        // Extract paths from URLs
        const filePaths = mediaItems.map(item => {
          const url = new URL(item.url);
          return url.pathname.split('/').slice(-2).join('/');
        });

        // Delete files from storage
        if (filePaths.length > 0) {
          await supabase.storage
            .from('album_media')
            .remove(filePaths);
        }
      }

      // Refresh albums list
      queryClient.invalidateQueries({ queryKey: ['albums', user.id] });

      toast({
        title: 'Album deleted',
        description: 'Your album has been deleted successfully'
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting album:', error);
      toast({
        title: 'Failed to delete album',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update album
  const updateAlbum = async (
    albumId: string,
    updates: Partial<Omit<CreateAlbumInput, 'tags'>> & { tags?: string[] }
  ): Promise<Album | null> => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to update an album',
        variant: 'destructive'
      });
      return null;
    }

    setLoading(true);

    try {
      let coverImageUrl;

      // Upload new cover image if provided
      if (updates.coverImage) {
        const fileExt = updates.coverImage.name.split('.').pop();
        const filePath = `covers/${user.id}/${uuidv4()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('album_media')
          .upload(filePath, updates.coverImage);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('album_media')
          .getPublicUrl(filePath);

        coverImageUrl = urlData.publicUrl;
      }

      // Prepare update object
      const updateData: Record<string, any> = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.privacy !== undefined) updateData.privacy = updates.privacy;
      if (coverImageUrl) updateData.cover_image_url = coverImageUrl;

      // Update album record
      const { data: albumData, error: albumError } = await supabase
        .from('albums')
        .update(updateData)
        .eq('id', albumId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (albumError) throw albumError;

      // Update tags if provided
      if (updates.tags !== undefined) {
        // Delete existing tags
        await supabase
          .from('album_tags')
          .delete()
          .eq('album_id', albumId);

        // Add new tags
        if (updates.tags.length > 0) {
          const tagPromises = updates.tags.map(tag =>
            supabase
              .from('album_tags')
              .insert({
                album_id: albumId,
                tag: tag.toLowerCase().trim()
              })
          );

          await Promise.all(tagPromises);
        }
      }

      // Refresh albums list
      queryClient.invalidateQueries({ queryKey: ['albums', user.id] });
      queryClient.invalidateQueries({ queryKey: ['album', albumId] });

      toast({
        title: 'Album updated',
        description: 'Your album has been updated successfully'
      });

      return albumData;
    } catch (error: any) {
      console.error('Error updating album:', error);
      toast({
        title: 'Failed to update album',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Like/unlike album mutation
  const likeAlbumMutation = useMutation({
    mutationFn: async (albumId: string) => {
      if (!user) throw new Error('Authentication required');

      // Check if the user has already liked the album
      const { data: existingLike } = await supabase
        .from('album_likes')
        .select('id')
        .eq('album_id', albumId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Unlike: Remove the like
        await supabase
          .from('album_likes')
          .delete()
          .eq('album_id', albumId)
          .eq('user_id', user.id);

        // Decrement likes count
        await supabase.rpc('decrement_album_likes', { album_id: albumId });
        
        return { liked: false };
      } else {
        // Like: Add a new like
        await supabase
          .from('album_likes')
          .insert({
            album_id: albumId,
            user_id: user.id
          });

        // Increment likes count
        await supabase
          .from('albums')
          .update({ likes: supabase.rpc('increment_album_likes', { album_id: albumId }) })
          .eq('id', albumId);
        
        return { liked: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      queryClient.invalidateQueries({ queryKey: ['album-likes'] });
    }
  });

  // Check if user has liked an album
  const useAlbumLiked = (albumId: string) => {
    return useQuery({
      queryKey: ['album-likes', albumId, user?.id],
      queryFn: async () => {
        if (!user) return false;
        
        const { data } = await supabase
          .from('album_likes')
          .select('id')
          .eq('album_id', albumId)
          .eq('user_id', user.id)
          .single();
          
        return !!data;
      },
      enabled: !!user && !!albumId
    });
  };

  // Get album tags
  const useAlbumTags = (albumId: string) => {
    return useQuery({
      queryKey: ['album-tags', albumId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('album_tags')
          .select('*')
          .eq('album_id', albumId);
          
        if (error) throw error;
        
        return data as AlbumTag[];
      },
      enabled: !!albumId
    });
  };

  return {
    albums,
    isLoadingAlbums,
    albumsError,
    loading,
    createAlbum,
    deleteAlbum,
    updateAlbum,
    likeAlbum: (albumId: string) => likeAlbumMutation.mutate(albumId),
    useAlbumLiked,
    useAlbumTags,
    refetchAlbums
  };
};

// Get a single album by id
export const useAlbum = (albumId: string) => {
  const { user } = useAuth();
  
  const incrementView = async () => {
    if (!albumId) return;
    
    try {
      await supabase.rpc('increment_album_views', { album_id: albumId });
    } catch (error) {
      console.error('Error incrementing album views:', error);
    }
  };

  return useQuery({
    queryKey: ['album', albumId],
    queryFn: async () => {
      if (!albumId) throw new Error('Album ID is required');
      
      const { data, error } = await supabase
        .from('albums')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url,
            bdsm_role
          )
        `)
        .eq('id', albumId)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Album not found');
        }
        throw error;
      }
      
      // Only increment view for others' albums
      if (user?.id !== data.user_id) {
        incrementView();
      }
      
      return data as Album & {
        profiles: {
          username: string;
          avatar_url: string | null;
          bdsm_role: string;
        }
      };
    },
    enabled: !!albumId
  });
};
