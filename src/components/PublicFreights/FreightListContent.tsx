
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import PublicFreightCard from '@/components/PublicFreightCard';
import { Freight } from '@/hooks/usePublicFreights';

interface FreightListContentProps {
  freights: Freight[];
  loading: boolean;
  error: string | null;
  viewMode: 'grid' | 'list';
}

const FreightListContent: React.FC<FreightListContentProps> = ({
  freights,
  loading,
  error,
  viewMode
}) => {
  const renderSkeletons = () => {
    return Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="flex flex-col space-y-3">
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
        {renderSkeletons()}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (freights.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-700">
            Nenhum frete encontrado com os filtros aplicados
          </h3>
          <p className="text-gray-500 mt-2">
            Tente alterar ou limpar os filtros para ver mais oportunidades.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 ${viewMode === 'grid'
        ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4"
        : "flex flex-col gap-3"
    }`}>
      {freights.map((freight) => (
        <PublicFreightCard key={freight.id} freight={freight} view={viewMode} />
      ))}
    </div>
  );
};

export default FreightListContent;
