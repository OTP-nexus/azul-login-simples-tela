
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarDays, Clock, Plus, Trash2, Package, Truck, MapPin, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import FreightSuccessDialog from "./FreightSuccessDialog";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Parada {
  id: string;
  cidade: string;
  estado: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  contato: string;
  telefone: string;
  observacoes?: string;
}

interface PriceTable {
  vehicleType: string;
  kmStart: number;
  kmEnd: number;
  price: number;
}

interface FreightFormData {
  tipoFrete: 'agregamento' | 'completo';
  origemEstado: string;
  origemCidade: string;
  paradas: Parada[];
  tipoMercadoria: string;
  pesoCarga?: number;
  valorCarga?: number;
  dataColeta?: string;
  dataEntrega?: string;
  horarioCarregamento?: string;
  tiposVeiculos: string[];
  tiposCarrocerias: string[];
  precisaAjudante: boolean;
  precisaSeguro: boolean;
  precisaRastreador: boolean;
  pedagioPagoPor?: 'embarcador' | 'transportador';
  pedagioDirecao?: 'ida' | 'volta' | 'ida_volta';
  observacoes?: string;
  valoresDefinidos: boolean;
  tabelasPreco: PriceTable[];
  regraAgendamento: string[];
  beneficios: string[];
}

interface GeneratedFreight {
  id: string;
  codigo_agregamento: string;
  destino_cidade: string;
  destino_estado: string;
}

interface SortableParadaCardProps {
  parada: Parada;
  index: number;
  onUpdate: (index: number, field: keyof Parada, value: string) => void;
  onRemove: (index: number) => void;
}

