
import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useFreightByCode } from '@/hooks/useFreightByCode';

const FreightDetails = () => {
  const { freightCode } = useParams<{ freightCode: string }>();
  const navigate = useNavigate();
  const { data: freight, isLoading, error } = useFreightByCode(freightCode);

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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {freight.codigo_agregamento}
        </h1>
        <p className="text-gray-600">Detalhes do frete</p>
      </div>

      <div className="space-y-4 text-lg leading-relaxed">
        <div>
          <span className="font-semibold text-gray-700">Tipo de Frete:</span>{' '}
          <span className="text-gray-900">
            {freight.tipo_frete === 'agregamento' && 'Agregamento'}
            {freight.tipo_frete === 'frete_completo' && 'Frete Completo'}
            {freight.tipo_frete === 'frete_de_retorno' && 'Frete de Retorno'}
            {freight.tipo_frete === 'comum' && 'Comum'}
          </span>
        </div>

        <div>
          <span className="font-semibold text-gray-700">Origem:</span>{' '}
          <span className="text-gray-900">{freight.origem_cidade}, {freight.origem_estado}</span>
        </div>

        <div>
          <span className="font-semibold text-gray-700">Destino:</span>{' '}
          <span className="text-gray-900">
            {freight.destinos && freight.destinos.length > 0 ? (
              freight.destinos.map((destino: any, index: number) => (
                <span key={index}>
                  {destino.cidade || destino.city}, {destino.estado || destino.state}
                  {index < freight.destinos.length - 1 && ' | '}
                </span>
              ))
            ) : (
              `${freight.destino_cidade}, ${freight.destino_estado}`
            )}
          </span>
        </div>

        <div>
          <span className="font-semibold text-gray-700">Tipo de Mercadoria:</span>{' '}
          <span className="text-gray-900">{freight.tipo_mercadoria}</span>
        </div>

        {freight.peso_carga && (
          <div>
            <span className="font-semibold text-gray-700">Peso da Carga:</span>{' '}
            <span className="text-gray-900">{freight.peso_carga} kg</span>
          </div>
        )}

        {freight.valor_carga && (
          <div>
            <span className="font-semibold text-gray-700">Valor da Carga:</span>{' '}
            <span className="text-green-600 font-medium">{formatValue(freight.valor_carga)}</span>
          </div>
        )}

        <div>
          <span className="font-semibold text-gray-700">Data de Coleta:</span>{' '}
          <span className="text-gray-900">{formatDate(freight.data_coleta)}</span>
        </div>

        {freight.data_entrega && (
          <div>
            <span className="font-semibold text-gray-700">Data de Entrega:</span>{' '}
            <span className="text-gray-900">{formatDate(freight.data_entrega)}</span>
          </div>
        )}

        {freight.horario_carregamento && (
          <div>
            <span className="font-semibold text-gray-700">Horário de Carregamento:</span>{' '}
            <span className="text-gray-900">{freight.horario_carregamento}</span>
          </div>
        )}

        {freight.tipos_veiculos && freight.tipos_veiculos.length > 0 && (
          <div>
            <span className="font-semibold text-gray-700">Veículos Compatíveis:</span>{' '}
            <span className="text-gray-900">
              {freight.tipos_veiculos.map((tipo: any, index: number) => (
                <span key={index}>
                  {typeof tipo === 'string' ? tipo : tipo.label || tipo.type || 'Veículo'}
                  {index < freight.tipos_veiculos.length - 1 && ', '}
                </span>
              ))}
            </span>
          </div>
        )}

        {freight.tipos_carrocerias && freight.tipos_carrocerias.length > 0 && (
          <div>
            <span className="font-semibold text-gray-700">Tipos de Carroceria:</span>{' '}
            <span className="text-gray-900">
              {freight.tipos_carrocerias.map((tipo: any, index: number) => (
                <span key={index}>
                  {typeof tipo === 'string' ? tipo : tipo.label || tipo.type || 'Carroceria'}
                  {index < freight.tipos_carrocerias.length - 1 && ', '}
                </span>
              ))}
            </span>
          </div>
        )}

        {freight.observacoes && (
          <div>
            <span className="font-semibold text-gray-700">Observações:</span>{' '}
            <span className="text-gray-900">{freight.observacoes}</span>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <Button 
          size="lg" 
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          onClick={() => navigate('/login')}
        >
          Tenho Interesse neste Frete
        </Button>
      </div>
    </div>
  );
};

export default FreightDetails;
