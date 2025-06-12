
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, User, Truck, CheckCircle } from 'lucide-react';
import { FreightCompleteFormData } from '@/types/freightComplete';

interface Collaborator {
  id: string;
  name: string;
  sector: string;
  phone: string;
  email?: string;
}

interface FreightVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: FreightCompleteFormData;
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

  const selectedVehicles = formData.tipos_veiculos.filter((v: any) => v.selected);
  const selectedBodies = formData.tipos_carrocerias.filter((b: any) => b.selected);

  // Verificar se é frete completo baseado na presença de paradas
  const isFreteCompleto = formData.paradas && formData.paradas.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <span>Verificação do {isFreteCompleto ? 'Frete Completo' : 'Frete'}</span>
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

          {/* Origem e Paradas */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold">Origem e Paradas</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 rounded-lg border">
                <h4 className="font-medium text-green-800 mb-1">Origem</h4>
                <p className="text-green-700">{formData.origem_cidade}/{formData.origem_estado}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">
                  Paradas Sequenciais ({formData.paradas.length})
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {formData.paradas.map((parada, index) => (
                    <div key={parada.id} className="p-3 bg-green-50 rounded border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-green-600 text-white text-xs">
                            {index + 1}
                          </Badge>
                          <span className="font-medium text-green-700">
                            {parada.city}/{parada.state}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {parada.tipoOperacao}
                        </Badge>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-green-600">
                        {parada.tempoPermanencia && (
                          <div>⏱️ {parada.tempoPermanencia}min</div>
                        )}
                        {parada.pesoEspecifico && (
                          <div>⚖️ {parada.pesoEspecifico}kg</div>
                        )}
                        {parada.tempoEstimado && (
                          <div>🕐 {parada.tempoEstimado}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Resumo do Frete Completo */}
          {isFreteCompleto && formData.paradas.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-green-800">Resumo da Rota</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-green-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">{formData.paradas.length}</div>
                    <div className="text-sm text-green-700">Paradas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">
                      {formData.paradas.reduce((sum, p) => sum + (p.pesoEspecifico || 0), 0).toFixed(1)}kg
                    </div>
                    <div className="text-sm text-green-700">Peso Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">
                      {formData.paradas.reduce((sum, p) => sum + (p.volumeEspecifico || 0), 0).toFixed(1)}m³
                    </div>
                    <div className="text-sm text-green-700">Volume Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">
                      {formData.paradas.reduce((sum, p) => sum + (p.tempoPermanencia || 0), 0)}min
                    </div>
                    <div className="text-sm text-green-700">Tempo Total</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Carga */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Informações da Carga</h3>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p><span className="font-medium">Tipo de Mercadoria:</span> {formData.tipo_mercadoria}</p>
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
                  {selectedVehicles.map((vehicle: any) => (
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
                    {selectedBodies.map((body: any) => (
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

          {/* Configurações */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-purple-600" />
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
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              'Concluir Frete Completo'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FreightVerificationDialog;
