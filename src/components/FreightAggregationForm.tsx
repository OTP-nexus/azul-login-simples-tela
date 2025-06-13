import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Truck, User, Plus, X, ArrowRight, CheckCircle, MapPin, Settings, DollarSign, Info } from 'lucide-react';
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

interface Destination {
  id: string;
  state: string;
  city: string;
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
  destinos: Destination[];
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
}

interface GeneratedFreight {
  id: string;
  codigo_agregamento: string;
  destino_cidade: string;
  destino_estado: string;
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

const FreightAggregationForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loadingCollaborators, setLoadingCollaborators] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Dialog states
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [generatedFreights, setGeneratedFreights] = useState<GeneratedFreight[]>([]);
  
  const [formData, setFormData] = useState<FreightFormData>({
    collaborator_ids: [],
    origem_cidade: '',
    origem_estado: '',
    destinos: [],
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
    observacoes: ''
  });
  
  const [newBenefit, setNewBenefit] = useState('');
  
  const { estados, loading: loadingEstados } = useEstados();
  const origemCidades = useCidades(formData.origem_estado);
  const [destinoCidades, setDestinoCidades] = useState<{[key: string]: any}>({});

  const steps = [
    { number: 1, title: 'Colaboradores', description: 'Selecione os responsáveis' },
    { number: 2, title: 'Origem e Destinos', description: 'Defina as rotas' },
    { number: 3, title: 'Carga e Veículos', description: 'Configure tipos e carga' },
    { number: 4, title: 'Configurações', description: 'Regras e condições' }
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

  // Atualizar tabelas de preço quando veículos são selecionados/deselecionados
  useEffect(() => {
    const selectedVehicles = formData.tipos_veiculos.filter(v => v.selected);
    const currentTables = formData.vehicle_price_tables;
    
    // Remover tabelas de veículos que não estão mais selecionados
    const updatedTables = currentTables.filter(table => 
      selectedVehicles.some(vehicle => vehicle.type === table.vehicleType)
    );
    
    // Adicionar tabelas para novos veículos selecionados
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

  const fetchCidadesForDestino = async (uf: string, destinoId: string) => {
    if (!uf) return;
    
    try {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`);
      const cidades = await response.json();
      setDestinoCidades(prev => ({
        ...prev,
        [destinoId]: cidades
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

  const addDestination = () => {
    const newDestination: Destination = {
      id: Date.now().toString(),
      state: '',
      city: ''
    };
    setFormData(prev => ({
      ...prev,
      destinos: [...prev.destinos, newDestination]
    }));
  };

  const removeDestination = (id: string) => {
    setFormData(prev => ({
      ...prev,
      destinos: prev.destinos.filter(dest => dest.id !== id)
    }));
    setDestinoCidades(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };

  const updateDestination = (id: string, field: 'state' | 'city', value: string) => {
    setFormData(prev => ({
      ...prev,
      destinos: prev.destinos.map(dest =>
        dest.id === id ? { ...dest, [field]: value } : dest
      )
    }));

    if (field === 'state') {
      fetchCidadesForDestino(value, id);
      setFormData(prev => ({
        ...prev,
        destinos: prev.destinos.map(dest =>
          dest.id === id ? { ...dest, city: '' } : dest
        )
      }));
    }
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

  // Funções para gerenciar tabelas de preço por veículo
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
    if (newBenefit && newBenefit.trim()) {
      setFormData(prev => ({
        ...prev,
        beneficios: [...prev.beneficios, newBenefit.trim()]
      }));
      setNewBenefit(''); // Limpar o input após adicionar
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
      if (formData.destinos.length === 0) {
        toast({
          title: "Erro de validação",
          description: "Adicione pelo menos um destino",
          variant: "destructive"
        });
        return;
      }
      const invalidDestinations = formData.destinos.some(dest => !dest.city || !dest.state);
      if (invalidDestinations) {
        toast({
          title: "Erro de validação",
          description: "Preencha todos os destinos adicionados",
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

  // New function to handle opening verification dialog
  const handleOpenVerificationDialog = () => {
    // Final validation before showing verification dialog
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

    setShowVerificationDialog(true);
  };

  // Function to handle editing from verification dialog
  const handleEditFromVerification = () => {
    setShowVerificationDialog(false);
    // User stays on current step to edit
  };

  // Updated submit function for creating multiple freights
  const handleConfirmFreight = async () => {
    setShowVerificationDialog(false);
    setShowLoadingAnimation(true);
    
    try {
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (companyError || !company) {
        throw new Error('Empresa não encontrada');
      }

      // Prepare base freight data (same for all freights)
      const baseFreightData = {
        company_id: company.id,
        collaborator_ids: formData.collaborator_ids,
        tipo_frete: 'agregamento',
        origem_estado: formData.origem_estado,
        origem_cidade: formData.origem_cidade,
        tipo_mercadoria: formData.tipo_mercadoria,
        peso_carga: null,
        valor_carga: null,
        tipos_veiculos: JSON.stringify(formData.tipos_veiculos.filter(v => v.selected)),
        tipos_carrocerias: JSON.stringify(formData.tipos_carrocerias.filter(b => b.selected)),
        tabelas_preco: JSON.stringify(formData.vehicle_price_tables),
        regras_agendamento: JSON.stringify(formData.regras_agendamento),
        beneficios: JSON.stringify(formData.beneficios),
        horario_carregamento: formData.horario_carregamento || null,
        precisa_ajudante: formData.precisa_ajudante,
        precisa_rastreador: formData.precisa_rastreador,
        precisa_seguro: formData.precisa_seguro,
        pedagio_pago_por: formData.pedagio_pago_por || null,
        pedagio_direcao: formData.pedagio_direcao || null,
        observacoes: formData.observacoes || null
      };

      const createdFreights: GeneratedFreight[] = [];

      // Create one freight for each destination
      for (const destino of formData.destinos) {
        const freightData = {
          ...baseFreightData,
          destinos: JSON.stringify([destino])
        };

        const { data: freteData, error: freteError } = await supabase
          .from('fretes')
          .insert([freightData])
          .select()
          .single();

        if (freteError) {
          throw freteError;
        }

        // Add to created freights list
        createdFreights.push({
          id: freteData.id,
          codigo_agregamento: freteData.codigo_agregamento,
          destino_cidade: destino.city,
          destino_estado: destino.state
        });

        // Save price tables for this freight
        const priceTableInserts = [];
        for (const vehicleTable of formData.vehicle_price_tables) {
          for (const range of vehicleTable.ranges) {
            priceTableInserts.push({
              frete_id: freteData.id,
              vehicle_type: vehicleTable.vehicleType,
              km_start: range.kmStart,
              km_end: range.kmEnd,
              price: range.price
            });
          }
        }

        if (priceTableInserts.length > 0) {
          const { error: priceError } = await supabase
            .from('freight_price_tables')
            .insert(priceTableInserts);

          if (priceError) {
            throw priceError;
          }
        }
      }

      setGeneratedFreights(createdFreights);
      setShowLoadingAnimation(false);
      setShowSuccessDialog(true);

      toast({
        title: "Sucesso!",
        description: `${createdFreights.length === 1 ? 'Frete criado' : `${createdFreights.length} fretes criados`} com sucesso!`
      });

    } catch (error: any) {
      console.error('Erro ao salvar frete:', error);
      setShowLoadingAnimation(false);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar a solicitação. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Function to handle creating new freight from success dialog
  const handleNewFreight = () => {
    setShowSuccessDialog(false);
    setFormData({
      collaborator_ids: [],
      origem_cidade: '',
      origem_estado: '',
      destinos: [],
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
      observacoes: ''
    });
    setCurrentStep(1);
  };

  // Function to handle going back to dashboard from success dialog
  const handleBackToDashboardFromSuccess = () => {
    setShowSuccessDialog(false);
    navigate('/company-dashboard');
  };

  if (loadingCollaborators) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (collaborators.length === 0) {
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
                  <h1 className="text-xl font-bold text-gray-800">Frete de Agregamento</h1>
                  <p className="text-sm text-gray-600">Solicitação de frete</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Nenhum colaborador cadastrado
              </h3>
              <p className="text-base text-gray-600 mb-6">
                Para solicitar um frete, você precisa ter pelo menos um colaborador cadastrado como responsável pelo pedido.
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => navigate('/collaborator-registration')}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Colaborador
                </Button>
                <Button
                  onClick={handleBackToDashboard}
                  variant="outline"
                >
                  Voltar ao Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const selectedCollaborators = getSelectedCollaborators();

  return (
    <>
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
                  <h1 className="text-xl font-bold text-gray-800">Frete de Agregamento</h1>
                  <p className="text-sm text-gray-600">Solicitação de frete para motoristas agregados</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    currentStep > step.number 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : currentStep === step.number 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : 'bg-gray-200 border-gray-300 text-gray-500'
                  }`}>
                    {currentStep > step.number ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="ml-3">
                    <div className={`text-sm font-medium ${
                      currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      currentStep > step.number ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <Progress value={progressValue} className="w-full" />
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  {currentStep === 1 && <User className="w-6 h-6 text-white" />}
                  {currentStep === 2 && <MapPin className="w-6 h-6 text-white" />}
                  {currentStep === 3 && <Truck className="w-6 h-6 text-white" />}
                  {currentStep === 4 && <Settings className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-800">
                    {steps[currentStep - 1].title}
                  </CardTitle>
                  <CardDescription>
                    {steps[currentStep - 1].description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-gray-700">
                      Colaboradores Responsáveis *
                    </Label>
                    <p className="text-sm text-gray-600">
                      Selecione um ou mais colaboradores que serão responsáveis por este pedido de frete.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border rounded-lg p-4">
                      {collaborators.map((collaborator) => (
                        <div key={collaborator.id} className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-gray-50">
                          <Checkbox
                            id={collaborator.id}
                            checked={formData.collaborator_ids.includes(collaborator.id)}
                            onCheckedChange={() => handleCollaboratorToggle(collaborator.id)}
                          />
                          <label htmlFor={collaborator.id} className="flex-1 cursor-pointer">
                            <div className="font-medium text-gray-800">{collaborator.name}</div>
                            <div className="text-sm text-gray-600">{collaborator.sector}</div>
                            <div className="text-xs text-gray-500">{collaborator.phone}</div>
                          </label>
                        </div>
                      ))}
                    </div>

                    {selectedCollaborators.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-green-700">
                          Colaboradores Selecionados ({selectedCollaborators.length})
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedCollaborators.map((collaborator) => (
                            <div
                              key={collaborator.id}
                              className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                            >
                              <span>{collaborator.name}</span>
                              <button
                                type="button"
                                onClick={() => handleCollaboratorToggle(collaborator.id)}
                                className="hover:bg-green-200 rounded-full p-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                      disabled={formData.collaborator_ids.length === 0}
                    >
                      Próximo
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* Origem */}
                  <div className="space-y-4">
                    <Label className="text-lg font-medium text-gray-800">Origem</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="origem_estado" className="text-sm font-medium text-gray-700">
                          Estado de Origem *
                        </Label>
                        <Select 
                          value={formData.origem_estado} 
                          onValueChange={(value) => {
                            handleInputChange('origem_estado', value);
                            handleInputChange('origem_cidade', ''); // Limpar cidade quando mudar estado
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o estado" />
                          </SelectTrigger>
                          <SelectContent>
                            {loadingEstados ? (
                              <SelectItem value="loading" disabled>Carregando...</SelectItem>
                            ) : (
                              estados.map((estado) => (
                                <SelectItem key={estado.id} value={estado.sigla}>
                                  {estado.nome} ({estado.sigla})
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="origem_cidade" className="text-sm font-medium text-gray-700">
                          Cidade de Origem *
                        </Label>
                        <Select 
                          value={formData.origem_cidade} 
                          onValueChange={(value) => handleInputChange('origem_cidade', value)}
                          disabled={!formData.origem_estado}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a cidade" />
                          </SelectTrigger>
                          <SelectContent>
                            {origemCidades.loading ? (
                              <SelectItem value="loading" disabled>Carregando...</SelectItem>
                            ) : (
                              origemCidades.cidades.map((cidade) => (
                                <SelectItem key={cidade.id} value={cidade.nome}>
                                  {cidade.nome}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Destinos */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-medium text-gray-800">Destinos</Label>
                      <Button
                        type="button"
                        onClick={addDestination}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Adicionar Destino</span>
                      </Button>
                    </div>

                    {/* Aviso informativo sobre múltiplos destinos */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                          <strong>Informação importante:</strong> Cada destino gerará um pedido de frete separado, com os mesmos dados preenchidos. Isso facilita o seu trabalho e economiza tempo, pois você só precisa preencher as informações uma vez!
                        </div>
                      </div>
                    </div>

                    {formData.destinos.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Nenhum destino adicionado</p>
                        <p className="text-sm text-gray-400">Clique em "Adicionar Destino" para começar</p>
                      </div>
                    )}

                    {formData.destinos.map((destino) => (
                      <div key={destino.id} className="flex items-center space-x-3 p-4 border rounded-lg">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Estado</Label>
                            <Select 
                              value={destino.state} 
                              onValueChange={(value) => updateDestination(destino.id, 'state', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o estado" />
                              </SelectTrigger>
                              <SelectContent>
                                {loadingEstados ? (
                                  <SelectItem value="loading" disabled>Carregando...</SelectItem>
                                ) : (
                                  estados.map((estado) => (
                                    <SelectItem key={estado.id} value={estado.sigla}>
                                      {estado.nome} ({estado.sigla})
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Cidade</Label>
                            <Select 
                              value={destino.city} 
                              onValueChange={(value) => updateDestination(destino.id, 'city', value)}
                              disabled={!destino.state}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a cidade" />
                              </SelectTrigger>
                              <SelectContent>
                                {destinoCidades[destino.id] ? (
                                  destinoCidades[destino.id].map((cidade: any) => (
                                    <SelectItem key={cidade.id} value={cidade.nome}>
                                      {cidade.nome}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="loading" disabled>Selecione um estado primeiro</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button
                          type="button"
                          onClick={() => removeDestination(destino.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePreviousStep}
                      className="flex-1"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar
                    </Button>
                    <Button
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    >
                      Próximo
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Informações da Carga */}
                  <div className="space-y-4">
                    <Label className="text-lg font-medium text-gray-800">Informações da Carga</Label>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tipo_mercadoria" className="text-sm font-medium text-gray-700">
                          Tipo de Mercadoria *
                        </Label>
                        <Input
                          id="tipo_mercadoria"
                          type="text"
                          value={formData.tipo_mercadoria}
                          onChange={(e) => handleInputChange('tipo_mercadoria', e.target.value)}
                          placeholder="Ex: Eletrônicos"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tipos de Veículos */}
                  <div className="space-y-4">
                    <Label className="text-lg font-medium text-gray-800">Tipos de Veículos *</Label>
                    
                    {/* Pesados */}
                    <div className="space-y-3">
                      <h4 className="text-md font-semibold text-gray-700">Pesados</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {formData.tipos_veiculos.filter(v => v.category === 'heavy').map((vehicle) => (
                          <div key={vehicle.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                            <Checkbox
                              id={`vehicle-${vehicle.id}`}
                              checked={vehicle.selected}
                              onCheckedChange={() => toggleVehicleType(vehicle.id)}
                            />
                            <label htmlFor={`vehicle-${vehicle.id}`} className="flex-1 cursor-pointer">
                              <div className="font-medium text-gray-800">{vehicle.type}</div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Médios */}
                    <div className="space-y-3">
                      <h4 className="text-md font-semibold text-gray-700">Médios</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {formData.tipos_veiculos.filter(v => v.category === 'medium').map((vehicle) => (
                          <div key={vehicle.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                            <Checkbox
                              id={`vehicle-${vehicle.id}`}
                              checked={vehicle.selected}
                              onCheckedChange={() => toggleVehicleType(vehicle.id)}
                            />
                            <label htmlFor={`vehicle-${vehicle.id}`} className="flex-1 cursor-pointer">
                              <div className="font-medium text-gray-800">{vehicle.type}</div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Leves */}
                    <div className="space-y-3">
                      <h4 className="text-md font-semibold text-gray-700">Leves</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {formData.tipos_veiculos.filter(v => v.category === 'light').map((vehicle) => (
                          <div key={vehicle.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                            <Checkbox
                              id={`vehicle-${vehicle.id}`}
                              checked={vehicle.selected}
                              onCheckedChange={() => toggleVehicleType(vehicle.id)}
                            />
                            <label htmlFor={`vehicle-${vehicle.id}`} className="flex-1 cursor-pointer">
                              <div className="font-medium text-gray-800">{vehicle.type}</div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tipos de Carroceria */}
                  <div className="space-y-4">
                    <Label className="text-lg font-medium text-gray-800">Tipos de Carroceria</Label>
                    
                    {/* Abertas */}
                    <div className="space-y-3">
                      <h4 className="text-md font-semibold text-gray-700">Abertas</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {formData.tipos_carrocerias.filter(b => b.category === 'open').map((body) => (
                          <div key={body.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                            <Checkbox
                              id={`body-${body.id}`}
                              checked={body.selected}
                              onCheckedChange={() => toggleBodyType(body.id)}
                            />
                            <label htmlFor={`body-${body.id}`} className="flex-1 cursor-pointer">
                              <div className="font-medium text-gray-800">{body.type}</div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Fechadas */}
                    <div className="space-y-3">
                      <h4 className="text-md font-semibold text-gray-700">Fechadas</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {formData.tipos_carrocerias.filter(b => b.category === 'closed').map((body) => (
                          <div key={body.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                            <Checkbox
                              id={`body-${body.id}`}
                              checked={body.selected}
                              onCheckedChange={() => toggleBodyType(body.id)}
                            />
                            <label htmlFor={`body-${body.id}`} className="flex-1 cursor-pointer">
                              <div className="font-medium text-gray-800">{body.type}</div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Especiais */}
                    <div className="space-y-3">
                      <h4 className="text-md font-semibold text-gray-700">Especiais</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {formData.tipos_carrocerias.filter(b => b.category === 'special').map((body) => (
                          <div key={body.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                            <Checkbox
                              id={`body-${body.id}`}
                              checked={body.selected}
                              onCheckedChange={() => toggleBodyType(body.id)}
                            />
                            <label htmlFor={`body-${body.id}`} className="flex-1 cursor-pointer">
                              <div className="font-medium text-gray-800">{body.type}</div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tabelas de Preço por Veículo */}
                  <div className="space-y-4">
                    <Label className="text-lg font-medium text-gray-800">Tabelas de Preço por Veículo</Label>
                    
                    {formData.vehicle_price_tables.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <DollarSign className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Selecione veículos para configurar as tabelas de preço</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {formData.vehicle_price_tables.map((vehicleTable) => (
                          <div key={vehicleTable.vehicleType} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-semibold text-gray-800">{vehicleTable.vehicleType}</h4>
                              <Button
                                type="button"
                                onClick={() => addPriceRange(vehicleTable.vehicleType)}
                                variant="outline"
                                size="sm"
                                className="flex items-center space-x-2"
                              >
                                <Plus className="w-4 h-4" />
                                <span>Adicionar Faixa</span>
                              </Button>
                            </div>
                            
                            <div className="space-y-3">
                              {vehicleTable.ranges.map((range) => (
                                <div key={range.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3 bg-white rounded-lg border">
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">KM Inicial</Label>
                                    <Input
                                      type="number"
                                      value={range.kmStart}
                                      onChange={(e) => updatePriceRange(vehicleTable.vehicleType, range.id, 'kmStart', parseInt(e.target.value) || 0)}
                                      min="0"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">KM Final</Label>
                                    <Input
                                      type="number"
                                      value={range.kmEnd}
                                      onChange={(e) => updatePriceRange(vehicleTable.vehicleType, range.id, 'kmEnd', parseInt(e.target.value) || 0)}
                                      min="0"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Preço (R$)</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={range.price}
                                      onChange={(e) => updatePriceRange(vehicleTable.vehicleType, range.id, 'price', parseFloat(e.target.value) || 0)}
                                      min="0"
                                    />
                                  </div>
                                  <div className="flex items-end">
                                    <Button
                                      type="button"
                                      onClick={() => removePriceRange(vehicleTable.vehicleType, range.id)}
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700 w-full"
                                      disabled={vehicleTable.ranges.length === 1}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePreviousStep}
                      className="flex-1"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar
                    </Button>
                    <Button
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    >
                      Próximo
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  {/* Resumo dos colaboradores */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <Label className="text-sm font-medium text-green-800 mb-2 block">
                      Colaboradores Responsáveis ({selectedCollaborators.length})
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedCollaborators.map((collaborator) => (
                        <div
                          key={collaborator.id}
                          className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                        >
                          {collaborator.name}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Configurações Operacionais */}
                  <div className="space-y-4">
                    <Label className="text-lg font-medium text-gray-800">Configurações Operacionais</Label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="precisa_ajudante"
                          checked={formData.precisa_ajudante}
                          onCheckedChange={(checked) => handleInputChange('precisa_ajudante', checked)}
                        />
                        <Label htmlFor="precisa_ajudante" className="text-sm font-medium text-gray-700">
                          Precisa de ajudante
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="precisa_rastreador"
                          checked={formData.precisa_rastreador}
                          onCheckedChange={(checked) => handleInputChange('precisa_rastreador', checked)}
                        />
                        <Label htmlFor="precisa_rastreador" className="text-sm font-medium text-gray-700">
                          Precisa de rastreador
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="precisa_seguro"
                          checked={formData.precisa_seguro}
                          onCheckedChange={(checked) => handleInputChange('precisa_seguro', checked)}
                        />
                        <Label htmlFor="precisa_seguro" className="text-sm font-medium text-gray-700">
                          Precisa de seguro
                        </Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="horario_carregamento" className="text-sm font-medium text-gray-700">
                        Horário de Carregamento
                      </Label>
                      <Input
                        id="horario_carregamento"
                        type="time"
                        value={formData.horario_carregamento}
                        onChange={(e) => handleInputChange('horario_carregamento', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Configurações de Pedágio */}
                  <div className="space-y-4">
                    <Label className="text-lg font-medium text-gray-800">Configurações de Pedágio</Label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Pedágio pago por</Label>
                        <Select 
                          value={formData.pedagio_pago_por} 
                          onValueChange={(value) => handleInputChange('pedagio_pago_por', value)}
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

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Direção do pedágio</Label>
                        <Select 
                          value={formData.pedagio_direcao} 
                          onValueChange={(value) => handleInputChange('pedagio_direcao', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a direção" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ida">Apenas ida</SelectItem>
                            <SelectItem value="volta">Apenas volta</SelectItem>
                            <SelectItem value="ida_volta">Ida e volta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Regras de Agendamento */}
                  <div className="space-y-4">
                    <Label className="text-lg font-medium text-gray-800">Regras de Agendamento</Label>
                    <div className="space-y-2">
                      {schedulingRules.map((rule) => (
                        <div key={rule} className="flex items-center space-x-2">
                          <Checkbox
                            id={`rule-${rule}`}
                            checked={formData.regras_agendamento.includes(rule)}
                            onCheckedChange={() => toggleSchedulingRule(rule)}
                          />
                          <Label htmlFor={`rule-${rule}`} className="text-sm text-gray-700">
                            {rule}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Benefícios */}
                  <div className="space-y-4">
                    <Label className="text-lg font-medium text-gray-800">Benefícios</Label>
                    
                    {/* Input para adicionar benefício */}
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={newBenefit}
                        onChange={(e) => setNewBenefit(e.target.value)}
                        placeholder="Digite um benefício (ex: Vale alimentação, Plano de saúde...)"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addBenefit();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={addBenefit}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2"
                        disabled={!newBenefit.trim()}
                      >
                        <Plus className="w-4 h-4" />
                        <span>Adicionar</span>
                      </Button>
                    </div>

                    {/* Lista de benefícios */}
                    {formData.beneficios.length > 0 ? (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Benefícios Adicionados ({formData.beneficios.length})
                        </Label>
                        <div className="space-y-2">
                          {formData.beneficios.map((benefit, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <span className="text-sm text-gray-700 flex-1">{benefit}</span>
                              <Button
                                type="button"
                                onClick={() => removeBenefit(index)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                        <div className="text-gray-500">
                          <p>Nenhum benefício adicionado</p>
                          <p className="text-sm text-gray-400">Digite no campo acima para adicionar benefícios</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Observações */}
                  <div className="space-y-2">
                    <Label htmlFor="observacoes" className="text-sm font-medium text-gray-700">
                      Observações
                    </Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => handleInputChange('observacoes', e.target.value)}
                      placeholder="Informações adicionais sobre o frete..."
                      rows={4}
                    />
                  </div>

                  {/* Botões */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePreviousStep}
                      className="flex-1"
                      disabled={loading}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar
                    </Button>
                    <Button
                      type="button"
                      onClick={handleOpenVerificationDialog}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    >
                      <Truck className="w-4 h-4 mr-2" />
                      Solicitar Frete
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Dialog Components */}
      <FreightVerificationDialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
        formData={formData}
        collaborators={collaborators}
        onEdit={handleEditFromVerification}
        onConfirm={handleConfirmFreight}
        loading={loading}
      />

      <FreightLoadingAnimation
        open={showLoadingAnimation}
      />

      <FreightSuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        generatedFreights={generatedFreights}
        onNewFreight={handleNewFreight}
        onBackToDashboard={handleBackToDashboardFromSuccess}
      />
    </>
  );
};

export default FreightAggregationForm;
