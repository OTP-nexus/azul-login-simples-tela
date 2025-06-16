
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, ArrowRight } from 'lucide-react';
import { FreightDetails } from '@/hooks/useFreightByCode';

interface FreightRouteProps {
  freight: FreightDetails;
}

const FreightRoute: React.FC<FreightRouteProps> = ({ freight }) => {
  const formatDestinations = (destinos: any[]) => {
    if (!Array.isArray(destinos) || destinos.length === 0) {
      if (freight.destino_cidade && freight.destino_estado) {
        return `${freight.destino_cidade} - ${freight.destino_estado}`;
      }
      return 'Não especificado';
    }
    
    return destinos.map(dest => {
      if (typeof dest === 'string') return dest;
      if (typeof dest === 'object' && dest !== null) {
        return `${dest.cidade || dest.name || dest.label || ''} - ${dest.estado || dest.state || ''}`.trim();
      }
      return String(dest);
    }).filter(Boolean).join(', ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Rota
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-green-700">Origem</span>
              </div>
              <p className="text-sm text-gray-600">
                {freight.origem_cidade} - {freight.origem_estado}
              </p>
            </div>
            
            <ArrowRight className="h-5 w-5 text-gray-400 hidden sm:block" />
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="font-medium text-red-700">Destino</span>
              </div>
              <p className="text-sm text-gray-600">
                {formatDestinations(freight.destinos)}
              </p>
            </div>
          </div>

          {freight.paradas && Array.isArray(freight.paradas) && freight.paradas.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Paradas</h4>
              <div className="space-y-1">
                {freight.paradas.map((parada, index) => (
                  <p key={index} className="text-sm text-gray-600">
                    {typeof parada === 'string' ? parada : JSON.stringify(parada)}
                  </p>
                ))}
              </div>
            </div>
          )}

          {(freight.data_coleta || freight.data_entrega) && (
            <div className="pt-4 border-t">
              <h4 className="font-medium text-gray-800 mb-2">Datas</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {freight.data_coleta && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Coleta:</span>
                    <p className="text-sm text-gray-600">
                      {new Date(freight.data_coleta).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
                {freight.data_entrega && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Entrega:</span>
                    <p className="text-sm text-gray-600">
                      {new Date(freight.data_entrega).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FreightRoute;
