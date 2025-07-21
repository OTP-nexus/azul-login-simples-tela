
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SubscriptionStatus } from '@/components/SubscriptionStatus';
import { ContactViewPaywall } from '@/components/ContactViewPaywall';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Eye, TrendingUp } from 'lucide-react';

const DriverDashboard = () => {
  const { contactViewsRemaining, canViewContacts, plan, isLoading } = useSubscription();
  const navigate = useNavigate();

  const handleUpgradeClick = () => {
    navigate('/driver/plans');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard do Motorista</h1>
        <p className="text-gray-600">Gerencie suas atividades e visualizações de contatos</p>
      </div>

      {/* Alertas de limite */}
      {!canViewContacts && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
                <div>
                  <h3 className="font-semibold text-orange-800">Limite de Visualizações Atingido</h3>
                  <p className="text-sm text-orange-700">
                    Você atingiu o limite de visualizações de contato deste mês.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleUpgradeClick}
                className="bg-orange-600 text-white hover:bg-orange-700"
              >
                Fazer Upgrade
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Aviso quando restam poucas visualizações */}
      {canViewContacts && contactViewsRemaining !== -1 && contactViewsRemaining <= 2 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Eye className="h-6 w-6 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-800">Poucas Visualizações Restantes</h3>
                  <p className="text-sm text-yellow-700">
                    Você tem apenas {contactViewsRemaining} visualizações restantes este mês.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleUpgradeClick}
                variant="outline"
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                Ver Planos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Cards de ação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Buscar Fretes</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Encontre oportunidades de frete na sua região
                </p>
                <Button 
                  onClick={() => navigate('/public-freights')}
                  className="w-full"
                >
                  Ver Fretes Disponíveis
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Meus Favoritos</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Acesse fretes que você salvou como favoritos
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                >
                  Ver Favoritos
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Resumo de atividades */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo de Atividades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Fretes Visualizados (30 dias)</span>
                  <span className="text-lg font-bold text-blue-600">--</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Contatos Realizados (30 dias)</span>
                  <span className="text-lg font-bold text-green-600">--</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Fretes Favoritos</span>
                  <span className="text-lg font-bold text-purple-600">--</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <SubscriptionStatus />
          
          {/* Estatísticas do plano atual */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Limite de Visualizações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Plano atual:</span>
                  <span className="font-medium">{plan?.name || 'Carregando...'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Visualizações restantes:</span>
                  <span className="font-medium">
                    {contactViewsRemaining === -1 ? '∞' : contactViewsRemaining}
                  </span>
                </div>
                {contactViewsRemaining !== -1 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${plan?.contact_views_limit ? 
                          ((plan.contact_views_limit - contactViewsRemaining) / plan.contact_views_limit) * 100 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                )}
                
                {canViewContacts && contactViewsRemaining !== -1 && contactViewsRemaining <= 2 && (
                  <Button
                    onClick={handleUpgradeClick}
                    size="sm"
                    className="w-full mt-3"
                  >
                    Upgrade para Ilimitado
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
