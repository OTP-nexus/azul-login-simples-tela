
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, User, Truck, DollarSign, Settings, CheckCircle, Package } from 'lucide-react';

interface Collaborator {
  id: string;
  name: string;
  sector: string;
  phone: string;
  email?: string;
}

interface Destination {
  id: string;
  state: string;
  city: string;
}

interface VehicleType {
  id: string;
  type: string;
  category: 'heavy' | 'medium' | 'light';
  selected: boolean;
}

interface BodyType {
  id: string;
  type: string;
  category: 'open' | 'closed' | 'special';
  selected: boolean;
}

interface PriceRange {
  id: string;
  kmStart: number;
  kmEnd: number;
  price: number;
}

interface VehiclePriceTable {
  vehicleType: string;
  ranges: PriceRange[];
}

interface FreightFormData {
  collaborator_ids: string[];
  origem_cidade: string;
  origem_estado: string;
  destinos: Destination[];
  tipo_mercadoria: string;
  tipos_veiculos: VehicleType[];
  tipos_carrocerias: BodyType[];
  vehicle_price_tables: VehiclePriceTable[];
  regras_agendamento: string[];
  beneficios: string[];
  horario_carregamento: string;
  precisa_ajudante: boolean;
  precisa_rastreador: boolean;
  precisa_seguro: boolean;
  pedagio_pago_por: string;
  pedagio_direcao: string;
  observacoes: string;
  valor_definido?: number;
  tipo_valor?: string;
  dimensoes?: {
    altura: string;
    largura: string;
    comprimento: string;
  };
  altura?: string;
  largura?: string;
  comprimento?: string;
}

interface FreightVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: FreightFormData;
  collaborators: Collaborator[];
  onEdit: () => void;
  onConfirm: () => void;
  loading: boolean;
}

