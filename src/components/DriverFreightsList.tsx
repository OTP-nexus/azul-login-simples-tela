
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Calendar, Package, DollarSign, Search, Heart, Truck, RotateCcw, Combine } from 'lucide-react';
import FreightStatusBadge from './FreightStatusBadge';
import FreightDetailsModal from './FreightDetailsModal';
import { useActiveFreights } from '@/hooks/useActiveFreights';
import { useDriverFavorites } from '@/hooks/useDriverFavorites';

const DriverFreightsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedFreight, setSelectedFreight] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { freights, loading, error } = useActiveFreights();
  const { addFavorite, removeFavorite, isFavorite } = useDriverFavorites();

  const getFreightTypeConfig = (tipo: string) => {
    switch (tipo) {
      case 'agregamento':
        return {
          icon: Combine,
          label: 'Agregamento',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          iconColor: 'text-amber-600'
        };
      case 'frete_completo':
        return {
          icon: Truck,
          label: 'Frete Completo',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600'
        };
      case 'frete_de_retorno':
        return {
          icon: RotateCcw,
          label: 'Frete de Retorno',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600'
        };
      case 'comum':
        return {
          icon: Package,
          label: 'Frete Comum',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          iconColor: 'text-purple-600'
        };
      default:
        return {
          icon: Package,
          label: tipo,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600'
        };
    }
  };

  const filteredFreights = freights.filter(freight => {
    const matchesSearch = freight.codigo_agregamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         freight.origem_cidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         freight.origem_estado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         JSON.stringify(freight.destinos).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || freight.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleFavorite = async (freightId: string) => {
    if (isFavorite(freightId)) {
      await removeFavorite(freightId);
    } else {
      await addFavorite(freightId);
    }
  };

  const openDetailsModal = (freight: any) => {
    setSelectedFreight(freight);
    setIsModalOpen(true);
  };

  const formatValue = (value: number | null) => {
    if (!value) return 'Não definido';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Não definida';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getDestinationText = (destinos: any) => {
    if (!destinos || (Array.isArray(destinos) && destinos.length === 0)) {
      return 'Destino não definido';
    }
    
    if (Array.isArray(destinos) && destinos.length > 0) {
      const firstDestination = destinos[0];
      if (typeof firstDestination === 'string') {
        return firstDestination;
      }
      if (typeof firstDestination === 'object' && firstDestination !== null) {
        const cidade = firstDestination.cidade || firstDestination.city || '';
        const estado = firstDestination.estado || firstDestination.state || '';
        return cidade && estado ? `${cidade}, ${estado}` : 'Destino não definido';
      }
    }
    
    return 'Destino não definido';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Erro ao carregar fretes
          </h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

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
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
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
        {filteredFreights.map((freight) => {
          const typeConfig = getFreightTypeConfig(freight.tipo_frete);
          const TypeIcon = typeConfig.icon;
          

          return (
            <Card 
              key={freight.id} 
              className={`hover:shadow-md transition-all duration-200 ${typeConfig.bgColor} ${typeConfig.borderColor} border-2`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 bg-white rounded-md border ${typeConfig.borderColor}`}>
                        <TypeIcon className={`h-4 w-4 ${typeConfig.iconColor}`} />
                      </div>
                      <CardTitle className="text-lg">
                        {freight.codigo_agregamento || 'Código não gerado'}
                      </CardTitle>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {freight.origem_cidade}, {freight.origem_estado} → {getDestinationText(freight.destinos)}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(freight.id)}
                      className={isFavorite(freight.id) ? 'text-red-500' : 'text-gray-400'}
                    >
                      <Heart className={`h-4 w-4 ${isFavorite(freight.id) ? 'fill-current' : ''}`} />
                    </Button>
                    <FreightStatusBadge status={freight.status} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="text-sm min-w-0">
                      <div className="font-medium">Coleta</div>
                      <div className="text-gray-600 truncate">{formatDate(freight.data_coleta)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="text-sm min-w-0">
                      <div className="font-medium">Entrega</div>
                      <div className="text-gray-600 truncate">{formatDate(freight.data_entrega)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="text-sm min-w-0">
                      <div className="font-medium">Carga</div>
                      <div className="text-gray-600 truncate">{freight.tipo_mercadoria}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="text-sm min-w-0">
                      <div className="font-medium">Valor</div>
                      <div className="text-gray-600 truncate">{formatValue(freight.valor_carga)}</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="text-sm text-gray-600">
                    Peso: {freight.peso_carga ? `${freight.peso_carga.toLocaleString('pt-BR')} kg` : 'Não especificado'}
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    {freight.status === 'ativo' && (
                      <Button size="sm" className="flex-1 sm:flex-initial">
                        Aceitar Frete
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openDetailsModal(freight)}
                      className="flex-1 sm:flex-initial"
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
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

      {/* Modal de Detalhes */}
      <FreightDetailsModal
        freight={selectedFreight}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedFreight(null);
        }}
      />
    </div>
  );
};

export default DriverFreightsList;
