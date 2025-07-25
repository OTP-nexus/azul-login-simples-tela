import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Check, X, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { DocumentViewDialog } from './DocumentViewDialog';
import { DocumentRejectDialog } from './DocumentRejectDialog';

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
}

interface DocumentManagementActionsProps {
  document: DocumentVerification;
  onUpdate: () => void;
}

export function DocumentManagementActions({ document, onUpdate }: DocumentManagementActionsProps) {
  const [viewOpen, setViewOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const updateData: any = {
        overall_status: 'approved',
        verified_at: new Date().toISOString()
      };

      // Aprovar todos os documentos relevantes baseado no tipo de usuário
      if (document.user_role === 'company') {
        updateData.address_proof_status = 'approved';
        updateData.cnpj_card_status = 'approved';
        updateData.responsible_document_status = 'approved';
      } else if (document.user_role === 'driver') {
        updateData.cnh_document_status = 'approved';
        updateData.photo_status = 'approved';
        updateData.driver_address_proof_status = 'approved';
      }

      const { error } = await supabase
        .from('document_verifications')
        .update(updateData)
        .eq('id', document.id);

      if (error) throw error;

      toast.success('Documentos aprovados com sucesso');
      onUpdate();
    } catch (error) {
      console.error('Erro ao aprovar documentos:', error);
      toast.error('Erro ao aprovar documentos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setViewOpen(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Visualizar Documentos
          </DropdownMenuItem>
          
          {document.overall_status === 'pending' && (
            <>
              <DropdownMenuItem onClick={handleApprove} disabled={loading}>
                <Check className="h-4 w-4 mr-2" />
                Aprovar Todos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRejectOpen(true)}>
                <X className="h-4 w-4 mr-2" />
                Rejeitar
              </DropdownMenuItem>
            </>
          )}
          
          <DropdownMenuItem>
            <MessageSquare className="h-4 w-4 mr-2" />
            Enviar Mensagem
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DocumentViewDialog 
        document={document} 
        open={viewOpen} 
        onOpenChange={setViewOpen}
        onUpdate={onUpdate}
      />

      <DocumentRejectDialog 
        document={document} 
        open={rejectOpen} 
        onOpenChange={setRejectOpen}
        onUpdate={onUpdate}
      />
    </>
  );
}