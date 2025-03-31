import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

interface ProcessVideoRequest {
  videoId: string;
}

interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  format: string;
  bitrate: number;
}

serve(async (req) => {
  let videoId: string | undefined;

  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      });
    }

    const { videoId: requestVideoId } = await req.json() as ProcessVideoRequest;
    videoId = requestVideoId;

    if (!videoId) {
      throw new Error('Video ID is required');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get video record
    const { data: video, error: videoError } = await supabaseClient
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single();

    if (videoError) throw videoError;
    if (!video) throw new Error('Video not found');

    // Extract video URL
    const videoUrl = video.video_url;
    if (!videoUrl) throw new Error('Video URL not found');

    // Extract video path from URL
    const videoPath = videoUrl.split('/').slice(-2).join('/'); // Gets user_id/filename

    // Update video status to processing
    await supabaseClient
      .from('videos')
      .update({ status: 'processing' })
      .eq('id', videoId);

    // Download video file
    const { data: videoData, error: downloadError } = await supabaseClient.storage
      .from('videos')
      .download(videoPath);

    if (downloadError) throw downloadError;
    if (!videoData) throw new Error('Failed to download video');

    // Extract metadata from the video file
    const metadata: VideoMetadata = {
      duration: 0, // We'll need to implement duration extraction
      width: 0,    // We'll need to implement dimension extraction
      height: 0,   // We'll need to implement dimension extraction
      format: videoData.type.split('/')[1] || 'unknown',
      bitrate: 0,  // We'll need to implement bitrate calculation
    };

    // Generate thumbnail path
    const thumbnailPath = videoPath.replace(/\.[^/.]+$/, '-thumb.jpg');

    // For now, we'll use the first frame of the video as thumbnail
    // This is a placeholder - in production, you'd want to use FFmpeg or similar
    const thumbnailUrl = videoUrl.replace(/\.[^/.]+$/, '-thumb.jpg');

    // Update video record with metadata and thumbnail
    const { error: updateError } = await supabaseClient
      .from('videos')
      .update({
        status: 'ready',
        thumbnail_url: thumbnailUrl,
        duration: metadata.duration,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        bitrate: metadata.bitrate,
      })
      .eq('id', videoId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Video processing completed',
        videoId,
        metadata,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );

  } catch (error) {
    console.error('Error processing video:', error);

    // Update video status to failed if we have a videoId
    if (videoId) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabaseClient
        .from('videos')
        .update({ 
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error occurred'
        })
        .eq('id', videoId);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
