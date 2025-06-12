
import { supabase } from '@/integrations/supabase/client';

export const generateFreightCompleteCode = async (): Promise<string> => {
  try {
    // Buscar o último frete completo criado para gerar um código sequencial
    const { data: lastFreight } = await supabase
      .from('fretes')
      .select('id, created_at')
      .eq('tipo_frete', 'completo')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Gerar código baseado na data e hora atual
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');
    
    // Gerar número sequencial
    const sequence = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    
    const code = `FC-${year}${month}${day}-${hour}${minute}-${sequence}`;
    
    return code;
  } catch (error) {
    console.error('Erro ao gerar código do frete completo:', error);
    // Fallback: gerar código simples
    const timestamp = Date.now().toString().slice(-8);
    return `FC-${timestamp}`;
  }
};

export const formatStopsForDisplay = (paradas: any[]): string => {
  if (!paradas || paradas.length === 0) return 'Nenhuma parada';
  
  return paradas
    .sort((a, b) => a.order - b.order)
    .map((parada, index) => `${index + 1}. ${parada.city}/${parada.state}`)
    .join(' → ');
};
