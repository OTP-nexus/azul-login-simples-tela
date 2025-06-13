
import React, { useState } from 'react';
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
import { useIBGE } from '@/hooks/useIBGE';
import { ChevronLeft, ChevronRight, Package, MapPin, Clock, User } from 'lucide-react';

interface ItemDetalhado {
  id: string;
  nome: string;
  quantidade: number;
}

const PublicFreightRequestForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { states, cities, loadCities } = useIBGE();

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

  const handleEstadoChange = (tipo: 'origem' | 'destino', estado: string) => {
    if (tipo === 'origem') {
      setFormData(prev => ({ ...prev, origemEstado: estado, origemCidade: '' }));
    } else {
      setFormData(prev => ({ ...prev, destinoEstado: estado, destinoCidade: '' }));
    }
    loadCities(estado);
  };

  const addItem = () => {
    const newItem: ItemDetalhado = {
      id: Date.now().toString(),
      nome: '',
      quantidade: 1
    };
    setFormData(prev => ({
      ...prev,
      itensDetalhados: [...prev.itensDetalhados, newItem]
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
      itensDetalhados: prev.itensDetalhados.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
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
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    try {
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
        itens_detalhados: formData.tipoListagemItens === 'detalhada' ? formData.itensDetalhados : [],
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

      const { error } = await supabase
        .from('fretes')
        .insert(freightData);

      if (error) {
        console.error('Erro ao salvar frete:', error);
        toast({
          title: "Erro ao solicitar frete",
          description: "Tente novamente mais tarde",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Frete solicitado com sucesso!",
        description: "Sua solicitação foi enviada e será analisada"
      });

      // Reset form
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

    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Etapa 1 - Informações de Origem e Destino
              </CardTitle>
              <CardDescription>
                Informe os locais de coleta e entrega da sua carga
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Origem */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">🔸 Origem</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="origem-estado">UF *</Label>
                    <Select value={formData.origemEstado} onValueChange={(value) => handleEstadoChange('origem', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma UF" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map(state => (
                          <SelectItem key={state.sigla} value={state.sigla}>
                            {state.sigla} - {state.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="origem-cidade">Cidade *</Label>
                    <Select value={formData.origemCidade} onValueChange={(value) => setFormData(prev => ({ ...prev, origemCidade: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a cidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map(city => (
                          <SelectItem key={city.nome} value={city.nome}>
                            {city.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Tipo de Endereço *</Label>
                  <RadioGroup value={formData.origemTipoEndereco} onValueChange={(value) => setFormData(prev => ({ ...prev, origemTipoEndereco: value }))}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="residencial" id="origem-residencial" />
                      <Label htmlFor="origem-residencial">Residencial</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="comercial" id="origem-comercial" />
                      <Label htmlFor="origem-comercial">Comercial</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="industrial" id="origem-industrial" />
                      <Label htmlFor="origem-industrial">Industrial</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="origem-carga-descarga" 
                      checked={formData.origemPossuiCargaDescarga}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, origemPossuiCargaDescarga: !!checked }))}
                    />
                    <Label htmlFor="origem-carga-descarga">Possui carga e descarga?</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="origem-escada" 
                      checked={formData.origemPossuiEscada}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, origemPossuiEscada: !!checked }))}
                    />
                    <Label htmlFor="origem-escada">Possui escada?</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="origem-elevador" 
                      checked={formData.origemPossuiElevador}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, origemPossuiElevador: !!checked }))}
                    />
                    <Label htmlFor="origem-elevador">Possui elevador?</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="origem-doca" 
                      checked={formData.origemPossuiDoca}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, origemPossuiDoca: !!checked }))}
                    />
                    <Label htmlFor="origem-doca">Possui doca de carga?</Label>
                  </div>
                </div>
              </div>

              {/* Destino */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">🔸 Destino</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="destino-estado">UF *</Label>
                    <Select value={formData.destinoEstado} onValueChange={(value) => handleEstadoChange('destino', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma UF" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map(state => (
                          <SelectItem key={state.sigla} value={state.sigla}>
                            {state.sigla} - {state.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="destino-cidade">Cidade *</Label>
                    <Select value={formData.destinoCidade} onValueChange={(value) => setFormData(prev => ({ ...prev, destinoCidade: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a cidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map(city => (
                          <SelectItem key={city.nome} value={city.nome}>
                            {city.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Tipo de Endereço *</Label>
                  <RadioGroup value={formData.destinoTipoEndereco} onValueChange={(value) => setFormData(prev => ({ ...prev, destinoTipoEndereco: value }))}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="residencial" id="destino-residencial" />
                      <Label htmlFor="destino-residencial">Residencial</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="comercial" id="destino-comercial" />
                      <Label htmlFor="destino-comercial">Comercial</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="industrial" id="destino-industrial" />
                      <Label htmlFor="destino-industrial">Industrial</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="destino-carga-descarga" 
                      checked={formData.destinoPossuiCargaDescarga}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, destinoPossuiCargaDescarga: !!checked }))}
                    />
                    <Label htmlFor="destino-carga-descarga">Possui carga e descarga?</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="destino-escada" 
                      checked={formData.destinoPossuiEscada}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, destinoPossuiEscada: !!checked }))}
                    />
                    <Label htmlFor="destino-escada">Possui escada?</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="destino-elevador" 
                      checked={formData.destinoPossuiElevador}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, destinoPossuiElevador: !!checked }))}
                    />
                    <Label htmlFor="destino-elevador">Possui elevador?</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="destino-doca" 
                      checked={formData.destinoPossuiDoca}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, destinoPossuiDoca: !!checked }))}
                    />
                    <Label htmlFor="destino-doca">Possui doca de carga?</Label>
                  </div>
                </div>
              </div>

              {/* Data e Horário */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  🗓️ Data e Horário de Carregamento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="data-carregamento">Data *</Label>
                    <Input
                      id="data-carregamento"
                      type="date"
                      value={formData.dataCarregamento}
                      onChange={(e) => setFormData(prev => ({ ...prev, dataCarregamento: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="horario-carregamento">Horário *</Label>
                    <Input
                      id="horario-carregamento"
                      type="time"
                      value={formData.horarioCarregamento}
                      onChange={(e) => setFormData(prev => ({ ...prev, horarioCarregamento: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Etapa 2 - Itens a serem transportados
              </CardTitle>
              <CardDescription>
                Informe quais itens serão transportados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Como você quer informar os itens?</Label>
                <RadioGroup 
                  value={formData.tipoListagemItens} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, tipoListagemItens: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="detalhada" id="lista-detalhada" />
                    <Label htmlFor="lista-detalhada">Listar os itens (Nome + Quantidade)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="livre" id="descricao-livre" />
                    <Label htmlFor="descricao-livre">Descrição livre dos itens</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.tipoListagemItens === 'detalhada' ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Lista de Itens</h4>
                    <Button type="button" onClick={addItem} variant="outline" size="sm">
                      Adicionar Item
                    </Button>
                  </div>
                  
                  {formData.itensDetalhados.map((item, index) => (
                    <div key={item.id} className="flex gap-4 items-end">
                      <div className="flex-1">
                        <Label htmlFor={`item-nome-${item.id}`}>Nome do Item</Label>
                        <Input
                          id={`item-nome-${item.id}`}
                          placeholder="Ex: Cama, Geladeira, Caixa pequena"
                          value={item.nome}
                          onChange={(e) => updateItem(item.id, 'nome', e.target.value)}
                        />
                      </div>
                      <div className="w-32">
                        <Label htmlFor={`item-quantidade-${item.id}`}>Quantidade</Label>
                        <Input
                          id={`item-quantidade-${item.id}`}
                          type="number"
                          min="1"
                          value={item.quantidade}
                          onChange={(e) => updateItem(item.id, 'quantidade', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <Button 
                        type="button" 
                        onClick={() => removeItem(item.id)} 
                        variant="destructive" 
                        size="sm"
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                  
                  {formData.itensDetalhados.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      Nenhum item adicionado. Clique em "Adicionar Item" para começar.
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <Label htmlFor="descricao-livre-itens">Descrição dos Itens *</Label>
                  <Textarea
                    id="descricao-livre-itens"
                    placeholder="Descreva todos os itens que serão transportados..."
                    value={formData.descricaoLivreItens}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricaoLivreItens: e.target.value }))}
                    rows={5}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>🛠️ Etapa 3 - Necessidades adicionais</CardTitle>
              <CardDescription>
                Informe se você precisa de serviços extras
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="precisa-ajudante" 
                    checked={formData.precisaAjudante}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, precisaAjudante: !!checked }))}
                  />
                  <Label htmlFor="precisa-ajudante">Precisa de ajudante?</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="precisa-montar-desmontar" 
                    checked={formData.precisaMontarDesmontar}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, precisaMontarDesmontar: !!checked }))}
                  />
                  <Label htmlFor="precisa-montar-desmontar">Precisa montar ou desmontar móveis?</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="precisa-embalagem" 
                    checked={formData.precisaEmbalagem}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, precisaEmbalagem: !!checked }))}
                  />
                  <Label htmlFor="precisa-embalagem">Precisa de embalagem para os itens?</Label>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="local-possui-restricao" 
                      checked={formData.localPossuiRestricao}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, localPossuiRestricao: !!checked }))}
                    />
                    <Label htmlFor="local-possui-restricao">O local possui algum tipo de restrição?</Label>
                  </div>
                  <p className="text-sm text-gray-500 ml-6">Ex: Horário, acesso, altura, condomínio, etc.</p>
                  
                  {formData.localPossuiRestricao && (
                    <div className="ml-6">
                      <Label htmlFor="descricao-restricao">Descreva a restrição</Label>
                      <Textarea
                        id="descricao-restricao"
                        placeholder="Descreva as restrições do local..."
                        value={formData.descricaoRestricao}
                        onChange={(e) => setFormData(prev => ({ ...prev, descricaoRestricao: e.target.value }))}
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                👤 Etapa 4 - Dados do Solicitante
              </CardTitle>
              <CardDescription>
                Informe seus dados para contato
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="solicitante-nome">Nome completo do solicitante *</Label>
                <Input
                  id="solicitante-nome"
                  placeholder="Digite seu nome completo"
                  value={formData.solicitanteNome}
                  onChange={(e) => setFormData(prev => ({ ...prev, solicitanteNome: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="solicitante-telefone">Telefone *</Label>
                <Input
                  id="solicitante-telefone"
                  placeholder="(00) 00000-0000"
                  value={formData.solicitanteTelefone}
                  onChange={(e) => setFormData(prev => ({ ...prev, solicitanteTelefone: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="solicitante-confirmar-telefone">Confirmar telefone *</Label>
                <Input
                  id="solicitante-confirmar-telefone"
                  placeholder="(00) 00000-0000"
                  value={formData.solicitanteConfirmarTelefone}
                  onChange={(e) => setFormData(prev => ({ ...prev, solicitanteConfirmarTelefone: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Solicitar Frete</h1>
              <p className="text-sm text-gray-600">Etapa {currentStep} de 4</p>
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
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderStep()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={prevStep}
            disabled={currentStep === 1}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={nextStep}
              className="flex items-center space-x-2"
            >
              <span>Próxima</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Enviando...</span>
                </>
              ) : (
                <span>Solicitar Frete</span>
              )}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default PublicFreightRequestForm;
