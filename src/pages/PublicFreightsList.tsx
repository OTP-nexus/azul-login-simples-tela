import React, { useState } from 'react';
import { useSimplePublicFreights, SimpleFreightFilters } from '@/hooks/useSimplePublicFreights';
import PublicFreightCard from '@/components/PublicFreightCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Filter, LayoutGrid, List } from 'lucide-react';
import SimpleFreightFiltersComponent from '@/components/SimpleFreightFilters';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const PublicFreightsList = () => {
  const [filters, setFilters] = useState<SimpleFreightFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const { freights, loading, error, pagination } = useSimplePublicFreights(filters, currentPage, 20);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const handleFilterChange = (newFilters: SimpleFreightFilters) => {
    console.log('🔍 [PublicFreightsList] Filtros aplicados pelo usuário:', newFilters);
    console.log('🔍 [PublicFreightsList] Filtros anteriores:', filters);
    console.log('🔍 [PublicFreightsList] Mudança detectada:', JSON.stringify(newFilters) !== JSON.stringify(filters));
    
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    
    console.log('🔍 [PublicFreightsList] Estado atualizado - Nova página:', 1);
    console.log('🔍 [PublicFreightsList] Estado atualizado - Novos filtros:', newFilters);
  };

  const handlePageChange = (page: number) => {
    console.log('📄 [PublicFreightsList] Mudança de página solicitada:', page);
    console.log('📄 [PublicFreightsList] Página atual:', currentPage);
    
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    console.log('📄 [PublicFreightsList] Página atualizada para:', page);
  };

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

  const renderPaginationItems = () => {
    const items = [];
    const { currentPage, totalPages } = pagination;
    
    // Always show first page
    if (totalPages > 0) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => handlePageChange(1)}
            isActive={currentPage === 1}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Show pages around current page
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Always show last page if there's more than 1 page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => handlePageChange(totalPages)}
            isActive={currentPage === totalPages}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  // Log current state for debugging
  console.log('🖥️ [PublicFreightsList] Estado atual do componente:', {
    filters,
    currentPage,
    loading,
    error,
    freightsCount: freights.length,
    pagination
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Fretes Disponíveis
        </h1>
        <p className="mt-2 text-lg leading-6 text-gray-600">
          Encontre o frete ideal para você. Use os filtros simples para refinar sua busca.
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 px-4 lg:px-6">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:w-80 xl:w-96 lg:flex-shrink-0">
          <div className="sticky top-6">
            <SimpleFreightFiltersComponent onFilterChange={handleFilterChange} initialFilters={filters} />
          </div>
        </div>
        
        {/* Mobile Collapsible Filter */}
        <div className="lg:hidden">
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
               <SimpleFreightFiltersComponent onFilterChange={handleFilterChange} initialFilters={filters} />
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-h-0">
          {/* Controls and Results Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="text-sm text-gray-600">
              {!loading && (
                <>
                  Mostrando {freights.length} de {pagination.totalItems} fretes
                  {pagination.totalPages > 1 && (
                    <span className="ml-2">
                      (Página {pagination.currentPage} de {pagination.totalPages})
                    </span>
                  )}
                </>
              )}
            </div>
            
            <ToggleGroup 
              type="single" 
              value={viewMode} 
              onValueChange={(value) => {
                if (value) setViewMode(value as 'grid' | 'list');
              }} 
              aria-label="Modo de visualização"
              className="flex-shrink-0"
            >
              <ToggleGroupItem value="grid" aria-label="Visualização em grade">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="Visualização em lista">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col">
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
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
              <div className="flex-1 flex items-center justify-center py-12">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-700">
                    Nenhum frete encontrado
                  </h3>
                  <p className="text-gray-500 mt-2">
                    Tente alterar os filtros para ver mais oportunidades.
                  </p>
                </div>
              </div>
            )}

            {!loading && !error && freights.length > 0 && (
              <>
                <div className={`flex-1 ${viewMode === 'grid'
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4"
                    : "flex flex-col gap-3"
                }`}>
                  {freights.map((freight) => (
                    <PublicFreightCard key={freight.id} freight={freight} view={viewMode} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-6 pb-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => handlePageChange(Math.max(1, pagination.currentPage - 1))}
                            className={`cursor-pointer ${pagination.currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
                          />
                        </PaginationItem>
                        
                        {renderPaginationItems()}
                        
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                            className={`cursor-pointer ${pagination.currentPage === pagination.totalPages ? 'pointer-events-none opacity-50' : ''}`}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PublicFreightsList;
