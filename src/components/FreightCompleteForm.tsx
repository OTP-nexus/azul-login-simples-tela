import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, ArrowRight, Plus, X, User, MapPin, Truck, Settings, CheckCircle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useEstados, useCidades } from '@/hooks/useIBGE';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import FreightCompleteVerificationDialog from './FreightCompleteVerificationDialog';
import FreightCompleteLoadingAnimation from './FreightCompleteLoadingAnimation';
import FreightCompleteSuccessDialog from './FreightCompleteSuccessDialog';

interface CollaboratorComplete {
  id: string;
  name: string;
  sector: string;
  phone: string;
  email?: string;
}

interface DestinationComplete {
  id: string;
  state: string;
  city: string;
}

interface VehicleTypeComplete {
  id: string;
  type: string;
  category: 'heavy' | 'medium' | 'light';
  selected: boolean;
}

interface BodyTypeComplete {
  id: string;
  type: string;
  category: 'open' | 'closed' | 'special';
  selected: boolean;
}

interface PriceRangeComplete {
  id: string;
  kmStart: number;
  kmEnd: number;
  price: number;
}

interface VehiclePriceTableComplete {
  vehicleType: string;
  ranges: PriceRangeComplete[];
}

interface GeneratedFreightComplete {
  id: string;
  codigo_agregamento: string;
  destino_cidade: string;
  destino_estado: string;
}

interface FreightFormDataComplete {
  collaborator_ids: string[];
  origem_cidade: string;
  origem_estado: string;
  destinos: DestinationComplete[];
  tipo_mercadoria: string;
  tipos_veiculos: VehicleTypeComplete[];
  tipos_carrocerias: BodyTypeComplete[];
  vehicle_price_tables: VehiclePriceTableComplete[];
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

const FreightCompleteForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { estados, loading: estadosLoading } = useEstados();
  const [currentStep, setCurrentStep] = useState(1);

  // Form data state
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([]);
  const [origemEstado, setOrigemEstado] = useState('');
  const [origemCidade, setOrigemCidade] = useState('');
  const [destinos, setDestinos] = useState<DestinationComplete[]>([]);
  const [destinoEstado, setDestinoEstado] = useState('');
  const [destinoCidade, setDestinoCidade] = useState('');
  const [tipoMercadoria, setTipoMercadoria] = useState('');
  const [tiposVeiculos, setTiposVeiculos] = useState<VehicleTypeComplete[]>([]);
  const [tiposCarrocerias, setTiposCarrocerias] = useState<BodyTypeComplete[]>([]);
  const [vehiclePriceTables, setVehiclePriceTables] = useState<VehiclePriceTableComplete[]>([]);
  const [regrasAgendamento, setRegrasAgendamento] = useState<string[]>([]);
  const [beneficios, setBeneficios] = useState<string[]>([]);
  const [horarioCarregamento, setHorarioCarregamento] = useState('');
  const [precisaAjudante, setPrecisaAjudante] = useState(false);
  const [precisaRastreador, setPrecisaRastreador] = useState(false);
  const [precisaSeguro, setPrecisaSeguro] = useState(false);
  const [pedagogioPagoPor, setPedagogioPagoPor] = useState('');
  const [pedagogioDirecao, setPedagogioDirecao] = useState('');
  const [observacoes, setObservacoes] = useState('');
  
  // Dialog states
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [generatedFreights, setGeneratedFreights] = useState<GeneratedFreightComplete[]>([]);

  const { cidades: origemCidades, loading: origemCidadesLoading } = useCidades(origemEstado);
  const { cidades: destinoCidades, loading: destinoCidadesLoading } = useCidades(destinoEstado);

