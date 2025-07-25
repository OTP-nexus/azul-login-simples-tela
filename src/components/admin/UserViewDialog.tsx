import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/formatters';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  phone?: string;
}

interface UserViewDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserViewDialog({ user, open, onOpenChange }: UserViewDialogProps) {
  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: 'Administrador', variant: 'destructive' as const },
      company: { label: 'Empresa', variant: 'default' as const },
      driver: { label: 'Motorista', variant: 'secondary' as const }
    };

    const config = roleConfig[role as keyof typeof roleConfig] || { 
      label: role, 
      variant: 'outline' as const 
    };

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Usuário</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Nome Completo
            </label>
            <p className="text-sm">{user.full_name}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Email
            </label>
            <p className="text-sm">{user.email}</p>
          </div>

          {user.phone && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Telefone
              </label>
              <p className="text-sm">{user.phone}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Tipo de Usuário
            </label>
            <div>{getRoleBadge(user.role)}</div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Data de Cadastro
            </label>
            <p className="text-sm">{formatDate(user.created_at)}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              ID do Usuário
            </label>
            <p className="text-sm font-mono text-xs break-all">{user.id}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}