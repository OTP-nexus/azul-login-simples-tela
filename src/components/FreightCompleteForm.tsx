import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Truck, User, Plus, X, ArrowRight, CheckCircle, MapPin, Settings, DollarSign, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useEstados, useCidades } from '@/hooks/useIBGE';
import FreightCompleteVerificationDialog from './FreightCompleteVerificationDialog';
import FreightCompleteLoadingAnimation from './FreightCompleteLoadingAnimation';
import FreightCompleteSuccessDialog from './FreightCompleteSuccessDialog';

interface CollaboratorComplete {
  id: string;
  name: string;
  sector: string;
}

interface DestinoComplete {
  id: string;
  cidade: string;
  estado: string;
}

interface TabelaPrecoComplete {
  id: string;
  tipoVeiculo: string;
  faixaKm: {
    inicio: number;
    fim: number;
  };
  preco: number;
}

interface FreightCompleteFormData {
  collaborators: CollaboratorComplete[];
  origem: {
    cidade: string;
    estado: string;
  };
  destinos: DestinoComplete[];
  tipoMercadoria: string;
  pesoCarga: string;
  valorCarga: string;
  tiposVeiculos: string[];
  tiposCarrocerias: string[];
  tabelasPreco: TabelaPrecoComplete[];
  dataColeta: string;
  dataEntrega: string;
  horarioCarregamento: string;
  pedagioPagoPor: string;
  pedagioDirecao: string;
  precisaAjudante: boolean;
  precisaRastreador: boolean;
  precisaSeguro: boolean;
  regrasAgendamento: string[];
  beneficios: string[];
  observacoes: string;
}

interface GeneratedFreightComplete {
  id: string;
  codigo_agregamento: string;
  destino_cidade: string;
  destino_estado: string;
}

const FreightCompleteForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { estados } = useEstados();

  // Estados do formulário
  const [currentStepComplete, setCurrentStepComplete] = useState(1);
  const [collaboratorsComplete, setCollaboratorsComplete] = useState<CollaboratorComplete[]>([]);
  const [loadingCollaboratorsComplete, setLoadingCollaboratorsComplete] = useState(true);
  const [showVerificationDialogComplete, setShowVerificationDialogComplete] = useState(false);
  const [showLoadingComplete, setShowLoadingComplete] = useState(false);
  const [showSuccessDialogComplete, setShowSuccessDialogComplete] = useState(false);
  const [generatedFreightsComplete, setGeneratedFreightsComplete] = useState<GeneratedFreightComplete[]>([]);
  const [selectedStateOrigemComplete, setSelectedStateOrigemComplete] = useState('');
  const [selectedStateDestinoComplete, setSelectedStateDestinoComplete] = useState('');

  // Hook para cidades baseado no estado selecionado
  const { cidades: cidadesOrigem } = useCidades(selectedStateOrigemComplete);
  const { cidades: cidadesDestino } = useCidades(selectedStateDestinoComplete);

  const [formDataComplete, setFormDataComplete] = useState<FreightCompleteFormData>({
    collaborators: [],
    origem: { cidade: '', estado: '' },
    destinos: [],
    tipoMercadoria: '',
    pesoCarga: '',
    valorCarga: '',
    tiposVeiculos: [],
    tiposCarrocerias: [],
    tabelasPreco: [],
    dataColeta: '',
    dataEntrega: '',
    horarioCarregamento: '',
    pedagioPagoPor: '',
    pedagioDirecao: '',
    precisaAjudante: false,
    precisaRastreador: false,
    precisaSeguro: false,
    regrasAgendamento: [],
    beneficios: [],
    observacoes: ''
  });

  // Estados para novos itens
  const [newDestinoComplete, setNewDestinoComplete] = useState({ cidade: '', estado: '' });
  const [newTabelaPrecoComplete, setNewTabelaPrecoComplete] = useState({
    tipoVeiculo: '',
    faixaKm: { inicio: 0, fim: 0 },
    preco: 0
  });
  const [newRegraAgendamentoComplete, setNewRegraAgendamentoComplete] = useState('');
  const [newBeneficioComplete, setNewBeneficioComplete] = useState('');

  // Carregar colaboradores
  useEffect(() => {
    loadCollaboratorsComplete();
  }, [user]);

  const loadCollaboratorsComplete = async () => {
    if (!user?.id) return;

    try {
      setLoadingCollaboratorsComplete(true);
      
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (company) {
        const { data: collaborators } = await supabase
          .from('collaborators')
          .select('*')
          .eq('company_id', company.id);

        if (collaborators) {
          setCollaboratorsComplete(collaborators.map(c => ({
            id: c.id,
            name: c.name,
            sector: c.sector
          })));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar colaboradores",
        variant: "destructive"
      });
    } finally {
      setLoadingCollaboratorsComplete(false);
    }
  };

  // Validações por etapa
  const validateStep1Complete = () => {
    return formDataComplete.collaborators.length > 0;
  };

  const validateStep2Complete = () => {
    return formDataComplete.origem.cidade && 
           formDataComplete.origem.estado && 
           formDataComplete.destinos.length > 0 &&
           formDataComplete.tipoMercadoria;
  };

  const validateStep3Complete = () => {
    return formDataComplete.tiposVeiculos.length > 0 && 
           formDataComplete.tabelasPreco.length > 0;
  };

  const validateStep4Complete = () => {
    return formDataComplete.dataColeta && formDataComplete.dataEntrega;
  };

  const validateCurrentStepComplete = () => {
    switch (currentStepComplete) {
      case 1: return validateStep1Complete();
      case 2: return validateStep2Complete();
      case 3: return validateStep3Complete();
      case 4: return validateStep4Complete();
      default: return false;
    }
  };

  // Navegação entre etapas
  const nextStepComplete = () => {
    if (validateCurrentStepComplete()) {
      if (currentStepComplete < 4) {
        setCurrentStepComplete(currentStepComplete + 1);
      } else {
        setShowVerificationDialogComplete(true);
      }
    } else {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios antes de continuar",
        variant: "destructive"
      });
    }
  };

  const prevStepComplete = () => {
    if (currentStepComplete > 1) {
      setCurrentStepComplete(currentStepComplete - 1);
    }
  };

  // Funções para gerenciar colaboradores
  const toggleCollaboratorComplete = (collaborator: CollaboratorComplete) => {
    setFormDataComplete(prev => {
      const isSelected = prev.collaborators.some(c => c.id === collaborator.id);
      if (isSelected) {
        return {
          ...prev,
          collaborators: prev.collaborators.filter(c => c.id !== collaborator.id)
        };
      } else {
        return {
          ...prev,
          collaborators: [...prev.collaborators, collaborator]
        };
      }
    });
  };

  // Funções para gerenciar destinos
  const addDestinoComplete = () => {
    if (newDestinoComplete.cidade && newDestinoComplete.estado) {
      const newDestino: DestinoComplete = {
        id: Date.now().toString(),
        cidade: newDestinoComplete.cidade,
        estado: newDestinoComplete.estado
      };
      
      setFormDataComplete(prev => ({
        ...prev,
        destinos: [...prev.destinos, newDestino]
      }));
      
      setNewDestinoComplete({ cidade: '', estado: '' });
      setSelectedStateDestinoComplete('');
    }
  };

  const removeDestinoComplete = (id: string) => {
    setFormDataComplete(prev => ({
      ...prev,
      destinos: prev.destinos.filter(d => d.id !== id)
    }));
  };

  // Funções para gerenciar tipos de veículos
  const toggleTipoVeiculoComplete = (tipo: string) => {
    setFormDataComplete(prev => {
      const isSelected = prev.tiposVeiculos.includes(tipo);
      if (isSelected) {
        return {
          ...prev,
          tiposVeiculos: prev.tiposVeiculos.filter(t => t !== tipo)
        };
      } else {
        return {
          ...prev,
          tiposVeiculos: [...prev.tiposVeiculos, tipo]
        };
      }
    });
  };

  // Funções para gerenciar tipos de carrocerias
  const toggleTipoCarroceriaComplete = (tipo: string) => {
    setFormDataComplete(prev => {
      const isSelected = prev.tiposCarrocerias.includes(tipo);
      if (isSelected) {
        return {
          ...prev,
          tiposCarrocerias: prev.tiposCarrocerias.filter(t => t !== tipo)
        };
      } else {
        return {
          ...prev,
          tiposCarrocerias: [...prev.tiposCarrocerias, tipo]
        };
      }
    });
  };

  // Funções para gerenciar tabelas de preço
  const addTabelaPrecoComplete = () => {
    if (newTabelaPrecoComplete.tipoVeiculo && newTabelaPrecoComplete.preco > 0) {
      const newTabela: TabelaPrecoComplete = {
        id: Date.now().toString(),
        ...newTabelaPrecoComplete
      };
      
      setFormDataComplete(prev => ({
        ...prev,
        tabelasPreco: [...prev.tabelasPreco, newTabela]
      }));
      
      setNewTabelaPrecoComplete({
        tipoVeiculo: '',
        faixaKm: { inicio: 0, fim: 0 },
        preco: 0
      });
    }
  };

  const removeTabelaPrecoComplete = (id: string) => {
    setFormDataComplete(prev => ({
      ...prev,
      tabelasPreco: prev.tabelasPreco.filter(t => t.id !== id)
    }));
  };

  // Funções para gerenciar regras de agendamento
  const addRegraAgendamentoComplete = () => {
    if (newRegraAgendamentoComplete.trim()) {
      setFormDataComplete(prev => ({
        ...prev,
        regrasAgendamento: [...prev.regrasAgendamento, newRegraAgendamentoComplete.trim()]
      }));
      setNewRegraAgendamentoComplete('');
    }
  };

  const removeRegraAgendamentoComplete = (index: number) => {
    setFormDataComplete(prev => ({
      ...prev,
      regrasAgendamento: prev.regrasAgendamento.filter((_, i) => i !== index)
    }));
  };

  // Funções para gerenciar benefícios
  const addBeneficioComplete = () => {
    if (newBeneficioComplete.trim()) {
      setFormDataComplete(prev => ({
        ...prev,
        beneficios: [...prev.beneficios, newBeneficioComplete.trim()]
      }));
      setNewBeneficioComplete('');
    }
  };

  const removeBeneficioComplete = (index: number) => {
    setFormDataComplete(prev => ({
      ...prev,
      beneficios: prev.beneficios.filter((_, i) => i !== index)
    }));
  };

  // Função para criar fretes
  const createFreightsComplete = async () => {
    if (!user?.id) return;

    try {
      setShowVerificationDialogComplete(false);
      setShowLoadingComplete(true);

      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!company) {
        throw new Error('Empresa não encontrada');
      }

      const createdFreights: GeneratedFreightComplete[] = [];

      for (const destino of formDataComplete.destinos) {
        const freteData = {
          company_id: company.id,
          collaborator_ids: formDataComplete.collaborators.map(c => c.id),
          tipo_frete: 'completo',
          origem_cidade: formDataComplete.origem.cidade,
          origem_estado: formDataComplete.origem.estado,
          destinos: [{ cidade: destino.cidade, estado: destino.estado }],
          tipo_mercadoria: formDataComplete.tipoMercadoria,
          peso_carga: formDataComplete.pesoCarga ? parseFloat(formDataComplete.pesoCarga) : null,
          valor_carga: formDataComplete.valorCarga ? parseFloat(formDataComplete.valorCarga) : null,
          tipos_veiculos: formDataComplete.tiposVeiculos,
          tipos_carrocerias: formDataComplete.tiposCarrocerias,
          tabelas_preco: formDataComplete.tabelasPreco as any,
          data_coleta: formDataComplete.dataColeta || null,
          data_entrega: formDataComplete.dataEntrega || null,
          horario_carregamento: formDataComplete.horarioCarregamento || null,
          pedagio_pago_por: formDataComplete.pedagioPagoPor || null,
          pedagio_direcao: formDataComplete.pedagioDirecao || null,
          precisa_ajudante: formDataComplete.precisaAjudante,
          precisa_rastreador: formDataComplete.precisaRastreador,
          precisa_seguro: formDataComplete.precisaSeguro,
          regras_agendamento: formDataComplete.regrasAgendamento,
          beneficios: formDataComplete.beneficios,
          observacoes: formDataComplete.observacoes || null,
          status: 'pendente'
        };

        const { data: frete, error } = await supabase
          .from('fretes')
          .insert(freteData)
          .select('id, codigo_agregamento')
          .single();

        if (error) throw error;

        createdFreights.push({
          id: frete.id,
          codigo_agregamento: frete.codigo_agregamento || '',
          destino_cidade: destino.cidade,
          destino_estado: destino.estado
        });
      }

      setGeneratedFreightsComplete(createdFreights);
      setShowLoadingComplete(false);
      setShowSuccessDialogComplete(true);

      toast({
        title: "Sucesso!",
        description: `${createdFreights.length} frete(s) completo(s) criado(s) com sucesso!`
      });

    } catch (error) {
      console.error('Erro ao criar fretes:', error);
      setShowLoadingComplete(false);
      toast({
        title: "Erro",
        description: "Erro ao criar fretes. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleBackComplete = () => {
    navigate('/freight-request');
  };

  const handleNewFreightComplete = () => {
    setShowSuccessDialogComplete(false);
    setCurrentStepComplete(1);
    setFormDataComplete({
      collaborators: [],
      origem: { cidade: '', estado: '' },
      destinos: [],
      tipoMercadoria: '',
      pesoCarga: '',
      valorCarga: '',
      tiposVeiculos: [],
      tiposCarrocerias: [],
      tabelasPreco: [],
      dataColeta: '',
      dataEntrega: '',
      horarioCarregamento: '',
      pedagioPagoPor: '',
      pedagioDirecao: '',
      precisaAjudante: false,
      precisaRastreador: false,
      precisaSeguro: false,
      regrasAgendamento: [],
      beneficios: [],
      observacoes: ''
    });
  };

  const handleBackToDashboardComplete = () => {
    navigate('/company-dashboard');
  };

  const progressComplete = (currentStepComplete / 4) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleBackComplete}
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
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Etapa {currentStepComplete} de 4</span>
            <span className="text-sm text-gray-500">{Math.round(progressComplete)}% concluído</span>
          </div>
          <Progress value={progressComplete} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Etapa 1: Colaboradores */}
        {currentStepComplete === 1 && (
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle>Selecionar Colaboradores</CardTitle>
                  <CardDescription>
                    Escolha os colaboradores responsáveis por este frete completo
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingCollaboratorsComplete ? (
                <div className="text-center py-8">Carregando colaboradores...</div>
              ) : collaboratorsComplete.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Nenhum colaborador encontrado</p>
                  <Button onClick={() => navigate('/collaborator-registration')}>
                    Cadastrar Colaborador
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {collaboratorsComplete.map((collaborator) => (
                    <div
                      key={collaborator.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        formDataComplete.collaborators.some(c => c.id === collaborator.id)
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleCollaboratorComplete(collaborator)}
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={formDataComplete.collaborators.some(c => c.id === collaborator.id)}
                        />
                        <div>
                          <p className="font-medium">{collaborator.name}</p>
                          <p className="text-sm text-gray-500">{collaborator.sector}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Etapa 2: Origem e Destinos */}
        {currentStepComplete === 2 && (
          <div className="space-y-6">
            {/* Origem */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>Origem da Carga</CardTitle>
                    <CardDescription>Informe o local de coleta da mercadoria</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="origem-estado">Estado de Origem *</Label>
                    <Select
                      value={formDataComplete.origem.estado}
                      onValueChange={(value) => {
                        setFormDataComplete(prev => ({
                          ...prev,
                          origem: { ...prev.origem, estado: value, cidade: '' }
                        }));
                        setSelectedStateOrigemComplete(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {estados.map((state) => (
                          <SelectItem key={state.sigla} value={state.sigla}>
                            {state.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="origem-cidade">Cidade de Origem *</Label>
                    <Select
                      value={formDataComplete.origem.cidade}
                      onValueChange={(value) =>
                        setFormDataComplete(prev => ({
                          ...prev,
                          origem: { ...prev.origem, cidade: value }
                        }))
                      }
                      disabled={!formDataComplete.origem.estado}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a cidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {cidadesOrigem.map((city) => (
                          <SelectItem key={city.nome} value={city.nome}>
                            {city.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Destinos */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle>Destinos da Carga</CardTitle>
                    <CardDescription>Adicione os destinos para entrega</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Formulário para adicionar novo destino */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select
                      value={newDestinoComplete.estado}
                      onValueChange={(value) => {
                        setNewDestinoComplete(prev => ({ ...prev, estado: value, cidade: '' }));
                        setSelectedStateDestinoComplete(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {estados.map((state) => (
                          <SelectItem key={state.sigla} value={state.sigla}>
                            {state.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Cidade</Label>
                    <Select
                      value={newDestinoComplete.cidade}
                      onValueChange={(value) =>
                        setNewDestinoComplete(prev => ({ ...prev, cidade: value }))
                      }
                      disabled={!newDestinoComplete.estado}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Cidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {cidadesDestino.map((city) => (
                          <SelectItem key={city.nome} value={city.nome}>
                            {city.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={addDestinoComplete}
                      disabled={!newDestinoComplete.cidade || !newDestinoComplete.estado}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar Destino</span>
                    </Button>
                  </div>

                  {/* Aviso informativo sobre múltiplos destinos */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 md:col-span-3">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-orange-800">
                        <strong>Informação importante:</strong> Cada destino gerará um pedido de frete separado, com os mesmos dados preenchidos. Isso facilita o seu trabalho e economiza tempo, pois você só precisa preencher as informações uma vez!
                      </div>
                    </div>
                  </div>
                </div>

                {formDataComplete.destinos.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum destino adicionado
                  </div>
                )}

                {/* Lista de destinos */}
                {formDataComplete.destinos.length > 0 && (
                  <div className="space-y-2">
                    {formDataComplete.destinos.map((destino) => (
                      <div key={destino.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <span className="font-medium">
                          {destino.cidade} - {destino.estado}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDestinoComplete(destino.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tipo de Mercadoria */}
            <Card>
              <CardHeader>
                <CardTitle>Tipo de Mercadoria</CardTitle>
                <CardDescription>Descreva o tipo de mercadoria a ser transportada</CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Ex: Produtos alimentícios, materiais de construção, etc."
                  value={formDataComplete.tipoMercadoria}
                  onChange={(e) =>
                    setFormDataComplete(prev => ({ ...prev, tipoMercadoria: e.target.value }))
                  }
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Etapa 3: Carga e Veículos */}
        {currentStepComplete === 3 && (
          <div className="space-y-6">
            {/* Informações da Carga */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle>Informações da Carga</CardTitle>
                    <CardDescription>Detalhes sobre peso e valor da mercadoria</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="peso-carga">Peso da Carga (kg)</Label>
                    <Input
                      id="peso-carga"
                      type="number"
                      placeholder="Ex: 1000"
                      value={formDataComplete.pesoCarga}
                      onChange={(e) =>
                        setFormDataComplete(prev => ({ ...prev, pesoCarga: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valor-carga">Valor da Carga (R$)</Label>
                    <Input
                      id="valor-carga"
                      type="number"
                      placeholder="Ex: 50000"
                      value={formDataComplete.valorCarga}
                      onChange={(e) =>
                        setFormDataComplete(prev => ({ ...prev, valorCarga: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tipos de Veículos */}
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Veículos *</CardTitle>
                <CardDescription>Selecione os tipos de veículos aceitos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['Carreta', 'Truck', 'Toco', 'VUC', 'Bitrem', 'Rodotrem'].map((tipo) => (
                    <div key={tipo} className="flex items-center space-x-2">
                      <Checkbox
                        id={`veiculo-${tipo}`}
                        checked={formDataComplete.tiposVeiculos.includes(tipo)}
                        onCheckedChange={() => toggleTipoVeiculoComplete(tipo)}
                      />
                      <Label htmlFor={`veiculo-${tipo}`}>{tipo}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tipos de Carrocerias */}
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Carrocerias</CardTitle>
                <CardDescription>Selecione os tipos de carrocerias aceitas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['Baú', 'Graneleiro', 'Prancha', 'Frigorífico', 'Tanque', 'Sider'].map((tipo) => (
                    <div key={tipo} className="flex items-center space-x-2">
                      <Checkbox
                        id={`carroceria-${tipo}`}
                        checked={formDataComplete.tiposCarrocerias.includes(tipo)}
                        onCheckedChange={() => toggleTipoCarroceriaComplete(tipo)}
                      />
                      <Label htmlFor={`carroceria-${tipo}`}>{tipo}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tabelas de Preço */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>Tabelas de Preço *</CardTitle>
                    <CardDescription>Configure os preços por tipo de veículo e distância</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Formulário para adicionar nova tabela */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <Label>Tipo de Veículo</Label>
                    <Select
                      value={newTabelaPrecoComplete.tipoVeiculo}
                      onValueChange={(value) =>
                        setNewTabelaPrecoComplete(prev => ({ ...prev, tipoVeiculo: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {formDataComplete.tiposVeiculos.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>KM Inicial</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={newTabelaPrecoComplete.faixaKm.inicio || ''}
                      onChange={(e) =>
                        setNewTabelaPrecoComplete(prev => ({
                          ...prev,
                          faixaKm: { ...prev.faixaKm, inicio: parseInt(e.target.value) || 0 }
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>KM Final</Label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={newTabelaPrecoComplete.faixaKm.fim || ''}
                      onChange={(e) =>
                        setNewTabelaPrecoComplete(prev => ({
                          ...prev,
                          faixaKm: { ...prev.faixaKm, fim: parseInt(e.target.value) || 0 }
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Preço (R$)</Label>
                    <Input
                      type="number"
                      placeholder="1500"
                      value={newTabelaPrecoComplete.preco || ''}
                      onChange={(e) =>
                        setNewTabelaPrecoComplete(prev => ({ ...prev, preco: parseFloat(e.target.value) || 0 }))
                      }
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addTabelaPrecoComplete} className="w-full">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Lista de tabelas */}
                {formDataComplete.tabelasPreco.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma tabela de preço configurada
                  </div>
                )}

                {formDataComplete.tabelasPreco.length > 0 && (
                  <div className="space-y-2">
                    {formDataComplete.tabelasPreco.map((tabela) => (
                      <div key={tabela.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="font-medium">
                          {tabela.tipoVeiculo}: {tabela.faixaKm.inicio}-{tabela.faixaKm.fim}km - R$ {tabela.preco}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTabelaPrecoComplete(tabela.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Etapa 4: Configurações */}
        {currentStepComplete === 4 && (
          <div className="space-y-6">
            {/* Datas */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Settings className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>Datas e Horários</CardTitle>
                    <CardDescription>Configure os prazos para coleta e entrega</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data-coleta">Data de Coleta *</Label>
                    <Input
                      id="data-coleta"
                      type="date"
                      value={formDataComplete.dataColeta}
                      onChange={(e) =>
                        setFormDataComplete(prev => ({ ...prev, dataColeta: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data-entrega">Data de Entrega *</Label>
                    <Input
                      id="data-entrega"
                      type="date"
                      value={formDataComplete.dataEntrega}
                      onChange={(e) =>
                        setFormDataComplete(prev => ({ ...prev, dataEntrega: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="horario-carregamento">Horário de Carregamento</Label>
                    <Input
                      id="horario-carregamento"
                      type="time"
                      value={formDataComplete.horarioCarregamento}
                      onChange={(e) =>
                        setFormDataComplete(prev => ({ ...prev, horarioCarregamento: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pedágio */}
            <Card>
              <CardHeader>
                <CardTitle>Informações de Pedágio</CardTitle>
                <CardDescription>Configure quem pagará o pedágio e direção</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pedágio pago por</Label>
                    <Select
                      value={formDataComplete.pedagioPagoPor}
                      onValueChange={(value) =>
                        setFormDataComplete(prev => ({ ...prev, pedagioPagoPor: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="embarcador">Embarcador</SelectItem>
                        <SelectItem value="transportadora">Transportadora</SelectItem>
                        <SelectItem value="motorista">Motorista</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Direção do pedágio</Label>
                    <Select
                      value={formDataComplete.pedagioDirecao}
                      onValueChange={(value) =>
                        setFormDataComplete(prev => ({ ...prev, pedagioDirecao: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ida">Ida</SelectItem>
                        <SelectItem value="volta">Volta</SelectItem>
                        <SelectItem value="ida-volta">Ida e Volta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requisitos */}
            <Card>
              <CardHeader>
                <CardTitle>Requisitos Especiais</CardTitle>
                <CardDescription>Selecione os requisitos necessários</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="precisa-ajudante"
                      checked={formDataComplete.precisaAjudante}
                      onCheckedChange={(checked) =>
                        setFormDataComplete(prev => ({ ...prev, precisaAjudante: checked as boolean }))
                      }
                    />
                    <Label htmlFor="precisa-ajudante">Precisa de ajudante</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="precisa-rastreador"
                      checked={formDataComplete.precisaRastreador}
                      onCheckedChange={(checked) =>
                        setFormDataComplete(prev => ({ ...prev, precisaRastreador: checked as boolean }))
                      }
                    />
                    <Label htmlFor="precisa-rastreador">Precisa de rastreador</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="precisa-seguro"
                      checked={formDataComplete.precisaSeguro}
                      onCheckedChange={(checked) =>
                        setFormDataComplete(prev => ({ ...prev, precisaSeguro: checked as boolean }))
                      }
                    />
                    <Label htmlFor="precisa-seguro">Precisa de seguro</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Regras de Agendamento */}
            <Card>
              <CardHeader>
                <CardTitle>Regras de Agendamento</CardTitle>
                <CardDescription>Adicione regras específicas para agendamento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Digite uma regra de agendamento"
                    value={newRegraAgendamentoComplete}
                    onChange={(e) => setNewRegraAgendamentoComplete(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addRegraAgendamentoComplete()}
                  />
                  <Button onClick={addRegraAgendamentoComplete}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {formDataComplete.regrasAgendamento.length > 0 && (
                  <div className="space-y-2">
                    {formDataComplete.regrasAgendamento.map((regra, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>{regra}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRegraAgendamentoComplete(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Benefícios */}
            <Card>
              <CardHeader>
                <CardTitle>Benefícios</CardTitle>
                <CardDescription>Adicione benefícios oferecidos aos motoristas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Digite um benefício"
                    value={newBeneficioComplete}
                    onChange={(e) => setNewBeneficioComplete(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addBeneficioComplete()}
                  />
                  <Button onClick={addBeneficioComplete}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {formDataComplete.beneficios.length > 0 && (
                  <div className="space-y-2">
                    {formDataComplete.beneficios.map((beneficio, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>{beneficio}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBeneficioComplete(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Observações */}
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
                <CardDescription>Informações adicionais sobre o frete</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Digite observações adicionais sobre este frete completo..."
                  value={formDataComplete.observacoes}
                  onChange={(e) =>
                    setFormDataComplete(prev => ({ ...prev, observacoes: e.target.value }))
                  }
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Botões de Navegação */}
        <div className="flex justify-between items-center pt-8">
          <Button
            variant="outline"
            onClick={prevStepComplete}
            disabled={currentStepComplete === 1}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </Button>

          <div className="flex items-center space-x-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i + 1 === currentStepComplete
                    ? 'bg-orange-600'
                    : i + 1 < currentStepComplete
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={nextStepComplete}
            disabled={!validateCurrentStepComplete()}
            className="flex items-center space-x-2"
          >
            {currentStepComplete === 4 ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Finalizar</span>
              </>
            ) : (
              <>
                <span>Próximo</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </main>

      {/* Diálogos */}
      <FreightCompleteVerificationDialog
        open={showVerificationDialogComplete}
        onOpenChange={setShowVerificationDialogComplete}
        formData={formDataComplete}
        onConfirm={createFreightsComplete}
      />

      <FreightCompleteLoadingAnimation open={showLoadingComplete} />

      <FreightCompleteSuccessDialog
        open={showSuccessDialogComplete}
        onOpenChange={setShowSuccessDialogComplete}
        generatedFreights={generatedFreightsComplete}
        onNewFreight={handleNewFreightComplete}
        onBackToDashboard={handleBackToDashboardComplete}
      />
    </div>
  );
};

export default FreightCompleteForm;
