
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  price_monthly: number;
  target_user_type: 'driver' | 'company';
  features: string[];
  contact_views_limit: number;
  freight_limit: number;
  trial_days: number;
  is_active: boolean;
}

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  plan: SubscriptionPlan;
}

interface SubscriptionData {
  subscription: Subscription | null;
  plan: SubscriptionPlan | null;
  isLoading: boolean;
  isInTrial: boolean;
  trialEndsAt: string | null;
  contactViewsRemaining: number;
  canCreateFreight: boolean;
  canViewContacts: boolean;
  refreshSubscription: () => Promise<void>;
}

export function useSubscription(): SubscriptionData {
  const { user, profile } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contactViewsRemaining, setContactViewsRemaining] = useState(0);

  useEffect(() => {
    if (!user || !profile) {
      setIsLoading(false);
      return;
    }

    fetchSubscription();
  }, [user, profile]);

  const fetchSubscription = async () => {
    try {
      setIsLoading(true);
      
      // Buscar assinatura ativa do usuário
      const { data: subscriptionData, error: subError } = await supabase
        .from('subscriptions' as any)
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', user!.id)
        .eq('status', 'active')
        .maybeSingle();

      if (subError) {
        console.error('Erro ao buscar assinatura:', subError);
        // Não retornar aqui, continuar com plano padrão
      }

      if (subscriptionData && (subscriptionData as any).plan) {
        setSubscription(subscriptionData as any);
        setPlan((subscriptionData as any).plan);
      } else {
        // Se não tem assinatura, buscar plano gratuito padrão
        const userType = profile.role === 'driver' ? 'driver' : 'company';
        const defaultSlug = userType === 'driver' ? 'driver-free' : 'company-trial';
        
        const { data: defaultPlan, error: planError } = await supabase
          .from('subscription_plans' as any)
          .select('*')
          .eq('slug', defaultSlug)
          .eq('is_active', true)
          .single();

        if (!planError && defaultPlan) {
          setPlan(defaultPlan as any);
        } else {
          console.error('Erro ao buscar plano padrão:', planError);
        }
      }

      // Se for motorista, verificar limite de visualizações
      if (profile.role === 'driver') {
        try {
          const { data: remainingViews } = await supabase
            .rpc('check_driver_contact_limit' as any, { driver_user_id: user!.id });
          
          setContactViewsRemaining(typeof remainingViews === 'number' ? remainingViews : 0);
        } catch (error) {
          console.error('Erro ao verificar limite de visualizações:', error);
          setContactViewsRemaining(0);
        }
      }

    } catch (error) {
      console.error('Erro no useSubscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isInTrial = subscription?.status === 'trialing' && 
                   subscription?.trial_ends_at && 
                   new Date(subscription.trial_ends_at) > new Date();

  const canCreateFreight = profile?.role === 'company' && (
    isInTrial || 
    (subscription?.status === 'active' && plan?.slug !== 'company-trial')
  );

  // Lógica corrigida para canViewContacts
  const canViewContacts = profile?.role === 'driver' && (
    plan?.contact_views_limit === -1 || // Plano ilimitado
    contactViewsRemaining > 0 // Tem visualizações restantes
  );

  const refreshSubscription = async () => {
    if (user && profile) {
      await fetchSubscription();
    }
  };

  return {
    subscription,
    plan,
    isLoading,
    isInTrial,
    trialEndsAt: subscription?.trial_ends_at || null,
    contactViewsRemaining,
    canCreateFreight,
    canViewContacts,
    refreshSubscription
  };
}