const FreightVerificationDialog: React.FC<FreightVerificationDialogProps> = ({
  open,
  onOpenChange,
  formData,
  collaborators,
  onEdit,
  onConfirm,
  loading
}) => {
  const selectedCollaborators = collaborators.filter(collaborator => 
    formData.collaborator_ids.includes(collaborator.id)
  );

  const selectedVehicles = formData.tipos_veiculos.filter(v => v.selected);
  const selectedBodies = formData.tipos_carrocerias.filter(b => b.selected);

  // Função corrigida para extrair valores de dimensões
  const getDimensionValue = (value: any): string => {
    console.log('Checking dimension value:', value);
    
    // Se não existe ou é undefined/null
    if (!value || value === 'undefined' || value === null) return '';
    
    // Se é uma string válida
    if (typeof value === 'string' && value.trim() !== '' && value !== 'undefined') {
      return value.trim();
    }
    
    // Se é um número
    if (typeof value === 'number' && !isNaN(value)) {
      return String(value);
    }
    
    // Se é um objeto com propriedade value
    if (typeof value === 'object' && value.value !== undefined && value.value !== 'undefined' && value.value !== null) {
      if (typeof value.value === 'string' && value.value.trim() !== '') {
        return value.value.trim();
      }
      if (typeof value.value === 'number' && !isNaN(value.value)) {
        return String(value.value);
      }
    }
    
    return '';
  };

  // Extrair dimensões de todas as possíveis fontes
  const altura = getDimensionValue(formData.dimensoes?.altura) || 
                 getDimensionValue(formData.altura) || 
                 getDimensionValue((formData as any).altura_carga);
                 
  const largura = getDimensionValue(formData.dimensoes?.largura) || 
                  getDimensionValue(formData.largura) || 
                  getDimensionValue((formData as any).largura_carga);
                  
  const comprimento = getDimensionValue(formData.dimensoes?.comprimento) || 
                      getDimensionValue(formData.comprimento) || 
                      getDimensionValue((formData as any).comprimento_carga);

  const hasDimensions = altura || largura || comprimento;

  console.log('Final dimensions:', { altura, largura, comprimento, hasDimensions });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CheckCircle className="w-6 h-6 text-blue-600" />
            <span>Verificação dos Dados do Frete</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Colaboradores */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Colaboradores Responsáveis</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedCollaborators.map((collaborator) => (
                <Badge key={collaborator.id} variant="secondary" className="px-3 py-1">
                  {collaborator.name} - {collaborator.sector}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Origem e Destinos */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold">Origem e Destinos</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 rounded-lg border">
                <h4 className="font-medium text-green-800 mb-1">Origem</h4>
                <p className="text-green-700">{formData.origem_cidade}/{formData.origem_estado}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">Destinos ({formData.destinos.length})</h4>
                {formData.destinos.map((destino, index) => (
                  <div key={destino.id} className="p-2 bg-blue-50 rounded border text-blue-700">
                    {index + 1}. {destino.city}/{destino.state}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Carga */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold">Informações da Carga</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p><span className="font-medium">Tipo de Mercadoria:</span> {formData.tipo_mercadoria}</p>
              </div>
              
              {/* Dimensões da Carga */}
              {hasDimensions && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-800 mb-2">Dimensões da Carga</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    {altura && (
                      <div>
                        <span className="text-purple-600 font-medium">Altura:</span>
                        <span className="text-purple-700 ml-1">{altura} m</span>
                      </div>
                    )}
                    {largura && (
                      <div>
                        <span className="text-purple-600 font-medium">Largura:</span>
                        <span className="text-purple-700 ml-1">{largura} m</span>
                      </div>
                    )}
                    {comprimento && (
                      <div>
                        <span className="text-purple-600 font-medium">Comprimento:</span>
                        <span className="text-purple-700 ml-1">{comprimento} m</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Veículos e Carrocerias */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Truck className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold">Veículos e Carrocerias</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Tipos de Veículos ({selectedVehicles.length})</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedVehicles.map((vehicle) => (
                    <Badge key={vehicle.id} variant="outline" className="text-xs">
                      {vehicle.type}
                    </Badge>
                  ))}
                </div>
              </div>
              {selectedBodies.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Tipos de Carroceria ({selectedBodies.length})</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedBodies.map((body) => (
                      <Badge key={body.id} variant="outline" className="text-xs">
                        {body.type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Valor do Frete */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold">Valor do Frete</h3>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border">
              <div className="text-green-700">
                {formData.tipo_valor === 'valor' && formData.valor_definido ? (
                  <span className="font-medium text-lg">
                    R$ {formData.valor_definido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                ) : (
                  <span className="font-medium text-lg text-purple-700">A Combinar</span>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Configurações */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold">Configurações</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">Requisitos</h4>
                <div className="space-y-1 text-sm">
                  {formData.precisa_ajudante && <p className="text-blue-600">✓ Precisa de ajudante</p>}
                  {formData.precisa_rastreador && <p className="text-blue-600">✓ Precisa de rastreador</p>}
                  {formData.precisa_seguro && <p className="text-blue-600">✓ Precisa de seguro</p>}
                  {formData.horario_carregamento && (
                    <p className="text-gray-600">Horário: {formData.horario_carregamento}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">Pedágio</h4>
                <div className="space-y-1 text-sm">
                  {formData.pedagio_pago_por && (
                    <p className="text-gray-600">Pago por: {formData.pedagio_pago_por}</p>
                  )}
                  {formData.pedagio_direcao && (
                    <p className="text-gray-600">Direção: {formData.pedagio_direcao}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Regras e Benefícios */}
          {(formData.regras_agendamento.length > 0 || formData.beneficios.length > 0) && (
            <>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.regras_agendamento.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Regras de Agendamento</h4>
                    <div className="space-y-1">
                      {formData.regras_agendamento.map((regra, index) => (
                        <p key={index} className="text-sm text-gray-600">• {regra}</p>
                      ))}
                    </div>
                  </div>
                )}
                {formData.beneficios.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Benefícios</h4>
                    <div className="space-y-1">
                      {formData.beneficios.map((beneficio, index) => (
                        <p key={index} className="text-sm text-blue-600">• {beneficio}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Observações */}
          {formData.observacoes && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Observações</h4>
                <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{formData.observacoes}</p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onEdit}
            disabled={loading}
          >
            Editar Dados
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              'Concluir Pedido'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FreightVerificationDialog;
