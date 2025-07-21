
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
    const { action, userRole } = await req.json();
    
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

    if (action === "create_freight" && userRole === "company") {
      // Verificar se empresa pode criar fretes
      const { data: subscription } = await supabaseClient
        .from("subscriptions")
        .select(`
          *,
          subscription_plans (
            freight_limit,
            name,
            slug
          )
        `)
        .eq("user_id", userId)
        .eq("status", "active")
        .single();

      if (!subscription) {
        return new Response(JSON.stringify({ 
          canAccess: false, 
          reason: "no_subscription",
          message: "Você precisa de uma assinatura ativa para criar fretes."
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Verificar se está em trial
      const isTrialing = subscription.subscription_plans.slug === 'company-trial';
      
      if (isTrialing && subscription.trial_ends_at) {
        const trialEnd = new Date(subscription.trial_ends_at);
        if (new Date() > trialEnd) {
          return new Response(JSON.stringify({ 
            canAccess: false, 
            reason: "trial_expired",
            message: "Seu período de trial expirou. Faça upgrade para continuar criando fretes."
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      // Verificar limite de fretes (se não for ilimitado)
      const freightLimit = subscription.subscription_plans.freight_limit;
      if (freightLimit !== -1) {
        const { count: freightCount } = await supabaseClient
          .from("fretes")
          .select("*", { count: "exact", head: true })
          .eq("company_id", userId);

        if (freightCount && freightCount >= freightLimit) {
          return new Response(JSON.stringify({ 
            canAccess: false, 
            reason: "freight_limit_reached",
            message: `Você atingiu o limite de ${freightLimit} fretes do seu plano. Faça upgrade para criar mais fretes.`
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      return new Response(JSON.stringify({ 
        canAccess: true,
        subscription: subscription.subscription_plans
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "view_contacts" && userRole === "driver") {
      // Verificar se motorista pode ver contatos
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

      // Buscar driver_id
      const { data: driver } = await supabaseClient
        .from("drivers")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (!driver) {
        return new Response(JSON.stringify({ 
          canAccess: false, 
          reason: "no_driver_profile",
          message: "Perfil de motorista não encontrado."
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Usar a função do banco para verificar limite
      const { data: remainingViews, error } = await supabaseClient
        .rpc("check_driver_contact_limit", { driver_user_id: userId });

      if (error) {
        console.error("Error checking contact limit:", error);
        return new Response(JSON.stringify({ 
          canAccess: false, 
          reason: "check_error",
          message: "Erro ao verificar limite de contatos."
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (remainingViews === 0) {
        return new Response(JSON.stringify({ 
          canAccess: false, 
          reason: "contact_limit_reached",
          message: "Você atingiu o limite de visualizações de contatos deste mês. Faça upgrade para ver mais contatos."
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ 
        canAccess: true,
        remainingViews: remainingViews === -1 ? "unlimited" : remainingViews
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ 
      canAccess: false, 
      reason: "invalid_action",
      message: "Ação não reconhecida."
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });

  } catch (error) {
    console.error("Error in check-subscription-access:", error);
    return new Response(JSON.stringify({ 
      canAccess: false, 
      reason: "server_error",
      message: "Erro interno do servidor."
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
