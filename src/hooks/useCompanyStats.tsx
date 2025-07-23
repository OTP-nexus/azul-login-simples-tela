import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CompanyStats {
  totalFreights: number;
  activeFreights: number;
  pendingFreights: number;
  completedFreights: number;
  totalContacts: number;
  contactsThisMonth: number;
  estimatedRevenue: number;
}

export const useCompanyStats = () => {
  const [stats, setStats] = useState<CompanyStats>({
    totalFreights: 0,
    activeFreights: 0,
    pendingFreights: 0,
    completedFreights: 0,
    totalContacts: 0,
    contactsThisMonth: 0,
    estimatedRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Buscar ID da empresa
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (companyError) {
        throw new Error('Erro ao buscar dados da empresa');
      }

      // Buscar estatísticas de fretes da empresa
      const { data: freightsData, error: freightsError } = await supabase
        .from('fretes')
        .select('id, status, valor_carga, created_at')
        .eq('company_id', companyData.id);

      if (freightsError) {
        throw new Error('Erro ao buscar fretes');
      }

      // Contar fretes por status
      const activeFreights = freightsData?.filter(f => f.status === 'ativo').length || 0;
      const pendingFreights = freightsData?.filter(f => f.status === 'pendente').length || 0;
      const completedFreights = freightsData?.filter(f => f.status === 'concluido').length || 0;

      // Calcular receita estimada (soma dos valores dos fretes concluídos)
      const estimatedRevenue = freightsData
        ?.filter(f => f.status === 'concluido' && f.valor_carga)
        .reduce((sum, f) => sum + Number(f.valor_carga), 0) || 0;

      // Buscar contatos recebidos
      const { data: contactsData, error: contactsError } = await supabase
        .from('freight_contacts')
        .select('id, created_at, freight_id')
        .in('freight_id', freightsData?.map(f => f.id) || []);

      if (contactsError) {
        throw new Error('Erro ao buscar contatos');
      }

      // Contar contatos do mês atual
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const contactsThisMonth = contactsData?.filter(c => {
        const contactDate = new Date(c.created_at);
        return contactDate.getMonth() === currentMonth && contactDate.getFullYear() === currentYear;
      }).length || 0;

      setStats({
        totalFreights: freightsData?.length || 0,
        activeFreights,
        pendingFreights,
        completedFreights,
        totalContacts: contactsData?.length || 0,
        contactsThisMonth,
        estimatedRevenue
      });
    } catch (err) {
      console.error('Erro ao buscar estatísticas da empresa:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};