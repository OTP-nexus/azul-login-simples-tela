
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Copy, MapPin, Truck, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GeneratedFreight {
  id: string;
  codigo_agregamento: string;
  destino_cidade: string;
  destino_estado: string;
}

interface FreightSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  generatedFreights: GeneratedFreight[];
  onNewFreight: () => void;
  onBackToDashboard: () => void;
  freightType?: 'complete' | 'return';
}

const FreightSuccessDialog: React.FC<FreightSuccessDialogProps> = ({
  open,
  onOpenChange,
  generatedFreights,
  onNewFreight,
  onBackToDashboard,
  freightType = 'complete'
}) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Código copiado!",
      description: "O código foi copiado para sua área de transferência.",
    });
  };

  const copyAllCodes = () => {
    const allCodes = generatedFreights.map(freight => 
      `${freight.destino_cidade}/${freight.destino_estado}: ${freight.codigo_agregamento}`
    ).join('\n');
    
    navigator.clipboard.writeText(allCodes);
    toast({
      title: "Todos os códigos copiados!",
      description: "Todos os códigos foram copiados para sua área de transferência.",
    });
  };

  const getFreightTypeMessage = () => {
    if (freightType === 'return') {
      return generatedFreights.length === 1 
        ? 'Código de frete de retorno gerado:'
        : 'Códigos de frete de retorno gerados:';
    }
    return generatedFreights.length === 1 
      ? 'Código de frete completo gerado:'
      : 'Códigos de frete completo gerados:';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-green-800">Pedido Criado com Sucesso!</h2>
              <p className="text-sm text-green-600 font-normal">
                {generatedFreights.length === 1 
                  ? 'Seu frete foi criado e está disponível para os motoristas'
                  : `${generatedFreights.length} fretes foram criados para cada destino`
                }
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Success message */}
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-800 font-medium">
              {getFreightTypeMessage()}
            </p>
          </div>

          {/* Generated freight destinations (without codes if multiple) */}
          {generatedFreights.length > 1 ? (
            <div className="space-y-3">
              {generatedFreights.map((freight, index) => (
                <div key={freight.id} className="flex items-center justify-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800">
                      {freight.destino_cidade}/{freight.destino_estado}
                    </span>
                  </div>
                </div>
              ))}
              
              {/* Show all codes at bottom for multiple freights */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-3 text-center">Códigos de agregamento:</h4>
                <div className="space-y-2">
                  {generatedFreights.map((freight) => (
                    <div key={freight.id} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {freight.destino_cidade}/{freight.destino_estado}:
                        </span>
                        <Badge variant="secondary" className="font-mono">
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
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Single freight with code displayed prominently */
            <div className="space-y-3">
              {generatedFreights.map((freight) => (
                <div key={freight.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">
                        {freight.destino_cidade}/{freight.destino_estado}
                      </span>
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
              ))}
            </div>
          )}

          {/* Copy all button for multiple freights */}
          {generatedFreights.length > 1 && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={copyAllCodes}
                className="flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>Copiar Todos os Códigos</span>
              </Button>
            </div>
          )}

          {/* Additional info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Próximos passos:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Os motoristas agregados poderão visualizar {generatedFreights.length === 1 ? 'este frete' : 'estes fretes'}</li>
              <li>• Você receberá notificações quando houver interesse</li>
              <li>• {generatedFreights.length === 1 ? 'O código' : 'Os códigos'} {generatedFreights.length === 1 ? 'serve' : 'servem'} como referência para acompanhamento</li>
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
