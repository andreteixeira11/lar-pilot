import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface BookingRequest {
  page_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  check_in: string;
  check_out: string;
  num_guests: number;
  message?: string;
  total_price?: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: BookingRequest = await req.json();

    // Validate required fields
    if (!body.page_id || !body.guest_name || !body.guest_email || !body.check_in || !body.check_out) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate guest_name (2-100 characters, trim whitespace)
    const guestName = body.guest_name.trim();
    if (guestName.length < 2 || guestName.length > 100) {
      return new Response(
        JSON.stringify({ error: "Nome deve ter entre 2 e 100 caracteres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const guestEmail = body.guest_email.trim().toLowerCase();
    if (!emailRegex.test(guestEmail) || guestEmail.length > 255) {
      return new Response(
        JSON.stringify({ error: "Email inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate phone (optional, max 20 characters)
    const guestPhone = body.guest_phone?.trim();
    if (guestPhone && guestPhone.length > 20) {
      return new Response(
        JSON.stringify({ error: "Telefone demasiado longo" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate message (optional, max 1000 characters)
    const message = body.message?.trim();
    if (message && message.length > 1000) {
      return new Response(
        JSON.stringify({ error: "Mensagem demasiado longa (máximo 1000 caracteres)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate num_guests (1-20)
    const numGuests = body.num_guests;
    if (!Number.isInteger(numGuests) || numGuests < 1 || numGuests > 20) {
      return new Response(
        JSON.stringify({ error: "Número de hóspedes inválido (1-20)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate dates
    const checkIn = new Date(body.check_in);
    const checkOut = new Date(body.check_out);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return new Response(
        JSON.stringify({ error: "Datas inválidas" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (checkIn < today) {
      return new Response(
        JSON.stringify({ error: "Data de check-in não pode ser no passado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (checkOut <= checkIn) {
      return new Response(
        JSON.stringify({ error: "Data de check-out deve ser após check-in" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify page exists and is published
    const { data: pageData, error: pageError } = await supabase
      .from("direct_booking_pages")
      .select("id, is_published")
      .eq("id", body.page_id)
      .single();

    if (pageError || !pageData) {
      return new Response(
        JSON.stringify({ error: "Página de reservas não encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!pageData.is_published) {
      return new Response(
        JSON.stringify({ error: "Página de reservas não está disponível" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert the booking request
    const { data: insertData, error: insertError } = await supabase
      .from("direct_booking_requests")
      .insert({
        page_id: body.page_id,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone || null,
        check_in: body.check_in,
        check_out: body.check_out,
        num_guests: numGuests,
        message: message || null,
        total_price: body.total_price || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Erro ao criar pedido de reserva" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Booking request created:", insertData.id);

    return new Response(
      JSON.stringify({ success: true, id: insertData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});