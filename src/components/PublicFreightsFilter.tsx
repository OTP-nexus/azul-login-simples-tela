
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { vehicleTypes, bodyTypes, freightTypes } from '@/lib/freightOptions';
import { Filter, X } from 'lucide-react';

const filterSchema = z.object({
  origin: z.string().optional(),
  destination: z.string().optional(),
  vehicleType: z.string().optional(),
  bodyType: z.string().optional(),
  freightType: z.string().optional(),
});

type FilterFormValues = z.infer<typeof filterSchema>;

interface PublicFreightsFilterProps {
  onFilterChange: (filters: Partial<FilterFormValues>) => void;
  initialFilters: Partial<FilterFormValues>;
}

const PublicFreightsFilter = ({ onFilterChange, initialFilters }: PublicFreightsFilterProps) => {
  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: initialFilters,
  });

  const onSubmit = (values: FilterFormValues) => {
    const cleanFilters = Object.fromEntries(
      Object.entries(values).filter(([, v]) => v != null && v !== '')
    );
    onFilterChange(cleanFilters);
  };

  const handleClear = () => {
    form.reset({
      origin: '',
      destination: '',
      vehicleType: '',
      bodyType: '',
      freightType: '',
    });
    onFilterChange({});
  };

  const createSelectField = (name: keyof FilterFormValues, label: string, options: { value: string; label: string }[]) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || ""}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {options.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );

  return (
    <Card className="mb-6">
      <CardContent className="p-4 sm:p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
              <FormField
                control={form.control}
                name="origin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origem</FormLabel>
                    <FormControl>
                      <Input placeholder="Cidade ou estado" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destino</FormLabel>
                    <FormControl>
                      <Input placeholder="Cidade ou estado" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              {createSelectField('vehicleType', 'Tipo de Veículo', vehicleTypes)}
              {createSelectField('bodyType', 'Tipo de Carroceria', bodyTypes)}
              {createSelectField('freightType', 'Tipo de Frete', freightTypes)}
            </div>
            <div className="flex justify-end space-x-2 pt-4 mt-4 border-t">
              <Button type="button" variant="ghost" onClick={handleClear} size="sm">
                <X className="mr-2 h-4 w-4" />
                Limpar
              </Button>
              <Button type="submit" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Aplicar Filtros
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PublicFreightsFilter;
