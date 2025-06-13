import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Users, MapPin, Truck, Settings, Calendar, Package, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import FreightLoadingAnimation from './FreightLoadingAnimation';
import FreightVerificationDialog from './FreightVerificationDialog';
import FreightSuccessDialog from './FreightSuccessDialog';

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
    
    // Etapa 2 - Origem e Destino
    origem: {
      estado: '',
      cidade: ''
    },
    destino: {
      estado: '',
      cidade: ''
    },
    
    // Etapa 3 - Carga e Veículos
    tipoMercadoria: '',
    pesoCarga: '',
    valorCarga: '',
    dataColeta: '',
    dataEntrega: '',
    tiposVeiculos: [] as string[],
    tiposCarrocerias: [] as string[],
    precisaSeguro: false,
    
    // Etapa 4 - Configurações
    valorFrete: '',
    pedagioPagoPor: '',
    pedagioDirecao: '',
    precisaAjudante: false,
    precisaRastreador: false,
    beneficios: [] as string[],
    observacoes: ''
  });

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

  const steps = [
    { number: 1, title: 'Colaboradores', icon: Users, description: 'Selecione os responsáveis' },
    { number: 2, title: 'Origem e Destino', icon: MapPin, description: 'Locais de coleta e entrega' },
    { number: 3, title: 'Carga e Veículos', icon: Truck, description: 'Especificações da carga' },
    { number: 4, title: 'Configurações', icon: Settings, description: 'Detalhes finais' }
  ];

  const vehicleTypes = [
    'Carreta (Cavalo + Carreta)',
    'Truck',
    'VUC (Veículo Urbano de Carga)',
    'Utilitário',
    'Van',
    'HR (Hyundai HR)',
    'Kombi',
    'Moto'
  ];

  const bodyTypes = [
    'Baú',
    'Sider',
    'Graneleiro',
    'Caçamba',
    'Prancha',
    'Refrigerado',
    'Tanque',
    'Cegonha',
    'Bitrem',
    'Rodotrem'
  ];

  const benefitOptions = [
    'Vale combustível',
    'Adiantamento',
    'Desconto no óleo diesel',
    'Seguro carga incluso',
    'Manutenção coberta',
    'Pneus inclusos'
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

      const freightData = {
        company_id: company.id,
        tipo_frete: 'frete_completo',
        origem_estado: formData.origem.estado,
        origem_cidade: formData.origem.cidade,
        destinos: [formData.destino],
        tipo_mercadoria: formData.tipoMercadoria,
        peso_carga: formData.pesoCarga ? parseFloat(formData.pesoCarga) : null,
        valor_carga: formData.valorCarga ? parseFloat(formData.valorCarga) : null,
        data_coleta: formData.dataColeta || null,
        data_entrega: formData.dataEntrega || null,
        tipos_veiculos: formData.tiposVeiculos,
        tipos_carrocerias: formData.tiposCarrocerias,
        precisa_seguro: formData.precisaSeguro,
        precisa_ajudante: formData.precisaAjudante,
        precisa_rastreador: formData.precisaRastreador,
        pedagio_pago_por: formData.pedagioPagoPor,
        pedagio_direcao: formData.pedagioDirecao,
        beneficios: formData.beneficios,
        observacoes: formData.observacoes,
        valores_definidos: {
          valor_frete: formData.valorFrete ? parseFloat(formData.valorFrete) : null
        },
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
        destino_cidade: formData.destino.cidade,
        destino_estado: formData.destino.estado
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
    destinos: [{ id: '1', state: formData.destino.estado, city: formData.destino.cidade }],
    tipo_mercadoria: formData.tipoMercadoria,
    tipos_veiculos: formData.tiposVeiculos.map((type, index) => ({
      id: index.toString(),
      type,
      category: 'heavy' as const,
      selected: true
    })),
    tipos_carrocerias: formData.tiposCarrocerias.map((type, index) => ({
      id: index.toString(),
      type,
      category: 'closed' as const,
      selected: true
    })),
    vehicle_price_tables: [{
      vehicleType: 'Frete Completo',
      ranges: [{
        id: '1',
        kmStart: 0,
        kmEnd: 9999,
        price: formData.valorFrete ? parseFloat(formData.valorFrete) : 0
      }]
    }],
    regras_agendamento: [],
    beneficios: formData.beneficios,
    horario_carregamento: '',
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

        {/* Etapa 2 - Origem e Destino */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Origem e Destino</span>
              </CardTitle>
              <CardDescription>
                Defina os locais de coleta e entrega da carga
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Origem (Coleta)</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="origem-estado">Estado</Label>
                      <Input
                        id="origem-estado"
                        value={formData.origem.estado}
                        onChange={(e) => setFormData({
                          ...formData,
                          origem: { ...formData.origem, estado: e.target.value }
                        })}
                        placeholder="Ex: São Paulo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="origem-cidade">Cidade</Label>
                      <Input
                        id="origem-cidade"
                        value={formData.origem.cidade}
                        onChange={(e) => setFormData({
                          ...formData,
                          origem: { ...formData.origem, cidade: e.target.value }
                        })}
                        placeholder="Ex: São Paulo"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Destino (Entrega)</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="destino-estado">Estado</Label>
                      <Input
                        id="destino-estado"
                        value={formData.destino.estado}
                        onChange={(e) => setFormData({
                          ...formData,
                          destino: { ...formData.destino, estado: e.target.value }
                        })}
                        placeholder="Ex: Rio de Janeiro"
                      />
                    </div>
                    <div>
                      <Label htmlFor="destino-cidade">Cidade</Label>
                      <Input
                        id="destino-cidade"
                        value={formData.destino.cidade}
                        onChange={(e) => setFormData({
                          ...formData,
                          destino: { ...formData.destino, cidade: e.target.value }
                        })}
                        placeholder="Ex: Rio de Janeiro"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Etapa 3 - Carga e Veículos */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>Informações da Carga</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="tipo-mercadoria">Tipo de Mercadoria</Label>
                    <Input
                      id="tipo-mercadoria"
                      value={formData.tipoMercadoria}
                      onChange={(e) => setFormData({ ...formData, tipoMercadoria: e.target.value })}
                      placeholder="Ex: Eletrônicos"
                    />
                  </div>
                  <div>
                    <Label htmlFor="peso-carga">Peso da Carga (kg)</Label>
                    <Input
                      id="peso-carga"
                      type="number"
                      value={formData.pesoCarga}
                      onChange={(e) => setFormData({ ...formData, pesoCarga: e.target.value })}
                      placeholder="1000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="valor-carga">Valor da Carga (R$)</Label>
                    <Input
                      id="valor-carga"
                      type="number"
                      step="0.01"
                      value={formData.valorCarga}
                      onChange={(e) => setFormData({ ...formData, valorCarga: e.target.value })}
                      placeholder="50000.00"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="precisa-seguro"
                      checked={formData.precisaSeguro}
                      onCheckedChange={(checked) => setFormData({ ...formData, precisaSeguro: !!checked })}
                    />
                    <Label htmlFor="precisa-seguro">Precisa de seguro</Label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="data-coleta">Data de Coleta</Label>
                    <Input
                      id="data-coleta"
                      type="date"
                      value={formData.dataColeta}
                      onChange={(e) => setFormData({ ...formData, dataColeta: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="data-entrega">Data de Entrega</Label>
                    <Input
                      id="data-entrega"
                      type="date"
                      value={formData.dataEntrega}
                      onChange={(e) => setFormData({ ...formData, dataEntrega: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="w-5 h-5" />
                  <span>Tipos de Veículos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {vehicleTypes.map((type) => (
                    <div
                      key={type}
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        formData.tiposVeiculos.includes(type)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        const selected = formData.tiposVeiculos.includes(type);
                        if (selected) {
                          setFormData({
                            ...formData,
                            tiposVeiculos: formData.tiposVeiculos.filter(t => t !== type)
                          });
                        } else {
                          setFormData({
                            ...formData,
                            tiposVeiculos: [...formData.tiposVeiculos, type]
                          });
                        }
                      }}
                    >
                      <p className="text-sm font-medium">{type}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tipos de Carrocerias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {bodyTypes.map((type) => (
                    <div
                      key={type}
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        formData.tiposCarrocerias.includes(type)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        const selected = formData.tiposCarrocerias.includes(type);
                        if (selected) {
                          setFormData({
                            ...formData,
                            tiposCarrocerias: formData.tiposCarrocerias.filter(t => t !== type)
                          });
                        } else {
                          setFormData({
                            ...formData,
                            tiposCarrocerias: [...formData.tiposCarrocerias, type]
                          });
                        }
                      }}
                    >
                      <p className="text-sm font-medium">{type}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Etapa 4 - Configurações */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>Valor do Frete</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="valor-frete">Valor do Frete (R$)</Label>
                  <Input
                    id="valor-frete"
                    type="number"
                    step="0.01"
                    value={formData.valorFrete}
                    onChange={(e) => setFormData({ ...formData, valorFrete: e.target.value })}
                    placeholder="5000.00"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configurações de Pedágio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="pedagio-pago-por">Pedágio pago por</Label>
                  <Select 
                    value={formData.pedagioPagoPor} 
                    onValueChange={(value) => setFormData({ ...formData, pedagioPagoPor: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione quem paga" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="embarcador">Embarcador</SelectItem>
                      <SelectItem value="transportador">Transportador</SelectItem>
                      <SelectItem value="motorista">Motorista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                      <SelectItem value="ida">Só ida</SelectItem>
                      <SelectItem value="volta">Só volta</SelectItem>
                      <SelectItem value="ida_volta">Ida e volta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Benefícios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {benefitOptions.map((benefit) => (
                    <div
                      key={benefit}
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        formData.beneficios.includes(benefit)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        const selected = formData.beneficios.includes(benefit);
                        if (selected) {
                          setFormData({
                            ...formData,
                            beneficios: formData.beneficios.filter(b => b !== benefit)
                          });
                        } else {
                          setFormData({
                            ...formData,
                            beneficios: [...formData.beneficios, benefit]
                          });
                        }
                      }}
                    >
                      <p className="text-sm font-medium">{benefit}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configurações Adicionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
            destino: { estado: '', cidade: '' },
            tipoMercadoria: '',
            pesoCarga: '',
            valorCarga: '',
            dataColeta: '',
            dataEntrega: '',
            tiposVeiculos: [],
            tiposCarrocerias: [],
            precisaSeguro: false,
            valorFrete: '',
            pedagioPagoPor: '',
            pedagioDirecao: '',
            precisaAjudante: false,
            precisaRastreador: false,
            beneficios: [],
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
