
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, X, GripVertical, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
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
  contato?: string;
  telefone?: string;
  observacoes?: string;
}

interface FreightFormData {
  origem_cidade: string;
  origem_estado: string;
  tipo_mercadoria: string;
  peso_carga: string;
  valor_carga: string;
  data_coleta: string;
  data_entrega: string;
  horario_carregamento: string;
  paradas: Parada[];
  tipos_veiculos: string[];
  tipos_carrocerias: string[];
  precisa_ajudante: boolean;
  precisa_rastreador: boolean;
  precisa_seguro: boolean;
  pedagio_pago_por: string;
  pedagio_direcao: string;
  observacoes: string;
}

const SortableParadaCard = ({ parada, index, onUpdate, onRemove }: {
  parada: Parada;
  index: number;
  onUpdate: (index: number, field: string, value: string) => void;
  onRemove: (index: number) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: parada.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className="mb-4 border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
              >
                <GripVertical className="w-4 h-4 text-gray-400" />
              </div>
              <MapPin className="w-4 h-4 text-blue-500" />
              <CardTitle className="text-lg">Parada {index + 1}</CardTitle>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`parada-cidade-${index}`}>Cidade *</Label>
              <Input
                id={`parada-cidade-${index}`}
                value={parada.cidade}
                onChange={(e) => onUpdate(index, 'cidade', e.target.value)}
                placeholder="Nome da cidade"
                required
              />
            </div>
            <div>
              <Label htmlFor={`parada-estado-${index}`}>Estado *</Label>
              <Input
                id={`parada-estado-${index}`}
                value={parada.estado}
                onChange={(e) => onUpdate(index, 'estado', e.target.value)}
                placeholder="UF"
                maxLength={2}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor={`parada-cep-${index}`}>CEP *</Label>
              <Input
                id={`parada-cep-${index}`}
                value={parada.cep}
                onChange={(e) => onUpdate(index, 'cep', e.target.value)}
                placeholder="00000-000"
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor={`parada-endereco-${index}`}>Endereço *</Label>
              <Input
                id={`parada-endereco-${index}`}
                value={parada.endereco}
                onChange={(e) => onUpdate(index, 'endereco', e.target.value)}
                placeholder="Rua, Avenida..."
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor={`parada-numero-${index}`}>Número *</Label>
              <Input
                id={`parada-numero-${index}`}
                value={parada.numero}
                onChange={(e) => onUpdate(index, 'numero', e.target.value)}
                placeholder="123"
                required
              />
            </div>
            <div>
              <Label htmlFor={`parada-complemento-${index}`}>Complemento</Label>
              <Input
                id={`parada-complemento-${index}`}
                value={parada.complemento || ''}
                onChange={(e) => onUpdate(index, 'complemento', e.target.value)}
                placeholder="Apt, Sala..."
              />
            </div>
            <div>
              <Label htmlFor={`parada-bairro-${index}`}>Bairro *</Label>
              <Input
                id={`parada-bairro-${index}`}
                value={parada.bairro}
                onChange={(e) => onUpdate(index, 'bairro', e.target.value)}
                placeholder="Nome do bairro"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`parada-contato-${index}`}>Contato</Label>
              <Input
                id={`parada-contato-${index}`}
                value={parada.contato || ''}
                onChange={(e) => onUpdate(index, 'contato', e.target.value)}
                placeholder="Nome do contato"
              />
            </div>
            <div>
              <Label htmlFor={`parada-telefone-${index}`}>Telefone</Label>
              <Input
                id={`parada-telefone-${index}`}
                value={parada.telefone || ''}
                onChange={(e) => onUpdate(index, 'telefone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <div>
            <Label htmlFor={`parada-observacoes-${index}`}>Observações</Label>
            <Textarea
              id={`parada-observacoes-${index}`}
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState<FreightFormData>({
    origem_cidade: '',
    origem_estado: '',
    tipo_mercadoria: '',
    peso_carga: '',
    valor_carga: '',
    data_coleta: '',
    data_entrega: '',
    horario_carregamento: '',
    paradas: [],
    tipos_veiculos: [],
    tipos_carrocerias: [],
    precisa_ajudante: false,
    precisa_rastreador: false,
    precisa_seguro: false,
    pedagio_pago_por: '',
    pedagio_direcao: '',
    observacoes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addParada = () => {
    const newParada: Parada = {
      id: `parada-${Date.now()}`,
      cidade: '',
      estado: '',
      cep: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      contato: '',
      telefone: '',
      observacoes: ''
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

  const updateParada = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      paradas: prev.paradas.map((parada, i) => 
        i === index ? { ...parada, [field]: value } : parada
      )
    }));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setFormData(prev => {
        const oldIndex = prev.paradas.findIndex(item => item.id === active.id);
        const newIndex = prev.paradas.findIndex(item => item.id === over.id);

        return {
          ...prev,
          paradas: arrayMove(prev.paradas, oldIndex, newIndex)
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
        variant: "destructive"
      });
      return;
    }

    if (formData.paradas.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos uma parada.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Converter dados para formato JSON compatível com Supabase
      const paradaData = formData.paradas.map(parada => ({
        id: parada.id,
        cidade: parada.cidade,
        estado: parada.estado,
        cep: parada.cep,
        endereco: parada.endereco,
        numero: parada.numero,
        complemento: parada.complemento || null,
        bairro: parada.bairro,
        contato: parada.contato || null,
        telefone: parada.telefone || null,
        observacoes: parada.observacoes || null
      }));

      const { error } = await supabase
        .from('fretes')
        .insert({
          company_id: user.id,
          tipo_frete: 'completo',
          origem_cidade: formData.origem_cidade,
          origem_estado: formData.origem_estado,
          tipo_mercadoria: formData.tipo_mercadoria,
          peso_carga: parseFloat(formData.peso_carga) || null,
          valor_carga: parseFloat(formData.valor_carga) || null,
          data_coleta: formData.data_coleta || null,
          data_entrega: formData.data_entrega || null,
          horario_carregamento: formData.horario_carregamento || null,
          paradas: paradaData,
          tipos_veiculos: formData.tipos_veiculos,
          tipos_carrocerias: formData.tipos_carrocerias,
          precisa_ajudante: formData.precisa_ajudante,
          precisa_rastreador: formData.precisa_rastreador,
          precisa_seguro: formData.precisa_seguro,
          pedagio_pago_por: formData.pedagio_pago_por || null,
          pedagio_direcao: formData.pedagio_direcao || null,
          observacoes: formData.observacoes || null,
          collaborator_ids: [],
          status: 'pendente'
        });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Frete completo criado com sucesso!",
      });

      navigate('/company-dashboard');
    } catch (error) {
      console.error('Erro ao criar frete:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar frete. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/freight-request');
  };

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
                <p className="text-sm text-gray-600">Carga completa com múltiplas paradas</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="origem_cidade">Cidade de Origem *</Label>
                  <Input
                    id="origem_cidade"
                    value={formData.origem_cidade}
                    onChange={(e) => setFormData(prev => ({...prev, origem_cidade: e.target.value}))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="origem_estado">Estado de Origem *</Label>
                  <Input
                    id="origem_estado"
                    value={formData.origem_estado}
                    onChange={(e) => setFormData(prev => ({...prev, origem_estado: e.target.value}))}
                    maxLength={2}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tipo_mercadoria">Tipo de Mercadoria *</Label>
                <Input
                  id="tipo_mercadoria"
                  value={formData.tipo_mercadoria}
                  onChange={(e) => setFormData(prev => ({...prev, tipo_mercadoria: e.target.value}))}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="peso_carga">Peso da Carga (kg)</Label>
                  <Input
                    id="peso_carga"
                    type="number"
                    value={formData.peso_carga}
                    onChange={(e) => setFormData(prev => ({...prev, peso_carga: e.target.value}))}
                  />
                </div>
                <div>
                  <Label htmlFor="valor_carga">Valor da Carga (R$)</Label>
                  <Input
                    id="valor_carga"
                    type="number"
                    value={formData.valor_carga}
                    onChange={(e) => setFormData(prev => ({...prev, valor_carga: e.target.value}))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Paradas */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Paradas de Entrega</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Adicione as paradas na sequência desejada. Você pode arrastar e soltar para reordenar.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={addParada}
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Parada</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {formData.paradas.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
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

          {/* Requisitos do Veículo */}
          <Card>
            <CardHeader>
              <CardTitle>Requisitos do Veículo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="precisa_ajudante"
                    checked={formData.precisa_ajudante}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({...prev, precisa_ajudante: checked as boolean}))
                    }
                  />
                  <Label htmlFor="precisa_ajudante">Precisa de ajudante</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="precisa_rastreador"
                    checked={formData.precisa_rastreador}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({...prev, precisa_rastreador: checked as boolean}))
                    }
                  />
                  <Label htmlFor="precisa_rastreador">Precisa de rastreador</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="precisa_seguro"
                    checked={formData.precisa_seguro}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({...prev, precisa_seguro: checked as boolean}))
                    }
                  />
                  <Label htmlFor="precisa_seguro">Precisa de seguro</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          <Card>
            <CardHeader>
              <CardTitle>Observações Gerais</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({...prev, observacoes: e.target.value}))}
                placeholder="Informações adicionais sobre o frete..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || formData.paradas.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Criando...' : 'Criar Frete Completo'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default FreightCompleteForm;
