
export interface Media {
  id: string;
  url: string;
  thumbnail_url?: string;
  file_name: string;
  file_type: string;
  file_size: number;
  width?: number;
  height?: number;
  duration?: number;
  description?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  album_id?: string;
  views: number;
  likes: number;
}

export interface Album {
  id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  privacy: AlbumPrivacy;
  created_at: string;
  updated_at: string;
  user_id: string;
  views: number;
  likes: number;
}

export type AlbumPrivacy = 'public' | 'private' | 'friends-only';

export interface MediaComment {
  id: string;
  media_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: {
    username: string;
    avatar_url?: string;
  };
}

export interface MediaBookmark {
  id: string;
  media_id: string;
  user_id: string;
  created_at: string;
}

export interface MediaLike {
  id: string;
  media_id: string;
  user_id: string;
  created_at: string;
}
