import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { StatsCard } from '@/components/ui/stats-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, CreditCard, DollarSign, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  created_at: string;
  current_period_end: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  user_email?: string;
  user_name?: string;
  plan_name?: string;
}

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      // Buscar assinaturas reais com JOIN para dados do usuário e plano (usando 'as any' para contornar limitações do schema)
      const { data: subscriptionsData, error } = await supabase
        .from('subscriptions' as any)
        .select(`
          *,
          user:profiles(email, full_name),
          plan:subscription_plans(name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar assinaturas:', error);
        setSubscriptions([]);
        return;
      }

      // Mapear dados para o formato esperado
      const formattedSubscriptions: Subscription[] = (subscriptionsData || []).map((sub: any) => ({
        id: sub.id,
        user_id: sub.user_id || '',
        plan_id: sub.plan_id || '',
        status: sub.status || 'active',
        created_at: sub.created_at,
        current_period_end: sub.current_period_end || '',
        stripe_customer_id: sub.stripe_customer_id || '',
        stripe_subscription_id: sub.stripe_subscription_id || '',
        user_email: sub.user?.email || '',
        user_name: sub.user?.full_name || '',
        plan_name: sub.plan?.name || ''
      }));

      setSubscriptions(formattedSubscriptions);
    } catch (error) {
      console.error('Erro ao buscar assinaturas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === '' || sub.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Ativa', variant: 'default' as const },
      trialing: { label: 'Trial', variant: 'secondary' as const },
      canceled: { label: 'Cancelada', variant: 'destructive' as const },
      past_due: { label: 'Vencida', variant: 'destructive' as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { label: status, variant: 'outline' as const };
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === 'active').length,
    trial: subscriptions.filter(s => s.status === 'trialing').length,
    mrr: 15420.50 // Mock MRR
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-center">Carregando assinaturas...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Assinaturas</h1>
          <p className="text-muted-foreground">Gerencie todas as assinaturas da plataforma</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total de Assinaturas"
            value={stats.total}
            icon={Users}
          />
          <StatsCard
            title="Assinaturas Ativas"
            value={stats.active}
            icon={CreditCard}
          />
          <StatsCard
            title="Em Trial"
            value={stats.trial}
            icon={TrendingUp}
          />
          <StatsCard
            title="MRR"
            value={`R$ ${stats.mrr.toFixed(2)}`}
            icon={DollarSign}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Input
            placeholder="Buscar por email ou nome..."
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
              <SelectItem value="active">Ativa</SelectItem>
              <SelectItem value="trialing">Trial</SelectItem>
              <SelectItem value="canceled">Cancelada</SelectItem>
              <SelectItem value="past_due">Vencida</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Próxima Cobrança</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{subscription.user_name}</div>
                      <div className="text-sm text-muted-foreground">{subscription.user_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{subscription.plan_name}</TableCell>
                  <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                  <TableCell>{new Date(subscription.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {subscription.current_period_end 
                      ? new Date(subscription.current_period_end).toLocaleDateString()
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                        <DropdownMenuItem>Cancelar</DropdownMenuItem>
                        <DropdownMenuItem>Alterar Plano</DropdownMenuItem>
                        <DropdownMenuItem>Estender Trial</DropdownMenuItem>
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