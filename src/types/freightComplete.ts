
export interface Parada {
  id: string;
  state: string;
  city: string;
  order: number;
  tempoEstimado?: string;
  tempoPermanencia?: number; // em minutos
  tipoOperacao: 'carga' | 'descarga' | 'ambos';
  pesoEspecifico?: number;
  volumeEspecifico?: number;
  observacoes?: string;
}

export interface FreightCompleteFormData {
  collaborator_ids: string[];
  origem_cidade: string;
  origem_estado: string;
  paradas: Parada[];
  tipo_mercadoria: string;
  tipos_veiculos: any[];
  tipos_carrocerias: any[];
  vehicle_price_tables: any[];
  regras_agendamento: string[];
  beneficios: string[];
  horario_carregamento: string;
  precisa_ajudante: boolean;
  precisa_rastreador: boolean;
  precisa_seguro: boolean;
  pedagio_pago_por: string;
  pedagio_direcao: string;
  observacoes: string;
  peso_total?: number;
  volume_total?: number;
  valor_total?: number;
}
