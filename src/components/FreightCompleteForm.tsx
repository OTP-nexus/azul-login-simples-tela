
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Truck,
  ArrowLeft,
  CheckCircle,
  MapPin,
  User,
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import FreightVerificationDialog from './FreightVerificationDialog';
import FreightSuccessDialog from './FreightSuccessDialog';
import ParadasManager from './ParadasManager';
import { FreightCompleteFormData, Parada } from '@/types/freightComplete';

const FreightCompleteForm = () => {
  const { toast } = useToast();
  const { user, session, isLoading: userLoading } = useAuth();

  const [companyData, setCompanyData] = useState<any>(null);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [bodyTypes, setBodyTypes] = useState<any[]>([]);
  const [priceTables, setPriceTables] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [generatedFreights, setGeneratedFreights] = useState<any[]>([]);

  const [formData, setFormData] = useState<FreightCompleteFormData>({
    collaborator_ids: [],
    origem_cidade: '',
    origem_estado: '',
    paradas: [],
    tipo_mercadoria: '',
    tipos_veiculos: [],
    tipos_carrocerias: [],
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
    peso_total: 0,
    volume_total: 0,
    valor_total: 0
  });

  useEffect(() => {
    if (!session || userLoading) return;

    const fetchCompanyData = async () => {
      setLoading(true);
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user?.id)
          .single();

        if (profileError) throw profileError;

        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profile?.company_id)
          .single();

        if (companyError) throw companyError;

        setCompanyData(company);

        const { data: collaboratorsData, error: collaboratorsError } = await supabase
          .from('collaborators')
          .select('*')
          .eq('company_id', company.id);

        if (collaboratorsError) throw collaboratorsError;
        setCollaborators(collaboratorsData || []);

        const { data: vehicleTypesData, error: vehicleTypesError } = await supabase
          .from('vehicle_types')
          .select('*');

        if (vehicleTypesError) throw vehicleTypesError;
        setVehicleTypes(vehicleTypesData || []);

        const { data: bodyTypesData, error: bodyTypesError } = await supabase
          .from('body_types')
          .select('*');

        if (bodyTypesError) throw bodyTypesError;
        setBodyTypes(bodyTypesData || []);

        const { data: priceTablesData, error: priceTablesError } = await supabase
          .from('vehicle_price_tables')
          .select('*')
          .eq('company_id', company.id);

        if (priceTablesError) throw priceTablesError;
        setPriceTables(priceTablesData || []);

      } catch (error: any) {
        console.error('Erro ao buscar dados da empresa:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Ocorreu um erro ao carregar os dados da empresa. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [session, user?.id, toast, userLoading]);

  const handleCheckboxChange = (collaboratorId: string) => {
    setFormData(prev => {
      if (prev.collaborator_ids.includes(collaboratorId)) {
        return {
          ...prev,
          collaborator_ids: prev.collaborator_ids.filter(id => id !== collaboratorId)
        };
      } else {
        return {
          ...prev,
          collaborator_ids: [...prev.collaborator_ids, collaboratorId]
        };
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVehicleTypeChange = (id: string) => {
    setFormData(prev => ({
      ...prev,
      tipos_veiculos: prev.tipos_veiculos.map(vehicle =>
        vehicle.id === id ? { ...vehicle, selected: !vehicle.selected } : vehicle
      )
    }));
  };

  const handleBodyTypeChange = (id: string) => {
    setFormData(prev => ({
      ...prev,
      tipos_carrocerias: prev.tipos_carrocerias.map(body =>
        body.id === id ? { ...body, selected: !body.selected } : body
      )
    }));
  };

  const handlePriceTableChange = (vehicleType: string, ranges: any[]) => {
    setFormData(prev => ({
      ...prev,
      vehicle_price_tables: [
        ...prev.vehicle_price_tables.filter(table => table.vehicleType !== vehicleType),
        { vehicleType, ranges }
      ]
    }));
  };

  const handleSchedulingRulesChange = (rules: string[]) => {
    setFormData(prev => ({
      ...prev,
      regras_agendamento: rules
    }));
  };

  const handleBenefitsChange = (benefits: string[]) => {
    setFormData(prev => ({
      ...prev,
      beneficios: benefits
    }));
  };

  const handleParadasChange = (paradas: Parada[]) => {
    setFormData(prev => ({
      ...prev,
      paradas,
      peso_total: paradas.reduce((sum, p) => sum + (p.pesoEspecifico || 0), 0),
      volume_total: paradas.reduce((sum, p) => sum + (p.volumeEspecifico || 0), 0)
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      // Criar um único frete com todas as paradas
      const freightData = {
        company_id: companyData?.id,
        collaborator_ids: formData.collaborator_ids,
        tipo_frete: 'completo',
        origem_cidade: formData.origem_cidade,
        origem_estado: formData.origem_estado,
        paradas: formData.paradas,
        tipo_mercadoria: formData.tipo_mercadoria,
        tipos_veiculos: formData.tipos_veiculos,
        tipos_carrocerias: formData.tipos_carrocerias,
        regras_agendamento: formData.regras_agendamento,
        beneficios: formData.beneficios,
        horario_carregamento: formData.horario_carregamento,
        precisa_ajudante: formData.precisa_ajudante,
        precisa_rastreador: formData.precisa_rastreador,
        precisa_seguro: formData.precisa_seguro,
        pedagio_pago_por: formData.pedagio_pago_por,
        pedagio_direcao: formData.pedagio_direcao,
        observacoes: formData.observacoes,
        peso_carga: formData.peso_total,
        valor_carga: formData.valor_total,
        status: 'pendente'
      };

      console.log('Criando frete completo:', freightData);

      const { data: freight, error: freightError } = await supabase
        .from('fretes')
        .insert([freightData])
        .select()
        .single();

      if (freightError) throw freightError;

      // Salvar tabelas de preço se existirem
      if (formData.vehicle_price_tables.length > 0) {
        const priceTablesData = formData.vehicle_price_tables.flatMap(table =>
          table.ranges.map((range: any) => ({
            frete_id: freight.id,
            vehicle_type: table.vehicleType,
            km_start: range.kmStart,
            km_end: range.kmEnd,
            price: range.price
          }))
        );

        const { error: priceError } = await supabase
          .from('freight_price_tables')
          .insert(priceTablesData);

        if (priceError) throw priceError;
      }

      const generatedFreight = {
        id: freight.id,
        codigo_agregamento: 'COMPLETO-' + freight.id.slice(0, 8).toUpperCase(),
        destino_cidade: formData.paradas.map(p => p.city).join(', '),
        destino_estado: formData.paradas.map(p => p.state).join(', '),
        total_paradas: formData.paradas.length
      };

      setGeneratedFreights([generatedFreight]);
      setShowVerificationDialog(false);
      setShowSuccessDialog(true);

      toast({
        title: "Frete Completo criado com sucesso!",
        description: `Rota com ${formData.paradas.length} paradas foi criada.`,
      });

    } catch (error) {
      console.error('Erro ao criar frete completo:', error);
      toast({
        title: "Erro ao criar frete",
        description: "Ocorreu um erro ao criar o frete completo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    if (!formData.collaborator_ids.length) {
      toast({
        title: "Colaboradores obrigatórios",
        description: "Selecione pelo menos um colaborador responsável.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.origem_cidade || !formData.origem_estado) {
      toast({
        title: "Origem obrigatória",
        description: "Defina a cidade e estado de origem.",
        variant: "destructive",
      });
      return false;
    }
    
    if (formData.paradas.length === 0) {
      toast({
        title: "Paradas obrigatórias",
        description: "Adicione pelo menos uma parada para o frete completo.",
        variant: "destructive",
      });
      return false;
    }

    const invalidParadas = formData.paradas.filter(p => !p.state || !p.city);
    if (invalidParadas.length > 0) {
      toast({
        title: "Paradas incompletas",
        description: "Todas as paradas devem ter estado e cidade definidos.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const onBackToDashboard = () => {
    window.location.href = '/';
  };

  const onNewFreight = () => {
    window.location.reload();
  };

  const onEdit = () => {
    setShowVerificationDialog(false);
  };

  // Estados e cidades estáticos para evitar erro do IBGE
  const states = [
    { sigla: 'SP', nome: 'São Paulo' },
    { sigla: 'RJ', nome: 'Rio de Janeiro' },
    { sigla: 'MG', nome: 'Minas Gerais' },
    { sigla: 'RS', nome: 'Rio Grande do Sul' },
    { sigla: 'PR', nome: 'Paraná' },
    { sigla: 'SC', nome: 'Santa Catarina' },
    { sigla: 'GO', nome: 'Goiás' },
    { sigla: 'MT', nome: 'Mato Grosso' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
      <FreightVerificationDialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
        formData={formData}
        collaborators={collaborators}
        onEdit={onEdit}
        onConfirm={handleSubmit}
        loading={isSubmitting}
      />

      <FreightSuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        generatedFreights={generatedFreights}
        onNewFreight={onNewFreight}
        onBackToDashboard={onBackToDashboard}
      />

      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                    Frete Completo
                  </CardTitle>
                  <p className="text-green-600 font-medium">Rota completa com múltiplas paradas</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Colaboradores */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Colaboradores Responsáveis</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {collaborators.map((collaborator) => (
                    <div key={collaborator.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`collaborator-${collaborator.id}`}
                        checked={formData.collaborator_ids.includes(collaborator.id)}
                        onCheckedChange={() => handleCheckboxChange(collaborator.id)}
                      />
                      <Label htmlFor={`collaborator-${collaborator.id}`} className="font-medium text-gray-700">
                        {collaborator.name} - {collaborator.sector}
                      </Label>
                    </div>
                  ))}
                </div>
                <Separator />
              </div>

              {/* Origem section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Origem da Carga</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="origem_cidade">Cidade de Origem</Label>
                    <Input
                      type="text"
                      id="origem_cidade"
                      name="origem_cidade"
                      value={formData.origem_cidade}
                      onChange={handleInputChange}
                      placeholder="Ex: São Paulo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="origem_estado">Estado de Origem</Label>
                    <Select onValueChange={(value) => handleSelectChange('origem_estado', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map(state => (
                          <SelectItem key={state.sigla} value={state.sigla}>
                            {state.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Separator />
              </div>

              {/* Paradas section */}
              <ParadasManager 
                paradas={formData.paradas}
                onParadasChange={handleParadasChange}
              />

              {/* Resumo da Rota */}
              {formData.paradas.length > 0 && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Resumo da Rota</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{formData.paradas.length}</div>
                        <div className="text-green-700">Paradas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {formData.peso_total?.toFixed(1) || '0'}
                        </div>
                        <div className="text-green-700">kg Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {formData.volume_total?.toFixed(1) || '0'}
                        </div>
                        <div className="text-green-700">m³ Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {formData.paradas.reduce((sum, p) => sum + (p.tempoPermanencia || 0), 0)}
                        </div>
                        <div className="text-green-700">min Total</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Carga */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações da Carga</h3>
                <div>
                  <Label htmlFor="tipo_mercadoria">Tipo de Mercadoria</Label>
                  <Input
                    type="text"
                    id="tipo_mercadoria"
                    name="tipo_mercadoria"
                    value={formData.tipo_mercadoria}
                    onChange={handleInputChange}
                    placeholder="Ex: Grãos, eletrônicos, etc."
                  />
                </div>
                <Separator />
              </div>

              {/* Veículos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tipos de Veículos</h3>
                <div className="flex flex-wrap gap-2">
                  {vehicleTypes.map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`vehicle-${vehicle.id}`}
                        checked={formData.tipos_veiculos.find(v => v.id === vehicle.id)?.selected || false}
                        onCheckedChange={() => handleVehicleTypeChange(vehicle.id)}
                      />
                      <Label htmlFor={`vehicle-${vehicle.id}`} className="font-medium text-gray-700">
                        {vehicle.type}
                      </Label>
                    </div>
                  ))}
                </div>
                <Separator />
              </div>

              {/* Carrocerias */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tipos de Carrocerias</h3>
                <div className="flex flex-wrap gap-2">
                  {bodyTypes.map((body) => (
                    <div key={body.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`body-${body.id}`}
                        checked={formData.tipos_carrocerias.find(b => b.id === body.id)?.selected || false}
                        onCheckedChange={() => handleBodyTypeChange(body.id)}
                      />
                      <Label htmlFor={`body-${body.id}`} className="font-medium text-gray-700">
                        {body.type}
                      </Label>
                    </div>
                  ))}
                </div>
                <Separator />
              </div>

              {/* Configurações */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Configurações Adicionais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="horario_carregamento">Horário de Carregamento</Label>
                    <Input
                      type="time"
                      id="horario_carregamento"
                      name="horario_carregamento"
                      value={formData.horario_carregamento}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label>Requisitos Adicionais</Label>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="precisa_ajudante"
                          checked={formData.precisa_ajudante}
                          onCheckedChange={() => setFormData(prev => ({ ...prev, precisa_ajudante: !prev.precisa_ajudante }))}
                        />
                        <Label htmlFor="precisa_ajudante">Ajudante</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="precisa_rastreador"
                          checked={formData.precisa_rastreador}
                          onCheckedChange={() => setFormData(prev => ({ ...prev, precisa_rastreador: !prev.precisa_rastreador }))}
                        />
                        <Label htmlFor="precisa_rastreador">Rastreador</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="precisa_seguro"
                          checked={formData.precisa_seguro}
                          onCheckedChange={() => setFormData(prev => ({ ...prev, precisa_seguro: !prev.precisa_seguro }))}
                        />
                        <Label htmlFor="precisa_seguro">Seguro</Label>
                      </div>
                    </div>
                  </div>
                </div>
                <Separator />
              </div>

              {/* Pedágio */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações sobre Pedágio</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pedagio_pago_por">Pedágio Pago Por</Label>
                    <Select onValueChange={(value) => handleSelectChange('pedagio_pago_por', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="embarcador">Embarcador</SelectItem>
                        <SelectItem value="transportador">Transportador</SelectItem>
                        <SelectItem value="negociar">A Negociar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pedagio_direcao">Direção do Pedágio</Label>
                    <Select onValueChange={(value) => handleSelectChange('pedagio_direcao', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ida">Ida</SelectItem>
                        <SelectItem value="volta">Volta</SelectItem>
                        <SelectItem value="ambos">Ambos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Separator />
              </div>

              {/* Observações */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Observações Adicionais</h3>
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleInputChange}
                    placeholder="Observações adicionais sobre o frete..."
                  />
                </div>
                <Separator />
              </div>

              {/* Botões de ação */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </Button>

                <Button
                  type="button"
                  onClick={() => setShowVerificationDialog(true)}
                  disabled={loading || !formData.paradas.length}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Revisar Frete Completo</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FreightCompleteForm;
