
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

const filterSchema = z.object({
  origin: z.string().optional(),
  destination: z.string().optional(),
  vehicleTypes: z.array(z.string()).optional(),
  bodyTypes: z.array(z.string()).optional(),
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
    defaultValues: {
      ...initialFilters,
      vehicleTypes: initialFilters.vehicleTypes || [],
      bodyTypes: initialFilters.bodyTypes || [],
    },
  });

  const { watch, handleSubmit } = form;

  useEffect(() => {
    const subscription = watch((values) => {
      const cleanFilters = Object.fromEntries(
        Object.entries(values).filter(([, v]) => {
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
    });
    onFilterChange({});
  };

  return (
    <aside className="bg-white p-6 rounded-lg shadow-md border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Filtros</h3>
        <Button type="button" variant="ghost" onClick={handleClear} size="sm">
          <X className="mr-2 h-4 w-4" />
          Limpar
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={handleSubmit(() => {})} className="space-y-6">
          
          <div className="space-y-4 pb-4 border-b">
            <h4 className="text-lg font-semibold">Localização</h4>
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
          </div>

          <div className="space-y-4 pb-4 border-b">
            <h4 className="text-lg font-semibold">Tipo de Veículo</h4>
            <FormField
              control={form.control}
              name="vehicleTypes"
              render={() => (
                <FormItem>
                  {vehicleTypeGroups.map((group) => (
                    <div key={group.groupLabel} className="mb-2">
                       <p className="font-medium text-sm text-gray-700 mb-2">{group.groupLabel}</p>
                      {group.types.map((item) => (
                        <FormField
                          key={item.value}
                          control={form.control}
                          name="vehicleTypes"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item.value}
                                className="flex flex-row items-center space-x-2 space-y-1"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), item.value])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item.value
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal text-sm">
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4 pb-4 border-b">
            <h4 className="text-lg font-semibold">Tipo de Carroceria</h4>
              <FormField
                control={form.control}
                name="bodyTypes"
                render={() => (
                  <FormItem>
                    {bodyTypeGroups.map((group) => (
                      <div key={group.groupLabel} className="mb-2">
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
                  </FormItem>
                )}
              />
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Tipo de Frete</h4>
            <FormField
              control={form.control}
              name="freightType"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
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
          </div>
        </form>
      </Form>
    </aside>
  );
};

export default PublicFreightsFilter;

