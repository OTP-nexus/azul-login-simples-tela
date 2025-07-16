
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Calendar, Package, DollarSign, Trash2 } from 'lucide-react';
import { useDriverFavorites } from '@/hooks/useDriverFavorites';
import FreightStatusBadge from './FreightStatusBadge';

const DriverFavorites = () => {
  const { favorites, loading, error, removeFavorite } = useDriverFavorites();

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

  const handleRemoveFavorite = async (freightId: string) => {
    await removeFavorite(freightId);
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
          <Heart className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Erro ao carregar favoritos
          </h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Fretes Favoritos</h2>
          <p className="text-gray-600">Gerencie seus fretes salvos para acompanhamento rápido</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {favorites.length} favorito(s)
        </Badge>
      </div>

      {favorites.length > 0 ? (
        <div className="grid gap-4">
          {favorites.map((favorite) => (
            <Card key={favorite.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500 fill-current" />
                      {favorite.freight.codigo_agregamento}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {favorite.freight.origem_cidade}, {favorite.freight.origem_estado} → {getDestinationText(favorite.freight.destinos)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <FreightStatusBadge status={favorite.freight.status} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div className="text-sm">
                      <div className="font-medium">Coleta</div>
                      <div className="text-gray-600">{formatDate(favorite.freight.data_coleta)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div className="text-sm">
                      <div className="font-medium">Entrega</div>
                      <div className="text-gray-600">{formatDate(favorite.freight.data_entrega)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <div className="text-sm">
                      <div className="font-medium">Carga</div>
                      <div className="text-gray-600">{favorite.freight.tipo_mercadoria}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <div className="text-sm">
                      <div className="font-medium">Valor</div>
                      <div className="text-gray-600">{formatValue(favorite.freight.valor_carga)}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t">
                  <div className="text-sm text-gray-500">
                    Salvo em {new Date(favorite.created_at).toLocaleDateString('pt-BR')} às {new Date(favorite.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex gap-2">
                    {favorite.freight.status === 'ativo' && (
                      <Button size="sm">
                        Aceitar Frete
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleRemoveFavorite(favorite.freight_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum frete favorito
          </h3>
          <p className="text-gray-600 mb-6">
            Você ainda não salvou nenhum frete como favorito. Use o ícone de coração nos fretes para salvá-los aqui.
          </p>
          <Button variant="outline">
            Buscar Fretes
          </Button>
        </div>
      )}
    </div>
  );
};

export default DriverFavorites;
