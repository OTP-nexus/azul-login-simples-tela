
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

  // Função para normalizar texto removendo acentos e convertendo para lowercase
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remove acentos
  };

  // Função auxiliar para buscar destinos de forma mais robusta
  const searchInDestinations = (freight: any, searchTerm: string): boolean => {
    const normalizedSearch = normalizeText(searchTerm);
    
    console.log(`🔍 Buscando "${searchTerm}" (normalizado: "${normalizedSearch}") no frete ${freight.id}:`, {
      tipo_frete: freight.tipo_frete,
      destino_cidade: freight.destino_cidade,
      destino_estado: freight.destino_estado,
      destinos: freight.destinos,
      paradas: freight.paradas
    });

    // Função para verificar se um texto contém o termo de busca
    const textContains = (text: string | null | undefined): boolean => {
      if (!text) return false;
      const normalized = normalizeText(text);
      return normalized.includes(normalizedSearch);
    };

    // 1. Verificar campos diretos de destino
    if (textContains(freight.destino_cidade) || textContains(freight.destino_estado)) {
      console.log('✅ Encontrado nos campos diretos destino_cidade/destino_estado');
      return true;
    }

    // 2. Verificar no array destinos
    if (freight.destinos && Array.isArray(freight.destinos)) {
      const foundInDestinos = freight.destinos.some((destino: any) => {
        // Tratar diferentes estruturas possíveis
        if (Array.isArray(destino)) {
          // Casos de arrays aninhados: [[{city: "...", state: "..."}]]
          return destino.some((subDestino: any) => {
            if (typeof subDestino === 'object' && subDestino !== null) {
              const cidade = subDestino.cidade || subDestino.city || '';
              const estado = subDestino.estado || subDestino.state || '';
              return textContains(cidade) || textContains(estado);
            }
            return false;
          });
        } else if (typeof destino === 'object' && destino !== null) {
          // Caso normal: {city: "...", state: "..."}
          const cidade = destino.cidade || destino.city || '';
          const estado = destino.estado || destino.state || '';
          return textContains(cidade) || textContains(estado);
        }
        return false;
      });
      
      if (foundInDestinos) {
        console.log('✅ Encontrado no array destinos');
        return true;
      }
    }

    // 3. Verificar no array paradas (para fretes de retorno e completos)
    if (freight.paradas && Array.isArray(freight.paradas)) {
      const foundInParadas = freight.paradas.some((parada: any) => {
        // Tratar diferentes estruturas possíveis
        if (Array.isArray(parada)) {
          // Casos de arrays aninhados
          return parada.some((subParada: any) => {
            if (typeof subParada === 'object' && subParada !== null) {
              const cidade = subParada.cidade || subParada.city || '';
              const estado = subParada.estado || subParada.state || '';
              return textContains(cidade) || textContains(estado);
            }
            return false;
          });
        } else if (typeof parada === 'object' && parada !== null) {
          // Caso normal
          const cidade = parada.cidade || parada.city || '';
          const estado = parada.estado || parada.state || '';
          return textContains(cidade) || textContains(estado);
        }
        return false;
      });
      
      if (foundInParadas) {
        console.log('✅ Encontrado no array paradas');
        return true;
      }
    }

    console.log('❌ Não encontrado em nenhum local');
    return false;
  };

  const fetchFreights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Aplicando filtros:', filters, 'Página:', page);

      // Para filtros que são aplicados no client-side, precisamos buscar mais dados
      const needsClientSideFiltering = filters.destination || 
                                       (filters.vehicleTypes && filters.vehicleTypes.length > 0) || 
                                       (filters.bodyTypes && filters.bodyTypes.length > 0);
      
      // Se precisar de filtros client-side, buscar mais dados para compensar
      const fetchSize = needsClientSideFiltering ? itemsPerPage * 3 : itemsPerPage;
      const fetchOffset = needsClientSideFiltering ? 0 : (page - 1) * itemsPerPage;

      // Build query with server-side filters only
      let query = supabase
        .from('fretes')
        .select('*')
        .in('status', ['ativo', 'pendente'])
        .order('created_at', { ascending: false });

      // Apply simple server-side filters
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

      // Apply pagination based on whether we need client-side filtering
      if (!needsClientSideFiltering) {
        query = query.range(fetchOffset, fetchOffset + fetchSize - 1);
      }

      const { data: freightData, error: freightError } = await query;

      if (freightError) {
        console.error('Erro ao buscar fretes públicos:', freightError);
        setError('Erro ao buscar fretes públicos');
        return;
      }

      let filteredData = freightData || [];
      console.log(`📊 Dados iniciais: ${filteredData.length} fretes`);

      // Apply client-side filters
      if (filters.vehicleTypes && filters.vehicleTypes.length > 0) {
        filteredData = filteredData.filter(freight => {
          return filters.vehicleTypes!.some(vehicleType => 
            hasVehicleType(freight.tipos_veiculos, vehicleType)
          );
        });
        console.log(`📊 Após filtro de tipos de veículo: ${filteredData.length} fretes`);
      }

      if (filters.bodyTypes && filters.bodyTypes.length > 0) {
        filteredData = filteredData.filter(freight => {
          return filters.bodyTypes!.some(bodyType => 
            hasBodyType(freight.tipos_carrocerias, bodyType)
          );
        });
        console.log(`📊 Após filtro de tipos de carroceria: ${filteredData.length} fretes`);
      }

      // Apply destination filtering using the robust search function
      if (filters.destination) {
        console.log('🔍 Aplicando filtro de destino robuste para:', filters.destination);
        filteredData = filteredData.filter(freight => {
          return searchInDestinations(freight, filters.destination!);
        });
        console.log(`📊 Após filtro de destino: ${filteredData.length} fretes`);
      }

      // Apply pagination for client-side filtered data
      const totalFilteredItems = filteredData.length;
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedData = needsClientSideFiltering ? 
        filteredData.slice(startIndex, endIndex) : 
        filteredData;

      // Calculate pagination info
      const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);

      setPagination({
        currentPage: page,
        totalPages,
        totalItems: totalFilteredItems,
        itemsPerPage
      });

      console.log(`📊 Paginação: ${paginatedData.length} itens na página ${page} de ${totalPages}`);

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
          company_id: freight.company_id,
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
