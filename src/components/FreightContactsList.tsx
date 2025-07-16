import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Phone, 
  MessageSquare, 
  User, 
  Truck, 
  Calendar, 
  MapPin,
  Star,
  ExternalLink
} from 'lucide-react';
import { useFreightInterest } from '@/hooks/useFreightInterest';
import { formatDate } from '@/utils/formatters';

interface FreightContactsListProps {
  className?: string;
}

const FreightContactsList = ({ className = '' }: FreightContactsListProps) => {
  const { getCompanyInterests } = useFreightInterest();

  const { data: interests = [], isLoading } = useQuery({
    queryKey: ['company-interests'],
    queryFn: getCompanyInterests,
    refetchInterval: 30000, // Refetch a cada 30 segundos
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'contacted':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'contacted':
        return 'Contatado';
      case 'accepted':
        return 'Aceito';
      case 'rejected':
        return 'Rejeitado';
      default:
        return status;
    }
  };

  const formatPhoneForWhatsApp = (phone: string) => {
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Se não começar com 55, adiciona (código do Brasil)
    if (!cleanPhone.startsWith('55')) {
      return `55${cleanPhone}`;
    }
    
    return cleanPhone;
  };

  const openWhatsApp = (phone: string, driverName: string, freightCode: string) => {
    const whatsappPhone = formatPhoneForWhatsApp(phone);
    const message = `Olá ${driverName}! Vi que você demonstrou interesse no frete ${freightCode}. Gostaria de conversar sobre os detalhes.`;
    const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const makeCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  if (isLoading) {
    return (
      <div className={`${className} space-y-4`}>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (interests.length === 0) {
    return (
      <div className={`${className} text-center py-8`}>
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum interesse recebido
        </h3>
        <p className="text-gray-500">
          Quando motoristas demonstrarem interesse nos seus fretes, eles aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className={`${className} space-y-4`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Interesses Recebidos ({interests.length})
        </h2>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          {interests.filter(i => i.company_response === 'pending').length} novos
        </Badge>
      </div>

      <div className="space-y-4">
        {interests.map((interest: any) => (
          <Card key={interest.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {interest.driver.user.full_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Interessado em: {interest.freight.codigo_agregamento}
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(interest.company_response)}>
                  {getStatusText(interest.company_response)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Informações do Frete */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Frete</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Origem</p>
                    <p className="font-medium">
                      {interest.freight.origem_cidade}, {interest.freight.origem_estado}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Destino</p>
                    <p className="font-medium">
                      {interest.freight.destino_cidade}, {interest.freight.destino_estado}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informações do Motorista */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Truck className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Veículo</span>
                  </div>
                  <p className="text-sm text-gray-600">{interest.driver.vehicle_type}</p>
                  <p className="text-sm text-gray-500">CNH: {interest.driver.cnh}</p>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Interesse</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formatDate(interest.created_at)}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Ações de Contato */}
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => openWhatsApp(
                    interest.driver.user.phone,
                    interest.driver.user.full_name,
                    interest.freight.codigo_agregamento
                  )}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => makeCall(interest.driver.user.phone)}
                  className="flex items-center space-x-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Ligar</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Ver Perfil</span>
                </Button>
              </div>

              {/* Contato direto */}
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Contato</span>
                </div>
                <p className="text-sm text-blue-700">
                  {interest.driver.user.phone}
                </p>
                {interest.driver.user.email && (
                  <p className="text-sm text-blue-600">
                    {interest.driver.user.email}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FreightContactsList;