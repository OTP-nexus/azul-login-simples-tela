
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, Package, MapPin, Calendar, DollarSign, Eye, CheckCircle, Trash2, RotateCcw, Combine } from "lucide-react";
import FreightStatusBadge from './FreightStatusBadge';
import type { ActiveFreight } from '@/hooks/useActiveFreights';

interface FreightCardProps {
  freight: ActiveFreight;
  onViewDetails: (freight: ActiveFreight) => void;
  onComplete: (freightId: string) => void;
  onDelete: (freightId: string) => void;
}

const FreightCard = ({ freight, onViewDetails, onComplete, onDelete }: FreightCardProps) => {
  const getFreightTypeConfig = (tipo: string) => {
    switch (tipo) {
      case 'agregamento':
        return {
          icon: Combine,
          label: 'Agregamento',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50'
        };
      case 'frete_completo':
        return {
          icon: Truck,
          label: 'Frete Completo',
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        };
      case 'frete_de_retorno':
        return {
          icon: RotateCcw,
          label: 'Frete de Retorno',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        };
      default:
        return {
          icon: Package,
          label: tipo,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50'
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

  return (
    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${typeConfig.bgColor} rounded-lg flex items-center justify-center`}>
              <TypeIcon className={`w-6 h-6 ${typeConfig.color}`} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">
                {freight.codigo_agregamento || 'Código não gerado'}
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
        {/* Origem e Destino */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span className="font-medium">{freight.origem_cidade}, {freight.origem_estado}</span>
          <span>→</span>
          <span>{getDestinationsText()}</span>
        </div>

        {/* Informações da Carga */}
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

        {/* Valor */}
        {freight.valor_carga && (
          <div className="flex items-center space-x-2 text-sm">
            <DollarSign className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-gray-500">Valor da Carga</p>
              <p className="font-medium text-green-600">{formatValue(freight.valor_carga)}</p>
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex space-x-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(freight);
            }}
            className="flex items-center space-x-1 flex-1"
          >
            <Eye className="w-4 h-4" />
            <span>Detalhes</span>
          </Button>
          
          {freight.status === 'pendente' && (
            <Button
              variant="default"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onComplete(freight.id);
              }}
              className="flex items-center space-x-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Concluir</span>
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(freight.id);
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FreightCard;
