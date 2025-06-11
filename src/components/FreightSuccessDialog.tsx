
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Copy, Download, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FreightSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  codigoAgregamento: string;
  onGoToDashboard: () => void;
  onCreateNew: () => void;
}

const FreightSuccessDialog: React.FC<FreightSuccessDialogProps> = ({
  open,
  onOpenChange,
  codigoAgregamento,
  onGoToDashboard,
  onCreateNew
}) => {
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codigoAgregamento);
    toast({
      title: "Código copiado!",
      description: "O código do pedido foi copiado para a área de transferência.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-scale-in">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <span className="text-xl font-bold text-green-800">Pedido Criado com Sucesso!</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Seu pedido de frete de agregamento foi criado e está aguardando processamento.
            </p>
            
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-blue-800 mb-2">Código do Pedido:</p>
                  <div className="flex items-center justify-center space-x-2">
                    <code className="text-lg font-bold text-blue-900 bg-white px-3 py-2 rounded border">
                      {codigoAgregamento}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className="h-10 w-10 p-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    Guarde este código para acompanhar seu pedido
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col space-y-3">
            <Button
              onClick={onGoToDashboard}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Ir para Dashboard
            </Button>
            
            <Button
              variant="outline"
              onClick={onCreateNew}
              className="w-full"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Criar Novo Pedido
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Você receberá notificações sobre o status do seu pedido por email.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FreightSuccessDialog;
