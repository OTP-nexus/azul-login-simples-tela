import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Search, Truck, MapPin, Eye, MoreHorizontal } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Freight {
  id: string;
  origem_cidade: string;
  origem_estado: string;
  destino_cidade?: string;
  destino_estado?: string;
  tipo_frete: string;
  tipo_mercadoria: string;
  status: string;
  created_at: string;
  peso_carga?: number;
  valor_carga?: number;
  companies?: {
    company_name: string;
  };
}

const AdminFreights = () => {
  const [freights, setFreights] = useState<Freight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchFreights();
  }, []);

  const fetchFreights = async () => {
    try {
      const { data, error } = await supabase
        .from('fretes')
        .select(`
          *,
          companies (
            company_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFreights(data || []);
    } catch (error) {
      console.error('Erro ao buscar fretes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFreights = freights.filter(freight => {
    const matchesSearch = 
      freight.origem_cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freight.destino_cidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freight.tipo_mercadoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freight.companies?.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || freight.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: { label: 'Ativo', variant: 'default' as const },
      concluido: { label: 'Concluído', variant: 'secondary' as const },
      cancelado: { label: 'Cancelado', variant: 'destructive' as const },
      pausado: { label: 'Pausado', variant: 'outline' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ativo;

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const getFreightTypeBadge = (type: string) => {
    const typeConfig = {
      agregamento: { label: 'Agregamento', variant: 'default' as const },
      comum: { label: 'Comum', variant: 'secondary' as const }
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.comum;

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-center">Carregando fretes...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Gerenciamento de Fretes</h1>
          <p className="text-muted-foreground">Gerencie e modere todos os fretes da plataforma</p>
        </div>

        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{freights.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
              <Truck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {freights.filter(f => f.status === 'ativo').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
              <Truck className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {freights.filter(f => f.status === 'concluido').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
              <Truck className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {freights.filter(f => f.status === 'cancelado').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por cidade, empresa ou tipo de mercadoria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">Todos os status</option>
                <option value="ativo">Ativos</option>
                <option value="concluido">Concluídos</option>
                <option value="cancelado">Cancelados</option>
                <option value="pausado">Pausados</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Fretes */}
        <Card>
          <CardHeader>
            <CardTitle>Fretes ({filteredFreights.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Rota</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Mercadoria</TableHead>
                  <TableHead>Peso</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFreights.map((freight) => (
                  <TableRow key={freight.id}>
                    <TableCell className="font-medium">
                      {freight.companies?.company_name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        {freight.origem_cidade}/{freight.origem_estado}
                        {freight.destino_cidade && (
                          <span> → {freight.destino_cidade}/{freight.destino_estado}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getFreightTypeBadge(freight.tipo_frete)}</TableCell>
                    <TableCell>{freight.tipo_mercadoria}</TableCell>
                    <TableCell>
                      {freight.peso_carga ? `${freight.peso_carga}kg` : 'N/A'}
                    </TableCell>
                    <TableCell>{formatCurrency(freight.valor_carga)}</TableCell>
                    <TableCell>{getStatusBadge(freight.status)}</TableCell>
                    <TableCell>
                      {new Date(freight.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem>Pausar frete</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Remover frete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminFreights;