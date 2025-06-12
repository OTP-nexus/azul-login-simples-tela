
import React from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Truck, Package, MapPin, CheckCircle } from 'lucide-react';

interface FreightCompleteLoadingAnimationProps {
  open: boolean;
}

const FreightCompleteLoadingAnimation: React.FC<FreightCompleteLoadingAnimationProps> = ({ open }) => {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          {/* Animated truck */}
          <div className="relative">
            <div className="animate-bounce">
              <Truck className="w-16 h-16 text-blue-600" />
            </div>
            <div className="absolute -top-2 -right-2 animate-pulse">
              <Package className="w-6 h-6 text-orange-500" />
            </div>
          </div>

          {/* Loading steps */}
          <div className="space-y-4 w-full max-w-sm">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-700">Validando dados do frete completo</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-700">Criando solicitações por destino</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500">Configurando tabelas de preço</span>
            </div>
          </div>

          {/* Loading message */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Processando Frete Completo
            </h3>
            <p className="text-sm text-gray-600 max-w-xs">
              Estamos criando suas solicitações de frete. Isso pode levar alguns instantes...
            </p>
          </div>

          {/* Animated progress bar */}
          <div className="w-full max-w-xs">
            <div className="bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FreightCompleteLoadingAnimation;
