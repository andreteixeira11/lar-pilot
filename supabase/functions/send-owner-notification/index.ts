import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "new_document" | "monthly_report" | "password_reset";
  ownerEmail: string;
  ownerName: string;
  propertyName: string;
  documentName?: string;
  reportMonth?: string;
  resetLink?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, ownerEmail, ownerName, propertyName, documentName, reportMonth, resetLink }: NotificationRequest = await req.json();

    let subject = "";
    let html = "";

    const baseStyles = `
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .card { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { width: 60px; height: 60px; background: #8b5cf6; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; }
        .logo svg { width: 32px; height: 32px; color: white; }
        h1 { color: #18181b; font-size: 24px; margin: 0 0 8px 0; }
        .subtitle { color: #71717a; font-size: 14px; }
        .content { color: #3f3f46; font-size: 16px; line-height: 1.6; }
        .button { display: inline-block; background: #8b5cf6; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 500; margin: 20px 0; }
        .button:hover { background: #7c3aed; }
        .footer { text-align: center; margin-top: 30px; color: #a1a1aa; font-size: 12px; }
        .highlight { background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 20px 0; }
      </style>
    `;

    if (type === "new_document") {
      subject = `Novo documento disponível - ${propertyName}`;
      html = `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">
                <div class="logo">🏠</div>
                <h1>Novo Documento Disponível</h1>
                <p class="subtitle">${propertyName}</p>
              </div>
              <div class="content">
                <p>Olá ${ownerName},</p>
                <p>Foi adicionado um novo documento à sua propriedade:</p>
                <div class="highlight">
                  <strong>📄 ${documentName}</strong>
                </div>
                <p>Pode visualizar e descarregar este documento no Portal do Proprietário.</p>
                <center>
                  <a href="${Deno.env.get("SITE_URL") || "https://monumentalatlantic.pt"}/proprietario" class="button">Ver no Portal</a>
                </center>
              </div>
              <div class="footer">
                <p>Este email foi enviado automaticamente.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (type === "monthly_report") {
      subject = `Relatório mensal disponível - ${reportMonth}`;
      html = `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">
                <div class="logo">📊</div>
                <h1>Relatório Mensal Disponível</h1>
                <p class="subtitle">${propertyName}</p>
              </div>
              <div class="content">
                <p>Olá ${ownerName},</p>
                <p>O relatório mensal de <strong>${reportMonth}</strong> para a sua propriedade já está disponível.</p>
                <p>Consulte o Portal do Proprietário para ver:</p>
                <ul>
                  <li>Resumo de receitas e despesas</li>
                  <li>Taxa de ocupação</li>
                  <li>Lucro estimado</li>
                </ul>
                <center>
                  <a href="${Deno.env.get("SITE_URL") || "https://monumentalatlantic.pt"}/proprietario/relatorios" class="button">Ver Relatório</a>
                </center>
              </div>
              <div class="footer">
                <p>Este email foi enviado automaticamente.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (type === "password_reset") {
      subject = `Redefinir password - Portal do Proprietário`;
      html = `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">
                <div class="logo">🔐</div>
                <h1>Redefinir Password</h1>
                <p class="subtitle">Portal do Proprietário</p>
              </div>
              <div class="content">
                <p>Olá ${ownerName},</p>
                <p>Recebemos um pedido para redefinir a password da sua conta no Portal do Proprietário.</p>
                <p>Clique no botão abaixo para criar uma nova password:</p>
                <center>
                  <a href="${resetLink}" class="button">Redefinir Password</a>
                </center>
                <p style="color: #71717a; font-size: 14px;">Este link expira em 1 hora.</p>
                <p style="color: #71717a; font-size: 14px;">Se não solicitou esta alteração, pode ignorar este email.</p>
              </div>
              <div class="footer">
                <p>Este email foi enviado automaticamente.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "Monumental Atlantic <noreply@monumentalatlantic.pt>",
      to: [ownerEmail],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-owner-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
