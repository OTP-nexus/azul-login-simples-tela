
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFreightDetails } from '@/hooks/useFreightDetails';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Truck, 
  Package, 
  Clock, 
  FileText, 
  Phone, 
  User, 
  Shield, 
  Navigation,
  Handshake 
} from 'lucide-react';
import FreightTypeBadge from '@/components/FreightTypeBadge';
import { vehicleTypeGroups } from '@/lib/freightOptions';

const FreightDetails = () => {
  const { freightCode } = useParams<{ freightCode: string }>();
  const navigate = useNavigate();
  const { freight, loading, error } = useFreightDetails(freightCode || '');
  const { user } = useAuth();

  const allVehicleTypes = vehicleTypeGroups.flatMap(group => group.types);
  const vehicleTypeMap = new Map(allVehicleTypes.map(type => [type.value, type.label]));

  const getVehicleLabel = (value: unknown): string => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return getVehicleLabel(parsed);
      } catch (e) {
        const label = vehicleTypeMap.get(value);
        if (label) return label;
        return value.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      }
    }

    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value) && value.length > 0) {
        return getVehicleLabel(value[0]);
      }

      const vehicleObject = value as any;
      
      if (typeof vehicleObject.label === 'string' && vehicleObject.label) {
        return vehicleObject.label;
      }
      
      if (typeof vehicleObject.type === 'string' && vehicleObject.type) {
        return vehicleObject.type;
      }

      if (typeof vehicleObject.value === 'string') {
        const label = vehicleTypeMap.get(vehicleObject.value);
        if (label) return label;
        return vehicleObject.value.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      }
    }

    return 'Inválido';
  };

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
    if (freight?.destinos && freight.destinos.length > 0) {
      if (freight.destinos.length === 1) {
        const dest: any = freight.destinos[0];
        return `${dest.city || dest.cidade}, ${dest.state || dest.estado}`;
      }
      return freight.destinos.map((dest: any) => `${dest.city || dest.cidade}, ${dest.state || dest.estado}`).join('; ');
    }
    if (freight?.destino_cidade && freight.destino_estado) {
      return `${freight.destino_cidade}, ${freight.destino_estado}`;
    }
    return 'Destino não definido';
  };

  const handleInterest = () => {
    if (user) {
      // User is logged in, could implement interest functionality
      console.log('User interested in freight:', freightCode);
    } else {
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !freight) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Alert variant="destructive">
          <FileText className="h-4 w-4" />
          <AlertDescription>
            {error || 'Frete não encontrado'}
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          onClick={() => navigate('/lista-fretes')} 
          className="mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para lista
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/lista-fretes')}
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <FreightTypeBadge type={freight.tipo_frete} />
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {freight.codigo_agregamento}
        </h1>
        <p className="text-gray-600">
          Detalhes do frete • Criado em {formatDate(freight.created_at)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Origem e Destino */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                Trajeto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-blue-700">Origem</p>
                  <p className="text-gray-600">{freight.origem_cidade}, {freight.origem_estado}</p>
                </div>
              </div>

              {freight.paradas && freight.paradas.length > 0 && (
                <div className="border-l-2 border-dashed border-gray-300 ml-[5px] pl-6 space-y-3">
                  {freight.paradas.map((parada: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 -ml-[9px] flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-gray-700">Parada {index + 1}</p>
                        <p className="text-gray-600">{parada.cidade}, {parada.estado}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-green-700">Destino</p>
                  <p className="text-gray-600">{getDestinationsText()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações da Carga */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2 text-orange-600" />
                Informações da Carga
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Tipo de Mercadoria</p>
                  <p className="font-medium">{freight.tipo_mercadoria}</p>
                </div>
                {freight.peso_carga && (
                  <div>
                    <p className="text-sm text-gray-500">Peso da Carga</p>
                    <p className="font-medium">{freight.peso_carga} kg</p>
                  </div>
                )}
              </div>
              
              {freight.observacoes && (
                <div>
                  <p className="text-sm text-gray-500">Observações</p>
                  <p className="font-medium text-gray-700 bg-gray-50 p-3 rounded-lg mt-1">
                    {freight.observacoes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Veículos e Carrocerias */}
          {(freight.tipos_veiculos && freight.tipos_veiculos.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="w-5 h-5 mr-2 text-purple-600" />
                  Veículos Compatíveis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {freight.tipos_veiculos.map((type, index) => (
                    <Badge key={index} variant="secondary">
                      {getVehicleLabel(type)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Requisitos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-600" />
                Requisitos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${freight.precisa_seguro ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className={freight.precisa_seguro ? 'text-green-700' : 'text-gray-500'}>
                    {freight.precisa_seguro ? 'Seguro obrigatório' : 'Seguro não obrigatório'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${freight.precisa_rastreador ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className={freight.precisa_rastreador ? 'text-green-700' : 'text-gray-500'}>
                    {freight.precisa_rastreador ? 'Rastreador obrigatório' : 'Rastreador não obrigatório'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${freight.precisa_ajudante ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className={freight.precisa_ajudante ? 'text-green-700' : 'text-gray-500'}>
                    {freight.precisa_ajudante ? 'Ajudante obrigatório' : 'Ajudante não obrigatório'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Datas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Prazos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Data de Coleta</p>
                <p className="font-medium">{formatDate(freight.data_coleta)}</p>
              </div>
              {freight.data_entrega && (
                <div>
                  <p className="text-sm text-gray-500">Data de Entrega</p>
                  <p className="font-medium">{formatDate(freight.data_entrega)}</p>
                </div>
              )}
              {freight.horario_carregamento && (
                <div>
                  <p className="text-sm text-gray-500">Horário de Carregamento</p>
                  <p className="font-medium">{freight.horario_carregamento}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Valor */}
          {(freight.tipo_frete === 'frete_completo' || freight.tipo_frete === 'frete_de_retorno') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  Valor do Frete
                </CardTitle>
              </CardHeader>
              <CardContent>
                {freight.valor_carga && freight.valor_carga > 0 ? (
                  <p className="text-2xl font-bold text-green-600">{formatValue(freight.valor_carga)}</p>
                ) : (
                  <p className="text-lg font-medium text-gray-700">A combinar</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="w-5 h-5 mr-2 text-blue-600" />
                Contato
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user ? (
                <div className="space-y-3">
                  {freight.tipo_frete === 'comum' && freight.solicitante_nome && (
                    <div>
                      <p className="text-sm text-gray-500">Solicitante</p>
                      <p className="font-medium flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        {freight.solicitante_nome}
                      </p>
                    </div>
                  )}
                  {freight.tipo_frete === 'comum' && freight.solicitante_telefone && (
                    <div>
                      <p className="text-sm text-gray-500">Telefone</p>
                      <p className="font-medium flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        {freight.solicitante_telefone}
                      </p>
                    </div>
                  )}
                  {freight.tipo_frete !== 'comum' && (
                    <p className="text-gray-600">Entre em contato através da plataforma</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-3">
                    Para ter acesso ao contato você precisa estar logado
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/login')}
                  >
                    Fazer Login
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ação */}
          <Card>
            <CardContent className="pt-6">
              <Button 
                onClick={handleInterest} 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              >
                <Handshake className="w-4 h-4 mr-2" />
                Tenho Interesse
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FreightDetails;
