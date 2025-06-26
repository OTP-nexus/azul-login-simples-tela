
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Truck, MapPin, Bell, Shield, Zap } from 'lucide-react';

const DriverPlans = () => {
  const currentPlan = 'basico';

  const plans = [
    {
      id: 'basico',
      name: 'Básico',
      price: 0,
      period: 'Gratuito',
      description: 'Ideal para motoristas iniciantes',
      features: [
        'Acesso a fretes básicos',
        'Até 5 aplicações por dia',
        'Suporte por email',
        'Notificações básicas'
      ],
      icon: Truck,
      popular: false
    },
    {
      id: 'profissional',
      name: 'Profissional',
      price: 49.90,
      period: '/mês',
      description: 'Para motoristas experientes',
      features: [
        'Acesso a todos os fretes',
        'Aplicações ilimitadas',
        'Prioridade em fretes premium',
        'Suporte prioritário',
        'Notificações avançadas',
        'Relatórios de desempenho',
        'GPS integrado'
      ],
      icon: Star,
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 89.90,
      period: '/mês',
      description: 'Máximo desempenho para profissionais',
      features: [
        'Todos os recursos do Profissional',
        'Fretes exclusivos de alto valor',
        'Consultor dedicado',
        'Suporte 24/7',
        'Seguro adicional',
        'Análise de rotas otimizada',
        'Dashboard avançado',
        'API de integração'
      ],
      icon: Zap,
      popular: false
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Escolha seu Plano</h2>
        <p className="text-gray-600">
          Expanda suas oportunidades com nossos planos especializados para motoristas
        </p>
      </div>

      {/* Current Plan Status */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Shield className="h-5 w-5" />
            Plano Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">
                {plans.find(p => p.id === currentPlan)?.name}
              </h3>
              <p className="text-blue-700">
                {plans.find(p => p.id === currentPlan)?.description}
              </p>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Ativo
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = plan.id === currentPlan;
          
          return (
            <Card 
              key={plan.id} 
              className={`relative ${
                plan.popular ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20' : ''
              } ${isCurrentPlan ? 'opacity-75' : ''}`}
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
                    {plan.price === 0 ? 'Grátis' : `R$ ${plan.price}`}
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
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan ? 'Plano Atual' : 'Escolher Plano'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Informações Importantes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <Bell className="h-4 w-4 mt-0.5 text-blue-500" />
            <div>
              <strong>Notificações em tempo real</strong>
              <p>Receba alertas instantâneos sobre novos fretes compatíveis com seu perfil</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 text-green-500" />
            <div>
              <strong>Otimização de rotas</strong>
              <p>Sistema inteligente para encontrar as melhores rotas e economizar combustível</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            * Todos os planos incluem acesso à plataforma web e mobile
            <br />
            * Cancele a qualquer momento sem taxas adicionais
            <br />
            * Suporte técnico disponível para todos os usuários
          </p>
        </div>
      </div>
    </div>
  );
};

export default DriverPlans;
