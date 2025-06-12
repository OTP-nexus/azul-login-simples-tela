import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Truck, User, Plus, X, ArrowRight, CheckCircle, MapPin, Settings, DollarSign, Info, Package, GripVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useEstados, useCidades } from '@/hooks/useIBGE';
import { supabase } from '@/integrations/supabase/client';
import FreightVerificationDialog from './FreightVerificationDialog';
import FreightLoadingAnimation from './FreightLoadingAnimation';
import FreightSuccessDialog from './FreightSuccessDialog';

interface Collaborator {
  id: string;
  name: string;
  sector: string;
  phone: string;
  email?: string;
}

interface Parada {
  id: string;
  state: string;
  city: string;
  order: number;
}

interface VehicleType {
  id: string;
  type: string;
  category: 'heavy' | 'medium' | 'light';
  selected: boolean;
}

interface BodyType {
  id: string;
  type: string;
  category: 'open' | 'closed' | 'special';
  selected: boolean;
}

interface PriceRange {
  id: string;
  kmStart: number;
  kmEnd: number;
  price: number;
}

interface VehiclePriceTable {
  vehicleType: string;
  ranges: PriceRange[];
}

interface FreightFormData {
  collaborator_ids: string[];
  origem_cidade: string;
  origem_estado: string;
  paradas: Parada[];
  tipo_mercadoria: string;
  tipos_veiculos: VehicleType[];
  tipos_carrocerias: BodyType[];
  vehicle_price_tables: VehiclePriceTable[];
  regras_agendamento: string[];
  beneficios: string[];
  horario_carregamento: string;
  precisa_ajudante: boolean;
  precisa_rastreador: boolean;
  precisa_seguro: boolean;
  pedagio_pago_por: string;
  pedagio_direcao: string;
  observacoes: string;
  peso_carga: number;
  valor_carga: number;
  data_coleta: string;
  data_entrega: string;
  urgencia: string;
  temperatura_controlada: boolean;
  equipamento_especial: string;
  altura_carga: number;
  largura_carga: number;
  comprimento_carga: number;
  empilhavel: boolean;
  fragil: boolean;
  perigosa: boolean;
  numero_nota_fiscal: string;
}

interface GeneratedFreight {
  id: string;
  codigo_agregamento: string;
  paradas: Parada[];
}

const predefinedVehicleTypes: VehicleType[] = [
  // Pesados
  { id: '1', type: 'Carreta', category: 'heavy', selected: false },
  { id: '2', type: 'Carreta LS', category: 'heavy', selected: false },
  { id: '3', type: 'Vanderléia', category: 'heavy', selected: false },
  { id: '4', type: 'Bitrem', category: 'heavy', selected: false },
  // Médios
  { id: '5', type: 'Truck', category: 'medium', selected: false },
  { id: '6', type: 'Bitruck', category: 'medium', selected: false },
  // Leves
  { id: '7', type: 'Fiorino', category: 'light', selected: false },
  { id: '8', type: 'VLC', category: 'light', selected: false },
  { id: '9', type: 'VUC', category: 'light', selected: false },
  { id: '10', type: '3/4', category: 'light', selected: false },
  { id: '11', type: 'Toco', category: 'light', selected: false },
];

const predefinedBodyTypes: BodyType[] = [
  // Abertas
  { id: '1', type: 'Graneleiro', category: 'open', selected: false },
  { id: '2', type: 'Grade Baixa', category: 'open', selected: false },
  { id: '3', type: 'Prancha', category: 'open', selected: false },
  { id: '4', type: 'Caçamba', category: 'open', selected: false },
  { id: '5', type: 'Plataforma', category: 'open', selected: false },
  // Fechadas
  { id: '6', type: 'Sider', category: 'closed', selected: false },
  { id: '7', type: 'Baú', category: 'closed', selected: false },
  { id: '8', type: 'Baú Frigorífico', category: 'closed', selected: false },
  { id: '9', type: 'Baú Refrigerado', category: 'closed', selected: false },
  // Especiais
  { id: '10', type: 'Silo', category: 'special', selected: false },
  { id: '11', type: 'Cegonheiro', category: 'special', selected: false },
  { id: '12', type: 'Gaiola', category: 'special', selected: false },
  { id: '13', type: 'Tanque', category: 'special', selected: false },
  { id: '14', type: 'Bug Porta Container', category: 'special', selected: false },
  { id: '15', type: 'Munk', category: 'special', selected: false },
  { id: '16', type: 'Apenas Cavalo', category: 'special', selected: false },
  { id: '17', type: 'Cavaqueira', category: 'special', selected: false },
  { id: '18', type: 'Hopper', category: 'special', selected: false },
];

