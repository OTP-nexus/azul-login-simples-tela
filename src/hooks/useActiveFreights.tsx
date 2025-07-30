
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ActiveFreight {
  id: string;
  codigo_agregamento: string;
  tipo_frete: string;
  status: string;
  origem_cidade: string;
  origem_estado: string;
  destino_cidade?: string;
  destino_estado?: string;
  destinos: any[];
  data_coleta: string;
  data_entrega: string;
  tipo_mercadoria: string;
  peso_carga: number;
  valor_carga: number;
  altura_carga?: number;
  largura_carga?: number;
  comprimento_carga?: number;
  valores_definidos: any;
  tipos_veiculos: any[];
  tipos_carrocerias: any[];
  collaborator_ids: string[];
  company_id: string;
  created_at: string;
  updated_at: string;
  pedagio_pago_por: string;
  pedagio_direcao: string;
  precisa_seguro: boolean;
  precisa_rastreador: boolean;
  precisa_ajudante: boolean;
  horario_carregamento: string;
  observacoes: string;
  paradas: any[];
  beneficios: any[];
  regras_agendamento: any[];
  tabelas_preco: any[];
  itens_detalhados?: any[];
  descricao_livre_itens?: string;
  tipo_listagem_itens?: string;
}

export const useActiveFreights = () => {
  const [freights, setFreights] = useState<ActiveFreight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchFreights = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Buscar todos os fretes ativos para motoristas
      const { data: freightData, error: freightError } = await supabase
        .from('fretes')
        .select('*')
        .eq('status', 'ativo')
        .order('created_at', { ascending: false });

      if (freightError) {
        console.error('Erro ao buscar fretes:', freightError);
        setError('Erro ao buscar fretes');
        return;
      }

      // Converter os dados do Supabase para o formato esperado
      const formattedFreights: ActiveFreight[] = (freightData || []).map(freight => ({
        id: freight.id,
        codigo_agregamento: freight.codigo_agregamento || '',
        tipo_frete: freight.tipo_frete,
        status: freight.status || 'ativo', // Mudança aqui: padrão é "ativo" ao invés de "pendente"
        origem_cidade: freight.origem_cidade,
        origem_estado: freight.origem_estado,
        destino_cidade: freight.destino_cidade,
        destino_estado: freight.destino_estado,
        destinos: Array.isArray(freight.destinos) ? freight.destinos : [],
        data_coleta: freight.data_coleta,
        data_entrega: freight.data_entrega,
        tipo_mercadoria: freight.tipo_mercadoria,
        peso_carga: freight.peso_carga,
        valor_carga: freight.valor_carga,
        altura_carga: freight.altura_carga,
        largura_carga: freight.largura_carga,
        comprimento_carga: freight.comprimento_carga,
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
        itens_detalhados: Array.isArray(freight.itens_detalhados) ? freight.itens_detalhados : [],
        descricao_livre_itens: freight.descricao_livre_itens,
        tipo_listagem_itens: freight.tipo_listagem_itens
      }));

      setFreights(formattedFreights);
    } catch (err) {
      console.error('Erro ao carregar fretes:', err);
      setError('Erro ao carregar fretes');
    } finally {
      setLoading(false);
    }
  };

  const updateFreightStatus = async (freightId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('fretes')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', freightId);

      if (error) {
        console.error('Erro ao atualizar status:', error);
        toast({
          title: "Erro ao atualizar status",
          description: "Não foi possível atualizar o status do frete.",
          variant: "destructive"
        });
        return false;
      }

      // Atualizar a lista local
      setFreights(prev => 
        prev.map(freight => 
          freight.id === freightId 
            ? { ...freight, status: newStatus, updated_at: new Date().toISOString() }
            : freight
        )
      );

      toast({
        title: "Status atualizado",
        description: `Frete ${newStatus} com sucesso.`,
      });

      return true;
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      toast({
        title: "Erro ao atualizar status",
        description: "Erro interno do sistema.",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteFreight = async (freightId: string) => {
    try {
      const { error } = await supabase
        .from('fretes')
        .delete()
        .eq('id', freightId);

      if (error) {
        console.error('Erro ao deletar frete:', error);
        toast({
          title: "Erro ao deletar frete",
          description: "Não foi possível deletar o frete.",
          variant: "destructive"
        });
        return false;
      }

      // Remover da lista local
      setFreights(prev => prev.filter(freight => freight.id !== freightId));

      toast({
        title: "Frete deletado",
        description: "Frete removido com sucesso.",
      });

      return true;
    } catch (err) {
      console.error('Erro ao deletar frete:', err);
      toast({
        title: "Erro ao deletar frete",
        description: "Erro interno do sistema.",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchFreights();
  }, [user]);

  return {
    freights,
    loading,
    error,
    refetch: fetchFreights,
    updateFreightStatus,
    deleteFreight
  };
};
