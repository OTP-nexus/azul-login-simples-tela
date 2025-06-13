import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, MapPin, Truck, Package, Calendar, Clock, Weight, DollarSign, Settings, Plus, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIBGE } from "@/hooks/useIBGE";
import FreightVerificationDialog from './FreightVerificationDialog';
import FreightSuccessDialog from './FreightSuccessDialog';
import FreightLoadingAnimation from './FreightLoadingAnimation';

interface FreightFormData {
  origem: { estado: string; cidade: string };
  paradas: { estado: string; cidade: string }[];
  dataColeta: string;
  horarioColeta: string;
  peso: string;
  tipoValor: string;
  valorOfertado: string;
  tiposVeiculos: { id: string; type: string; category: string; selected: boolean }[];
  tiposCarrocerias: { id: string; type: string; category: string; selected: boolean }[];
  precisaAjudante: boolean;
  precisaRastreador: boolean;
  precisaSeguro: boolean;
  pedagioPagoPor: string;
  pedagioDirecao: string;
  observacoes: string;
}

interface Freight {
  id: string;
  codigo_agregamento: string;
  destino_cidade: string;
  destino_estado: string;
}

const validateFormData = (formData: FreightFormData): string | null => {
  if (!formData.origem.estado || !formData.origem.cidade) {
    return "Origem deve ser preenchida.";
  }
  if (formData.paradas.length === 0) {
    return "Pelo menos uma parada deve ser adicionada.";
  }
  if (!formData.dataColeta) {
    return "Data de coleta deve ser preenchida.";
  }
  if (!formData.horarioColeta) {
    return "Horário de coleta deve ser preenchido.";
  }
  if (!formData.peso) {
    return "Peso deve ser preenchido.";
  }
  if (!formData.tipoValor) {
    return "Tipo de valor deve ser selecionado.";
  }
  if (formData.tipoValor === 'valor' && !formData.valorOfertado) {
    return "Valor ofertado deve ser preenchido.";
  }
  if (formData.tiposVeiculos.filter(v => v.selected).length === 0) {
    return "Pelo menos um tipo de veículo deve ser selecionado.";
  }
  return null;
};

