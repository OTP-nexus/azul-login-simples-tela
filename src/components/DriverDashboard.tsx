
import React from 'react';
import { SubscriptionStatus } from '@/components/SubscriptionStatus';
import { ContactViewPaywall } from '@/components/ContactViewPaywall';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

const DriverDashboard = () => {
  const { contactViewsRemaining, canViewContacts } = useSubscription();
  const navigate = useNavigate();

  const handleUpgradeClick = () => {
    navigate('/driver/plans');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Conteúdo principal do dashboard */}
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Dashboard do Motorista</h1>
            
            {/* Alerta de limite */}
            {!canViewContacts && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-orange-800">Limite de Visualizações Atingido</h3>
                    <p className="text-sm text-orange-700">
                      Você atingiu o limite de visualizações de contato deste mês.
                    </p>
                  </div>
                  <button
                    onClick={handleUpgradeClick}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Fazer Upgrade
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
                <span>Visualizações restantes:</span>
                <span className="font-medium">
                  {contactViewsRemaining === -1 ? 'Ilimitadas' : contactViewsRemaining}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Fretes visualizados:</span>
                <span className="font-medium">--</span>
              </div>
              <div className="flex justify-between">
                <span>Contatos realizados:</span>
                <span className="font-medium">--</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