const SortableParadaCard = ({ parada, index, onUpdate, onRemove }: SortableParadaCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: parada.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <div {...listeners} className="cursor-grab hover:cursor-grabbing">
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
            <MapPin className="h-5 w-5 text-blue-600" />
            Parada {index + 1}
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onRemove(index)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`cidade-${index}`}>Cidade *</Label>
              <Input
                id={`cidade-${index}`}
                value={parada.cidade}
                onChange={(e) => onUpdate(index, 'cidade', e.target.value)}
                placeholder="Ex: São Paulo"
                required
              />
            </div>
            <div>
              <Label htmlFor={`estado-${index}`}>Estado *</Label>
              <Input
                id={`estado-${index}`}
                value={parada.estado}
                onChange={(e) => onUpdate(index, 'estado', e.target.value)}
                placeholder="Ex: SP"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor={`cep-${index}`}>CEP *</Label>
              <Input
                id={`cep-${index}`}
                value={parada.cep}
                onChange={(e) => onUpdate(index, 'cep', e.target.value)}
                placeholder="00000-000"
                required
              />
            </div>
            <div>
              <Label htmlFor={`endereco-${index}`}>Endereço *</Label>
              <Input
                id={`endereco-${index}`}
                value={parada.endereco}
                onChange={(e) => onUpdate(index, 'endereco', e.target.value)}
                placeholder="Nome da rua"
                required
              />
            </div>
            <div>
              <Label htmlFor={`numero-${index}`}>Número *</Label>
              <Input
                id={`numero-${index}`}
                value={parada.numero}
                onChange={(e) => onUpdate(index, 'numero', e.target.value)}
                placeholder="123"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`complemento-${index}`}>Complemento</Label>
              <Input
                id={`complemento-${index}`}
                value={parada.complemento || ''}
                onChange={(e) => onUpdate(index, 'complemento', e.target.value)}
                placeholder="Apto, sala, etc."
              />
            </div>
            <div>
              <Label htmlFor={`bairro-${index}`}>Bairro *</Label>
              <Input
                id={`bairro-${index}`}
                value={parada.bairro}
                onChange={(e) => onUpdate(index, 'bairro', e.target.value)}
                placeholder="Nome do bairro"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`contato-${index}`}>Nome do Contato *</Label>
              <Input
                id={`contato-${index}`}
                value={parada.contato}
                onChange={(e) => onUpdate(index, 'contato', e.target.value)}
                placeholder="Nome completo"
                required
              />
            </div>
            <div>
              <Label htmlFor={`telefone-${index}`}>Telefone *</Label>
              <Input
                id={`telefone-${index}`}
                value={parada.telefone}
                onChange={(e) => onUpdate(index, 'telefone', e.target.value)}
                placeholder="(11) 99999-9999"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor={`observacoes-${index}`}>Observações</Label>
            <Textarea
              id={`observacoes-${index}`}
              value={parada.observacoes || ''}
              onChange={(e) => onUpdate(index, 'observacoes', e.target.value)}
              placeholder="Informações adicionais sobre esta parada..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const FreightCompleteForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedFreights, setGeneratedFreights] = useState<GeneratedFreight[]>([]);

  const [formData, setFormData] = useState<FreightFormData>({
    tipoFrete: 'completo',
    origemEstado: '',
    origemCidade: '',
    paradas: [],
    tipoMercadoria: '',
    pesoCarga: undefined,
    valorCarga: undefined,
    dataColeta: undefined,
    dataEntrega: undefined,
    horarioCarregamento: undefined,
    tiposVeiculos: [],
    tiposCarrocerias: [],
    precisaAjudante: false,
    precisaSeguro: false,
    precisaRastreador: false,
    pedagioPagoPor: undefined,
    pedagioDirecao: undefined,
    observacoes: undefined,
    valoresDefinidos: false,
    tabelasPreco: [],
    regraAgendamento: [],
    beneficios: [],
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addParada = () => {
    const newParada: Parada = {
      id: Date.now().toString(),
      cidade: '',
      estado: '',
      cep: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      contato: '',
      telefone: '',
      observacoes: '',
    };

    setFormData(prev => ({
      ...prev,
      paradas: [...prev.paradas, newParada]
    }));
  };

  const removeParada = (index: number) => {
    setFormData(prev => ({
      ...prev,
      paradas: prev.paradas.filter((_, i) => i !== index)
    }));
  };

  const updateParada = (index: number, field: keyof Parada, value: string) => {
    setFormData(prev => ({
      ...prev,
      paradas: prev.paradas.map((parada, i) =>
        i === index ? { ...parada, [field]: value } : parada
      )
    }));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setFormData(prev => {
        const oldIndex = prev.paradas.findIndex(p => p.id === active.id);
        const newIndex = prev.paradas.findIndex(p => p.id === over.id);

        return {
          ...prev,
          paradas: arrayMove(prev.paradas, oldIndex, newIndex),
        };
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar um frete.",
        variant: "destructive",
      });
      return;
    }

    if (formData.paradas.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos uma parada.",
        variant: "destructive",
      });
      return;
    }

    // Validate that all paradas are properly filled
    const invalidParadas = formData.paradas.some(parada => 
      !parada.cidade || !parada.estado || !parada.cep || 
      !parada.endereco || !parada.numero || !parada.bairro || 
      !parada.contato || !parada.telefone
    );

    if (invalidParadas) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios das paradas.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get company data
      const { data: companyData } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!companyData) {
        throw new Error('Empresa não encontrada');
      }

      // Create single freight with all paradas
      const freightData = {
        company_id: companyData.id,
        tipo_frete: formData.tipoFrete,
        origem_estado: formData.origemEstado,
        origem_cidade: formData.origemCidade,
        paradas: formData.paradas as any, // Cast to Json type for Supabase
        tipo_mercadoria: formData.tipoMercadoria,
        peso_carga: formData.pesoCarga,
        valor_carga: formData.valorCarga,
        data_coleta: formData.dataColeta || null,
        data_entrega: formData.dataEntrega || null,
        horario_carregamento: formData.horarioCarregamento || null,
        tipos_veiculos: formData.tiposVeiculos,
        tipos_carrocerias: formData.tiposCarrocerias,
        precisa_ajudante: formData.precisaAjudante,
        precisa_seguro: formData.precisaSeguro,
        precisa_rastreador: formData.precisaRastreador,
        pedagio_pago_por: formData.pedagioPagoPor,
        pedagio_direcao: formData.pedagioDirecao,
        observacoes: formData.observacoes,
        valores_definidos: formData.valoresDefinidos ? {
          tabelas_preco: formData.tabelasPreco,
          regras_agendamento: formData.regraAgendamento,
          beneficios: formData.beneficios
        } : null,
        collaborator_ids: [],
        status: 'pendente',
        destinos: [] // Keep for compatibility
      };

      const { data: insertedData, error: freightError } = await supabase
        .from('fretes')
        .insert([freightData])
        .select();

      if (freightError) throw freightError;

      // Create mock generated freight data for success dialog
      const mockGeneratedFreight: GeneratedFreight = {
        id: insertedData[0].id,
        codigo_agregamento: 'COMPLETO-' + Date.now().toString().slice(-6),
        destino_cidade: formData.paradas[0]?.cidade || 'Múltiplas',
        destino_estado: formData.paradas[0]?.estado || 'Estados'
      };

      setGeneratedFreights([mockGeneratedFreight]);

      toast({
        title: "Sucesso!",
        description: "Frete completo criado com sucesso!",
      });

      setShowSuccess(true);
      
      // Reset form
      setFormData({
        tipoFrete: 'completo',
        origemEstado: '',
        origemCidade: '',
        paradas: [],
        tipoMercadoria: '',
        pesoCarga: undefined,
        valorCarga: undefined,
        dataColeta: undefined,
        dataEntrega: undefined,
        horarioCarregamento: undefined,
        tiposVeiculos: [],
        tiposCarrocerias: [],
        precisaAjudante: false,
        precisaSeguro: false,
        precisaRastreador: false,
        pedagioPagoPor: undefined,
        pedagioDirecao: undefined,
        observacoes: undefined,
        valoresDefinidos: false,
        tabelasPreco: [],
        regraAgendamento: [],
        beneficios: [],
      });

    } catch (error) {
      console.error('Erro ao criar frete:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar frete. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const vehicleTypes = [
    "Caminhão",
    "Carreta",
    "Bitrem",
    "Vanderléia",
    "Rodotrem",
    "Outro"
  ];

  const bodyTypes = [
    "Aberta",
    "Fechada",
    "Frigorífica",
    "Graneleira",
    "Tanque",
    "Plataforma",
    "Sider",
    "Outra"
  ];

  const paymentResponsibilityOptions = [
    { value: 'embarcador', label: 'Embarcador' },
    { value: 'transportador', label: 'Transportador' }
  ];

  const tollDirectionOptions = [
    { value: 'ida', label: 'Ida' },
    { value: 'volta', label: 'Volta' },
    { value: 'ida_volta', label: 'Ida e Volta' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-blue-600" />
            Frete Completo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Origem Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  Origem
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="origem-estado">Estado de Origem *</Label>
                    <Input
                      id="origem-estado"
                      value={formData.origemEstado}
                      onChange={(e) => setFormData(prev => ({ ...prev, origemEstado: e.target.value }))}
                      placeholder="Ex: SP"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="origem-cidade">Cidade de Origem *</Label>
                    <Input
                      id="origem-cidade"
                      value={formData.origemCidade}
                      onChange={(e) => setFormData(prev => ({ ...prev, origemCidade: e.target.value }))}
                      placeholder="Ex: São Paulo"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Paradas Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-600" />
                  Paradas ({formData.paradas.length})
                </CardTitle>
                <Button
                  type="button"
                  onClick={addParada}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Parada
                </Button>
              </CardHeader>
              <CardContent>
                {formData.paradas.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhuma parada adicionada ainda.</p>
                    <p className="text-sm">Clique em "Adicionar Parada" para começar.</p>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={formData.paradas.map(p => p.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {formData.paradas.map((parada, index) => (
                        <SortableParadaCard
                          key={parada.id}
                          parada={parada}
                          index={index}
                          onUpdate={updateParada}
                          onRemove={removeParada}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                )}
              </CardContent>
            </Card>

            {/* Mercadoria Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-yellow-600" />
                  Mercadoria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tipo-mercadoria">Tipo de Mercadoria *</Label>
                  <Input
                    id="tipo-mercadoria"
                    value={formData.tipoMercadoria}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipoMercadoria: e.target.value }))}
                    placeholder="Ex: Eletrônicos"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="peso-carga">Peso da Carga (em KG)</Label>
                    <Input
                      id="peso-carga"
                      type="number"
                      value={formData.pesoCarga || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, pesoCarga: Number(e.target.value) }))}
                      placeholder="Ex: 1500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="valor-carga">Valor da Carga (em R$)</Label>
                    <Input
                      id="valor-carga"
                      type="number"
                      value={formData.valorCarga || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, valorCarga: Number(e.target.value) }))}
                      placeholder="Ex: 10000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Datas Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-purple-600" />
                  Datas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="data-coleta">Data de Coleta</Label>
                    <Input
                      id="data-coleta"
                      type="date"
                      value={formData.dataColeta || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, dataColeta: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="data-entrega">Data de Entrega</Label>
                    <Input
                      id="data-entrega"
                      type="date"
                      value={formData.dataEntrega || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, dataEntrega: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="horario-carregamento">Horário de Carregamento</Label>
                  <Input
                    id="horario-carregamento"
                    type="time"
                    value={formData.horarioCarregamento || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, horarioCarregamento: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Veículos Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="h-5 w-5 text-sky-600" />
                  Veículos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Tipos de Veículos</Label>
                  <div className="flex flex-wrap gap-2">
                    {vehicleTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`vehicle-type-${type}`}
                          checked={formData.tiposVeiculos.includes(type)}
                          onCheckedChange={(checked) => {
                            setFormData((prev) => ({
                              ...prev,
                              tiposVeiculos: checked
                                ? [...prev.tiposVeiculos, type]
                                : prev.tiposVeiculos.filter((t) => t !== type),
                            }));
                          }}
                        />
                        <Label htmlFor={`vehicle-type-${type}`}>{type}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Tipos de Carrocerias</Label>
                  <div className="flex flex-wrap gap-2">
                    {bodyTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`body-type-${type}`}
                          checked={formData.tiposCarrocerias.includes(type)}
                          onCheckedChange={(checked) => {
                            setFormData((prev) => ({
                              ...prev,
                              tiposCarrocerias: checked
                                ? [...prev.tiposCarrocerias, type]
                                : prev.tiposCarrocerias.filter((t) => t !== type),
                            }));
                          }}
                        />
                        <Label htmlFor={`body-type-${type}`}>{type}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Adicionais Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="h-5 w-5 text-orange-600" />
                  Adicionais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="precisa-ajudante"
                    checked={formData.precisaAjudante}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, precisaAjudante: !!checked }))}
                  />
                  <Label htmlFor="precisa-ajudante">Precisa de Ajudante?</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="precisa-seguro"
                    checked={formData.precisaSeguro}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, precisaSeguro: !!checked }))}
                  />
                  <Label htmlFor="precisa-seguro">Precisa de Seguro?</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="precisa-rastreador"
                    checked={formData.precisaRastreador}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, precisaRastreador: !!checked }))}
                  />
                  <Label htmlFor="precisa-rastreador">Precisa de Rastreador?</Label>
                </div>
              </CardContent>
            </Card>

            {/* Pedágios Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-600" />
                  Pedágios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Pedágio Pago Por</Label>
                  <RadioGroup
                    defaultValue={formData.pedagioPagoPor}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, pedagioPagoPor: value as any }))}
                    className="flex flex-col space-y-1"
                  >
                    {paymentResponsibilityOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`pedagio-pago-por-${option.value}`} />
                        <Label htmlFor={`pedagio-pago-por-${option.value}`}>{option.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div>
                  <Label>Direção do Pedágio</Label>
                  <RadioGroup
                    defaultValue={formData.pedagioDirecao}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, pedagioDirecao: value as any }))}
                    className="flex flex-col space-y-1"
                  >
                    {tollDirectionOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`pedagio-direcao-${option.value}`} />
                        <Label htmlFor={`pedagio-direcao-${option.value}`}>{option.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Observações Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Textarea className="h-5 w-5 text-zinc-600" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="observacoes">Observações Adicionais</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Informações adicionais sobre o frete..."
                    rows={3}
                    value={formData.observacoes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                {isSubmitting ? "Criando..." : "Criar Frete"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <FreightSuccessDialog 
        open={showSuccess} 
        onOpenChange={setShowSuccess}
        generatedFreights={generatedFreights}
        onNewFreight={() => {
          setShowSuccess(false);
          // Reset form state if needed
        }}
        onBackToDashboard={() => {
          setShowSuccess(false);
          // Navigate to dashboard if needed
        }}
      />
    </div>
  );
};

export default FreightCompleteForm;
