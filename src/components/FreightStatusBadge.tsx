
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Truck, XCircle, AlertCircle } from "lucide-react";

interface FreightStatusBadgeProps {
  status: string;
  className?: string;
}

const FreightStatusBadge = ({ status, className = "" }: FreightStatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ativo':
        return {
          variant: 'default' as const,
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Truck,
          text: 'Ativo'
        };
      case 'pendente':
        return {
          variant: 'default' as const,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: AlertCircle,
          text: 'Pendente'
        };
      case 'aceito':
        return {
          variant: 'default' as const,
          className: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: CheckCircle,
          text: 'Aceito'
        };
      case 'em_andamento':
        return {
          variant: 'default' as const,
          className: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Truck,
          text: 'Em Andamento'
        };
      case 'concluido':
        return {
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          text: 'Concluído'
        };
      case 'cancelado':
        return {
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          text: 'Cancelado'
        };
      default:
        return {
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertCircle,
          text: status
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} flex items-center space-x-1 ${className}`}
    >
      <Icon className="w-3 h-3" />
      <span>{config.text}</span>
    </Badge>
  );
};

export default FreightStatusBadge;
