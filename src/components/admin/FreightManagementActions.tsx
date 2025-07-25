import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, Pause, Trash2, Play } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { FreightViewDialog } from './FreightViewDialog';
import { FreightEditDialog } from './FreightEditDialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';

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
  companies: {
    company_name: string;
    contact_name: string;
  };
}

interface FreightManagementActionsProps {
  freight: Freight;
  onUpdate: () => void;
}

export function FreightManagementActions({ freight, onUpdate }: FreightManagementActionsProps) {
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('fretes')
        .update({ status: newStatus })
        .eq('id', freight.id);

      if (error) throw error;

      const statusMessages = {
        ativo: 'Frete ativado com sucesso',
        pausado: 'Frete pausado com sucesso',
        cancelado: 'Frete cancelado com sucesso'
      };

      toast.success(statusMessages[newStatus as keyof typeof statusMessages] || 'Status atualizado');
      onUpdate();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status do frete');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('fretes')
        .delete()
        .eq('id', freight.id);

      if (error) throw error;

      toast.success('Frete deletado com sucesso');
      onUpdate();
    } catch (error) {
      console.error('Erro ao deletar frete:', error);
      toast.error('Erro ao deletar frete');
    } finally {
      setLoading(false);
      setDeleteOpen(false);
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
            Visualizar Detalhes
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </DropdownMenuItem>

          {freight.status === 'ativo' ? (
            <DropdownMenuItem 
              onClick={() => handleStatusChange('pausado')}
              disabled={loading}
            >
              <Pause className="h-4 w-4 mr-2" />
              Pausar
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              onClick={() => handleStatusChange('ativo')}
              disabled={loading}
            >
              <Play className="h-4 w-4 mr-2" />
              Ativar
            </DropdownMenuItem>
          )}

          <DropdownMenuItem 
            onClick={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Deletar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <FreightViewDialog 
        freight={freight} 
        open={viewOpen} 
        onOpenChange={setViewOpen}
      />

      <FreightEditDialog 
        freight={freight} 
        open={editOpen} 
        onOpenChange={setEditOpen}
        onUpdate={onUpdate}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este frete? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? 'Deletando...' : 'Deletar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}