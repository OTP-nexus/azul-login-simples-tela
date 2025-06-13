import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, ArrowRight, Users, MapPin, Truck, Settings, Calendar, Package, DollarSign, Plus, X, GripVertical, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import FreightLoadingAnimation from './FreightLoadingAnimation';
import FreightVerificationDialog from './FreightVerificationDialog';
import FreightSuccessDialog from './FreightSuccessDialog';
import { useEstados, useCidades } from '@/hooks/useIBGE';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useFreightFormValidation, FreightFormData } from '@/hooks/useFreightFormValidation';
import { formatCurrency, formatNumericInput, formatWeight, parseCurrencyValue, validateNumericInput, limitTextInput } from '@/utils/freightFormatters';
import { ErrorMessage } from '@/components/ui/error-message';

const vehicleTypes = {
  heavy: [
    { id: 'carreta', type: 'Carreta', category: 'heavy' as const },
    { id: 'carreta-ls', type: 'Carreta LS', category: 'heavy' as const },
    { id: 'vanderleia', type: 'Vanderléia', category: 'heavy' as const },
    { id: 'bitrem', type: 'Bitrem', category: 'heavy' as const },
    { id: 'rodotrem', type: 'Rodotrem', category: 'heavy' as const }
  ],
  medium: [
    { id: 'truck', type: 'Truck', category: 'medium' as const },
    { id: 'bitruck', type: 'Bitruck', category: 'medium' as const },
    { id: 'toco', type: 'Toco', category: 'medium' as const }
  ],
  light: [
    { id: 'fiorino', type: 'Fiorino', category: 'light' as const },
    { id: 'vlc', type: 'VLC', category: 'light' as const },
    { id: 'tres-quartos', type: '3/4', category: 'light' as const },
    { id: 'van', type: 'Van', category: 'light' as const },
    { id: 'hr', type: 'HR (Hyundai HR)', category: 'light' as const },
    { id: 'utilitario', type: 'Utilitário', category: 'light' as const },
    { id: 'kombi', type: 'Kombi', category: 'light' as const },
    { id: 'moto', type: 'Moto', category: 'light' as const }
  ]
};

const bodyTypes = {
  open: [
    { id: 'graneleiro', type: 'Graneleiro', category: 'open' as const },
    { id: 'grade-baixa', type: 'Grade Baixa', category: 'open' as const },
    { id: 'prancha', type: 'Prancha', category: 'open' as const },
    { id: 'cacamba', type: 'Caçamba', category: 'open' as const },
    { id: 'plataforma', type: 'Plataforma', category: 'open' as const }
  ],
  closed: [
    { id: 'sider', type: 'Sider', category: 'closed' as const },
    { id: 'bau', type: 'Baú', category: 'closed' as const },
    { id: 'bau-frigorifico', type: 'Baú Frigorífico', category: 'closed' as const },
    { id: 'bau-refrigerado', type: 'Baú Refrigerado', category: 'closed' as const }
  ],
  special: [
    { id: 'silo', type: 'Silo', category: 'special' as const },
    { id: 'cegonheiro', type: 'Cegonheiro', category: 'special' as const },
    { id: 'gaiola', type: 'Gaiola', category: 'special' as const },
    { id: 'tanque', type: 'Tanque', category: 'special' as const },
    { id: 'bug-porta-container', type: 'Bug Porta Container', category: 'special' as const },
    { id: 'munk', type: 'Munk', category: 'special' as const },
    { id: 'apenas-cavalo', type: 'Apenas Cavalo', category: 'special' as const },
    { id: 'cavaqueira', type: 'Cavaqueira', category: 'special' as const },
    { id: 'hopper', type: 'Hopper', category: 'special' as const },
    { id: 'cegonha', type: 'Cegonha', category: 'special' as const },
    { id: 'porta-container', type: 'Porta Container', category: 'special' as const }
  ]
};

const FreightCompleteForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [generatedFreights, setGeneratedFreights] = useState([]);

  const {
    errors,
    validateStep1,
    validateStep2,
    validateStep3,
    validateStep4,
    clearErrors
  } = useFreightFormValidation();

  const [formData, setFormData] = useState<FreightFormData>({
    selectedCollaborators: [] as string[],
    origem: {
      estado: '',
      cidade: ''
    },
    paradas: [] as Array<{ id: string; estado: string; cidade: string }>,
    dataColeta: '',
    horarioColeta: '',
    dimensoes: {
      altura: '',
      largura: '',
      comprimento: ''
    },
    peso: '',
    tiposVeiculos: [] as Array<{ id: string; type: string; category: 'heavy' | 'medium' | 'light'; selected: boolean }>,
    tiposCarrocerias: [] as Array<{ id: string; type: string; category: 'closed' | 'open' | 'special'; selected: boolean }>,
    tipoValor: '',
    valorOfertado: '',
    pedagioPagoPor: '',
    pedagioDirecao: '',
    precisaSeguro: false,
    precisaAjudante: false,
    precisaRastreador: false,
    observacoes: ''
  });

  const { estados } = useEstados();
  const { cidades: cidadesOrigem } = useCidades(formData.origem.estado);

  const useMultipleCidades = (estados: string[]) => {
    return useQuery({
      queryKey: ['multiple-cidades', estados],
      queryFn: async () => {
        if (!estados.length) return {};
        
        const cidadesByState: Record<string, any[]> = {};
        
        for (const estado of estados) {
          if (estado) {
            try {
              const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios?orderBy=nome`);
              if (response.ok) {
                const data = await response.json();
                cidadesByState[estado] = data;
              } else {
                cidadesByState[estado] = [];
              }
            } catch (error) {
              console.error(`Erro ao buscar cidades para ${estado}:`, error);
              cidadesByState[estado] = [];
            }
          }
        }
        
        return cidadesByState;
      },
      enabled: estados.length > 0,
    });
  };

  const paradaStates = useMemo(() => {
    return [...new Set(formData.paradas.map(p => p.estado).filter(Boolean))];
  }, [formData.paradas]);

  const { data: cidadesByState = {} } = useMultipleCidades(paradaStates);

  const { data: collaborators = [] } = useQuery({
    queryKey: ['collaborators'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!company) throw new Error('Empresa não encontrada');

      const { data, error } = await supabase
        .from('collaborators')
        .select('*')
        .eq('company_id', company.id);

      if (error) throw error;
      return data || [];
    },
  });

  const addParada = () => {
    const newParada = {
      id: Date.now().toString(),
      estado: '',
      cidade: ''
    };
    setFormData({
      ...formData,
      paradas: [...formData.paradas, newParada]
    });
  };

  const removeParada = (id: string) => {
    setFormData({
      ...formData,
      paradas: formData.paradas.filter(parada => parada.id !== id)
    });
  };

  const updateParada = (id: string, field: 'estado' | 'cidade', value: string) => {
    setFormData({
      ...formData,
      paradas: formData.paradas.map(parada =>
        parada.id === id
          ? { ...parada, [field]: value, ...(field === 'estado' ? { cidade: '' } : {}) }
          : parada
      )
    });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(formData.paradas);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFormData({
      ...formData,
      paradas: items
    });
  };

  const toggleVehicleType = (vehicleId: string, type: string, category: 'heavy' | 'medium' | 'light') => {
    const existing = formData.tiposVeiculos.find(v => v.id === vehicleId);
    if (existing) {
      setFormData({
        ...formData,
        tiposVeiculos: formData.tiposVeiculos.filter(v => v.id !== vehicleId)
      });
    } else {
      setFormData({
        ...formData,
        tiposVeiculos: [...formData.tiposVeiculos, { id: vehicleId, type, category, selected: true }]
      });
    }
  };

  const toggleBodyType = (bodyId: string, type: string, category: 'closed' | 'open' | 'special') => {
    const existing = formData.tiposCarrocerias.find(b => b.id === bodyId);
    if (existing) {
      setFormData({
        ...formData,
        tiposCarrocerias: formData.tiposCarrocerias.filter(b => b.id !== bodyId)
      });
    } else {
      setFormData({
        ...formData,
        tiposCarrocerias: [...formData.tiposCarrocerias, { id: bodyId, type, category, selected: true }]
      });
    }
  };

  const handleCurrencyChange = (value: string, field: string) => {
    const formatted = formatCurrency(value);
    setFormData({
      ...formData,
      [field]: parseCurrencyValue(formatted)
    });
  };

  const handleNumericChange = (value: string, field: string, maxDecimals: number = 2) => {
    const formatted = formatNumericInput(value, maxDecimals);
    setFormData({
      ...formData,
      [field]: formatted
    });
  };

  const handleWeightChange = (value: string) => {
    const formatted = formatWeight(value);
    setFormData({
      ...formData,
      peso: formatted
    });
  };

  const handleObservationsChange = (value: string) => {
    const limited = limitTextInput(value, 500);
    setFormData({
      ...formData,
      observacoes: limited
    });
  };

  const steps = [
    { number: 1, title: 'Colaboradores', icon: Users, description: 'Selecione os responsáveis' },
    { number: 2, title: 'Origem e Paradas', icon: MapPin, description: 'Locais de coleta e paradas' },
    { number: 3, title: 'Carga e Veículos', icon: Truck, description: 'Especificações da carga' },
    { number: 4, title: 'Configurações', icon: Settings, description: 'Detalhes finais' }
  ];

  const handleNext = () => {
    clearErrors();
    
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1(formData);
        break;
      case 2:
        isValid = validateStep2(formData);
        break;
      case 3:
        isValid = validateStep3(formData);
        break;
      case 4:
        isValid = validateStep4(formData);
        if (isValid) {
          setShowVerificationDialog(true);
          return;
        }
        break;
    }
    
    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    clearErrors();
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const checkForDuplicateParada = (estado: string, cidade: string, currentId: string): boolean => {
    return formData.paradas.some(parada => 
      parada.id !== currentId && 
      parada.estado === estado && 
      parada.cidade === cidade
    );
  };

  const handleSubmit = async () => {
    if (!validateStep4(formData)) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!company) throw new Error('Empresa não encontrada');

      const destinos = formData.paradas.map((parada, index) => ({
        id: parada.id || index.toString(),
        state: parada.estado,
        city: parada.cidade
      }));

      const valoresDefinidos = formData.tipoValor === 'valor' ? {
        tipo: 'valor_fixo',
        valor: formData.valorOfertado ? parseFloat(formData.valorOfertado) : 0
      } : {
        tipo: 'a_combinar'
      };

      const freightData = {
        company_id: company.id,
        tipo_frete: 'frete_completo',
        origem_estado: formData.origem.estado,
        origem_cidade: formData.origem.cidade,
        destinos: destinos,
        tipo_mercadoria: 'Geral',
        paradas: formData.paradas.map(parada => ({
          estado: parada.estado,
          cidade: parada.cidade,
          ordem: formData.paradas.indexOf(parada) + 1
        })),
        data_coleta: formData.dataColeta || null,
        horario_carregamento: formData.horarioColeta || null,
        peso_carga: formData.peso ? parseFloat(formData.peso.replace(/\./g, '')) : null,
        tipos_veiculos: formData.tiposVeiculos,
        tipos_carrocerias: formData.tiposCarrocerias,
        valores_definidos: valoresDefinidos,
        precisa_ajudante: formData.precisaAjudante,
        precisa_rastreador: formData.precisaRastreador,
        precisa_seguro: formData.precisaSeguro,
        pedagio_pago_por: formData.pedagioPagoPor,
        pedagio_direcao: formData.pedagioDirecao,
        observacoes: formData.observacoes,
        collaborator_ids: formData.selectedCollaborators,
        status: 'pendente'
      };

      console.log('Dados do frete a serem salvos:', freightData);

      const { data, error } = await supabase
        .from('fretes')
        .insert([freightData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar frete:', error);
        throw error;
      }

      console.log('Frete salvo com sucesso:', data);

      // Criar um frete para cada parada
      const generatedFreightsList = formData.paradas.map((parada, index) => ({
        id: data.id,
        codigo_agregamento: data.codigo_agregamento || `FRT-${Date.now()}-${index}`,
        destino_cidade: parada.cidade,
        destino_estado: parada.estado
      }));

      setGeneratedFreights(generatedFreightsList);
      setIsSubmitting(false);
      setShowVerificationDialog(false);
      setShowSuccessDialog(true);

      toast({
        title: "Sucesso!",
        description: "Frete completo criado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao criar frete:', error);
      setIsSubmitting(false);
      setShowVerificationDialog(false);
      toast({
        title: "Erro",
        description: `Erro ao criar frete: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    navigate('/freight-request');
  };

  const convertedFormData = {
    collaborator_ids: formData.selectedCollaborators,
    origem_cidade: formData.origem.cidade,
    origem_estado: formData.origem.estado,
    destinos: formData.paradas.map((parada, index) => ({ 
      id: parada.id || index.toString(), 
      state: parada.estado, 
      city: parada.cidade 
    })),
    tipo_mercadoria: 'Geral',
    tipos_veiculos: formData.tiposVeiculos,
    tipos_carrocerias: formData.tiposCarrocerias,
    vehicle_price_tables: [],
    regras_agendamento: [],
    beneficios: [],
    horario_carregamento: formData.horarioColeta,
    precisa_ajudante: formData.precisaAjudante,
    precisa_rastreador: formData.precisaRastreador,
    precisa_seguro: formData.precisaSeguro,
    pedagio_pago_por: formData.pedagioPagoPor,
    pedagio_direcao: formData.pedagioDirecao,
    observacoes: formData.observacoes,
    tipo_valor: formData.tipoValor,
    valor_definido: formData.valorOfertado ? parseFloat(formData.valorOfertado) : undefined
  };

  if (isSubmitting) {
    return <FreightLoadingAnimation open={true} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleBack}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Frete Completo</h1>
                <p className="text-sm text-gray-600">Etapa {currentStep} de 4</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center space-x-2 ${
                  currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step.number ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}>
                    <step.icon className="w-4 h-4" />
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 1 && (
          <Card className={errors.collaborators ? 'border-red-300' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Selecionar Colaboradores Responsáveis *</span>
              </CardTitle>
              <CardDescription>
                Escolha os colaboradores que serão responsáveis por este frete
              </CardDescription>
              <ErrorMessage error={errors.collaborators} />
            </CardHeader>
            <CardContent className="space-y-4">
              {collaborators.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum colaborador cadastrado</p>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/collaborator-registration')}
                    className="mt-4"
                  >
                    Cadastrar Colaborador
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {collaborators.map((collaborator) => (
                    <div
                      key={collaborator.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        formData.selectedCollaborators.includes(collaborator.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        const selected = formData.selectedCollaborators.includes(collaborator.id);
                        if (selected) {
                          setFormData({
                            ...formData,
                            selectedCollaborators: formData.selectedCollaborators.filter(id => id !== collaborator.id)
                          });
                        } else {
                          setFormData({
                            ...formData,
                            selectedCollaborators: [...formData.selectedCollaborators, collaborator.id]
                          });
                        }
                      }}
                    >
                      <h3 className="font-medium">{collaborator.name}</h3>
                      <p className="text-sm text-gray-500">{collaborator.sector}</p>
                      <p className="text-sm text-gray-500">{collaborator.phone}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className={errors.origem ? 'border-red-300' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span>Origem *</span>
                </CardTitle>
                <CardDescription>
                  Local de coleta da carga
                </CardDescription>
                <ErrorMessage error={errors.origem} />
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="origem-estado">Estado *</Label>
                  <Select 
                    value={formData.origem.estado} 
                    onValueChange={(value) => setFormData({
                      ...formData,
                      origem: { estado: value, cidade: '' }
                    })}
                  >
                    <SelectTrigger className={errors.origem ? 'border-red-300' : ''}>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {estados.map((estado) => (
                        <SelectItem key={estado.sigla} value={estado.sigla}>
                          {estado.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="origem-cidade">Cidade *</Label>
                  <Select 
                    value={formData.origem.cidade} 
                    onValueChange={(value) => setFormData({
                      ...formData,
                      origem: { ...formData.origem, cidade: value }
                    })}
                    disabled={!formData.origem.estado}
                  >
                    <SelectTrigger className={errors.origem ? 'border-red-300' : ''}>
                      <SelectValue placeholder="Selecione a cidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {cidadesOrigem.map((cidade) => (
                        <SelectItem key={cidade.id} value={cidade.nome}>
                          {cidade.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className={errors.paradas ? 'border-red-300' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-red-600" />
                    <span>Paradas *</span>
                  </div>
                  <Button
                    onClick={addParada}
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Parada</span>
                  </Button>
                </CardTitle>
                <CardDescription>
                  Locais onde o veículo deve parar durante o trajeto. Arraste os cards para reordenar.
                </CardDescription>
                <ErrorMessage error={errors.paradas} />
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.paradas.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="font-medium">Nenhuma parada adicionada</p>
                    <p className="text-sm mt-1">Clique em "Adicionar Parada" para incluir paradas no trajeto</p>
                  </div>
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="paradas">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-4 max-h-96 overflow-y-auto"
                        >
                          {formData.paradas.map((parada, index) => {
                            const cidadesParada = cidadesByState[parada.estado] || [];
                            const isDuplicate = checkForDuplicateParada(parada.estado, parada.cidade, parada.id);
                            
                            return (
                              <Draggable key={parada.id} draggableId={parada.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`border rounded-lg p-4 transition-all ${
                                      snapshot.isDragging ? 'shadow-lg scale-105 bg-white border-blue-300 rotate-2' : 'hover:shadow-md'
                                    } ${
                                      isDuplicate ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                                    }`}
                                    style={provided.draggableProps.style}
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center space-x-2">
                                        <div
                                          {...provided.dragHandleProps}
                                          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1"
                                        >
                                          <GripVertical className="w-4 h-4" />
                                        </div>
                                        <h4 className="font-medium text-sm text-gray-700">Parada {index + 1}</h4>
                                      </div>
                                      <Button
                                        onClick={() => removeParada(parada.id)}
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                    {isDuplicate && (
                                      <div className="mb-2">
                                        <ErrorMessage error="Parada duplicada detectada" />
                                      </div>
                                    )}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <div>
                                        <Label className="text-xs font-medium text-gray-600">Estado *</Label>
                                        <Select 
                                          value={parada.estado} 
                                          onValueChange={(value) => updateParada(parada.id, 'estado', value)}
                                        >
                                          <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Estado" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {estados.map((estado) => (
                                              <SelectItem key={estado.sigla} value={estado.sigla}>
                                                {estado.nome}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div>
                                        <Label className="text-xs font-medium text-gray-600">Cidade *</Label>
                                        <Select 
                                          value={parada.cidade} 
                                          onValueChange={(value) => updateParada(parada.id, 'cidade', value)}
                                          disabled={!parada.estado}
                                        >
                                          <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Cidade" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {cidadesParada.map((cidade) => (
                                              <SelectItem key={cidade.id} value={cidade.nome}>
                                                {cidade.nome}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <Card className={errors.dataColeta || errors.horarioColeta ? 'border-red-300' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Data e Horário de Coleta *</span>
                </CardTitle>
                <CardDescription>
                  Informações obrigatórias sobre quando a carga será coletada
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="data-coleta">Data de Coleta *</Label>
                    <Input
                      id="data-coleta"
                      type="date"
                      value={formData.dataColeta}
                      onChange={(e) => setFormData({ ...formData, dataColeta: e.target.value })}
                      className={errors.dataColeta ? 'border-red-300' : ''}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                    <ErrorMessage error={errors.dataColeta} />
                  </div>
                  <div>
                    <Label htmlFor="horario-coleta">Horário de Coleta *</Label>
                    <Input
                      id="horario-coleta"
                      type="time"
                      value={formData.horarioColeta}
                      onChange={(e) => setFormData({ ...formData, horarioColeta: e.target.value })}
                      className={errors.horarioColeta ? 'border-red-300' : ''}
                      required
                    />
                    <ErrorMessage error={errors.horarioColeta} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>Dimensões e Peso (Opcional)</span>
                </CardTitle>
                <CardDescription>
                  Informações sobre as dimensões e peso da carga
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="altura">Altura (m)</Label>
                    <Input
                      id="altura"
                      type="text"
                      placeholder="Ex: 2.5"
                      value={formData.dimensoes.altura}
                      onChange={(e) => {
                        const formatted = formatNumericInput(e.target.value, 2);
                        setFormData({ 
                          ...formData, 
                          dimensoes: { ...formData.dimensoes, altura: formatted }
                        });
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="largura">Largura (m)</Label>
                    <Input
                      id="largura"
                      type="text"
                      placeholder="Ex: 2.4"
                      value={formData.dimensoes.largura}
                      onChange={(e) => {
                        const formatted = formatNumericInput(e.target.value, 2);
                        setFormData({ 
                          ...formData, 
                          dimensoes: { ...formData.dimensoes, largura: formatted }
                        });
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="comprimento">Comprimento (m)</Label>
                    <Input
                      id="comprimento"
                      type="text"
                      placeholder="Ex: 14.0"
                      value={formData.dimensoes.comprimento}
                      onChange={(e) => {
                        const formatted = formatNumericInput(e.target.value, 2);
                        setFormData({ 
                          ...formData, 
                          dimensoes: { ...formData.dimensoes, comprimento: formatted }
                        });
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="peso">Peso (kg)</Label>
                    <Input
                      id="peso"
                      type="text"
                      placeholder="Ex: 25.000"
                      value={formData.peso}
                      onChange={(e) => handleWeightChange(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={errors.tiposVeiculos ? 'border-red-300' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="w-5 h-5" />
                  <span>Tipos de Veículos *</span>
                </CardTitle>
                <CardDescription>
                  Selecione os tipos de veículos aceitos para este frete
                </CardDescription>
                <ErrorMessage error={errors.tiposVeiculos} />
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Veículos Pesados</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {vehicleTypes.heavy.map((vehicle) => (
                        <div
                          key={vehicle.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-all ${
                            formData.tiposVeiculos.some(v => v.id === vehicle.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => toggleVehicleType(vehicle.id, vehicle.type, vehicle.category)}
                        >
                          <p className="text-sm font-medium">{vehicle.type}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Veículos Médios</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {vehicleTypes.medium.map((vehicle) => (
                        <div
                          key={vehicle.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-all ${
                            formData.tiposVeiculos.some(v => v.id === vehicle.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => toggleVehicleType(vehicle.id, vehicle.type, vehicle.category)}
                        >
                          <p className="text-sm font-medium">{vehicle.type}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Veículos Leves</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {vehicleTypes.light.map((vehicle) => (
                        <div
                          key={vehicle.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-all ${
                            formData.tiposVeiculos.some(v => v.id === vehicle.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => toggleVehicleType(vehicle.id, vehicle.type, vehicle.category)}
                        >
                          <p className="text-sm font-medium">{vehicle.type}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={errors.tiposCarrocerias ? 'border-red-300' : ''}>
              <CardHeader>
                <CardTitle>Tipos de Carroceria *</CardTitle>
                <CardDescription>
                  Selecione os tipos de carroceria aceitos para este frete
                </CardDescription>
                <ErrorMessage error={errors.tiposCarrocerias} />
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Carrocerias Abertas</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {bodyTypes.open.map((body) => (
                        <div
                          key={body.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-all ${
                            formData.tiposCarrocerias.some(b => b.id === body.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => toggleBodyType(body.id, body.type, body.category)}
                        >
                          <p className="text-sm font-medium">{body.type}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Carrocerias Fechadas</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {bodyTypes.closed.map((body) => (
                        <div
                          key={body.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-all ${
                            formData.tiposCarrocerias.some(b => b.id === body.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => toggleBodyType(body.id, body.type, body.category)}
                        >
                          <p className="text-sm font-medium">{body.type}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Carrocerias Especiais</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {bodyTypes.special.map((body) => (
                        <div
                          key={body.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-all ${
                            formData.tiposCarrocerias.some(b => b.id === body.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => toggleBodyType(body.id, body.type, body.category)}
                        >
                          <p className="text-sm font-medium">{body.type}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={errors.tipoValor || errors.valorOfertado ? 'border-red-300' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>Valor do Frete *</span>
                </CardTitle>
                <CardDescription>
                  Escolha como será definido o valor do frete
                </CardDescription>
                <ErrorMessage error={errors.tipoValor} />
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup 
                  value={formData.tipoValor} 
                  onValueChange={(value) => setFormData({ ...formData, tipoValor: value, valorOfertado: '' })}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="combinar" id="combinar" />
                    <Label htmlFor="combinar" className="cursor-pointer flex-1">
                      <div className={`border rounded-lg p-4 transition-all ${
                        formData.tipoValor === 'combinar' 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                      }`}>
                        <h3 className={`font-medium ${
                          formData.tipoValor === 'combinar' ? 'text-purple-800' : 'text-gray-800'
                        }`}>A Combinar</h3>
                        <p className={`text-sm ${
                          formData.tipoValor === 'combinar' ? 'text-purple-600' : 'text-gray-500'
                        }`}>Valor será negociado com o transportador</p>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="valor" id="valor" />
                    <Label htmlFor="valor" className="cursor-pointer flex-1">
                      <div className={`border rounded-lg p-4 transition-all ${
                        formData.tipoValor === 'valor' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-green-300 hover:bg-green-25'
                      }`}>
                        <h3 className={`font-medium ${
                          formData.tipoValor === 'valor' ? 'text-green-800' : 'text-gray-800'
                        }`}>Valor Fixo</h3>
                        <p className={`text-sm ${
                          formData.tipoValor === 'valor' ? 'text-green-600' : 'text-gray-500'
                        }`}>Definir um valor específico para o frete</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {formData.tipoValor === 'valor' && (
                  <div className="mt-4">
                    <Label htmlFor="valor-ofertado">Valor Ofertado (R$) *</Label>
                    <Input
                      id="valor-ofertado"
                      type="text"
                      placeholder="Ex: R$ 5.000,00"
                      value={formData.valorOfertado ? formatCurrency(formData.valorOfertado) : ''}
                      onChange={(e) => handleCurrencyChange(e.target.value, 'valorOfertado')}
                      className={errors.valorOfertado ? 'border-red-300' : ''}
                    />
                    <ErrorMessage error={errors.valorOfertado} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <Card className={errors.pedagioPagoPor || errors.pedagioDirecao ? 'border-red-300' : ''}>
              <CardHeader>
                <CardTitle>Quem paga o pedágio *</CardTitle>
                <CardDescription>
                  Defina quem será responsável pelo pagamento do pedágio
                </CardDescription>
                <ErrorMessage error={errors.pedagioPagoPor} />
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="pedagio-pago-por">Responsável pelo pagamento *</Label>
                  <Select 
                    value={formData.pedagioPagoPor} 
                    onValueChange={(value) => setFormData({ 
                      ...formData, 
                      pedagioPagoPor: value,
                      pedagioDirecao: value === 'motorista' ? '' : formData.pedagioDirecao
                    })}
                  >
                    <SelectTrigger className={errors.pedagioPagoPor ? 'border-red-300' : ''}>
                      <SelectValue placeholder="Selecione quem paga" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="motorista">Motorista</SelectItem>
                      <SelectItem value="empresa">Empresa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {formData.pedagioPagoPor === 'empresa' && (
                  <div>
                    <Label htmlFor="pedagio-direcao">Direção do pedágio *</Label>
                    <Select 
                      value={formData.pedagioDirecao} 
                      onValueChange={(value) => setFormData({ ...formData, pedagioDirecao: value })}
                    >
                      <SelectTrigger className={errors.pedagioDirecao ? 'border-red-300' : ''}>
                        <SelectValue placeholder="Selecione a direção" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ida">Apenas ida</SelectItem>
                        <SelectItem value="volta">Apenas volta</SelectItem>
                        <SelectItem value="ida_volta">IDA E VOLTA</SelectItem>
                      </SelectContent>
                    </Select>
                    <ErrorMessage error={errors.pedagioDirecao} />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requisitos</CardTitle>
                <CardDescription>
                  Defina os requisitos necessários para este frete
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="precisa-seguro"
                    checked={formData.precisaSeguro}
                    onCheckedChange={(checked) => setFormData({ ...formData, precisaSeguro: !!checked })}
                  />
                  <Label htmlFor="precisa-seguro">Precisa de seguro</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="precisa-ajudante"
                    checked={formData.precisaAjudante}
                    onCheckedChange={(checked) => setFormData({ ...formData, precisaAjudante: !!checked })}
                  />
                  <Label htmlFor="precisa-ajudante">Precisa de ajudante</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="precisa-rastreador"
                    checked={formData.precisaRastreador}
                    onCheckedChange={(checked) => setFormData({ ...formData, precisaRastreador: !!checked })}
                  />
                  <Label htmlFor="precisa-rastreador">Precisa de rastreador</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
                <CardDescription>
                  Adicione informações adicionais sobre o frete (máximo 500 caracteres)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => handleObservationsChange(e.target.value)}
                    placeholder="Observações adicionais sobre o frete..."
                    rows={4}
                    maxLength={500}
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {formData.observacoes.length}/500 caracteres
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </Button>
          
          <Button
            onClick={handleNext}
            className="flex items-center space-x-2"
            disabled={isSubmitting}
          >
            <span>{currentStep === 4 ? 'Verificar Dados' : 'Próximo'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </main>

      <FreightVerificationDialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
        formData={convertedFormData}
        collaborators={collaborators || []}
        onEdit={() => setShowVerificationDialog(false)}
        onConfirm={handleSubmit}
        loading={isSubmitting}
      />

      <FreightSuccessDialog
        open={showSuccessDialog}
        onOpenChange={(open) => {
          setShowSuccessDialog(open);
          if (!open) {
            navigate('/company-dashboard');
          }
        }}
        generatedFreights={generatedFreights}
        onNewFreight={() => {
          setShowSuccessDialog(false);
          setCurrentStep(1);
          setFormData({
            selectedCollaborators: [],
            origem: { estado: '', cidade: '' },
            paradas: [],
            dataColeta: '',
            horarioColeta: '',
            dimensoes: { altura: '', largura: '', comprimento: '' },
            peso: '',
            tiposVeiculos: [],
            tiposCarrocerias: [],
            tipoValor: '',
            valorOfertado: '',
            pedagioPagoPor: '',
            pedagioDirecao: '',
            precisaSeguro: false,
            precisaAjudante: false,
            precisaRastreador: false,
            observacoes: ''
          });
        }}
        onBackToDashboard={() => {
          setShowSuccessDialog(false);
          navigate('/company-dashboard');
        }}
      />
    </div>
  );
};

export default FreightCompleteForm;
