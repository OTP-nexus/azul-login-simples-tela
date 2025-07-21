
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
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

    if (!user?.email) {
      throw new Error('Usuário não autenticado');
    }

    const { planId, paymentMethod } = await req.json();

    // Verificar se é um plano válido para motorista
    const { data: plan, error: planError } = await supabaseClient
      .from('subscription_plans')
      .select('*')
      .eq('slug', planId)
      .eq('target_user_type', 'driver')
      .eq('is_active', true)
      .single();

    if (planError || !plan) {
      throw new Error('Plano não encontrado');
    }

    // Inicializar Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Verificar se cliente existe no Stripe
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // Criar novo cliente
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
          plan_type: 'driver'
        }
      });
      customerId = customer.id;
    }

    // Calcular preço baseado no método de pagamento
    let finalPrice = plan.price_monthly;
    if (paymentMethod === 'pix') {
      finalPrice = finalPrice * 0.9; // 10% desconto para PIX
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Plano ${plan.name} - Motorista`,
              description: 'Acesso completo aos contatos das empresas',
              metadata: {
                plan_id: plan.id,
                user_type: 'driver'
              }
            },
            unit_amount: Math.round(finalPrice * 100), // Converter para centavos
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/driver/subscription?success=true`,
      cancel_url: `${req.headers.get('origin')}/driver/plans?canceled=true`,
      metadata: {
        user_id: user.id,
        plan_id: plan.id,
        payment_method: paymentMethod
      }
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro no checkout:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
