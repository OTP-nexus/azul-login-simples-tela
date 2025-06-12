
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit, MapPin, User, Truck, DollarSign, Settings, CheckCircle, Package } from 'lucide-react';

interface StopComplete {
  id: string;
  state: string;
  city: string;
  order: number;
}

interface VehicleTypeComplete {
  id: string;
  type: string;
  category: 'heavy' | 'medium' | 'light';
  selected: boolean;
}

interface BodyTypeComplete {
  id: string;
  type: string;
  category: 'open' | 'closed' | 'special';
  selected: boolean;
}

interface PriceRangeComplete {
  id: string;
  kmStart: number;
  kmEnd: number;
  price: number;
}

interface VehiclePriceTableComplete {
  vehicleType: string;
  ranges: PriceRangeComplete[];
}

interface ValoresDefinidos {
  tipo: 'combinar' | 'definido';
  valor: number | null;
  observacoes: string | null;
}

interface FreightCompleteFormData {
  collaborator_ids: string[];
  origem_cidade: string;
  origem_estado: string;
  paradas: StopComplete[];
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
  valores_definidos: ValoresDefinidos;
}

interface CollaboratorComplete {
  id: string;
  name: string;
  sector: string;
  phone: string;
  email?: string;
}

interface FreightCompleteVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: FreightCompleteFormData;
  collaborators: CollaboratorComplete[];
  onEdit: () => void;
  onConfirm: () => void;
  loading: boolean;
}

const FreightCompleteVerificationDialog: React.FC<FreightCompleteVerificationDialogProps> = ({
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

  // Ordenar paradas por ordem
  const orderedParadas = [...formData.paradas].sort((a, b) => a.order - b.order);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <span>Confirmação do Frete Completo</span>
          </DialogTitle>
          <DialogDescription>
            Revise todos os dados antes de finalizar a solicitação de frete completo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Colaboradores Responsáveis */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Colaboradores Responsáveis</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedCollaborators.map((collaborator) => (
                <Badge key={collaborator.id} variant="secondary" className="text-sm">
                  {collaborator.name} - {collaborator.sector}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Origem e Paradas */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Origem e Paradas</h3>
            </div>
            
            <div className="space-y-4">
              {/* Origem */}
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">O</span>
                  </div>
                  <span className="text-sm font-medium text-green-800">Origem</span>
                </div>
                <p className="text-sm text-gray-700 ml-8">
                  {formData.origem_cidade} - {formData.origem_estado}
                </p>
              </div>

              {/* Paradas */}
              {orderedParadas.map((parada) => (
                <div key={parada.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">{parada.order}</span>
                    </div>
                    <span className="text-sm font-medium text-blue-800">Parada {parada.order}</span>
                  </div>
                  <p className="text-sm text-gray-700 ml-8">
                    {parada.city} - {parada.state}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                <strong>Importante:</strong> Será gerado apenas 1 pedido de frete para todas as paradas.
              </p>
            </div>
          </div>

          <Separator />

          {/* Informações da Carga */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-800">Informações da Carga</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Tipo de Mercadoria</label>
                <p className="text-sm text-gray-800">{formData.tipo_mercadoria}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Valores */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">Valores</h3>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-600">Tipo de Valor:</span>
                  <p className="text-lg font-semibold text-gray-800">
                    {formData.valores_definidos.tipo === 'combinar' ? 'A COMBINAR' : 'VALOR DEFINIDO'}
                  </p>
                </div>
                {formData.valores_definidos.tipo === 'definido' && formData.valores_definidos.valor && (
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-600">Valor Oferecido:</span>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {formData.valores_definidos.valor.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tipos de Veículos */}
          {selectedVehicles.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <h4 className="text-md font-semibold text-gray-700">Tipos de Veículos</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedVehicles.map((vehicle) => (
                    <Badge key={vehicle.id} variant="outline" className="text-sm">
                      {vehicle.type}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Tipos de Carroceria */}
          {selectedBodies.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-gray-700">Tipos de Carroceria</h4>
              <div className="flex flex-wrap gap-2">
                {selectedBodies.map((body) => (
                  <Badge key={body.id} variant="outline" className="text-sm">
                    {body.type}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tabelas de Preço */}
          {formData.vehicle_price_tables.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800">Tabelas de Preço</h3>
                <div className="space-y-4">
                  {formData.vehicle_price_tables.map((table) => (
                    <div key={table.vehicleType} className="border rounded-lg p-3">
                      <h5 className="font-medium text-gray-800 mb-2">{table.vehicleType}</h5>
                      <div className="space-y-2">
                        {table.ranges.map((range) => (
                          <div key={range.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              {range.kmStart} - {range.kmEnd} km
                            </span>
                            <span className="font-medium text-gray-800">
                              R$ {range.price.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Configurações */}
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Configurações</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-medium text-gray-600">Precisa de ajudante:</label>
                <p className="text-gray-800">{formData.precisa_ajudante ? 'Sim' : 'Não'}</p>
              </div>
              <div>
                <label className="font-medium text-gray-600">Precisa de rastreador:</label>
                <p className="text-gray-800">{formData.precisa_rastreador ? 'Sim' : 'Não'}</p>
              </div>
              <div>
                <label className="font-medium text-gray-600">Precisa de seguro:</label>
                <p className="text-gray-800">{formData.precisa_seguro ? 'Sim' : 'Não'}</p>
              </div>
              {formData.horario_carregamento && (
                <div>
                  <label className="font-medium text-gray-600">Horário de carregamento:</label>
                  <p className="text-gray-800">{formData.horario_carregamento}</p>
                </div>
              )}
              {formData.pedagio_pago_por && (
                <div>
                  <label className="font-medium text-gray-600">Pedágio pago por:</label>
                  <p className="text-gray-800">{formData.pedagio_pago_por}</p>
                </div>
              )}
              {formData.pedagio_direcao && (
                <div>
                  <label className="font-medium text-gray-600">Direção do pedágio:</label>
                  <p className="text-gray-800">{formData.pedagio_direcao}</p>
                </div>
              )}
            </div>
          </div>

          {/* Regras de Agendamento */}
          {formData.regras_agendamento.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-gray-700">Regras de Agendamento</h4>
              <div className="flex flex-wrap gap-2">
                {formData.regras_agendamento.map((rule, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {rule}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Benefícios */}
          {formData.beneficios.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-gray-700">Benefícios</h4>
              <div className="flex flex-wrap gap-2">
                {formData.beneficios.map((benefit, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {benefit}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Observações */}
          {formData.observacoes && (
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-gray-700">Observações</h4>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                {formData.observacoes}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onEdit}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Editar</span>
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{loading ? 'Processando...' : 'Confirmar Frete'}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FreightCompleteVerificationDialog;
