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

  // Função auxiliar para verificar se um tipo de veículo está nos dados JSONB
  const hasVehicleType = (vehicleData: any, searchValue: string): boolean => {
    if (!vehicleData || vehicleData === null) return false;
    
    try {
      // Se vehicleData é uma string, parse para JSON
      const data = typeof vehicleData === 'string' ? JSON.parse(vehicleData) : vehicleData;
      
      if (!Array.isArray(data)) return false;
      
      return data.some((item: any) => {
        if (typeof item === 'string') {
          return item === searchValue;
        }
        if (typeof item === 'object' && item !== null) {
          return item.value === searchValue || item.type === searchValue || item.id === searchValue;
        }
        // Para arrays aninhados
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

  // Função auxiliar para verificar se um tipo de carroceria está nos dados JSONB
  const hasBodyType = (bodyData: any, searchValue: string): boolean => {
    if (!bodyData || bodyData === null) return false;
    
    try {
      // Se bodyData é uma string, parse para JSON
      const data = typeof bodyData === 'string' ? JSON.parse(bodyData) : bodyData;
      
      if (!Array.isArray(data)) return false;
      
      return data.some((item: any) => {
        if (typeof item === 'string') {
          return item === searchValue;
        }
        if (typeof item === 'object' && item !== null) {
          return item.value === searchValue || item.type === searchValue || item.id === searchValue;
        }
        // Para arrays aninhados
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

      console.log('Aplicando filtros:', filters, 'Página:', page);

      // First, get the total count for pagination
      let countQuery = supabase
        .from('fretes')
        .select('*', { count: 'exact', head: true })
        .in('status', ['ativo', 'pendente']);

      // Apply simple filters to count query
      if (filters.origin) {
        countQuery = countQuery.or(`origem_cidade.ilike.%${filters.origin}%,origem_estado.ilike.%${filters.origin}%`);
      }
      
      if (filters.destination) {
        countQuery = countQuery.or(`destinos::text.ilike.%${filters.destination}%,destino_cidade.ilike.%${filters.destination}%,destino_estado.ilike.%${filters.destination}%`);
      }
      
      if (filters.freightType) {
        countQuery = countQuery.eq('tipo_frete', filters.freightType);
      }
      
      if (filters.tracker === 'sim') {
        countQuery = countQuery.eq('precisa_rastreador', true);
      } else if (filters.tracker === 'nao') {
        countQuery = countQuery.eq('precisa_rastreador', false);
      }

      // Now get the actual data with pagination
      let query = supabase
        .from('fretes')
        .select('*')
        .in('status', ['ativo', 'pendente'])
        .order('created_at', { ascending: false })
        .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

      // Apply the same filters to data query
      if (filters.origin) {
        query = query.or(`origem_cidade.ilike.%${filters.origin}%,origem_estado.ilike.%${filters.origin}%`);
      }
      
      if (filters.destination) {
        query = query.or(`destinos::text.ilike.%${filters.destination}%,destino_cidade.ilike.%${filters.destination}%,destino_estado.ilike.%${filters.destination}%`);
      }
      
      if (filters.freightType) {
        query = query.eq('tipo_frete', filters.freightType);
      }
      
      if (filters.tracker === 'sim') {
        query = query.eq('precisa_rastreador', true);
      } else if (filters.tracker === 'nao') {
        query = query.eq('precisa_rastreador', false);
      }

      const [{ count }, { data: freightData, error: freightError }] = await Promise.all([
        countQuery,
        query
      ]);

      if (freightError) {
        console.error('Erro ao buscar fretes públicos:', freightError);
        setError('Erro ao buscar fretes públicos');
        return;
      }

      let filteredData = freightData || [];

      // Apply complex filters on client side
      if (filters.vehicleTypes && filters.vehicleTypes.length > 0) {
        filteredData = filteredData.filter(freight => {
          return filters.vehicleTypes!.some(vehicleType => 
            hasVehicleType(freight.tipos_veiculos, vehicleType)
          );
        });
      }

      if (filters.bodyTypes && filters.bodyTypes.length > 0) {
        filteredData = filteredData.filter(freight => {
          return filters.bodyTypes!.some(bodyType => 
            hasBodyType(freight.tipos_carrocerias, bodyType)
          );
        });
      }

      // Calculate pagination info
      const totalItems = count || 0;
      const totalPages = Math.ceil(totalItems / itemsPerPage);

      setPagination({
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage
      });

      // Transform data
      const formattedFreights: Freight[] = filteredData.map(freight => ({
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

      setFreights(formattedFreights);
    } catch (err) {
      console.error('Erro ao carregar fretes públicos:', err);
      setError('Erro ao carregar fretes públicos');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters), page, itemsPerPage]);

  const hasVehicleType = (vehicleData: any, searchValue: string): boolean => {
    if (!vehicleData || vehicleData === null) return false;
    
    try {
      // Se vehicleData é uma string, parse para JSON
      const data = typeof vehicleData === 'string' ? JSON.parse(vehicleData) : vehicleData;
      
      if (!Array.isArray(data)) return false;
      
      return data.some((item: any) => {
        if (typeof item === 'string') {
          return item === searchValue;
        }
        if (typeof item === 'object' && item !== null) {
          return item.value === searchValue || item.type === searchValue || item.id === searchValue;
        }
        // Para arrays aninhados
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

  const hasBodyType = (bodyData: any, searchValue: string): boolean => {
    if (!bodyData || bodyData === null) return false;
    
    try {
      // Se bodyData é uma string, parse para JSON
      const data = typeof bodyData === 'string' ? JSON.parse(bodyData) : bodyData;
      
      if (!Array.isArray(data)) return false;
      
      return data.some((item: any) => {
        if (typeof item === 'string') {
          return item === searchValue;
        }
        if (typeof item === 'object' && item !== null) {
          return item.value === searchValue || item.type === searchValue || item.id === searchValue;
        }
        // Para arrays aninhados
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
