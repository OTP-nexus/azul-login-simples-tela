
import React from 'react';
import { SubscriptionStatus } from '@/components/SubscriptionStatus';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

const CompanyDashboard = () => {
  const { canCreateFreight, isInTrial, trialEndsAt } = useSubscription();
  const navigate = useNavigate();

  const handleUpgradeClick = () => {
    navigate('/company/plans');
  };

  const getDaysUntilTrialExpiry = () => {
    if (!trialEndsAt) return 0;
    const days = Math.ceil((new Date(trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Conteúdo principal do dashboard */}
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Dashboard da Empresa</h1>
            
            {/* Alerta de trial expirando */}
            {isInTrial && getDaysUntilTrialExpiry() <= 7 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-orange-800">Trial Expirando</h3>
                    <p className="text-sm text-orange-700">
                      Seu trial expira em {getDaysUntilTrialExpiry()} dia(s). Escolha um plano para continuar.
                    </p>
                  </div>
                  <button
                    onClick={handleUpgradeClick}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Escolher Plano
                  </button>
                </div>
              </div>
            )}

            {/* Alerta de acesso bloqueado */}
            {!canCreateFreight && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-red-800">Acesso Limitado</h3>
                    <p className="text-sm text-red-700">
                      Seu trial expirou. Escolha um plano para continuar publicando fretes.
                    </p>
                  </div>
                  <button
                    onClick={handleUpgradeClick}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Escolher Plano
                  </button>
                </div>
              </div>
            )}

            {/* Resto do conteúdo do dashboard */}
            <div className="bg-white rounded-lg p-6">
              <p>Conteúdo do dashboard aqui...</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <SubscriptionStatus />
          
          {/* Estatísticas rápidas */}
          <div className="bg-white rounded-lg p-4 border">
            <h3 className="font-semibold mb-2">Estatísticas do Mês</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Fretes publicados:</span>
                <span className="font-medium">--</span>
              </div>
              <div className="flex justify-between">
                <span>Interessados:</span>
                <span className="font-medium">--</span>
              </div>
              <div className="flex justify-between">
                <span>Fretes ativos:</span>
                <span className="font-medium">--</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
