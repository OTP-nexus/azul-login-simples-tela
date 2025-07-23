import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, CreditCard, Settings, RefreshCw, Eye } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { SubscriptionStatus } from '@/components/SubscriptionStatus';

const DriverSubscription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscription, plan, canViewContacts, refreshSubscription } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao abrir portal de gerenciamento",
        variant: "destructive",
      });
    }
  };

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    try {
      await refreshSubscription();
      toast({
        title: "Status atualizado",
        description: "Status da assinatura foi atualizado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da assinatura",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-6 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Minha Assinatura</h1>
          <Button
            onClick={handleRefreshStatus}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar Status
          </Button>
        </div>

        <SubscriptionStatus />

        <div className="grid gap-6 md:grid-cols-2">
          {/* Detalhes da Assinatura */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Detalhes da Assinatura
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription && plan ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Plano:</span>
                    <Badge variant="secondary">{plan.name}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                      {subscription.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Valor:</span>
                    <span className="font-medium">
                      {plan.price_monthly ? `R$ ${plan.price_monthly.toFixed(2)}/mês` : 'Gratuito'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Visualizações de contato:</span>
                    <Badge variant={canViewContacts ? 'default' : 'destructive'}>
                      {plan.contact_views_limit === -1 ? 'Ilimitadas' : 
                       `${plan.contact_views_limit} por mês`}
                    </Badge>
                  </div>

                  {subscription.current_period_end && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Próxima cobrança:</span>
                      <span className="font-medium">
                        {formatDate(subscription.current_period_end)}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Plano gratuito ativo</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    5 visualizações de contato por mês
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Gerenciar Assinatura
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription ? (
                <Button
                  onClick={handleManageSubscription}
                  className="w-full"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Portal de Gerenciamento
                </Button>
              ) : (
                <Button
                  onClick={() => navigate('/driver/plans')}
                  className="w-full"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Assinar Plano Premium
                </Button>
              )}

              <Button
                onClick={() => navigate('/driver/plans')}
                variant="outline"
                className="w-full"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Ver Planos Disponíveis
              </Button>

              <div className="text-sm text-muted-foreground">
                {subscription ? (
                  <>
                    <p>No portal de gerenciamento você pode:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Alterar método de pagamento</li>
                      <li>Visualizar histórico de faturas</li>
                      <li>Cancelar assinatura</li>
                      <li>Atualizar informações de cobrança</li>
                    </ul>
                  </>
                ) : (
                  <>
                    <p>Benefícios do plano premium:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Visualizações ilimitadas de contatos</li>
                      <li>Suporte prioritário</li>
                      <li>Acesso antecipado a novos recursos</li>
                      <li>Sem anúncios na plataforma</li>
                    </ul>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default DriverSubscription;