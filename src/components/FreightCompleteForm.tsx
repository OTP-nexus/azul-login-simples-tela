
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Package, Truck, MapPin, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useEstados, useCidades } from '@/hooks/useIBGE';

const FreightCompleteForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Estados e cidades hooks
  const { estados } = useEstados();
  const [selectedOriginState, setSelectedOriginState] = useState('');
  const { cidades: originCities } = useCidades(selectedOriginState);

  // Form data
  const [formData, setFormData] = useState({
    // Etapa 1 - Origem
    originState: '',
    originCity: '',
    mercadoriaType: '',
    weightKg: '',
    valueReais: '',
    
    // Etapa 2 - Destinos
    destinations: [{ state: '', city: '' }],
    
    // Etapa 3 - Configurações
    vehicleTypes: [],
    bodyTypes: [],
    priceTable: [],
    schedulingRules: [],
    benefits: [],
    loadingTime: '',
    needsHelper: false,
    needsInsurance: false,
    needsTracker: false,
    tollPaidBy: '',
    tollDirection: '',
    pickupDate: '',
    deliveryDate: '',
    observations: '',
    
    // Etapa 4 - Informações específicas do Frete Completo
    exclusiveLoad: true,
    cargoLength: '',
    cargoWidth: '',
    cargoHeight: '',
    specialEquipment: [],
    timeRestrictions: '',
    temperatureControl: '',
    urgencyLevel: 'normal',
    specialDocuments: '',
    accessRestrictions: '',
    unloadingRequirements: ''
  });

  const vehicleOptions = [
    'Utilitário', 'Van', 'Caminhão 3/4', 'Caminhão Toco', 
    'Caminhão Truck', 'Carreta', 'Bitrem', 'Rodotrem'
  ];

  const bodyTypeOptions = [
    'Aberta', 'Fechada/Baú', 'Graneleira', 'Tanque', 
    'Refrigerada', 'Porta Container', 'Cegonha', 'Prancha'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addDestination = () => {
    setFormData(prev => ({
      ...prev,
      destinations: [...prev.destinations, { state: '', city: '' }]
    }));
  };

  const removeDestination = (index: number) => {
    if (formData.destinations.length > 1) {
      setFormData(prev => ({
        ...prev,
        destinations: prev.destinations.filter((_, i) => i !== index)
      }));
    }
  };

  const updateDestination = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      destinations: prev.destinations.map((dest, i) => 
        i === index ? { ...dest, [field]: value } : dest
      )
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Aqui será implementada a lógica de salvamento
      console.log('Dados do frete completo:', formData);
      
      toast({
        title: "Sucesso!",
        description: "Frete completo solicitado com sucesso!",
      });
      
      navigate('/company-dashboard');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao solicitar frete completo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <MapPin className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-semibold">Origem da Carga</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Estado de Origem</Label>
          <Select onValueChange={(value) => {
            setSelectedOriginState(value);
            handleInputChange('originState', value);
          }}>
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
          <Label>Cidade de Origem</Label>
          <Select onValueChange={(value) => handleInputChange('originCity', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a cidade" />
            </SelectTrigger>
            <SelectContent>
              {originCities.map((cidade) => (
                <SelectItem key={cidade.id} value={cidade.nome}>
                  {cidade.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Tipo de Mercadoria</Label>
        <Input
          placeholder="Ex: Eletrônicos, Alimentos, Produtos químicos..."
          value={formData.mercadoriaType}
          onChange={(e) => handleInputChange('mercadoriaType', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Peso da Carga (kg)</Label>
          <Input
            type="number"
            placeholder="0"
            value={formData.weightKg}
            onChange={(e) => handleInputChange('weightKg', e.target.value)}
          />
        </div>
        
        <div>
          <Label>Valor da Carga (R$)</Label>
          <Input
            type="number"
            placeholder="0,00"
            value={formData.valueReais}
            onChange={(e) => handleInputChange('valueReais', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MapPin className="w-6 h-6 text-green-600" />
          <h3 className="text-xl font-semibold">Destinos da Carga</h3>
        </div>
        <Button onClick={addDestination} variant="outline" size="sm">
          + Adicionar Destino
        </Button>
      </div>
      
      {formData.destinations.map((destination, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Destino {index + 1}</h4>
            {formData.destinations.length > 1 && (
              <Button
                onClick={() => removeDestination(index)}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                Remover
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Estado</Label>
              <Select onValueChange={(value) => updateDestination(index, 'state', value)}>
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
              <Label>Cidade</Label>
              <Select onValueChange={(value) => updateDestination(index, 'city', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a cidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cidade1">Cidade 1</SelectItem>
                  <SelectItem value="cidade2">Cidade 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Truck className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl font-semibold">Configurações do Transporte</h3>
      </div>
      
      <div>
        <Label className="text-base font-medium mb-3 block">Tipos de Veículos</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {vehicleOptions.map((vehicle) => (
            <div key={vehicle} className="flex items-center space-x-2">
              <Checkbox
                id={vehicle}
                checked={formData.vehicleTypes.includes(vehicle)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleInputChange('vehicleTypes', [...formData.vehicleTypes, vehicle]);
                  } else {
                    handleInputChange('vehicleTypes', formData.vehicleTypes.filter(v => v !== vehicle));
                  }
                }}
              />
              <Label htmlFor={vehicle} className="text-sm">{vehicle}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">Tipos de Carroceria</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {bodyTypeOptions.map((bodyType) => (
            <div key={bodyType} className="flex items-center space-x-2">
              <Checkbox
                id={bodyType}
                checked={formData.bodyTypes.includes(bodyType)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleInputChange('bodyTypes', [...formData.bodyTypes, bodyType]);
                  } else {
                    handleInputChange('bodyTypes', formData.bodyTypes.filter(bt => bt !== bodyType));
                  }
                }}
              />
              <Label htmlFor={bodyType} className="text-sm">{bodyType}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Horário de Carregamento</Label>
          <Input
            type="time"
            value={formData.loadingTime}
            onChange={(e) => handleInputChange('loadingTime', e.target.value)}
          />
        </div>
        
        <div>
          <Label>Quem paga o pedágio?</Label>
          <Select onValueChange={(value) => handleInputChange('tollPaidBy', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="embarcador">Embarcador</SelectItem>
              <SelectItem value="transportador">Transportador</SelectItem>
              <SelectItem value="destinatario">Destinatário</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="needsHelper"
            checked={formData.needsHelper}
            onCheckedChange={(checked) => handleInputChange('needsHelper', checked)}
          />
          <Label htmlFor="needsHelper">Precisa de ajudante</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="needsInsurance"
            checked={formData.needsInsurance}
            onCheckedChange={(checked) => handleInputChange('needsInsurance', checked)}
          />
          <Label htmlFor="needsInsurance">Precisa de seguro</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="needsTracker"
            checked={formData.needsTracker}
            onCheckedChange={(checked) => handleInputChange('needsTracker', checked)}
          />
          <Label htmlFor="needsTracker">Precisa de rastreador</Label>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Package className="w-6 h-6 text-orange-600" />
        <h3 className="text-xl font-semibold">Informações Específicas do Frete Completo</h3>
      </div>
      
      {/* Dimensões da Carga */}
      <Card className="p-4">
        <h4 className="font-medium mb-4">Dimensões da Carga</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Comprimento (m)</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="0.0"
              value={formData.cargoLength}
              onChange={(e) => handleInputChange('cargoLength', e.target.value)}
            />
          </div>
          <div>
            <Label>Largura (m)</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="0.0"
              value={formData.cargoWidth}
              onChange={(e) => handleInputChange('cargoWidth', e.target.value)}
            />
          </div>
          <div>
            <Label>Altura (m)</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="0.0"
              value={formData.cargoHeight}
              onChange={(e) => handleInputChange('cargoHeight', e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Equipamentos Especiais */}
      <div>
        <Label className="text-base font-medium mb-3 block">Equipamentos Especiais Necessários</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {['Guincho', 'Empilhadeira', 'Ponte Rolante', 'Munck', 'Plataforma Elevatória'].map((equipment) => (
            <div key={equipment} className="flex items-center space-x-2">
              <Checkbox
                id={equipment}
                checked={formData.specialEquipment.includes(equipment)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleInputChange('specialEquipment', [...formData.specialEquipment, equipment]);
                  } else {
                    handleInputChange('specialEquipment', formData.specialEquipment.filter(eq => eq !== equipment));
                  }
                }}
              />
              <Label htmlFor={equipment} className="text-sm">{equipment}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Condições Especiais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Controle de Temperatura</Label>
          <Select onValueChange={(value) => handleInputChange('temperatureControl', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ambiente">Temperatura Ambiente</SelectItem>
              <SelectItem value="refrigerado">Refrigerado (0°C a 10°C)</SelectItem>
              <SelectItem value="congelado">Congelado (-18°C a 0°C)</SelectItem>
              <SelectItem value="controlada">Temperatura Controlada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Nível de Urgência</Label>
          <Select onValueChange={(value) => handleInputChange('urgencyLevel', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="urgente">Urgente</SelectItem>
              <SelectItem value="expresso">Expresso</SelectItem>
              <SelectItem value="agendado">Agendado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Observações Específicas */}
      <div>
        <Label>Restrições de Horário</Label>
        <Textarea
          placeholder="Ex: Coleta apenas das 8h às 17h, entrega somente em horário comercial..."
          value={formData.timeRestrictions}
          onChange={(e) => handleInputChange('timeRestrictions', e.target.value)}
        />
      </div>

      <div>
        <Label>Documentação Especial</Label>
        <Textarea
          placeholder="Ex: Nota fiscal específica, licenças, autorizações especiais..."
          value={formData.specialDocuments}
          onChange={(e) => handleInputChange('specialDocuments', e.target.value)}
        />
      </div>

      <div>
        <Label>Restrições de Acesso</Label>
        <Textarea
          placeholder="Ex: Local de difícil acesso, necessita agendamento, portaria restrita..."
          value={formData.accessRestrictions}
          onChange={(e) => handleInputChange('accessRestrictions', e.target.value)}
        />
      </div>

      <div>
        <Label>Requisitos para Descarregamento</Label>
        <Textarea
          placeholder="Ex: Necessita de ajudantes, equipamentos específicos, cuidados especiais..."
          value={formData.unloadingRequirements}
          onChange={(e) => handleInputChange('unloadingRequirements', e.target.value)}
        />
      </div>

      <div>
        <Label>Observações Gerais</Label>
        <Textarea
          placeholder="Informações adicionais importantes..."
          value={formData.observations}
          onChange={(e) => handleInputChange('observations', e.target.value)}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => navigate('/freight-request')}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>
                {currentStep === 1 && 'Origem da Carga'}
                {currentStep === 2 && 'Destinos da Carga'}
                {currentStep === 3 && 'Configurações do Transporte'}
                {currentStep === 4 && 'Informações Específicas'}
              </span>
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Informe a origem e detalhes da carga'}
              {currentStep === 2 && 'Adicione os destinos para entrega'}
              {currentStep === 3 && 'Configure os requisitos do transporte'}
              {currentStep === 4 && 'Defina as especificações do frete completo'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                onClick={prevStep}
                variant="outline"
                disabled={currentStep === 1}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior</span>
              </Button>
              
              {currentStep < 4 ? (
                <Button
                  onClick={nextStep}
                  className="flex items-center space-x-2"
                >
                  <span>Próximo</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  Solicitar Frete Completo
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default FreightCompleteForm;
