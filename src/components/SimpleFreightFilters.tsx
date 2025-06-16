
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import { freightTypes } from '@/lib/freightOptions';
import { X } from 'lucide-react';

const filterSchema = z.object({
  origin: z.string().optional(),
  destination: z.string().optional(),
  freightType: z.string().optional(),
  tracker: z.string().optional(),
});

type FilterFormValues = z.infer<typeof filterSchema>;

interface SimpleFreightFiltersProps {
  onFilterChange: (filters: any) => void;
  initialFilters: any;
}

const SimpleFreightFilters = ({ onFilterChange, initialFilters }: SimpleFreightFiltersProps) => {
  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      origin: initialFilters.origin || '',
      destination: initialFilters.destination || '',
      freightType: initialFilters.freightType || '',
      tracker: initialFilters.tracker || 'todos',
    },
  });

  const { watch, handleSubmit } = form;

  React.useEffect(() => {
    const subscription = watch((values) => {
      const cleanFilters = Object.fromEntries(
        Object.entries(values).filter(([key, v]) => {
          if (key === 'tracker' && v === 'todos') return false;
          return v != null && v !== '';
        })
      );
      onFilterChange(cleanFilters);
    });
    return () => subscription.unsubscribe();
  }, [watch, onFilterChange]);

  const handleClear = () => {
    form.reset({
      origin: '',
      destination: '',
      freightType: '',
      tracker: 'todos',
    });
    onFilterChange({});
  };

  return (
    <aside className="bg-white p-6 rounded-lg shadow-md border w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Filtros</h3>
        <Button type="button" variant="ghost" onClick={handleClear} size="sm">
          <X className="mr-2 h-4 w-4" />
          Limpar
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(() => {})} className="space-y-6">
          {/* Localização */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">📍 Localização</h4>
            
            <FormField
              control={form.control}
              name="origin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">🚛 Origem</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite a cidade ou estado de origem"
                      {...field}
                      className="w-full"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">🎯 Destino</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite a cidade ou estado de destino"
                      {...field}
                      className="w-full"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Tipo de Frete */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">📦 Tipo de Frete</h4>
            <FormField
              control={form.control}
              name="freightType"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de frete" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Todos os tipos</SelectItem>
                      {freightTypes.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          {/* Rastreador */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">📡 Rastreador</h4>
            <FormField
              control={form.control}
              name="tracker"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-3 gap-2">
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl><RadioGroupItem value="sim" /></FormControl>
                        <FormLabel className="font-normal text-sm">Sim</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl><RadioGroupItem value="nao" /></FormControl>
                        <FormLabel className="font-normal text-sm">Não</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl><RadioGroupItem value="todos" /></FormControl>
                        <FormLabel className="font-normal text-sm">Ambos</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </aside>
  );
};

export default SimpleFreightFilters;