const FreightCompleteForm = () => {
  const { user } = useAuth();
  const { estados } = useIBGE();
  const { toast } = useToast();

  const [company, setCompany] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FreightFormData>({
    origem: { estado: '', cidade: '' },
    paradas: [],
    dataColeta: '',
    horarioColeta: '',
    peso: '',
    tipoValor: '',
    valorOfertado: '',
    tiposVeiculos: [
      { id: 'truck', type: 'Caminhão', category: 'heavy', selected: false },
      { id: 'van', type: 'Van', category: 'medium', selected: false },
      { id: 'car', type: 'Carro', category: 'light', selected: false },
    ],
    tiposCarrocerias: [
      { id: 'open', type: 'Aberta', category: 'open', selected: false },
      { id: 'closed', type: 'Fechada', category: 'closed', selected: false },
      { id: 'refrigerated', type: 'Refrigerada', category: 'special', selected: false },
    ],
    precisaAjudante: false,
    precisaRastreador: false,
    precisaSeguro: false,
    pedagioPagoPor: '',
    pedagioDirecao: '',
    observacoes: '',
  });

  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedFreights, setGeneratedFreights] = useState<Freight[]>([]);

  useEffect(() => {
    const fetchCompany = async () => {
      if (user) {
        const { data: companyData, error } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error("Erro ao buscar dados da empresa:", error);
          toast({
            title: "Erro",
            description: "Erro ao buscar dados da empresa.",
            variant: "destructive"
          });
        } else {
          setCompany(companyData);
        }
      }
    };

    fetchCompany();
  }, [user, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: checked
    }));
  };

  const handleVehicleTypeChange = (id: string) => {
    setFormData(prevData => ({
      ...prevData,
      tiposVeiculos: prevData.tiposVeiculos.map(vehicle =>
        vehicle.id === id ? { ...vehicle, selected: !vehicle.selected } : vehicle
      )
    }));
  };

  const handleBodyTypeChange = (id: string) => {
    setFormData(prevData => ({
      ...prevData,
      tiposCarrocerias: prevData.tiposCarrocerias.map(body =>
        body.id === id ? { ...body, selected: !body.selected } : body
      )
    }));
  };

  const addParada = () => {
    setFormData(prevData => ({
      ...prevData,
      paradas: [...prevData.paradas, { estado: '', cidade: '' }]
    }));
  };

  const removeParada = (index: number) => {
    setFormData(prevData => ({
      ...prevData,
      paradas: prevData.paradas.filter((_, i) => i !== index)
    }));
  };

  const handleParadaChange = (index: number, field: string, value: string) => {
    setFormData(prevData => ({
      ...prevData,
      paradas: prevData.paradas.map((parada, i) =>
        i === index ? { ...parada, [field]: value } : parada
      )
    }));
  };

  const nextStep = () => {
    setCurrentStep(prevStep => prevStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(prevStep => prevStep - 1);
  };

  const showVerification = () => {
    const validationError = validateFormData(formData);
    if (validationError) {
      toast({
        title: "Erro de Validação",
        description: validationError,
        variant: "destructive"
      });
      return;
    }
    setShowVerificationDialog(true);
  };

  const editFreight = () => {
    setShowVerificationDialog(false);
  };

  const handleSubmit = async () => {
    console.log('Iniciando salvamento no Supabase...');
    setIsSubmitting(true);

    try {
      if (!user || !company) {
        throw new Error('Usuário ou empresa não encontrado');
      }

      console.log('Dados do formulário:', formData);

      // Preparar destinos
      const destinos = formData.paradas.map(parada => ({
        id: Date.now().toString() + Math.random(),
        state: parada.estado,
        city: parada.cidade
      }));

      // Preparar valores definidos
      const valoresDefinidos = formData.tipoValor === 'valor' ? {
        tipo: 'valor_fixo',
        valor: formData.valorOfertado ? parseFloat(formData.valorOfertado) : 0
      } : {
        tipo: 'a_combinar'
      };

      // Preparar paradas com ordem
      const paradasOrdenadas = formData.paradas.map((parada, index) => ({
        estado: parada.estado,
        cidade: parada.cidade,
        ordem: index + 1
      }));

      console.log('Preparando dados para o Supabase...');
      const freightData = {
        company_id: company.id,
        tipo_frete: 'frete_completo',
        origem_estado: formData.origem.estado,
        origem_cidade: formData.origem.cidade,
        destinos: destinos,
        tipo_mercadoria: 'Geral',
        paradas: paradasOrdenadas,
        data_coleta: formData.dataColeta || null,
        horario_carregamento: formData.horarioColeta || null,
        peso_carga: formData.peso ? parseFloat(formData.peso.replace(/\./g, '').replace(',', '.')) : null,
        tipos_veiculos: formData.tiposVeiculos || [],
        tipos_carrocerias: formData.tiposCarrocerias || [],
        valores_definidos: valoresDefinidos,
        precisa_ajudante: formData.precisaAjudante || false,
        precisa_rastreador: formData.precisaRastreador || false,
        precisa_seguro: formData.precisaSeguro || false,
        pedagio_pago_por: formData.pedagioPagoPor || null,
        pedagio_direcao: formData.pedagioDirecao || null,
        observacoes: formData.observacoes || null,
        collaborator_ids: [],
        status: 'pendente'
      };

      console.log('Dados preparados para inserção:', freightData);

      const { data, error } = await supabase
        .from('fretes')
        .insert([freightData])
        .select()
        .single();

      if (error) {
        console.error('Erro detalhado do Supabase:', error);
        throw error;
      }

      console.log('Frete salvo com sucesso:', data);

      // Criar lista de fretes gerados para o dialog de sucesso
      const generatedFreightsList = formData.paradas.map((parada, index) => ({
        id: data.id,
        codigo_agregamento: data.codigo_agregamento || `FRT-${Date.now()}-${index}`,
        destino_cidade: parada.cidade,
        destino_estado: parada.estado
      }));

      setGeneratedFreights(generatedFreightsList);
      setIsSubmitting(false);
      setShowVerificationDialog(false);
      setShowSuccessDialog(true);

      toast({
        title: "Sucesso!",
        description: "Frete completo criado com sucesso.",
      });

    } catch (error) {
      console.error('Erro ao criar frete:', error);
      setIsSubmitting(false);
      setShowVerificationDialog(false);
      
      let errorMessage = "Erro ao criar frete. Tente novamente.";
      if (error.message.includes('check constraint')) {
        errorMessage = "Erro na validação dos dados. Verifique se todos os campos estão preenchidos corretamente.";
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CardContent className="grid gap-4">
            <CardTitle>Origem e Destino</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="origemEstado">Estado de Origem</Label>
                <Select onValueChange={(value) => handleSelectChange('origem.estado', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o estado" defaultValue={formData.origem.estado} />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map((estado) => (
                      <SelectItem key={estado.id} value={estado.sigla}>{estado.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="origemCidade">Cidade de Origem</Label>
                <Input
                  type="text"
                  id="origemCidade"
                  name="origem.cidade"
                  value={formData.origem.cidade}
                  onChange={(e) => {
                    const { value } = e.target;
                    setFormData(prevData => ({
                      ...prevData,
                      origem: { ...prevData.origem, cidade: value }
                    }));
                  }}
                />
              </div>
            </div>
            <CardTitle>Paradas</CardTitle>
            {formData.paradas.map((parada, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <Label htmlFor={`paradaEstado-${index}`}>Estado da Parada {index + 1}</Label>
                  <Select onValueChange={(value) => handleParadaChange(index, 'estado', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o estado" defaultValue={parada.estado} />
                    </SelectTrigger>
                    <SelectContent>
                      {estados.map((estado) => (
                        <SelectItem key={estado.id} value={estado.sigla}>{estado.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`paradaCidade-${index}`}>Cidade da Parada {index + 1}</Label>
                  <Input
                    type="text"
                    id={`paradaCidade-${index}`}
                    value={parada.cidade}
                    onChange={(e) => handleParadaChange(index, 'cidade', e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon" onClick={() => removeParada(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="secondary" onClick={addParada}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Parada
            </Button>
          </CardContent>
        );
      case 2:
        return (
          <CardContent className="grid gap-4">
            <CardTitle>Informações da Coleta</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dataColeta">Data da Coleta</Label>
                <Input
                  type="date"
                  id="dataColeta"
                  name="dataColeta"
                  value={formData.dataColeta}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="horarioColeta">Horário da Coleta</Label>
                <Input
                  type="time"
                  id="horarioColeta"
                  name="horarioColeta"
                  value={formData.horarioColeta}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="peso">Peso da Carga (em toneladas)</Label>
              <Input
                type="text"
                id="peso"
                name="peso"
                value={formData.peso}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
        );
      case 3:
        return (
          <CardContent className="grid gap-4">
            <CardTitle>Definição de Valor</CardTitle>
            <RadioGroup defaultValue={formData.tipoValor} onValueChange={(value) => handleSelectChange('tipoValor', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="valor" id="valor" />
                <Label htmlFor="valor">Definir Valor</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="combinar" id="combinar" />
                <Label htmlFor="combinar">A Combinar</Label>
              </div>
            </RadioGroup>
            {formData.tipoValor === 'valor' && (
              <div>
                <Label htmlFor="valorOfertado">Valor Ofertado</Label>
                <Input
                  type="text"
                  id="valorOfertado"
                  name="valorOfertado"
                  value={formData.valorOfertado}
                  onChange={handleInputChange}
                />
              </div>
            )}
          </CardContent>
        );
      case 4:
        return (
          <CardContent className="grid gap-4">
            <CardTitle>Tipos de Veículos</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {formData.tiposVeiculos.map(vehicle => (
                <div key={vehicle.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={vehicle.id}
                    checked={vehicle.selected}
                    onCheckedChange={() => handleVehicleTypeChange(vehicle.id)}
                  />
                  <Label htmlFor={vehicle.id}>{vehicle.type}</Label>
                </div>
              ))}
            </div>
            <CardTitle>Tipos de Carrocerias</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {formData.tiposCarrocerias.map(body => (
                <div key={body.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={body.id}
                    checked={body.selected}
                    onCheckedChange={() => handleBodyTypeChange(body.id)}
                  />
                  <Label htmlFor={body.id}>{body.type}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        );
      case 5:
        return (
          <CardContent className="grid gap-4">
            <CardTitle>Requisitos Adicionais</CardTitle>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="precisaAjudante"
                name="precisaAjudante"
                checked={formData.precisaAjudante}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="precisaAjudante">Precisa de Ajudante</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="precisaRastreador"
                name="precisaRastreador"
                checked={formData.precisaRastreador}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="precisaRastreador">Precisa de Rastreador</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="precisaSeguro"
                name="precisaSeguro"
                checked={formData.precisaSeguro}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="precisaSeguro">Precisa de Seguro</Label>
            </div>
            <div>
              <Label htmlFor="pedagioPagoPor">Pedágio Pago Por</Label>
              <Input
                type="text"
                id="pedagioPagoPor"
                name="pedagioPagoPor"
                value={formData.pedagioPagoPor}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="pedagioDirecao">Pedágio Direção</Label>
              <Input
                type="text"
                id="pedagioDirecao"
                name="pedagioDirecao"
                value={formData.pedagioDirecao}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
        );
      default:
        return <div>Passo inválido</div>;
    }
  };

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Cadastro de Frete Completo</CardTitle>
        </CardHeader>
        {renderStep()}
        <CardContent className="flex justify-between">
          {currentStep > 1 && (
            <Button variant="outline" onClick={prevStep}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
          )}
          {currentStep < 5 ? (
            <Button onClick={nextStep}>
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={showVerification}>
              Verificar Dados
              <Settings className="h-4 w-4 ml-2" />
            </Button>
          )}
        </CardContent>
      </Card>

      <FreightVerificationDialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
        formData={formData}
        collaborators={[]}
        onEdit={editFreight}
        onConfirm={handleSubmit}
        loading={isSubmitting}
      />

      <FreightSuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        freights={generatedFreights}
      />

      {isSubmitting && <FreightLoadingAnimation />}
    </div>
  );
};

export default FreightCompleteForm;
