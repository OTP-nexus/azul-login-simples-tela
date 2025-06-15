
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Truck, RotateCcw, Combine, Package } from "lucide-react";

interface FreightTypeBadgeProps {
  type: string;
}

const FreightTypeBadge = ({ type }: FreightTypeBadgeProps) => {
  const getConfig = () => {
    switch (type) {
      case 'agregamento':
        return {
          icon: <Combine className="w-3.5 h-3.5 mr-1.5" />,
          label: 'Agregamento',
          className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
        };
      case 'frete_completo':
        return {
          icon: <Truck className="w-3.5 h-3.5 mr-1.5" />,
          label: 'Completo',
          className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
        };
      case 'frete_de_retorno':
        return {
          icon: <RotateCcw className="w-3.5 h-3.5 mr-1.5" />,
          label: 'Retorno',
          className: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200',
        };
      default:
        return {
          icon: <Package className="w-3.5 h-3.5 mr-1.5" />,
          label: 'N/A',
          className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200',
        };
    }
  };

  const config = getConfig();

  return (
    <Badge variant="outline" className={`py-1 ${config.className}`}>
      {config.icon}
      <span>{config.label}</span>
    </Badge>
  );
};

export default FreightTypeBadge;
