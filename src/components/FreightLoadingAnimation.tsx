
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Truck } from 'lucide-react';

interface FreightLoadingAnimationProps {
  open: boolean;
}

const FreightLoadingAnimation: React.FC<FreightLoadingAnimationProps> = ({ open }) => {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md border-none shadow-2xl">
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          {/* Animated truck icon */}
          <div className="relative">
            <div className="animate-bounce">
              <Truck className="w-16 h-16 text-blue-600" />
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>

          {/* Loading text */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-gray-800">
              Seu pedido está sendo solicitado...
            </h3>
            <p className="text-gray-600">
              Aguarde enquanto processamos sua solicitação
            </p>
          </div>

          {/* Animated progress bar */}
          <div className="w-full max-w-xs">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FreightLoadingAnimation;
