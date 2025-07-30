import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Settings,
  User,
  Phone,
  Mail,
  MessageSquare,
  Heart,
  ExternalLink,
  Eye
} from "lucide-react";
import FreightStatusBadge from './FreightStatusBadge';
import { ContactViewPaywall } from './ContactViewPaywall';
import type { ActiveFreight } from '@/hooks/useActiveFreights';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useFreightInterest } from '@/hooks/useFreightInterest';
import { useToast } from '@/hooks/use-toast';

interface FreightDetailsModalProps {
  freight: ActiveFreight | null;
  isOpen: boolean;
  onClose: () => void;
}

const FreightDetailsModal = ({ freight, isOpen, onClose }: FreightDetailsModalProps) => {
  const { user, profile } = useAuth();
  const { canViewContacts, contactViewsRemaining, refreshSubscription, plan } = useSubscription();
  const { demonstrateInterest, isLoading: interestLoading, checkExistingInterest } = useFreightInterest();
  const { toast } = useToast();
  const [hasInterest, setHasInterest] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [hasViewedContact, setHasViewedContact] = useState(false);
  const [isViewingContact, setIsViewingContact] = useState(false);

  // Buscar dados dos colaboradores
  const { data: collaborators } = useQuery({
    queryKey: ['collaborators', freight?.collaborator_ids],
    queryFn: async () => {
      if (!freight?.collaborator_ids || freight.collaborator_ids.length === 0) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('collaborators')
        .select('*')
        .in('id', freight.collaborator_ids);
      
      if (error) {
        console.error('Erro ao buscar colaboradores:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!freight?.collaborator_ids && freight.collaborator_ids.length > 0
  });

  // Buscar dados da empresa
  const { data: company } = useQuery({
    queryKey: ['company', freight?.company_id],
    queryFn: async () => {
      if (!freight?.company_id) return null;
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', freight.company_id)
        .single();
      
      if (error) {
        console.error('Erro ao buscar empresa:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!freight?.company_id
  });

  // Verificar se o motorista já demonstrou interesse
  useEffect(() => {
    if (freight && user && profile?.role === 'driver') {
      checkExistingInterest(freight.id).then(setHasInterest);
    }
  }, [freight, user, profile?.role, checkExistingInterest]);

  // Reset do estado quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      setHasViewedContact(false);
      setIsViewingContact(false);
    }
  }, [isOpen]);

  // Definir se é motorista
  const isDriver = profile?.role === 'driver';

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

  // Função para registrar visualização de contato
  const handleViewContact = async () => {
    if (!freight || !isDriver || hasViewedContact || isViewingContact) return;

    // Verificar se tem visualizações restantes
    if (contactViewsRemaining === 0) {
      setShowPaywall(true);
      return;
    }

    setIsViewingContact(true);

    try {
      const { data, error } = await supabase.functions.invoke('record-contact-view', {
        body: { freightId: freight.id }
      });

      if (error) {
        console.error('Erro ao registrar visualização:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao registrar visualização. Tente novamente.',
          variant: 'destructive'
        });
        return;
      }

      if (data?.success) {
        setHasViewedContact(true);
        // Atualizar contadores
        if (!data.alreadyViewed) {
          await refreshSubscription();
        }
        toast({
          title: 'Sucesso',
          description: 'Contato visualizado com sucesso!',
        });
      }
    } catch (error) {
      console.error('Erro ao registrar visualização:', error);
      toast({
        title: 'Erro',
        description: 'Erro interno. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsViewingContact(false);
    }
  };

  const flattenNestedArrays = (data: any): any[] => {
    if (!data) return [];
    
    // Função recursiva para processar arrays profundamente aninhados
    const processNestedArray = (item: any): any[] => {
      if (!item) return [];
      
      if (Array.isArray(item)) {
        const result: any[] = [];
        for (const subItem of item) {
          if (Array.isArray(subItem)) {
            result.push(...processNestedArray(subItem));
          } else {
            result.push(subItem);
          }
        }
        return result;
      }
      
      return [item];
    };
    
    if (Array.isArray(data)) {
      // Processar arrays aninhados profundamente
      const flattened = processNestedArray(data);
      
      // Tentar parsear strings JSON se necessário
      return flattened.map(item => {
        if (typeof item === 'string' && (item.startsWith('[') || item.startsWith('{'))) {
          try {
            const parsed = JSON.parse(item);
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            return item;
          }
        }
        return item;
      }).flat();
    }

    if (typeof data === 'string' && (data.startsWith('[') || data.startsWith('{'))) {
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? processNestedArray(parsed) : [parsed];
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
        'cidade', 'city', 'estado', 'state', 'value', 'text', 'displayName',
        'id', 'key', 'beneficio', 'regra', 'benefit', 'rule'
      ];
      
      for (const field of textFields) {
        if (item[field] && typeof item[field] === 'string') {
          return item[field];
        }
      }
      
      // Se tem propriedade 'selected' true, extrair o tipo/nome
      if (item.selected === true && item.type) {
        return item.type;
      }
      
      const firstStringValue = Object.values(item).find(value => typeof value === 'string');
      if (firstStringValue) {
        return firstStringValue;
      }
      
      // Para objetos complexos, tentar extrair informação útil
      if (item.vehicleType && item.ranges) {
        return `${item.vehicleType} (${item.ranges?.length || 0} faixas)`;
      }
    }
    
    return String(item);
  };

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
      { key: 'model', label: 'Modelo' },
      { key: 'cep', label: 'CEP' },
      { key: 'bairro', label: 'Bairro' },
      { key: 'endereco', label: 'Endereço' }
    ];
    
    for (const field of subtitleFields) {
      if (item[field.key]) {
        return `${field.label}: ${item[field.key]}`;
      }
    }
    
    return '';
  };

  const renderDestinations = () => {
    const flattenedDestinations = flattenNestedArrays(freight.destinos);
    const hasDirectDestination = freight.destino_cidade && freight.destino_estado;
    
    // Se não há destinos no array mas há destino direto, usar o destino direto
    if ((!Array.isArray(flattenedDestinations) || flattenedDestinations.length === 0) && hasDirectDestination) {
      return (
        <div className="space-y-2">
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="font-medium text-green-900">{freight.destino_cidade}, {freight.destino_estado}</p>
          </div>
        </div>
      );
    }
    
    if (!Array.isArray(flattenedDestinations) || flattenedDestinations.length === 0) {
      return <p className="text-gray-500 italic">Nenhum destino definido</p>;
    }

    return (
      <div className="space-y-2">
        {/* Exibir destino direto primeiro se existir */}
        {hasDirectDestination && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="font-medium text-green-900">{freight.destino_cidade}, {freight.destino_estado}</p>
            <p className="text-xs text-green-600 mt-1">Destino Principal</p>
          </div>
        )}
        
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
            const id = destino.id || '';

            return (
              <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="text-sm">
                  <p className="font-medium text-green-900">
                    {cidade && estado ? `${cidade}, ${estado}` : extractDisplayText(destino)}
                  </p>
                  {id && <p className="text-green-600 text-xs mt-1">ID: {id}</p>}
                  {cep && <p className="text-green-700 text-xs">CEP: {cep}</p>}
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

  const renderStops = () => {
    const flattenedStops = flattenNestedArrays(freight.paradas);
    
    if (!Array.isArray(flattenedStops) || flattenedStops.length === 0) {
      return null;
    }

    return (
      <div>
        <p className="text-sm text-gray-500 mb-2">Paradas</p>
        <div className="space-y-2">
          {flattenedStops.map((parada: any, index: number) => {
            if (typeof parada === 'string') {
              return (
                <div key={index} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p className="font-medium text-yellow-900">{parada}</p>
                </div>
              );
            }

            if (typeof parada === 'object' && parada !== null) {
              const cidade = parada.cidade || parada.city || '';
              const estado = parada.estado || parada.state || '';

              return (
                <div key={index} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p className="font-medium text-yellow-900">
                    {cidade && estado ? `${cidade}, ${estado}` : extractDisplayText(parada)}
                  </p>
                </div>
              );
            }

            return (
              <div key={index} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <p className="font-medium text-yellow-900">{String(parada)}</p>
              </div>
            );
          })}
        </div>
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
          // Filtrar apenas itens selecionados se a propriedade 'selected' existir
          if (typeof item === 'object' && item !== null && 'selected' in item && !item.selected) {
            return null;
          }

          const displayText = extractDisplayText(item);
          const subtitle = extractSubtitle(item);
          const category = item.category || item.categoria || '';

          return (
            <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm font-medium text-blue-900">{displayText}</div>
              {category && (
                <div className="text-xs text-blue-500 mt-1">Categoria: {category}</div>
              )}
              {subtitle && (
                <div className="text-xs text-blue-600 mt-1">{subtitle}</div>
              )}
            </div>
          );
        }).filter(Boolean)}
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

  const renderPricingTables = () => {
    const flattenedTables = flattenNestedArrays(freight.tabelas_preco);
    
    if (!Array.isArray(flattenedTables) || flattenedTables.length === 0) {
      return <p className="text-gray-500 italic">Nenhuma tabela de preços definida</p>;
    }

    return flattenedTables.map((tabela: any, index: number) => {
      // Se a tabela tem estrutura complexa com vehicleType e ranges
      if (tabela.vehicleType && Array.isArray(tabela.ranges)) {
        return (
          <div key={index} className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-3">
              {tabela.vehicleType}
            </h4>
            <div className="space-y-2">
              {tabela.ranges.map((range: any, rangeIndex: number) => (
                <div key={rangeIndex} className="bg-white p-3 rounded border">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Distância</p>
                      <p className="font-medium">{range.kmStart || range.km_start || 0} - {range.kmEnd || range.km_end || 0} km</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Valor por KM</p>
                      <p className="font-medium text-green-600">{formatValue(range.pricePerKm || range.price_per_km)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Valor Fixo</p>
                      <p className="font-medium text-green-600">{formatValue(range.fixedPrice || range.fixed_price)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // Estrutura simples de tabela
      return (
        <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-200">
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-gray-600">Tipo de Veículo</p>
              <p className="font-medium">{tabela.vehicle_type || tabela.vehicleType || tabela.tipo_veiculo || 'Não especificado'}</p>
            </div>
            <div>
              <p className="text-gray-600">Distância (km)</p>
              <p className="font-medium">{tabela.km_start || tabela.kmStart || tabela.km_inicio || 0} - {tabela.km_end || tabela.kmEnd || tabela.km_fim || 0} km</p>
            </div>
            <div>
              <p className="text-gray-600">Valor</p>
              <p className="font-medium text-green-600">{formatValue(tabela.price || tabela.preco || tabela.pricePerKm || tabela.fixedPrice)}</p>
            </div>
          </div>
        </div>
      );
    });
  };

  const renderBenefits = () => {
    return renderSimpleBadges(freight.beneficios, 'Nenhum benefício definido');
  };

  const renderSchedulingRules = () => {
    const flattenedRules = flattenNestedArrays(freight.regras_agendamento);
    
    if (!Array.isArray(flattenedRules) || flattenedRules.length === 0) {
      return <p className="text-gray-500 italic">Nenhuma regra de agendamento definida</p>;
    }

    return flattenedRules.map((regra: any, index: number) => {
      const displayText = extractDisplayText(regra);

      return (
        <div key={index} className="bg-orange-50 p-3 rounded-lg border border-orange-200">
          <p className="text-sm text-orange-800">{displayText}</p>
        </div>
      );
    });
  };

  const renderCadasteredItems = () => {
    // Verificar se há itens detalhados ou descrição livre
    const hasDetailedItems = freight.itens_detalhados && Array.isArray(freight.itens_detalhados) && freight.itens_detalhados.length > 0;
    const hasDescricaoLivre = freight.descricao_livre_itens && freight.descricao_livre_itens.trim();
    
    if (!hasDetailedItems && !hasDescricaoLivre) {
      return <p className="text-gray-500 italic">Nenhum item cadastrado</p>;
    }

    return (
      <div className="space-y-3">
        {hasDetailedItems && (
          <div>
            <p className="text-sm text-gray-600 mb-2">Itens Detalhados:</p>
            <div className="space-y-2">
              {freight.itens_detalhados.map((item: any, index: number) => (
                <div key={index} className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-purple-900">
                      {item.nome || item.name || extractDisplayText(item)}
                    </span>
                    {item.quantidade && (
                      <span className="text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded">
                        Qtd: {item.quantidade}
                      </span>
                    )}
                  </div>
                  {item.descricao && (
                    <p className="text-sm text-purple-700 mt-1">{item.descricao}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {hasDescricaoLivre && (
          <div>
            <p className="text-sm text-gray-600 mb-2">Descrição Livre:</p>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-800">{freight.descricao_livre_itens}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCollaborators = () => {
    if (!collaborators || collaborators.length === 0) {
      return <p className="text-gray-500 italic">Nenhum colaborador atribuído</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {collaborators.map((collaborator: any) => (
          <div key={collaborator.id} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-blue-900">{collaborator.name}</h4>
                <p className="text-sm text-blue-700">{collaborator.sector}</p>
                {collaborator.email && (
                  <div className="flex items-center space-x-1 mt-1">
                    <Mail className="w-3 h-3 text-blue-600" />
                    <span className="text-xs text-blue-600">{collaborator.email}</span>
                  </div>
                )}
                {collaborator.phone && (
                  <div className="flex items-center space-x-1 mt-1">
                    <Phone className="w-3 h-3 text-blue-600" />
                    <span className="text-xs text-blue-600">{collaborator.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Função para formatar telefone para WhatsApp
  const formatPhoneForWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone.startsWith('55')) {
      return `55${cleanPhone}`;
    }
    return cleanPhone;
  };

  // Função para abrir WhatsApp
  const openWhatsApp = (phone: string) => {
    const whatsappPhone = formatPhoneForWhatsApp(phone);
    const freightCode = freight?.codigo_agregamento || 'N/A';
    const message = `Olá! Vi seu frete ${freightCode} e gostaria de conversar sobre os detalhes.`;
    const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Função para ligar
  const makeCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  // Função para demonstrar interesse
  const handleDemonstrateInterest = () => {
    if (freight) {
      demonstrateInterest(freight.id);
      setHasInterest(true);
    }
  };

  // Função para renderizar contato da empresa com controle de acesso simplificado
  const renderCompanyContact = () => {
    if (!company) return null;

    // Se não é motorista, exibir contato normalmente
    if (!isDriver) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="w-5 h-5" />
              <span>Contato da Empresa</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">{company.company_name}</h4>
                <p className="text-sm text-blue-700 mb-2">
                  Responsável: {company.contact_name}
                </p>
                <p className="text-sm text-blue-600">
                  📞 {company.phone}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Lógica para motoristas
    const canView = hasViewedContact || (plan?.contact_views_limit === -1);
    const hasViews = contactViewsRemaining > 0;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="w-5 h-5" />
            <span>Contato da Empresa</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">{company.company_name}</h4>
              <p className="text-sm text-blue-700 mb-2">
                Responsável: {company.contact_name}
              </p>
              
              {canView ? (
                <p className="text-sm text-blue-600">
                  📞 {company.phone}
                </p>
              ) : (
                <div className="bg-gray-100 p-3 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">Telefone disponível após visualizar</span>
                  </div>
                </div>
              )}
            </div>

            {!canView && (
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">
                      {hasViews 
                        ? `${contactViewsRemaining} visualizações restantes`
                        : 'Limite de visualizações atingido'
                      }
                    </p>
                    <p className="text-xs text-orange-700 mt-1">
                      {hasViews 
                        ? 'Clique em "Ver Contato" para visualizar os dados'
                        : 'Faça upgrade para visualizar mais contatos'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {!canView && (
                hasViews ? (
                  <Button
                    onClick={handleViewContact}
                    disabled={isViewingContact}
                    className="w-full"
                  >
                    {isViewingContact ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Visualizando...</span>
                      </div>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Contato ({contactViewsRemaining} restantes)
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setShowPaywall(true)}
                    className="w-full"
                  >
                    Fazer Upgrade para Ver Contato
                  </Button>
                )
              )}

              {canView && (
                <>
                  {!hasInterest ? (
                    <Button
                      onClick={handleDemonstrateInterest}
                      disabled={interestLoading}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {interestLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Demonstrando interesse...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Heart className="w-4 h-4" />
                          <span>Demonstrar Interesse</span>
                        </div>
                      )}
                    </Button>
                  ) : (
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2 text-green-700">
                        <Heart className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">
                          Você já demonstrou interesse neste frete
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => openWhatsApp(company.phone)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                    <Button
                      onClick={() => makeCall(company.phone)}
                      variant="outline"
                      className="flex-1"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Ligar
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const handleUpgrade = () => {
    window.location.href = '/driver/plans';
    setShowPaywall(false);
  };

  return (
    <>
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
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Tipo de Mercadoria</p>
                    <p className="font-medium">{freight.tipo_mercadoria || 'Não especificado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Peso da Carga</p>
                    <p className="font-medium">
                      {freight.peso_carga ? `${Number(freight.peso_carga).toLocaleString('pt-BR')} kg` : 'Não especificado'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Valor da Carga</p>
                    <p className="font-medium">
                      {freight.valor_carga ? formatValue(Number(freight.valor_carga)) : 'Não especificado'}
                    </p>
                  </div>
                  {(freight.altura_carga || freight.largura_carga || freight.comprimento_carga) && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Dimensões da Carga</p>
                      <p className="font-medium">
                        {[
                          freight.altura_carga && `Altura: ${freight.altura_carga}cm`,
                          freight.largura_carga && `Largura: ${freight.largura_carga}cm`, 
                          freight.comprimento_carga && `Comprimento: ${freight.comprimento_carga}cm`
                        ].filter(Boolean).join(' | ') || 'Não especificadas'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Itens Cadastrados para fretes tipo "comum" */}
                {freight.tipo_frete === 'comum' && (
                  <div>
                    <p className="text-sm text-gray-500 mb-3">Itens Cadastrados</p>
                    {renderCadasteredItems()}
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

            {/* Seções específicas para Agregamento */}
            {freight.tipo_frete === 'agregamento' && (
              <>
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
                {renderCollaborators()}
              </CardContent>
            </Card>

            {/* Contato da Empresa - com controle de acesso */}
            {renderCompanyContact()}

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

      {/* Paywall Modal */}
      <ContactViewPaywall
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUpgrade={handleUpgrade}
      />
    </>
  );
};

export default FreightDetailsModal;
