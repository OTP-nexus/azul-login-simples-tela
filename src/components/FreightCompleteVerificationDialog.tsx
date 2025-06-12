
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, User, Truck, Package, Settings, CheckCircle, Edit } from 'lucide-react';

interface CollaboratorComplete {
  id: string;
  name: string;
  sector: string;
  phone: string;
  email?: string;
}

interface DestinationComplete {
  id: string;
  state: string;
  city: string;
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

interface FreightCompleteFormData {
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

  const getCategoryLabel = (category: string) => {
    switch(category) {
      case 'heavy': return 'Pesados';
      case 'medium': return 'Médios';
      case 'light': return 'Leves';
      case 'open': return 'Abertas';
      case 'closed': return 'Fechadas';
      case 'special': return 'Especiais';
      default: return category;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <span>Confirmar Solicitação de Frete Completo</span>
          </DialogTitle>
          <DialogDescription>
            Revise todos os dados antes de confirmar. Será criado um frete para cada destino.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Colaboradores */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Colaboradores Responsáveis ({selectedCollaborators.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedCollaborators.map((collaborator) => (
                    <Badge key={collaborator.id} variant="secondary" className="px-3 py-1">
                      {collaborator.name} - {collaborator.sector}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Origem e Destinos */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span>Origem e Destinos</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Origem:</h4>
                  <Badge variant="outline" className="px-3 py-1">
                    {formData.origem_cidade} - {formData.origem_estado}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">
                    Destinos ({formData.destinos.length}):
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.destinos.map((destino) => (
                      <Badge key={destino.id} variant="outline" className="px-3 py-1">
                        {destino.city} - {destino.state}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Carga e Veículos */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Package className="w-5 h-5 text-orange-600" />
                  <span>Carga e Veículos</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Tipo de Mercadoria:</h4>
                  <Badge variant="outline" className="px-3 py-1">
                    {formData.tipo_mercadoria}
                  </Badge>
                </div>
                
                {selectedVehicles.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">
                      Tipos de Veículos ({selectedVehicles.length}):
                    </h4>
                    <div className="space-y-2">
                      {['heavy', 'medium', 'light'].map(category => {
                        const vehicles = selectedVehicles.filter(v => v.category === category);
                        if (vehicles.length === 0) return null;
                        
                        return (
                          <div key={category}>
                            <span className="text-xs font-medium text-gray-600 mb-1 block">
                              {getCategoryLabel(category)}:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {vehicles.map(vehicle => (
                                <Badge key={vehicle.id} variant="secondary" className="text-xs px-2 py-0.5">
                                  {vehicle.type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedBodies.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">
                      Tipos de Carroceria ({selectedBodies.length}):
                    </h4>
                    <div className="space-y-2">
                      {['open', 'closed', 'special'].map(category => {
                        const bodies = selectedBodies.filter(b => b.category === category);
                        if (bodies.length === 0) return null;
                        
                        return (
                          <div key={category}>
                            <span className="text-xs font-medium text-gray-600 mb-1 block">
                              {getCategoryLabel(category)}:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {bodies.map(body => (
                                <Badge key={body.id} variant="secondary" className="text-xs px-2 py-0.5">
                                  {body.type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tabelas de Preço */}
            {formData.vehicle_price_tables.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <Truck className="w-5 h-5 text-purple-600" />
                    <span>Tabelas de Preço por Veículo</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {formData.vehicle_price_tables.map((table) => (
                      <div key={table.vehicleType} className="bg-gray-50 rounded-lg p-3">
                        <h5 className="font-semibold text-sm text-gray-800 mb-2">{table.vehicleType}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          {table.ranges.map((range) => (
                            <div key={range.id} className="bg-white rounded p-2 border">
                              {range.kmStart} - {range.kmEnd} km: R$ {range.price.toFixed(2)}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Configurações */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <span>Configurações</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Requisitos:</h4>
                    <ul className="text-gray-600 space-y-1">
                      <li>• Ajudante: {formData.precisa_ajudante ? 'Sim' : 'Não'}</li>
                      <li>• Rastreador: {formData.precisa_rastreador ? 'Sim' : 'Não'}</li>
                      <li>• Seguro: {formData.precisa_seguro ? 'Sim' : 'Não'}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Pedágio:</h4>
                    <ul className="text-gray-600 space-y-1">
                      <li>• Pago por: {formData.pedagio_pago_por || 'Não informado'}</li>
                      <li>• Direção: {formData.pedagio_direcao || 'Não informado'}</li>
                    </ul>
                  </div>
                </div>

                {formData.horario_carregamento && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-1">Horário de Carregamento:</h4>
                    <Badge variant="outline" className="px-3 py-1">
                      {formData.horario_carregamento}
                    </Badge>
                  </div>
                )}

                {formData.regras_agendamento.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">
                      Regras de Agendamento ({formData.regras_agendamento.length}):
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {formData.regras_agendamento.map((regra, index) => (
                        <Badge key={index} variant="outline" className="text-xs px-2 py-0.5">
                          {regra}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {formData.beneficios.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">
                      Benefícios ({formData.beneficios.length}):
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {formData.beneficios.map((beneficio, index) => (
                        <Badge key={index} variant="outline" className="text-xs px-2 py-0.5">
                          {beneficio}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {formData.observacoes && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-1">Observações:</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                      {formData.observacoes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={onEdit}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Editar</span>
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{loading ? 'Confirmando...' : 'Confirmar Solicitação'}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FreightCompleteVerificationDialog;
