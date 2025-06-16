
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Freight } from '@/hooks/usePublicFreights';

export const useFreightDetails = (freightCode: string) => {
  const [freight, setFreight] = useState<Freight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFreightDetails = async () => {
      if (!freightCode) {
        setError('Código do frete não fornecido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('fretes')
          .select('*')
          .eq('codigo_agregamento', freightCode)
          .in('status', ['ativo', 'pendente'])
          .single();

        if (fetchError) {
          console.error('Erro ao buscar detalhes do frete:', fetchError);
          setError('Frete não encontrado');
          return;
        }

        // Transform data similar to usePublicFreights
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
          destino_estado: data.destino_estado,
          solicitante_nome: data.solicitante_nome,
          solicitante_telefone: data.solicitante_telefone
        };

        setFreight(formattedFreight);
      } catch (err) {
        console.error('Erro ao carregar detalhes do frete:', err);
        setError('Erro ao carregar detalhes do frete');
      } finally {
        setLoading(false);
      }
    };

    fetchFreightDetails();
  }, [freightCode]);

  return {
    freight,
    loading,
    error
  };
};
