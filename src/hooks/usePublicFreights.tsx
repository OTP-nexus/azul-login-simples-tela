
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ActiveFreight } from '@/hooks/useActiveFreights';

// Re-exporting the type for convenience
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

  const fetchFreights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Buscando fretes com filtros no servidor:', filters);
      
      // Construir query base
      let query = supabase
        .from('fretes')
        .select('*', { count: 'exact' })
        .in('status', ['ativo', 'pendente'])
        .order('created_at', { ascending: false });

      // Filtro de origem
      if (filters.origin) {
        const searchTerms = filters.origin.toLowerCase().split(' ');
        
        // Criar condições OR para origem_cidade e origem_estado
        let originConditions: string[] = [];
        
        searchTerms.forEach(term => {
          if (term.trim()) {
            originConditions.push(`origem_cidade.ilike.%${term}%`);
            originConditions.push(`origem_estado.ilike.%${term}%`);
          }
        });
        
        if (originConditions.length > 0) {
          query = query.or(originConditions.join(','));
        }
      }

      // Filtro de tipo de frete
      if (filters.freightType) {
        query = query.eq('tipo_frete', filters.freightType);
      }

      // Filtro de rastreador
      if (filters.tracker && filters.tracker !== 'todos') {
        const needsTracker = filters.tracker === 'sim';
        query = query.eq('precisa_rastreador', needsTracker);
      }

      // Filtro de tipos de veículos (usando função do PostgreSQL)
      if (filters.vehicleTypes && filters.vehicleTypes.length > 0) {
        query = query.rpc('search_vehicle_types', {
          vehicle_data: 'tipos_veiculos',
          search_values: filters.vehicleTypes
        });
      }

      // Filtro de tipos de carroceria (usando função do PostgreSQL)
      if (filters.bodyTypes && filters.bodyTypes.length > 0) {
        query = query.rpc('search_body_types', {
          body_data: 'tipos_carrocerias',
          search_values: filters.bodyTypes
        });
      }

      // Aplicar paginação
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data: freightData, error: freightError, count } = await query;

      if (freightError) {
        console.error('❌ Erro ao buscar fretes:', freightError);
        setError('Erro ao buscar fretes públicos');
        return;
      }

      console.log('✅ Fretes encontrados:', freightData?.length || 0, 'de', count || 0);

      // Se há filtro de destino, aplicar filtro específico pós-query
      let filteredData = freightData || [];
      
      if (filters.destination) {
        console.log('🎯 Aplicando filtro de destino:', filters.destination);
        const searchValue = filters.destination.toLowerCase();
        
        filteredData = filteredData.filter(freight => {
          const tipoFrete = freight.tipo_frete;
          
          // Para frete_completo e frete_de_retorno: buscar em paradas
          if (tipoFrete === 'frete_completo' || tipoFrete === 'frete_de_retorno') {
            if (!freight.paradas || !Array.isArray(freight.paradas)) {
              return false;
            }
            
            return freight.paradas.some((parada: any) => {
              if (!parada || typeof parada !== 'object') return false;
              
              const city = parada.city?.toLowerCase() || '';
              const state = parada.state?.toLowerCase() || '';
              const endereco = parada.endereco?.toLowerCase() || '';
              
              return city.includes(searchValue) || state.includes(searchValue) || endereco.includes(searchValue);
            });
          }
          
          // Para agregamento e comum: buscar em destinos, destino_cidade, destino_estado
          const destinoCity = freight.destino_cidade?.toLowerCase() || '';
          const destinoState = freight.destino_estado?.toLowerCase() || '';
          
          if (destinoCity.includes(searchValue) || destinoState.includes(searchValue)) {
            return true;
          }
          
          if (freight.destinos && Array.isArray(freight.destinos)) {
            return freight.destinos.some((destino: any) => {
              if (!destino || typeof destino !== 'object') return false;
              
              const city = destino.city?.toLowerCase() || '';
              const state = destino.state?.toLowerCase() || '';
              const endereco = destino.endereco?.toLowerCase() || '';
              
              return city.includes(searchValue) || state.includes(searchValue) || endereco.includes(searchValue);
            });
          }
          
          return false;
        });
        
        console.log('📊 Fretes após filtro de destino:', filteredData.length);
      }

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
      
      // Calcular paginação
      const totalItems = filters.destination ? formattedFreights.length : (count || 0);
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      
      setPagination({
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage
      });

    } catch (err) {
      console.error('❌ Erro ao carregar fretes:', err);
      setError('Erro ao carregar fretes públicos');
    } finally {
      setLoading(false);
    }
  }, [filters, page, itemsPerPage]);

  // Recarregar quando filtros ou página mudarem
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
