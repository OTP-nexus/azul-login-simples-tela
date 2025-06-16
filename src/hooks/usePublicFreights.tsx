
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ActiveFreight } from '@/hooks/useActiveFreights';

// Re-exporting the type for convenience, now extended
export type Freight = ActiveFreight & {
  destino_cidade?: string | null;
  destino_estado?: string | null;
};

export interface PublicFreightFilters {
  origin?: string;
  destination?: string;
  vehicleTypes?: string[];
  bodyTypes?: string[];
  freightType?: string;
  tracker?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export const usePublicFreights = (filters: PublicFreightFilters = {}, page: number = 1, itemsPerPage: number = 20) => {
  const [freights, setFreights] = useState<Freight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage
  });

  // Função para verificar se uma string contém o valor de busca
  const stringContains = (text: string | null | undefined, searchValue: string): boolean => {
    if (!text || !searchValue) return false;
    return text.toLowerCase().includes(searchValue.toLowerCase());
  };

  // Função para verificar destino nas paradas (frete completo e retorno)
  const checkDestinationInParadas = (paradas: any, searchValue: string): boolean => {
    console.log('Verificando paradas:', paradas, 'para busca:', searchValue);
    
    if (!paradas || !searchValue) return false;
    
    try {
      let paradasArray = paradas;
      
      // Se é string, fazer parse
      if (typeof paradas === 'string') {
        paradasArray = JSON.parse(paradas);
      }
      
      // Se não é array, retornar false
      if (!Array.isArray(paradasArray)) return false;
      
      // Verificar cada parada
      return paradasArray.some((parada: any) => {
        if (typeof parada === 'object' && parada !== null) {
          const cidade = parada.cidade || parada.city || '';
          const estado = parada.estado || parada.state || '';
          const result = stringContains(cidade, searchValue) || stringContains(estado, searchValue);
          if (result) {
            console.log('Encontrou match em parada:', parada);
          }
          return result;
        }
        return false;
      });
    } catch (e) {
      console.error('Erro ao processar paradas:', e);
      return false;
    }
  };

  // Função para verificar destino nos destinos (agregamento e comum)
  const checkDestinationInDestinos = (freight: any, searchValue: string): boolean => {
    console.log('Verificando destinos para frete:', freight.id, 'busca:', searchValue);
    
    if (!searchValue) return false;
    
    // Verificar campos diretos
    if (stringContains(freight.destino_cidade, searchValue) || 
        stringContains(freight.destino_estado, searchValue)) {
      console.log('Match encontrado nos campos diretos');
      return true;
    }
    
    // Verificar array de destinos
    if (freight.destinos) {
      try {
        let destinosArray = freight.destinos;
        
        // Se é string, fazer parse
        if (typeof freight.destinos === 'string') {
          destinosArray = JSON.parse(freight.destinos);
        }
        
        // Se é array, verificar cada destino
        if (Array.isArray(destinosArray)) {
          const found = destinosArray.some((destino: any) => {
            if (typeof destino === 'object' && destino !== null) {
              const cidade = destino.cidade || destino.city || '';
              const estado = destino.estado || destino.state || '';
              const result = stringContains(cidade, searchValue) || stringContains(estado, searchValue);
              if (result) {
                console.log('Match encontrado em destino:', destino);
              }
              return result;
            }
            return false;
          });
          return found;
        }
      } catch (e) {
        console.error('Erro ao processar destinos:', e);
      }
    }
    
    return false;
  };

  // Função para verificar tipos de veículo
  const hasVehicleType = (vehicleData: any, searchValue: string): boolean => {
    if (!vehicleData || vehicleData === null) return false;
    
    try {
      const data = typeof vehicleData === 'string' ? JSON.parse(vehicleData) : vehicleData;
      
      if (!Array.isArray(data)) return false;
      
      return data.some((item: any) => {
        if (typeof item === 'string') {
          return item === searchValue;
        }
        if (typeof item === 'object' && item !== null) {
          return item.value === searchValue || item.type === searchValue || item.id === searchValue;
        }
        if (Array.isArray(item)) {
          return item.some((subItem: any) => {
            if (typeof subItem === 'string') return subItem === searchValue;
            if (typeof subItem === 'object' && subItem !== null) {
              return subItem.value === searchValue || subItem.type === searchValue || subItem.id === searchValue;
            }
            return false;
          });
        }
        return false;
      });
    } catch (e) {
      console.error('Erro ao processar dados de veículo:', e);
      return false;
    }
  };

  // Função para verificar tipos de carroceria
  const hasBodyType = (bodyData: any, searchValue: string): boolean => {
    if (!bodyData || bodyData === null) return false;
    
    try {
      const data = typeof bodyData === 'string' ? JSON.parse(bodyData) : bodyData;
      
      if (!Array.isArray(data)) return false;
      
      return data.some((item: any) => {
        if (typeof item === 'string') {
          return item === searchValue;
        }
        if (typeof item === 'object' && item !== null) {
          return item.value === searchValue || item.type === searchValue || item.id === searchValue;
        }
        if (Array.isArray(item)) {
          return item.some((subItem: any) => {
            if (typeof subItem === 'string') return subItem === searchValue;
            if (typeof subItem === 'object' && subItem !== null) {
              return subItem.value === searchValue || subItem.type === searchValue || subItem.id === searchValue;
            }
            return false;
          });
        }
        return false;
      });
    } catch (e) {
      console.error('Erro ao processar dados de carroceria:', e);
      return false;
    }
  };

  const fetchFreights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Buscando fretes com filtros:', filters);

      // Buscar todos os fretes ativos sem filtros server-side
      let query = supabase
        .from('fretes')
        .select('*')
        .in('status', ['ativo', 'pendente'])
        .order('created_at', { ascending: false });

      // Aplicar apenas filtros simples no servidor
      if (filters.origin) {
        query = query.or(`origem_cidade.ilike.%${filters.origin}%,origem_estado.ilike.%${filters.origin}%`);
      }
      
      if (filters.freightType) {
        query = query.eq('tipo_frete', filters.freightType);
      }
      
      if (filters.tracker === 'sim') {
        query = query.eq('precisa_rastreador', true);
      } else if (filters.tracker === 'nao') {
        query = query.eq('precisa_rastreador', false);
      }

      const { data: freightData, error: freightError } = await query;

      if (freightError) {
        console.error('Erro ao buscar fretes públicos:', freightError);
        setError('Erro ao buscar fretes públicos');
        return;
      }

      let filteredData = freightData || [];
      console.log('Dados brutos do servidor:', filteredData.length, 'fretes');

      // Aplicar filtros complexos no cliente
      if (filters.destination) {
        console.log('Aplicando filtro de destino:', filters.destination);
        
        filteredData = filteredData.filter(freight => {
          const isFreteCompletoOuRetorno = freight.tipo_frete === 'frete_completo' || freight.tipo_frete === 'frete_de_retorno';
          
          if (isFreteCompletoOuRetorno) {
            // Para frete completo e retorno, verificar nas paradas
            return checkDestinationInParadas(freight.paradas, filters.destination!);
          } else {
            // Para agregamento e comum, verificar nos destinos
            return checkDestinationInDestinos(freight, filters.destination!);
          }
        });
        
        console.log('Após filtro de destino:', filteredData.length, 'fretes');
      }

      if (filters.vehicleTypes && filters.vehicleTypes.length > 0) {
        filteredData = filteredData.filter(freight => {
          return filters.vehicleTypes!.some(vehicleType => 
            hasVehicleType(freight.tipos_veiculos, vehicleType)
          );
        });
        console.log('Após filtro de veículos:', filteredData.length, 'fretes');
      }

      if (filters.bodyTypes && filters.bodyTypes.length > 0) {
        filteredData = filteredData.filter(freight => {
          return filters.bodyTypes!.some(bodyType => 
            hasBodyType(freight.tipos_carrocerias, bodyType)
          );
        });
        console.log('Após filtro de carrocerias:', filteredData.length, 'fretes');
      }

      // Aplicar paginação no cliente
      const totalItems = filteredData.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      setPagination({
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage
      });

      // Transform data
      const formattedFreights: Freight[] = paginatedData.map(freight => ({
        id: freight.id,
        codigo_agregamento: freight.codigo_agregamento || '',
        tipo_frete: freight.tipo_frete,
        status: freight.status || 'ativo',
        origem_cidade: freight.origem_cidade,
        origem_estado: freight.origem_estado,
        destinos: Array.isArray(freight.destinos) ? freight.destinos : [],
        data_coleta: freight.data_coleta,
        data_entrega: freight.data_entrega,
        tipo_mercadoria: freight.tipo_mercadoria,
        peso_carga: freight.peso_carga,
        valor_carga: freight.valor_carga,
        valores_definidos: freight.valores_definidos,
        tipos_veiculos: Array.isArray(freight.tipos_veiculos) ? freight.tipos_veiculos : [],
        tipos_carrocerias: Array.isArray(freight.tipos_carrocerias) ? freight.tipos_carrocerias : [],
        collaborator_ids: freight.collaborator_ids,
        created_at: freight.created_at,
        updated_at: freight.updated_at,
        pedagio_pago_por: freight.pedagio_pago_por,
        pedagio_direcao: freight.pedagio_direcao,
        precisa_seguro: freight.precisa_seguro || false,
        precisa_rastreador: freight.precisa_rastreador || false,
        precisa_ajudante: freight.precisa_ajudante || false,
        horario_carregamento: freight.horario_carregamento,
        observacoes: freight.observacoes,
        paradas: Array.isArray(freight.paradas) ? freight.paradas : [],
        beneficios: Array.isArray(freight.beneficios) ? freight.beneficios : [],
        regras_agendamento: Array.isArray(freight.regras_agendamento) ? freight.regras_agendamento : [],
        tabelas_preco: Array.isArray(freight.tabelas_preco) ? freight.tabelas_preco : [],
        destino_cidade: freight.destino_cidade,
        destino_estado: freight.destino_estado
      }));

      console.log('Fretes finais formatados:', formattedFreights.length);
      setFreights(formattedFreights);
    } catch (err) {
      console.error('Erro ao carregar fretes públicos:', err);
      setError('Erro ao carregar fretes públicos');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters), page, itemsPerPage]);

  useEffect(() => {
    fetchFreights();
  }, [fetchFreights]);

  return {
    freights,
    loading,
    error,
    pagination,
    refetch: fetchFreights,
  };
};
