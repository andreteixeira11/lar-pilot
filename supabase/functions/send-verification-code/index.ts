import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!email) {
      throw new Error("Email é obrigatório");
    }

    // Create Supabase client with service role for database access
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    if (action === "send") {
      if (!RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY not configured");
      }

      // Generate a 6-digit code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Delete any existing codes for this email
      await supabase
        .from("email_verification_codes")
        .delete()
        .eq("email", email.toLowerCase());

      // Store the code in the database
      const { error: insertError } = await supabase
        .from("email_verification_codes")
        .insert({
          email: email.toLowerCase(),
          code: verificationCode,
          expires_at: expiresAt.toISOString(),
          verified: false,
        });

      if (insertError) {
        console.error("Error storing verification code:", insertError);
        throw new Error("Erro ao guardar código de verificação");
      }

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

      // Fetch the stored code from database
      const { data: storedCode, error: fetchError } = await supabase
        .from("email_verification_codes")
        .select("*")
        .eq("email", email.toLowerCase())
        .eq("verified", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (fetchError || !storedCode) {
        console.log("No code found for email:", email);
        return new Response(
          JSON.stringify({ success: false, error: "Código não encontrado. Solicite um novo código." }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Check if code has expired
      if (new Date() > new Date(storedCode.expires_at)) {
        // Delete expired code
        await supabase
          .from("email_verification_codes")
          .delete()
          .eq("id", storedCode.id);

        return new Response(
          JSON.stringify({ success: false, error: "Código expirado. Solicite um novo código." }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Check if code matches
      if (storedCode.code !== code) {
        return new Response(
          JSON.stringify({ success: false, error: "Código inválido. Verifique e tente novamente." }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Code is valid - mark as verified and delete
      await supabase
        .from("email_verification_codes")
        .delete()
        .eq("id", storedCode.id);

      console.log("Email verified successfully:", email);

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
