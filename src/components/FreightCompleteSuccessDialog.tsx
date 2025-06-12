
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
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Plus, Home, Package, MapPin, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GeneratedFreightComplete {
  id: string;
  codigo_completo: string;
  destino_cidade: string;
  destino_estado: string;
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
      description: `Código ${code} copiado para a área de transferência`,
    });
  };

  const handleCopyAllCodes = () => {
    const allCodes = generatedFreights.map(freight => freight.codigo_completo).join(', ');
    navigator.clipboard.writeText(allCodes);
    toast({
      title: "Códigos copiados!",
      description: `${generatedFreights.length} códigos copiados para a área de transferência`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <span>Frete Completo Criado com Sucesso!</span>
          </DialogTitle>
          <DialogDescription>
            {generatedFreights.length === 1 
              ? 'Sua solicitação de frete completo foi criada e está pronta para uso.'
              : `${generatedFreights.length} solicitações de frete completo foram criadas, uma para cada destino.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <Package className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">
                  {generatedFreights.length} Frete{generatedFreights.length > 1 ? 's' : ''} Completo{generatedFreights.length > 1 ? 's' : ''} Criado{generatedFreights.length > 1 ? 's' : ''}
                </h3>
                <p className="text-sm text-green-700">
                  Todas as solicitações estão ativas e prontas para receber propostas
                </p>
              </div>
            </div>
            {generatedFreights.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAllCodes}
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar Todos
              </Button>
            )}
          </div>

          {/* Generated freights list */}
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {generatedFreights.map((freight, index) => (
              <Card key={freight.id} className="border-l-4 border-l-green-500">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                        <span className="text-sm font-semibold text-green-700">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="secondary" className="font-mono text-xs">
                            {freight.codigo_completo}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyCode(freight.codigo_completo)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{freight.destino_cidade} - {freight.destino_estado}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        Ativo
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Next steps info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Próximos Passos:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Os códigos de frete podem ser compartilhados com transportadores</li>
              <li>• Você receberá notificações quando houver propostas</li>
              <li>• Acompanhe o status no dashboard da empresa</li>
              <li>• Mantenha os dados de contato atualizados</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={onNewFreight}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Frete Completo</span>
          </Button>
          <Button
            onClick={onBackToDashboard}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Voltar ao Dashboard</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FreightCompleteSuccessDialog;
