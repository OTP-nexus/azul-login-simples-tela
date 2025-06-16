
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Calendar, Truck, Package, DollarSign } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useFreightByCode } from '@/hooks/useFreightByCode';
import FreightTypeBadge from '@/components/FreightTypeBadge';

const FreightDetails = () => {
  const { freightCode } = useParams<{ freightCode: string }>();
  const navigate = useNavigate();
  const { freight, isLoading, error } = useFreightByCode(freightCode);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !freight) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Frete não encontrado</h1>
          <p className="text-gray-600 mb-6">O código do frete informado não foi encontrado.</p>
          <Button onClick={() => navigate('/lista-fretes')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para lista
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'Não definida';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatValue = (value: number | null) => {
    if (!value) return 'Não definido';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {freight.codigo_agregamento}
            </h1>
            <p className="text-gray-600">Detalhes do frete</p>
          </div>
          <FreightTypeBadge type={freight.tipo_frete} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Informações Básicas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Tipo de Mercadoria</p>
              <p className="font-medium">{freight.tipo_mercadoria}</p>
            </div>
            {freight.peso_carga && (
              <div>
                <p className="text-sm text-gray-500">Peso da Carga</p>
                <p className="font-medium">{freight.peso_carga} kg</p>
              </div>
            )}
            {freight.valor_carga && (
              <div>
                <p className="text-sm text-gray-500">Valor da Carga</p>
                <p className="font-medium text-green-600">{formatValue(freight.valor_carga)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Origem e Destino */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Origem e Destino</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Origem</p>
              <p className="font-medium text-blue-700">{freight.origem_cidade}, {freight.origem_estado}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Destino</p>
              {freight.destinos && freight.destinos.length > 0 ? (
                <div className="space-y-1">
                  {freight.destinos.map((destino: any, index: number) => (
                    <p key={index} className="font-medium text-green-700">
                      {destino.cidade || destino.city}, {destino.estado || destino.state}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="font-medium text-green-700">
                  {freight.destino_cidade}, {freight.destino_estado}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Datas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Cronograma</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Data de Coleta</p>
              <p className="font-medium">{formatDate(freight.data_coleta)}</p>
            </div>
            {freight.data_entrega && (
              <div>
                <p className="text-sm text-gray-500">Data de Entrega</p>
                <p className="font-medium">{formatDate(freight.data_entrega)}</p>
              </div>
            )}
            {freight.horario_carregamento && (
              <div>
                <p className="text-sm text-gray-500">Horário de Carregamento</p>
                <p className="font-medium">{freight.horario_carregamento}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Veículos */}
        {freight.tipos_veiculos && freight.tipos_veiculos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Truck className="w-5 h-5" />
                <span>Veículos Compatíveis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {freight.tipos_veiculos.map((tipo: any, index: number) => (
                  <Badge key={index} variant="secondary">
                    {typeof tipo === 'string' ? tipo : tipo.label || tipo.type || 'Veículo'}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Observações */}
        {freight.observacoes && (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{freight.observacoes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Botão de Interesse */}
      <div className="mt-8 text-center">
        <Button 
          size="lg" 
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          onClick={() => navigate('/login')}
        >
          Tenho Interesse neste Frete
        </Button>
      </div>
    </div>
  );
};

export default FreightDetails;
