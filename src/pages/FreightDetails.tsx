
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useFreightByCode } from '@/hooks/useFreightByCode';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

import FreightHeader from '@/components/freight-details/FreightHeader';
import FreightRoute from '@/components/freight-details/FreightRoute';
import FreightCargoInfo from '@/components/freight-details/FreightCargoInfo';
import FreightVehicleInfo from '@/components/freight-details/FreightVehicleInfo';
import FreightRequirements from '@/components/freight-details/FreightRequirements';
import FreightContact from '@/components/freight-details/FreightContact';

const FreightDetails = () => {
  const { freightCode } = useParams<{ freightCode: string }>();
  
  if (!freightCode) {
    return <Navigate to="/lista-fretes" replace />;
  }

  const { freight, loading, error } = useFreightByCode(freightCode);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !freight) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-6">
            <Link to="/lista-fretes">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Lista
              </Button>
            </Link>
            
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>
                {error || 'Frete não encontrado. Verifique se o código está correto.'}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="space-y-6">
          {/* Navegação */}
          <div className="flex items-center justify-between">
            <Link to="/lista-fretes">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Lista
              </Button>
            </Link>
            
            <Button className="bg-blue-600 hover:bg-blue-700">
              Tenho Interesse
            </Button>
          </div>

          {/* Header do Frete */}
          <FreightHeader freight={freight} />

          {/* Grid de Informações */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <FreightRoute freight={freight} />
              <FreightVehicleInfo freight={freight} />
              <FreightRequirements freight={freight} />
            </div>
            
            <div className="space-y-6">
              <FreightCargoInfo freight={freight} />
              <FreightContact freight={freight} />
            </div>
          </div>

          {/* Botão de Interesse Mobile */}
          <div className="lg:hidden">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Tenho Interesse
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreightDetails;
