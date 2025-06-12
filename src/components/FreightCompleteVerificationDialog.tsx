
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, MapPin, Truck, Calendar, DollarSign, Clock, AlertTriangle } from 'lucide-react';

interface CollaboratorComplete {
  id: string;
  name: string;
  sector: string;
}

interface DestinoComplete {
  id: string;
  cidade: string;
  estado: string;
}

interface TabelaPrecoComplete {
  id: string;
  tipoVeiculo: string;
  faixaKm: {
    inicio: number;
    fim: number;
  };
  preco: number;
}

interface FreightCompleteFormData {
  collaborators: CollaboratorComplete[];
  origem: {
    cidade: string;
    estado: string;
  };
  destinos: DestinoComplete[];
  tipoMercadoria: string;
  pesoCarga: string;
  valorCarga: string;
  tiposVeiculos: string[];
  tiposCarrocerias: string[];
  tabelasPreco: TabelaPrecoComplete[];
  dataColeta: string;
  dataEntrega: string;
  horarioCarregamento: string;
  pedagioPagoPor: string;
  pedagioDirecao: string;
  precisaAjudante: boolean;
  precisaRastreador: boolean;
  precisaSeguro: boolean;
  regrasAgendamento: string[];
  beneficios: string[];
  observacoes: string;
}

interface FreightCompleteVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: FreightCompleteFormData;
  onConfirm: () => void;
}

const FreightCompleteVerificationDialog: React.FC<FreightCompleteVerificationDialogProps> = ({
  open,
  onOpenChange,
  formData,
  onConfirm
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'Não informado';
    return timeString;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Verificar Dados do Frete Completo</h2>
              <p className="text-sm text-gray-600 font-normal">
                Revise todas as informações antes de finalizar
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Alerta sobre múltiplos destinos */}
          {formData.destinos.length > 1 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-amber-800">Múltiplos Destinos Detectados</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Serão criados <strong>{formData.destinos.length} fretes completos separados</strong>, 
                    um para cada destino, com os mesmos dados configurados.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Colaboradores */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Colaboradores Responsáveis</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {formData.collaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center justify-between">
                  <span className="font-medium">{collaborator.name}</span>
                  <Badge variant="secondary">{collaborator.sector}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Origem e Destinos */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <MapPin className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-800">Rotas</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">Origem:</span>
                <p className="font-medium">{formData.origem.cidade} - {formData.origem.estado}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-600">Destinos:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                  {formData.destinos.map((destino) => (
                    <div key={destino.id} className="p-2 bg-blue-50 rounded border border-blue-200">
                      <span className="font-medium">{destino.cidade} - {destino.estado}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Informações da Carga */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Truck className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-gray-800">Informações da Carga</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Tipo de Mercadoria:</span>
                <p className="font-medium">{formData.tipoMercadoria}</p>
              </div>
              {formData.pesoCarga && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Peso:</span>
                  <p className="font-medium">{formData.pesoCarga} kg</p>
                </div>
              )}
              {formData.valorCarga && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Valor:</span>
                  <p className="font-medium">R$ {parseFloat(formData.valorCarga).toLocaleString('pt-BR')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Veículos e Preços */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-800">Veículos e Preços</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">Tipos de Veículos:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {formData.tiposVeiculos.map((tipo) => (
                    <Badge key={tipo} variant="outline">{tipo}</Badge>
                  ))}
                </div>
              </div>
              
              {formData.tiposCarrocerias.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Tipos de Carrocerias:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.tiposCarrocerias.map((tipo) => (
                      <Badge key={tipo} variant="outline">{tipo}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <span className="text-sm font-medium text-gray-600">Tabelas de Preço:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                  {formData.tabelasPreco.map((tabela) => (
                    <div key={tabela.id} className="p-2 bg-green-50 rounded border border-green-200">
                      <span className="font-medium">{tabela.tipoVeiculo}</span>
                      <p className="text-sm text-gray-600">
                        {tabela.faixaKm.inicio}-{tabela.faixaKm.fim}km: R$ {tabela.preco.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Datas e Configurações */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Calendar className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-800">Datas e Configurações</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Data de Coleta:</span>
                <p className="font-medium">{formatDate(formData.dataColeta)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Data de Entrega:</span>
                <p className="font-medium">{formatDate(formData.dataEntrega)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Horário de Carregamento:</span>
                <p className="font-medium">{formatTime(formData.horarioCarregamento)}</p>
              </div>
            </div>

            {/* Pedágio */}
            {(formData.pedagioPagoPor || formData.pedagioDirecao) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-600">Pedágio:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {formData.pedagioPagoPor && (
                    <div>
                      <span className="text-xs text-gray-500">Pago por:</span>
                      <p className="font-medium capitalize">{formData.pedagioPagoPor}</p>
                    </div>
                  )}
                  {formData.pedagioDirecao && (
                    <div>
                      <span className="text-xs text-gray-500">Direção:</span>
                      <p className="font-medium capitalize">{formData.pedagioDirecao}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Requisitos Especiais */}
            {(formData.precisaAjudante || formData.precisaRastreador || formData.precisaSeguro) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-600">Requisitos Especiais:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.precisaAjudante && <Badge variant="secondary">Ajudante</Badge>}
                  {formData.precisaRastreador && <Badge variant="secondary">Rastreador</Badge>}
                  {formData.precisaSeguro && <Badge variant="secondary">Seguro</Badge>}
                </div>
              </div>
            )}
          </div>

          {/* Regras e Benefícios */}
          {(formData.regrasAgendamento.length > 0 || formData.beneficios.length > 0) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-800">Regras e Benefícios</h3>
              </div>
              
              {formData.regrasAgendamento.length > 0 && (
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-600">Regras de Agendamento:</span>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {formData.regrasAgendamento.map((regra, index) => (
                      <li key={index} className="text-sm">{regra}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {formData.beneficios.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Benefícios:</span>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {formData.beneficios.map((beneficio, index) => (
                      <li key={index} className="text-sm">{beneficio}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Observações */}
          {formData.observacoes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-sm font-medium text-gray-600">Observações:</span>
              <p className="mt-1 text-sm">{formData.observacoes}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Revisar
          </Button>
          <Button onClick={onConfirm} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
            Confirmar e Criar {formData.destinos.length > 1 ? `${formData.destinos.length} Fretes` : 'Frete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FreightCompleteVerificationDialog;
