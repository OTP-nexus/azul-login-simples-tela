import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Verificar usuário autenticado
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error('Usuário não autenticado');
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      throw new Error('Session ID é obrigatório');
    }

    // Inicializar Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Verificar sessão no Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      throw new Error('Pagamento não foi confirmado');
    }

    // Verificar se já temos a assinatura no banco
    const { data: existingSubscription } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('stripe_customer_id', session.customer)
      .single();

    if (existingSubscription) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Assinatura já existe',
        subscription: existingSubscription 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Se não existe, processar manualmente
    const userId = session.metadata.user_id || user.id;
    const planId = session.metadata.plan_id;

    if (!planId) {
      throw new Error('Plan ID não encontrado nos metadados da sessão');
    }

    // Buscar o plano
    const { data: plan, error: planError } = await supabaseClient
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      throw new Error('Plano não encontrado');
    }

    // Criar assinatura
    let subscriptionData;
    if (session.subscription) {
      const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription);
      subscriptionData = {
        user_id: userId,
        plan_id: planId,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        status: stripeSubscription.status === 'trialing' ? 'trialing' : 'active',
        current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
        trial_ends_at: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000).toISOString() : null,
      };
    } else {
      subscriptionData = {
        user_id: userId,
        plan_id: planId,
        stripe_customer_id: session.customer,
        stripe_subscription_id: null,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
    }

    const { data: newSubscription, error: subscriptionError } = await supabaseClient
      .from('subscriptions')
      .insert(subscriptionData)
      .select()
      .single();

    if (subscriptionError) {
      throw new Error(`Erro ao criar assinatura: ${subscriptionError.message}`);
    }

    // Registrar pagamento
    if (session.payment_intent) {
      await supabaseClient
        .from('payments')
        .insert({
          subscription_id: newSubscription.id,
          stripe_payment_intent_id: session.payment_intent,
          amount: session.amount_total / 100,
          currency: session.currency || 'brl',
          status: 'succeeded',
          payment_method: session.payment_method_types?.[0] || 'card'
        });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Assinatura criada com sucesso',
      subscription: newSubscription 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro na verificação de pagamento:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});