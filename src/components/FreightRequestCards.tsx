
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Package, RotateCcw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const FreightRequestCards = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCardClick = (freightType: string) => {
    console.log(`Clicked on ${freightType} freight`);
    
    if (freightType === 'AGREGAMENTO') {
      navigate('/freight-aggregation');
      return;
    }
    
    if (freightType === 'FRETE COMPLETO') {
      navigate('/freight-complete');
      return;
    }
    
    toast({
      title: "Em breve",
      description: `Funcionalidade "${freightType}" será implementada em breve!`,
    });
  };

  const handleBack = () => {
    navigate('/company-dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleBack}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Solicitar Frete</h1>
                <p className="text-sm text-gray-600">Escolha o tipo de frete</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tipos de Frete</h2>
          <p className="text-gray-600">Selecione o tipo de frete que melhor atende às suas necessidades</p>
        </div>

        {/* Freight Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Agregamento Card */}
          <Card 
            className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 group"
            onClick={() => handleCardClick('AGREGAMENTO')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow mb-4">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-blue-800">
                AGREGAMENTO
              </CardTitle>
              <CardDescription className="text-blue-600">
                Fretes para motoristas agregados
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-blue-700 mb-4">
                Ideal para transportadores que possuem motoristas agregados e precisam de cargas regulares
              </p>
              <div className="bg-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800 font-medium">
                  Clique para solicitar
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Frete Completo Card */}
          <Card 
            className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-br from-green-50 to-green-100 border-green-200 group"
            onClick={() => handleCardClick('FRETE COMPLETO')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow mb-4">
                <Package className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-green-800">
                FRETE COMPLETO
              </CardTitle>
              <CardDescription className="text-green-600">
                Carga completa para um destino
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-green-700 mb-4">
                Para cargas que ocupam toda a capacidade do veículo, com destino único
              </p>
              <div className="bg-green-200 rounded-lg p-3">
                <p className="text-xs text-green-800 font-medium">
                  Clique para solicitar
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Frete de Retorno Card */}
          <Card 
            className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 group"
            onClick={() => handleCardClick('FRETE DE RETORNO')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow mb-4">
                <RotateCcw className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-amber-800">
                FRETE DE RETORNO
              </CardTitle>
              <CardDescription className="text-amber-600">
                Aproveitar viagens de volta
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-amber-700 mb-4">
                Para otimizar custos aproveitando o retorno de veículos que já fizeram uma entrega
              </p>
              <div className="bg-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800 font-medium">
                  Clique para solicitar
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <div className="mt-8">
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">i</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Informações sobre os tipos de frete</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li><strong>Agregamento:</strong> Para empresas que trabalham com motoristas agregados</li>
                    <li><strong>Frete Completo:</strong> Carga que ocupa toda a capacidade do veículo</li>
                    <li><strong>Frete de Retorno:</strong> Otimiza custos aproveitando viagens de volta</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default FreightRequestCards;
