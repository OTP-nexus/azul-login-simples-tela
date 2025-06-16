
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Package, 
  Calendar, 
  DollarSign, 
  Truck, 
  Eye,
  Shield,
  Radar,
  UserPlus
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import FreightTypeBadge from './FreightTypeBadge';
import FreightStatusBadge from './FreightStatusBadge';
import type { Freight } from '@/hooks/usePublicFreights';

interface PublicFreightCardProps {
  freight: Freight;
}

const PublicFreightCard = ({ freight }: PublicFreightCardProps) => {
  const navigate = useNavigate();

  const formatValue = (value: number | null) => {
    if (!value) return 'Não informado';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Não informada';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const extractDisplayText = (item: any) => {
    if (typeof item === 'string') {
      return item;
    }
    
    if (typeof item === 'object' && item !== null) {
      const textFields = [
        'nome', 'name', 'tipo', 'type', 'descricao', 'description', 
        'label', 'title', 'categoria', 'category', 'modelo', 'model'
      ];
      
      for (const field of textFields) {
        if (item[field] && typeof item[field] === 'string') {
          return item[field];
        }
      }
      
      const firstStringValue = Object.values(item).find(value => typeof value === 'string');
      if (firstStringValue) {
        return firstStringValue;
      }
    }
    
    return String(item);
  };

  const flattenNestedArrays = (data: any): any[] => {
    if (!data) return [];
    
    if (Array.isArray(data)) {
      if (data.length === 1 && Array.isArray(data[0])) {
        return data[0];
      }
      if (data.length === 1 && typeof data[0] === 'string' && data[0].startsWith('[')) {
        try {
          return JSON.parse(data[0]);
        } catch {
          return data;
        }
      }
      return data;
    }

    if (typeof data === 'string' && data.startsWith('[')) {
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return [data];
      }
    }

    if (typeof data === 'object') {
      return [data];
    }

    return [data];
  };

  const getFirstDestination = () => {
    const flattenedDestinations = flattenNestedArrays(freight.destinos);
    
    if (!Array.isArray(flattenedDestinations) || flattenedDestinations.length === 0) {
      return freight.destino_cidade && freight.destino_estado 
        ? `${freight.destino_cidade}, ${freight.destino_estado}`
        : 'Destino não especificado';
    }

    const firstDestination = flattenedDestinations[0];
    
    if (typeof firstDestination === 'string') {
      return firstDestination;
    }
    
    if (typeof firstDestination === 'object' && firstDestination !== null) {
      const cidade = firstDestination.cidade || firstDestination.city || '';
      const estado = firstDestination.estado || firstDestination.state || '';
      
      if (cidade && estado) {
        return `${cidade}, ${estado}`;
      }
      
      return extractDisplayText(firstDestination);
    }
    
    return 'Destino não especificado';
  };

  const getVehicleTypesDisplay = () => {
    const flattenedVehicles = flattenNestedArrays(freight.tipos_veiculos);
    
    if (!Array.isArray(flattenedVehicles) || flattenedVehicles.length === 0) {
      return 'Não especificado';
    }

    return flattenedVehicles
      .slice(0, 2)
      .map(vehicle => extractDisplayText(vehicle))
      .join(', ') + (flattenedVehicles.length > 2 ? '...' : '');
  };

  const handleViewDetails = () => {
    navigate(`/frete/${freight.codigo_agregamento}`);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold text-gray-800">
              {freight.codigo_agregamento || 'Código não gerado'}
            </CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              <FreightTypeBadge type={freight.tipo_frete} />
              <FreightStatusBadge status={freight.status} />
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Origem e Destino */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <div className="text-sm">
              <span className="font-medium">Origem:</span> {freight.origem_cidade}, {freight.origem_estado}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-green-600" />
            <div className="text-sm">
              <span className="font-medium">Destino:</span> {getFirstDestination()}
            </div>
          </div>
        </div>

        {/* Mercadoria e Datas */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Package className="w-4 h-4 text-gray-600" />
            <div>
              <p className="text-gray-500">Mercadoria</p>
              <p className="font-medium">{freight.tipo_mercadoria || 'Não especificado'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-600" />
            <div>
              <p className="text-gray-500">Coleta</p>
              <p className="font-medium">{formatDate(freight.data_coleta)}</p>
            </div>
          </div>
        </div>

        {/* Peso e Valor */}
        {(freight.peso_carga || freight.valor_carga) && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {freight.peso_carga && (
              <div>
                <p className="text-gray-500">Peso</p>
                <p className="font-medium">{freight.peso_carga} kg</p>
              </div>
            )}
            {freight.valor_carga && (
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="text-gray-500">Valor da Carga</p>
                  <p className="font-medium">{formatValue(freight.valor_carga)}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tipos de Veículos */}
        <div className="text-sm">
          <div className="flex items-center space-x-2 mb-1">
            <Truck className="w-4 h-4 text-gray-600" />
            <span className="text-gray-500">Veículos:</span>
          </div>
          <p className="font-medium">{getVehicleTypesDisplay()}</p>
        </div>

        {/* Extras */}
        <div className="flex flex-wrap gap-2">
          {freight.precisa_seguro && (
            <Badge variant="outline" className="text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Seguro
            </Badge>
          )}
          {freight.precisa_rastreador && (
            <Badge variant="outline" className="text-xs">
              <Radar className="w-3 h-3 mr-1" />
              Rastreador
            </Badge>
          )}
          {freight.precisa_ajudante && (
            <Badge variant="outline" className="text-xs">
              <UserPlus className="w-3 h-3 mr-1" />
              Ajudante
            </Badge>
          )}
        </div>

        {/* Botão de Ver Detalhes */}
        <Button 
          onClick={handleViewDetails}
          className="w-full mt-4"
          variant="outline"
        >
          <Eye className="w-4 h-4 mr-2" />
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  );
};

export default PublicFreightCard;
