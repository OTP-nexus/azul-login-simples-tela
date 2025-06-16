
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

export const usePublicFreightsV2 = (filters: PublicFreightFilters = {}, page: number = 1, itemsPerPage: number = 20) => {
  const [freights, setFreights] = useState<Freight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage
  });

  const buildQuery = useCallback(() => {
    console.log('🔍 Construindo query com filtros:', filters);
    
    let query = supabase
      .from('fretes')
      .select('*', { count: 'exact' })
      .in('status', ['ativo', 'pendente'])
      .order('created_at', { ascending: false });

    // Filtro de origem - busca em origem_cidade e origem_estado
    if (filters.origin && filters.origin.trim() !== '') {
      const searchTerm = filters.origin.trim();
      console.log('🏭 Aplicando filtro de origem:', searchTerm);
      
      query = query.or(`origem_cidade.ilike.%${searchTerm}%,origem_estado.ilike.%${searchTerm}%`);
    }

    // Filtro de destino - busca em destino_cidade, destino_estado, destinos e paradas
    if (filters.destination && filters.destination.trim() !== '') {
      const searchTerm = filters.destination.trim();
      console.log('🎯 Aplicando filtro de destino:', searchTerm);
      
      query = query.or(`destino_cidade.ilike.%${searchTerm}%,destino_estado.ilike.%${searchTerm}%,destinos.cs.["${searchTerm}"],paradas.cs.["${searchTerm}"]`);
    }

    // Filtro de tipo de frete
    if (filters.freightType && filters.freightType.trim() !== '') {
      console.log('📦 Aplicando filtro de tipo de frete:', filters.freightType);
      query = query.eq('tipo_frete', filters.freightType);
    }

    // Filtro de rastreador
    if (filters.tracker && filters.tracker !== 'todos') {
      const needsTracker = filters.tracker === 'sim';
      console.log('📡 Aplicando filtro de rastreador:', needsTracker);
      query = query.eq('precisa_rastreador', needsTracker);
    }

    return query;
  }, [filters]);

  const fetchFreights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🚀 Iniciando busca - Página:', page, 'Filtros:', filters);

      // Construir query base
      let query = buildQuery();
      
      // Aplicar paginação
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      console.log('📊 Executando query principal...');
      const { data: baseData, error: baseError, count } = await query;

      if (baseError) {
        console.error('❌ Erro na query principal:', baseError);
        setError('Erro ao buscar fretes');
        return;
      }

      console.log('✅ Query principal executada. Resultados encontrados:', baseData?.length || 0, 'Total:', count);

      if (!baseData || baseData.length === 0) {
        console.log('📭 Nenhum resultado encontrado');
        setFreights([]);
        setPagination({
          currentPage: page,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage
        });
        return;
      }

      let filteredData = baseData;

      // Aplicar filtros complexos usando as funções SQL existentes
      if (filters.vehicleTypes && filters.vehicleTypes.length > 0) {
        console.log('🚚 Aplicando filtro de tipos de veículo:', filters.vehicleTypes);
        
        const vehicleFilterPromises = filteredData.map(async (freight) => {
          const { data, error } = await supabase.rpc('search_vehicle_types', {
            vehicle_data: freight.tipos_veiculos,
            search_values: filters.vehicleTypes
          });
          
          if (error) {
            console.error('❌ Erro no filtro de veículos:', error);
            return false;
          }
          
          return data === true;
        });

        const vehicleResults = await Promise.all(vehicleFilterPromises);
        filteredData = filteredData.filter((_, index) => vehicleResults[index]);
        console.log('🚚 Após filtro de veículos:', filteredData.length, 'itens');
      }

      if (filters.bodyTypes && filters.bodyTypes.length > 0) {
        console.log('🏗️ Aplicando filtro de tipos de carroceria:', filters.bodyTypes);
        
        const bodyFilterPromises = filteredData.map(async (freight) => {
          const { data, error } = await supabase.rpc('search_body_types', {
            body_data: freight.tipos_carrocerias,
            search_values: filters.bodyTypes
          });
          
          if (error) {
            console.error('❌ Erro no filtro de carrocerias:', error);
            return false;
          }
          
          return data === true;
        });

        const bodyResults = await Promise.all(bodyFilterPromises);
        filteredData = filteredData.filter((_, index) => bodyResults[index]);
        console.log('🏗️ Após filtro de carrocerias:', filteredData.length, 'itens');
      }

      // Transformar dados para o formato esperado
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

      console.log('✅ Dados formatados:', formattedFreights.length, 'fretes');

      // Calcular informações de paginação baseado no count total
      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / itemsPerPage);

      setPagination({
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage
      });

      setFreights(formattedFreights);

    } catch (err) {
      console.error('❌ Erro geral ao carregar fretes:', err);
      setError('Erro ao carregar fretes públicos');
    } finally {
      setLoading(false);
    }
  }, [buildQuery, page, itemsPerPage, filters.vehicleTypes, filters.bodyTypes]);

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
