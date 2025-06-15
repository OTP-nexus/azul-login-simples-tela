
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, Package, MapPin, Calendar, DollarSign, RotateCcw, Combine, Handshake } from "lucide-react";
import FreightStatusBadge from './FreightStatusBadge';
import type { Freight } from '@/hooks/usePublicFreights';

interface PublicFreightCardProps {
  freight: Freight;
}

const PublicFreightCard = ({ freight }: PublicFreightCardProps) => {
  const navigate = useNavigate();

  const getFreightTypeConfig = (tipo: string) => {
    switch (tipo) {
      case 'agregamento':
        return {
          icon: Combine,
          label: 'Agregamento',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          cardBgColor: 'bg-blue-50'
        };
      case 'frete_completo':
        return {
          icon: Truck,
          label: 'Frete Completo',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          cardBgColor: 'bg-green-50'
        };
      case 'frete_de_retorno':
        return {
          icon: RotateCcw,
          label: 'Frete de Retorno',
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          cardBgColor: 'bg-orange-50'
        };
      default:
        return {
          icon: Package,
          label: tipo,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          cardBgColor: 'bg-gray-50'
        };
    }
  };

  const typeConfig = getFreightTypeConfig(freight.tipo_frete);
  const TypeIcon = typeConfig.icon;

  const formatValue = (value: number | null) => {
    if (!value) return 'Não definido';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Não definida';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getDestinationsText = () => {
    if (!freight.destinos || freight.destinos.length === 0) {
      return 'Destino não definido';
    }
    
    if (freight.destinos.length === 1) {
      const dest = freight.destinos[0];
      return `${dest.cidade}, ${dest.estado}`;
    }
    
    return `${freight.destinos.length} destinos`;
  };

  const handleInterest = () => {
    navigate('/login');
  };

  return (
    <Card className={`hover:shadow-lg transition-all duration-300 group ${typeConfig.cardBgColor} border-l-4 ${typeConfig.bgColor.replace('bg-', 'border-')}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${typeConfig.bgColor} rounded-lg flex items-center justify-center`}>
              <TypeIcon className={`w-6 h-6 ${typeConfig.color}`} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">
                {freight.codigo_agregamento || 'Frete Disponível'}
              </h3>
              <Badge variant="outline" className="text-xs">
                {typeConfig.label}
              </Badge>
            </div>
          </div>
          <FreightStatusBadge status={freight.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span className="font-medium">{freight.origem_cidade}, {freight.origem_estado}</span>
          <span>→</span>
          <span>{getDestinationsText()}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Package className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-gray-500">Mercadoria</p>
              <p className="font-medium">{freight.tipo_mercadoria || 'Não especificado'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-gray-500">Coleta</p>
              <p className="font-medium">{formatDate(freight.data_coleta)}</p>
            </div>
          </div>
        </div>

        {freight.valor_carga && (
          <div className="flex items-center space-x-2 text-sm">
            <DollarSign className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-gray-500">Valor da Carga</p>
              <p className="font-medium text-green-600">{formatValue(freight.valor_carga)}</p>
            </div>
          </div>
        )}

        <div className="flex pt-2 border-t">
          <Button
            onClick={handleInterest}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
          >
            <Handshake className="w-4 h-4 mr-2" />
            Tenho Interesse
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PublicFreightCard;
