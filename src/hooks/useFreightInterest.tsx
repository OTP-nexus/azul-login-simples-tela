import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface FreightInterestData {
  freight_id: string;
  driver_id: string;
}

export const useFreightInterest = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Verificar se o motorista já demonstrou interesse
  const checkExistingInterest = async (freightId: string) => {
    if (!user) return false;

    const { data: driver } = await supabase
      .from('drivers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!driver) return false;

    const { data: existingInterest } = await supabase
      .from('freight_contacts')
      .select('id')
      .eq('freight_id', freightId)
      .eq('driver_id', driver.id)
      .single();

    return !!existingInterest;
  };

  // Demonstrar interesse no frete
  const demonstrateInterest = useMutation({
    mutationFn: async (freightId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      setIsLoading(true);

      // Buscar dados do motorista
      const { data: driver, error: driverError } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (driverError || !driver) {
        throw new Error('Motorista não encontrado');
      }

      // Verificar se já demonstrou interesse
      const hasInterest = await checkExistingInterest(freightId);
      if (hasInterest) {
        throw new Error('Você já demonstrou interesse neste frete');
      }

      // Criar registro de interesse
      const { error: insertError } = await supabase
        .from('freight_contacts')
        .insert({
          freight_id: freightId,
          driver_id: driver.id,
          company_response: 'pending'
        });

      if (insertError) {
        throw new Error('Erro ao demonstrar interesse');
      }

      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Interesse demonstrado!",
        description: "A empresa poderá ver seu interesse e entrar em contato",
      });
      queryClient.invalidateQueries({ queryKey: ['freight-interests'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao demonstrar interesse",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  // Buscar interesses de um frete específico (para empresas)
  const getFreightInterests = async (freightId: string) => {
    const { data, error } = await supabase
      .from('freight_contacts')
      .select(`
        *,
        driver:drivers!inner (
          id,
          cpf,
          cnh,
          vehicle_type,
          user:profiles!inner (
            id,
            full_name,
            phone,
            email
          )
        )
      `)
      .eq('freight_id', freightId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar interesses:', error);
      return [];
    }

    return data || [];
  };

  // Buscar todos os interesses da empresa
  const getCompanyInterests = async () => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('freight_contacts')
      .select(`
        *,
        freight:fretes!inner (
          id,
          codigo_agregamento,
          tipo_frete,
          origem_cidade,
          origem_estado,
          destino_cidade,
          destino_estado,
          created_at,
          company:companies!inner (
            user_id
          )
        ),
        driver:drivers!inner (
          id,
          cpf,
          cnh,
          vehicle_type,
          user:profiles!inner (
            id,
            full_name,
            phone,
            email
          )
        )
      `)
      .eq('freight.company.user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar interesses da empresa:', error);
      return [];
    }

    return data || [];
  };

  // Atualizar resposta da empresa
  const updateCompanyResponse = useMutation({
    mutationFn: async ({ contactId, response }: { contactId: string; response: string }) => {
      const { error } = await supabase
        .from('freight_contacts')
        .update({ company_response: response })
        .eq('id', contactId);

      if (error) {
        throw new Error('Erro ao atualizar resposta');
      }
    },
    onSuccess: () => {
      toast({
        title: "Resposta atualizada!",
        description: "A resposta foi salva com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['company-interests'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar resposta",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  });

  return {
    demonstrateInterest: demonstrateInterest.mutate,
    isLoading: isLoading || demonstrateInterest.isPending,
    checkExistingInterest,
    getFreightInterests,
    getCompanyInterests,
    updateCompanyResponse: updateCompanyResponse.mutate,
    isUpdatingResponse: updateCompanyResponse.isPending
  };
};