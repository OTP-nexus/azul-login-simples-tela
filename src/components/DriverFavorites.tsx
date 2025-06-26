
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Calendar, Package, DollarSign, Trash2 } from 'lucide-react';

const DriverFavorites = () => {
  // Mock data - será substituído por dados reais do Supabase
  const favoriteFreights = [
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
      savedAt: '2025-01-10T10:30:00'
    },
    {
      id: '4',
      code: 'FRT-GH45I67JK8',
      origin: 'Fortaleza, CE',
      destination: 'Recife, PE',
      pickupDate: '2025-01-25',
      deliveryDate: '2025-01-26',
      cargo: 'Roupas',
      weight: 800,
      value: 1500,
      status: 'disponivel',
      savedAt: '2025-01-12T14:20:00'
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Fretes Favoritos</h2>
          <p className="text-gray-600">Gerencie seus fretes salvos para acompanhamento rápido</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {favoriteFreights.length} favorito(s)
        </Badge>
      </div>

      {favoriteFreights.length > 0 ? (
        <div className="grid gap-4">
          {favoriteFreights.map((freight) => (
            <Card key={freight.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500 fill-current" />
                      {freight.code}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {freight.origin} → {freight.destination}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
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
                
                <div className="flex justify-between items-center pt-3 border-t">
                  <div className="text-sm text-gray-500">
                    Salvo em {new Date(freight.savedAt).toLocaleDateString('pt-BR')} às {new Date(freight.savedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
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
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
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
