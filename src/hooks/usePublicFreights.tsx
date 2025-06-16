
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
  const [allFreights, setAllFreights] = useState<Freight[]>([]);
  const [filteredFreights, setFilteredFreights] = useState<Freight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage
  });

  // Função para buscar dados do origem
  const filterByOrigin = (freights: Freight[], searchValue: string): Freight[] => {
    if (!searchValue) return freights;
    
    const search = searchValue.toLowerCase();
    return freights.filter(freight => {
      const originCity = freight.origem_cidade?.toLowerCase() || '';
      const originState = freight.origem_estado?.toLowerCase() || '';
      
      return originCity.includes(search) || originState.includes(search);
    });
  };

  // Função para buscar dados de destino baseado no tipo de frete
  const filterByDestination = (freights: Freight[], searchValue: string): Freight[] => {
    if (!searchValue) return freights;
    
    const search = searchValue.toLowerCase();
    console.log('🔍 Filtrando por destino:', search);
    
    return freights.filter(freight => {
      const tipoFrete = freight.tipo_frete;
      console.log(`📦 Frete ${freight.id} - Tipo: ${tipoFrete}`);
      
      // Para frete_completo e frete_de_retorno: buscar em paradas
      if (tipoFrete === 'frete_completo' || tipoFrete === 'frete_de_retorno') {
        console.log('🚛 Usando paradas para busca de destino');
        
        if (!freight.paradas || !Array.isArray(freight.paradas)) {
          console.log('❌ Paradas não encontradas ou inválidas');
          return false;
        }
        
        const hasDestinationInParadas = freight.paradas.some((parada: any) => {
          if (!parada || typeof parada !== 'object') return false;
          
          const city = parada.city?.toLowerCase() || '';
          const state = parada.state?.toLowerCase() || '';
          const endereco = parada.endereco?.toLowerCase() || '';
          
          const found = city.includes(search) || state.includes(search) || endereco.includes(search);
          if (found) {
            console.log('✅ Destino encontrado em paradas:', parada);
          }
          return found;
        });
        
        return hasDestinationInParadas;
      }
      
      // Para agregamento e comum: buscar em destinos, destino_cidade, destino_estado
      console.log('🏢 Usando destinos/destino_cidade/destino_estado para busca');
      
      // Buscar em destino_cidade e destino_estado
      const destinoCity = freight.destino_cidade?.toLowerCase() || '';
      const destinoState = freight.destino_estado?.toLowerCase() || '';
      
      if (destinoCity.includes(search) || destinoState.includes(search)) {
        console.log('✅ Destino encontrado em campos diretos');
        return true;
      }
      
      // Buscar em destinos (JSONB)
      if (freight.destinos && Array.isArray(freight.destinos)) {
        const hasDestinationInDestinos = freight.destinos.some((destino: any) => {
          if (!destino || typeof destino !== 'object') return false;
          
          const city = destino.city?.toLowerCase() || '';
          const state = destino.state?.toLowerCase() || '';
          const endereco = destino.endereco?.toLowerCase() || '';
          
          const found = city.includes(search) || state.includes(search) || endereco.includes(search);
          if (found) {
            console.log('✅ Destino encontrado em destinos:', destino);
          }
          return found;
        });
        
        return hasDestinationInDestinos;
      }
      
      console.log('❌ Nenhum destino encontrado para este frete');
      return false;
    });
  };

  // Função para filtrar por tipos de veículos
  const filterByVehicleTypes = (freights: Freight[], vehicleTypes: string[]): Freight[] => {
    if (!vehicleTypes || vehicleTypes.length === 0) return freights;
    
    return freights.filter(freight => {
      if (!freight.tipos_veiculos || !Array.isArray(freight.tipos_veiculos)) return false;
      
      return vehicleTypes.some(vehicleType => {
        return freight.tipos_veiculos.some((item: any) => {
          // Se for string simples
          if (typeof item === 'string') return item === vehicleType;
          
          // Se for objeto
          if (typeof item === 'object' && item !== null) {
            return item.value === vehicleType || item.type === vehicleType || item.id === vehicleType;
          }
          
          // Se for array aninhado
          if (Array.isArray(item)) {
            return item.some((subItem: any) => {
              if (typeof subItem === 'string') return subItem === vehicleType;
              if (typeof subItem === 'object' && subItem !== null) {
                return subItem.value === vehicleType || subItem.type === vehicleType || subItem.id === vehicleType;
              }
              return false;
            });
          }
          
          return false;
        });
      });
    });
  };

  // Função para filtrar por tipos de carroceria
  const filterByBodyTypes = (freights: Freight[], bodyTypes: string[]): Freight[] => {
    if (!bodyTypes || bodyTypes.length === 0) return freights;
    
    return freights.filter(freight => {
      if (!freight.tipos_carrocerias || !Array.isArray(freight.tipos_carrocerias)) return false;
      
      return bodyTypes.some(bodyType => {
        return freight.tipos_carrocerias.some((item: any) => {
          // Se for string simples
          if (typeof item === 'string') return item === bodyType;
          
          // Se for objeto
          if (typeof item === 'object' && item !== null) {
            return item.value === bodyType || item.type === bodyType || item.id === bodyType;
          }
          
          // Se for array aninhado
          if (Array.isArray(item)) {
            return item.some((subItem: any) => {
              if (typeof subItem === 'string') return subItem === bodyType;
              if (typeof subItem === 'object' && subItem !== null) {
                return subItem.value === bodyType || subItem.type === bodyType || subItem.id === bodyType;
              }
              return false;
            });
          }
          
          return false;
        });
      });
    });
  };

  // Função para filtrar por tipo de frete
  const filterByFreightType = (freights: Freight[], freightType: string): Freight[] => {
    if (!freightType) return freights;
    return freights.filter(freight => freight.tipo_frete === freightType);
  };

  // Função para filtrar por rastreador
  const filterByTracker = (freights: Freight[], tracker: string): Freight[] => {
    if (!tracker || tracker === 'todos') return freights;
    
    const needsTracker = tracker === 'sim';
    return freights.filter(freight => freight.precisa_rastreador === needsTracker);
  };

  // Aplicar todos os filtros
  const applyFilters = useCallback((freights: Freight[], filters: PublicFreightFilters): Freight[] => {
    console.log('🔄 Aplicando filtros:', filters);
    console.log('📊 Total de fretes antes dos filtros:', freights.length);
    
    let result = [...freights];
    
    // Filtro de origem
    if (filters.origin) {
      console.log('🏠 Aplicando filtro de origem:', filters.origin);
      result = filterByOrigin(result, filters.origin);
      console.log('📊 Fretes após filtro de origem:', result.length);
    }
    
    // Filtro de destino
    if (filters.destination) {
      console.log('🎯 Aplicando filtro de destino:', filters.destination);
      result = filterByDestination(result, filters.destination);
      console.log('📊 Fretes após filtro de destino:', result.length);
    }
    
    // Filtro de tipos de veículos
    if (filters.vehicleTypes && filters.vehicleTypes.length > 0) {
      console.log('🚚 Aplicando filtro de tipos de veículos:', filters.vehicleTypes);
      result = filterByVehicleTypes(result, filters.vehicleTypes);
      console.log('📊 Fretes após filtro de veículos:', result.length);
    }
    
    // Filtro de tipos de carroceria
    if (filters.bodyTypes && filters.bodyTypes.length > 0) {
      console.log('🚛 Aplicando filtro de tipos de carroceria:', filters.bodyTypes);
      result = filterByBodyTypes(result, filters.bodyTypes);
      console.log('📊 Fretes após filtro de carroceria:', result.length);
    }
    
    // Filtro de tipo de frete
    if (filters.freightType) {
      console.log('📦 Aplicando filtro de tipo de frete:', filters.freightType);
      result = filterByFreightType(result, filters.freightType);
      console.log('📊 Fretes após filtro de tipo:', result.length);
    }
    
    // Filtro de rastreador
    if (filters.tracker) {
      console.log('📡 Aplicando filtro de rastreador:', filters.tracker);
      result = filterByTracker(result, filters.tracker);
      console.log('📊 Fretes após filtro de rastreador:', result.length);
    }
    
    console.log('✅ Total de fretes após todos os filtros:', result.length);
    return result;
  }, []);

  // Buscar todos os fretes (sem filtros SQL)
  const fetchAllFreights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Buscando todos os fretes...');
      
      const { data: freightData, error: freightError } = await supabase
        .from('fretes')
        .select('*')
        .in('status', ['ativo', 'pendente'])
        .order('created_at', { ascending: false });

      if (freightError) {
        console.error('❌ Erro ao buscar fretes:', freightError);
        setError('Erro ao buscar fretes públicos');
        return;
      }

      console.log('✅ Fretes carregados:', freightData?.length || 0);

      // Transform data
      const formattedFreights: Freight[] = (freightData || []).map(freight => ({
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

      setAllFreights(formattedFreights);
    } catch (err) {
      console.error('❌ Erro ao carregar fretes:', err);
      setError('Erro ao carregar fretes públicos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Aplicar filtros quando mudarem
  useEffect(() => {
    if (allFreights.length > 0) {
      const filtered = applyFilters(allFreights, filters);
      setFilteredFreights(filtered);
      
      // Calcular paginação
      const totalItems = filtered.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      
      setPagination({
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage
      });
    }
  }, [allFreights, filters, page, itemsPerPage, applyFilters]);

  // Carregar fretes na inicialização
  useEffect(() => {
    fetchAllFreights();
  }, [fetchAllFreights]);

  // Obter fretes paginados
  const paginatedFreights = filteredFreights.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return {
    freights: paginatedFreights,
    loading,
    error,
    pagination,
    refetch: fetchAllFreights,
  };
};
