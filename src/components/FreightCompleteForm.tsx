import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Truck, User, Plus, X, ArrowRight, CheckCircle, MapPin, Settings, DollarSign, Info, Package } from 'lucide-react';
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
  paradas: any[];
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

const FreightCompleteForm = () => {
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
    numero_nota_fiscal: '',
    paradas: []
  });
  
  const { estados, loading: loadingEstados } = useEstados();
  const origemCidades = useCidades(formData.origem_estado);
  const [destinoCidades, setDestinoCidades] = useState<{[key: string]: any}>({});

  const steps = [
    { number: 1, title: 'Colaboradores', description: 'Selecione os responsáveis' },
    { number: 2, title: 'Origem e Destinos', description: 'Defina as rotas' },
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

  const handleSubmit = async () => {
    setShowVerificationDialog(false);
    setShowLoadingAnimation(true);
    setLoading(true);

    try {
      // Get company_id first
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (companyError || !company) {
        throw new Error('Empresa não encontrada');
      }

      // Create separate freights for each destination
      const freightsToCreate = formData.destinos.map(destino => ({
        company_id: company.id,
        collaborator_ids: formData.collaborator_ids,
        origem_cidade: formData.origem_cidade,
        origem_estado: formData.origem_estado,
        destino_cidade: destino.city,
        destino_estado: destino.state,
        tipo_mercadoria: formData.tipo_mercadoria,
        peso_carga: formData.peso_carga,
        valor_carga: formData.valor_carga,
        data_coleta: formData.data_coleta,
        data_entrega: formData.data_entrega,
        urgencia: formData.urgencia,
        temperatura_controlada: formData.temperatura_controlada,
        equipamento_especial: formData.equipamento_especial,
        altura_carga: formData.altura_carga,
        largura_carga: formData.largura_carga,
        comprimento_carga: formData.comprimento_carga,
        empilhavel: formData.empilhavel,
        fragil: formData.fragil,
        perigosa: formData.perigosa,
        numero_nota_fiscal: formData.numero_nota_fiscal,
        horario_carregamento: formData.horario_carregamento,
        precisa_ajudante: formData.precisa_ajudante,
        precisa_rastreador: formData.precisa_rastreador,
        precisa_seguro: formData.precisa_seguro,
        pedagio_pago_por: formData.pedagio_pago_por,
        pedagio_direcao: formData.pedagio_direcao,
        observacoes: formData.observacoes,
        tipos_veiculos: JSON.stringify(formData.tipos_veiculos.filter(v => v.selected)),
        tipos_carrocerias: JSON.stringify(formData.tipos_carrocerias.filter(b => b.selected)),
        regras_agendamento: JSON.stringify(formData.regras_agendamento),
        beneficios: JSON.stringify(formData.beneficios),
        valores_definidos: JSON.stringify(formData.vehicle_price_tables),
        tipo_frete: 'completo' as const,
        status: 'ativo'
      }));

      // Insert freights into supabase
      const { data, error } = await supabase
        .from('fretes')
        .insert(freightsToCreate)
        .select('id, codigo_agregamento, destino_cidade, destino_estado');

      if (error) {
        throw error;
      }

      // Transform data to match GeneratedFreight interface
      const transformedData: GeneratedFreight[] = (data || []).map(freight => ({
        id: freight.id,
        codigo_agregamento: freight.codigo_agregamento || `FRETE-${freight.id}`,
        destino_cidade: freight.destino_cidade,
        destino_estado: freight.destino_estado
      }));

      setGeneratedFreights(transformedData);
      setShowSuccessDialog(true);
    } catch (error: any) {
      console.error('Erro ao criar frete:', error);
      toast({
        title: "Erro ao enviar frete",
        description: error.message || "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setShowLoadingAnimation(false);
    }
  };

  const selectedCollaborators = getSelectedCollaborators();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">Frete Completo</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Etapa {currentStep} de {steps.length}
              </div>
              <Progress value={progressValue} className="w-32" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{steps[currentStep - 1].title}</h2>
                <p className="text-gray-600 mt-1">{steps[currentStep - 1].description}</p>
              </div>
              <div className="flex items-center space-x-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep === step.number
                        ? 'bg-blue-600 text-white'
                        : currentStep > step.number
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {currentStep > step.number ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        step.number
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-0.5 ml-4 ${
                        currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6">
            <form className="space-y-8">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <User className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione os Colaboradores Responsáveis</h3>
                    <p className="text-gray-600">Escolha quem será responsável por este frete completo</p>
                  </div>

                  {loadingCollaborators ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Carregando colaboradores...</p>
                    </div>
                  ) : collaborators.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Nenhum colaborador encontrado</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {collaborators.map((collaborator) => (
                        <Card 
                          key={collaborator.id} 
                          className={`cursor-pointer transition-all duration-200 border-2 ${
                            formData.collaborator_ids.includes(collaborator.id)
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}
                          onClick={() => handleCollaboratorToggle(collaborator.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{collaborator.name}</h4>
                                <p className="text-sm text-gray-600">{collaborator.sector}</p>
                                <p className="text-sm text-gray-500">{collaborator.phone}</p>
                              </div>
                              <Checkbox
                                checked={formData.collaborator_ids.includes(collaborator.id)}
                                onChange={() => handleCollaboratorToggle(collaborator.id)}
                                className="ml-2"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {selectedCollaborators.length > 0 && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Colaboradores Selecionados:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCollaborators.map((collaborator) => (
                          <span key={collaborator.id} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            {collaborator.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* Origem */}
                  <div className="space-y-4">
                    <Label className="text-lg font-medium text-gray-800">Origem</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="origem-estado">Estado de Origem</Label>
                        <Select 
                          value={formData.origem_estado} 
                          onValueChange={(value) => handleInputChange('origem_estado', value)}
                        >
                          <SelectTrigger id="origem-estado">
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
                        <Label htmlFor="origem-cidade">Cidade de Origem</Label>
                        <Select 
                          value={formData.origem_cidade} 
                          onValueChange={(value) => handleInputChange('origem_cidade', value)}
                          disabled={!formData.origem_estado}
                        >
                          <SelectTrigger id="origem-cidade">
                            <SelectValue placeholder="Selecione a cidade" />
                          </SelectTrigger>
                          <SelectContent>
                            {origemCidades.cidades.map((cidade) => (
                              <SelectItem key={cidade.nome} value={cidade.nome}>
                                {cidade.nome}
                              </SelectItem>
                            ))}
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
                          <strong>Informação importante:</strong> Cada destino gerará um pedido de frete separado. 
                          Para um frete com múltiplas paradas na mesma rota, use o "Frete Agregamento".
                        </div>
                      </div>
                    </div>

                    {formData.destinos.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Nenhum destino adicionado</p>
                      </div>
                    )}

                    {formData.destinos.map((destino) => (
                      <div key={destino.id} className="flex items-center space-x-3 p-4 border rounded-lg">
                        <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0" />
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Select 
                            value={destino.state} 
                            onValueChange={(value) => updateDestination(destino.id, 'state', value)}
                          >
                            <SelectTrigger>
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
                          <Select 
                            value={destino.city} 
                            onValueChange={(value) => updateDestination(destino.id, 'city', value)}
                            disabled={!destino.state}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Cidade" />
                            </SelectTrigger>
                            <SelectContent>
                              {destinoCidades[destino.id]?.map((cidade: any) => (
                                <SelectItem key={cidade.nome} value={cidade.nome}>
                                  {cidade.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          type="button"
                          onClick={() => removeDestination(destino.id)}
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
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-lg font-medium text-gray-800">Tipo de Mercadoria</Label>
                    <Input
                      type="text"
                      value={formData.tipo_mercadoria}
                      onChange={(e) => handleInputChange('tipo_mercadoria', e.target.value)}
                      placeholder="Informe o tipo de mercadoria"
                    />
                  </div>

                  <div>
                    <Label className="text-lg font-medium text-gray-800 mb-2">Tipos de Veículos</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-64 overflow-y-auto border rounded p-4">
                      {formData.tipos_veiculos.map(vehicle => (
                        <Checkbox
                          key={vehicle.id}
                          checked={vehicle.selected}
                          onCheckedChange={() => toggleVehicleType(vehicle.id)}
                          id={`vehicle-${vehicle.id}`}
                        >
                          <label htmlFor={`vehicle-${vehicle.id}`} className="ml-2 cursor-pointer select-none">
                            {vehicle.type} ({vehicle.category})
                          </label>
                        </Checkbox>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-lg font-medium text-gray-800 mb-2">Tipos de Carrocerias</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-64 overflow-y-auto border rounded p-4">
                      {formData.tipos_carrocerias.map(body => (
                        <Checkbox
                          key={body.id}
                          checked={body.selected}
                          onCheckedChange={() => toggleBodyType(body.id)}
                          id={`body-${body.id}`}
                        >
                          <label htmlFor={`body-${body.id}`} className="ml-2 cursor-pointer select-none">
                            {body.type} ({body.category})
                          </label>
                        </Checkbox>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-lg font-medium text-gray-800 mb-2">Tabelas de Preço por Veículo</Label>
                    {formData.vehicle_price_tables.length === 0 && (
                      <p className="text-gray-500">Nenhuma tabela de preço configurada.</p>
                    )}
                    {formData.vehicle_price_tables.map(table => (
                      <div key={table.vehicleType} className="mb-6 border rounded p-4">
                        <h4 className="font-semibold mb-2">{table.vehicleType}</h4>
                        {table.ranges.map(range => (
                          <div key={range.id} className="grid grid-cols-4 gap-4 items-center mb-2">
                            <Input
                              type="number"
                              value={range.kmStart}
                              onChange={(e) => updatePriceRange(table.vehicleType, range.id, 'kmStart', Number(e.target.value))}
                              placeholder="Km Início"
                            />
                            <Input
                              type="number"
                              value={range.kmEnd}
                              onChange={(e) => updatePriceRange(table.vehicleType, range.id, 'kmEnd', Number(e.target.value))}
                              placeholder="Km Fim"
                            />
                            <Input
                              type="number"
                              value={range.price}
                              onChange={(e) => updatePriceRange(table.vehicleType, range.id, 'price', Number(e.target.value))}
                              placeholder="Preço"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => removePriceRange(table.vehicleType, range.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-5 h-5" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addPriceRange(table.vehicleType)}
                        >
                          Adicionar Faixa de Preço
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-lg font-medium text-gray-800">Regras de Agendamento</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {schedulingRules.map(rule => (
                        <Checkbox
                          key={rule}
                          checked={formData.regras_agendamento.includes(rule)}
                          onCheckedChange={() => toggleSchedulingRule(rule)}
                          id={`rule-${rule}`}
                        >
                          <label htmlFor={`rule-${rule}`} className="ml-2 cursor-pointer select-none">
                            {rule}
                          </label>
                        </Checkbox>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-lg font-medium text-gray-800">Benefícios</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.beneficios.map((benefit, index) => (
                        <div key={index} className="flex items-center bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm">
                          {benefit}
                          <button
                            type="button"
                            onClick={() => removeBenefit(index)}
                            className="ml-2 text-green-600 hover:text-green-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addBenefit}>
                      Adicionar Benefício
                    </Button>
                  </div>

                  <div>
                    <Label className="text-lg font-medium text-gray-800">Horário de Carregamento</Label>
                    <Input
                      type="time"
                      value={formData.horario_carregamento}
                      onChange={(e) => handleInputChange('horario_carregamento', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Checkbox
                      checked={formData.precisa_ajudante}
                      onCheckedChange={(checked) => handleInputChange('precisa_ajudante', checked)}
                      id="precisa-ajudante"
                    >
                      <label htmlFor="precisa-ajudante" className="ml-2 cursor-pointer select-none">
                        Precisa de Ajudante
                      </label>
                    </Checkbox>
                    <Checkbox
                      checked={formData.precisa_rastreador}
                      onCheckedChange={(checked) => handleInputChange('precisa_rastreador', checked)}
                      id="precisa-rastreador"
                    >
                      <label htmlFor="precisa-rastreador" className="ml-2 cursor-pointer select-none">
                        Precisa de Rastreador
                      </label>
                    </Checkbox>
                    <Checkbox
                      checked={formData.precisa_seguro}
                      onCheckedChange={(checked) => handleInputChange('precisa_seguro', checked)}
                      id="precisa-seguro"
                    >
                      <label htmlFor="precisa-seguro" className="ml-2 cursor-pointer select-none">
                        Precisa de Seguro
                      </label>
                    </Checkbox>
                  </div>

                  <div>
                    <Label className="text-lg font-medium text-gray-800">Pedágio Pago Por</Label>
                    <Input
                      type="text"
                      value={formData.pedagio_pago_por}
                      onChange={(e) => handleInputChange('pedagio_pago_por', e.target.value)}
                      placeholder="Quem paga o pedágio"
                    />
                  </div>

                  <div>
                    <Label className="text-lg font-medium text-gray-800">Pedágio Direção</Label>
                    <Input
                      type="text"
                      value={formData.pedagio_direcao}
                      onChange={(e) => handleInputChange('pedagio_direcao', e.target.value)}
                      placeholder="Direção do pedágio"
                    />
                  </div>

                  <div>
                    <Label className="text-lg font-medium text-gray-800">Observações</Label>
                    <Textarea
                      value={formData.observacoes}
                      onChange={(e) => handleInputChange('observacoes', e.target.value)}
                      placeholder="Observações adicionais"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-lg font-medium text-gray-800">Peso da Carga (kg)</Label>
                      <Input
                        type="number"
                        value={formData.peso_carga}
                        onChange={(e) => handleInputChange('peso_carga', Number(e.target.value))}
                        min={0}
                      />
                    </div>
                    <div>
                      <Label className="text-lg font-medium text-gray-800">Valor da Carga (R$)</Label>
                      <Input
                        type="number"
                        value={formData.valor_carga}
                        onChange={(e) => handleInputChange('valor_carga', Number(e.target.value))}
                        min={0}
                        step={0.01}
                      />
                    </div>
                    <div>
                      <Label className="text-lg font-medium text-gray-800">Urgência</Label>
                      <Select
                        value={formData.urgencia}
                        onValueChange={(value) => handleInputChange('urgencia', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a urgência" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="urgente">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Checkbox
                      checked={formData.temperatura_controlada}
                      onCheckedChange={(checked) => handleInputChange('temperatura_controlada', checked)}
                      id="temperatura-controlada"
                    >
                      <label htmlFor="temperatura-controlada" className="ml-2 cursor-pointer select-none">
                        Temperatura Controlada
                      </label>
                    </Checkbox>
                    <Checkbox
                      checked={formData.empilhavel}
                      onCheckedChange={(checked) => handleInputChange('empilhavel', checked)}
                      id="empilhavel"
                    >
                      <label htmlFor="empilhavel" className="ml-2 cursor-pointer select-none">
                        Empilhável
                      </label>
                    </Checkbox>
                    <Checkbox
                      checked={formData.fragil}
                      onCheckedChange={(checked) => handleInputChange('fragil', checked)}
                      id="fragil"
                    >
                      <label htmlFor="fragil" className="ml-2 cursor-pointer select-none">
                        Frágil
                      </label>
                    </Checkbox>
                    <Checkbox
                      checked={formData.perigosa}
                      onCheckedChange={(checked) => handleInputChange('perigosa', checked)}
                      id="perigosa"
                    >
                      <label htmlFor="perigosa" className="ml-2 cursor-pointer select-none">
                        Perigosa
                      </label>
                    </Checkbox>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-lg font-medium text-gray-800">Altura da Carga (m)</Label>
                      <Input
                        type="number"
                        value={formData.altura_carga}
                        onChange={(e) => handleInputChange('altura_carga', Number(e.target.value))}
                        min={0}
                        step={0.01}
                      />
                    </div>
                    <div>
                      <Label className="text-lg font-medium text-gray-800">Largura da Carga (m)</Label>
                      <Input
                        type="number"
                        value={formData.largura_carga}
                        onChange={(e) => handleInputChange('largura_carga', Number(e.target.value))}
                        min={0}
                        step={0.01}
                      />
                    </div>
                    <div>
                      <Label className="text-lg font-medium text-gray-800">Comprimento da Carga (m)</Label>
                      <Input
                        type="number"
                        value={formData.comprimento_carga}
                        onChange={(e) => handleInputChange('comprimento_carga', Number(e.target.value))}
                        min={0}
                        step={0.01}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-lg font-medium text-gray-800">Equipamento Especial</Label>
                    <Input
                      type="text"
                      value={formData.equipamento_especial}
                      onChange={(e) => handleInputChange('equipamento_especial', e.target.value)}
                      placeholder="Informe se há equipamento especial"
                    />
                  </div>

                  <div>
                    <Label className="text-lg font-medium text-gray-800">Número da Nota Fiscal</Label>
                    <Input
                      type="text"
                      value={formData.numero_nota_fiscal}
                      onChange={(e) => handleInputChange('numero_nota_fiscal', e.target.value)}
                      placeholder="Número da nota fiscal"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-lg font-medium text-gray-800">Data de Coleta</Label>
                      <Input
                        type="date"
                        value={formData.data_coleta}
                        onChange={(e) => handleInputChange('data_coleta', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-lg font-medium text-gray-800">Data de Entrega</Label>
                      <Input
                        type="date"
                        value={formData.data_entrega}
                        onChange={(e) => handleInputChange('data_entrega', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between">
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
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                <span>Próximo</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => setShowVerificationDialog(true)}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Finalizar Frete</span>
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <FreightVerificationDialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
        onConfirm={handleSubmit}
        onEdit={() => setShowVerificationDialog(false)}
        formData={formData}
        collaborators={collaborators || []}
        loading={loading}
      />

      <FreightLoadingAnimation
        open={showLoadingAnimation}
      />

      <FreightSuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        onBackToDashboard={handleBackToDashboard}
        onNewFreight={() => {
          setShowSuccessDialog(false);
          // Reset form or navigate to new freight
          setCurrentStep(1);
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
            numero_nota_fiscal: '',
            paradas: []
          });
        }}
        generatedFreights={generatedFreights || []}
      />
    </div>
  );
};

export default FreightCompleteForm;
