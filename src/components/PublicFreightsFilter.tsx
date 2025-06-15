
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { vehicleTypeGroups, bodyTypeGroups, freightTypes } from '@/lib/freightOptions';
import { X } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const filterSchema = z.object({
  origin: z.string().optional(),
  destination: z.string().optional(),
  vehicleTypes: z.array(z.string()).optional(),
  bodyTypes: z.array(z.string()).optional(),
  freightType: z.string().optional(),
  tracker: z.string().optional(),
});

type FilterFormValues = z.infer<typeof filterSchema>;

interface PublicFreightsFilterProps {
  onFilterChange: (filters: Partial<FilterFormValues>) => void;
  initialFilters: Partial<FilterFormValues>;
}

const PublicFreightsFilter = ({ onFilterChange, initialFilters }: PublicFreightsFilterProps) => {
  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      ...initialFilters,
      vehicleTypes: initialFilters.vehicleTypes || [],
      bodyTypes: initialFilters.bodyTypes || [],
      tracker: initialFilters.tracker || 'todos',
    },
  });

  const { watch, handleSubmit } = form;

  useEffect(() => {
    const subscription = watch((values) => {
      const cleanFilters = Object.fromEntries(
        Object.entries(values).filter(([key, v]) => {
          if (key === 'tracker' && v === 'todos') return false;
          if (Array.isArray(v)) return v.length > 0;
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
      vehicleTypes: [],
      bodyTypes: [],
      freightType: '',
      tracker: 'todos',
    });
    onFilterChange({});
  };

  return (
    <aside className="bg-white p-6 rounded-lg shadow-md border lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Filtros</h3>
        <Button type="button" variant="ghost" onClick={handleClear} size="sm">
          <X className="mr-2 h-4 w-4" />
          Limpar
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={handleSubmit(() => {})} className="space-y-6">
          <Accordion type="multiple" defaultValue={['location', 'vehicle', 'body']} className="w-full">
            <AccordionItem value="location">
              <AccordionTrigger className="text-lg font-semibold">Localização</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
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
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="vehicle">
              <AccordionTrigger className="text-lg font-semibold">Tipo de Veículo</AccordionTrigger>
              <AccordionContent className="pt-4">
                {vehicleTypeGroups.map((group) => (
                  <div key={group.groupLabel} className="mb-4">
                    <p className="font-medium text-sm text-gray-700 mb-2">{group.groupLabel}</p>
                    {group.types.map((item) => (
                      <FormField
                        key={item.value}
                        control={form.control}
                        name="vehicleTypes"
                        render={({ field }) => (
                          <FormItem key={item.value} className="flex flex-row items-center space-x-2 space-y-1">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.value)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), item.value])
                                    : field.onChange(field.value?.filter((value) => value !== item.value));
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal text-sm">{item.label}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="body">
              <AccordionTrigger className="text-lg font-semibold">Tipo de Carroceria</AccordionTrigger>
              <AccordionContent className="pt-4">
                {bodyTypeGroups.map((group) => (
                  <div key={group.groupLabel} className="mb-4">
                    <p className="font-medium text-sm text-gray-700 mb-2">{group.groupLabel}</p>
                    {group.types.map((item) => (
                      <FormField
                        key={item.value}
                        control={form.control}
                        name="bodyTypes"
                        render={({ field }) => (
                          <FormItem key={item.value} className="flex flex-row items-center space-x-2 space-y-1">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.value)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), item.value])
                                    : field.onChange(field.value?.filter((value) => value !== item.value));
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal text-sm">{item.label}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="freight">
              <AccordionTrigger className="text-lg font-semibold">Tipo de Frete</AccordionTrigger>
              <AccordionContent className="pt-4">
                <FormField
                  control={form.control}
                  name="freightType"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                          {freightTypes.map((item) => (
                            <FormItem key={item.value} className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value={item.value} />
                              </FormControl>
                              <FormLabel className="font-normal">{item.label}</FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="details">
              <AccordionTrigger className="text-lg font-semibold">Detalhes</AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                <div className='space-y-2'>
                  <FormLabel>Rastreador</FormLabel>
                  <FormField
                    control={form.control}
                    name="tracker"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-row space-x-4">
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl><RadioGroupItem value="sim" /></FormControl>
                              <FormLabel className="font-normal">Sim</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl><RadioGroupItem value="nao" /></FormControl>
                              <FormLabel className="font-normal">Não</FormLabel>
                            </FormItem>
                             <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl><RadioGroupItem value="todos" /></FormControl>
                              <FormLabel className="font-normal">Ambos</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className='space-y-2'>
                  <FormLabel className="text-gray-500">Raio (Distância)</FormLabel>
                  <RadioGroup disabled className="flex flex-row space-x-4">
                      <FormItem className="flex items-center space-x-2 space-y-0">
                          <RadioGroupItem value="50" />
                          <FormLabel className="font-normal text-gray-400">50Km</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                          <RadioGroupItem value="100" />
                          <FormLabel className="font-normal text-gray-400">100Km</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                          <RadioGroupItem value="200" />
                          <FormLabel className="font-normal text-gray-400">200Km</FormLabel>
                      </FormItem>
                  </RadioGroup>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </form>
      </Form>
    </aside>
  );
};

export default PublicFreightsFilter;
