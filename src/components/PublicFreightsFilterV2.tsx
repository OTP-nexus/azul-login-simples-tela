
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { vehicleTypeGroups, bodyTypeGroups, freightTypes } from '@/lib/freightOptions';
import { useIBGE } from '@/hooks/useIBGE';
import { X } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PublicFreightFilters } from '@/hooks/usePublicFreightsV2';

const filterSchema = z.object({
  originState: z.string().optional(),
  originCity: z.string().optional(),
  destinationState: z.string().optional(),
  destinationCity: z.string().optional(),
  vehicleTypes: z.array(z.string()).optional(),
  bodyTypes: z.array(z.string()).optional(),
  freightType: z.string().optional(),
  tracker: z.string().optional(),
});

type FilterFormValues = z.infer<typeof filterSchema>;

interface PublicFreightsFilterV2Props {
  onFilterChange: (filters: PublicFreightFilters) => void;
  initialFilters: PublicFreightFilters;
}

const PublicFreightsFilterV2 = ({ onFilterChange, initialFilters }: PublicFreightsFilterV2Props) => {
  const { states, loadingStates } = useIBGE();
  const [originCities, setOriginCities] = useState<any[]>([]);
  const [destinationCities, setDestinationCities] = useState<any[]>([]);
  const [loadingOriginCities, setLoadingOriginCities] = useState(false);
  const [loadingDestinationCities, setLoadingDestinationCities] = useState(false);

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
  const watchOriginState = watch('originState');
  const watchDestinationState = watch('destinationState');

  // Carregar cidades da origem quando o estado da origem mudar
  useEffect(() => {
    if (watchOriginState) {
      setLoadingOriginCities(true);
      fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${watchOriginState}/municipios?orderBy=nome`)
        .then(response => response.json())
        .then(data => {
          setOriginCities(data);
          form.setValue('originCity', ''); // Limpar cidade quando mudar estado
        })
        .catch(error => console.error('Erro ao buscar cidades de origem:', error))
        .finally(() => setLoadingOriginCities(false));
    } else {
      setOriginCities([]);
      form.setValue('originCity', '');
    }
  }, [watchOriginState, form]);

  // Carregar cidades do destino quando o estado do destino mudar
  useEffect(() => {
    if (watchDestinationState) {
      setLoadingDestinationCities(true);
      fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${watchDestinationState}/municipios?orderBy=nome`)
        .then(response => response.json())
        .then(data => {
          setDestinationCities(data);
          form.setValue('destinationCity', ''); // Limpar cidade quando mudar estado
        })
        .catch(error => console.error('Erro ao buscar cidades de destino:', error))
        .finally(() => setLoadingDestinationCities(false));
    } else {
      setDestinationCities([]);
      form.setValue('destinationCity', '');
    }
  }, [watchDestinationState, form]);

  useEffect(() => {
    const subscription = watch((values) => {
      console.log('🔄 Valores do formulário mudaram:', values);
      
      // Converter os filtros para o formato correto
      const convertedFilters: PublicFreightFilters = {};
      
      // Filtro de origem - combinar estado e cidade
      if (values.originState || values.originCity) {
        const originParts = [];
        
        if (values.originCity) {
          const selectedCity = originCities.find(city => city.id.toString() === values.originCity);
          if (selectedCity) {
            originParts.push(selectedCity.nome);
          }
        }
        
        if (values.originState && !values.originCity) {
          const selectedState = states.find(state => state.sigla === values.originState);
          if (selectedState) {
            originParts.push(selectedState.nome);
          }
        }
        
        if (originParts.length > 0) {
          convertedFilters.origin = originParts.join(' ');
        }
      }

      // Filtro de destino - combinar estado e cidade
      if (values.destinationState || values.destinationCity) {
        const destinationParts = [];
        
        if (values.destinationCity) {
          const selectedCity = destinationCities.find(city => city.id.toString() === values.destinationCity);
          if (selectedCity) {
            destinationParts.push(selectedCity.nome);
          }
        }
        
        if (values.destinationState && !values.destinationCity) {
          const selectedState = states.find(state => state.sigla === values.destinationState);
          if (selectedState) {
            destinationParts.push(selectedState.nome);
          }
        }
        
        if (destinationParts.length > 0) {
          convertedFilters.destination = destinationParts.join(' ');
        }
      }

      // Outros filtros diretos
      if (values.vehicleTypes && values.vehicleTypes.length > 0) {
        convertedFilters.vehicleTypes = values.vehicleTypes;
      }
      
      if (values.bodyTypes && values.bodyTypes.length > 0) {
        convertedFilters.bodyTypes = values.bodyTypes;
      }
      
      if (values.freightType && values.freightType.trim() !== '') {
        convertedFilters.freightType = values.freightType;
      }
      
      if (values.tracker && values.tracker !== 'todos') {
        convertedFilters.tracker = values.tracker;
      }

      console.log('📤 Enviando filtros convertidos:', convertedFilters);
      onFilterChange(convertedFilters);
    });
    return () => subscription.unsubscribe();
  }, [watch, onFilterChange, states, originCities, destinationCities]);

  const handleClear = () => {
    console.log('🧹 Limpando filtros');
    form.reset({
      originState: '',
      originCity: '',
      destinationState: '',
      destinationCity: '',
      vehicleTypes: [],
      bodyTypes: [],
      freightType: '',
      tracker: 'todos',
    });
    setOriginCities([]);
    setDestinationCities([]);
    onFilterChange({});
  };

  return (
    <aside className="bg-white p-6 rounded-lg shadow-md border w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Filtros V2</h3>
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
                {/* Origem */}
                <div className="space-y-3">
                  <FormLabel className="text-base font-medium">🚛 Origem</FormLabel>
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="originState"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Estado</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {loadingStates ? (
                                <SelectItem value="loading" disabled>Carregando...</SelectItem>
                              ) : (
                                states.map((state) => (
                                  <SelectItem key={state.id} value={state.sigla}>
                                    {state.nome}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="originCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Cidade</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={!watchOriginState}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={watchOriginState ? "Selecione a cidade" : "Escolha o estado primeiro"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {loadingOriginCities ? (
                                <SelectItem value="loading" disabled>Carregando...</SelectItem>
                              ) : (
                                originCities.map((city) => (
                                  <SelectItem key={city.id} value={city.id.toString()}>
                                    {city.nome}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Destino */}
                <div className="space-y-3">
                  <FormLabel className="text-base font-medium">🎯 Destino</FormLabel>
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="destinationState"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Estado</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {loadingStates ? (
                                <SelectItem value="loading" disabled>Carregando...</SelectItem>
                              ) : (
                                states.map((state) => (
                                  <SelectItem key={state.id} value={state.sigla}>
                                    {state.nome}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="destinationCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Cidade</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={!watchDestinationState}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={watchDestinationState ? "Selecione a cidade" : "Escolha o estado primeiro"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {loadingDestinationCities ? (
                                <SelectItem value="loading" disabled>Carregando...</SelectItem>
                              ) : (
                                destinationCities.map((city) => (
                                  <SelectItem key={city.id} value={city.id.toString()}>
                                    {city.nome}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
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
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </form>
      </Form>
    </aside>
  );
};

export default PublicFreightsFilterV2;
