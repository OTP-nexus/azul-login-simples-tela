
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Calendar } from 'lucide-react';
import { FreightDetails } from '@/hooks/useFreightByCode';

interface FreightHeaderProps {
  freight: FreightDetails;
}

const FreightHeader: React.FC<FreightHeaderProps> = ({ freight }) => {
  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'agregamento': 'Agregamento',
      'frete_completo': 'Frete Completo',
      'frete_de_retorno': 'Frete de Retorno',
      'comum': 'Frete Comum'
    };
    return types[type] || type;
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'ativo': return 'bg-green-500';
      case 'pendente': return 'bg-yellow-500';
      case 'finalizado': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Truck className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle className="text-xl">{freight.codigo_agregamento}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">{getTypeLabel(freight.tipo_frete)}</p>
            </div>
          </div>
          <Badge className={`${getStatusColor(freight.status)} text-white`}>
            {freight.status?.toUpperCase() || 'ATIVO'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>Criado em {new Date(freight.created_at).toLocaleDateString('pt-BR')}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default FreightHeader;
