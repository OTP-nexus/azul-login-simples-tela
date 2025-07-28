import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { StatsCard } from '@/components/ui/stats-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CreditCard, DollarSign, AlertCircle, CheckCircle, MoreHorizontal, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Payment {
  id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  stripe_payment_intent_id: string;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      // Buscar pagamentos reais com JOIN para dados do usuário (usando 'as any' para contornar limitações do schema)
      const { data: paymentsData, error } = await supabase
        .from('payments' as any)
        .select(`
          *,
          subscription:subscriptions(
            user_id,
            user:profiles(email, full_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar pagamentos:', error);
        setPayments([]);
        return;
      }

      // Mapear dados para o formato esperado
      const formattedPayments: Payment[] = (paymentsData || []).map((payment: any) => ({
        id: payment.id,
        subscription_id: payment.subscription_id || '',
        amount: payment.amount,
        currency: payment.currency || 'BRL',
        status: payment.status,
        payment_method: payment.payment_method || 'card',
        stripe_payment_intent_id: payment.stripe_payment_intent_id || '',
        created_at: payment.created_at,
        user_email: payment.subscription?.user?.email || '',
        user_name: payment.subscription?.user?.full_name || ''
      }));

      setPayments(formattedPayments);
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.stripe_payment_intent_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === '' || payment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      succeeded: { label: 'Sucesso', variant: 'default' as const, icon: CheckCircle },
      pending: { label: 'Pendente', variant: 'secondary' as const, icon: RefreshCw },
      failed: { label: 'Falhou', variant: 'destructive' as const, icon: AlertCircle },
      canceled: { label: 'Cancelado', variant: 'outline' as const, icon: AlertCircle },
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

  const getPaymentMethodBadge = (method: string) => {
    const methodConfig = {
      card: 'Cartão',
      boleto: 'Boleto',
      pix: 'PIX',
      bank_transfer: 'Transferência'
    };
    
    return (
      <Badge variant="outline">
        {methodConfig[method as keyof typeof methodConfig] || method}
      </Badge>
    );
  };

  const stats = {
    totalRevenue: payments.reduce((sum, p) => sum + (p.status === 'succeeded' ? p.amount : 0), 0),
    totalPayments: payments.length,
    successfulPayments: payments.filter(p => p.status === 'succeeded').length,
    failedPayments: payments.filter(p => p.status === 'failed').length,
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-center">Carregando pagamentos...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Pagamentos</h1>
            <p className="text-muted-foreground">Controle de transações e pagamentos</p>
          </div>
          <Button onClick={fetchPayments}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Receita Total"
            value={`R$ ${(stats.totalRevenue / 100).toFixed(2)}`}
            icon={DollarSign}
          />
          <StatsCard
            title="Total de Transações"
            value={stats.totalPayments}
            icon={CreditCard}
          />
          <StatsCard
            title="Pagamentos Bem-sucedidos"
            value={stats.successfulPayments}
            icon={CheckCircle}
          />
          <StatsCard
            title="Pagamentos Falhados"
            value={stats.failedPayments}
            icon={AlertCircle}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Input
            placeholder="Buscar por email ou ID..."
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
              <SelectItem value="succeeded">Sucesso</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="failed">Falhou</SelectItem>
              <SelectItem value="canceled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID da Transação</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono text-sm">
                    {payment.stripe_payment_intent_id?.slice(0, 20)}...
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{payment.user_name}</div>
                      <div className="text-sm text-muted-foreground">{payment.user_email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    R$ {(payment.amount / 100).toFixed(2)}
                  </TableCell>
                  <TableCell>{getPaymentMethodBadge(payment.payment_method || 'card')}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                        <DropdownMenuItem>Ver no Stripe</DropdownMenuItem>
                        <DropdownMenuItem>Reembolsar</DropdownMenuItem>
                        <DropdownMenuItem>Exportar</DropdownMenuItem>
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