
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEstados, useCidades } from '@/hooks/useIBGE';
import { generateFreightCompleteCode } from '@/utils/freightCompleteUtils';
import { 
  Plus, 
  Trash2, 
  MapPin, 
  Package, 
  Truck, 
  Settings, 
  Users,
  X,
  GripVertical,
  CheckCircle
} from 'lucide-react';
import FreightCompleteVerificationDialog from './FreightCompleteVerificationDialog';
import FreightCompleteLoadingAnimation from './FreightCompleteLoadingAnimation';
import FreightCompleteSuccessDialog from './FreightCompleteSuccessDialog';

interface Stop {
  id: string;
  city: string;
  state: string;
  order: number;
}

interface VehicleType {
  id: string;
  type: string;
  category: 'heavy' | 'medium' | 'light';
  selected: boolean;
}

interface BodyType {
  id: string;
  type: string;
  category: 'open' | 'closed' | 'special';
  selected: boolean;
}

interface PriceRange {
  id: string;
  kmStart: number;
  kmEnd: number;
  price: number;
}

interface VehiclePriceTable {
  vehicleType: string;
  ranges: PriceRange[];
}

interface FreightCompleteFormData {
  collaborator_ids: string[];
  origem_cidade: string;
  origem_estado: string;
  paradas: Stop[];
  tipo_mercadoria: string;
  tipos_veiculos: VehicleType[];
  tipos_carrocerias: BodyType[];
  vehicle_price_tables: VehiclePriceTable[];
  regras_agendamento: string[];
  beneficios: string[];
  horario_carregamento: string;
  precisa_ajudante: boolean;
  precisa_rastreador: boolean;
  precisa_seguro: boolean;
  pedagio_pago_por: string;
  pedagio_direcao: string;
  observacoes: string;
}

const FreightCompleteForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { estados } = useEstados();
  const { cidades: cidadesOrigem } = useCidades(formData.origem_estado);

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
  });

  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedFreights, setGeneratedFreights] = useState<{id: string; codigo_completo: string}[]>([]);

  useEffect(() => {
    const fetchCollaborators = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('collaborators')
        .select('*')
        .eq('company_id', user.id);
      if (error) {
        toast({
          title: "Erro ao carregar colaboradores",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setCollaborators(data || []);
      }
    };
    fetchCollaborators();
  }, [user, toast]);

  const handleAddStop = () => {
    const newStop: Stop = {
      id: crypto.randomUUID(),
      city: '',
      state: '',
      order: formData.paradas.length + 1,
    };
    setFormData(prev => ({
      ...prev,
      paradas: [...prev.paradas, newStop],
    }));
  };

  const handleRemoveStop = (id: string) => {
    setFormData(prev => {
      const filtered = prev.paradas.filter(stop => stop.id !== id);
      // Reorder stops
      const reordered = filtered.map((stop, index) => ({ ...stop, order: index + 1 }));
      return { ...prev, paradas: reordered };
    });
  };

  const handleStopChange = (id: string, field: keyof Stop, value: string) => {
    setFormData(prev => {
      const updatedStops = prev.paradas.map(stop => {
        if (stop.id === id) {
          return { ...stop, [field]: value };
        }
        return stop;
      });
      return { ...prev, paradas: updatedStops };
    });
  };

  const handleSubmit = async (formData: FreightCompleteFormData) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Buscar company_id do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile) {
        throw new Error('Perfil de usuário não encontrado');
      }

      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!company) {
        throw new Error('Empresa não encontrada');
      }

      // Gerar código único para o frete completo
      const codigoCompleto = await generateFreightCompleteCode();

      // Preparar dados do frete completo - convertendo arrays para Json
      const freightData = {
        company_id: company.id,
        collaborator_ids: formData.collaborator_ids,
        tipo_frete: 'completo',
        origem_cidade: formData.origem_cidade,
        origem_estado: formData.origem_estado,
        paradas: formData.paradas as any, // Conversão para Json
        destinos: [] as any, // Manter vazio para frete completo
        tipo_mercadoria: formData.tipo_mercadoria,
        tipos_veiculos: formData.tipos_veiculos as any, // Conversão para Json
        tipos_carrocerias: formData.tipos_carrocerias as any, // Conversão para Json
        regras_agendamento: formData.regras_agendamento as any, // Conversão para Json
        beneficios: formData.beneficios as any, // Conversão para Json
        horario_carregamento: formData.horario_carregamento || null,
        precisa_ajudante: formData.precisa_ajudante,
        precisa_rastreador: formData.precisa_rastreador,
        precisa_seguro: formData.precisa_seguro,
        pedagio_pago_por: formData.pedagio_pago_por || null,
        pedagio_direcao: formData.pedagio_direcao || null,
        observacoes: formData.observacoes || null,
        codigo_agregamento: codigoCompleto, // Reutilizar coluna existente para código
        status: 'pendente'
      };

      console.log('Dados do frete completo a serem salvos:', freightData);

      // Inserir o frete completo (será apenas 1 registro)
      const { data: freightInserted, error: freightError } = await supabase
        .from('fretes')
        .insert(freightData)
        .select()
        .single();

      if (freightError) {
        console.error('Erro ao inserir frete:', freightError);
        throw freightError;
      }

      console.log('Frete completo inserido:', freightInserted);

      // Inserir tabelas de preço
      if (formData.vehicle_price_tables && formData.vehicle_price_tables.length > 0) {
        const priceTableData = formData.vehicle_price_tables.flatMap(table =>
          table.ranges.map(range => ({
            frete_id: freightInserted.id,
            vehicle_type: table.vehicleType,
            km_start: range.kmStart,
            km_end: range.kmEnd,
            price: range.price
          }))
        );

        const { error: priceTableError } = await supabase
          .from('freight_price_tables')
          .insert(priceTableData);

        if (priceTableError) {
          console.error('Erro ao inserir tabelas de preço:', priceTableError);
          throw priceTableError;
        }
      }

      // Simular delay para mostrar loading
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Preparar dados para o dialog de sucesso
      const generatedFreight = {
        id: freightInserted.id,
        codigo_completo: freightInserted.codigo_agregamento || codigoCompleto
      };

      setGeneratedFreights([generatedFreight]);
      setShowSuccessDialog(true);

      toast({
        title: "Frete completo criado com sucesso!",
        description: "Seu pedido de frete completo foi registrado e está disponível no sistema.",
      });

    } catch (error) {
      console.error('Erro ao processar frete completo:', error);
      toast({
        title: "Erro ao criar frete completo",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hook para obter cidades das paradas
  const useStopCidades = (stopState: string) => {
    return useCidades(stopState);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Cadastro de Frete Completo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Colaboradores selection */}
            <div>
              <Label>Colaboradores Responsáveis</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {collaborators.map(collab => (
                  <div key={collab.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`collab-${collab.id}`}
                      checked={formData.collaborator_ids.includes(collab.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData(prev => ({
                            ...prev,
                            collaborator_ids: [...prev.collaborator_ids, collab.id]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            collaborator_ids: prev.collaborator_ids.filter(id => id !== collab.id)
                          }));
                        }
                      }}
                    />
                    <Label htmlFor={`collab-${collab.id}`} className="text-sm">
                      {collab.name} - {collab.sector}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Origem */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Estado de Origem</Label>
                <Select
                  value={formData.origem_estado}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, origem_estado: value, origem_cidade: '' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map(estado => (
                      <SelectItem key={estado.sigla} value={estado.sigla}>
                        {estado.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cidade de Origem</Label>
                <Select
                  value={formData.origem_cidade}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, origem_cidade: value }))}
                  disabled={!formData.origem_estado}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.origem_estado && cidadesOrigem.map(cidade => (
                      <SelectItem key={cidade.nome} value={cidade.nome}>
                        {cidade.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Paradas */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Paradas</Label>
                <Button size="sm" variant="outline" onClick={handleAddStop}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Parada
                </Button>
              </div>
              {formData.paradas.length === 0 && (
                <p className="text-sm text-gray-500">Nenhuma parada adicionada.</p>
              )}
              <div className="space-y-4">
                {formData.paradas.map((stop) => {
                  const { cidades: stopCidades } = useStopCidades(stop.state);
                  
                  return (
                    <Card key={stop.id} className="p-4 flex items-center space-x-4">
                      <div className="flex flex-col w-10 items-center">
                        <GripVertical className="cursor-move" />
                        <span className="text-sm font-semibold">{stop.order}</span>
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <Select
                          value={stop.state}
                          onValueChange={(value) => handleStopChange(stop.id, 'state', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Estado" />
                          </SelectTrigger>
                          <SelectContent>
                            {estados.map(estado => (
                              <SelectItem key={estado.sigla} value={estado.sigla}>
                                {estado.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={stop.city}
                          onValueChange={(value) => handleStopChange(stop.id, 'city', value)}
                          disabled={!stop.state}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Cidade" />
                          </SelectTrigger>
                          <SelectContent>
                            {stop.state && stopCidades.map(cidade => (
                              <SelectItem key={cidade.nome} value={cidade.nome}>
                                {cidade.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveStop(stop.id)}
                        aria-label="Remover parada"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Tipo de Mercadoria */}
            <div>
              <Label>Tipo de Mercadoria</Label>
              <Input
                value={formData.tipo_mercadoria}
                onChange={(e) => setFormData(prev => ({ ...prev, tipo_mercadoria: e.target.value }))}
                placeholder="Descreva o tipo de mercadoria"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                onClick={() => setShowVerificationDialog(true)}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Processando...' : 'Verificar e Enviar'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <FreightCompleteVerificationDialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
        formData={formData}
        collaborators={collaborators}
        onEdit={() => setShowVerificationDialog(false)}
        onConfirm={() => handleSubmit(formData)}
        loading={isSubmitting}
      />

      <FreightCompleteLoadingAnimation open={isSubmitting} />

      <FreightCompleteSuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        generatedFreights={generatedFreights}
        onNewFreight={() => {
          setShowSuccessDialog(false);
          window.location.reload();
        }}
        onBackToDashboard={() => {
          window.location.href = '/company-dashboard';
        }}
      />
    </div>
  );
};

export default FreightCompleteForm;
