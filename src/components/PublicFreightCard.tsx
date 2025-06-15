import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Package, MapPin, Calendar, DollarSign, RotateCcw, Combine, Handshake, ChevronDown } from "lucide-react";
import FreightTypeBadge from './FreightTypeBadge';
import type { Freight } from '@/hooks/usePublicFreights';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { vehicleTypeGroups } from "@/lib/freightOptions";

interface PublicFreightCardProps {
  freight: Freight;
}

const allVehicleTypes = vehicleTypeGroups.flatMap(group => group.types);
const vehicleTypeMap = new Map(allVehicleTypes.map(type => [type.value, type.label]));

const getVehicleLabel = (value: unknown): string => {
  // Case 1: Value is a string
  if (typeof value === 'string') {
    // It might be a simple value like 'carreta' or a JSON string.
    try {
      const parsed = JSON.parse(value);
      // If parsing succeeds, it's a JSON object/array, process it recursively.
      return getVehicleLabel(parsed);
    } catch (e) {
      // If parsing fails, it's a plain string value e.g., 'caminhao_toco'
      const label = vehicleTypeMap.get(value);
      if (label) {
        return label;
      }
      // Fallback for values not in the map
      return value
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  }

  // Case 2: Value is an object (and not null)
  if (typeof value === 'object' && value !== null) {
    // The freight form sometimes wraps the array in another array
    if (Array.isArray(value) && value.length > 0) {
      // Handle nested array, e.g. [['carreta']] or [[{type: 'Carreta'}]]
      return getVehicleLabel(value[0]);
    }

    const vehicleObject = value as any;
    
    // Priority 1: 'label' property (most explicit)
    if (typeof vehicleObject.label === 'string' && vehicleObject.label) {
      return vehicleObject.label;
    }
    
    // Priority 2: 'type' property (found in some Supabase records)
    if (typeof vehicleObject.type === 'string' && vehicleObject.type) {
      return vehicleObject.type;
    }

    // Priority 3: 'value' property (standard from select components)
    if (typeof vehicleObject.value === 'string') {
      const label = vehicleTypeMap.get(vehicleObject.value);
      if (label) {
        return label;
      }
      // Fallback for value string
      return vehicleObject.value
        .split('_')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  }

  // If none of the above, it's an invalid format
  return 'Inválido';
};


const PublicFreightCard = ({
  freight
}: PublicFreightCardProps) => {
  const navigate = useNavigate();
  const [isStopsExpanded, setIsStopsExpanded] = useState(false);
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
      case 'comum':
        return {
          icon: Package,
          label: 'Frete Comum',
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          cardBgColor: 'bg-purple-50'
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
    if (freight.destinos && freight.destinos.length > 0) {
      if (freight.destinos.length === 1) {
        const dest: any = freight.destinos[0];
        return `${dest.city || dest.cidade}, ${dest.state || dest.estado}`;
      }
      return `${freight.destinos.length} destinos`;
    }
    if (freight.destino_cidade && freight.destino_estado) {
      return `${freight.destino_cidade}, ${freight.destino_estado}`;
    }
    return 'Destino não definido';
  };
  const handleInterest = () => {
    navigate('/login');
  };
  return <Card className={`hover:shadow-lg transition-all duration-300 group ${typeConfig.cardBgColor} border-l-4 ${typeConfig.bgColor.replace('bg-', 'border-')}`}>
      <CardHeader className="pb-3">
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${typeConfig.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <TypeIcon className={`w-6 h-6 ${typeConfig.color}`} />
            </div>
            <div>
              <h3 className="font-bold text-xs md:text-lg text-gray-800">
                {freight.codigo_agregamento || 'Frete Disponível'}
              </h3>
            </div>
          </div>
          <div className="self-end sm:self-auto">
            <FreightTypeBadge type={freight.tipo_frete} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-blue-700 text-base">{freight.origem_cidade}, {freight.origem_estado}</span>
          </div>

          <div className="pl-2">
            {freight.paradas && freight.paradas.length > 0 && <Collapsible open={isStopsExpanded} onOpenChange={setIsStopsExpanded}>
                <div className="border-l-2 border-dashed border-gray-300 ml-[7px] pl-4 py-1 space-y-2">
                  {/* First stop is always visible */}
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full shrink-0 -ml-[9px]"></div>
                    <span className="text-gray-500">{freight.paradas[0].cidade}, {freight.paradas[0].estado}</span>
                  </div>

                  {/* The rest of the stops are collapsible */}
                  <CollapsibleContent className="space-y-2">
                    {freight.paradas.slice(1).map((parada: any, index: number) => <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full shrink-0 -ml-[9px]"></div>
                        <span className="text-gray-500">{parada.cidade}, {parada.estado}</span>
                      </div>)}
                  </CollapsibleContent>
                </div>

                {freight.paradas.length > 1 && <CollapsibleTrigger asChild>
                    <Button variant="link" className="text-blue-600 hover:text-blue-800 text-xs h-auto py-1 px-0 ml-5 flex items-center">
                      {isStopsExpanded ? 'Ver menos' : `+ ${freight.paradas.length - 1} parada(s)`}
                      <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isStopsExpanded ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>}
              </Collapsible>}
          </div>
          
          <div className="flex items-center space-x-2 text-gray-600">
            <MapPin className="w-4 h-4 text-green-600" />
            <span className="font-medium text-base">{getDestinationsText()}</span>
          </div>
        </div>

        {freight.tipos_veiculos && freight.tipos_veiculos.length > 0 && (
          <div className="text-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Truck className="w-4 h-4 text-gray-500" />
              <p className="text-gray-500">Veículos compatíveis</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {freight.tipos_veiculos.map((type, index) => (
                <Badge key={index} variant="secondary" className="font-normal">
                  {getVehicleLabel(type)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-500" />
          <div>
            <p className="text-gray-500">Coleta</p>
            <p className="font-medium text-base">{formatDate(freight.data_coleta)}</p>
          </div>
        </div>

        {(freight.tipo_frete === 'frete_completo' || freight.tipo_frete === 'frete_de_retorno') && <div className="flex items-center space-x-2 text-sm">
            <DollarSign className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-gray-500">Valor do Frete</p>
              {freight.valor_carga && freight.valor_carga > 0 ? <p className="font-medium text-green-600">{formatValue(freight.valor_carga)}</p> : <p className="font-medium text-gray-700">A combinar</p>}
            </div>
          </div>}

        <div className="flex pt-2 border-t">
          <Button onClick={handleInterest} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
            <Handshake className="w-4 h-4 mr-2" />
            Tenho Interesse
          </Button>
        </div>
      </CardContent>
    </Card>;
};
export default PublicFreightCard;
