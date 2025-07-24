import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalUsers: number;
  totalCompanies: number;
  totalDrivers: number;
  totalFreights: number;
  activeFreights: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  pendingDocuments: number;
  loading: boolean;
  error: string | null;
}

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCompanies: 0,
    totalDrivers: 0,
    totalFreights: 0,
    activeFreights: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeSubscriptions: 0,
    trialSubscriptions: 0,
    pendingDocuments: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));

      // Buscar total de usuários
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Buscar total de empresas
      const { count: totalCompanies } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });

      // Buscar total de motoristas
      const { count: totalDrivers } = await supabase
        .from('drivers')
        .select('*', { count: 'exact', head: true });

      // Buscar total de fretes
      const { count: totalFreights } = await supabase
        .from('fretes')
        .select('*', { count: 'exact', head: true });

      // Buscar fretes ativos
      const { count: activeFreights } = await supabase
        .from('fretes')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ativo');

      // Buscar assinaturas (temporariamente usando mock data)
      const activeSubscriptions = 5; // Mock data até implementar tabela subscriptions
      const trialSubscriptions = 3; // Mock data até implementar tabela subscriptions

      // Buscar documentos pendentes
      const { count: pendingDocuments } = await supabase
        .from('document_verifications')
        .select('*', { count: 'exact', head: true })
        .eq('overall_status', 'pending');

      // Buscar receita (temporariamente usando mock data)
      const totalRevenue = 250000; // Mock data - R$ 2.500,00 em centavos
      const monthlyRevenue = 45000; // Mock data - R$ 450,00 em centavos

      setStats({
        totalUsers: totalUsers || 0,
        totalCompanies: totalCompanies || 0,
        totalDrivers: totalDrivers || 0,
        totalFreights: totalFreights || 0,
        activeFreights: activeFreights || 0,
        totalRevenue,
        monthlyRevenue,
        activeSubscriptions,
        trialSubscriptions,
        pendingDocuments: pendingDocuments || 0,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }));
    }
  };

  return { ...stats, refetch: fetchStats };
};