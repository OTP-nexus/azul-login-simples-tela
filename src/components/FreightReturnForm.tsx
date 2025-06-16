import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, ArrowRight, MapPin, Calendar, Package, DollarSign, Truck, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import FreightLoadingAnimation from './FreightLoadingAnimation';
import FreightVerificationDialog from './FreightVerificationDialog';
import FreightSuccessDialog from './FreightSuccessDialog';
import { useEstados, useCidades } from '@/hooks/useIBGE';
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

const FreightReturnForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [generatedFreight, setGeneratedFreight] = useState(null);

  const {
    errors,
    validateStep1: validateReturnStep1,
    validateStep2: validateReturnStep2,
    validateStep3: validateReturnStep3,
    clearErrors
  } = useFreightFormValidation();

  const [formData, setFormData] = useState<FreightFormData>({
    selectedCollaborators: [] as string[],
    origem: {
      estado: '',
      cidade: ''
    },
    destino: {
      estado: '',
      cidade: ''
    },
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
  const { cidades: cidadesDestino } = useCidades(formData.destino.estado);

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

  const handleSubmit = async () => {
    if (!validateReturnStep3(formData)) {
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

      const destinos = [{
        id: '1',
        state: formData.destino.estado,
        city: formData.destino.cidade
      }];

      const valoresDefinidos = formData.tipoValor === 'valor' ? {
        tipo: 'valor_fixo',
        valor: formData.valorOfertado ? parseFloat(formData.valorOfertado) : 0
      } : {
        tipo: 'a_combinar'
      };

      const freightData = {
        company_id: company.id,
        tipo_frete: 'frete_de_retorno',
        origem_estado: formData.origem.estado,
        origem_cidade: formData.origem.cidade,
        destino_estado: formData.destino.estado,
        destino_cidade: formData.destino.cidade,
        destinos: destinos,
        tipo_mercadoria: 'Geral',
        data_coleta: formData.dataColeta || null,
        horario_carregamento: formData.horarioColeta || null,
        peso_carga: formData.peso ? parseFloat(formData.peso.replace(/\./g, '')) : null,
        altura_carga: formData.dimensoes.altura ? parseFloat(formData.dimensoes.altura) : null,
        largura_carga: formData.dimensoes.largura ? parseFloat(formData.dimensoes.largura) : null,
        comprimento_carga: formData.dimensoes.comprimento ? parseFloat(formData.dimensoes.comprimento) : null,
        tipos_veiculos: formData.tiposVeiculos,
        tipos_carrocerias: formData.tiposCarrocerias,
        valores_definidos: valoresDefinidos,
        precisa_ajudante: formData.precisaAjudante,
        precisa_rastreador: formData.precisaRastreador,
        precisa_seguro: formData.precisaSeguro,
        pedagio_pago_por: formData.pedagioPagoPor,
        pedagio_direcao: formData.pedagioPagoPor === 'motorista' ? null : formData.pedagioDirecao || null,
        observacoes: formData.observacoes,
        collaborator_ids: formData.selectedCollaborators,
        status: 'pendente'
      };

      console.log('Dados do frete de retorno a serem salvos:', freightData);

      const { data, error } = await supabase
        .from('fretes')
        .insert([freightData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar frete de retorno:', error);
        throw error;
      }

      console.log('Frete de retorno salvo com sucesso:', data);

      setGeneratedFreight({
        id: data.id,
        codigo_agregamento: data.codigo_agregamento,
        destino_cidade: formData.destino.cidade,
        destino_estado: formData.destino.estado
      });

      setIsSubmitting(false);
      setShowVerificationDialog(false);
      setShowSuccessDialog(true);

      toast({
        title: "Sucesso!",
        description: "Frete de retorno criado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao criar frete de retorno:', error);
      setIsSubmitting(false);
      setShowVerificationDialog(false);
      toast({
        title: "Erro",
        description: `Erro ao criar frete de retorno: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    navigate('/freight-request');
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
    { number: 1, title: 'Colaboradores', icon: Truck, description: 'Selecione os responsáveis' },
    { number: 2, title: 'Detalhes do Frete', icon: MapPin, description: 'Origem, destino e informações' },
    { number: 3, title: 'Configurações', icon: Settings, description: 'Detalhes finais' }
  ];

  const handleNext = () => {
    clearErrors();
    
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = validateReturnStep1(formData);
        break;
      case 2:
        isValid = validateReturnStep2(formData);
        break;
      case 3:
        isValid = validateReturnStep3(formData);
        if (isValid) {
          setShowVerificationDialog(true);
          return;
        }
        break;
    }
    
    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    clearErrors();
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
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
                <h1 className="text-xl font-bold text-gray-800">Frete de Retorno</h1>
                <p className="text-sm text-gray-600">Etapa {currentStep} de 3</p>
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
                <Truck className="w-5 h-5" />
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

            <Card className={errors.destino ? 'border-red-300' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  <span>Destino *</span>
                </CardTitle>
                <CardDescription>
                  Local de entrega da carga
                </CardDescription>
                <ErrorMessage error={errors.destino} />
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="destino-estado">Estado *</Label>
                  <Select 
                    value={formData.destino.estado} 
                    onValueChange={(value) => setFormData({
                      ...formData,
                      destino: { estado: value, cidade: '' }
                    })}
                  >
                    <SelectTrigger className={errors.destino ? 'border-red-300' : ''}>
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
                  <Label htmlFor="destino-cidade">Cidade *</Label>
                  <Select 
                    value={formData.destino.cidade} 
                    onValueChange={(value) => setFormData({
                      ...formData,
                      destino: { ...formData.destino, cidade: value }
                    })}
                    disabled={!formData.destino.estado}
                  >
                    <SelectTrigger className={errors.destino ? 'border-red-300' : ''}>
                      <SelectValue placeholder="Selecione a cidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {cidadesDestino.map((cidade) => (
                        <SelectItem key={cidade.id} value={cidade.nome}>
                          {cidade.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
            <span>{currentStep === 3 ? 'Verificar Dados' : 'Próximo'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </main>

      <FreightVerificationDialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
        formData={{
          collaborator_ids: formData.selectedCollaborators,
          origem_cidade: formData.origem.cidade,
          origem_estado: formData.origem.estado,
          destino_cidade: formData.destino.cidade,
          destino_estado: formData.destino.estado,
          destinos: [{
            id: '1',
            state: formData.destino.estado,
            city: formData.destino.cidade
          }],
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
        }}
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
        generatedFreight={generatedFreight}
        onNewFreight={() => {
          setShowSuccessDialog(false);
          setCurrentStep(1);
          setFormData({
            selectedCollaborators: [],
            origem: { estado: '', cidade: '' },
            destino: { estado: '', cidade: '' },
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

export default FreightReturnForm;
