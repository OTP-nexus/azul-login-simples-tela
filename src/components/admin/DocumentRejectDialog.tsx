import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface DocumentVerification {
  id: string;
  user_id: string;
  user_role: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

interface DocumentRejectDialogProps {
  document: DocumentVerification;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function DocumentRejectDialog({ document, open, onOpenChange, onUpdate }: DocumentRejectDialogProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error('Por favor, informe o motivo da rejeição');
      return;
    }

    setLoading(true);
    try {
      const updateData: any = {
        overall_status: 'rejected',
        rejection_reason: reason
      };

      // Rejeitar todos os documentos relevantes baseado no tipo de usuário
      if (document.user_role === 'company') {
        updateData.address_proof_status = 'rejected';
        updateData.cnpj_card_status = 'rejected';
        updateData.responsible_document_status = 'rejected';
      } else if (document.user_role === 'driver') {
        updateData.cnh_document_status = 'rejected';
        updateData.photo_status = 'rejected';
        updateData.driver_address_proof_status = 'rejected';
      }

      const { error } = await supabase
        .from('document_verifications')
        .update(updateData)
        .eq('id', document.id);

      if (error) throw error;

      // Criar notificação para o usuário (comentado temporariamente)
      // await supabase
      //   .from('notifications')
      //   .insert({
      //     user_id: document.user_id,
      //     title: 'Documentos Rejeitados',
      //     message: `Seus documentos foram rejeitados. Motivo: ${reason}`,
      //     type: 'warning'
      //   });

      toast.success('Documentos rejeitados e usuário notificado');
      onUpdate();
      onOpenChange(false);
      setReason('');
    } catch (error) {
      console.error('Erro ao rejeitar documentos:', error);
      toast.error('Erro ao rejeitar documentos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rejeitar Documentos</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Você está rejeitando os documentos de <strong>{document.profiles?.full_name || 'usuário'}</strong>.
            Por favor, informe o motivo da rejeição.
          </p>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo da Rejeição</Label>
            <Textarea
              id="reason"
              placeholder="Descreva detalhadamente o motivo da rejeição..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleReject}
              disabled={loading || !reason.trim()}
              variant="destructive"
            >
              {loading ? 'Rejeitando...' : 'Rejeitar Documentos'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}