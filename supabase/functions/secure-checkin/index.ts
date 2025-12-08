import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GetReservationRequest {
  token: string;
}

interface SubmitGuestRequest {
  token: string;
  guests: Array<{
    nome_completo: string;
    data_nascimento?: string;
    local_nascimento?: string;
    nacionalidade?: string;
    local_residencia?: string;
    pais_residencia: string;
    tipo_documento?: string;
    numero_documento?: string;
    pais_emissor?: string;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const url = new URL(req.url);
    const action = url.pathname.split("/").pop();

    if (req.method === "GET" || action === "get-reservation") {
      const token = url.searchParams.get("token");
      
      if (!token) {
        return new Response(
          JSON.stringify({ error: "Token is required" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      console.log("Fetching reservation with token:", token);

      // Get reservation with the specific token
      const { data: reservation, error } = await supabaseClient
        .from("reservations")
        .select(`
          id,
          guest_name,
          guest_email,
          check_in,
          check_out,
          num_guests,
          num_nights,
          status,
          properties (
            name,
            address,
            check_in_time,
            check_out_time,
            wifi_password
          ),
          reservation_guests (
            id,
            nome_completo,
            data_nascimento,
            local_nascimento,
            nacionalidade,
            local_residencia,
            pais_residencia,
            tipo_documento,
            numero_documento,
            pais_emissor
          )
        `)
        .eq("checkin_token", token)
        .single();

      if (error || !reservation) {
        console.error("Error fetching reservation:", error);
        return new Response(
          JSON.stringify({ error: "Reservation not found or invalid token" }),
          { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ reservation }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (req.method === "POST") {
      const body: SubmitGuestRequest = await req.json();
      const { token, guests } = body;

      if (!token || !guests || guests.length === 0) {
        return new Response(
          JSON.stringify({ error: "Token and guests are required" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      console.log("Submitting guests for token:", token, "Guests count:", guests.length);

      // Verify the token and get reservation
      const { data: reservation, error: reservationError } = await supabaseClient
        .from("reservations")
        .select("id, num_guests")
        .eq("checkin_token", token)
        .single();

      if (reservationError || !reservation) {
        console.error("Invalid token:", reservationError);
        return new Response(
          JSON.stringify({ error: "Invalid check-in token" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Delete existing guests for this reservation (to allow re-submission)
      await supabaseClient
        .from("reservation_guests")
        .delete()
        .eq("reservation_id", reservation.id);

      // Insert new guests
      const guestsToInsert = guests.map((guest) => ({
        reservation_id: reservation.id,
        nome_completo: guest.nome_completo,
        data_nascimento: guest.data_nascimento || null,
        local_nascimento: guest.local_nascimento || null,
        nacionalidade: guest.nacionalidade || null,
        local_residencia: guest.local_residencia || null,
        pais_residencia: guest.pais_residencia,
        tipo_documento: guest.tipo_documento || null,
        numero_documento: guest.numero_documento || null,
        pais_emissor: guest.pais_emissor || null,
      }));

      const { error: insertError } = await supabaseClient
        .from("reservation_guests")
        .insert(guestsToInsert);

      if (insertError) {
        console.error("Error inserting guests:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to save guest information" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      console.log("Successfully saved", guests.length, "guests for reservation", reservation.id);

      return new Response(
        JSON.stringify({ success: true, message: "Check-in completed successfully" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in secure-checkin function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
