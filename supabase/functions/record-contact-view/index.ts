
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { freightId } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("User not authenticated");

    const userId = userData.user.id;

    // Buscar driver_id
    const { data: driver, error: driverError } = await supabaseClient
      .from("drivers")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (driverError || !driver) {
      throw new Error("Driver not found");
    }

    // Verificar se o motorista tem um plano ativo
    const { data: subscription, error: subError } = await supabaseClient
      .from("subscriptions")
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    let contactLimit = 5; // Limite padrão do plano gratuito
    
    if (subscription && subscription.plan) {
      contactLimit = subscription.plan.contact_views_limit;
    }

    // Se tem limite ilimitado, não precisa verificar
    if (contactLimit !== -1) {
      // Verificar quantas visualizações já foram feitas este mês
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const { data: existingViews, error: viewsError } = await supabaseClient
        .from("driver_contact_views")
        .select("id")
        .eq("driver_id", driver.id)
        .eq("month_year", currentMonth);

      if (viewsError) {
        throw new Error(`Error checking views: ${viewsError.message}`);
      }

      const viewsCount = existingViews ? existingViews.length : 0;
      
      // Verificar se já atingiu o limite
      if (viewsCount >= contactLimit) {
        throw new Error("Contact view limit exceeded");
      }
    }

    // Buscar dados do frete
    const { data: freight, error: freightError } = await supabaseClient
      .from("fretes")
      .select("company_id")
      .eq("id", freightId)
      .single();

    if (freightError || !freight) {
      throw new Error("Freight not found");
    }

    // Verificar se já visualizou este frete este mês
    const currentMonth = new Date().toISOString().slice(0, 7);
    const { data: existingView } = await supabaseClient
      .from("driver_contact_views")
      .select("id")
      .eq("driver_id", driver.id)
      .eq("freight_id", freightId)
      .eq("month_year", currentMonth)
      .single();

    if (existingView) {
      // Já visualizou, só retorna sucesso
      return new Response(JSON.stringify({ success: true, alreadyViewed: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Registrar nova visualização
    const { error: insertError } = await supabaseClient
      .from("driver_contact_views")
      .insert({
        driver_id: driver.id,
        company_id: freight.company_id,
        freight_id: freightId,
        month_year: currentMonth,
        viewed_at: new Date().toISOString()
      });

    if (insertError) {
      throw new Error(`Failed to record view: ${insertError.message}`);
    }

    return new Response(JSON.stringify({ success: true, alreadyViewed: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in record-contact-view:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Internal server error"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
