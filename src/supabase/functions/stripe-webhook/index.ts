
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature');
  const body = await req.text();
  
  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || '',
      undefined,
      cryptoProvider
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  );

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object, supabaseClient);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object, supabaseClient);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object, supabaseClient);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, supabaseClient);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Internal error', { status: 500 });
  }
});

async function handleCheckoutCompleted(session: any, supabaseClient: any) {
  const userId = session.metadata.user_id;
  const planId = session.metadata.plan_id;
  
  if (!userId || !planId) {
    console.error('Missing user_id or plan_id in session metadata');
    return;
  }

  // Buscar o plano
  const { data: plan, error: planError } = await supabaseClient
    .from('subscription_plans')
    .select('*')
    .eq('id', planId)
    .single();

  if (planError) {
    console.error('Error fetching plan:', planError);
    return;
  }

  // Criar ou atualizar assinatura
  const subscriptionData = {
    user_id: userId,
    plan_id: planId,
    stripe_customer_id: session.customer,
    stripe_subscription_id: session.subscription,
    status: 'active',
    current_period_start: new Date().toISOString(),
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
  };

  const { error: subscriptionError } = await supabaseClient
    .from('subscriptions')
    .upsert(subscriptionData, { onConflict: 'user_id' });

  if (subscriptionError) {
    console.error('Error creating/updating subscription:', subscriptionError);
    return;
  }

  // Registrar pagamento
  const { error: paymentError } = await supabaseClient
    .from('payments')
    .insert({
      subscription_id: subscriptionData.user_id, // Usar user_id como referência temporária
      stripe_payment_intent_id: session.payment_intent,
      amount: session.amount_total / 100, // Converter de centavos
      currency: session.currency,
      status: 'succeeded',
      payment_method: session.payment_method_types[0]
    });

  if (paymentError) {
    console.error('Error recording payment:', paymentError);
  }

  console.log(`Subscription created/updated for user ${userId}`);
}

async function handlePaymentSucceeded(invoice: any, supabaseClient: any) {
  const subscriptionId = invoice.subscription;
  
  // Buscar assinatura pelo stripe_subscription_id
  const { data: subscription, error: subError } = await supabaseClient
    .from('subscriptions')
    .select('*')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (subError) {
    console.error('Error fetching subscription:', subError);
    return;
  }

  // Registrar pagamento
  const { error: paymentError } = await supabaseClient
    .from('payments')
    .insert({
      subscription_id: subscription.id,
      stripe_payment_intent_id: invoice.payment_intent,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
      status: 'succeeded',
      payment_method: 'card' // Pode ser refinado conforme necessário
    });

  if (paymentError) {
    console.error('Error recording payment:', paymentError);
  }

  console.log(`Payment recorded for subscription ${subscription.id}`);
}

async function handleSubscriptionUpdated(subscription: any, supabaseClient: any) {
  const { error } = await supabaseClient
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription:', error);
  }
}

async function handleSubscriptionDeleted(subscription: any, supabaseClient: any) {
  const { error } = await supabaseClient
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error canceling subscription:', error);
  }
}
