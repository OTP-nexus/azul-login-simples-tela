import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Truck, User, Plus, X, ArrowRight, CheckCircle, MapPin, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useEstados, useCidades } from '@/hooks/useIBGE';
import { supabase } from '@/integrations/supabase/client';

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
  category: 'pesados' | 'medios' | 'leves';
  selected: boolean;
}

interface BodyType {
  id: string;
  type: string;
  category: 'abertas' | 'fechadas' | 'especiais';
  selected: boolean;
}

interface PriceTable {
  id: string;
  vehicleType: string;
  kmStart: number;
  kmEnd: number;
  price: number;
}

interface FreightFormData {
  collaborator_ids: string[];
  origem_cidade: string;
  origem_estado: string;
  destinos: Destination[];
  tipo_mercadoria: string;
  peso_carga: string;
  valor_carga: string;
  tipos_veiculos: VehicleType[];
  tipos_carrocerias: BodyType[];
  tabelas_preco: PriceTable[];
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

const predefinedVehicleTypes: VehicleType[] = [
  // Pesados
  { id: '1', type: 'Carreta', category: 'pesados', selected: false },
  { id: '2', type: 'Carreta LS', category: 'pesados', selected: false },
  { id: '3', type: 'Vanderléia', category: 'pesados', selected: false },
  { id: '4', type: 'Bitrem', category: 'pesados', selected: false },
  
  // Médios
  { id: '5', type: 'Truck', category: 'medios', selected: false },
  { id: '6', type: 'Bitruck', category: 'medios', selected: false },
  
  // Leves
  { id: '7', type: 'Fiorino', category: 'leves', selected: false },
  { id: '8', type: 'VLC', category: 'leves', selected: false },
  { id: '9', type: 'VUC', category: 'leves', selected: false },
  { id: '10', type: '3/4', category: 'leves', selected: false },
  { id: '11', type: 'Toco', category: 'leves', selected: false },
];

const predefinedBodyTypes: BodyType[] = [
  // Abertas
  { id: '1', type: 'Graneleiro', category: 'abertas', selected: false },
  { id: '2', type: 'Grade Baixa', category: 'abertas', selected: false },
  { id: '3', type: 'Prancha', category: 'abertas', selected: false },
  { id: '4', type: 'Caçamba', category: 'abertas', selected: false },
  { id: '5', type: 'Plataforma', category: 'abertas', selected: false },
  
  // Fechadas
  { id: '6', type: 'Sider', category: 'fechadas', selected: false },
  { id: '7', type: 'Baú', category: 'fechadas', selected: false },
  { id: '8', type: 'Baú Frigorífico', category: 'fechadas', selected: false },
  { id: '9', type: 'Baú Refrigerado', category: 'fechadas', selected: false },
  
  // Especiais
  { id: '10', type: 'Silo', category: 'especiais', selected: false },
  { id: '11', type: 'Cegonheiro', category: 'especiais', selected: false },
  { id: '12', type: 'Gaiola', category: 'especiais', selected: false },
  { id: '13', type: 'Tanque', category: 'especiais', selected: false },
  { id: '14', type: 'Bug Porta Container', category: 'especiais', selected: false },
  { id: '15', type: 'Munk', category: 'especiais', selected: false },
  { id: '16', type: 'Apenas Cavalo', category: 'especiais', selected: false },
  { id: '17', type: 'Cavaqueira', category: 'especiais', selected: false },
  { id: '18', type: 'Hopper', category: 'especiais', selected: false },
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
  
  const [formData, setFormData] = useState<FreightFormData>({
    collaborator_ids: [],
    origem_cidade: '',
    origem_estado: '',
    destinos: [],
    tipo_mercadoria: '',
    peso_carga: '',
    valor_carga: '',
    tipos_veiculos: [...predefinedVehicleTypes],
    tipos_carrocerias: [...predefinedBodyTypes],
    tabelas_preco: [],
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

  const addPriceTable = () => {
    const selectedVehicles = formData.tipos_veiculos.filter(v => v.selected);
    if (selectedVehicles.length === 0) {
      toast({
        title: "Selecione veículos primeiro",
        description: "É necessário selecionar pelo menos um tipo de veículo antes de adicionar tabelas de preço",
        variant: "destructive"
      });
      return;
    }

    const newPriceTable: PriceTable = {
      id: Date.now().toString(),
      vehicleType: selectedVehicles[0].type,
      kmStart: 0,
      kmEnd: 100,
      price: 0
    };
    setFormData(prev => ({
      ...prev,
      tabelas_preco: [...prev.tabelas_preco, newPriceTable]
    }));
  };

  const removePriceTable = (id: string) => {
    setFormData(prev => ({
      ...prev,
      tabelas_preco: prev.tabelas_preco.filter(table => table.id !== id)
    }));
  };

  const updatePriceTable = (id: string, field: keyof PriceTable, value: any) => {
    setFormData(prev => ({
      ...prev,
      tabelas_preco: prev.tabelas_preco.map(table =>
        table.id === id ? { ...table, [field]: value } : table
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    
    try {
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (companyError || !company) {
        throw new Error('Empresa não encontrada');
      }

      const freightData = {
        company_id: company.id,
        collaborator_ids: formData.collaborator_ids,
        tipo_frete: 'agregamento',
        origem_estado: formData.origem_estado,
        origem_cidade: formData.origem_cidade,
        destinos: JSON.stringify(formData.destinos),
        tipo_mercadoria: formData.tipo_mercadoria,
        peso_carga: formData.peso_carga ? parseFloat(formData.peso_carga) : null,
        valor_carga: formData.valor_carga ? parseFloat(formData.valor_carga) : null,
        tipos_veiculos: JSON.stringify(formData.tipos_veiculos.filter(v => v.selected)),
        tipos_carrocerias: JSON.stringify(formData.tipos_carrocerias.filter(b => b.selected)),
        tabelas_preco: JSON.stringify(formData.tabelas_preco),
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

      const { error } = await supabase
        .from('fretes')
        .insert([freightData]);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso!",
        description: `Frete de agregamento criado com ${formData.collaborator_ids.length} colaborador(es) responsável(is)`
      });

      setFormData({
        collaborator_ids: [],
        origem_cidade: '',
        origem_estado: '',
        destinos: [],
        tipo_mercadoria: '',
        peso_carga: '',
        valor_carga: '',
        tipos_veiculos: [...predefinedVehicleTypes],
        tipos_carrocerias: [...predefinedBodyTypes],
        tabelas_preco: [],
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

    } catch (error: any) {
      console.error('Erro ao salvar frete:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar a solicitação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <div className="space-y-2">
                      <Label htmlFor="peso_carga" className="text-sm font-medium text-gray-700">
                        Peso (kg)
                      </Label>
                      <Input
                        id="peso_carga"
                        type="number"
                        value={formData.peso_carga}
                        onChange={(e) => handleInputChange('peso_carga', e.target.value)}
                        placeholder="Ex: 1000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valor_carga" className="text-sm font-medium text-gray-700">
                        Valor da Carga (R$)
                      </Label>
                      <Input
                        id="valor_carga"
                        type="number"
                        step="0.01"
                        value={formData.valor_carga}
                        onChange={(e) => handleInputChange('valor_carga', e.target.value)}
                        placeholder="Ex: 50000.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Tipos de Veículos */}
                <div className="space-y-4">
                  <Label className="text-lg font-medium text-gray-800">Tipos de Veículos *</Label>
                  <p className="text-sm text-gray-600">Selecione um ou mais tipos de veículos</p>
                  
                  {/* Veículos Pesados */}
                  <div className="space-y-3">
                    <Label className="text-md font-medium text-blue-700">Pesados</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-4">
                      {formData.tipos_veiculos.filter(v => v.category === 'pesados').map((vehicle) => (
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

                  {/* Veículos Médios */}
                  <div className="space-y-3">
                    <Label className="text-md font-medium text-blue-700">Médios</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-4">
                      {formData.tipos_veiculos.filter(v => v.category === 'medios').map((vehicle) => (
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

                  {/* Veículos Leves */}
                  <div className="space-y-3">
                    <Label className="text-md font-medium text-blue-700">Leves</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-4">
                      {formData.tipos_veiculos.filter(v => v.category === 'leves').map((vehicle) => (
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
                  <p className="text-sm text-gray-600">Selecione um ou mais tipos de carroceria</p>
                  
                  {/* Carrocerias Abertas */}
                  <div className="space-y-3">
                    <Label className="text-md font-medium text-green-700">Abertas</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-4">
                      {formData.tipos_carrocerias.filter(b => b.category === 'abertas').map((body) => (
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

                  {/* Carrocerias Fechadas */}
                  <div className="space-y-3">
                    <Label className="text-md font-medium text-green-700">Fechadas</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-4">
                      {formData.tipos_carrocerias.filter(b => b.category === 'fechadas').map((body) => (
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

                  {/* Carrocerias Especiais */}
                  <div className="space-y-3">
                    <Label className="text-md font-medium text-green-700">Especiais</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-4">
                      {formData.tipos_carrocerias.filter(b => b.category === 'especiais').map((body) => (
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
              <form onSubmit={handleSubmit} className="space-y-6">
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

                {/* Tabelas de Preço */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-medium text-gray-800">Tabelas de Preço</Label>
                    <Button
                      type="button"
                      onClick={addPriceTable}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar Tabela</span>
                    </Button>
                  </div>

                  {formData.tabelas_preco.map((table) => (
                    <div key={table.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg items-end">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Tipo de Veículo</Label>
                        <Select 
                          value={table.vehicleType} 
                          onValueChange={(value) => updatePriceTable(table.id, 'vehicleType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {formData.tipos_veiculos.filter(v => v.selected).map((vehicle) => (
                              <SelectItem key={vehicle.id} value={vehicle.type}>
                                {vehicle.type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">KM Inicial</Label>
                        <Input
                          type="number"
                          value={table.kmStart}
                          onChange={(e) => updatePriceTable(table.id, 'kmStart', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">KM Final</Label>
                        <Input
                          type="number"
                          value={table.kmEnd}
                          onChange={(e) => updatePriceTable(table.id, 'kmEnd', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Preço (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={table.price}
                          onChange={(e) => updatePriceTable(table.id, 'price', parseFloat(e.target.value))}
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => removePriceTable(table.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Benefícios */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-medium text-gray-800">Benefícios</Label>
                    <Button
                      type="button"
                      onClick={addBenefit}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar Benefício</span>
                    </Button>
                  </div>

                  {formData.beneficios.length > 0 && (
                    <div className="space-y-2">
                      {formData.beneficios.map((benefit, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <span className="text-sm text-gray-700">{benefit}</span>
                          <Button
                            type="button"
                            onClick={() => removeBenefit(index)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
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
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Truck className="w-4 h-4 mr-2" />
                        Solicitar Frete
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default FreightAggregationForm;
