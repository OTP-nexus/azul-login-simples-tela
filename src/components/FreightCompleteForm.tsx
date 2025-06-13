import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, MapPin, Package, Truck, DollarSign, FileText, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import FreightLoadingAnimation from './FreightLoadingAnimation';
import FreightSuccessDialog from './FreightSuccessDialog';

interface FormData {
  // Etapa 1 - Origem e Destino
  origem: {
    cep: string;
    endereco: string;
    cidade: string;
    estado: string;
  };
  destinos: Array<{
    cep: string;
    endereco: string;
    cidade: string;
    estado: string;
  }>;
  // Etapa 2 - Carga
  tipoCarga: string;
  peso: string;
  dimensoes: {
    comprimento: string;
    largura: string;
    altura: string;
  };
  valor: string;
  observacoesCarga: string;
  // Etapa 3 - Veículo
  tipoVeiculo: string;
  tipoCarroceria: string;
  // Etapa 4 - Valor e Condições
  tipoValor: string;
  valorFrete: string;
  quemPagaPedagio: string;
  direcaoPedagio: string;
  precisaAjudante: boolean;
  precisaRastreador: boolean;
  precisaSeguro: boolean;
  observacoes: string;
}

const tiposVeiculos = [
  { value: "van", label: "Van" },
  { value: "vuc", label: "VUC" },
  { value: "34", label: "3/4" },
  { value: "toco", label: "Toco" },
  { value: "truck", label: "Truck" },
  { value: "carreta", label: "Carreta" },
  { value: "bitrem", label: "Bitrem" },
  { value: "rodotrem", label: "Rodotrem" },
];

const tiposCarrocerias = [
  { value: "bau", label: "Baú" },
  { value: "bau-refrigerado", label: "Baú Refrigerado" },
  { value: "sider", label: "Sider" },
  { value: "cacamba", label: "Caçamba" },
  { value: "grade-baixa", label: "Grade Baixa" },
  { value: "prancha", label: "Prancha" },
  { value: "container", label: "Container" },
];

const FreightCompleteForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedFreights, setGeneratedFreights] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    origem: { cep: '', endereco: '', cidade: '', estado: '' },
    destinos: [{ cep: '', endereco: '', cidade: '', estado: '' }],
    tipoCarga: '',
    peso: '',
    dimensoes: { comprimento: '', largura: '', altura: '' },
    valor: '',
    observacoesCarga: '',
    tipoVeiculo: '',
    tipoCarroceria: '',
    tipoValor: 'combinar',
    valorFrete: '',
    quemPagaPedagio: '',
    direcaoPedagio: '',
    precisaAjudante: false,
    precisaRastreador: false,
    precisaSeguro: false,
    observacoes: '',
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent as keyof FormData],
            [child]: value
          }
        };
      } else if (field.includes('[')) {
        const match = field.match(/(\w+)\[(\d+)\]\.(\w+)/);
        if (match) {
          const [_, arrayName, index, property] = match;
          const newArray = [...prev[arrayName as keyof FormData] as any[]];
          newArray[parseInt(index)][property] = value;
          return {
            ...prev,
            [arrayName]: newArray
          };
        }
        return prev;
      } else {
        return {
          ...prev,
          [field]: value
        };
      }
    });
  };

  const addDestino = () => {
    setFormData(prev => ({
      ...prev,
      destinos: [...prev.destinos, { cep: '', endereco: '', cidade: '', estado: '' }]
    }));
  };

  const removeDestino = (index: number) => {
    if (formData.destinos.length > 1) {
      setFormData(prev => ({
        ...prev,
        destinos: prev.destinos.filter((_, i) => i !== index)
      }));
    }
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
      } else {
        submitForm();
      }
    } else {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return formData.origem.cep && formData.origem.cidade && formData.origem.estado &&
          formData.destinos.every(d => d.cep && d.cidade && d.estado);
      case 2:
        return formData.tipoCarga && formData.peso;
      case 3:
        return formData.tipoVeiculo && formData.tipoCarroceria;
      case 4:
        if (formData.tipoValor === 'valor' && !formData.valorFrete) {
          return false;
        }
        return formData.quemPagaPedagio && 
          (formData.quemPagaPedagio !== 'empresa' || formData.direcaoPedagio);
      default:
        return true;
    }
  };

  const submitForm = async () => {
    setIsLoading(true);
    
    try {
      // Simulação de envio para API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulação de resposta da API
      const mockResponse = formData.destinos.map((destino, index) => ({
        id: `freight-${Date.now()}-${index}`,
        codigo_agregamento: `FR${Math.floor(100000 + Math.random() * 900000)}`,
        destino_cidade: destino.cidade,
        destino_estado: destino.estado,
      }));
      
      setGeneratedFreights(mockResponse);
      setShowSuccess(true);
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: "Ocorreu um erro ao enviar sua solicitação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewFreight = () => {
    setShowSuccess(false);
    setFormData({
      origem: { cep: '', endereco: '', cidade: '', estado: '' },
      destinos: [{ cep: '', endereco: '', cidade: '', estado: '' }],
      tipoCarga: '',
      peso: '',
      dimensoes: { comprimento: '', largura: '', altura: '' },
      valor: '',
      observacoesCarga: '',
      tipoVeiculo: '',
      tipoCarroceria: '',
      tipoValor: 'combinar',
      valorFrete: '',
      quemPagaPedagio: '',
      direcaoPedagio: '',
      precisaAjudante: false,
      precisaRastreador: false,
      precisaSeguro: false,
      observacoes: '',
    });
    setCurrentStep(1);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">Origem e Destino</h2>
        <p className="text-gray-600">Informe os locais de coleta e entrega</p>
      </div>

      {/* Origem */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Local de Origem</span>
          </CardTitle>
          <CardDescription>
            Informe o endereço de coleta da carga
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="origem-cep">CEP</Label>
              <Input
                id="origem-cep"
                placeholder="00000-000"
                value={formData.origem.cep}
                onChange={(e) => handleInputChange('origem.cep', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="origem-endereco">Endereço</Label>
              <Input
                id="origem-endereco"
                placeholder="Rua, número, complemento"
                value={formData.origem.endereco}
                onChange={(e) => handleInputChange('origem.endereco', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="origem-cidade">Cidade</Label>
              <Input
                id="origem-cidade"
                placeholder="Cidade"
                value={formData.origem.cidade}
                onChange={(e) => handleInputChange('origem.cidade', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="origem-estado">Estado</Label>
              <Input
                id="origem-estado"
                placeholder="UF"
                value={formData.origem.estado}
                onChange={(e) => handleInputChange('origem.estado', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Destinos */}
      {formData.destinos.map((destino, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Local de Destino {formData.destinos.length > 1 ? `#${index + 1}` : ''}</span>
              </div>
              {formData.destinos.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDestino(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  Remover
                </Button>
              )}
            </CardTitle>
            <CardDescription>
              Informe o endereço de entrega da carga
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`destino-cep-${index}`}>CEP</Label>
                <Input
                  id={`destino-cep-${index}`}
                  placeholder="00000-000"
                  value={destino.cep}
                  onChange={(e) => handleInputChange(`destinos[${index}].cep`, e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`destino-endereco-${index}`}>Endereço</Label>
                <Input
                  id={`destino-endereco-${index}`}
                  placeholder="Rua, número, complemento"
                  value={destino.endereco}
                  onChange={(e) => handleInputChange(`destinos[${index}].endereco`, e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`destino-cidade-${index}`}>Cidade</Label>
                <Input
                  id={`destino-cidade-${index}`}
                  placeholder="Cidade"
                  value={destino.cidade}
                  onChange={(e) => handleInputChange(`destinos[${index}].cidade`, e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`destino-estado-${index}`}>Estado</Label>
                <Input
                  id={`destino-estado-${index}`}
                  placeholder="UF"
                  value={destino.estado}
                  onChange={(e) => handleInputChange(`destinos[${index}].estado`, e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={addDestino}
          className="flex items-center space-x-2"
        >
          <span>Adicionar outro destino</span>
          <MapPin className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">Informações da Carga</h2>
        <p className="text-gray-600">Descreva as características da carga a ser transportada</p>
      </div>

      {/* Tipo de Carga */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Tipo de Carga</span>
          </CardTitle>
          <CardDescription>
            Informe o tipo de mercadoria a ser transportada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Ex: Eletrônicos, Alimentos, Móveis, etc."
            value={formData.tipoCarga}
            onChange={(e) => handleInputChange('tipoCarga', e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Peso e Dimensões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Peso e Dimensões</span>
          </CardTitle>
          <CardDescription>
            Informe o peso e as dimensões da carga
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="peso">Peso (kg)</Label>
            <Input
              id="peso"
              type="number"
              placeholder="0"
              value={formData.peso}
              onChange={(e) => handleInputChange('peso', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="comprimento">Comprimento (cm)</Label>
              <Input
                id="comprimento"
                type="number"
                placeholder="0"
                value={formData.dimensoes.comprimento}
                onChange={(e) => handleInputChange('dimensoes.comprimento', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="largura">Largura (cm)</Label>
              <Input
                id="largura"
                type="number"
                placeholder="0"
                value={formData.dimensoes.largura}
                onChange={(e) => handleInputChange('dimensoes.largura', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="altura">Altura (cm)</Label>
              <Input
                id="altura"
                type="number"
                placeholder="0"
                value={formData.dimensoes.altura}
                onChange={(e) => handleInputChange('dimensoes.altura', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Valor da Carga */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>Valor da Carga</span>
          </CardTitle>
          <CardDescription>
            Informe o valor aproximado da mercadoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="number"
            placeholder="0,00"
            value={formData.valor}
            onChange={(e) => handleInputChange('valor', e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Observações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Observações sobre a Carga</span>
          </CardTitle>
          <CardDescription>
            Adicione informações adicionais sobre a carga (opcional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Ex: Carga frágil, necessita cuidados especiais, etc..."
            value={formData.observacoesCarga}
            onChange={(e) => handleInputChange('observacoesCarga', e.target.value)}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">Tipo de Veículo</h2>
        <p className="text-gray-600">Selecione o tipo de veículo necessário para o transporte</p>
      </div>

      {/* Tipo de Veículo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Truck className="w-5 h-5" />
            <span>Tipo de Veículo</span>
          </CardTitle>
          <CardDescription>
            Escolha o tipo de veículo adequado para sua carga
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tiposVeiculos.map((tipo) => (
              <div key={tipo.value} className="flex items-center space-x-2">
                <RadioGroup
                  value={formData.tipoVeiculo}
                  onValueChange={(value) => handleInputChange('tipoVeiculo', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={tipo.value} id={`veiculo-${tipo.value}`} />
                    <Label htmlFor={`veiculo-${tipo.value}`} className="cursor-pointer flex-1">
                      <div className={`border rounded-lg p-4 transition-all ${
                        formData.tipoVeiculo === tipo.value 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                      }`}>
                        <h3 className={`font-medium ${
                          formData.tipoVeiculo === tipo.value ? 'text-blue-800' : 'text-gray-800'
                        }`}>{tipo.label}</h3>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tipo de Carroceria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Truck className="w-5 h-5" />
            <span>Tipo de Carroceria</span>
          </CardTitle>
          <CardDescription>
            Escolha o tipo de carroceria necessária
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tiposCarrocerias.map((tipo) => (
              <div key={tipo.value} className="flex items-center space-x-2">
                <RadioGroup
                  value={formData.tipoCarroceria}
                  onValueChange={(value) => handleInputChange('tipoCarroceria', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={tipo.value} id={`carroceria-${tipo.value}`} />
                    <Label htmlFor={`carroceria-${tipo.value}`} className="cursor-pointer flex-1">
                      <div className={`border rounded-lg p-4 transition-all ${
                        formData.tipoCarroceria === tipo.value 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-green-300 hover:bg-green-25'
                      }`}>
                        <h3 className={`font-medium ${
                          formData.tipoCarroceria === tipo.value ? 'text-green-800' : 'text-gray-800'
                        }`}>{tipo.label}</h3>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">Valor e Condições</h2>
        <p className="text-gray-600">Configure o valor do frete e condições adicionais</p>
      </div>

      {/* Tipo de Valor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>Valor do Frete</span>
          </CardTitle>
          <CardDescription>
            Escolha como definir o valor do frete
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={formData.tipoValor}
            onValueChange={(value) => handleInputChange('tipoValor', value)}
            className="space-y-4"
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
              <Label htmlFor="valorFrete">Valor do Frete (R$)</Label>
              <Input
                id="valorFrete"
                type="number"
                placeholder="0,00"
                value={formData.valorFrete}
                onChange={(e) => handleInputChange('valorFrete', e.target.value)}
                className="mt-1"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pedágio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Pedágio</span>
          </CardTitle>
          <CardDescription>
            Defina quem será responsável pelo pagamento do pedágio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Quem paga o pedágio?</Label>
            <Select 
              value={formData.quemPagaPedagio} 
              onValueChange={(value) => handleInputChange('quemPagaPedagio', value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Selecione quem paga" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="motorista">Motorista</SelectItem>
                <SelectItem value="empresa">Empresa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.quemPagaPedagio === 'empresa' && (
            <div>
              <Label className="text-sm font-medium">Direção do pedágio</Label>
              <Select 
                value={formData.direcaoPedagio} 
                onValueChange={(value) => handleInputChange('direcaoPedagio', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione a direção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apenas-ida">Apenas ida</SelectItem>
                  <SelectItem value="apenas-volta">Apenas volta</SelectItem>
                  <SelectItem value="ida-e-volta">IDA E VOLTA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Requisitos Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Requisitos Adicionais</span>
          </CardTitle>
          <CardDescription>
            Selecione os requisitos necessários para o transporte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="precisaSeguro"
              checked={formData.precisaSeguro}
              onCheckedChange={(checked) => handleInputChange('precisaSeguro', checked)}
            />
            <Label htmlFor="precisaSeguro" className="cursor-pointer">
              Precisa de seguro
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="precisaAjudante"
              checked={formData.precisaAjudante}
              onCheckedChange={(checked) => handleInputChange('precisaAjudante', checked)}
            />
            <Label htmlFor="precisaAjudante" className="cursor-pointer">
              Precisa de ajudante
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="precisaRastreador"
              checked={formData.precisaRastreador}
              onCheckedChange={(checked) => handleInputChange('precisaRastreador', checked)}
            />
            <Label htmlFor="precisaRastreador" className="cursor-pointer">
              Precisa de rastreador
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Observações</span>
          </CardTitle>
          <CardDescription>
            Adicione informações adicionais sobre o frete (opcional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Ex: Carga frágil, horário de entrega específico, etc..."
            value={formData.observacoes}
            onChange={(e) => handleInputChange('observacoes', e.target.value)}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/freight-aggregation')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-800">Solicitar Frete</h1>
            <p className="text-gray-600">Preencha os dados para solicitar um novo frete</p>
          </div>
          
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Etapa {currentStep} de 4</span>
              <span>{Math.round((currentStep / 4) * 100)}% concluído</span>
            </div>
            <Progress value={(currentStep / 4) * 100} className="h-2" />
          </div>
        </div>

        {renderCurrentStep()}

        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
          </Button>
          
          <Button
            onClick={nextStep}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            {currentStep < 4 ? (
              <>
                Próximo <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              'Finalizar Solicitação'
            )}
          </Button>
        </div>
      </div>

      <FreightLoadingAnimation open={isLoading} />
      
      <FreightSuccessDialog
        open={showSuccess}
        onOpenChange={setShowSuccess}
        generatedFreights={generatedFreights}
        onNewFreight={handleNewFreight}
        onBackToDashboard={() => navigate('/company-dashboard')}
      />
    </div>
  );
};

export default FreightCompleteForm;
