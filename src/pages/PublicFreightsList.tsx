
import React, { useState } from 'react';
import { usePublicFreights, PublicFreightFilters } from '@/hooks/usePublicFreights';
import PublicFreightCard from '@/components/PublicFreightCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Filter } from 'lucide-react';
import PublicFreightsFilter from '@/components/PublicFreightsFilter';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';


const PublicFreightsList = () => {
  const [filters, setFilters] = useState<PublicFreightFilters>({});
  const { freights, loading, error } = usePublicFreights(filters);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

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
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Fretes Disponíveis
        </h1>
        <p className="mt-4 text-lg leading-8 text-gray-600">
          Encontre o frete ideal para você. Filtre as oportunidades e conecte-se.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:w-80 xl:w-96 lg:sticky top-8 self-start">
          <PublicFreightsFilter onFilterChange={setFilters} initialFilters={filters} />
        </div>
        
        {/* Mobile Collapsible Filter */}
        <div className="lg:hidden px-4">
          <Collapsible
            open={isMobileFilterOpen}
            onOpenChange={setIsMobileFilterOpen}
            className="w-full space-y-2"
          >
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full flex justify-center items-center">
                <Filter className="mr-2 h-4 w-4" />
                {isMobileFilterOpen ? "Esconder Filtros" : "Mostrar Filtros"}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
               <PublicFreightsFilter onFilterChange={setFilters} initialFilters={filters} />
            </CollapsibleContent>
          </Collapsible>
        </div>


        <main className="flex-1 px-4 lg:px-0">
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
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
                <h3 className="text-xl font-semibold text-gray-700">Nenhum frete encontrado com os filtros aplicados</h3>
                <p className="text-gray-500 mt-2">Tente alterar ou limpar os filtros para ver mais oportunidades.</p>
            </div>
          )}

          {!loading && !error && freights.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
              {freights.map((freight) => (
                <PublicFreightCard key={freight.id} freight={freight} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PublicFreightsList;
