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

      // Buscar assinaturas reais (usando 'as any' para contornar limitações do schema)
      const { count: activeSubscriptions } = await supabase
        .from('subscriptions' as any)
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: trialSubscriptions } = await supabase
        .from('subscriptions' as any)
        .select('*', { count: 'exact', head: true })
        .eq('status', 'trialing');

      // Buscar documentos pendentes
      const { count: pendingDocuments } = await supabase
        .from('document_verifications')
        .select('*', { count: 'exact', head: true })
        .eq('overall_status', 'pending');

      // Buscar receita real dos pagamentos (usando 'as any' para contornar limitações do schema)
      const { data: revenueData, error: revenueError } = await supabase
        .from('payments' as any)
        .select('amount, created_at')
        .eq('status', 'succeeded');

      let totalRevenue = 0;
      let monthlyRevenue = 0;
      
      if (!revenueError && revenueData) {
        totalRevenue = (revenueData as any[]).reduce((sum: number, payment: any) => sum + payment.amount, 0);
        
        // Calcular receita do mês atual
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        monthlyRevenue = (revenueData as any[])
          .filter((payment: any) => {
            const paymentDate = new Date(payment.created_at);
            return paymentDate.getMonth() === currentMonth && 
                   paymentDate.getFullYear() === currentYear;
          })
          .reduce((sum: number, payment: any) => sum + payment.amount, 0);
      }

      setStats({
        totalUsers: totalUsers || 0,
        totalCompanies: totalCompanies || 0,
        totalDrivers: totalDrivers || 0,
        totalFreights: totalFreights || 0,
        activeFreights: activeFreights || 0,
        totalRevenue,
        monthlyRevenue,
        activeSubscriptions: activeSubscriptions || 0,
        trialSubscriptions: trialSubscriptions || 0,
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