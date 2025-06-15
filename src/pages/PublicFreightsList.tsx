
import React from 'react';
import { usePublicFreights } from '@/hooks/usePublicFreights';
import PublicFreightCard from '@/components/PublicFreightCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

const PublicFreightsList = () => {
  const { freights, loading, error } = usePublicFreights();

  const renderSkeletons = () => {
    return Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="flex flex-col space-y-3">
        <Skeleton className="h-[250px] w-full rounded-xl" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Fretes Disponíveis
        </h1>
        <p className="mt-4 text-lg leading-8 text-gray-600">
          Encontre o frete ideal para você. Veja as oportunidades abertas e conecte-se.
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderSkeletons()}
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && freights.length === 0 && (
        <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-700">Nenhum frete disponível no momento</h3>
            <p className="text-gray-500 mt-2">Por favor, volte mais tarde para novas oportunidades.</p>
        </div>
      )}

      {!loading && !error && freights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {freights.map((freight) => (
            <PublicFreightCard key={freight.id} freight={freight} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicFreightsList;
