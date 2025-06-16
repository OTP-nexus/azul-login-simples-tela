
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useFreightByCode = (freightCode: string | undefined) => {
  return useQuery({
    queryKey: ['freight', freightCode],
    queryFn: async () => {
      if (!freightCode) {
        throw new Error('Freight code is required');
      }

      const { data, error } = await supabase
        .from('fretes')
        .select('*')
        .eq('codigo_agregamento', freightCode)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: !!freightCode,
  });
};
