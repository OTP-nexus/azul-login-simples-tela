
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, Package, User, Check } from 'lucide-react';

interface FreightConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: any;
  onConfirm: () => void;
  isSubmitting: boolean;
}

const FreightConfirmationDialog = ({ 
  open, 
  onOpenChange, 
  formData, 
  onConfirm, 
  isSubmitting 
}: FreightConfirmationDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Confirmar Solicitação de Frete</DialogTitle>
          <DialogDescription className="text-center text-lg">
            Revise todos os dados antes de enviar sua solicitação
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Origem e Destino */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Origem e Destino
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-green-600 mb-2">Local de Origem</h4>
                  <p><strong>Estado:</strong> {formData.origemEstado}</p>
                  <p><strong>Cidade:</strong> {formData.origemCidade}</p>
                  <p><strong>Tipo:</strong> {formData.origemTipoEndereco}</p>
                </div>
                <div>
                  <h4 className="font-medium text-red-600 mb-2">Local de Destino</h4>
                  <p><strong>Estado:</strong> {formData.destinoEstado}</p>
                  <p><strong>Cidade:</strong> {formData.destinoCidade}</p>
                  <p><strong>Tipo:</strong> {formData.destinoTipoEndereco}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data e Horário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Data e Horário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <p><strong>Data da coleta:</strong> {new Date(formData.dataCarregamento).toLocaleDateString('pt-BR')}</p>
                <p><strong>Horário:</strong> {formData.horarioCarregamento}</p>
              </div>
            </CardContent>
          </Card>

          {/* Itens */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-green-600" />
                Itens a Transportar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {formData.tipoListagemItens === 'detalhada' ? (
                <div className="space-y-2">
                  {formData.itensDetalhados.map((item: any, index: number) => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{item.nome}</span>
                      <span className="font-medium">Qtd: {item.quantidade}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded">
                  <p>{formData.descricaoLivreItens}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Serviços Extras */}
          <Card>
            <CardHeader>
              <CardTitle>Serviços Adicionais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {formData.precisaAjudante && <p>✓ Precisa de ajudante</p>}
                {formData.precisaMontarDesmontar && <p>✓ Precisa montar/desmontar móveis</p>}
                {formData.precisaEmbalagem && <p>✓ Precisa de embalagem</p>}
                {formData.localPossuiRestricao && (
                  <div>
                    <p>✓ Local possui restrições</p>
                    <p className="text-sm text-gray-600 ml-4">{formData.descricaoRestricao}</p>
                  </div>
                )}
                {!formData.precisaAjudante && !formData.precisaMontarDesmontar && 
                 !formData.precisaEmbalagem && !formData.localPossuiRestricao && (
                  <p className="text-gray-500">Nenhum serviço adicional solicitado</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dados do Solicitante */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-orange-600" />
                Dados para Contato
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Nome:</strong> {formData.solicitanteNome}</p>
                <p><strong>Telefone:</strong> {formData.solicitanteTelefone}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex justify-between pt-6">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="px-8"
            disabled={isSubmitting}
          >
            Voltar e Editar
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 px-8 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Enviando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Confirmar Solicitação
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FreightConfirmationDialog;
