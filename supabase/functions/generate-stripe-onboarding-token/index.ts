import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { create, verify } from 'https://deno.land/x/djwt@v2.8/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the user ID from the request body
    const { userId } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get the user's email from the auth.users table
    const { data: userData, error: userError } = await supabaseClient
      .from('auth.users')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Create a JWT token with the user's email
    const key = new TextEncoder().encode(Deno.env.get('JWT_SECRET'));
    const payload = {
      email: userData.email,
      userId: userId,
      timestamp: Date.now(),
      expiresIn: '1h', // Token expires in 1 hour
    };

    const token = await create({ alg: 'HS256', typ: 'JWT' }, payload, key);

    // Return the token
    return new Response(
      JSON.stringify({ token }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
}); 