
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
  destinos: any[];
  data_coleta: string;
  data_entrega: string;
  tipo_mercadoria: string;
  peso_carga: number;
  valor_carga: number;
  valores_definidos: any;
  tipos_veiculos: any[];
  tipos_carrocerias: any[];
  collaborator_ids: string[];
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

      // Buscar a empresa do usuário
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (companyError) {
        console.error('Erro ao buscar empresa:', companyError);
        setError('Erro ao buscar empresa');
        return;
      }

      // Buscar fretes da empresa
      const { data: freightData, error: freightError } = await supabase
        .from('fretes')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (freightError) {
        console.error('Erro ao buscar fretes:', freightError);
        setError('Erro ao buscar fretes');
        return;
      }

      setFreights(freightData || []);
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