  // Fetch collaborators
  const { data: collaborators = [], isLoading: collaboratorsLoading } = useQuery({
    queryKey: ['collaborators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collaborators')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as CollaboratorComplete[];
    }
  });

  // Vehicle types data
  const availableVehicleTypes: VehicleTypeComplete[] = [
    { id: '1', type: 'Carreta', category: 'heavy', selected: false },
    { id: '2', type: 'Truck', category: 'heavy', selected: false },
    { id: '3', type: 'Toco', category: 'medium', selected: false },
    { id: '4', type: '3/4', category: 'medium', selected: false },
    { id: '5', type: 'VUC', category: 'light', selected: false },
    { id: '6', type: 'Van', category: 'light', selected: false },
    { id: '7', type: 'HR', category: 'light', selected: false },
  ];

  // Body types data
  const availableBodyTypes: BodyTypeComplete[] = [
    { id: '1', type: 'Carroceria Aberta', category: 'open', selected: false },
    { id: '2', type: 'Carroceria Fechada', category: 'closed', selected: false },
    { id: '3', type: 'Baú', category: 'closed', selected: false },
    { id: '4', type: 'Refrigerado', category: 'special', selected: false },
    { id: '5', type: 'Graneleiro', category: 'special', selected: false },
    { id: '6', type: 'Tanque', category: 'special', selected: false },
    { id: '7', type: 'Prancha', category: 'open', selected: false },
    { id: '8', type: 'Munk', category: 'special', selected: false },
  ];

  const handleAddDestino = () => {
    if (destinoEstado && destinoCidade) {
      const novoDestino: DestinationComplete = {
        id: Date.now().toString(),
        state: destinoEstado,
        city: destinoCidade
      };
      setDestinos([...destinos, novoDestino]);
      setDestinoEstado('');
      setDestinoCidade('');
    }
  };

  const handleRemoveDestino = (id: string) => {
    setDestinos(destinos.filter(d => d.id !== id));
  };

  const handleVehicleTypeChange = (vehicleId: string, checked: boolean) => {
    const updatedTypes = tiposVeiculos.map(v => 
      v.id === vehicleId ? { ...v, selected: checked } : v
    );
    setTiposVeiculos(updatedTypes);
  };

  const handleBodyTypeChange = (bodyId: string, checked: boolean) => {
    const updatedTypes = tiposCarrocerias.map(b => 
      b.id === bodyId ? { ...b, selected: checked } : b
    );
    setTiposCarrocerias(updatedTypes);
  };

  const handleAddPriceRange = (vehicleType: string) => {
    const newRange: PriceRangeComplete = {
      id: Date.now().toString(),
      kmStart: 0,
      kmEnd: 0,
      price: 0
    };

    const existingTable = vehiclePriceTables.find(t => t.vehicleType === vehicleType);
    
    if (existingTable) {
      setVehiclePriceTables(prev => prev.map(table => 
        table.vehicleType === vehicleType 
          ? { ...table, ranges: [...table.ranges, newRange] }
          : table
      ));
    } else {
      setVehiclePriceTables(prev => [...prev, {
        vehicleType,
        ranges: [newRange]
      }]);
    }
  };

  const handleUpdatePriceRange = (vehicleType: string, rangeId: string, field: keyof PriceRangeComplete, value: number) => {
    setVehiclePriceTables(prev => prev.map(table => 
      table.vehicleType === vehicleType 
        ? {
            ...table,
            ranges: table.ranges.map(range => 
              range.id === rangeId 
                ? { ...range, [field]: value }
                : range
            )
          }
        : table
    ));
  };

  const handleRemovePriceRange = (vehicleType: string, rangeId: string) => {
    setVehiclePriceTables(prev => prev.map(table => 
      table.vehicleType === vehicleType 
        ? { ...table, ranges: table.ranges.filter(range => range.id !== rangeId) }
        : table
    ).filter(table => table.ranges.length > 0));
  };

  const getFormData = (): FreightFormDataComplete => ({
    collaborator_ids: selectedCollaborators,
    origem_cidade: origemCidade,
    origem_estado: origemEstado,
    destinos,
    tipo_mercadoria: tipoMercadoria,
    tipos_veiculos: tiposVeiculos,
    tipos_carrocerias: tiposCarrocerias,
    vehicle_price_tables: vehiclePriceTables,
    regras_agendamento: regrasAgendamento,
    beneficios,
    horario_carregamento: horarioCarregamento,
    precisa_ajudante: precisaAjudante,
    precisa_rastreador: precisaRastreador,
    precisa_seguro: precisaSeguro,
    pedagio_pago_por: pedagogioPagoPor,
    pedagio_direcao: pedagogioDirecao,
    observacoes
  });

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return selectedCollaborators.length > 0 && origemCidade && origemEstado;
      case 2:
        return destinos.length > 0 && tipoMercadoria;
      case 3:
        return tiposVeiculos.some(v => v.selected);
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        setShowVerificationDialog(true);
      }
    } else {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios antes de continuar.",
        variant: "destructive"
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBack = () => {
    navigate('/freight-request');
  };

  const handleSubmit = async () => {
    setShowVerificationDialog(false);
    setShowLoadingAnimation(true);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        throw new Error('Usuário não autenticado');
      }

      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', userData.user.id)
        .single();

      if (companyError || !companyData) {
        throw new Error('Empresa não encontrada');
      }

      const baseFreightData = {
        company_id: companyData.id,
        collaborator_ids: selectedCollaborators,
        origem_cidade: origemCidade,
        origem_estado: origemEstado,
        tipo_mercadoria: tipoMercadoria,
        tipos_veiculos: tiposVeiculos.filter(v => v.selected),
        tipos_carrocerias: tiposCarrocerias.filter(b => b.selected),
        regras_agendamento: regrasAgendamento,
        beneficios,
        horario_carregamento: horarioCarregamento || null,
        precisa_ajudante: precisaAjudante,
        precisa_rastreador: precisaRastreador,
        precisa_seguro: precisaSeguro,
        pedagio_pago_por: pedagogioPagoPor || null,
        pedagio_direcao: pedagogioDirecao || null,
        observacoes: observacoes || null,
        tipo_frete: 'completo'
      };

      const createdFreights: GeneratedFreightComplete[] = [];

      for (const destino of destinos) {
        const freightData = {
          ...baseFreightData,
          destinos: [destino]
        };

        const { data: freight, error: freightError } = await supabase
          .from('fretes')
          .insert(freightData)
          .select('id, codigo_agregamento')
          .single();

        if (freightError) {
          console.error('Erro ao criar frete:', freightError);
          throw freightError;
        }

        if (freight) {
          createdFreights.push({
            id: freight.id,
            codigo_agregamento: freight.codigo_agregamento || 'N/A',
            destino_cidade: destino.city,
            destino_estado: destino.state
          });

          for (const table of vehiclePriceTables) {
            for (const range of table.ranges) {
              await supabase
                .from('freight_price_tables')
                .insert({
                  frete_id: freight.id,
                  vehicle_type: table.vehicleType,
                  km_start: range.kmStart,
                  km_end: range.kmEnd,
                  price: range.price
                });
            }
          }
        }
      }

      setGeneratedFreights(createdFreights);
      setShowLoadingAnimation(false);
      setShowSuccessDialog(true);
      
      toast({
        title: "Frete completo criado com sucesso!",
        description: `${createdFreights.length === 1 ? 'Frete criado' : `${createdFreights.length} fretes criados`} para ${createdFreights.length === 1 ? 'o destino' : 'os destinos'}.`,
      });

    } catch (error) {
      console.error('Erro ao criar frete completo:', error);
      setShowLoadingAnimation(false);
      toast({
        title: "Erro ao criar frete",
        description: "Ocorreu um erro ao criar o frete completo. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleNewFreight = () => {
    setShowSuccessDialog(false);
    window.location.reload();
  };

  const handleBackToDashboard = () => {
    navigate('/company-dashboard');
  };

  React.useEffect(() => {
    if (availableVehicleTypes.length > 0 && tiposVeiculos.length === 0) {
      setTiposVeiculos(availableVehicleTypes);
    }
    if (availableBodyTypes.length > 0 && tiposCarrocerias.length === 0) {
      setTiposCarrocerias(availableBodyTypes);
    }
  }, []);

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
                <p className="text-sm text-gray-600">Solicitação de frete completo</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Etapa {currentStep} de 4
              </div>
              <div className="flex space-x-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step === currentStep
                        ? 'bg-blue-600 text-white'
                        : step < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step 1: Collaborators and Origin */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <Card className="shadow-lg border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <CardTitle className="flex items-center space-x-2 text-blue-800">
                  <User className="w-6 h-6" />
                  <span>Colaboradores Responsáveis</span>
                </CardTitle>
                <CardDescription className="text-blue-600">
                  Selecione os colaboradores que serão responsáveis por este frete
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {collaboratorsLoading ? (
                  <div className="text-center py-4">Carregando colaboradores...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {collaborators.map((collaborator) => (
                      <div
                        key={collaborator.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedCollaborators.includes(collaborator.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => {
                          setSelectedCollaborators(prev => 
                            prev.includes(collaborator.id)
                              ? prev.filter(id => id !== collaborator.id)
                              : [...prev, collaborator.id]
                          );
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={selectedCollaborators.includes(collaborator.id)}
                            onChange={() => {}}
                          />
                          <div>
                            <h3 className="font-medium text-gray-800">{collaborator.name}</h3>
                            <p className="text-sm text-gray-600">{collaborator.sector}</p>
                            <p className="text-xs text-gray-500">{collaborator.phone}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg border-green-200">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                <CardTitle className="flex items-center space-x-2 text-green-800">
                  <MapPin className="w-6 h-6" />
                  <span>Origem</span>
                </CardTitle>
                <CardDescription className="text-green-600">
                  Defina o local de origem da carga
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="origem-estado">Estado de Origem *</Label>
                    <Select value={origemEstado} onValueChange={setOrigemEstado}>
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
                  <div className="space-y-2">
                    <Label htmlFor="origem-cidade">Cidade de Origem *</Label>
                    <Select 
                      value={origemCidade} 
                      onValueChange={setOrigemCidade}
                      disabled={!origemEstado}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a cidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {origemCidades.map((cidade) => (
                          <SelectItem key={cidade.id} value={cidade.nome}>
                            {cidade.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Destinations and Load */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <Card className="shadow-lg border-orange-200">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
                <CardTitle className="flex items-center space-x-2 text-orange-800">
                  <MapPin className="w-6 h-6" />
                  <span>Destinos</span>
                </CardTitle>
                <CardDescription className="text-orange-600">
                  Adicione os destinos para este frete completo
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Estado do Destino</Label>
                      <Select value={destinoEstado} onValueChange={setDestinoEstado}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
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
                    <div className="space-y-2">
                      <Label>Cidade do Destino</Label>
                      <Select 
                        value={destinoCidade} 
                        onValueChange={setDestinoCidade}
                        disabled={!destinoEstado}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {destinoCidades.map((cidade) => (
                            <SelectItem key={cidade.id} value={cidade.nome}>
                              {cidade.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button 
                        onClick={handleAddDestino}
                        disabled={!destinoEstado || !destinoCidade}
                        className="w-full bg-orange-600 hover:bg-orange-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>
                  </div>

                  {destinos.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-800">Destinos Adicionados:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {destinos.map((destino) => (
                          <div key={destino.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <span className="text-orange-800">
                              {destino.city}/{destino.state}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveDestino(destino.id)}
                              className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-purple-200">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
                <CardTitle className="text-purple-800">Informações da Carga</CardTitle>
                <CardDescription className="text-purple-600">
                  Defina as características da mercadoria
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo-mercadoria">Tipo de Mercadoria *</Label>
                    <Input
                      id="tipo-mercadoria"
                      value={tipoMercadoria}
                      onChange={(e) => setTipoMercadoria(e.target.value)}
                      placeholder="Ex: Produtos eletrônicos, roupas, alimentos..."
                      className="border-purple-200 focus:border-purple-400"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-8">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </Button>
          <Button
            onClick={handleNext}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center space-x-2"
          >
            <span>{currentStep === 4 ? 'Revisar Pedido' : 'Próxima'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </main>

      {/* Dialogs */}
      <FreightCompleteVerificationDialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
        formData={getFormData()}
        collaborators={collaborators}
        onEdit={() => setShowVerificationDialog(false)}
        onConfirm={handleSubmit}
        loading={false}
      />

      <FreightCompleteLoadingAnimation open={showLoadingAnimation} />

      <FreightCompleteSuccessDialog
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
