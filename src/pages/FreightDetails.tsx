import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useFreightByCode } from '@/hooks/useFreightByCode';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MapPin, Package, Calendar, DollarSign, Truck, Users, Shield, Radar, UserPlus, Clock, AlertTriangle, FileText, RotateCcw, Combine, Calculator, Route, Settings, User, Phone, Mail } from "lucide-react";
import FreightTypeBadge from '@/components/FreightTypeBadge';
import { useAuth } from '@/hooks/useAuth';

const FreightDetails = () => {
  const {
    freightCode
  } = useParams<{
    freightCode: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    data: freight,
    isLoading,
    error
  } = useFreightByCode(freightCode);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>;
  }
  if (error || !freight) {
    return <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Frete não encontrado</h1>
          <p className="text-gray-600 mb-6">O código do frete informado não foi encontrado.</p>
          <Button onClick={() => navigate('/lista-fretes')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para lista
          </Button>
        </div>
      </div>;
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

    // Se já é um array
    if (Array.isArray(data)) {
      // Se tem apenas um elemento e esse elemento é um array, desembrulhar
      if (data.length === 1 && Array.isArray(data[0])) {
        return data[0];
      }
      // Se tem apenas um elemento e esse elemento é uma string que parece JSON
      if (data.length === 1 && typeof data[0] === 'string' && data[0].startsWith('[')) {
        try {
          return JSON.parse(data[0]);
        } catch {
          return data;
        }
      }
      return data;
    }

    // Se é uma string que parece JSON
    if (typeof data === 'string' && data.startsWith('[')) {
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return [data];
      }
    }

    // Se é um objeto único, colocar em array
    if (typeof data === 'object') {
      return [data];
    }
    return [data];
  };

  // Função para extrair texto legível de objetos
  const extractDisplayText = (item: any) => {
    if (typeof item === 'string') {
      return item;
    }
    if (typeof item === 'object' && item !== null) {
      // Priorizar campos mais descritivos
      const textFields = ['nome', 'name', 'tipo', 'type', 'descricao', 'description', 'label', 'title', 'categoria', 'category', 'modelo', 'model', 'cidade', 'city', 'estado', 'state'];
      for (const field of textFields) {
        if (item[field] && typeof item[field] === 'string') {
          return item[field];
        }
      }

      // Se não encontrou campos conhecidos, pegar a primeira propriedade string
      const firstStringValue = Object.values(item).find(value => typeof value === 'string');
      if (firstStringValue) {
        return firstStringValue;
      }
    }
    return String(item);
  };

  // Função melhorada para renderizar destinos
  const renderDestinations = () => {
    const flattenedDestinations = flattenNestedArrays(freight.destinos);
    if (!Array.isArray(flattenedDestinations) || flattenedDestinations.length === 0) {
      return <p className="text-gray-500 italic">Nenhum destino definido</p>;
    }
    return <div className="space-y-2">
        {flattenedDestinations.map((destino: any, index: number) => {
        // Se o destino é uma string simples
        if (typeof destino === 'string') {
          return <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="font-medium text-green-900">{destino}</p>
              </div>;
        }

        // Se o destino é um objeto
        if (typeof destino === 'object' && destino !== null) {
          const cidade = destino.cidade || destino.city || '';
          const estado = destino.estado || destino.state || '';
          const cep = destino.cep || '';
          const bairro = destino.bairro || destino.neighborhood || '';
          const endereco = destino.endereco || destino.address || '';
          return <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="text-sm">
                  <p className="font-medium text-green-900">
                    {cidade && estado ? `${cidade}, ${estado}` : extractDisplayText(destino)}
                  </p>
                  {cep && <p className="text-green-700 text-xs mt-1">CEP: {cep}</p>}
                  {bairro && <p className="text-green-700 text-xs">Bairro: {bairro}</p>}
                  {endereco && <p className="text-green-700 text-xs">Endereço: {endereco}</p>}
                </div>
              </div>;
        }
        return <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="font-medium text-green-900">{String(destino)}</p>
            </div>;
      })}
      </div>;
  };

  // Função melhorada para renderizar paradas
  const renderStops = () => {
    const flattenedStops = flattenNestedArrays(freight.paradas);
    if (!Array.isArray(flattenedStops) || flattenedStops.length === 0) {
      return null;
    }
    return <div>
        <p className="text-sm text-gray-500 mb-2">Paradas</p>
        <div className="space-y-2">
          {flattenedStops.map((parada: any, index: number) => {
          if (typeof parada === 'string') {
            return <div key={index} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p className="font-medium text-yellow-900">{parada}</p>
                </div>;
          }
          if (typeof parada === 'object' && parada !== null) {
            const cidade = parada.cidade || parada.city || '';
            const estado = parada.estado || parada.state || '';
            return <div key={index} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p className="font-medium text-yellow-900">
                    {cidade && estado ? `${cidade}, ${estado}` : extractDisplayText(parada)}
                  </p>
                </div>;
          }
          return <div key={index} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <p className="font-medium text-yellow-900">{String(parada)}</p>
              </div>;
        })}
        </div>
      </div>;
  };

  // Função melhorada para renderizar itens de array com formatação adequada
  const renderVehiclesAndBodies = (items: any, emptyMessage: string = 'Não especificado') => {
    const flattenedItems = flattenNestedArrays(items);
    if (!Array.isArray(flattenedItems) || flattenedItems.length === 0) {
      return <p className="text-gray-500 italic">{emptyMessage}</p>;
    }
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {flattenedItems.map((item: any, index: number) => {
        const displayText = extractDisplayText(item);
        return <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm font-medium text-blue-900">{displayText}</div>
            </div>;
      })}
      </div>;
  };

  // Função específica para renderizar badges simples
  const renderSimpleBadges = (items: any, emptyMessage: string = 'Não especificado') => {
    const flattenedItems = flattenNestedArrays(items);
    if (!Array.isArray(flattenedItems) || flattenedItems.length === 0) {
      return <p className="text-gray-500 italic">{emptyMessage}</p>;
    }
    return <div className="flex flex-wrap gap-2">
        {flattenedItems.map((item: any, index: number) => {
        const displayText = extractDisplayText(item);
        return <Badge key={index} variant="outline" className="mr-1 mb-1">
              {displayText}
            </Badge>;
      })}
      </div>;
  };

  // Helper function to render pricing tables for agregamento
  const renderPricingTables = () => {
    const flattenedTables = flattenNestedArrays(freight.tabelas_preco);
    console.log('Tabelas de preço originais:', freight.tabelas_preco);
    console.log('Tabelas de preço após flatten:', flattenedTables);
    if (!Array.isArray(flattenedTables) || flattenedTables.length === 0) {
      return <p className="text-gray-500 italic">Nenhuma tabela de preços definida</p>;
    }
    return <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="pricing-tables">
          <AccordionTrigger className="text-left">
            <div className="flex items-center space-x-2">
              <Calculator className="w-4 h-4" />
              <span>Ver Tabelas de Preços ({flattenedTables.length} {flattenedTables.length === 1 ? 'tabela' : 'tabelas'})</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {flattenedTables.map((tabela: any, index: number) => {
              console.log('Processando tabela:', tabela);
              const vehicleType = tabela.vehicleType || tabela.vehicle_type || tabela.tipo_veiculo || 'Não especificado';
              const ranges = tabela.ranges || [];
              if (!Array.isArray(ranges) || ranges.length === 0) {
                return <div key={index} className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <p className="text-red-800 font-medium">{vehicleType}</p>
                      <p className="text-red-600 text-sm">Nenhuma faixa de preço definida</p>
                    </div>;
              }
              return <div key={index} className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-3 text-lg">{vehicleType}</h4>
                    <div className="space-y-3">
                      {ranges.map((range: any, rangeIndex: number) => {
                    const kmStart = range.kmStart || range.km_start || range.km_inicio || 0;
                    const kmEnd = range.kmEnd || range.km_end || range.km_fim || 0;
                    const price = range.price || range.preco || range.valor || 0;
                    return <div key={range.id || rangeIndex} className="bg-white p-3 rounded border border-green-300">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                              <div className="flex-1">
                                <p className="text-gray-600 text-xs font-medium mb-1 sm:mb-0">Distância</p>
                                <p className="font-medium text-gray-900 text-sm">{kmStart} - {kmEnd} km</p>
                              </div>
                              <div className="flex-1 sm:text-right">
                                <p className="text-gray-600 text-xs font-medium mb-1 sm:mb-0">Valor</p>
                                <p className="font-semibold text-green-600 text-base sm:text-lg">{formatValue(price)}</p>
                              </div>
                            </div>
                          </div>;
                  })}
                    </div>
                    
                    {/* Mostrar dados brutos para debug se necessário */}
                    {process.env.NODE_ENV === 'development'}
                  </div>;
            })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>;
  };

  // Helper function to render benefits for agregamento
  const renderBenefits = () => {
    return renderSimpleBadges(freight.beneficios, 'Nenhum benefício definido');
  };

  // Helper function to render scheduling rules for agregamento
  const renderSchedulingRules = () => {
    const flattenedRules = flattenNestedArrays(freight.regras_agendamento);
    if (!Array.isArray(flattenedRules) || flattenedRules.length === 0) {
      return <p className="text-gray-500 italic">Nenhuma regra de agendamento definida</p>;
    }
    return flattenedRules.map((regra: any, index: number) => {
      const displayText = extractDisplayText(regra);
      return <div key={index} className="bg-orange-50 p-3 rounded-lg border border-orange-200">
          <p className="text-sm text-orange-800">{displayText}</p>
        </div>;
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Button onClick={() => navigate('/lista-fretes')} variant="outline" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-12 h-12 ${typeConfig.bgColor} rounded-lg flex items-center justify-center`}>
            <TypeIcon className={`w-6 h-6 ${typeConfig.color}`} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {freight.codigo_agregamento || 'Código não gerado'}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline">{typeConfig.label}</Badge>
              <FreightTypeBadge type={freight.tipo_frete} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Informações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Informações Gerais</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {freight.tipo_frete === 'agregamento' ? (
              // Para agregamento, mostrar apenas o horário de carregamento com fonte maior
              <>
                {freight.horario_carregamento && (
                  <div className="col-span-2 text-center">
                    <p className="text-sm text-gray-500 mb-2">Horário de Carregamento</p>
                    <p className="font-bold text-2xl text-blue-600">{freight.horario_carregamento}</p>
                  </div>
                )}
              </>
            ) : (
              // Para outros tipos de frete, mostrar todas as informações
              <>
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
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">{freight.status || 'Ativo'}</p>
                </div>
              </>
            )}
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

              {renderStops()}
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
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Tipo de Mercadoria</p>
              <p className="font-medium">{freight.tipo_mercadoria || 'Não especificado'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Peso da Carga</p>
              <p className="font-medium">
                {freight.peso_carga ? `${freight.peso_carga} kg` : 'Não especificado'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Valor da Carga</p>
              <p className="font-medium">{formatValue(freight.valor_carga)}</p>
            </div>
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

        {/* Seções específicas para Agregamento */}
        {freight.tipo_frete === 'agregamento' && <>
            {/* Tabelas de Preços */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="w-5 h-5" />
                  <span>Tabelas de Preços</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderPricingTables()}
              </CardContent>
            </Card>

            {/* Benefícios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Benefícios Oferecidos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {renderBenefits()}
                </div>
              </CardContent>
            </Card>

            {/* Regras de Agendamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Route className="w-5 h-5" />
                  <span>Regras de Agendamento</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {renderSchedulingRules()}
                </div>
              </CardContent>
            </Card>
          </>}

        {/* Configurações e Extras */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Configurações e Extras</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
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
              {freight.pedagio_pago_por && <div>
                  <p className="text-sm text-gray-500">Pedágio pago por</p>
                  <p className="font-medium capitalize">{freight.pedagio_pago_por}</p>
                  {freight.pedagio_direcao && <p className="text-sm text-gray-600">Direção: {freight.pedagio_direcao}</p>}
                </div>}
            </div>
          </CardContent>
        </Card>

        {/* Recursos da Origem - Apenas para frete comum */}
        {freight.tipo_frete === 'comum' && (
          <Card>
            <CardHeader>
              <CardTitle>Recursos da Origem</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <span className={freight.origem_possui_carga_descarga ? "text-green-600" : "text-gray-400"}>
                    {freight.origem_possui_carga_descarga ? "✓" : "✗"} Carga/Descarga
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={freight.origem_possui_escada ? "text-green-600" : "text-gray-400"}>
                    {freight.origem_possui_escada ? "✓" : "✗"} Escada
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={freight.origem_possui_elevador ? "text-green-600" : "text-gray-400"}>
                    {freight.origem_possui_elevador ? "✓" : "✗"} Elevador
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={freight.origem_possui_doca ? "text-green-600" : "text-gray-400"}>
                    {freight.origem_possui_doca ? "✓" : "✗"} Doca
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recursos do Destino - Apenas para frete comum */}
        {freight.tipo_frete === 'comum' && (
          <Card>
            <CardHeader>
              <CardTitle>Recursos do Destino</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <span className={freight.destino_possui_carga_descarga ? "text-green-600" : "text-gray-400"}>
                    {freight.destino_possui_carga_descarga ? "✓" : "✗"} Carga/Descarga
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={freight.destino_possui_escada ? "text-green-600" : "text-gray-400"}>
                    {freight.destino_possui_escada ? "✓" : "✗"} Escada
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={freight.destino_possui_elevador ? "text-green-600" : "text-gray-400"}>
                    {freight.destino_possui_elevador ? "✓" : "✗"} Elevador
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={freight.destino_possui_doca ? "text-green-600" : "text-gray-400"}>
                    {freight.destino_possui_doca ? "✓" : "✗"} Doca
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Observações */}
        {freight.observacoes && <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Observações</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{freight.observacoes}</p>
            </CardContent>
          </Card>}

        {/* Informações de Contato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="w-5 h-5" />
              <span>Informações de Contato</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!user ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <div className="flex flex-col items-center space-y-3">
                  <User className="w-12 h-12 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-900">FAÇA O LOGIN PARA VISUALIZAR OS DADOS</h3>
                  <p className="text-blue-700">Você precisa estar logado para ver as informações de contato desta empresa.</p>
                  <Button 
                    onClick={() => navigate('/login')} 
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Fazer Login
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-500">Telefone</p>
                      <p className="font-medium">(11) 99999-9999</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-500">E-mail</p>
                      <p className="font-medium">contato@empresa.com</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-500">Responsável</p>
                      <p className="font-medium">João Silva</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-500">Horário de Atendimento</p>
                      <p className="font-medium">08:00 às 18:00</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" onClick={() => navigate('/login')}>
          Tenho Interesse neste Frete
        </Button>
      </div>
    </div>
  );
};

export default FreightDetails;
