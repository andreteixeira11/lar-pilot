import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");

    if (!slug) {
      return new Response(
        JSON.stringify({ error: "Slug is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the booking page with property info
    const { data: page, error: pageError } = await supabase
      .from("direct_booking_pages")
      .select(`
        *,
        property:properties (
          id,
          name,
          address,
          capacity,
          bedrooms,
          bathrooms,
          check_in_time,
          check_out_time,
          user_id
        )
      `)
      .eq("slug", slug.toLowerCase())
      .eq("is_published", true)
      .maybeSingle();

    if (pageError) {
      console.error("Error fetching page:", pageError);
      return new Response(
        JSON.stringify({ error: "Erro ao carregar página." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!page) {
      return new Response(
        JSON.stringify({ error: "Página não encontrada.", notFound: true }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if owner has premium subscription
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("subscription_plan")
      .eq("id", page.property.user_id)
      .maybeSingle();

    if (profileError || !profile) {
      console.error("Error fetching profile:", profileError);
      return new Response(
        JSON.stringify({ error: "Erro ao validar página." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (profile.subscription_plan !== "premium") {
      return new Response(
        JSON.stringify({ 
          error: "Esta página não está disponível de momento.",
          subscriptionExpired: true 
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get existing reservations for availability check
    const { data: reservations, error: reservationsError } = await supabase
      .from("reservations")
      .select("check_in, check_out")
      .eq("property_id", page.property_id)
      .gte("check_out", new Date().toISOString().split("T")[0]);

    if (reservationsError) {
      console.error("Error fetching reservations:", reservationsError);
    }

    // Get dynamic pricing for this page
    const { data: dynamicPricing, error: pricingError } = await supabase
      .from("dynamic_pricing")
      .select("*")
      .eq("page_id", page.id)
      .gte("end_date", new Date().toISOString().split("T")[0])
      .order("start_date", { ascending: true });

    if (pricingError) {
      console.error("Error fetching dynamic pricing:", pricingError);
    }

    // Get external calendar events (from Booking/Airbnb iCal sync)
    const { data: externalEvents, error: externalError } = await supabase
      .from("external_calendar_events")
      .select("*")
      .eq("page_id", page.id)
      .gte("end_date", new Date().toISOString().split("T")[0]);

    if (externalError) {
      console.error("Error fetching external events:", externalError);
    }

    console.log(`Public page "${slug}" fetched with ${dynamicPricing?.length || 0} pricing rules, ${externalEvents?.length || 0} external events`);

    // Remove sensitive data before sending
    const { property, ...pageData } = page;
    const safeProperty = {
      name: property.name,
      address: property.address,
      capacity: property.capacity,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
    };

    return new Response(
      JSON.stringify({ 
        page: { ...pageData, property: safeProperty },
        bookedDates: reservations || [],
        dynamicPricing: dynamicPricing || [],
        externalEvents: externalEvents || []
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in get-public-page function:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});