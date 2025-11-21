import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Récupérer l'utilisateur (optionnel)
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    const url = new URL(req.url);
    const flagKey = url.searchParams.get("key");

    if (!flagKey) {
      return new Response(
        JSON.stringify({ error: "Missing 'key' parameter" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Utiliser la fonction SQL pour vérifier le flag
    const { data, error } = await supabaseClient.rpc("check_feature_flag", {
      flag_key: flagKey,
      user_id: user?.id || null,
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({
        key: flagKey,
        enabled: data,
        user_id: user?.id || null,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in check-feature-flag:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

