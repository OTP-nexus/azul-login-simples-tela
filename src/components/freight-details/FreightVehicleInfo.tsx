
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FreightDetails } from '@/hooks/useFreightByCode';

interface FreightVehicleInfoProps {
  freight: FreightDetails;
}

const FreightVehicleInfo: React.FC<FreightVehicleInfoProps> = ({ freight }) => {
  const formatVehicleTypes = (types: any[]) => {
    if (!Array.isArray(types) || types.length === 0) return [];
    
    return types.map(type => {
      if (typeof type === 'string') return type;
      if (typeof type === 'object' && type !== null) {
        return type.value || type.label || type.name || String(type);
      }
      return String(type);
    }).filter(Boolean);
  };

  const vehicleTypes = formatVehicleTypes(freight.tipos_veiculos || []);
  const bodyTypes = formatVehicleTypes(freight.tipos_carrocerias || []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-blue-600" />
          Veículos e Carrocerias
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {vehicleTypes.length > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-700 mb-2 block">Tipos de Veículos:</span>
              <div className="flex flex-wrap gap-2">
                {vehicleTypes.map((type, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {bodyTypes.length > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-700 mb-2 block">Tipos de Carroceria:</span>
              <div className="flex flex-wrap gap-2">
                {bodyTypes.map((type, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {vehicleTypes.length === 0 && bodyTypes.length === 0 && (
            <p className="text-sm text-gray-500">Nenhuma especificação de veículo definida</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FreightVehicleInfo;
