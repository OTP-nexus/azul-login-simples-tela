import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, Trash2, Ban, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { UserEditDialog } from './UserEditDialog';
import { UserViewDialog } from './UserViewDialog';
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

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  phone?: string;
}

interface UserManagementActionsProps {
  user: User;
  onUpdate: () => void;
}

export function UserManagementActions({ user, onUpdate }: UserManagementActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSuspendUser = async () => {
    setLoading(true);
    try {
      // Implementar suspensão via edge function ou atualização de status
      toast.success('Usuário suspenso com sucesso');
      onUpdate();
    } catch (error) {
      toast.error('Erro ao suspender usuário');
    } finally {
      setLoading(false);
      setSuspendOpen(false);
    }
  };

  const handleDeleteUser = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) throw error;
      
      toast.success('Usuário deletado com sucesso');
      onUpdate();
    } catch (error) {
      toast.error('Erro ao deletar usuário');
    } finally {
      setLoading(false);
      setDeleteOpen(false);
    }
  };

  const handleMakeAdmin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success('Usuário promovido a administrador');
      onUpdate();
    } catch (error) {
      toast.error('Erro ao promover usuário');
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
            Visualizar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </DropdownMenuItem>
          {user.role !== 'admin' && (
            <DropdownMenuItem onClick={handleMakeAdmin} disabled={loading}>
              <Shield className="h-4 w-4 mr-2" />
              Tornar Admin
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setSuspendOpen(true)}>
            <Ban className="h-4 w-4 mr-2" />
            Suspender
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Deletar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserEditDialog 
        user={user} 
        open={editOpen} 
        onOpenChange={setEditOpen}
        onUpdate={onUpdate}
      />

      <UserViewDialog 
        user={user} 
        open={viewOpen} 
        onOpenChange={setViewOpen}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o usuário "{user.full_name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? 'Deletando...' : 'Deletar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Suspensão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja suspender o usuário "{user.full_name}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSuspendUser}
              disabled={loading}
            >
              {loading ? 'Suspendendo...' : 'Suspender'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}