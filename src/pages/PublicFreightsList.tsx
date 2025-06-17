
import React, { useState } from 'react';
import { usePublicFreights, PublicFreightFilters } from '@/hooks/usePublicFreights';
import FreightFilters from '@/components/PublicFreights/FreightFilters';
import FreightListHeader from '@/components/PublicFreights/FreightListHeader';
import FreightListContent from '@/components/PublicFreights/FreightListContent';
import FreightPagination from '@/components/PublicFreights/FreightPagination';

const PublicFreightsList = () => {
  const [filters, setFilters] = useState<PublicFreightFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  const { freights, loading, error, pagination } = usePublicFreights(filters, currentPage, 20);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (newFilters: PublicFreightFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Fretes Disponíveis
        </h1>
        <p className="mt-2 text-lg leading-6 text-gray-600">
          Encontre o frete ideal para você. Filtre as oportunidades e conecte-se.
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 px-4 lg:px-6">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:w-80 xl:w-96 lg:flex-shrink-0">
          <div className="sticky top-6">
            <FreightFilters
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>
        </div>
        
        {/* Mobile Collapsible Filter */}
        <div className="lg:hidden">
          <FreightFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            isCollapsible={true}
          />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-h-0">
          <FreightListHeader
            freightsCount={freights.length}
            pagination={pagination}
            loading={loading}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          <div className="flex-1 flex flex-col">
            <FreightListContent
              freights={freights}
              loading={loading}
              error={error}
              viewMode={viewMode}
            />

            <FreightPagination
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PublicFreightsList;
