
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

interface WebhookPayload {
  type: string;
  table: string;
  record: any;
  schema: string;
}

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      },
      status: 204,
    })
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // Create the post_media bucket if it doesn't exist
    const { data: bucket, error: bucketError } = await supabaseAdmin
      .storage
      .createBucket('post_media', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: [
          'image/jpeg',
          'image/png', 
          'image/gif', 
          'image/webp', 
          'video/mp4', 
          'video/quicktime'
        ]
      })
      
    if (bucketError && !bucketError.message.includes('already exists')) {
      throw bucketError
    }
    
    // Set up RLS policies for the bucket
    // Allow authenticated users to upload to the bucket
    const { error: policyError1 } = await supabaseAdmin.rpc('create_storage_policy', {
      bucket_name: 'post_media',
      policy_name: 'authenticated users can upload',
      definition: 'auth.role() = \'authenticated\'',
      operation: 'INSERT'
    })
    
    // Allow everyone to read from the bucket
    const { error: policyError2 } = await supabaseAdmin.rpc('create_storage_policy', {
      bucket_name: 'post_media',
      policy_name: 'everyone can read',
      definition: 'true',
      operation: 'SELECT'
    })
    
    // Allow users to delete their own media
    const { error: policyError3 } = await supabaseAdmin.rpc('create_storage_policy', {
      bucket_name: 'post_media',
      policy_name: 'users can delete own media',
      definition: 'auth.uid() = SPLIT_PART(name, \'/\', 1)::uuid',
      operation: 'DELETE'
    })
    
    // Allow users to update their own media
    const { error: policyError4 } = await supabaseAdmin.rpc('create_storage_policy', {
      bucket_name: 'post_media',
      policy_name: 'users can update own media',
      definition: 'auth.uid() = SPLIT_PART(name, \'/\', 1)::uuid',
      operation: 'UPDATE'
    })
    
    if (policyError1 || policyError2 || policyError3 || policyError4) {
      console.error('Policy errors:', { policyError1, policyError2, policyError3, policyError4 })
    }
    
    return new Response(
      JSON.stringify({ success: true, message: 'Media storage bucket created successfully' }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' 
        },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error creating media bucket:', error)
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        status: 500 
      }
    )
  }
})
