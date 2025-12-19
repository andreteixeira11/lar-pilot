import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function formatDateForICal(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function generateUID(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@monumenta.pt`;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");

    if (!slug) {
      return new Response(JSON.stringify({ error: "Slug é obrigatório" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get page and property info
    const { data: page, error: pageError } = await supabase
      .from("direct_booking_pages")
      .select("id, title, property_id")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (pageError || !page) {
      console.error("Page not found:", pageError);
      return new Response(JSON.stringify({ error: "Página não encontrada" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get reservations for this property
    const { data: reservations, error: reservationsError } = await supabase
      .from("reservations")
      .select("id, check_in, check_out, guest_name, booking_source, status")
      .eq("property_id", page.property_id)
      .neq("status", "cancelled");

    if (reservationsError) {
      console.error("Error fetching reservations:", reservationsError);
      throw reservationsError;
    }

    // Get external calendar events
    const { data: externalEvents, error: externalError } = await supabase
      .from("external_calendar_events")
      .select("id, start_date, end_date, summary, source")
      .eq("page_id", page.id);

    if (externalError) {
      console.error("Error fetching external events:", externalError);
      throw externalError;
    }

    // Build iCal content
    const propertyName = page.title || "Propriedade";
    const now = new Date();
    const dtStamp = formatDateForICal(now) + "T" + 
      String(now.getUTCHours()).padStart(2, "0") +
      String(now.getUTCMinutes()).padStart(2, "0") +
      String(now.getUTCSeconds()).padStart(2, "0") + "Z";

    let icalContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Monumenta//Direct Booking//PT",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      `X-WR-CALNAME:${propertyName}`,
      "X-WR-TIMEZONE:Europe/Lisbon",
    ];

    // Add reservations as events
    reservations?.forEach((reservation) => {
      const checkIn = new Date(reservation.check_in);
      const checkOut = new Date(reservation.check_out);
      
      icalContent.push(
        "BEGIN:VEVENT",
        `UID:${generateUID()}`,
        `DTSTAMP:${dtStamp}`,
        `DTSTART;VALUE=DATE:${formatDateForICal(checkIn)}`,
        `DTEND;VALUE=DATE:${formatDateForICal(checkOut)}`,
        `SUMMARY:Reserva - ${reservation.guest_name || "Hóspede"}`,
        `DESCRIPTION:Fonte: ${reservation.booking_source || "Direta"}\\nStatus: ${reservation.status}`,
        "STATUS:CONFIRMED",
        "TRANSP:OPAQUE",
        "END:VEVENT"
      );
    });

    // Add external events
    externalEvents?.forEach((event) => {
      const startDate = new Date(event.start_date);
      const endDate = new Date(event.end_date);
      
      icalContent.push(
        "BEGIN:VEVENT",
        `UID:${generateUID()}`,
        `DTSTAMP:${dtStamp}`,
        `DTSTART;VALUE=DATE:${formatDateForICal(startDate)}`,
        `DTEND;VALUE=DATE:${formatDateForICal(endDate)}`,
        `SUMMARY:${event.summary || "Bloqueado"}`,
        `DESCRIPTION:Fonte: ${event.source}`,
        "STATUS:CONFIRMED",
        "TRANSP:OPAQUE",
        "END:VEVENT"
      );
    });

    icalContent.push("END:VCALENDAR");

    const icalString = icalContent.join("\r\n");

    console.log(`Generated iCal for ${slug} with ${reservations?.length || 0} reservations and ${externalEvents?.length || 0} external events`);

    return new Response(icalString, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${slug}.ics"`,
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error generating iCal:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
