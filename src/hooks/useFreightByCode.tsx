
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FreightDetails {
  id: string;
  codigo_agregamento: string | null;
  tipo_frete: string;
  status: string | null;
  origem_cidade: string;
  origem_estado: string;
  destinos: any[];
  destino_cidade: string | null;
  destino_estado: string | null;
  data_coleta: string | null;
  data_entrega: string | null;
  tipo_mercadoria: string;
  peso_carga: number | null;
  valor_carga: number | null;
  valores_definidos: any;
  tipos_veiculos: any[];
  tipos_carrocerias: any[];
  created_at: string;
  updated_at: string;
  pedagio_pago_por: string | null;
  pedagio_direcao: string | null;
  precisa_seguro: boolean | null;
  precisa_rastreador: boolean | null;
  precisa_ajudante: boolean | null;
  horario_carregamento: string | null;
  observacoes: string | null;
  paradas: any[];
  beneficios: any[];
  regras_agendamento: any[];
  tabelas_preco: any[];
  solicitante_nome: string | null;
  solicitante_telefone: string | null;
  origem_possui_carga_descarga: boolean | null;
  origem_possui_doca: boolean | null;
  origem_possui_elevador: boolean | null;
  origem_possui_escada: boolean | null;
  destino_possui_carga_descarga: boolean | null;
  destino_possui_doca: boolean | null;
  destino_possui_elevador: boolean | null;
  destino_possui_escada: boolean | null;
}

export const useFreightByCode = (freightCode: string) => {
  const [freight, setFreight] = useState<FreightDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFreight = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: freightError } = await supabase
          .from('fretes')
          .select('*')
          .eq('codigo_agregamento', freightCode)
          .single();

        if (freightError) {
          console.error('Erro ao buscar frete:', freightError);
          setError('Frete não encontrado');
          return;
        }

        setFreight(data);
      } catch (err) {
        console.error('Erro ao carregar frete:', err);
        setError('Erro ao carregar frete');
      } finally {
        setLoading(false);
      }
    };

    if (freightCode) {
      fetchFreight();
    }
  }, [freightCode]);

  return { freight, loading, error };
};
