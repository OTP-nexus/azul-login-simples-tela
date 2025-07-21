
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Eye, MessageCircle, Phone, BarChart3, Bell } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const DriverPlans = () => {
  const { plan: currentPlan, subscription, isLoading } = useSubscription();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const { toast } = useToast();

  const plans = [
    {
      id: 'driver-free',
      name: 'Gratuito',
      price: 0,
      period: 'Sempre grátis',
      description: 'Ideal para motoristas iniciantes',
      features: [
        'Visualizar todos os fretes públicos',
        'Demonstrar interesse nos fretes',
        'Perfil básico completo',
        '5 visualizações de contato/mês'
      ],
      icon: Eye,
      popular: false,
      contactLimit: 5
    },
    {
      id: 'driver-premium',
      name: 'Premium',
      price: 29.90,
      period: '/mês',
      description: 'Para motoristas que querem maximizar oportunidades',
      features: [
        'Visualizações ilimitadas de contatos',
        'Acesso direto ao WhatsApp das empresas',
        'Telefone completo das empresas',
        'Notificações prioritárias de novos fretes',
        'Histórico completo de contatos',
        'Relatórios de performance',
        'Suporte prioritário via WhatsApp'
      ],
      icon: Star,
      popular: true,
      contactLimit: -1,
      paymentOptions: [
        {
          method: 'pix',
          price: 26.91,
          period: '/mês',
          label: 'PIX',
          discount: true,
          discountText: '10% OFF'
        },
        {
          method: 'card',
          price: 29.90,
          period: '/mês',
          label: 'Cartão de Crédito',
          discount: false
        }
      ]
    }
  ];

  const handlePlanSelection = async (planId: string, paymentMethod?: string) => {
    if (planId === 'driver-free') {
      toast({
        title: 'Plano Gratuito',
        description: 'Você já tem acesso ao plano gratuito!'
      });
      return;
    }

    setProcessingPlan(planId);
    
    try {
      // Criar sessão de checkout
      const { data, error } = await supabase.functions.invoke('create-driver-checkout', {
        body: {
          planId,
          paymentMethod: paymentMethod || 'card'
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Escolha seu Plano</h1>
        <p className="text-gray-600">
          Maximize suas oportunidades com acesso ilimitado aos contatos das empresas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentPlan?.slug === plan.id;
          const isPremium = plan.id === 'driver-premium';
          
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
                
                {!isPremium && (
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-gray-900">
                      {plan.price === 0 ? 'Grátis' : `R$ ${plan.price.toFixed(2)}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-600 ml-1">{plan.period}</span>
                    )}
                  </div>
                )}
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
                
                {isPremium ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-900 mb-3">Escolha sua forma de pagamento:</p>
                    {plan.paymentOptions?.map((option) => (
                      <div key={option.method} className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{option.label}</span>
                            {option.discount && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                {option.discountText}
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                              R$ {option.price.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-600">{option.period}</div>
                          </div>
                        </div>
                        <Button 
                          className="w-full mt-2" 
                          variant={option.discount ? "default" : "outline"}
                          disabled={isCurrentPlan || processingPlan === plan.id}
                          onClick={() => handlePlanSelection(plan.id, option.method)}
                        >
                          {processingPlan === plan.id ? 'Processando...' : 
                           isCurrentPlan ? 'Plano Atual' : 
                           `Escolher ${option.label}`}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Button 
                    className="w-full" 
                    variant={isCurrentPlan ? "secondary" : "outline"}
                    disabled={isCurrentPlan}
                    onClick={() => handlePlanSelection(plan.id)}
                  >
                    {isCurrentPlan ? 'Plano Atual' : 'Escolher Plano'}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Por que escolher o Premium?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <Phone className="h-4 w-4 mt-0.5 text-blue-500" />
            <div>
              <strong>Contato direto com empresas</strong>
              <p>Acesso completo a telefones e WhatsApp para fechar negócios rapidamente</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Bell className="h-4 w-4 mt-0.5 text-green-500" />
            <div>
              <strong>Notificações prioritárias</strong>
              <p>Seja o primeiro a saber sobre novos fretes na sua região</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <BarChart3 className="h-4 w-4 mt-0.5 text-purple-500" />
            <div>
              <strong>Relatórios detalhados</strong>
              <p>Acompanhe sua performance e identifique as melhores oportunidades</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MessageCircle className="h-4 w-4 mt-0.5 text-orange-500" />
            <div>
              <strong>Suporte WhatsApp</strong>
              <p>Atendimento prioritário via WhatsApp para resolver questões rapidamente</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            ✓ Cancele a qualquer momento sem taxas
            <br />
            ✓ Suporte técnico disponível 24/7
            <br />
            ✓ Pagamento via PIX oferece desconto especial
          </p>
        </div>
      </div>
    </div>
  );
};

export default DriverPlans;
