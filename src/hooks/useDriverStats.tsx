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

      // Buscar estatísticas de fretes
      const { data: freightsData, error: freightsError } = await supabase
        .from('fretes')
        .select('status')
        .eq('status', 'ativo');

      if (freightsError) {
        throw new Error('Erro ao buscar fretes');
      }

      // Contar fretes por status
      const activeFreights = freightsData?.filter(f => f.status === 'ativo').length || 0;
      const acceptedFreights = freightsData?.filter(f => f.status === 'aceito').length || 0;
      const completedFreights = freightsData?.filter(f => f.status === 'concluido').length || 0;

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
        totalFreights: freightsData?.length || 0,
        activeFreights,
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