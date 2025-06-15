import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useEstados } from '@/hooks/useIBGE';
import { ChevronLeft, ChevronRight, Package, MapPin, Clock, User, Home, Check } from 'lucide-react';
import FreightConfirmationDialog from './FreightConfirmationDialog';
import FreightLoadingAnimation from './FreightLoadingAnimation';
import FreightSuccessDialog from './FreightSuccessDialog';
import { formatNameInput, formatPhoneInput, isValidPhone } from '@/utils/formatters';

interface ItemDetalhado {
  id: string;
  nome: string;
  quantidade: number;
}

interface Cidade {
  id: number;
  nome: string;
}

interface GeneratedFreight {
  id: string;
  codigo_agregamento: string;
  destino_cidade: string;
  destino_estado: string;
}

const PublicFreightRequestForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [generatedFreights, setGeneratedFreights] = useState<GeneratedFreight[]>([]);
  const { toast } = useToast();

  // Estados e cidades
  const { estados } = useEstados();
  const [cidadesOrigem, setCidadesOrigem] = useState<Cidade[]>([]);
  const [cidadesDestino, setCidadesDestino] = useState<Cidade[]>([]);
  const [loadingCidadesOrigem, setLoadingCidadesOrigem] = useState(false);
  const [loadingCidadesDestino, setLoadingCidadesDestino] = useState(false);

  // Estados do formulário
  const [formData, setFormData] = useState({
    // Origem
    origemEstado: '',
    origemCidade: '',
    origemTipoEndereco: '',
    origemPossuiCargaDescarga: false,
    origemPossuiEscada: false,
    origemPossuiElevador: false,
    origemPossuiDoca: false,

    // Destino
    destinoEstado: '',
    destinoCidade: '',
    destinoTipoEndereco: '',
    destinoPossuiCargaDescarga: false,
    destinoPossuiEscada: false,
    destinoPossuiElevador: false,
    destinoPossuiDoca: false,

    // Data e horário
    dataCarregamento: '',
    horarioCarregamento: '',

    // Itens
    tipoListagemItens: 'detalhada', // 'detalhada' ou 'livre'
    itensDetalhados: [] as ItemDetalhado[],
    descricaoLivreItens: '',

    // Necessidades adicionais
    precisaAjudante: false,
    precisaMontarDesmontar: false,
    localPossuiRestricao: false,
    descricaoRestricao: '',
    precisaEmbalagem: false,

    // Dados do solicitante
    solicitanteNome: '',
    solicitanteTelefone: '',
    solicitanteConfirmarTelefone: ''
  });

  const resetForm = () => {
    setFormData({
      origemEstado: '',
      origemCidade: '',
      origemTipoEndereco: '',
      origemPossuiCargaDescarga: false,
      origemPossuiEscada: false,
      origemPossuiElevador: false,
      origemPossuiDoca: false,
      destinoEstado: '',
      destinoCidade: '',
      destinoTipoEndereco: '',
      destinoPossuiCargaDescarga: false,
      destinoPossuiEscada: false,
      destinoPossuiElevador: false,
      destinoPossuiDoca: false,
      dataCarregamento: '',
      horarioCarregamento: '',
      tipoListagemItens: 'detalhada',
      itensDetalhados: [],
      descricaoLivreItens: '',
      precisaAjudante: false,
      precisaMontarDesmontar: false,
      localPossuiRestricao: false,
      descricaoRestricao: '',
      precisaEmbalagem: false,
      solicitanteNome: '',
      solicitanteTelefone: '',
      solicitanteConfirmarTelefone: ''
    });
    setCurrentStep(1);
  };

  const handleNewFreight = () => {
    setShowSuccessDialog(false);
    resetForm();
  };

  const handleBackToDashboard = () => {
    window.location.href = '/';
  };

  // Função para carregar cidades
  const loadCidades = async (uf: string, tipo: 'origem' | 'destino') => {
    if (!uf) {
      if (tipo === 'origem') {
        setCidadesOrigem([]);
      } else {
        setCidadesDestino([]);
      }
      return;
    }

    try {
      if (tipo === 'origem') {
        setLoadingCidadesOrigem(true);
      } else {
        setLoadingCidadesDestino(true);
      }

      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`);
      
      if (response.ok) {
        const data = await response.json();
        if (tipo === 'origem') {
          setCidadesOrigem(data);
        } else {
          setCidadesDestino(data);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
      toast({
        title: "Erro ao carregar cidades",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      if (tipo === 'origem') {
        setLoadingCidadesOrigem(false);
      } else {
        setLoadingCidadesDestino(false);
      }
    }
  };

  // Handlers para mudança de estado
  const handleEstadoOrigemChange = (value: string) => {
    setFormData(prev => ({ ...prev, origemEstado: value, origemCidade: '' }));
    loadCidades(value, 'origem');
  };

  const handleEstadoDestinoChange = (value: string) => {
    setFormData(prev => ({ ...prev, destinoEstado: value, destinoCidade: '' }));
    loadCidades(value, 'destino');
  };

  const addItem = () => {
    const newItem: ItemDetalhado = {
      id: Date.now().toString(),
      nome: '',
      quantidade: 1
    };
    setFormData(prev => ({
      ...prev,
      itensDetalhados: [newItem, ...prev.itensDetalhados] // Adiciona no início do array
    }));
  };

  const removeItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      itensDetalhados: prev.itensDetalhados.filter(item => item.id !== id)
    }));
  };

  const updateItem = (id: string, field: 'nome' | 'quantidade', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      itensDetalhados: prev.itensDetalhados.map(item => {
        if (item.id === id) {
          if (field === 'nome' && typeof value === 'string') {
            return { ...item, [field]: formatNameInput(value) };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    }));
  };

  // Handler para formatação do nome do solicitante
  const handleNomeChange = (value: string) => {
    setFormData(prev => ({ ...prev, solicitanteNome: formatNameInput(value) }));
  };

  // Adicionar useEffect para validação imediata dos telefones
  useEffect(() => {
    if (formData.solicitanteTelefone && formData.solicitanteConfirmarTelefone) {
      if (formData.solicitanteTelefone !== formData.solicitanteConfirmarTelefone) {
        console.log('❌ VALIDAÇÃO: Os telefones não são iguais!');
        console.log('Telefone 1:', formData.solicitanteTelefone);
        console.log('Telefone 2:', formData.solicitanteConfirmarTelefone);
      } else {
        console.log('✅ VALIDAÇÃO: Os telefones são iguais!');
        console.log('Telefone confirmado:', formData.solicitanteTelefone);
      }
    }
  }, [formData.solicitanteTelefone, formData.solicitanteConfirmarTelefone]);

  // Handler para formatação do telefone com validação imediata
  const handleTelefoneChange = (field: 'solicitanteTelefone' | 'solicitanteConfirmarTelefone', value: string) => {
    const formattedValue = formatPhoneInput(value);
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Log imediato da mudança
    console.log(`📱 TELEFONE ALTERADO (${field}):`, formattedValue);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.origemEstado || !formData.origemCidade || !formData.origemTipoEndereco ||
            !formData.destinoEstado || !formData.destinoCidade || !formData.destinoTipoEndereco ||
            !formData.dataCarregamento || !formData.horarioCarregamento) {
          toast({
            title: "Campos obrigatórios",
            description: "Preencha todos os campos da Etapa 1",
            variant: "destructive"
          });
          return false;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const [year, month, day] = formData.dataCarregamento.split('-').map(Number);
        const selectedDate = new Date(year, month - 1, day);

        if (selectedDate < today) {
          toast({
            title: "Data inválida",
            description: "A data da coleta não pode ser no passado.",
            variant: "destructive"
          });
          return false;
        }
        break;
      case 2:
        if (formData.tipoListagemItens === 'detalhada') {
          if (formData.itensDetalhados.length === 0 || 
              formData.itensDetalhados.some(item => !item.nome || item.quantidade <= 0)) {
            toast({
              title: "Itens obrigatórios",
              description: "Adicione pelo menos um item com nome e quantidade válida",
              variant: "destructive"
            });
            return false;
          }
        } else {
          if (!formData.descricaoLivreItens.trim()) {
            toast({
              title: "Descrição obrigatória",
              description: "Informe a descrição dos itens",
              variant: "destructive"
            });
            return false;
          }
        }
        break;
      case 4:
        if (!formData.solicitanteNome || !formData.solicitanteTelefone || !formData.solicitanteConfirmarTelefone) {
          toast({
            title: "Dados do solicitante",
            description: "Preencha todos os dados do solicitante",
            variant: "destructive"
          });
          return false;
        }
        if (!isValidPhone(formData.solicitanteTelefone)) {
          toast({
            title: "Telefone inválido",
            description: "Informe um telefone válido com pelo menos 10 dígitos",
            variant: "destructive"
          });
          return false;
        }
        if (formData.solicitanteTelefone !== formData.solicitanteConfirmarTelefone) {
          toast({
            title: "Telefones não conferem",
            description: "Os telefones informados devem ser iguais",
            variant: "destructive"
          });
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    console.log('🚀 INICIANDO SUBMIT DO FRETE');
    console.log('📋 Dados do formulário:', formData);
    
    if (!validateStep(4)) {
      console.log('❌ Validação falhou');
      return;
    }

    setShowConfirmDialog(false);
    setShowLoadingAnimation(true);
    setIsSubmitting(true);

    try {
      console.log('💾 Preparando dados para o banco...');
      
      const freightData = {
        tipo_frete: 'comum',
        tipo_solicitacao: 'pessoa_comum',
        origem_estado: formData.origemEstado,
        origem_cidade: formData.origemCidade,
        origem_tipo_endereco: formData.origemTipoEndereco,
        origem_possui_carga_descarga: formData.origemPossuiCargaDescarga,
        origem_possui_escada: formData.origemPossuiEscada,
        origem_possui_elevador: formData.origemPossuiElevador,
        origem_possui_doca: formData.origemPossuiDoca,
        destino_estado: formData.destinoEstado,
        destino_cidade: formData.destinoCidade,
        destino_tipo_endereco: formData.destinoTipoEndereco,
        destino_possui_carga_descarga: formData.destinoPossuiCargaDescarga,
        destino_possui_escada: formData.destinoPossuiEscada,
        destino_possui_elevador: formData.destinoPossuiElevador,
        destino_possui_doca: formData.destinoPossuiDoca,
        data_coleta: formData.dataCarregamento,
        horario_carregamento: formData.horarioCarregamento,
        tipo_listagem_itens: formData.tipoListagemItens,
        itens_detalhados: formData.tipoListagemItens === 'detalhada' ? JSON.parse(JSON.stringify(formData.itensDetalhados)) : null,
        descricao_livre_itens: formData.tipoListagemItens === 'livre' ? formData.descricaoLivreItens : null,
        precisa_ajudante: formData.precisaAjudante,
        precisa_montar_desmontar: formData.precisaMontarDesmontar,
        local_possui_restricao: formData.localPossuiRestricao,
        descricao_restricao: formData.localPossuiRestricao ? formData.descricaoRestricao : null,
        precisa_embalagem: formData.precisaEmbalagem,
        solicitante_nome: formData.solicitanteNome,
        solicitante_telefone: formData.solicitanteTelefone,
        solicitante_confirmar_telefone: formData.solicitanteConfirmarTelefone,
        tipo_mercadoria: 'diversos',
        status: 'pendente'
      };

      console.log('📤 Dados que serão enviados:', freightData);

      const { data, error } = await supabase
        .from('fretes')
        .insert(freightData)
        .select();

      if (error) {
        console.error('💥 Erro ao salvar frete:', error);
        toast({
          title: "Erro ao solicitar frete",
          description: "Tente novamente mais tarde",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Frete salvo com sucesso:', data);

      if (data) {
        setGeneratedFreights(data as GeneratedFreight[]);
      }
      setShowSuccessDialog(true);

    } catch (error) {
      console.error('💥 Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setShowLoadingAnimation(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Onde buscar e entregar?</h2>
              <p className="text-gray-600 text-lg">Informe os locais de origem e destino da sua carga</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {/* Origem */}
              <Card className="border-2 border-gray-100 hover:border-blue-200 transition-colors">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Local de Origem
                  </CardTitle>
                  <CardDescription>De onde vamos buscar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Estado *</Label>
                      <Select value={formData.origemEstado} onValueChange={handleEstadoOrigemChange}>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Escolha o estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {estados.map(state => (
                            <SelectItem key={state.sigla} value={state.sigla} className="text-base">
                              {state.sigla} - {state.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-base font-medium">Cidade *</Label>
                      <Select 
                        value={formData.origemCidade} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, origemCidade: value }))}
                        disabled={!formData.origemEstado || loadingCidadesOrigem}
                      >
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue 
                            placeholder={
                              !formData.origemEstado 
                                ? "Primeiro escolha o estado" 
                                : loadingCidadesOrigem 
                                ? "Carregando cidades..." 
                                : "Escolha a cidade"
                            } 
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {cidadesOrigem.map(city => (
                            <SelectItem key={city.nome} value={city.nome} className="text-base">
                              {city.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-base font-medium mb-3 block">Tipo de local *</Label>
                      <RadioGroup value={formData.origemTipoEndereco} onValueChange={(value) => setFormData(prev => ({ ...prev, origemTipoEndereco: value }))}>
                        <div className="grid grid-cols-1 gap-3">
                          <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <RadioGroupItem value="residencial" id="origem-residencial" />
                            <Home className="w-5 h-5 text-gray-600" />
                            <span className="text-base">Casa/Apartamento</span>
                          </label>
                          <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <RadioGroupItem value="comercial" id="origem-comercial" />
                            <Package className="w-5 h-5 text-gray-600" />
                            <span className="text-base">Loja/Escritório</span>
                          </label>
                          <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <RadioGroupItem value="industrial" id="origem-industrial" />
                            <MapPin className="w-5 h-5 text-gray-600" />
                            <span className="text-base">Indústria/Galpão</span>
                          </label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-medium">Características do local</Label>
                      <div className="space-y-3">
                        {[
                          { id: 'origem-carga-descarga', label: 'Tem espaço para carga e descarga', checked: formData.origemPossuiCargaDescarga, field: 'origemPossuiCargaDescarga' },
                          { id: 'origem-escada', label: 'Tem escada', checked: formData.origemPossuiEscada, field: 'origemPossuiEscada' },
                          { id: 'origem-elevador', label: 'Tem elevador', checked: formData.origemPossuiElevador, field: 'origemPossuiElevador' },
                          { id: 'origem-doca', label: 'Tem doca de carga', checked: formData.origemPossuiDoca, field: 'origemPossuiDoca' }
                        ].map((item) => (
                          <label key={item.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <Checkbox 
                              id={item.id}
                              checked={item.checked}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, [item.field]: !!checked }))}
                            />
                            <span className="text-base">{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Destino */}
              <Card className="border-2 border-gray-100 hover:border-blue-200 transition-colors">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Local de Destino
                  </CardTitle>
                  <CardDescription>Para onde vamos levar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Estado *</Label>
                      <Select value={formData.destinoEstado} onValueChange={handleEstadoDestinoChange}>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Escolha o estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {estados.map(state => (
                            <SelectItem key={state.sigla} value={state.sigla} className="text-base">
                              {state.sigla} - {state.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-base font-medium">Cidade *</Label>
                      <Select 
                        value={formData.destinoCidade} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, destinoCidade: value }))}
                        disabled={!formData.destinoEstado || loadingCidadesDestino}
                      >
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue 
                            placeholder={
                              !formData.destinoEstado 
                                ? "Primeiro escolha o estado" 
                                : loadingCidadesDestino 
                                ? "Carregando cidades..." 
                                : "Escolha a cidade"
                            } 
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {cidadesDestino.map(city => (
                            <SelectItem key={city.nome} value={city.nome} className="text-base">
                              {city.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-base font-medium mb-3 block">Tipo de local *</Label>
                      <RadioGroup value={formData.destinoTipoEndereco} onValueChange={(value) => setFormData(prev => ({ ...prev, destinoTipoEndereco: value }))}>
                        <div className="grid grid-cols-1 gap-3">
                          <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <RadioGroupItem value="residencial" id="destino-residencial" />
                            <Home className="w-5 h-5 text-gray-600" />
                            <span className="text-base">Casa/Apartamento</span>
                          </label>
                          <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <RadioGroupItem value="comercial" id="destino-comercial" />
                            <Package className="w-5 h-5 text-gray-600" />
                            <span className="text-base">Loja/Escritório</span>
                          </label>
                          <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <RadioGroupItem value="industrial" id="destino-industrial" />
                            <MapPin className="w-5 h-5 text-gray-600" />
                            <span className="text-base">Indústria/Galpão</span>
                          </label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-medium">Características do local</Label>
                      <div className="space-y-3">
                        {[
                          { id: 'destino-carga-descarga', label: 'Tem espaço para carga e descarga', checked: formData.destinoPossuiCargaDescarga, field: 'destinoPossuiCargaDescarga' },
                          { id: 'destino-escada', label: 'Tem escada', checked: formData.destinoPossuiEscada, field: 'destinoPossuiEscada' },
                          { id: 'destino-elevador', label: 'Tem elevador', checked: formData.destinoPossuiElevador, field: 'destinoPossuiElevador' },
                          { id: 'destino-doca', label: 'Tem doca de carga', checked: formData.destinoPossuiDoca, field: 'destinoPossuiDoca' }
                        ].map((item) => (
                          <label key={item.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <Checkbox 
                              id={item.id}
                              checked={item.checked}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, [item.field]: !!checked }))}
                            />
                            <span className="text-base">{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data e Horário */}
            <Card className="border-2 border-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Quando precisamos buscar?
                </CardTitle>
                <CardDescription>Data e horário da coleta</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-base font-medium">Data da coleta *</Label>
                    <Input
                      type="date"
                      value={formData.dataCarregamento}
                      onChange={(e) => setFormData(prev => ({ ...prev, dataCarregamento: e.target.value }))}
                      className="h-12 text-base"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <Label className="text-base font-medium">Horário aproximado *</Label>
                    <Input
                      type="time"
                      value={formData.horarioCarregamento}
                      onChange={(e) => setFormData(prev => ({ ...prev, horarioCarregamento: e.target.value }))}
                      className="h-12 text-base"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Package className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">O que vamos transportar?</h2>
              <p className="text-gray-600 text-lg">Descreva os itens que precisam ser transportados</p>
            </div>

            <Card className="border-2 border-gray-100">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-medium mb-4 block">Como você quer informar os itens?</Label>
                    <RadioGroup 
                      value={formData.tipoListagemItens} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, tipoListagemItens: value }))}
                    >
                      <div className="grid grid-cols-1 gap-4">
                        <label className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <RadioGroupItem value="detalhada" id="lista-detalhada" className="mt-1" />
                          <div>
                            <div className="text-base font-medium">Lista detalhada</div>
                            <div className="text-sm text-gray-600 mt-1">Informar cada item com nome e quantidade</div>
                          </div>
                        </label>
                        <label className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <RadioGroupItem value="livre" id="descricao-livre" className="mt-1" />
                          <div>
                            <div className="text-base font-medium">Descrição livre</div>
                            <div className="text-sm text-gray-600 mt-1">Descrever todos os itens em texto livre</div>
                          </div>
                        </label>
                      </div>
                    </RadioGroup>
                  </div>

                  {formData.tipoListagemItens === 'detalhada' ? (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <h4 className="text-lg font-medium">Lista de Itens</h4>
                        <Button 
                          type="button" 
                          onClick={addItem} 
                          className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base px-4 sm:px-6 w-full sm:w-auto"
                        >
                          + Adicionar Item
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {formData.itensDetalhados.map((item, index) => (
                          <div key={item.id} className="flex flex-col sm:flex-row items-center gap-3 p-3 border rounded-lg bg-gray-50">
                            <div className="flex-1 w-full">
                              <Input
                                placeholder="Ex: Geladeira, Sofá, Caixa de livros..."
                                value={item.nome}
                                onChange={(e) => updateItem(item.id, 'nome', e.target.value)}
                                className="h-10 text-base"
                              />
                            </div>
                            <div className="w-full sm:w-24">
                              <Input
                                type="number"
                                min="1"
                                value={item.quantidade}
                                onChange={(e) => updateItem(item.id, 'quantidade', parseInt(e.target.value) || 1)}
                                className="h-10 text-base text-center"
                                placeholder="Qtd"
                              />
                            </div>
                            <Button 
                              type="button" 
                              onClick={() => removeItem(item.id)} 
                              variant="destructive" 
                              size="sm"
                              className="h-10 w-full sm:w-10 p-0"
                            >
                              ✕
                            </Button>
                          </div>
                        ))}
                      </div>
                      
                      {formData.itensDetalhados.length === 0 && (
                        <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                          <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-base">Nenhum item adicionado ainda</p>
                          <p className="text-sm text-gray-400">Clique em "Adicionar Item" para começar</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <Label className="text-base font-medium">Descreva todos os itens *</Label>
                      <Textarea
                        placeholder="Descreva detalhadamente todos os itens que serão transportados..."
                        value={formData.descricaoLivreItens}
                        onChange={(e) => setFormData(prev => ({ ...prev, descricaoLivreItens: e.target.value }))}
                        rows={6}
                        className="text-base mt-2"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Check className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Precisa de serviços extras?</h2>
              <p className="text-gray-600 text-lg">Marque os serviços adicionais que você precisa</p>
            </div>

            <Card className="border-2 border-gray-100">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {[
                    { id: 'precisa-ajudante', label: 'Preciso de ajudante para carregar/descarregar', checked: formData.precisaAjudante, field: 'precisaAjudante' },
                    { id: 'precisa-montar-desmontar', label: 'Preciso montar ou desmontar móveis', checked: formData.precisaMontarDesmontar, field: 'precisaMontarDesmontar' },
                    { id: 'precisa-embalagem', label: 'Preciso de embalagem para os itens', checked: formData.precisaEmbalagem, field: 'precisaEmbalagem' }
                  ].map((item) => (
                    <label key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <Checkbox 
                        id={item.id}
                        checked={item.checked}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, [item.field]: !!checked }))}
                      />
                      <span className="text-base font-medium">{item.label}</span>
                    </label>
                  ))}

                  <div className="space-y-4">
                    <label className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <Checkbox 
                        id="local-possui-restricao"
                        checked={formData.localPossuiRestricao}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, localPossuiRestricao: !!checked }))}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="text-base font-medium">O local tem alguma restrição?</div>
                        <div className="text-sm text-gray-600 mt-1">Ex: Horário de funcionamento, condomínio, altura limitada, etc.</div>
                      </div>
                    </label>
                    
                    {formData.localPossuiRestricao && (
                      <div className="ml-10">
                        <Label className="text-base font-medium">Descreva as restrições</Label>
                        <Textarea
                          placeholder="Descreva as restrições do local..."
                          value={formData.descricaoRestricao}
                          onChange={(e) => setFormData(prev => ({ ...prev, descricaoRestricao: e.target.value }))}
                          rows={3}
                          className="text-base mt-2"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <User className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Seus dados para contato</h2>
              <p className="text-gray-600 text-lg">Como podemos entrar em contato com você</p>
            </div>

            <Card className="border-2 border-gray-100">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-medium">Nome completo *</Label>
                    <Input
                      placeholder="Digite seu nome completo"
                      value={formData.solicitanteNome}
                      onChange={(e) => handleNomeChange(e.target.value)}
                      className="h-12 text-base mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-base font-medium">Telefone *</Label>
                    <Input
                      placeholder="(11) 99999-9999"
                      value={formData.solicitanteTelefone}
                      onChange={(e) => handleTelefoneChange('solicitanteTelefone', e.target.value)}
                      className="h-12 text-base mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-base font-medium">Confirme seu telefone *</Label>
                    <Input
                      placeholder="(11) 99999-9999"
                      value={formData.solicitanteConfirmarTelefone}
                      onChange={(e) => handleTelefoneChange('solicitanteConfirmarTelefone', e.target.value)}
                      className="h-12 text-base mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-0 sm:h-20 gap-4 sm:gap-0">
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Solicitar Frete</h1>
              <p className="text-gray-600">Etapa {currentStep} de 4</p>
            </div>
            
            <div className="flex justify-center space-x-1 sm:space-x-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base font-medium transition-colors ${
                    step === currentStep
                      ? 'bg-blue-600 text-white'
                      : step < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step < currentStep ? <Check className="w-5 h-5" /> : step}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-8">
        {renderStep()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-12 pt-8 border-t border-gray-200">
          <Button
            onClick={prevStep}
            disabled={currentStep === 1}
            variant="outline"
            className="flex items-center space-x-2 h-12 px-4 sm:px-6 text-sm sm:text-base"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Voltar</span>
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={nextStep}
              className="flex items-center space-x-2 h-12 px-4 sm:px-6 text-sm sm:text-base bg-blue-600 hover:bg-blue-700"
            >
              <span>Continuar</span>
              <ChevronRight className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              onClick={() => setShowConfirmDialog(true)}
              className="flex items-center space-x-2 h-12 px-6 sm:px-8 text-sm sm:text-base bg-green-600 hover:bg-green-700"
            >
              <Check className="w-5 h-5" />
              <span>Solicitar Frete</span>
            </Button>
          )}
        </div>
      </main>

      {/* Dialog de Confirmação */}
      <FreightConfirmationDialog 
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        formData={formData}
        onConfirm={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <FreightLoadingAnimation open={showLoadingAnimation} />

      <FreightSuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        generatedFreights={generatedFreights}
        onNewFreight={handleNewFreight}
        onBackToDashboard={handleBackToDashboard}
      />
    </div>
  );
};

export default PublicFreightRequestForm;
