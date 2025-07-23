import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DriverStats {
  totalFreights: number;
  activeFreights: number;
  acceptedFreights: number;
  completedFreights: number;
  totalFavorites: number;
}

export const useDriverStats = () => {
  const [stats, setStats] = useState<DriverStats>({
    totalFreights: 0,
    activeFreights: 0,
    acceptedFreights: 0,
    completedFreights: 0,
    totalFavorites: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Buscar ID do motorista
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (driverError) {
        throw new Error('Erro ao buscar dados do motorista');
      }

      // Buscar todos os fretes ativos (disponíveis para o motorista)
      const { data: allFreightsData, error: allFreightsError } = await supabase
        .from('fretes')
        .select('id, status')
        .eq('status', 'ativo');

      if (allFreightsError) {
        throw new Error('Erro ao buscar fretes');
      }

      // Buscar fretes que o motorista tem interesse (através de contatos)
      const { data: contactsData, error: contactsError } = await supabase
        .from('freight_contacts')
        .select('freight_id, company_response')
        .eq('driver_id', driverData.id);

      if (contactsError) {
        throw new Error('Erro ao buscar contatos');
      }

      // Contar fretes aceitos e concluídos baseado nos contatos
      const acceptedFreights = contactsData?.filter(c => c.company_response === 'accepted').length || 0;
      const completedFreights = contactsData?.filter(c => c.company_response === 'completed').length || 0;

      // Buscar favoritos
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('driver_favorites')
        .select('id')
        .eq('driver_id', driverData.id);

      if (favoritesError) {
        throw new Error('Erro ao buscar favoritos');
      }

      const totalFavorites = favoritesData?.length || 0;

      setStats({
        totalFreights: allFreightsData?.length || 0,
        activeFreights: allFreightsData?.length || 0,
        acceptedFreights,
        completedFreights,
        totalFavorites
      });
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
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