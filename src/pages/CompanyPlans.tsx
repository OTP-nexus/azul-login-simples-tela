
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Building, Crown, Zap, FileText, Users, BarChart3, Headphones, Shield } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';

const CompanyPlans = () => {
  const { plan: currentPlan, subscription, isInTrial, trialEndsAt, isLoading } = useSubscription();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const { toast } = useToast();

  const plans = [
    {
      id: 'company-trial',
      name: 'Trial',
      price: 0,
      period: '30 dias grátis',
      description: 'Teste completo após validação dos documentos',
      features: [
        'Publicação ilimitada de fretes',
        'Gerenciamento de colaboradores',
        'Dashboard básico de controle',
        'Recebimento de interesses dos motoristas',
        'Suporte por email'
      ],
      icon: Building,
      popular: false,
      isTrial: true
    },
    {
      id: 'company-business',
      name: 'Business',
      price: 297.00,
      period: '/mês',
      description: 'Ideal para empresas em crescimento',
      features: [
        'Tudo do Trial, sem limite de tempo',
        'Gerenciamento ilimitado de colaboradores',
        'Dashboard completo de controle',
        'Relatórios básicos de performance',
        'Sistema de notificações avançadas',
        'Suporte prioritário por email',
        'Histórico completo de fretes'
      ],
      icon: Zap,
      popular: true
    },
    {
      id: 'company-enterprise',
      name: 'Enterprise',
      price: 597.00,
      period: '/mês',
      description: 'Para empresas que precisam de recursos avançados',
      features: [
        'Tudo do Business +',
        'API para integração com sistemas',
        'Relatórios avançados e analytics',
        'Suporte telefônico prioritário',
        'Gerente de conta dedicado',
        'Integrações customizadas',
        'White-label opcional',
        'SLA garantido de 99.9%'
      ],
      icon: Crown,
      popular: false
    }
  ];

  const handlePlanSelection = async (planId: string) => {
    if (planId === 'company-trial') {
      toast({
        title: 'Trial Ativo',
        description: 'Você já tem acesso ao período trial!'
      });
      return;
    }

    setProcessingPlan(planId);
    
    try {
      // Criar sessão de checkout
      const { data, error } = await supabase.functions.invoke('create-company-checkout', {
        body: {
          planId
        }
      });

      if (error) {
        toast({
          title: 'Erro',
          description: 'Erro ao processar pagamento. Tente novamente.',
          variant: 'destructive'
        });
        return;
      }

      // Redirecionar para checkout
      if (data?.url) {
        window.open(data.url, '_blank');
      }

    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro interno. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setProcessingPlan(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Planos Empresariais</h1>
        <p className="text-gray-600">
          Escolha o plano ideal para sua empresa publicar fretes sem limites
        </p>
      </div>

      {/* Trial Status */}
      {isInTrial && trialEndsAt && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">Trial Ativo</h3>
                <p className="text-sm text-blue-700">
                  Seu trial expira em: {new Date(trialEndsAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                {Math.ceil((new Date(trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dias restantes
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentPlan?.slug === plan.id;
          
          return (
            <Card 
              key={plan.id} 
              className={`relative ${
                plan.popular ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20' : ''
              } ${isCurrentPlan ? 'border-green-500 bg-green-50' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 hover:bg-blue-500">
                    Mais Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-gray-100 rounded-full w-fit">
                  <Icon className="h-6 w-6 text-gray-600" />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                
                <div className="mt-4">
                  <span className="text-3xl font-bold text-gray-900">
                    {plan.price === 0 ? 'Grátis' : `R$ ${plan.price.toFixed(2)}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-600 ml-1">{plan.period}</span>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full" 
                  variant={isCurrentPlan ? "secondary" : plan.popular ? "default" : "outline"}
                  disabled={isCurrentPlan || processingPlan === plan.id || (plan.isTrial && !isInTrial)}
                  onClick={() => handlePlanSelection(plan.id)}
                >
                  {processingPlan === plan.id ? 'Processando...' : 
                   isCurrentPlan ? 'Plano Atual' : 
                   plan.isTrial ? 'Trial Ativo' :
                   'Escolher Plano'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Por que escolher nossos planos pagos?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 mt-0.5 text-blue-500" />
            <div>
              <strong>Publicação ilimitada</strong>
              <p>Publique quantos fretes precisar sem nenhuma restrição</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 mt-0.5 text-green-500" />
            <div>
              <strong>Gestão de colaboradores</strong>
              <p>Adicione sua equipe e controle permissões de acesso</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <BarChart3 className="h-4 w-4 mt-0.5 text-purple-500" />
            <div>
              <strong>Relatórios avançados</strong>
              <p>Acompanhe performance e tome decisões baseadas em dados</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Headphones className="h-4 w-4 mt-0.5 text-orange-500" />
            <div>
              <strong>Suporte prioritário</strong>
              <p>Atendimento especializado para resolver questões rapidamente</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            ✓ 30 dias de trial gratuito após validação dos documentos
            <br />
            ✓ Cancele a qualquer momento sem multa
            <br />
            ✓ Suporte técnico especializado
            <br />
            ✓ Garantia de uptime de 99.9%
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default CompanyPlans;
