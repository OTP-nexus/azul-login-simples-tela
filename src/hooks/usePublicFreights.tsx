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
}

export const usePublicFreights = (filters: PublicFreightFilters = {}) => {
  const [freights, setFreights] = useState<Freight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFreights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('fretes')
        .select('*')
        .in('status', ['ativo', 'pendente']) // Alterado para incluir fretes pendentes
        .order('created_at', { ascending: false });

      if (filters.origin) {
        query = query.or(`origem_cidade.ilike.%${filters.origin}%,origem_estado.ilike.%${filters.origin}%`);
      }
      
      if (filters.destination) {
        query = query.or(`destinos::text.ilike.%${filters.destination}%,destino_cidade.ilike.%${filters.destination}%,destino_estado.ilike.%${filters.destination}%`);
      }
      
      if (filters.vehicleTypes && filters.vehicleTypes.length > 0) {
        query = query.contains('tipos_veiculos', filters.vehicleTypes);
      }
      
      if (filters.bodyTypes && filters.bodyTypes.length > 0) {
        query = query.contains('tipos_carrocerias', filters.bodyTypes);
      }
      
      if (filters.freightType) {
        query = query.eq('tipo_frete', filters.freightType);
      }

      const { data: freightData, error: freightError } = await query;

      if (freightError) {
        console.error('Erro ao buscar fretes públicos:', freightError);
        setError('Erro ao buscar fretes públicos');
        return;
      }

      // Reusing the same data transformation logic as useActiveFreights
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
      setFreights(formattedFreights);
    } catch (err) {
      console.error('Erro ao carregar fretes públicos:', err);
      setError('Erro ao carregar fretes públicos');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchFreights();
  }, [fetchFreights]);

  return {
    freights,
    loading,
    error,
    refetch: fetchFreights,
  };
};
