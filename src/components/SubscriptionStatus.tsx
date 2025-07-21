
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Eye, FileText, Crown } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';

export const SubscriptionStatus = () => {
  const { subscription, plan, isInTrial, trialEndsAt, contactViewsRemaining, isLoading } = useSubscription();
  const { profile } = useAuth();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!plan) return null;

  const getStatusColor = () => {
    if (isInTrial) return 'bg-blue-100 text-blue-800';
    if (subscription?.status === 'active') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = () => {
    if (isInTrial) return 'Trial Ativo';
    if (subscription?.status === 'active') return 'Ativo';
    return 'Gratuito';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Crown className="h-5 w-5" />
          Status da Assinatura
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">{plan.name}</h3>
              <p className="text-sm text-blue-700">
                {plan.price_monthly > 0 ? `R$ ${plan.price_monthly.toFixed(2)}/mês` : 'Gratuito'}
              </p>
            </div>
            <Badge className={getStatusColor()}>
              {getStatusText()}
            </Badge>
          </div>

          {isInTrial && trialEndsAt && (
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Calendar className="h-4 w-4" />
              <span>Trial expira em: {formatDate(trialEndsAt)}</span>
            </div>
          )}

          {profile?.role === 'driver' && (
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Eye className="h-4 w-4" />
              <span>
                Visualizações restantes: {contactViewsRemaining === -1 ? 'Ilimitadas' : contactViewsRemaining}
              </span>
            </div>
          )}

          {profile?.role === 'company' && (
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <FileText className="h-4 w-4" />
              <span>Fretes: Ilimitados</span>
            </div>
          )}

          <div className="pt-4 border-t border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Recursos inclusos:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {((profile?.role === 'company' && isInTrial) || 
            (profile?.role === 'driver' && contactViewsRemaining <= 1 && plan.slug === 'driver-free')) && (
            <div className="pt-4">
              <Button 
                className="w-full" 
                onClick={() => window.location.href = profile?.role === 'driver' ? '/driver/plans' : '/company/plans'}
              >
                {profile?.role === 'company' ? 'Escolher Plano' : 'Fazer Upgrade'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
