import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  complemento: string;
  bairro: string;
  observacoes: string;
}

const SortableParadaCard = ({ parada, index, onUpdate, onRemove }: {
  parada: Parada;
  index: number;
  onUpdate: (index: number, field: keyof Parada, value: string) => void;
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
                placeholder="Ex: SP, RJ, MG"
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
                placeholder="Nome da rua/avenida"
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
                value={parada.complemento}
                onChange={(e) => onUpdate(index, 'complemento', e.target.value)}
                placeholder="Apto 101, Bloco A"
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

          <div>
            <Label htmlFor={`parada-observacoes-${index}`}>Observações</Label>
            <Textarea
              id={`parada-observacoes-${index}`}
              value={parada.observacoes}
              onChange={(e) => onUpdate(index, 'observacoes', e.target.value)}
              placeholder="Informações adicionais sobre esta parada"
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [origemCidade, setOrigemCidade] = useState('');
  const [origemEstado, setOrigemEstado] = useState('');
  const [tipoMercadoria, setTipoMercadoria] = useState('');
  const [pesoCarga, setPesoCarga] = useState('');
  const [valorCarga, setValorCarga] = useState('');
  const [dataColeta, setDataColeta] = useState('');
  const [dataEntrega, setDataEntrega] = useState('');
  const [horarioCarregamento, setHorarioCarregamento] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [precisaAjudante, setPrecisaAjudante] = useState(false);
  const [precisaRastreador, setPrecisaRastreador] = useState(false);
  const [precisaSeguro, setPrecisaSeguro] = useState(false);

  // Updated state for paradas instead of destinos
  const [paradas, setParadas] = useState<Parada[]>([
    {
      id: '1',
      cidade: '',
      estado: '',
      cep: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      observacoes: ''
    }
  ]);

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
      observacoes: ''
    };
    setParadas([...paradas, newParada]);
  };

  const removeParada = (index: number) => {
    if (paradas.length > 1) {
      setParadas(paradas.filter((_, i) => i !== index));
    } else {
      toast({
        title: "Atenção",
        description: "É necessário ter pelo menos uma parada.",
        variant: "destructive",
      });
    }
  };

  const updateParada = (index: number, field: keyof Parada, value: string) => {
    const updatedParadas = [...paradas];
    updatedParadas[index] = { ...updatedParadas[index], [field]: value };
    setParadas(updatedParadas);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setParadas((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const validateForm = () => {
    if (!origemCidade || !origemEstado) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha a cidade e estado de origem.",
        variant: "destructive",
      });
      return false;
    }

    if (!tipoMercadoria) {
      toast({
        title: "Erro de validação",
        description: "Por favor, informe o tipo de mercadoria.",
        variant: "destructive",
      });
      return false;
    }

    // Validate paradas
    for (let i = 0; i < paradas.length; i++) {
      const parada = paradas[i];
      if (!parada.cidade || !parada.estado || !parada.cep || !parada.endereco || !parada.numero || !parada.bairro) {
        toast({
          title: "Erro de validação",
          description: `Por favor, preencha todos os campos obrigatórios da Parada ${i + 1}.`,
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não autenticado.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get user's company
      const { data: companies, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (companyError || !companies) {
        throw new Error('Empresa não encontrada');
      }

      // Create a single freight request with all paradas
      const freightData = {
        company_id: companies.id,
        collaborator_ids: [],
        tipo_frete: 'completo',
        origem_cidade: origemCidade,
        origem_estado: origemEstado,
        tipo_mercadoria: tipoMercadoria,
        peso_carga: pesoCarga ? parseFloat(pesoCarga) : null,
        valor_carga: valorCarga ? parseFloat(valorCarga) : null,
        data_coleta: dataColeta || null,
        data_entrega: dataEntrega || null,
        horario_carregamento: horarioCarregamento || null,
        observacoes: observacoes || null,
        precisa_ajudante: precisaAjudante,
        precisa_rastreador: precisaRastreador,
        precisa_seguro: precisaSeguro,
        paradas: paradas, // Save all paradas as JSON
        destinos: [] // Keep empty for frete completo
      };

      const { error } = await supabase
        .from('fretes')
        .insert([freightData]);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso!",
        description: "Pedido de frete completo criado com sucesso!",
      });

      navigate('/freight-request');
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar pedido de frete. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/freight-request')}
          className="mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold">Frete Completo</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Origem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="origem-cidade">Cidade *</Label>
                <Input
                  id="origem-cidade"
                  value={origemCidade}
                  onChange={(e) => setOrigemCidade(e.target.value)}
                  placeholder="Cidade de origem"
                  required
                />
              </div>
              <div>
                <Label htmlFor="origem-estado">Estado *</Label>
                <Input
                  id="origem-estado"
                  value={origemEstado}
                  onChange={(e) => setOrigemEstado(e.target.value)}
                  placeholder="Ex: SP, RJ, MG"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Paradas Section with Drag and Drop */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Paradas</CardTitle>
              <Button
                type="button"
                onClick={addParada}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Parada
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={paradas.map(p => p.id)}
                strategy={verticalListSortingStrategy}
              >
                {paradas.map((parada, index) => (
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Mercadoria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tipo-mercadoria">Tipo de Mercadoria *</Label>
              <Input
                id="tipo-mercadoria"
                value={tipoMercadoria}
                onChange={(e) => setTipoMercadoria(e.target.value)}
                placeholder="Ex: Eletrônicos, Alimentos, Materiais de construção"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="peso-carga">Peso da Carga (kg)</Label>
                <Input
                  id="peso-carga"
                  type="number"
                  value={pesoCarga}
                  onChange={(e) => setPesoCarga(e.target.value)}
                  placeholder="1000"
                />
              </div>
              <div>
                <Label htmlFor="valor-carga">Valor da Carga (R$)</Label>
                <Input
                  id="valor-carga"
                  type="number"
                  step="0.01"
                  value={valorCarga}
                  onChange={(e) => setValorCarga(e.target.value)}
                  placeholder="5000.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="data-coleta">Data de Coleta</Label>
                <Input
                  id="data-coleta"
                  type="date"
                  value={dataColeta}
                  onChange={(e) => setDataColeta(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="data-entrega">Data de Entrega</Label>
                <Input
                  id="data-entrega"
                  type="date"
                  value={dataEntrega}
                  onChange={(e) => setDataEntrega(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="horario-carregamento">Horário de Carregamento</Label>
                <Input
                  id="horario-carregamento"
                  type="time"
                  value={horarioCarregamento}
                  onChange={(e) => setHorarioCarregamento(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Informações adicionais sobre a carga ou transporte"
                rows={3}
              />
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
                checked={precisaAjudante}
                onCheckedChange={setPrecisaAjudante}
              />
              <Label htmlFor="precisa-ajudante">Precisa de ajudante</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="precisa-rastreador"
                checked={precisaRastreador}
                onCheckedChange={setPrecisaRastreador}
              />
              <Label htmlFor="precisa-rastreador">Precisa de rastreador</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="precisa-seguro"
                checked={precisaSeguro}
                onCheckedChange={setPrecisaSeguro}
              />
              <Label htmlFor="precisa-seguro">Precisa de seguro</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/freight-request')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? 'Criando...' : 'Criar Pedido de Frete'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FreightCompleteForm;
