
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MapPin, 
  Package, 
  Calendar, 
  DollarSign, 
  Truck, 
  Users, 
  Shield, 
  Radar, 
  UserPlus,
  Clock,
  AlertTriangle,
  FileText,
  RotateCcw,
  Combine,
  Calculator,
  Route,
  Settings
} from "lucide-react";
import FreightStatusBadge from './FreightStatusBadge';
import type { ActiveFreight } from '@/hooks/useActiveFreights';

interface FreightDetailsModalProps {
  freight: ActiveFreight | null;
  isOpen: boolean;
  onClose: () => void;
}

const FreightDetailsModal = ({ freight, isOpen, onClose }: FreightDetailsModalProps) => {
  if (!freight) return null;

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

  // Função para extrair texto legível de objetos
  const extractDisplayText = (item: any) => {
    if (typeof item === 'string') {
      return item;
    }
    
    if (typeof item === 'object' && item !== null) {
      // Priorizar campos mais descritivos
      const textFields = [
        'nome', 'name', 'tipo', 'type', 'descricao', 'description', 
        'label', 'title', 'categoria', 'category', 'modelo', 'model'
      ];
      
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

  // Função para extrair informações adicionais
  const extractSubtitle = (item: any) => {
    if (typeof item !== 'object' || item === null) return '';
    
    const subtitleFields = [
      { key: 'capacidade', label: 'Capacidade' },
      { key: 'capacity', label: 'Capacidade' },
      { key: 'peso', label: 'Peso' },
      { key: 'weight', label: 'Peso' },
      { key: 'tamanho', label: 'Tamanho' },
      { key: 'size', label: 'Tamanho' },
      { key: 'categoria', label: 'Categoria' },
      { key: 'category', label: 'Categoria' },
      { key: 'modelo', label: 'Modelo' },
      { key: 'model', label: 'Modelo' }
    ];
    
    for (const field of subtitleFields) {
      if (item[field.key]) {
        return `${field.label}: ${item[field.key]}`;
      }
    }
    
    return '';
  };

  // Função melhorada para renderizar itens de array com formatação adequada
  const renderVehiclesAndBodies = (items: any[], emptyMessage: string = 'Não especificado') => {
    console.log('Renderizando items:', items);
    
    if (!Array.isArray(items) || items.length === 0) {
      return <p className="text-gray-500 italic">{emptyMessage}</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item: any, index: number) => {
          const displayText = extractDisplayText(item);
          const subtitle = extractSubtitle(item);

          return (
            <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm font-medium text-blue-900">{displayText}</div>
              {subtitle && (
                <div className="text-xs text-blue-600 mt-1">{subtitle}</div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Função específica para renderizar badges simples
  const renderSimpleBadges = (items: any[], emptyMessage: string = 'Não especificado') => {
    if (!Array.isArray(items) || items.length === 0) {
      return <p className="text-gray-500 italic">{emptyMessage}</p>;
    }

    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item: any, index: number) => {
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

  // Helper function to render pricing tables for agregamento
  const renderPricingTables = () => {
    if (!freight.tabelas_preco || freight.tabelas_preco.length === 0) {
      return <p className="text-gray-500 italic">Nenhuma tabela de preços definida</p>;
    }

    return freight.tabelas_preco.map((tabela: any, index: number) => (
      <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-200">
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <p className="text-gray-600">Tipo de Veículo</p>
            <p className="font-medium">{tabela.vehicle_type || tabela.tipo_veiculo || 'Não especificado'}</p>
          </div>
          <div>
            <p className="text-gray-600">Distância (km)</p>
            <p className="font-medium">{tabela.km_start || tabela.km_inicio || 0} - {tabela.km_end || tabela.km_fim || 0} km</p>
          </div>
          <div>
            <p className="text-gray-600">Valor</p>
            <p className="font-medium text-green-600">{formatValue(tabela.price || tabela.preco)}</p>
          </div>
        </div>
      </div>
    ));
  };

  // Helper function to render benefits for agregamento
  const renderBenefits = () => {
    if (!freight.beneficios || freight.beneficios.length === 0) {
      return <p className="text-gray-500 italic">Nenhum benefício definido</p>;
    }

    return (
      <div className="flex flex-wrap gap-2">
        {freight.beneficios.map((beneficio: any, index: number) => {
          const displayText = extractDisplayText(beneficio);

          return (
            <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
              {displayText}
            </Badge>
          );
        })}
      </div>
    );
  };

  // Helper function to render scheduling rules for agregamento
  const renderSchedulingRules = () => {
    if (!freight.regras_agendamento || freight.regras_agendamento.length === 0) {
      return <p className="text-gray-500 italic">Nenhuma regra de agendamento definida</p>;
    }

    return freight.regras_agendamento.map((regra: any, index: number) => {
      const displayText = extractDisplayText(regra);

      return (
        <div key={index} className="bg-orange-50 p-3 rounded-lg border border-orange-200">
          <p className="text-sm text-orange-800">{displayText}</p>
        </div>
      );
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${typeConfig.bgColor} rounded-lg flex items-center justify-center`}>
              <TypeIcon className={`w-5 h-5 ${typeConfig.color}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {freight.codigo_agregamento || 'Código não gerado'}
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline">{typeConfig.label}</Badge>
                <FreightStatusBadge status={freight.status} />
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

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
              <div>
                <p className="text-sm text-gray-500">Criado em</p>
                <p className="font-medium">{formatDateTime(freight.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Última atualização</p>
                <p className="font-medium">{formatDateTime(freight.updated_at)}</p>
              </div>
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
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="font-medium">{freight.origem_cidade}, {freight.origem_estado}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-2">Destinos</p>
                  <div className="space-y-2">
                    {freight.destinos && freight.destinos.length > 0 ? (
                      freight.destinos.map((destino: any, index: number) => (
                        <div key={index} className="bg-green-50 p-3 rounded-lg">
                          <p className="font-medium">{destino.cidade}, {destino.estado}</p>
                          {destino.cep && <p className="text-sm text-gray-600">CEP: {destino.cep}</p>}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">Nenhum destino definido</p>
                    )}
                  </div>
                </div>

                {freight.paradas && freight.paradas.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Paradas</p>
                    <div className="space-y-2">
                      {freight.paradas.map((parada: any, index: number) => (
                        <div key={index} className="bg-yellow-50 p-3 rounded-lg">
                          <p className="font-medium">{parada.cidade}, {parada.estado}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
          {freight.tipo_frete === 'agregamento' && (
            <>
              {/* Tabelas de Preços */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calculator className="w-5 h-5" />
                    <span>Tabelas de Preços</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {renderPricingTables()}
                  </div>
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
            </>
          )}

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

          {/* Colaboradores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Colaboradores Responsáveis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {freight.collaborator_ids && freight.collaborator_ids.length > 0 
                  ? `${freight.collaborator_ids.length} colaborador(es) responsável(is)`
                  : 'Nenhum colaborador atribuído'
                }
              </p>
            </CardContent>
          </Card>

          {/* Observações */}
          {freight.observacoes && (
            <Card>
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
      </DialogContent>
    </Dialog>
  );
};

export default FreightDetailsModal;
