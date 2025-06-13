
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
import { AlertTriangle } from 'lucide-react';

interface LogoRequiredDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToProfile: () => void;
}

const LogoRequiredDialog: React.FC<LogoRequiredDialogProps> = ({
  isOpen,
  onClose,
  onGoToProfile
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Logo Obrigatório
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-gray-600">
            Para acessar esta funcionalidade, você precisa adicionar o logo da sua empresa no perfil.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={onGoToProfile}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Adicionar Logo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogoRequiredDialog;
