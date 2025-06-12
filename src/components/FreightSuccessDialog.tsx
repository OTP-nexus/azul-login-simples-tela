
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Copy, MapPin, Truck, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Parada {
  id: string;
  state: string;
  city: string;
  order: number;
}

interface GeneratedFreight {
  id: string;
  codigo_agregamento: string;
  paradas: Parada[];
}

interface FreightSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  generatedFreights: GeneratedFreight[];
  onNewFreight: () => void;
  onBackToDashboard: () => void;
}

const FreightSuccessDialog: React.FC<FreightSuccessDialogProps> = ({
  open,
  onOpenChange,
  generatedFreights,
  onNewFreight,
  onBackToDashboard
}) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Código copiado!",
      description: "O código foi copiado para sua área de transferência.",
    });
  };

  const freight = generatedFreights[0]; // Para frete completo, sempre será apenas um

  if (!freight) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-green-800">Frete Completo Criado com Sucesso!</h2>
              <p className="text-sm text-green-600 font-normal">
                Seu frete completo foi criado e está disponível para os motoristas
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Success message */}
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-800 font-medium">
              Código de agregamento gerado:
            </p>
          </div>

          {/* Generated freight code */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">Frete Completo</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <Badge variant="secondary" className="font-mono text-lg px-3 py-1">
                {freight.codigo_agregamento}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(freight.codigo_agregamento)}
              className="text-blue-600 hover:text-blue-700"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          {/* Route details */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800 mb-2">Rota do Frete:</h4>
            <div className="space-y-2">
              {freight.paradas
                .sort((a, b) => a.order - b.order)
                .map((parada, index) => (
                <div key={parada.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {parada.order}
                  </div>
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-800">
                    Parada {parada.order}: {parada.city}/{parada.state}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Additional info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Próximos passos:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Os motoristas agregados poderão visualizar este frete</li>
              <li>• Você receberá notificações quando houver interesse</li>
              <li>• O código serve como referência para acompanhamento</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onBackToDashboard}
            className="flex items-center space-x-2"
          >
            <span>Voltar ao Dashboard</span>
          </Button>
          <Button
            onClick={onNewFreight}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center space-x-2"
          >
            <Truck className="w-4 h-4" />
            <span>Nova Solicitação</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FreightSuccessDialog;
