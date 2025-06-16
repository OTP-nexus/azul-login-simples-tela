
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Package, 
  Calendar, 
  DollarSign, 
  Truck, 
  Shield, 
  Radar, 
  UserPlus,
  FileText,
  RotateCcw,
  Combine,
  Calculator,
  Route,
  ArrowLeft,
  Lock
} from "lucide-react";
import FreightStatusBadge from '@/components/FreightStatusBadge';
import type { ActiveFreight } from '@/hooks/useActiveFreights';
import { useNavigate } from 'react-router-dom';

const FreightDetails = () => {
  const { freightCode } = useParams<{ freightCode: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: freight, loading, error } = useQuery({
    queryKey: ['freight-details', freightCode],
    queryFn: async () => {
      if (!freightCode) {
        throw new Error('Código do frete não fornecido');
      }

      const { data, error } = await supabase
        .from('fretes')
        .select('*')
        .eq('codigo_agregamento', freightCode)
        .single();

      if (error) {
        throw new Error('Frete não encontrado');
      }

      return data as ActiveFreight;
    },
    enabled: !!freightCode
  });

  if (!freightCode) {
    return <Navigate to="/lista-fretes" replace />;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando detalhes do frete...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !freight) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Frete não encontrado</h3>
          <p className="text-gray-600 mb-6">O frete com código {freightCode} não foi encontrado.</p>
          <Button onClick={() => navigate('/lista-fretes')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para lista
          </Button>
        </div>
      </div>
    );
  }

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
      case 'comum':
        return {
          icon: Package,
          label: 'Frete Comum',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50'
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

  const formatDateTime = (date: string | null) => {
    if (!date) return 'Não definido';
    return new Date(date).toLocaleString('pt-BR');
  };

  // Função para "desembrulhar" arrays aninhados
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

  const extractDisplayText = (item: any) => {
    if (typeof item === 'string') {
      return item;
    }
    
    if (typeof item === 'object' && item !== null) {
      const textFields = [
        'nome', 'name', 'tipo', 'type', 'descricao', 'description', 
        'label', 'title', 'categoria', 'category', 'modelo', 'model',
        'cidade', 'city', 'estado', 'state'
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

  const renderDestinations = () => {
    const flattenedDestinations = flattenNestedArrays(freight.destinos);
    
    if (!Array.isArray(flattenedDestinations) || flattenedDestinations.length === 0) {
      return <p className="text-gray-500 italic">Nenhum destino definido</p>;
    }

    return (
      <div className="space-y-2">
        {flattenedDestinations.map((destino: any, index: number) => {
          if (typeof destino === 'string') {
            return (
              <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="font-medium text-green-900">{destino}</p>
              </div>
            );
          }

          if (typeof destino === 'object' && destino !== null) {
            const cidade = destino.cidade || destino.city || '';
            const estado = destino.estado || destino.state || '';
            const cep = destino.cep || '';
            const bairro = destino.bairro || destino.neighborhood || '';
            const endereco = destino.endereco || destino.address || '';

            return (
              <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="text-sm">
                  <p className="font-medium text-green-900">
                    {cidade && estado ? `${cidade}, ${estado}` : extractDisplayText(destino)}
                  </p>
                  {cep && <p className="text-green-700 text-xs mt-1">CEP: {cep}</p>}
                  {bairro && <p className="text-green-700 text-xs">Bairro: {bairro}</p>}
                  {endereco && <p className="text-green-700 text-xs">Endereço: {endereco}</p>}
                </div>
              </div>
            );
          }

          return (
            <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="font-medium text-green-900">{String(destino)}</p>
            </div>
          );
        })}
      </div>
    );
  };

  const renderVehiclesAndBodies = (items: any[], emptyMessage: string = 'Não especificado') => {
    const flattenedItems = flattenNestedArrays(items);
    
    if (!Array.isArray(flattenedItems) || flattenedItems.length === 0) {
      return <p className="text-gray-500 italic">{emptyMessage}</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {flattenedItems.map((item: any, index: number) => {
          const displayText = extractDisplayText(item);

          return (
            <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm font-medium text-blue-900">{displayText}</div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSimpleBadges = (items: any[], emptyMessage: string = 'Não especificado') => {
    const flattenedItems = flattenNestedArrays(items);
    
    if (!Array.isArray(flattenedItems) || flattenedItems.length === 0) {
      return <p className="text-gray-500 italic">{emptyMessage}</p>;
    }

    return (
      <div className="flex flex-wrap gap-2">
        {flattenedItems.map((item: any, index: number) => {
          const displayText = extractDisplayText(item);

          return (
            <Badge key={index} variant="outline" className="mr-1 mb-1">
              {displayText}
            </Badge>
          );
        })}
      </div>
    );
  };

  const ContactRestrictedMessage = () => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-center p-6 bg-blue-50 rounded-lg">
          <div className="text-center">
            <Lock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Acesso Restrito</h3>
            <p className="text-blue-700 mb-4">
              Para ter acesso às informações de contato, você precisa estar logado.
            </p>
            <Button onClick={() => navigate('/login')} className="bg-blue-600 hover:bg-blue-700">
              Fazer Login
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => navigate('/lista-fretes')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para lista
        </Button>
      </div>

      {/* Título */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${typeConfig.bgColor} rounded-lg flex items-center justify-center`}>
              <TypeIcon className={`w-6 h-6 ${typeConfig.color}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{freight.codigo_agregamento}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline">{typeConfig.label}</Badge>
                <FreightStatusBadge status={freight.status} />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Informações Gerais</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Data de Coleta</p>
              <p className="font-medium">{formatDate(freight.data_coleta)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Data de Entrega</p>
              <p className="font-medium">{formatDate(freight.data_entrega)}</p>
            </div>
            {freight.horario_carregamento && (
              <div>
                <p className="text-sm text-gray-500">Horário de Carregamento</p>
                <p className="font-medium">{freight.horario_carregamento}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Criado em</p>
              <p className="font-medium">{formatDateTime(freight.created_at)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Origem e Destinos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Origem e Destinos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Origem</p>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="font-medium text-blue-900">{freight.origem_cidade}, {freight.origem_estado}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-2">Destinos</p>
                {renderDestinations()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detalhes da Carga */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Detalhes da Carga</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Tipo de Mercadoria</p>
              <p className="font-medium">{freight.tipo_mercadoria || 'Não especificado'}</p>
            </div>
            {freight.peso_carga && (
              <div>
                <p className="text-sm text-gray-500">Peso da Carga</p>
                <p className="font-medium">{freight.peso_carga} kg</p>
              </div>
            )}
            {freight.valor_carga && (
              <div>
                <p className="text-sm text-gray-500">Valor da Carga</p>
                <p className="font-medium">{formatValue(freight.valor_carga)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Veículos e Carrocerias */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Truck className="w-5 h-5" />
              <span>Veículos e Carrocerias</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-3">Tipos de Veículos Aceitos</p>
                {renderVehiclesAndBodies(freight.tipos_veiculos, 'Nenhum tipo de veículo especificado')}
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-3">Tipos de Carrocerias Aceitas</p>
                {renderVehiclesAndBodies(freight.tipos_carrocerias, 'Nenhum tipo de carroceria especificado')}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações e Extras */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Configurações e Extras</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-2">
                <Shield className={freight.precisa_seguro ? "w-4 h-4 text-green-600" : "w-4 h-4 text-gray-400"} />
                <span className={freight.precisa_seguro ? "text-green-600" : "text-gray-400"}>
                  Seguro {freight.precisa_seguro ? "necessário" : "não necessário"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Radar className={freight.precisa_rastreador ? "w-4 h-4 text-green-600" : "w-4 h-4 text-gray-400"} />
                <span className={freight.precisa_rastreador ? "text-green-600" : "text-gray-400"}>
                  Rastreador {freight.precisa_rastreador ? "necessário" : "não necessário"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <UserPlus className={freight.precisa_ajudante ? "w-4 h-4 text-green-600" : "w-4 h-4 text-gray-400"} />
                <span className={freight.precisa_ajudante ? "text-green-600" : "text-gray-400"}>
                  Ajudante {freight.precisa_ajudante ? "necessário" : "não necessário"}
                </span>
              </div>
              {freight.pedagio_pago_por && (
                <div>
                  <p className="text-sm text-gray-500">Pedágio pago por</p>
                  <p className="font-medium capitalize">{freight.pedagio_pago_por}</p>
                  {freight.pedagio_direcao && (
                    <p className="text-sm text-gray-600">Direção: {freight.pedagio_direcao}</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informações de Contato ou Acesso Restrito */}
        {!user ? (
          <ContactRestrictedMessage />
        ) : (
          freight.tipo_frete === 'comum' && freight.solicitante_nome && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Informações de Contato</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Solicitante</p>
                  <p className="font-medium">{freight.solicitante_nome}</p>
                </div>
                {freight.solicitante_telefone && (
                  <div>
                    <p className="text-sm text-gray-500">Telefone</p>
                    <p className="font-medium">{freight.solicitante_telefone}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        )}

        {/* Observações */}
        {freight.observacoes && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Observações</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{freight.observacoes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FreightDetails;
