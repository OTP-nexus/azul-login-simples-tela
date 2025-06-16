
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ActiveFreight } from '@/hooks/useActiveFreights';

export type Freight = ActiveFreight & {
  destino_cidade?: string | null;
  destino_estado?: string | null;
};

export interface SimpleFreightFilters {
  origin?: string;
  destination?: string;
  freightType?: string;
  tracker?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export const useSimplePublicFreights = (filters: SimpleFreightFilters = {}, page: number = 1, itemsPerPage: number = 20) => {
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

      console.log('🔄 [useSimplePublicFreights] Iniciando busca com parâmetros:', {
        filters,
        page,
        itemsPerPage,
        filtersStringified: JSON.stringify(filters)
      });

      // Construir query base
      let countQuery = supabase
        .from('fretes')
        .select('*', { count: 'exact', head: true })
        .in('status', ['ativo', 'pendente']);

      let dataQuery = supabase
        .from('fretes')
        .select('*')
        .in('status', ['ativo', 'pendente'])
        .order('created_at', { ascending: false })
        .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

      console.log('🔧 [useSimplePublicFreights] Queries base criadas');
      console.log('🔧 [useSimplePublicFreights] Range de paginação:', {
        start: (page - 1) * itemsPerPage,
        end: page * itemsPerPage - 1
      });

      // Aplicar filtros simples no backend
      if (filters.origin && filters.origin.trim() !== '') {
        const originFilter = `origem_cidade.ilike.%${filters.origin}%,origem_estado.ilike.%${filters.origin}%`;
        console.log('🔍 [useSimplePublicFreights] Aplicando filtro de origem:', originFilter);
        countQuery = countQuery.or(originFilter);
        dataQuery = dataQuery.or(originFilter);
      }
      
      if (filters.destination && filters.destination.trim() !== '') {
        const destinationFilter = `destinos::text.ilike.%${filters.destination}%,destino_cidade.ilike.%${filters.destination}%,destino_estado.ilike.%${filters.destination}%,paradas::text.ilike.%${filters.destination}%`;
        console.log('🔍 [useSimplePublicFreights] Aplicando filtro de destino:', destinationFilter);
        countQuery = countQuery.or(destinationFilter);
        dataQuery = dataQuery.or(destinationFilter);
      }
      
      if (filters.freightType && filters.freightType.trim() !== '') {
        console.log('🔍 [useSimplePublicFreights] Aplicando filtro de tipo de frete:', filters.freightType);
        countQuery = countQuery.eq('tipo_frete', filters.freightType);
        dataQuery = dataQuery.eq('tipo_frete', filters.freightType);
      }
      
      if (filters.tracker === 'sim') {
        console.log('🔍 [useSimplePublicFreights] Aplicando filtro de rastreador: SIM');
        countQuery = countQuery.eq('precisa_rastreador', true);
        dataQuery = dataQuery.eq('precisa_rastreador', true);
      } else if (filters.tracker === 'nao') {
        console.log('🔍 [useSimplePublicFreights] Aplicando filtro de rastreador: NÃO');
        countQuery = countQuery.eq('precisa_rastreador', false);
        dataQuery = dataQuery.eq('precisa_rastreador', false);
      }

      console.log('🚀 [useSimplePublicFreights] Executando queries no Supabase...');

      // Executar queries
      const [{ count }, { data: freightData, error: freightError }] = await Promise.all([
        countQuery,
        dataQuery
      ]);

      console.log('📊 [useSimplePublicFreights] Resultado das queries:', {
        count,
        freightDataLength: freightData?.length || 0,
        freightError,
        hasError: !!freightError
      });

      if (freightError) {
        console.error('❌ [useSimplePublicFreights] Erro ao buscar fretes:', freightError);
        setError('Erro ao buscar fretes públicos');
        return;
      }

      // Calcular paginação
      const totalItems = count || 0;
      const totalPages = Math.ceil(totalItems / itemsPerPage);

      console.log('📄 [useSimplePublicFreights] Informações de paginação calculadas:', {
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage
      });

      setPagination({
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage
      });

      // Transformar dados
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

      console.log('✅ [useSimplePublicFreights] Dados transformados com sucesso:', {
        formattedFreightsLength: formattedFreights.length,
        firstFreight: formattedFreights[0] ? {
          id: formattedFreights[0].id,
          codigo: formattedFreights[0].codigo_agregamento,
          origem: `${formattedFreights[0].origem_cidade}, ${formattedFreights[0].origem_estado}`,
          tipo: formattedFreights[0].tipo_frete
        } : null
      });

      setFreights(formattedFreights);
    } catch (err) {
      console.error('💥 [useSimplePublicFreights] Erro inesperado:', err);
      setError('Erro ao carregar fretes públicos');
    } finally {
      setLoading(false);
      console.log('🏁 [useSimplePublicFreights] Busca finalizada');
    }
  }, [JSON.stringify(filters), page, itemsPerPage]);

  useEffect(() => {
    console.log('🔄 [useSimplePublicFreights] useEffect disparado, executando fetchFreights...');
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
