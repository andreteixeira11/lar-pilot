import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReservationNotificationRequest {
  reservationId: string;
  propertyId: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  numGuests: number;
  totalPrice: number;
  bookingSource?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      reservationId, 
      propertyId, 
      guestName, 
      checkIn, 
      checkOut, 
      numGuests, 
      totalPrice,
      bookingSource 
    }: ReservationNotificationRequest = await req.json();

    // Get property name
    const { data: property } = await supabase
      .from("properties")
      .select("name")
      .eq("id", propertyId)
      .single();

    const propertyName = property?.name || "Propriedade";

    // Find all owners associated with this property
    // First check the legacy property_owners table
    const { data: legacyOwners } = await supabase
      .from("property_owners")
      .select("id, name, email")
      .eq("property_id", propertyId);

    // Then check the owner_properties junction table
    const { data: junctionOwners } = await supabase
      .from("owner_properties")
      .select("owner_id, property_owners(id, name, email)")
      .eq("property_id", propertyId);

    // Build unique list of owners
    const ownersMap = new Map<string, { id: string; name: string; email: string }>();

    if (legacyOwners) {
      legacyOwners.forEach((owner) => {
        ownersMap.set(owner.id, { id: owner.id, name: owner.name, email: owner.email });
      });
    }

    if (junctionOwners) {
      junctionOwners.forEach((item: any) => {
        if (item.property_owners) {
          const owner = item.property_owners;
          ownersMap.set(owner.id, { id: owner.id, name: owner.name, email: owner.email });
        }
      });
    }

    const owners = Array.from(ownersMap.values());

    if (owners.length === 0) {
      console.log("No owners found for property:", propertyId);
      return new Response(
        JSON.stringify({ message: "No owners to notify" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Format dates
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString("pt-PT", { 
        weekday: "long", 
        day: "numeric", 
        month: "long", 
        year: "numeric" 
      });
    };

    // Calculate nights
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    const baseStyles = `
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .card { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { width: 60px; height: 60px; background: linear-gradient(135deg, #247d7f, #1a5c5e); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; font-size: 28px; }
        h1 { color: #18181b; font-size: 24px; margin: 0 0 8px 0; }
        .subtitle { color: #71717a; font-size: 14px; }
        .content { color: #3f3f46; font-size: 16px; line-height: 1.6; }
        .details-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin: 24px 0; }
        .details-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
        .details-row:last-child { border-bottom: none; }
        .details-label { color: #6b7280; font-size: 14px; }
        .details-value { color: #111827; font-weight: 600; font-size: 14px; text-align: right; }
        .highlight { background: linear-gradient(135deg, rgba(36, 125, 127, 0.1), rgba(36, 125, 127, 0.05)); padding: 20px; border-radius: 12px; border-left: 4px solid #247d7f; margin: 24px 0; }
        .highlight-value { font-size: 28px; font-weight: 700; color: #247d7f; }
        .button { display: inline-block; background: linear-gradient(135deg, #247d7f, #1a5c5e); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 500; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #a1a1aa; font-size: 12px; }
        .platform-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; background: #e5e7eb; color: #374151; }
      </style>
    `;

    // Send email to each owner
    const emailPromises = owners.map(async (owner) => {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">
                <div class="logo">🎉</div>
                <h1>Nova Reserva!</h1>
                <p class="subtitle">${propertyName}</p>
              </div>
              <div class="content">
                <p>Olá ${owner.name},</p>
                <p>Tem uma nova reserva na sua propriedade. Aqui estão os detalhes:</p>
                
                <div class="details-card">
                  <div class="details-row">
                    <span class="details-label">Hóspede</span>
                    <span class="details-value">${guestName}</span>
                  </div>
                  <div class="details-row">
                    <span class="details-label">Check-in</span>
                    <span class="details-value">${formatDate(checkIn)}</span>
                  </div>
                  <div class="details-row">
                    <span class="details-label">Check-out</span>
                    <span class="details-value">${formatDate(checkOut)}</span>
                  </div>
                  <div class="details-row">
                    <span class="details-label">Noites</span>
                    <span class="details-value">${nights}</span>
                  </div>
                  <div class="details-row">
                    <span class="details-label">Hóspedes</span>
                    <span class="details-value">${numGuests}</span>
                  </div>
                  ${bookingSource ? `
                  <div class="details-row">
                    <span class="details-label">Plataforma</span>
                    <span class="details-value"><span class="platform-badge">${bookingSource}</span></span>
                  </div>
                  ` : ''}
                </div>

                <div class="highlight">
                  <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Valor Total</p>
                  <p class="highlight-value" style="margin: 0;">€${totalPrice?.toFixed(2) || '0.00'}</p>
                </div>

                <center>
                  <a href="${Deno.env.get("SITE_URL") || "https://monumentalatlantic.pt"}/proprietario/reservas" class="button">
                    Ver no Portal
                  </a>
                </center>
              </div>
              <div class="footer">
                <p>Este email foi enviado automaticamente pelo sistema de gestão.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      return resend.emails.send({
        from: "Monumental Atlantic <noreply@monumentalatlantic.pt>",
        to: [owner.email],
        subject: `🎉 Nova reserva - ${guestName} | ${propertyName}`,
        html,
      });
    });

    const results = await Promise.all(emailPromises);
    console.log("Emails sent successfully:", results);

    return new Response(
      JSON.stringify({ success: true, notifiedOwners: owners.length }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-new-reservation-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
