
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, X, Search } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { PublicFreightFilters } from '@/hooks/usePublicFreights';

interface FreightFiltersProps {
  filters: PublicFreightFilters;
  onFilterChange: (filters: PublicFreightFilters) => void;
  isCollapsible?: boolean;
}

const FreightFilters: React.FC<FreightFiltersProps> = ({ 
  filters, 
  onFilterChange, 
  isCollapsible = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof PublicFreightFilters, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value && (Array.isArray(value) ? value.length > 0 : true)
  ).length;

  const FilterContent = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Filtros</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">{activeFiltersCount} ativos</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Busca por origem */}
        <div>
          <label className="text-sm font-medium mb-2 block">Origem</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Cidade ou estado de origem"
              value={filters.origin || ''}
              onChange={(e) => handleFilterChange('origin', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Busca por destino */}
        <div>
          <label className="text-sm font-medium mb-2 block">Destino</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Cidade ou estado de destino"
              value={filters.destination || ''}
              onChange={(e) => handleFilterChange('destination', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tipo de frete */}
        <div>
          <label className="text-sm font-medium mb-2 block">Tipo de Frete</label>
          <Select
            value={filters.freightType || ''}
            onValueChange={(value) => handleFilterChange('freightType', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="agregamento">Agregamento</SelectItem>
              <SelectItem value="frete_completo">Frete Completo</SelectItem>
              <SelectItem value="frete_de_retorno">Frete de Retorno</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rastreador */}
        <div>
          <label className="text-sm font-medium mb-2 block">Rastreador</label>
          <Select
            value={filters.tracker || ''}
            onValueChange={(value) => handleFilterChange('tracker', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="sim">Necessário</SelectItem>
              <SelectItem value="nao">Não necessário</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2 pt-4">
          <Button onClick={clearFilters} variant="outline" className="flex-1">
            <X className="w-4 h-4 mr-2" />
            Limpar
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isCollapsible) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full flex justify-center items-center">
            <Filter className="mr-2 h-4 w-4" />
            {isOpen ? "Esconder Filtros" : "Mostrar Filtros"}
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">{activeFiltersCount}</Badge>
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-4">
            <FilterContent />
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return <FilterContent />;
};

export default FreightFilters;
