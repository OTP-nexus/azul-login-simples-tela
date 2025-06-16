
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { FreightDetails } from '@/hooks/useFreightByCode';

interface FreightCargoInfoProps {
  freight: FreightDetails;
}

const FreightCargoInfo: React.FC<FreightCargoInfoProps> = ({ freight }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatWeight = (weight: number) => {
    if (weight >= 1000) {
      return `${(weight / 1000).toFixed(1)} t`;
    }
    return `${weight} kg`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-600" />
          Informações da Carga
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <span className="text-sm font-medium text-gray-700">Tipo de Mercadoria:</span>
            <p className="text-sm text-gray-600 mt-1">{freight.tipo_mercadoria}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {freight.peso_carga && (
              <div>
                <span className="text-sm font-medium text-gray-700">Peso:</span>
                <p className="text-sm text-gray-600 mt-1">{formatWeight(freight.peso_carga)}</p>
              </div>
            )}
            
            {freight.valor_carga && (
              <div>
                <span className="text-sm font-medium text-gray-700">Valor da Carga:</span>
                <p className="text-sm text-gray-600 mt-1">{formatCurrency(freight.valor_carga)}</p>
              </div>
            )}
          </div>

          {freight.horario_carregamento && (
            <div>
              <span className="text-sm font-medium text-gray-700">Horário de Carregamento:</span>
              <p className="text-sm text-gray-600 mt-1">{freight.horario_carregamento}</p>
            </div>
          )}

          {freight.observacoes && (
            <div>
              <span className="text-sm font-medium text-gray-700">Observações:</span>
              <p className="text-sm text-gray-600 mt-1">{freight.observacoes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FreightCargoInfo;
