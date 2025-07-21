
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Verificar usuário autenticado
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { action, resourceType } = await req.json();

    // Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw new Error('Perfil não encontrado');
    }

    // Buscar assinatura atual
    const { data: subscription, error: subError } = await supabaseClient
      .from('subscriptions')
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (subError) {
      console.error('Erro ao buscar assinatura:', subError);
    }

    let canAccess = false;
    let reason = '';
    let remainingLimit = 0;

    // Verificar acesso baseado no tipo de usuário e ação
    if (profile.role === 'company') {
      if (action === 'create_freight') {
        if (subscription) {
          // Verificar se está em trial válido
          const isInTrial = subscription.plan.slug === 'company-trial' && 
                           subscription.trial_ends_at && 
                           new Date(subscription.trial_ends_at) > new Date();
          
          // Verificar se tem plano pago ativo
          const hasPaidPlan = subscription.plan.price_monthly > 0;
          
          canAccess = isInTrial || hasPaidPlan;
          reason = canAccess ? '' : 'Trial expirado. Escolha um plano pago para continuar.';
        } else {
          reason = 'Nenhuma assinatura encontrada.';
        }
      }
    } else if (profile.role === 'driver') {
      if (action === 'view_contact') {
        // Verificar limite de visualizações
        const { data: remainingViews } = await supabaseClient
          .rpc('check_driver_contact_limit', { driver_user_id: user.id });
        
        remainingLimit = remainingViews || 0;
        canAccess = remainingLimit > 0 || 
                   (subscription && subscription.plan.contact_views_limit === -1);
        reason = canAccess ? '' : 'Limite de visualizações atingido. Faça upgrade para o plano Premium.';
      }
    }

    return new Response(JSON.stringify({
      canAccess,
      reason,
      remainingLimit,
      subscription: subscription ? {
        plan: subscription.plan.name,
        status: subscription.status
      } : null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro na verificação de acesso:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
