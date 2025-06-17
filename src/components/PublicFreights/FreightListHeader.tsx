
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { LayoutGrid, List } from 'lucide-react';
import { PaginationInfo } from '@/hooks/usePublicFreights';

interface FreightListHeaderProps {
  freightsCount: number;
  pagination: PaginationInfo;
  loading: boolean;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

const FreightListHeader: React.FC<FreightListHeaderProps> = ({
  freightsCount,
  pagination,
  loading,
  viewMode,
  onViewModeChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
      <div className="text-sm text-gray-600">
        {!loading && (
          <>
            Mostrando {freightsCount} de {pagination.totalItems} fretes
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
          if (value) onViewModeChange(value as 'grid' | 'list');
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
  );
};

export default FreightListHeader;
