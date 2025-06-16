
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Lock } from 'lucide-react';
import { FreightDetails } from '@/hooks/useFreightByCode';
import { useAuth } from '@/hooks/useAuth';

interface FreightContactProps {
  freight: FreightDetails;
}

const FreightContact: React.FC<FreightContactProps> = ({ freight }) => {
  const { user } = useAuth();
  const isCommonFreight = freight.tipo_frete === 'comum';
  const shouldHideContact = isCommonFreight && !user;

  if (!freight.solicitante_nome && !freight.solicitante_telefone) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          Contato
        </CardTitle>
      </CardHeader>
      <CardContent>
        {shouldHideContact ? (
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Lock className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">🔒 Para ver o contato, é necessário estar logado.</p>
              <p className="text-xs text-gray-500 mt-1">Faça login para acessar as informações de contato</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {freight.solicitante_nome && (
              <div>
                <span className="text-sm font-medium text-gray-700">Nome:</span>
                <p className="text-sm text-gray-600">{freight.solicitante_nome}</p>
              </div>
            )}
            {freight.solicitante_telefone && (
              <div>
                <span className="text-sm font-medium text-gray-700">Telefone:</span>
                <p className="text-sm text-gray-600">{freight.solicitante_telefone}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FreightContact;
