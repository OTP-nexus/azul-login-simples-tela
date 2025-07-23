
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  logStep('Webhook received', { method: req.method, headers: Object.fromEntries(req.headers.entries()) });
  
  const signature = req.headers.get('Stripe-Signature');
  const body = await req.text();
  
  if (!signature) {
    logStep('ERROR: No signature found');
    return new Response('No signature', { status: 400 });
  }

  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!webhookSecret) {
    logStep('ERROR: STRIPE_WEBHOOK_SECRET not configured');
    return new Response('Webhook secret not configured', { status: 500 });
  }

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    );
    logStep('Event verified successfully', { type: event.type, id: event.id });
  } catch (err) {
    logStep('ERROR: Webhook signature verification failed', { error: err.message });
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
        logStep('Processing checkout.session.completed');
        await handleCheckoutCompleted(event.data.object, supabaseClient);
        break;
      
      case 'invoice.payment_succeeded':
        logStep('Processing invoice.payment_succeeded');
        await handlePaymentSucceeded(event.data.object, supabaseClient);
        break;
      
      case 'customer.subscription.updated':
        logStep('Processing customer.subscription.updated');
        await handleSubscriptionUpdated(event.data.object, supabaseClient);
        break;
      
      case 'customer.subscription.deleted':
        logStep('Processing customer.subscription.deleted');
        await handleSubscriptionDeleted(event.data.object, supabaseClient);
        break;
      
      default:
        logStep(`Unhandled event type: ${event.type}`);
    }

    logStep('Webhook processed successfully');
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    logStep('ERROR processing webhook', { error: error.message, stack: error.stack });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function handleCheckoutCompleted(session: any, supabaseClient: any) {
  logStep('handleCheckoutCompleted started', { sessionId: session.id });
  
  const userId = session.metadata.user_id;
  const planId = session.metadata.plan_id;
  
  if (!userId || !planId) {
    logStep('ERROR: Missing metadata', { userId, planId, metadata: session.metadata });
    throw new Error('Missing user_id or plan_id in session metadata');
  }

  logStep('Processing checkout for', { userId, planId });

  // Buscar o plano
  const { data: plan, error: planError } = await supabaseClient
    .from('subscription_plans')
    .select('*')
    .eq('id', planId)
    .single();

  if (planError) {
    logStep('ERROR fetching plan', { planError, planId });
    throw new Error(`Plan not found: ${planError.message}`);
  }

  logStep('Plan found', { planName: plan.name, planSlug: plan.slug });

  // Buscar dados da subscription do Stripe para pegar as datas corretas
  let subscriptionData;
  if (session.subscription) {
    try {
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
      logStep('Subscription data from Stripe', { status: stripeSubscription.status, trialEnd: stripeSubscription.trial_end });
    } catch (stripeError) {
      logStep('ERROR fetching Stripe subscription', stripeError);
      // Fallback para dados básicos
      subscriptionData = {
        user_id: userId,
        plan_id: planId,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
    }
  } else {
    // Para pagamentos únicos
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

  // Criar ou atualizar assinatura
  const { data: insertedSubscription, error: subscriptionError } = await supabaseClient
    .from('subscriptions')
    .upsert(subscriptionData, { onConflict: 'user_id' })
    .select()
    .single();

  if (subscriptionError) {
    logStep('ERROR creating/updating subscription', subscriptionError);
    throw new Error(`Failed to create subscription: ${subscriptionError.message}`);
  }

  logStep('Subscription created/updated', { subscriptionId: insertedSubscription.id });

  // Registrar pagamento com o ID correto da subscription
  if (session.payment_intent) {
    const { error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        subscription_id: insertedSubscription.id,
        stripe_payment_intent_id: session.payment_intent,
        amount: session.amount_total / 100,
        currency: session.currency || 'brl',
        status: 'succeeded',
        payment_method: session.payment_method_types?.[0] || 'card'
      });

    if (paymentError) {
      logStep('ERROR recording payment', paymentError);
    } else {
      logStep('Payment recorded successfully');
    }
  }

  logStep(`Subscription process completed for user ${userId}`);
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
