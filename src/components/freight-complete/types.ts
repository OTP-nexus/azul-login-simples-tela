
export interface CollaboratorComplete {
  id: string;
  name: string;
  sector: string;
  phone: string;
  email?: string;
}

export interface DestinationComplete {
  id: string;
  state: string;
  city: string;
}

export interface VehicleTypeComplete {
  id: string;
  type: string;
  category: 'heavy' | 'medium' | 'light';
  selected: boolean;
}

export interface BodyTypeComplete {
  id: string;
  type: string;
  category: 'open' | 'closed' | 'special';
  selected: boolean;
}

export interface PriceRangeComplete {
  id: string;
  kmStart: number;
  kmEnd: number;
  price: number;
}

export interface VehiclePriceTableComplete {
  vehicleType: string;
  ranges: PriceRangeComplete[];
}

export interface GeneratedFreightComplete {
  id: string;
  codigo_agregamento: string;
  destino_cidade: string;
  destino_estado: string;
}

export interface FreightFormDataComplete {
  collaborator_ids: string[];
  origem_cidade: string;
  origem_estado: string;
  destinos: DestinationComplete[];
  tipo_mercadoria: string;
  tipos_veiculos: VehicleTypeComplete[];
  tipos_carrocerias: BodyTypeComplete[];
  vehicle_price_tables: VehiclePriceTableComplete[];
  regras_agendamento: string[];
  beneficios: string[];
  horario_carregamento: string;
  precisa_ajudante: boolean;
  precisa_rastreador: boolean;
  precisa_seguro: boolean;
  pedagio_pago_por: string;
  pedagio_direcao: string;
  observacoes: string;
}
