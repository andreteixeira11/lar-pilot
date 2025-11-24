import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendCheckinLinkRequest {
  reservationId: string;
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

    const { reservationId }: SendCheckinLinkRequest = await req.json();
    console.log("Sending check-in link for reservation:", reservationId);

    // Get reservation details
    const { data: reservation, error: reservationError } = await supabaseClient
      .from("reservations")
      .select(`
        *,
        properties (
          name,
          address
        )
      `)
      .eq("id", reservationId)
      .single();

    if (reservationError || !reservation) {
      console.error("Error fetching reservation:", reservationError);
      return new Response(
        JSON.stringify({ error: "Reservation not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate token if it doesn't exist
    let token = reservation.checkin_token;
    if (!token) {
      const { data: tokenData } = await supabaseClient.rpc("generate_checkin_token");
      token = tokenData;

      // Update reservation with token
      const { error: updateError } = await supabaseClient
        .from("reservations")
        .update({ checkin_token: token })
        .eq("id", reservationId);

      if (updateError) {
        console.error("Error updating reservation with token:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to generate check-in link" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
    }

    // Get the app URL (use deployed URL or preview URL)
    const appUrl = Deno.env.get("SUPABASE_URL")?.replace("/v1", "") || "http://localhost:5173";
    const checkinUrl = `${appUrl.replace("wwqowftunxlqdfravppr.supabase.co", "lovable.app")}/checkin/${token}`;

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Monumenta <onboarding@resend.dev>",
      to: [reservation.guest_email],
      subject: `Check-in Online - ${reservation.properties.name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #bc941a 0%, #247d7f 100%);
                color: white;
                padding: 30px;
                border-radius: 10px 10px 0 0;
                text-align: center;
              }
              .content {
                background: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .button {
                display: inline-block;
                background: #bc941a;
                color: white !important;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
                font-weight: bold;
              }
              .details {
                background: white;
                padding: 20px;
                border-radius: 5px;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                color: #666;
                font-size: 12px;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Bem-vindo!</h1>
              <p>Está quase tudo pronto para a sua estadia</p>
            </div>
            <div class="content">
              <p>Olá ${reservation.guest_name},</p>
              
              <p>Para completar o seu check-in, precisamos que preencha alguns dados obrigatórios.</p>
              
              <div class="details">
                <h3>Detalhes da Reserva:</h3>
                <p><strong>Propriedade:</strong> ${reservation.properties.name}</p>
                <p><strong>Endereço:</strong> ${reservation.properties.address}</p>
                <p><strong>Check-in:</strong> ${new Date(reservation.check_in).toLocaleDateString('pt-PT')}</p>
                <p><strong>Check-out:</strong> ${new Date(reservation.check_out).toLocaleDateString('pt-PT')}</p>
                <p><strong>Número de Hóspedes:</strong> ${reservation.num_guests}</p>
              </div>
              
              <p>Clique no botão abaixo para preencher os dados de todos os hóspedes:</p>
              
              <center>
                <a href="${checkinUrl}" class="button">Fazer Check-in Online</a>
              </center>
              
              <p style="font-size: 12px; color: #666;">
                Se o botão não funcionar, copie e cole este link no seu navegador:<br>
                <a href="${checkinUrl}">${checkinUrl}</a>
              </p>
              
              <p>Aguardamos por si!</p>
            </div>
            <div class="footer">
              <p>Este é um email automático, por favor não responda.</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Link de check-in enviado com sucesso",
        checkinUrl 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-checkin-link function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
