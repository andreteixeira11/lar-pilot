import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");



const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface UpsellEmailRequest {
  guestEmail: string;
  guestName: string;
  status: 'confirmed' | 'rejected';
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  propertyName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { guestEmail, guestName, status, items, totalAmount, propertyName }: UpsellEmailRequest = await req.json();

    const isConfirmed = status === 'confirmed';
    const statusText = isConfirmed ? 'Confirmado' : 'Rejeitado';
    const statusColor = isConfirmed ? '#22c55e' : '#ef4444';
    const statusEmoji = isConfirmed ? '✅' : '❌';

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">€${item.price.toFixed(2)}</td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">
                ${statusEmoji} Pedido ${statusText}
              </h1>
            </div>
            
            <div style="padding: 30px;">
              <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
                Olá <strong>${guestName}</strong>,
              </p>
              
              <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
                ${isConfirmed 
                  ? 'O seu pedido de serviços adicionais foi <strong style="color: #22c55e;">confirmado</strong>! Entraremos em contacto consigo em breve com mais detalhes.'
                  : 'Lamentamos informar que o seu pedido de serviços adicionais foi <strong style="color: #ef4444;">rejeitado</strong>. Por favor contacte-nos se tiver alguma dúvida.'
                }
              </p>

              ${propertyName ? `
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
                  <strong>Alojamento:</strong> ${propertyName}
                </p>
              ` : ''}
              
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px;">Detalhes do Pedido</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background-color: #e5e7eb;">
                      <th style="padding: 8px; text-align: left; font-size: 14px;">Serviço</th>
                      <th style="padding: 8px; text-align: center; font-size: 14px;">Qtd</th>
                      <th style="padding: 8px; text-align: right; font-size: 14px;">Preço</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="2" style="padding: 12px 8px; font-weight: bold;">Total</td>
                      <td style="padding: 12px 8px; text-align: right; font-weight: bold; color: ${statusColor};">€${totalAmount.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  Obrigado por escolher os nossos serviços!
                </p>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Monumenta <onboarding@resend.dev>",
        to: [guestEmail],
        subject: `${statusEmoji} Pedido de Serviços ${statusText}`,
        html: emailHtml,
      }),
    });

    const emailResponse = await res.json();

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-upsell-status-email function:", error);
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
