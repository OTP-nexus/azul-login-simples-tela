import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Favorite {
  id: string;
  freight_id: string;
  created_at: string;
  freight: {
    id: string;
    codigo_agregamento: string;
    origem_cidade: string;
    origem_estado: string;
    destinos: any;
    tipo_mercadoria: string;
    valor_carga: number;
    peso_carga: number;
    data_coleta: string;
    data_entrega: string;
    status: string;
  };
}

export const useDriverFavorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Primeiro, buscar o driver_id baseado no user_id
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (driverError) {
        throw new Error('Erro ao buscar dados do motorista');
      }

      // Buscar favoritos do motorista com dados do frete
      const { data, error } = await supabase
        .from('driver_favorites')
        .select(`
          id,
          freight_id,
          created_at,
          freight:fretes (
            id,
            codigo_agregamento,
            origem_cidade,
            origem_estado,
            destinos,
            tipo_mercadoria,
            valor_carga,
            peso_carga,
            data_coleta,
            data_entrega,
            status
          )
        `)
        .eq('driver_id', driverData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFavorites(data || []);
    } catch (err) {
      console.error('Erro ao buscar favoritos:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (freightId: string) => {
    if (!user) return false;

    try {
      // Primeiro, buscar o driver_id baseado no user_id
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (driverError) {
        throw new Error('Erro ao buscar dados do motorista');
      }

      const { error } = await supabase
        .from('driver_favorites')
        .insert({
          driver_id: driverData.id,
          freight_id: freightId
        });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Frete adicionado aos favoritos',
      });

      fetchFavorites(); // Recarregar lista
      return true;
    } catch (err) {
      console.error('Erro ao adicionar favorito:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar aos favoritos',
        variant: 'destructive',
      });
      return false;
    }
  };

  const removeFavorite = async (freightId: string) => {
    if (!user) return false;

    try {
      // Primeiro, buscar o driver_id baseado no user_id
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (driverError) {
        throw new Error('Erro ao buscar dados do motorista');
      }

      const { error } = await supabase
        .from('driver_favorites')
        .delete()
        .eq('driver_id', driverData.id)
        .eq('freight_id', freightId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Frete removido dos favoritos',
      });

      fetchFavorites(); // Recarregar lista
      return true;
    } catch (err) {
      console.error('Erro ao remover favorito:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover dos favoritos',
        variant: 'destructive',
      });
      return false;
    }
  };

  const isFavorite = (freightId: string) => {
    return favorites.some(fav => fav.freight_id === freightId);
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    isFavorite,
    refetch: fetchFavorites
  };
};