
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Freight } from '@/hooks/usePublicFreightsV2';

export const useFreightByCode = (freightCode: string | undefined) => {
  return useQuery({
    queryKey: ['freight', freightCode],
    queryFn: async (): Promise<Freight> => {
      if (!freightCode) {
        throw new Error('Código do frete é obrigatório');
      }

      console.log('🔍 Buscando frete com código:', freightCode);

      const { data, error } = await supabase
        .from('fretes')
        .select('*')
        .eq('codigo_agregamento', freightCode)
        .in('status', ['ativo', 'pendente'])
        .single();

      if (error) {
        console.error('❌ Erro ao buscar frete:', error);
        if (error.code === 'PGRST116') {
          throw new Error('Frete não encontrado');
        }
        throw error;
      }

      if (!data) {
        throw new Error('Frete não encontrado');
      }

      console.log('✅ Frete encontrado:', data);

      // Transformar dados para o formato esperado (mesmo formato do usePublicFreightsV2)
      const formattedFreight: Freight = {
        id: data.id,
        codigo_agregamento: data.codigo_agregamento || '',
        tipo_frete: data.tipo_frete,
        status: data.status || 'ativo',
        origem_cidade: data.origem_cidade,
        origem_estado: data.origem_estado,
        destinos: Array.isArray(data.destinos) ? data.destinos : [],
        data_coleta: data.data_coleta,
        data_entrega: data.data_entrega,
        tipo_mercadoria: data.tipo_mercadoria,
        peso_carga: data.peso_carga,
        valor_carga: data.valor_carga,
        valores_definidos: data.valores_definidos,
        tipos_veiculos: Array.isArray(data.tipos_veiculos) ? data.tipos_veiculos : [],
        tipos_carrocerias: Array.isArray(data.tipos_carrocerias) ? data.tipos_carrocerias : [],
        collaborator_ids: data.collaborator_ids,
        created_at: data.created_at,
        updated_at: data.updated_at,
        pedagio_pago_por: data.pedagio_pago_por,
        pedagio_direcao: data.pedagio_direcao,
        precisa_seguro: data.precisa_seguro || false,
        precisa_rastreador: data.precisa_rastreador || false,
        precisa_ajudante: data.precisa_ajudante || false,
        horario_carregamento: data.horario_carregamento,
        observacoes: data.observacoes,
        paradas: Array.isArray(data.paradas) ? data.paradas : [],
        beneficios: Array.isArray(data.beneficios) ? data.beneficios : [],
        regras_agendamento: Array.isArray(data.regras_agendamento) ? data.regras_agendamento : [],
        tabelas_preco: Array.isArray(data.tabelas_preco) ? data.tabelas_preco : [],
        destino_cidade: data.destino_cidade,
        destino_estado: data.destino_estado
      };

      return formattedFreight;
    },
    enabled: !!freightCode,
    retry: (failureCount, error: any) => {
      // Não retentar se for erro de "não encontrado"
      if (error?.message === 'Frete não encontrado') {
        return false;
      }
      return failureCount < 3;
    },
  });
};
