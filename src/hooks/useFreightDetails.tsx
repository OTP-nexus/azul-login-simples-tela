
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
          origem_tipo_endereco: data.origem_tipo_endereco,
          origem_possui_carga_descarga: data.origem_possui_carga_descarga || false,
          origem_possui_escada: data.origem_possui_escada || false,
          origem_possui_elevador: data.origem_possui_elevador || false,
          origem_possui_doca: data.origem_possui_doca || false,
          destinos: Array.isArray(data.destinos) ? data.destinos : [],
          destino_cidade: data.destino_cidade,
          destino_estado: data.destino_estado,
          destino_tipo_endereco: data.destino_tipo_endereco,
          destino_possui_carga_descarga: data.destino_possui_carga_descarga || false,
          destino_possui_escada: data.destino_possui_escada || false,
          destino_possui_elevador: data.destino_possui_elevador || false,
          destino_possui_doca: data.destino_possui_doca || false,
          paradas: Array.isArray(data.paradas) ? data.paradas : [],
          data_coleta: data.data_coleta,
          data_entrega: data.data_entrega,
          horario_carregamento: data.horario_carregamento,
          tipo_mercadoria: data.tipo_mercadoria,
          peso_carga: data.peso_carga,
          valor_carga: data.valor_carga,
          valores_definidos: data.valores_definidos,
          tipos_veiculos: Array.isArray(data.tipos_veiculos) ? data.tipos_veiculos : [],
          tipos_carrocerias: Array.isArray(data.tipos_carrocerias) ? data.tipos_carrocerias : [],
          itens_detalhados: Array.isArray(data.itens_detalhados) ? data.itens_detalhados : [],
          tipo_listagem_itens: data.tipo_listagem_itens,
          descricao_livre_itens: data.descricao_livre_itens,
          precisa_montar_desmontar: data.precisa_montar_desmontar || false,
          precisa_embalagem: data.precisa_embalagem || false,
          precisa_seguro: data.precisa_seguro || false,
          precisa_rastreador: data.precisa_rastreador || false,
          precisa_ajudante: data.precisa_ajudante || false,
          pedagio_pago_por: data.pedagio_pago_por,
          pedagio_direcao: data.pedagio_direcao,
          local_possui_restricao: data.local_possui_restricao || false,
          descricao_restricao: data.descricao_restricao,
          observacoes: data.observacoes,
          beneficios: Array.isArray(data.beneficios) ? data.beneficios : [],
          regras_agendamento: Array.isArray(data.regras_agendamento) ? data.regras_agendamento : [],
          tabelas_preco: Array.isArray(data.tabelas_preco) ? data.tabelas_preco : [],
          tipo_solicitacao: data.tipo_solicitacao,
          solicitante_nome: data.solicitante_nome,
          solicitante_telefone: data.solicitante_telefone,
          solicitante_confirmar_telefone: data.solicitante_confirmar_telefone,
          collaborator_ids: data.collaborator_ids,
          company_id: data.company_id,
          created_at: data.created_at,
          updated_at: data.updated_at,
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
