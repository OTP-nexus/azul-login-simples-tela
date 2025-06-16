
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Freight {
  id: string;
  codigo_agregamento: string;
  tipo_frete: string;
  status: string;
  origem_cidade: string;
  origem_estado: string;
  origem_tipo_endereco: string | null;
  origem_possui_carga_descarga: boolean;
  origem_possui_escada: boolean;
  origem_possui_elevador: boolean;
  origem_possui_doca: boolean;
  destinos: any[];
  destino_cidade: string | null;
  destino_estado: string | null;
  destino_tipo_endereco: string | null;
  destino_possui_carga_descarga: boolean;
  destino_possui_escada: boolean;
  destino_possui_elevador: boolean;
  destino_possui_doca: boolean;
  paradas: any[];
  data_coleta: string | null;
  data_entrega: string | null;
  horario_carregamento: string | null;
  tipo_mercadoria: string;
  peso_carga: number | null;
  valor_carga: number | null;
  valores_definidos: any;
  tipos_veiculos: any[];
  tipos_carrocerias: any[];
  itens_detalhados: any[];
  tipo_listagem_itens: string | null;
  descricao_livre_itens: string | null;
  precisa_montar_desmontar: boolean;
  precisa_embalagem: boolean;
  precisa_seguro: boolean;
  precisa_rastreador: boolean;
  precisa_ajudante: boolean;
  pedagio_pago_por: string | null;
  pedagio_direcao: string | null;
  local_possui_restricao: boolean;
  descricao_restricao: string | null;
  observacoes: string | null;
  beneficios: any[];
  regras_agendamento: any[];
  tabelas_preco: any[];
  tipo_solicitacao: string | null;
  solicitante_nome: string | null;
  solicitante_telefone: string | null;
  solicitante_confirmar_telefone: string | null;
  collaborator_ids: string[] | null;
  company_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicFreightFilters {
  origem_estado?: string;
  origem_cidade?: string;
  destino_estado?: string;
  destino_cidade?: string;
  tipo_frete?: string;
  tipos_veiculos?: string[];
  tipos_carrocerias?: string[];
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const safeJsonToArray = (value: any): any[] => {
  if (Array.isArray(value)) {
    return value;
  }
  if (value === null || value === undefined) {
    return [];
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

export const usePublicFreights = (filters: PublicFreightFilters = {}, page = 1, itemsPerPage = 20) => {
  const [freights, setFreights] = useState<Freight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 20
  });

  useEffect(() => {
    const fetchFreights = async () => {
      setLoading(true);
      setError(null);

      try {
        // First, get the total count
        let countQuery = supabase
          .from('fretes')
          .select('*', { count: 'exact', head: true })
          .in('status', ['ativo', 'pendente']);

        // Apply filters to count query
        Object.entries(filters).forEach(([key, value]) => {
          if (value && Array.isArray(value) && value.length > 0) {
            countQuery = countQuery.overlaps(key, value);
          } else if (value && typeof value === 'string') {
            countQuery = countQuery.eq(key, value);
          }
        });

        const { count, error: countError } = await countQuery;

        if (countError) {
          console.error('Erro ao contar fretes:', countError);
          setError('Erro ao carregar fretes.');
          return;
        }

        const totalItems = count || 0;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        // Now get the actual data with pagination
        let dataQuery = supabase
          .from('fretes')
          .select('*')
          .in('status', ['ativo', 'pendente'])
          .range((page - 1) * itemsPerPage, page * itemsPerPage - 1)
          .order('created_at', { ascending: false });

        // Apply filters to data query
        Object.entries(filters).forEach(([key, value]) => {
          if (value && Array.isArray(value) && value.length > 0) {
            dataQuery = dataQuery.overlaps(key, value);
          } else if (value && typeof value === 'string') {
            dataQuery = dataQuery.eq(key, value);
          }
        });

        const { data, error: dataError } = await dataQuery;

        if (dataError) {
          console.error('Erro ao buscar fretes:', dataError);
          setError('Erro ao buscar fretes.');
          return;
        }

        // Transform data to match the Freight interface
        const formattedFreights: Freight[] = (data || []).map((freight: any) => ({
          id: freight.id,
          codigo_agregamento: freight.codigo_agregamento || '',
          tipo_frete: freight.tipo_frete,
          status: freight.status || 'ativo',
          origem_cidade: freight.origem_cidade,
          origem_estado: freight.origem_estado,
          origem_tipo_endereco: freight.origem_tipo_endereco,
          origem_possui_carga_descarga: freight.origem_possui_carga_descarga || false,
          origem_possui_escada: freight.origem_possui_escada || false,
          origem_possui_elevador: freight.origem_possui_elevador || false,
          origem_possui_doca: freight.origem_possui_doca || false,
          destinos: safeJsonToArray(freight.destinos),
          destino_cidade: freight.destino_cidade,
          destino_estado: freight.destino_estado,
          destino_tipo_endereco: freight.destino_tipo_endereco,
          destino_possui_carga_descarga: freight.destino_possui_carga_descarga || false,
          destino_possui_escada: freight.destino_possui_escada || false,
          destino_possui_elevador: freight.destino_possui_elevador || false,
          destino_possui_doca: freight.destino_possui_doca || false,
          paradas: safeJsonToArray(freight.paradas),
          data_coleta: freight.data_coleta,
          data_entrega: freight.data_entrega,
          horario_carregamento: freight.horario_carregamento,
          tipo_mercadoria: freight.tipo_mercadoria,
          peso_carga: freight.peso_carga,
          valor_carga: freight.valor_carga,
          valores_definidos: freight.valores_definidos,
          tipos_veiculos: safeJsonToArray(freight.tipos_veiculos),
          tipos_carrocerias: safeJsonToArray(freight.tipos_carrocerias),
          itens_detalhados: safeJsonToArray(freight.itens_detalhados),
          tipo_listagem_itens: freight.tipo_listagem_itens,
          descricao_livre_itens: freight.descricao_livre_itens,
          precisa_montar_desmontar: freight.precisa_montar_desmontar || false,
          precisa_embalagem: freight.precisa_embalagem || false,
          precisa_seguro: freight.precisa_seguro || false,
          precisa_rastreador: freight.precisa_rastreador || false,
          precisa_ajudante: freight.precisa_ajudante || false,
          pedagio_pago_por: freight.pedagio_pago_por,
          pedagio_direcao: freight.pedagio_direcao,
          local_possui_restricao: freight.local_possui_restricao || false,
          descricao_restricao: freight.descricao_restricao,
          observacoes: freight.observacoes,
          beneficios: safeJsonToArray(freight.beneficios),
          regras_agendamento: safeJsonToArray(freight.regras_agendamento),
          tabelas_preco: safeJsonToArray(freight.tabelas_preco),
          tipo_solicitacao: freight.tipo_solicitacao,
          solicitante_nome: freight.solicitante_nome,
          solicitante_telefone: freight.solicitante_telefone,
          solicitante_confirmar_telefone: freight.solicitante_confirmar_telefone,
          collaborator_ids: freight.collaborator_ids,
          company_id: freight.company_id,
          created_at: freight.created_at,
          updated_at: freight.updated_at,
        }));

        setFreights(formattedFreights);
        setPagination({
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage
        });
      } catch (err) {
        console.error('Erro ao buscar fretes:', err);
        setError('Erro ao buscar fretes.');
      } finally {
        setLoading(false);
      }
    };

    fetchFreights();
  }, [filters, page, itemsPerPage]);

  return {
    freights,
    loading,
    error,
    pagination
  };
};
