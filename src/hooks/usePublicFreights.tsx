
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

// Helper type for the raw freight data from database
type RawFreightData = {
  id: string;
  codigo_agregamento: string | null;
  tipo_frete: string;
  status: string | null;
  origem_cidade: string;
  origem_estado: string;
  destinos: any;
  data_coleta: string | null;
  data_entrega: string | null;
  tipo_mercadoria: string;
  peso_carga: number | null;
  valor_carga: number | null;
  valores_definidos: any;
  tipos_veiculos: any;
  tipos_carrocerias: any;
  collaborator_ids: string[] | null;
  created_at: string;
  updated_at: string;
  pedagio_pago_por: string | null;
  pedagio_direcao: string | null;
  precisa_seguro: boolean | null;
  precisa_rastreador: boolean | null;
  precisa_ajudante: boolean | null;
  horario_carregamento: string | null;
  observacoes: string | null;
  paradas: any;
  beneficios: any;
  regras_agendamento: any;
  tabelas_preco: any;
  destino_cidade: string | null;
  destino_estado: string | null;
};

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

      console.log('Aplicando filtros:', filters, 'Página:', page);

      // Criar um objeto de filtros limpo, removendo valores vazios
      const cleanFilters: Record<string, any> = {};
      
      // Apenas adicionar filtros que têm valores válidos
      if (filters.origin && filters.origin.trim() !== '') {
        cleanFilters.origin = filters.origin.trim();
      }
      
      if (filters.destination && filters.destination.trim() !== '') {
        cleanFilters.destination = filters.destination.trim();
      }
      
      if (filters.freightType && filters.freightType.trim() !== '') {
        cleanFilters.freightType = filters.freightType.trim();
      }
      
      if (filters.tracker && filters.tracker !== 'todos') {
        cleanFilters.tracker = filters.tracker;
      }
      
      if (filters.vehicleTypes && filters.vehicleTypes.length > 0) {
        cleanFilters.vehicleTypes = filters.vehicleTypes;
      }
      
      if (filters.bodyTypes && filters.bodyTypes.length > 0) {
        cleanFilters.bodyTypes = filters.bodyTypes;
      }

      console.log('Filtros limpos enviados:', cleanFilters);

      // Usar a nova função PostgreSQL que faz toda a filtragem no servidor
      const { data, error: rpcError } = await supabase.rpc('search_public_freights', {
        p_filters: cleanFilters,
        p_page: page,
        p_page_size: itemsPerPage
      });

      if (rpcError) {
        console.error('Erro ao buscar fretes públicos:', rpcError);
        setError('Erro ao buscar fretes públicos');
        return;
      }

      console.log('Dados retornados da função:', data);

      if (!data || data.length === 0) {
        console.log('Nenhum dado retornado da função');
        setFreights([]);
        setPagination({
          currentPage: page,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage
        });
        return;
      }

      // Extrair dados dos fretes e contagem total
      const freightData = data.filter(item => item.freight_data && Object.keys(item.freight_data as object).length > 0);
      const totalCount = data[0]?.total_count || 0;

      console.log('Dados filtrados de fretes:', freightData.length, 'Total count:', totalCount);

      // Transform data - manter a mesma estrutura de dados que o código anterior
      const formattedFreights: Freight[] = freightData.map(item => {
        const freight = item.freight_data as RawFreightData;
        return {
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
        };
      });

      console.log('Fretes formatados:', formattedFreights.length);

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / itemsPerPage);

      setPagination({
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage
      });

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
