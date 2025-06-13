import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, ArrowRight, Users, MapPin, Truck, Settings, Calendar, Package, DollarSign, Plus, X, GripVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import FreightLoadingAnimation from './FreightLoadingAnimation';
import FreightVerificationDialog from './FreightVerificationDialog';
import FreightSuccessDialog from './FreightSuccessDialog';
import { useEstados, useCidades } from '@/hooks/useIBGE';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

// Vehicle types by category - updated with all types
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

// Body types by category - updated with all types
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

  const [formData, setFormData] = useState({
    // Etapa 1 - Colaboradores
    selectedCollaborators: [] as string[],
    
    // Etapa 2 - Origem e Paradas
    origem: {
      estado: '',
      cidade: ''
    },
    paradas: [] as Array<{ id: string; estado: string; cidade: string }>,
    
    // Etapa 3 - Carga e Veículos (reformulada)
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
    tipoValor: '', // 'combinar' ou 'valor'
    valorOfertado: '',
    
    // Etapa 4 - Configurações (reformulada)
    pedagioPagoPor: '', // 'motorista' ou 'empresa'
    pedagioDirecao: '', // 'ida', 'volta', 'ida_volta' (só quando empresa paga)
    precisaSeguro: false,
    precisaAjudante: false,
    precisaRastreador: false,
    observacoes: ''
  });

  const { estados } = useEstados();
  const { cidades: cidadesOrigem } = useCidades(formData.origem.estado);

  // Create a custom hook for fetching cities for multiple states
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

  // Get unique states from paradas
  const paradaStates = useMemo(() => {
    return [...new Set(formData.paradas.map(p => p.estado).filter(Boolean))];
  }, [formData.paradas]);

  // Fetch cities for all parada states using the custom hook
  const { data: cidadesByState = {} } = useMultipleCidades(paradaStates);

  // Fetch collaborators
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

  // Funções para gerenciar paradas
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

  // Nova função para lidar com o drag and drop
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

  // Vehicle selection functions
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

  // Body type selection functions
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

  const steps = [
    { number: 1, title: 'Colaboradores', icon: Users, description: 'Selecione os responsáveis' },
    { number: 2, title: 'Origem e Paradas', icon: MapPin, description: 'Locais de coleta e paradas' },
    { number: 3, title: 'Carga e Veículos', icon: Truck, description: 'Especificações da carga' },
    { number: 4, title: 'Configurações', icon: Settings, description: 'Detalhes finais' }
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
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

      // Convert paradas to destinos format
      const destinos = formData.paradas.map((parada, index) => ({
        id: parada.id || index.toString(),
        state: parada.estado,
        city: parada.cidade
      }));

      const freightData = {
        company_id: company.id,
        tipo_frete: 'frete_completo',
        origem_estado: formData.origem.estado,
        origem_cidade: formData.origem.cidade,
        destinos: destinos,
        tipo_mercadoria: 'Geral', // Default value required by schema
        paradas: formData.paradas,
        data_coleta: formData.dataColeta || null,
        horario_carregamento: formData.horarioColeta || null,
        peso_carga: formData.peso ? parseFloat(formData.peso) : null,
        tipos_veiculos: formData.tiposVeiculos,
        tipos_carrocerias: formData.tiposCarrocerias,
        valores_definidos: formData.tipoValor === 'valor' ? {
          tipo: 'valor_fixo',
          valor: formData.valorOfertado ? parseFloat(formData.valorOfertado) : 0
        } : {
          tipo: 'a_combinar'
        },
        precisa_ajudante: formData.precisaAjudante,
        precisa_rastreador: formData.precisaRastreador,
        precisa_seguro: formData.precisaSeguro,
        pedagio_pago_por: formData.pedagioPagoPor,
        pedagio_direcao: formData.pedagioDirecao,
        observacoes: formData.observacoes,
        collaborator_ids: formData.selectedCollaborators,
        status: 'pendente'
      };

      const { data, error } = await supabase
        .from('fretes')
        .insert([freightData])
        .select()
        .single();

      if (error) throw error;

      // Convert the single freight to the format expected by FreightSuccessDialog
      const generatedFreight = {
        id: data.id,
        codigo_agregamento: data.id, // Use the freight ID as code for now
        destino_cidade: formData.paradas.length > 0 ? formData.paradas[0].cidade : '',
        destino_estado: formData.paradas.length > 0 ? formData.paradas[0].estado : ''
      };

      setGeneratedFreights([generatedFreight]);
      setIsSubmitting(false);
      setShowVerificationDialog(true);
    } catch (error) {
      console.error('Erro ao criar frete:', error);
      setIsSubmitting(false);
      toast({
        title: "Erro",
        description: "Erro ao criar frete. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    navigate('/freight-request');
  };

  // Convert formData to the format expected by FreightVerificationDialog
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
    vehicle_price_tables: [{
      vehicleType: 'Frete Completo',
      ranges: [{
        id: '1',
        kmStart: 0,
        kmEnd: 9999,
        price: formData.valorOfertado ? parseFloat(formData.valorOfertado) : 0
      }]
    }],
    regras_agendamento: [],
    horario_carregamento: formData.horarioColeta,
    precisa_ajudante: formData.precisaAjudante,
    precisa_rastreador: formData.precisaRastreador,
    precisa_seguro: formData.precisaSeguro,
    pedagio_pago_por: formData.pedagioPagoPor,
    pedagio_direcao: formData.pedagioDirecao,
    observacoes: formData.observacoes
  };

  if (isSubmitting) {
    return <FreightLoadingAnimation open={true} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
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

      {/* Progress Bar */}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Etapa 1 - Colaboradores */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Selecionar Colaboradores Responsáveis</span>
              </CardTitle>
              <CardDescription>
                Escolha os colaboradores que serão responsáveis por este frete
              </CardDescription>
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

        {/* Etapa 2 - Origem e Paradas */}
        {currentStep === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Origem */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span>Origem</span>
                </CardTitle>
                <CardDescription>
                  Local de coleta da carga
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="origem-estado">Estado</Label>
                  <Select 
                    value={formData.origem.estado} 
                    onValueChange={(value) => setFormData({
                      ...formData,
                      origem: { estado: value, cidade: '' }
                    })}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="origem-cidade">Cidade</Label>
                  <Select 
                    value={formData.origem.cidade} 
                    onValueChange={(value) => setFormData({
                      ...formData,
                      origem: { ...formData.origem, cidade: value }
                    })}
                    disabled={!formData.origem.estado}
                  >
                    <SelectTrigger>
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

            {/* Paradas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-red-600" />
                    <span>Paradas</span>
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
                            
                            return (
                              <Draggable key={parada.id} draggableId={parada.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`border border-gray-200 rounded-lg p-4 bg-gray-50 transition-all ${
                                      snapshot.isDragging ? 'shadow-lg scale-105 bg-white border-blue-300 rotate-2' : 'hover:shadow-md'
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <div>
                                        <Label className="text-xs font-medium text-gray-600">Estado</Label>
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
                                        <Label className="text-xs font-medium text-gray-600">Cidade</Label>
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

        {/* Etapa 3 - Carga e Veículos */}
        {currentStep === 3 && (
          <div className="space-y-6">
            {/* Data e Horário de Coleta */}
            <Card>
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
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="horario-coleta">Horário de Coleta *</Label>
                    <Input
                      id="horario-coleta"
                      type="time"
                      value={formData.horarioColeta}
                      onChange={(e) => setFormData({ ...formData, horarioColeta: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dimensões e Peso */}
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
                      type="number"
                      step="0.01"
                      placeholder="Ex: 2.5"
                      value={formData.dimensoes.altura}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        dimensoes: { ...formData.dimensoes, altura: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="largura">Largura (m)</Label>
                    <Input
                      id="largura"
                      type="number"
                      step="0.01"
                      placeholder="Ex: 2.4"
                      value={formData.dimensoes.largura}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        dimensoes: { ...formData.dimensoes, largura: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="comprimento">Comprimento (m)</Label>
                    <Input
                      id="comprimento"
                      type="number"
                      step="0.01"
                      placeholder="Ex: 14.0"
                      value={formData.dimensoes.comprimento}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        dimensoes: { ...formData.dimensoes, comprimento: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="peso">Peso (kg)</Label>
                    <Input
                      id="peso"
                      type="number"
                      placeholder="Ex: 25000"
                      value={formData.peso}
                      onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tipos de Veículos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="w-5 h-5" />
                  <span>Tipos de Veículos *</span>
                </CardTitle>
                <CardDescription>
                  Selecione os tipos de veículos aceitos para este frete
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Veículos Pesados */}
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

                  {/* Veículos Médios */}
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

                  {/* Veículos Leves */}
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

            {/* Tipos de Carroceria */}
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Carroceria *</CardTitle>
                <CardDescription>
                  Selecione os tipos de carroceria aceitos para este frete
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Carrocerias Abertas */}
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

                  {/* Carrocerias Fechadas */}
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

                  {/* Carrocerias Especiais */}
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

            {/* Valor do Frete */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>Valor do Frete *</span>
                </CardTitle>
                <CardDescription>
                  Escolha como será definido o valor do frete
                </CardDescription>
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
                    <Label htmlFor="valor-ofertado">Valor Ofertado (R$)</Label>
                    <Input
                      id="valor-ofertado"
                      type="number"
                      step="0.01"
                      placeholder="Ex: 5000.00"
                      value={formData.valorOfertado}
                      onChange={(e) => setFormData({ ...formData, valorOfertado: e.target.value })}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Etapa 4 - Configurações REFORMULADA */}
        {currentStep === 4 && (
          <div className="space-y-6">
            {/* Configurações de Pedágio */}
            <Card>
              <CardHeader>
                <CardTitle>Quem paga o pedágio</CardTitle>
                <CardDescription>
                  Defina quem será responsável pelo pagamento do pedágio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="pedagio-pago-por">Responsável pelo pagamento</Label>
                  <Select 
                    value={formData.pedagioPagoPor} 
                    onValueChange={(value) => setFormData({ 
                      ...formData, 
                      pedagioPagoPor: value,
                      pedagioDirecao: value === 'motorista' ? '' : formData.pedagioDirecao
                    })}
                  >
                    <SelectTrigger>
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
                    <Label htmlFor="pedagio-direcao">Direção do pedágio</Label>
                    <Select 
                      value={formData.pedagioDirecao} 
                      onValueChange={(value) => setFormData({ ...formData, pedagioDirecao: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a direção" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ida">Apenas ida</SelectItem>
                        <SelectItem value="volta">Apenas volta</SelectItem>
                        <SelectItem value="ida_volta">IDA E VOLTA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Requisitos */}
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

            {/* Observações */}
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
                <CardDescription>
                  Adicione informações adicionais sobre o frete
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Observações adicionais sobre o frete..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
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
          >
            <span>{currentStep === 4 ? 'Finalizar' : 'Próximo'}</span>
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
        onConfirm={() => {
          setShowVerificationDialog(false);
          setShowSuccessDialog(true);
        }}
        loading={false}
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
          // Reset form for new freight
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
