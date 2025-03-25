import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { corsHeaders } from "../_shared/cors.ts";

interface SpinWheelRequest {
  user_id: string;
  dom_id: string;
  min_amount: number;
  max_amount: number;
  segments: number;
  spin_duration: number;
}

interface SpinWheelResponse {
  amount: number;
  all_segments: number[];
  spin_id: string;
}

// Generate a cryptographically secure random number between min and max
function secureRandom(min: number, max: number): number {
  // Generate a random value between 0 and 1
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const randomValue = array[0] / (0xffffffff + 1); // Normalize to [0, 1)
  
  // Scale to the desired range and round to 2 decimal places
  return Math.round((min + randomValue * (max - min)) * 100) / 100;
}

// Generate all segment values
function generateSegmentValues(min: number, max: number, segments: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < segments; i++) {
    result.push(secureRandom(min, max));
  }
  return result;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const requestData: SpinWheelRequest = await req.json();
    const { user_id, dom_id, min_amount, max_amount, segments, spin_duration } = requestData;

    // Input validation
    if (!user_id || !dom_id) {
      return new Response(JSON.stringify({ error: "Missing user_id or dom_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (typeof min_amount !== "number" || typeof max_amount !== "number" || 
        typeof segments !== "number" || typeof spin_duration !== "number") {
      return new Response(JSON.stringify({ error: "Invalid input types" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (min_amount >= max_amount) {
      return new Response(JSON.stringify({ error: "Minimum amount must be less than maximum amount" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (segments < 2 || segments > 12) {
      return new Response(JSON.stringify({ error: "Number of segments must be between 2 and 12" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (spin_duration < 2 || spin_duration > 10) {
      return new Response(JSON.stringify({ error: "Spin duration must be between 2 and 10 seconds" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify that the dom_id exists and is a Dominant
    const { data: domData, error: domError } = await supabase
      .from("profiles")
      .select("id, username, user_role")
      .eq("id", dom_id)
      .single();

    if (domError || !domData) {
      return new Response(JSON.stringify({ error: "Dominant not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (domData.user_role !== "creator") {
      return new Response(JSON.stringify({ error: "Selected user is not a Dominant/Creator" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate segment values
    const segmentValues = generateSegmentValues(min_amount, max_amount, segments);
    
    // Select a random winning segment
    const winningIndex = Math.floor(Math.random() * segments);
    const winningAmount = segmentValues[winningIndex];

    // Store the spin in the database for record keeping
    const { data: spinData, error: spinError } = await supabase
      .from("wheel_spins")
      .insert([
        {
          user_id,
          dom_id,
          min_amount,
          max_amount,
          segments,
          spin_duration,
          winning_amount: winningAmount,
          status: "pending", // Will be updated to "paid" once the payment is processed
        },
      ])
      .select()
      .single();

    if (spinError) {
      console.error("Error storing spin data:", spinError);
      return new Response(JSON.stringify({ error: "Failed to store spin data" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response: SpinWheelResponse = {
      amount: winningAmount,
      all_segments: segmentValues,
      spin_id: spinData.id,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Spin wheel error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
