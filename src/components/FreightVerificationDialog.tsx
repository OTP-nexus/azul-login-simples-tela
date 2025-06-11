
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Truck, User, Settings, DollarSign, Clock, Shield } from 'lucide-react';

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
}

interface FreightVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: FreightFormData;
  collaborators: Collaborator[];
  onConfirm: () => void;
  onEdit: () => void;
  loading: boolean;
}

const FreightVerificationDialog: React.FC<FreightVerificationDialogProps> = ({
  open,
  onOpenChange,
  formData,
  collaborators,
  onConfirm,
  onEdit,
  loading
}) => {
  const selectedCollaborators = collaborators.filter(c => 
    formData.collaborator_ids.includes(c.id)
  );

  const selectedVehicles = formData.tipos_veiculos.filter(v => v.selected);
  const selectedBodies = formData.tipos_carrocerias.filter(b => b.selected);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Truck className="w-6 h-6 text-blue-600" />
            <span>Verificação do Pedido de Frete</span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Colaboradores */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Colaboradores Responsáveis</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedCollaborators.map(collaborator => (
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
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Origem e Destinos</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Origem:</span> {formData.origem_cidade}, {formData.origem_estado}
                </div>
                <div>
                  <span className="font-medium">Destinos:</span>
                  <div className="ml-4 space-y-1">
                    {formData.destinos.map(destino => (
                      <div key={destino.id}>• {destino.city}, {destino.state}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Carga e Veículos */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Carga e Veículos</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Tipo de Mercadoria:</span> {formData.tipo_mercadoria}
                </div>
                <div>
                  <span className="font-medium">Tipos de Veículos:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedVehicles.map(vehicle => (
                      <Badge key={vehicle.id} variant="outline">
                        {vehicle.type}
                      </Badge>
                    ))}
                  </div>
                </div>
                {selectedBodies.length > 0 && (
                  <div>
                    <span className="font-medium">Tipos de Carroceria:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedBodies.map(body => (
                        <Badge key={body.id} variant="outline">
                          {body.type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Tabelas de Preço */}
            {formData.vehicle_price_tables.length > 0 && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Tabelas de Preço</h3>
                  </div>
                  <div className="space-y-4">
                    {formData.vehicle_price_tables.map(table => (
                      <div key={table.vehicleType} className="border rounded-lg p-3 bg-gray-50">
                        <h4 className="font-medium mb-2">{table.vehicleType}</h4>
                        <div className="space-y-1">
                          {table.ranges.map(range => (
                            <div key={range.id} className="text-sm">
                              {range.kmStart}km - {range.kmEnd}km: R$ {range.price.toFixed(2)}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Configurações */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Configurações</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {formData.horario_carregamento && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Horário: {formData.horario_carregamento}</span>
                  </div>
                )}
                {formData.precisa_ajudante && (
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Precisa de ajudante</span>
                  </div>
                )}
                {formData.precisa_rastreador && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>Precisa de rastreador</span>
                  </div>
                )}
                {formData.precisa_seguro && (
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Precisa de seguro</span>
                  </div>
                )}
                {formData.pedagio_pago_por && (
                  <div>
                    <span className="font-medium">Pedágio:</span> {formData.pedagio_pago_por} ({formData.pedagio_direcao})
                  </div>
                )}
              </div>
            </div>

            {/* Regras de Agendamento */}
            {formData.regras_agendamento.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Regras de Agendamento</h3>
                  <div className="space-y-1">
                    {formData.regras_agendamento.map((regra, index) => (
                      <div key={index} className="text-sm">• {regra}</div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Benefícios */}
            {formData.beneficios.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Benefícios</h3>
                  <div className="space-y-1">
                    {formData.beneficios.map((beneficio, index) => (
                      <div key={index} className="text-sm">• {beneficio}</div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Observações */}
            {formData.observacoes && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Observações</h3>
                  <p className="text-sm text-gray-700">{formData.observacoes}</p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="space-x-2">
          <Button variant="outline" onClick={onEdit} disabled={loading}>
            Editar
          </Button>
          <Button onClick={onConfirm} disabled={loading} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processando...
              </>
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
