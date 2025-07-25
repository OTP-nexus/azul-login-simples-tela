import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface Freight {
  id: string;
  tipo_frete: string;
  origem_cidade: string;
  origem_estado: string;
  destino_cidade: string;
  destino_estado: string;
  tipo_mercadoria: string;
  peso_carga: number;
  valor_carga: number;
  status: string;
  created_at: string;
  observacoes?: string;
  data_coleta?: string;
  data_entrega?: string;
  precisa_rastreador?: boolean;
  precisa_ajudante?: boolean;
  companies: {
    company_name: string;
    contact_name: string;
  };
}

interface FreightViewDialogProps {
  freight: Freight;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FreightViewDialog({ freight, open, onOpenChange }: FreightViewDialogProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: { label: 'Ativo', variant: 'default' as const },
      pausado: { label: 'Pausado', variant: 'secondary' as const },
      cancelado: { label: 'Cancelado', variant: 'destructive' as const },
      concluido: { label: 'Concluído', variant: 'outline' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { 
      label: status, 
      variant: 'outline' as const 
    };

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const getFreightTypeBadge = (type: string) => {
    const typeLabels = {
      agregamento: 'Agregamento',
      frete_completo: 'Frete Completo',
      frete_de_retorno: 'Frete de Retorno',
      comum: 'Comum'
    };

    return (
      <Badge variant="secondary">
        {typeLabels[type as keyof typeof typeLabels] || type}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Frete</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-2">
            <h3 className="font-medium">Informações Básicas</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Empresa:</span> {freight.companies.company_name}
              </div>
              <div>
                <span className="font-medium">Contato:</span> {freight.companies.contact_name}
              </div>
              <div>
                <span className="font-medium">Tipo de Frete:</span> {getFreightTypeBadge(freight.tipo_frete)}
              </div>
              <div>
                <span className="font-medium">Status:</span> {getStatusBadge(freight.status)}
              </div>
            </div>
          </div>

          {/* Origem e Destino */}
          <div className="space-y-2">
            <h3 className="font-medium">Rota</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Origem:</span> {freight.origem_cidade}, {freight.origem_estado}
              </div>
              <div>
                <span className="font-medium">Destino:</span> {freight.destino_cidade}, {freight.destino_estado}
              </div>
            </div>
          </div>

          {/* Carga */}
          <div className="space-y-2">
            <h3 className="font-medium">Informações da Carga</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Tipo de Mercadoria:</span> {freight.tipo_mercadoria}
              </div>
              <div>
                <span className="font-medium">Peso:</span> {freight.peso_carga ? `${freight.peso_carga} kg` : 'Não informado'}
              </div>
              <div>
                <span className="font-medium">Valor da Carga:</span> {freight.valor_carga ? formatCurrency(freight.valor_carga) : 'Não informado'}
              </div>
            </div>
          </div>

          {/* Datas */}
          {(freight.data_coleta || freight.data_entrega) && (
            <div className="space-y-2">
              <h3 className="font-medium">Cronograma</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {freight.data_coleta && (
                  <div>
                    <span className="font-medium">Data de Coleta:</span> {formatDate(freight.data_coleta)}
                  </div>
                )}
                {freight.data_entrega && (
                  <div>
                    <span className="font-medium">Data de Entrega:</span> {formatDate(freight.data_entrega)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Requisitos Especiais */}
          <div className="space-y-2">
            <h3 className="font-medium">Requisitos Especiais</h3>
            <div className="flex flex-wrap gap-2">
              {freight.precisa_rastreador && (
                <Badge variant="outline">Rastreador Necessário</Badge>
              )}
              {freight.precisa_ajudante && (
                <Badge variant="outline">Ajudante Necessário</Badge>
              )}
            </div>
          </div>

          {/* Observações */}
          {freight.observacoes && (
            <div className="space-y-2">
              <h3 className="font-medium">Observações</h3>
              <p className="text-sm bg-muted p-2 rounded">
                {freight.observacoes}
              </p>
            </div>
          )}

          {/* Informações do Sistema */}
          <div className="space-y-2 border-t pt-4">
            <h3 className="font-medium">Informações do Sistema</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div>
                <span className="font-medium">ID:</span> 
                <span className="font-mono text-xs ml-2">{freight.id}</span>
              </div>
              <div>
                <span className="font-medium">Criado em:</span> {formatDate(freight.created_at)}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}