const schedulingRules = [
  'FIFO (Primeiro a chegar, primeiro a sair)',
  'Janela de tempo específica',
  'Prioridade por tipo de carga',
  'Agendamento obrigatório',
  'Chegada sem agendamento'
];

const FreightCompleteForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loadingCollaborators, setLoadingCollaborators] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [draggedParada, setDraggedParada] = useState<string | null>(null);
  
  // Dialog states
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [generatedFreights, setGeneratedFreights] = useState<GeneratedFreight[]>([]);
  
  const [formData, setFormData] = useState<FreightFormData>({
    collaborator_ids: [],
    origem_cidade: '',
    origem_estado: '',
    paradas: [],
    tipo_mercadoria: '',
    tipos_veiculos: [...predefinedVehicleTypes],
    tipos_carrocerias: [...predefinedBodyTypes],
    vehicle_price_tables: [],
    regras_agendamento: [],
    beneficios: [],
    horario_carregamento: '',
    precisa_ajudante: false,
    precisa_rastreador: false,
    precisa_seguro: false,
    pedagio_pago_por: '',
    pedagio_direcao: '',
    observacoes: '',
    peso_carga: 0,
    valor_carga: 0,
    data_coleta: '',
    data_entrega: '',
    urgencia: 'normal',
    temperatura_controlada: false,
    equipamento_especial: '',
    altura_carga: 0,
    largura_carga: 0,
    comprimento_carga: 0,
    empilhavel: false,
    fragil: false,
    perigosa: false,
    numero_nota_fiscal: ''
  });
  
  const { estados, loading: loadingEstados } = useEstados();
  const origemCidades = useCidades(formData.origem_estado);
  const [paradaCidades, setParadaCidades] = useState<{[key: string]: any}>({});

  const steps = [
    { number: 1, title: 'Colaboradores', description: 'Selecione os responsáveis' },
    { number: 2, title: 'Origem e Paradas', description: 'Defina a rota' },
    { number: 3, title: 'Carga e Veículos', description: 'Configure tipos e carga' },
    { number: 4, title: 'Detalhes do Frete', description: 'Informações específicas' }
  ];

  const progressValue = (currentStep / steps.length) * 100;

  const fetchCollaborators = async () => {
    if (!user) return;

    try {
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (companyError || !company) {
        throw new Error('Empresa não encontrada');
      }

      const { data: collaboratorsData, error: collaboratorsError } = await supabase
        .from('collaborators')
        .select('*')
        .eq('company_id', company.id)
        .order('name', { ascending: true });

      if (collaboratorsError) {
        throw collaboratorsError;
      }

      setCollaborators(collaboratorsData || []);
    } catch (error: any) {
      console.error('Erro ao buscar colaboradores:', error);
      toast({
        title: "Erro ao carregar colaboradores",
        description: error.message || "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setLoadingCollaborators(false);
    }
  };

  useEffect(() => {
    fetchCollaborators();
  }, [user]);

  useEffect(() => {
    const selectedVehicles = formData.tipos_veiculos.filter(v => v.selected);
    const currentTables = formData.vehicle_price_tables;
    
    const updatedTables = currentTables.filter(table => 
      selectedVehicles.some(vehicle => vehicle.type === table.vehicleType)
    );
    
    selectedVehicles.forEach(vehicle => {
      if (!updatedTables.some(table => table.vehicleType === vehicle.type)) {
        updatedTables.push({
          vehicleType: vehicle.type,
          ranges: [{
            id: Date.now().toString(),
            kmStart: 0,
            kmEnd: 100,
            price: 0
          }]
        });
      }
    });
    
    setFormData(prev => ({
      ...prev,
      vehicle_price_tables: updatedTables
    }));
  }, [formData.tipos_veiculos]);

  const fetchCidadesForParada = async (uf: string, paradaId: string) => {
    if (!uf) return;
    
    try {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`);
      const cidades = await response.json();
      setParadaCidades(prev => ({
        ...prev,
        [paradaId]: cidades
      }));
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
    }
  };

  const handleBack = () => {
    navigate('/freight-request');
  };

  const handleBackToDashboard = () => {
    navigate('/company-dashboard');
  };

  const handleInputChange = (field: keyof FreightFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCollaboratorToggle = (collaboratorId: string) => {
    setFormData(prev => ({
      ...prev,
      collaborator_ids: prev.collaborator_ids.includes(collaboratorId)
        ? prev.collaborator_ids.filter(id => id !== collaboratorId)
        : [...prev.collaborator_ids, collaboratorId]
    }));
  };

  const addParada = () => {
    const newOrder = formData.paradas.length + 1;
    const newParada: Parada = {
      id: Date.now().toString(),
      state: '',
      city: '',
      order: newOrder
    };
    setFormData(prev => ({
      ...prev,
      paradas: [...prev.paradas, newParada]
    }));
  };

  const removeParada = (id: string) => {
    setFormData(prev => {
      const filteredParadas = prev.paradas.filter(parada => parada.id !== id);
      // Reordenar as paradas após remoção
      const reorderedParadas = filteredParadas.map((parada, index) => ({
        ...parada,
        order: index + 1
      }));
      return {
        ...prev,
        paradas: reorderedParadas
      };
    });
    setParadaCidades(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };

  const updateParada = (id: string, field: 'state' | 'city', value: string) => {
    setFormData(prev => ({
      ...prev,
      paradas: prev.paradas.map(parada =>
        parada.id === id ? { ...parada, [field]: value } : parada
      )
    }));

    if (field === 'state') {
      fetchCidadesForParada(value, id);
      setFormData(prev => ({
        ...prev,
        paradas: prev.paradas.map(parada =>
          parada.id === id ? { ...parada, city: '' } : parada
        )
      }));
    }
  };

  // Drag and Drop functions
  const handleDragStart = (e: React.DragEvent, paradaId: string) => {
    setDraggedParada(paradaId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetParadaId: string) => {
    e.preventDefault();
    if (!draggedParada || draggedParada === targetParadaId) return;

    setFormData(prev => {
      const paradas = [...prev.paradas];
      const draggedIndex = paradas.findIndex(p => p.id === draggedParada);
      const targetIndex = paradas.findIndex(p => p.id === targetParadaId);

      if (draggedIndex === -1 || targetIndex === -1) return prev;

      // Remove the dragged item and insert it at the target position
      const [draggedItem] = paradas.splice(draggedIndex, 1);
      paradas.splice(targetIndex, 0, draggedItem);

      // Update order numbers
      const reorderedParadas = paradas.map((parada, index) => ({
        ...parada,
        order: index + 1
      }));

      return {
        ...prev,
        paradas: reorderedParadas
      };
    });

    setDraggedParada(null);
  };

  const handleDragEnd = () => {
    setDraggedParada(null);
  };

  const toggleVehicleType = (id: string) => {
    setFormData(prev => ({
      ...prev,
      tipos_veiculos: prev.tipos_veiculos.map(vehicle =>
        vehicle.id === id ? { ...vehicle, selected: !vehicle.selected } : vehicle
      )
    }));
  };

  const toggleBodyType = (id: string) => {
    setFormData(prev => ({
      ...prev,
      tipos_carrocerias: prev.tipos_carrocerias.map(body =>
        body.id === id ? { ...body, selected: !body.selected } : body
      )
    }));
  };

  const addPriceRange = (vehicleType: string) => {
    setFormData(prev => ({
      ...prev,
      vehicle_price_tables: prev.vehicle_price_tables.map(table =>
        table.vehicleType === vehicleType
          ? {
              ...table,
              ranges: [
                ...table.ranges,
                {
                  id: Date.now().toString(),
                  kmStart: 0,
                  kmEnd: 100,
                  price: 0
                }
              ]
            }
          : table
      )
    }));
  };

  const removePriceRange = (vehicleType: string, rangeId: string) => {
    setFormData(prev => ({
      ...prev,
      vehicle_price_tables: prev.vehicle_price_tables.map(table =>
        table.vehicleType === vehicleType
          ? {
              ...table,
              ranges: table.ranges.filter(range => range.id !== rangeId)
            }
          : table
      )
    }));
  };

  const updatePriceRange = (vehicleType: string, rangeId: string, field: keyof PriceRange, value: any) => {
    setFormData(prev => ({
      ...prev,
      vehicle_price_tables: prev.vehicle_price_tables.map(table =>
        table.vehicleType === vehicleType
          ? {
              ...table,
              ranges: table.ranges.map(range =>
                range.id === rangeId ? { ...range, [field]: value } : range
              )
            }
          : table
      )
    }));
  };

  const addBenefit = () => {
    const benefit = prompt('Digite o benefício:');
    if (benefit && benefit.trim()) {
      setFormData(prev => ({
        ...prev,
        beneficios: [...prev.beneficios, benefit.trim()]
      }));
    }
  };

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      beneficios: prev.beneficios.filter((_, i) => i !== index)
    }));
  };

  const toggleSchedulingRule = (rule: string) => {
    setFormData(prev => ({
      ...prev,
      regras_agendamento: prev.regras_agendamento.includes(rule)
        ? prev.regras_agendamento.filter(r => r !== rule)
        : [...prev.regras_agendamento, rule]
    }));
  };

  const getSelectedCollaborators = () => {
    return collaborators.filter(collaborator => 
      formData.collaborator_ids.includes(collaborator.id)
    );
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (formData.collaborator_ids.length === 0) {
        toast({
          title: "Selecione colaboradores",
          description: "É necessário selecionar pelo menos um colaborador responsável",
          variant: "destructive"
        });
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.origem_cidade || !formData.origem_estado) {
        toast({
          title: "Erro de validação",
          description: "Informe a cidade e estado de origem",
          variant: "destructive"
        });
        return;
      }
      if (formData.paradas.length === 0) {
        toast({
          title: "Erro de validação",
          description: "Adicione pelo menos uma parada",
          variant: "destructive"
        });
        return;
      }
      const invalidParadas = formData.paradas.some(parada => !parada.city || !parada.state);
      if (invalidParadas) {
        toast({
          title: "Erro de validação",
          description: "Preencha todas as paradas adicionadas",
          variant: "destructive"
        });
        return;
      }
    } else if (currentStep === 3) {
      if (!formData.tipo_mercadoria) {
        toast({
          title: "Erro de validação",
          description: "Informe o tipo de mercadoria",
          variant: "destructive"
        });
        return;
      }
      const selectedVehicles = formData.tipos_veiculos.filter(v => v.selected);
      if (selectedVehicles.length === 0) {
        toast({
          title: "Erro de validação",
          description: "Selecione pelo menos um tipo de veículo",
          variant: "destructive"
        });
        return;
      }
    }
    
    setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    setShowVerificationDialog(true);
  };

  const handleConfirmSubmit = async () => {
    setShowVerificationDialog(false);
    setShowLoadingAnimation(true);

    try {
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (companyError || !company) {
        throw new Error('Empresa não encontrada');
      }

      const freightData = {
        company_id: company.id,
        collaborator_ids: formData.collaborator_ids,
        tipo_frete: 'completo',
        origem_cidade: formData.origem_cidade,
        origem_estado: formData.origem_estado,
        paradas: formData.paradas.sort((a, b) => a.order - b.order),
        tipo_mercadoria: formData.tipo_mercadoria,
        tipos_veiculos: formData.tipos_veiculos.filter(v => v.selected),
        tipos_carrocerias: formData.tipos_carrocerias.filter(b => b.selected),
        tabelas_preco: formData.vehicle_price_tables,
        regras_agendamento: formData.regras_agendamento,
        beneficios: formData.beneficios,
        horario_carregamento: formData.horario_carregamento || null,
        precisa_ajudante: formData.precisa_ajudante,
        precisa_rastreador: formData.precisa_rastreador,
        precisa_seguro: formData.precisa_seguro,
        pedagio_pago_por: formData.pedagio_pago_por || null,
        pedagio_direcao: formData.pedagio_direcao || null,
        observacoes: formData.observacoes || null,
        peso_carga: formData.peso_carga || null,
        valor_carga: formData.valor_carga || null,
        data_coleta: formData.data_coleta || null,
        data_entrega: formData.data_entrega || null,
        status: 'pendente'
      };

      const { data: newFrete, error: freightError } = await supabase
        .from('fretes')
        .insert([freightData])
        .select()
        .single();

      if (freightError) {
        throw freightError;
      }

      const generatedCode = `FC${Date.now().toString().slice(-6)}`;
      
      const { error: updateError } = await supabase
        .from('fretes')
        .update({ codigo_agregamento: generatedCode })
        .eq('id', newFrete.id);

      if (updateError) {
        throw updateError;
      }

      setGeneratedFreights([{
        id: newFrete.id,
        codigo_agregamento: generatedCode,
        paradas: formData.paradas.sort((a, b) => a.order - b.order)
      }]);

      setTimeout(() => {
        setShowLoadingAnimation(false);
        setShowSuccessDialog(true);
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao criar frete:', error);
      setShowLoadingAnimation(false);
      toast({
        title: "Erro ao criar frete",
        description: error.message || "Tente novamente",
        variant: "destructive"
      });
    }
  };

  const handleNewFreight = () => {
    setShowSuccessDialog(false);
    setCurrentStep(1);
    setFormData({
      collaborator_ids: [],
      origem_cidade: '',
      origem_estado: '',
      paradas: [],
      tipo_mercadoria: '',
      tipos_veiculos: [...predefinedVehicleTypes],
      tipos_carrocerias: [...predefinedBodyTypes],
      vehicle_price_tables: [],
      regras_agendamento: [],
      beneficios: [],
      horario_carregamento: '',
      precisa_ajudante: false,
      precisa_rastreador: false,
      precisa_seguro: false,
      pedagio_pago_por: '',
      pedagio_direcao: '',
      observacoes: '',
      peso_carga: 0,
      valor_carga: 0,
      data_coleta: '',
      data_entrega: '',
      urgencia: 'normal',
      temperatura_controlada: false,
      equipamento_especial: '',
      altura_carga: 0,
      largura_carga: 0,
      comprimento_carga: 0,
      empilhavel: false,
      fragil: false,
      perigosa: false,
      numero_nota_fiscal: ''
    });
  };

  const selectedCollaborators = getSelectedCollaborators();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Frete Completo</h1>
                <p className="text-gray-600">Crie uma solicitação de frete com múltiplas paradas</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Truck className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.number ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.number}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-24 h-0.5 ml-4 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={progressValue} className="h-2" />
          <div className="mt-2">
            <h2 className="text-lg font-semibold text-gray-900">{steps[currentStep - 1].title}</h2>
            <p className="text-gray-600">{steps[currentStep - 1].description}</p>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              {/* Step 1: Colaboradores */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <User className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-semibold text-gray-800">Selecione os Colaboradores Responsáveis</h3>
                  </div>

                  {loadingCollaborators ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Carregando colaboradores...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {collaborators.map((collaborator) => (
                        <div
                          key={collaborator.id}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                            formData.collaborator_ids.includes(collaborator.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                          onClick={() => handleCollaboratorToggle(collaborator.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{collaborator.name}</h4>
                              <p className="text-sm text-gray-600">{collaborator.sector}</p>
                              <p className="text-sm text-gray-500">{collaborator.phone}</p>
                              {collaborator.email && (
                                <p className="text-sm text-gray-500">{collaborator.email}</p>
                              )}
                            </div>
                            <Checkbox
                              checked={formData.collaborator_ids.includes(collaborator.id)}
                              onChange={() => handleCollaboratorToggle(collaborator.id)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.collaborator_ids.length > 0 && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Colaboradores Selecionados:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCollaborators.map((collaborator) => (
                          <span
                            key={collaborator.id}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {collaborator.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Origem e Paradas */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* Origem */}
                  <div className="space-y-4">
                    <Label className="text-lg font-medium text-gray-800">Origem</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="origem_estado">Estado de Origem</Label>
                        <Select
                          value={formData.origem_estado}
                          onValueChange={(value) => handleInputChange('origem_estado', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o estado" />
                          </SelectTrigger>
                          <SelectContent>
                            {estados.map((estado) => (
                              <SelectItem key={estado.id} value={estado.sigla}>
                                {estado.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="origem_cidade">Cidade de Origem</Label>
                        <Select
                          value={formData.origem_cidade}
                          onValueChange={(value) => handleInputChange('origem_cidade', value)}
                          disabled={!formData.origem_estado}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a cidade" />
                          </SelectTrigger>
                          <SelectContent>
                            {origemCidades.cidades.map((cidade) => (
                              <SelectItem key={cidade.id} value={cidade.nome}>
                                {cidade.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Paradas */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-medium text-gray-800">Paradas do Frete</Label>
                      <Button
                        type="button"
                        onClick={addParada}
                        className="flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Adicionar Parada</span>
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {formData.paradas
                        .sort((a, b) => a.order - b.order)
                        .map((parada, index) => (
                        <div
                          key={parada.id}
                          className={`p-4 border rounded-lg bg-white ${
                            draggedParada === parada.id ? 'opacity-50' : ''
                          }`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, parada.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, parada.id)}
                          onDragEnd={handleDragEnd}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="cursor-move">
                              <GripVertical className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-blue-600" />
                              <span className="font-medium text-gray-800">Parada {parada.order}</span>
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Select
                                value={parada.state}
                                onValueChange={(value) => updateParada(parada.id, 'state', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                  {estados.map((estado) => (
                                    <SelectItem key={estado.id} value={estado.sigla}>
                                      {estado.nome}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Select
                                value={parada.city}
                                onValueChange={(value) => updateParada(parada.id, 'city', value)}
                                disabled={!parada.state}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Cidade" />
                                </SelectTrigger>
                                <SelectContent>
                                  {(paradaCidades[parada.id] || []).map((cidade: any) => (
                                    <SelectItem key={cidade.id} value={cidade.nome}>
                                      {cidade.nome}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeParada(parada.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {formData.paradas.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Nenhuma parada adicionada ainda</p>
                        <p className="text-sm">Clique em "Adicionar Parada" para começar</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Carga e Veículos */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Tipo de Mercadoria */}
                  <div className="space-y-4">
                    <Label className="text-lg font-medium text-gray-800">Tipo de Mercadoria</Label>
                    <Input
                      placeholder="Ex: Produtos alimentícios, materiais de construção..."
                      value={formData.tipo_mercadoria}
                      onChange={(e) => handleInputChange('tipo_mercadoria', e.target.value)}
                    />
                  </div>

                  {/* Tipos de Veículos */}
                  <div className="space-y-4">
                    <Label className="text-lg font-medium text-gray-800">Tipos de Veículos</Label>
                    <div className="space-y-4">
                      {['heavy', 'medium', 'light'].map(category => (
                        <div key={category} className="space-y-2">
                          <h4 className="font-medium text-gray-700 capitalize">
                            {category === 'heavy' ? 'Pesados' : category === 'medium' ? 'Médios' : 'Leves'}
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {formData.tipos_veiculos
                              .filter(vehicle => vehicle.category === category)
                              .map(vehicle => (
                              <div
                                key={vehicle.id}
                                className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 text-center ${
                                  vehicle.selected
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-blue-300'
                                }`}
                                onClick={() => toggleVehicleType(vehicle.id)}
                              >
                                <Truck className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                                <span className="text-sm font-medium">{vehicle.type}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tipos de Carroceria */}
                  <div className="space-y-4">
                    <Label className="text-lg font-medium text-gray-800">Tipos de Carroceria</Label>
                    <div className="space-y-4">
                      {['open', 'closed', 'special'].map(category => (
                        <div key={category} className="space-y-2">
                          <h4 className="font-medium text-gray-700">
                            {category === 'open' ? 'Abertas' : category === 'closed' ? 'Fechadas' : 'Especiais'}
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {formData.tipos_carrocerias
                              .filter(body => body.category === category)
                              .map(body => (
                              <div
                                key={body.id}
                                className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 text-center ${
                                  body.selected
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-blue-300'
                                }`}
                                onClick={() => toggleBodyType(body.id)}
                              >
                                <Package className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                                <span className="text-sm font-medium">{body.type}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tabelas de Preço por Veículo */}
                  {formData.vehicle_price_tables.length > 0 && (
                    <div className="space-y-4">
                      <Label className="text-lg font-medium text-gray-800">Tabelas de Preço por Quilometragem</Label>
                      {formData.vehicle_price_tables.map((table) => (
                        <Card key={table.vehicleType} className="p-4">
                          <h4 className="font-medium text-gray-800 mb-4 flex items-center space-x-2">
                            <DollarSign className="w-4 h-4" />
                            <span>{table.vehicleType}</span>
                          </h4>
                          <div className="space-y-3">
                            {table.ranges.map((range) => (
                              <div key={range.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  <Input
                                    type="number"
                                    placeholder="De (km)"
                                    value={range.kmStart}
                                    onChange={(e) => updatePriceRange(table.vehicleType, range.id, 'kmStart', Number(e.target.value))}
                                    className="w-24"
                                  />
                                  <span className="text-gray-500">até</span>
                                  <Input
                                    type="number"
                                    placeholder="Até (km)"
                                    value={range.kmEnd}
                                    onChange={(e) => updatePriceRange(table.vehicleType, range.id, 'kmEnd', Number(e.target.value))}
                                    className="w-24"
                                  />
                                  <span className="text-gray-500">km</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-500">R$</span>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Preço por km"
                                    value={range.price}
                                    onChange={(e) => updatePriceRange(table.vehicleType, range.id, 'price', Number(e.target.value))}
                                    className="w-32"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removePriceRange(table.vehicleType, range.id)}
                                  className="text-red-600 hover:text-red-800"
                                  disabled={table.ranges.length === 1}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addPriceRange(table.vehicleType)}
                              className="w-full"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Adicionar Faixa de Preço
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Informações da Carga */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="peso_carga">Peso da Carga (kg)</Label>
                      <Input
                        id="peso_carga"
                        type="number"
                        placeholder="Ex: 1000"
                        value={formData.peso_carga}
                        onChange={(e) => handleInputChange('peso_carga', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="valor_carga">Valor da Carga (R$)</Label>
                      <Input
                        id="valor_carga"
                        type="number"
                        step="0.01"
                        placeholder="Ex: 50000.00"
                        value={formData.valor_carga}
                        onChange={(e) => handleInputChange('valor_carga', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Detalhes do Frete */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  {/* Datas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="data_coleta">Data de Coleta</Label>
                      <Input
                        id="data_coleta"
                        type="date"
                        value={formData.data_coleta}
                        onChange={(e) => handleInputChange('data_coleta', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="data_entrega">Data de Entrega</Label>
                      <Input
                        id="data_entrega"
                        type="date"
                        value={formData.data_entrega}
                        onChange={(e) => handleInputChange('data_entrega', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Horário de Carregamento */}
                  <div>
                    <Label htmlFor="horario_carregamento">Horário de Carregamento</Label>
                    <Input
                      id="horario_carregamento"
                      type="time"
                      value={formData.horario_carregamento}
                      onChange={(e) => handleInputChange('horario_carregamento', e.target.value)}
                    />
                  </div>

                  {/* Opções Adicionais */}
                  <div className="space-y-4">
                    <Label className="text-lg font-medium text-gray-800">Opções Adicionais</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="precisa_ajudante"
                          checked={formData.precisa_ajudante}
                          onCheckedChange={(checked) => handleInputChange('precisa_ajudante', checked)}
                        />
                        <Label htmlFor="precisa_ajudante">Precisa de Ajudante</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="precisa_rastreador"
                          checked={formData.precisa_rastreador}
                          onCheckedChange={(checked) => handleInputChange('precisa_rastreador', checked)}
                        />
                        <Label htmlFor="precisa_rastreador">Precisa de Rastreador</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="precisa_seguro"
                          checked={formData.precisa_seguro}
                          onCheckedChange={(checked) => handleInputChange('precisa_seguro', checked)}
                        />
                        <Label htmlFor="precisa_seguro">Precisa de Seguro</Label>
                      </div>
                    </div>
                  </div>

                  {/* Pedágio */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="pedagio_pago_por">Pedágio Pago Por</Label>
                      <Select
                        value={formData.pedagio_pago_por}
                        onValueChange={(value) => handleInputChange('pedagio_pago_por', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione quem paga" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="embarcador">Embarcador</SelectItem>
                          <SelectItem value="transportador">Transportador</SelectItem>
                          <SelectItem value="dividido">Dividido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="pedagio_direcao">Direção do Pedágio</Label>
                      <Select
                        value={formData.pedagio_direcao}
                        onValueChange={(value) => handleInputChange('pedagio_direcao', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a direção" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ida">Ida</SelectItem>
                          <SelectItem value="volta">Volta</SelectItem>
                          <SelectItem value="ida_volta">Ida e Volta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Regras de Agendamento */}
                  <div className="space-y-4">
                    <Label className="text-lg font-medium text-gray-800">Regras de Agendamento</Label>
                    <div className="space-y-2">
                      {schedulingRules.map((rule) => (
                        <div key={rule} className="flex items-center space-x-2">
                          <Checkbox
                            id={`rule_${rule}`}
                            checked={formData.regras_agendamento.includes(rule)}
                            onCheckedChange={() => toggleSchedulingRule(rule)}
                          />
                          <Label htmlFor={`rule_${rule}`} className="text-sm">{rule}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Benefícios */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-medium text-gray-800">Benefícios Oferecidos</Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addBenefit}
                        className="flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Adicionar Benefício</span>
                      </Button>
                    </div>
                    {formData.beneficios.length > 0 && (
                      <div className="space-y-2">
                        {formData.beneficios.map((benefit, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm">{benefit}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeBenefit(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Observações */}
                  <div>
                    <Label htmlFor="observacoes">Observações Adicionais</Label>
                    <Textarea
                      id="observacoes"
                      placeholder="Informações adicionais sobre o frete..."
                      value={formData.observacoes}
                      onChange={(e) => handleInputChange('observacoes', e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreviousStep}
                  disabled={currentStep === 1}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </Button>
                
                {currentStep < steps.length ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  >
                    <span>Próximo</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Criar Frete Completo</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Dialogs */}
      <FreightVerificationDialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
        formData={{
          collaborators: selectedCollaborators,
          origem: `${formData.origem_cidade}/${formData.origem_estado}`,
          paradas: formData.paradas.sort((a, b) => a.order - b.order),
          tipoMercadoria: formData.tipo_mercadoria,
          tiposVeiculos: formData.tipos_veiculos.filter(v => v.selected),
          tiposCarrocerias: formData.tipos_carrocerias.filter(b => b.selected)
        }}
        onConfirm={handleConfirmSubmit}
      />

      <FreightLoadingAnimation open={showLoadingAnimation} />

      <FreightSuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        generatedFreights={generatedFreights}
        onNewFreight={handleNewFreight}
        onBackToDashboard={handleBackToDashboard}
      />
    </div>
  );
};

export default FreightCompleteForm;
