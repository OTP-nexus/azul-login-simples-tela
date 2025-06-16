
// Simplified freight types to avoid TypeScript recursion issues
export interface FreightData {
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

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}
