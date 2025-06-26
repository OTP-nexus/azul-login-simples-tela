
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Calendar, Package, DollarSign, Search, Filter, Heart } from 'lucide-react';

const DriverFreightsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data - será substituído por dados reais do Supabase
  const freights = [
    {
      id: '1',
      code: 'FRT-AB12C34DE5',
      origin: 'São Paulo, SP',
      destination: 'Rio de Janeiro, RJ',
      pickupDate: '2025-01-15',
      deliveryDate: '2025-01-16',
      cargo: 'Eletrônicos',
      weight: 1500,
      value: 2500,
      status: 'disponivel',
      isFavorite: false
    },
    {
      id: '2',
      code: 'AGR-CD23E45FG6',
      origin: 'Belo Horizonte, MG',
      destination: 'Salvador, BA',
      pickupDate: '2025-01-20',
      deliveryDate: '2025-01-22',
      cargo: 'Alimentos',
      weight: 2000,
      value: 3200,
      status: 'aceito',
      isFavorite: true
    },
    {
      id: '3',
      code: 'FRR-EF34G56HI7',
      origin: 'Curitiba, PR',
      destination: 'Porto Alegre, RS',
      pickupDate: '2025-01-18',
      deliveryDate: '2025-01-19',
      cargo: 'Móveis',
      weight: 3000,
      value: 1800,
      status: 'em_andamento',
      isFavorite: false
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      disponivel: { label: 'Disponível', variant: 'default' as const },
      aceito: { label: 'Aceito', variant: 'secondary' as const },
      em_andamento: { label: 'Em Andamento', variant: 'outline' as const },
      concluido: { label: 'Concluído', variant: 'secondary' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.disponivel;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredFreights = freights.filter(freight => {
    const matchesSearch = freight.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         freight.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         freight.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || freight.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por código, origem ou destino..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="disponivel">Disponível</SelectItem>
            <SelectItem value="aceito">Aceito</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      <div className="text-sm text-gray-600 mb-4">
        Mostrando {filteredFreights.length} frete(s)
      </div>

      {/* Freights List */}
      <div className="grid gap-4">
        {filteredFreights.map((freight) => (
          <Card key={freight.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{freight.code}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {freight.origin} → {freight.destination}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={freight.isFavorite ? 'text-red-500' : 'text-gray-400'}
                  >
                    <Heart className={`h-4 w-4 ${freight.isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                  {getStatusBadge(freight.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div className="text-sm">
                    <div className="font-medium">Coleta</div>
                    <div className="text-gray-600">{new Date(freight.pickupDate).toLocaleDateString('pt-BR')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div className="text-sm">
                    <div className="font-medium">Entrega</div>
                    <div className="text-gray-600">{new Date(freight.deliveryDate).toLocaleDateString('pt-BR')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-400" />
                  <div className="text-sm">
                    <div className="font-medium">Carga</div>
                    <div className="text-gray-600">{freight.cargo}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <div className="text-sm">
                    <div className="font-medium">Valor</div>
                    <div className="text-gray-600">R$ {freight.value.toLocaleString('pt-BR')}</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Peso: {freight.weight.toLocaleString('pt-BR')} kg
                </div>
                <div className="flex gap-2">
                  {freight.status === 'disponivel' && (
                    <Button size="sm">
                      Aceitar Frete
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFreights.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum frete encontrado
          </h3>
          <p className="text-gray-600">
            Tente ajustar os filtros ou aguarde novos fretes disponíveis.
          </p>
        </div>
      )}
    </div>
  );
};

export default DriverFreightsList;
