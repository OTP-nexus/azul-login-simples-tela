
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, Package, Truck, GripVertical } from 'lucide-react';

interface Collaborator {
  id: string;
  name: string;
  sector: string;
  phone: string;
  email?: string;
}

interface Parada {
  id: string;
  state: string;
  city: string;
  order: number;
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

interface FreightVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    collaborators: Collaborator[];
    origem: string;
    paradas: Parada[];
    tipoMercadoria: string;
    tiposVeiculos: VehicleType[];
    tiposCarrocerias: BodyType[];
  };
  onConfirm: () => void;
}

const FreightVerificationDialog: React.FC<FreightVerificationDialogProps> = ({
  open,
  onOpenChange,
  formData,
  onConfirm
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">
            Confirmar Criação do Frete Completo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Colaboradores */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-600" />
              <span>Colaboradores Responsáveis</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {formData.collaborators.map((collaborator) => (
                <div key={collaborator.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-800">{collaborator.name}</div>
                  <div className="text-sm text-gray-600">{collaborator.sector}</div>
                  <div className="text-sm text-gray-500">{collaborator.phone}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Rota */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span>Rota do Frete</span>
            </h3>
            <div className="space-y-3">
              {/* Origem */}
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  O
                </div>
                <div>
                  <div className="font-medium text-green-800">Origem</div>
                  <div className="text-sm text-green-600">{formData.origem}</div>
                </div>
              </div>

              {/* Paradas */}
              {formData.paradas.map((parada) => (
                <div key={parada.id} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {parada.order}
                  </div>
                  <div>
                    <div className="font-medium text-blue-800">Parada {parada.order}</div>
                    <div className="text-sm text-blue-600">{parada.city}/{parada.state}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mercadoria */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
              <Package className="w-5 h-5 text-blue-600" />
              <span>Tipo de Mercadoria</span>
            </h3>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-800">{formData.tipoMercadoria}</span>
            </div>
          </div>

          {/* Veículos */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
              <Truck className="w-5 h-5 text-blue-600" />
              <span>Veículos Aceitos</span>
            </h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Tipos de Veículos:</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.tiposVeiculos.map((vehicle) => (
                    <Badge key={vehicle.id} variant="secondary">
                      {vehicle.type}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Tipos de Carroceria:</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.tiposCarrocerias.map((body) => (
                    <Badge key={body.id} variant="outline">
                      {body.type}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Voltar para Edição
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
          >
            Confirmar e Criar Frete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FreightVerificationDialog;
