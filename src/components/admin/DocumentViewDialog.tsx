import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Download } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface DocumentVerification {
  id: string;
  user_id: string;
  user_role: string;
  overall_status: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
  address_proof_url?: string;
  cnpj_card_url?: string;
  responsible_document_url?: string;
  cnh_document_url?: string;
  photo_url?: string;
  driver_address_proof_url?: string;
  address_proof_status?: string;
  cnpj_card_status?: string;
  responsible_document_status?: string;
  cnh_document_status?: string;
  photo_status?: string;
  driver_address_proof_status?: string;
}

interface DocumentViewDialogProps {
  document: DocumentVerification;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function DocumentViewDialog({ document, open, onOpenChange, onUpdate }: DocumentViewDialogProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      approved: { label: 'Aprovado', variant: 'default' as const },
      rejected: { label: 'Rejeitado', variant: 'destructive' as const },
      pending: { label: 'Pendente', variant: 'secondary' as const },
      not_submitted: { label: 'Não Enviado', variant: 'outline' as const }
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

  const handleIndividualApproval = async (field: string, statusField: string) => {
    setLoading(field);
    try {
      const { error } = await supabase
        .from('document_verifications')
        .update({ [statusField]: 'approved' })
        .eq('id', document.id);

      if (error) throw error;

      toast.success('Documento aprovado com sucesso');
      onUpdate();
    } catch (error) {
      console.error('Erro ao aprovar documento:', error);
      toast.error('Erro ao aprovar documento');
    } finally {
      setLoading(null);
    }
  };

  const handleIndividualRejection = async (field: string, statusField: string) => {
    setLoading(field);
    try {
      const { error } = await supabase
        .from('document_verifications')
        .update({ [statusField]: 'rejected' })
        .eq('id', document.id);

      if (error) throw error;

      toast.success('Documento rejeitado com sucesso');
      onUpdate();
    } catch (error) {
      console.error('Erro ao rejeitar documento:', error);
      toast.error('Erro ao rejeitar documento');
    } finally {
      setLoading(null);
    }
  };

  const downloadDocument = async (url: string, filename: string) => {
    try {
      const { data } = await supabase.storage
        .from('documents')
        .download(url);
      
      if (data) {
        const blob = new Blob([data]);
        const downloadUrl = URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        window.document.body.appendChild(a);
        a.click();
        window.document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
      }
    } catch (error) {
      toast.error('Erro ao baixar documento');
    }
  };

  const companyDocuments = [
    {
      label: 'Comprovante de Endereço',
      url: document.address_proof_url,
      status: document.address_proof_status,
      field: 'address_proof',
      statusField: 'address_proof_status'
    },
    {
      label: 'Cartão CNPJ',
      url: document.cnpj_card_url,
      status: document.cnpj_card_status,
      field: 'cnpj_card',
      statusField: 'cnpj_card_status'
    },
    {
      label: 'Documento do Responsável',
      url: document.responsible_document_url,
      status: document.responsible_document_status,
      field: 'responsible_document',
      statusField: 'responsible_document_status'
    }
  ];

  const driverDocuments = [
    {
      label: 'CNH',
      url: document.cnh_document_url,
      status: document.cnh_document_status,
      field: 'cnh_document',
      statusField: 'cnh_document_status'
    },
    {
      label: 'Foto do Motorista',
      url: document.photo_url,
      status: document.photo_status,
      field: 'photo',
      statusField: 'photo_status'
    },
    {
      label: 'Comprovante de Endereço',
      url: document.driver_address_proof_url,
      status: document.driver_address_proof_status,
      field: 'driver_address_proof',
      statusField: 'driver_address_proof_status'
    }
  ];

  const documents = document.user_role === 'company' ? companyDocuments : driverDocuments;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Verificação de Documentos</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium">Informações do Usuário</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Nome:</span> {document.profiles.full_name}
              </div>
              <div>
                <span className="font-medium">Email:</span> {document.profiles.email}
              </div>
              <div>
                <span className="font-medium">Tipo:</span> {document.user_role === 'company' ? 'Empresa' : 'Motorista'}
              </div>
              <div>
                <span className="font-medium">Status Geral:</span> {getStatusBadge(document.overall_status)}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Documentos</h3>
            {documents.map((doc, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{doc.label}</span>
                    {getStatusBadge(doc.status || 'not_submitted')}
                  </div>
                  {doc.url && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadDocument(doc.url!, `${doc.label}.pdf`)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Baixar
                    </Button>
                  )}
                </div>
                
                {doc.url && doc.status === 'pending' && (
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleIndividualApproval(doc.field, doc.statusField)}
                      disabled={loading === doc.field}
                      className="text-green-600 border-green-600 hover:bg-green-50"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Aprovar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleIndividualRejection(doc.field, doc.statusField)}
                      disabled={loading === doc.field}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Rejeitar
                    </Button>
                  </div>
                )}
                
                {!doc.url && (
                  <p className="text-sm text-muted-foreground">
                    Documento não enviado
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}