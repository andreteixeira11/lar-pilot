import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ValidateSlugRequest {
  slug: string;
  propertyId?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { slug, propertyId }: ValidateSlugRequest = await req.json();

    // Validate slug format
    const slugRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;
    if (!slug || slug.length < 3 || slug.length > 50) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: "O slug deve ter entre 3 e 50 caracteres." 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!slugRegex.test(slug)) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: "O slug só pode conter letras minúsculas, números e hífens. Não pode começar ou terminar com hífen." 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Reserved slugs that cannot be used
    const reservedSlugs = [
      "admin", "api", "auth", "dashboard", "login", "signup", "register",
      "settings", "profile", "checkout", "payment", "booking", "reservas",
      "simulador", "subscriptions", "help", "support", "contact", "about",
      "privacy", "terms", "legal", "blog", "news", "pricing", "plans"
    ];

    if (reservedSlugs.includes(slug.toLowerCase())) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: "Este slug está reservado e não pode ser utilizado." 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if slug already exists (excluding current property if editing)
    let query = supabase
      .from("direct_booking_pages")
      .select("id, property_id")
      .eq("slug", slug.toLowerCase());

    if (propertyId) {
      query = query.neq("property_id", propertyId);
    }

    const { data: existingSlug, error: slugError } = await query.maybeSingle();

    if (slugError) {
      console.error("Error checking slug:", slugError);
      return new Response(
        JSON.stringify({ valid: false, error: "Erro ao validar slug." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (existingSlug) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: "Este slug já está a ser utilizado por outro alojamento." 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Slug "${slug}" validated successfully`);

    return new Response(
      JSON.stringify({ valid: true, slug: slug.toLowerCase() }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in validate-slug function:", error);
    return new Response(
      JSON.stringify({ valid: false, error: "Erro interno do servidor." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
