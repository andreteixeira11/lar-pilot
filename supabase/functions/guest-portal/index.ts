import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (req.method === "GET") {
      const url = new URL(req.url);
      const token = url.searchParams.get("token");

      if (!token) {
        return new Response(
          JSON.stringify({ error: "Token is required" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Get reservation with property details and guests
      const { data: reservation, error: resError } = await supabase
        .from("reservations")
        .select(`
          id, guest_name, guest_email, check_in, check_out, num_guests, num_nights, status,
          properties (id, name, address, check_in_time, check_out_time, wifi_password),
          reservation_guests (id, nome_completo)
        `)
        .eq("checkin_token", token)
        .single();

      if (resError || !reservation) {
        return new Response(
          JSON.stringify({ error: "Reservation not found" }),
          { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Get guidebook for this property
      const { data: guidebook } = await supabase
        .from("guidebooks")
        .select("id, title")
        .eq("property_id", (reservation as any).properties?.id)
        .eq("is_published", true)
        .maybeSingle();

      // Get guest requests
      const { data: requests } = await supabase
        .from("guest_requests")
        .select("*")
        .eq("reservation_id", reservation.id)
        .order("created_at", { ascending: false });

      return new Response(
        JSON.stringify({ reservation, guidebook, requests: requests || [] }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { token, action, request_type, message } = body;

      if (!token) {
        return new Response(
          JSON.stringify({ error: "Token is required" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Verify token
      const { data: reservation, error: resError } = await supabase
        .from("reservations")
        .select("id")
        .eq("checkin_token", token)
        .single();

      if (resError || !reservation) {
        return new Response(
          JSON.stringify({ error: "Invalid token" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      if (action === "create_request") {
        const { data: request, error: insertError } = await supabase
          .from("guest_requests")
          .insert({
            reservation_id: reservation.id,
            request_type: request_type || "other",
            message: message || "",
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating request:", insertError);
          return new Response(
            JSON.stringify({ error: "Failed to create request" }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        return new Response(
          JSON.stringify({ request }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Unknown action" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in guest-portal:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
