
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
import { CheckCircle, Plus, ArrowLeft, Truck, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GeneratedFreightComplete {
  id: string;
  codigo_completo: string;
}

interface FreightCompleteSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  generatedFreights: GeneratedFreightComplete[];
  onNewFreight: () => void;
  onBackToDashboard: () => void;
}

const FreightCompleteSuccessDialog: React.FC<FreightCompleteSuccessDialogProps> = ({
  open,
  onOpenChange,
  generatedFreights,
  onNewFreight,
  onBackToDashboard
}) => {
  const { toast } = useToast();

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Código copiado!",
      description: "O código do frete foi copiado para a área de transferência.",
    });
  };

  const freight = generatedFreights[0]; // Apenas um frete será gerado

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-xl text-gray-800">
            Frete Completo Criado!
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Seu pedido de frete completo foi criado com sucesso.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {freight && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-green-800">
                      Frete Completo
                    </div>
                    <div className="text-lg font-bold text-green-900">
                      {freight.codigo_completo}
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyCode(freight.codigo_completo)}
                  className="text-green-600 hover:text-green-700 hover:bg-green-100"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-800">
              <strong>Importante:</strong> Seu frete completo foi criado como um único pedido que incluirá todas as paradas definidas na sequência especificada.
            </div>
          </div>

          <div className="text-center text-sm text-gray-600">
            O código do frete foi gerado automaticamente e pode ser usado para acompanhar o status da solicitação.
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onNewFreight}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Frete</span>
          </Button>
          <Button
            type="button"
            onClick={onBackToDashboard}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Dashboard</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FreightCompleteSuccessDialog;
