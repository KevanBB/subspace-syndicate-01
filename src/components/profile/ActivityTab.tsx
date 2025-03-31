
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ensureNonNullString } from '@/utils/typeUtils';
import { parseDateSafe } from '@/utils/typeUtils';
import { format } from 'date-fns';

interface ActivityTabProps {
  userId: string;
}

interface Activity {
  id: string;
  type: 'media' | 'video' | 'post';
  content: string;
  created_at: string;
  reference_id: string;
}

const ActivityTab: React.FC<ActivityTabProps> = ({ userId }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserActivity();
    }
  }, [userId]);

  const fetchUserActivity = async () => {
    setIsLoading(true);
    try {
      // Fetch recent posts
      const { data: posts } = await supabase
        .from('posts')
        .select('id, content, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent media uploads
      const { data: media } = await supabase
        .from('media')
        .select('id, file_name, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent videos
      const { data: videos } = await supabase
        .from('videos')
        .select('id, title, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      // Transform the data
      const postActivities = (posts || []).map(post => ({
        id: `post-${post.id}`,
        type: 'post' as const,
        content: post.content?.substring(0, 100) || 'New post',
        created_at: ensureNonNullString(post.created_at),
        reference_id: post.id
      }));

      const mediaActivities = (media || []).map(item => ({
        id: `media-${item.id}`,
        type: 'media' as const,
        content: `Uploaded ${item.file_name || 'a file'}`,
        created_at: ensureNonNullString(item.created_at),
        reference_id: item.id
      }));

      const videoActivities = (videos || []).map(video => ({
        id: `video-${video.id}`,
        type: 'video' as const,
        content: `Uploaded video: ${video.title || 'Untitled'}`,
        created_at: ensureNonNullString(video.created_at),
        reference_id: video.id
      }));

      // Combine and sort by date
      const allActivities = [...postActivities, ...mediaActivities, ...videoActivities];
      allActivities.sort((a, b) => 
        parseDateSafe(b.created_at).getTime() - parseDateSafe(a.created_at).getTime()
      );

      setActivities(allActivities);
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-muted-foreground">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map(activity => (
        <Card key={activity.id} className="hover:bg-background/5 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant={
                      activity.type === 'post' ? 'default' : 
                      activity.type === 'media' ? 'secondary' : 
                      'success'
                    }
                  >
                    {activity.type}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {format(parseDateSafe(activity.created_at), 'PPP p')}
                  </p>
                </div>
                <p className="line-clamp-2">{activity.content}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ActivityTab;
