import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple in-memory store for verification codes
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

interface VerificationRequest {
  action: "send" | "verify";
  email: string;
  code?: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, email, code }: VerificationRequest = await req.json();
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!email) {
      throw new Error("Email é obrigatório");
    }

    if (action === "send") {
      if (!RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY not configured");
      }

      // Generate a 6-digit code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      // Store the code
      verificationCodes.set(email.toLowerCase(), { code: verificationCode, expiresAt });

      console.log(`Sending verification code to ${email}`);

      // Send email with the code using fetch
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Monumenta Atlantic <noreply@monumentalatlantic.pt>",
          to: [email],
          subject: "Código de Verificação - Monumenta Atlantic",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
              <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <img src="https://atlantic.lovable.app/logos/monumenta-logo.svg" alt="Monumenta Atlantic" style="height: 60px;">
                  </div>
                  
                  <h1 style="color: #1a1a1a; font-size: 24px; text-align: center; margin-bottom: 20px;">
                    Verifique o seu email
                  </h1>
                  
                  <p style="color: #666; font-size: 16px; text-align: center; margin-bottom: 30px;">
                    Use o código abaixo para verificar o seu endereço de email:
                  </p>
                  
                  <div style="background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%); border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
                    <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: white; font-family: monospace;">
                      ${verificationCode}
                    </span>
                  </div>
                  
                  <p style="color: #999; font-size: 14px; text-align: center; margin-bottom: 20px;">
                    Este código expira em <strong>10 minutos</strong>.
                  </p>
                  
                  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                  
                  <p style="color: #999; font-size: 12px; text-align: center;">
                    Se não solicitou este código, pode ignorar este email.
                  </p>
                </div>
                
                <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
                  © ${new Date().getFullYear()} Monumenta Atlantic. Todos os direitos reservados.
                </p>
              </div>
            </body>
            </html>
          `,
        }),
      });

      const emailResult = await emailResponse.json();
      console.log("Verification email sent:", emailResult);

      if (!emailResponse.ok) {
        throw new Error(emailResult.message || "Failed to send email");
      }

      return new Response(
        JSON.stringify({ success: true, message: "Código enviado com sucesso" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } else if (action === "verify") {
      if (!code) {
        throw new Error("Código é obrigatório");
      }

      const stored = verificationCodes.get(email.toLowerCase());

      if (!stored) {
        return new Response(
          JSON.stringify({ success: false, error: "Código não encontrado. Solicite um novo código." }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      if (Date.now() > stored.expiresAt) {
        verificationCodes.delete(email.toLowerCase());
        return new Response(
          JSON.stringify({ success: false, error: "Código expirado. Solicite um novo código." }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      if (stored.code !== code) {
        return new Response(
          JSON.stringify({ success: false, error: "Código inválido. Verifique e tente novamente." }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Code is valid - remove it from store
      verificationCodes.delete(email.toLowerCase());

      return new Response(
        JSON.stringify({ success: true, verified: true }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    throw new Error("Ação inválida");
  } catch (error: unknown) {
    console.error("Verification error:", error);
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
