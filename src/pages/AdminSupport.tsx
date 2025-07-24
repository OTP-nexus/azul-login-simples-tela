import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { StatsCard } from '@/components/ui/stats-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MessageSquare, Clock, CheckCircle, AlertCircle, MoreHorizontal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SupportTicket {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  user_email?: string;
  user_name?: string;
}

export default function AdminSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      // Dados mock para demonstração
      const mockTickets: SupportTicket[] = [
        {
          id: '1',
          user_id: 'user1',
          title: 'Problema com pagamento',
          description: 'Não consigo finalizar o pagamento da assinatura',
          status: 'open',
          priority: 'high',
          category: 'payment',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_email: 'usuario1@example.com',
          user_name: 'Usuário 1'
        }
      ];
      setTickets(mockTickets);
    } catch (error) {
      console.error('Erro ao buscar tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === '' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === '' || ticket.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { label: 'Aberto', variant: 'destructive' as const, icon: AlertCircle },
      in_progress: { label: 'Em Andamento', variant: 'default' as const, icon: Clock },
      resolved: { label: 'Resolvido', variant: 'secondary' as const, icon: CheckCircle },
      closed: { label: 'Fechado', variant: 'outline' as const, icon: CheckCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { label: status, variant: 'outline' as const, icon: AlertCircle };
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <config.icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { label: 'Baixa', variant: 'secondary' as const },
      medium: { label: 'Média', variant: 'default' as const },
      high: { label: 'Alta', variant: 'destructive' as const },
      urgent: { label: 'Urgente', variant: 'destructive' as const },
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || 
                   { label: priority, variant: 'outline' as const };
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    avgResponseTime: '2.5h' // Mock
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-center">Carregando tickets...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Suporte</h1>
            <p className="text-muted-foreground">Gerencie tickets de suporte dos usuários</p>
          </div>
          <Button>Novo Ticket</Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total de Tickets"
            value={stats.total}
            icon={MessageSquare}
          />
          <StatsCard
            title="Tickets Abertos"
            value={stats.open}
            icon={AlertCircle}
          />
          <StatsCard
            title="Em Andamento"
            value={stats.inProgress}
            icon={Clock}
          />
          <StatsCard
            title="Tempo Médio de Resposta"
            value={stats.avgResponseTime}
            icon={Clock}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Input
            placeholder="Buscar tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="open">Aberto</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="resolved">Resolvido</SelectItem>
              <SelectItem value="closed">Fechado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{ticket.title}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-md">
                        {ticket.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{ticket.user_name}</div>
                      <div className="text-sm text-muted-foreground">{ticket.user_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                  <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{ticket.category}</Badge>
                  </TableCell>
                  <TableCell>{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                        <DropdownMenuItem>Atribuir a Mim</DropdownMenuItem>
                        <DropdownMenuItem>Alterar Status</DropdownMenuItem>
                        <DropdownMenuItem>Responder</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}