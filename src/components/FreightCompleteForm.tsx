import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, MapPin, Package, Truck, Calendar, DollarSign, FileText, AlertTriangle, Settings, Users } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEstados, useCidades } from '@/hooks/useIBGE';
import { freightOptions } from '@/lib/freightOptions';
import FreightConfirmationDialog from './FreightConfirmationDialog';
import FreightSuccessDialog from './FreightSuccessDialog';

interface FormData {
  origem_cidade: string;
  origem_estado: string;
  destino_cidade: string;
  destino_estado: string;
  tipo_mercadoria: string;
  peso_carga: string;
  altura_carga: string;
  largura_carga: string;
  comprimento_carga: string;
  valores_definidos: {
    frete: string;
    pedagio: string;
    combustivel: string;
    seguro: string;
    outros: string;
  };
  data_coleta: string;
  data_entrega: string;
  horario_carregamento: string;
  tipos_veiculos: string[];
  tipos_carrocerias: string[];
  precisa_seguro: boolean;
  precisa_rastreador: boolean;
  precisa_ajudante: boolean;
  pedagio_pago_por: string;
  observacoes: string;
  collaborator_ids: string[];
}

const FreightCompleteForm = () => {
  const [formData, setFormData] = useState<FormData>({
    origem_cidade: '',
    origem_estado: '',
    destino_cidade: '',
    destino_estado: '',
    tipo_mercadoria: '',
    peso_carga: '',
    altura_carga: '',
    largura_carga: '',
    comprimento_carga: '',
    valores_definidos: {
      frete: '',
      pedagio: '',
      combustivel: '',
      seguro: '',
      outros: '',
    },
    data_coleta: '',
    data_entrega: '',
    horario_carregamento: '',
    tipos_veiculos: [],
    tipos_carrocerias: [],
    precisa_seguro: false,
    precisa_rastreador: false,
    precisa_ajudante: false,
    pedagio_pago_por: '',
    observacoes: '',
    collaborator_ids: [],
  });

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdFreight, setCreatedFreight] = useState(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { estados: estadosOrigem } = useEstados();
  const { cidades: cidadesOrigem } = useCidades(formData.origem_estado);
  const { cidades: cidadesDestino } = useCidades(formData.destino_estado);
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([]);
  const [selectedBodyTypes, setSelectedBodyTypes] = useState<string[]>([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([]);
  const [availableCollaborators, setAvailableCollaborators] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchCollaborators = async () => {
      if (!user) return;

      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (companyError || !company) {
        console.error("Erro ao buscar empresa:", companyError);
        toast({
          title: "Erro",
          description: "Erro ao buscar empresa. Verifique o console para mais detalhes.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('collaborators')
        .select('*')
        .eq('company_id', company.id);

      if (error) {
        console.error("Erro ao buscar colaboradores:", error);
        toast({
          title: "Erro",
          description: "Erro ao buscar colaboradores. Verifique o console para mais detalhes.",
          variant: "destructive",
        });
        return;
      }

      setAvailableCollaborators(data || []);
    };

    fetchCollaborators();
  }, [user, toast]);

  const handleVehicleTypeChange = (vehicleType: string) => {
    setSelectedVehicleTypes((prev) => {
      if (prev.includes(vehicleType)) {
        return prev.filter((type) => type !== vehicleType);
      } else {
        return [...prev, vehicleType];
      }
    });
    setFormData((prev) => ({
      ...prev,
      tipos_veiculos: selectedVehicleTypes,
    }));
  };

  const handleBodyTypeChange = (bodyType: string) => {
    setSelectedBodyTypes((prev) => {
      if (prev.includes(bodyType)) {
        return prev.filter((type) => type !== bodyType);
      } else {
        return [...prev, bodyType];
      }
    });
    setFormData((prev) => ({
      ...prev,
      tipos_carrocerias: selectedBodyTypes,
    }));
  };

  const handleCollaboratorChange = (collaboratorId: string) => {
    setSelectedCollaborators((prev) => {
      if (prev.includes(collaboratorId)) {
        return prev.filter((id) => id !== collaboratorId);
      } else {
        return [...prev, collaboratorId];
      }
    });
    setFormData((prev) => ({
      ...prev,
      collaborator_ids: selectedCollaborators,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return;
      }

      // Buscar company_id
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (companyError || !company) {
        toast({
          title: "Erro",
          description: "Empresa não encontrada",
          variant: "destructive",
        });
        return;
      }

      const freightData = {
        tipo_frete: 'frete_completo',
        company_id: company.id,
        origem_cidade: formData.origem_cidade,
        origem_estado: formData.origem_estado,
        destinos: [
          {
            cidade: formData.destino_cidade,
            estado: formData.destino_estado
          }
        ],
        tipo_mercadoria: formData.tipo_mercadoria,
        peso_carga: formData.peso_carga ? parseFloat(formData.peso_carga) : null,
        altura_carga: formData.altura_carga ? parseFloat(formData.altura_carga) : null,
        largura_carga: formData.largura_carga ? parseFloat(formData.largura_carga) : null,
        comprimento_carga: formData.comprimento_carga ? parseFloat(formData.comprimento_carga) : null,
        valores_definidos: formData.valores_definidos,
        data_coleta: formData.data_coleta || null,
        data_entrega: formData.data_entrega || null,
        horario_carregamento: formData.horario_carregamento || null,
        tipos_veiculos: formData.tipos_veiculos,
        tipos_carrocerias: formData.tipos_carrocerias,
        precisa_seguro: formData.precisa_seguro,
        precisa_rastreador: formData.precisa_rastreador,
        precisa_ajudante: formData.precisa_ajudante,
        pedagio_pago_por: formData.pedagio_pago_por || null,
        observacoes: formData.observacoes || null,
        collaborator_ids: formData.collaborator_ids.length > 0 ? formData.collaborator_ids : null,
        status: 'ativo'
      };

      const { data: newFreight, error } = await supabase
        .from('fretes')
        .insert([freightData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar frete:', error);
        toast({
          title: "Erro ao criar frete",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      console.log('Frete criado com sucesso:', newFreight);
      setCreatedFreight(newFreight);
      setShowSuccessDialog(true);

    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao criar o frete. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Cadastrar Frete Completo</CardTitle>
        </CardHeader>
      </Card>

      <form onSubmit={(e) => { e.preventDefault(); setShowConfirmDialog(true); }} className="space-y-6">
        {/* Informações de Origem */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Origem</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="origem_estado">Estado de Origem *</Label>
              <Select value={formData.origem_estado} onValueChange={(value) => {
                setFormData(prev => ({ ...prev, origem_estado: value, origem_cidade: '' }));
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado de origem" />
                </SelectTrigger>
                <SelectContent>
                  {estadosOrigem.map((estado) => (
                    <SelectItem key={estado.sigla} value={estado.sigla}>{estado.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="origem_cidade">Cidade de Origem *</Label>
              <Select disabled={!formData.origem_estado} value={formData.origem_cidade} onValueChange={(value) =>
                setFormData(prev => ({ ...prev, origem_cidade: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a cidade de origem" />
                </SelectTrigger>
                <SelectContent>
                  {cidadesOrigem.map((cidade) => (
                    <SelectItem key={cidade.nome} value={cidade.nome}>{cidade.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Informações de Destino */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Destino</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="destino_estado">Estado de Destino *</Label>
              <Select value={formData.destino_estado} onValueChange={(value) => {
                setFormData(prev => ({ ...prev, destino_estado: value, destino_cidade: '' }));
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado de destino" />
                </SelectTrigger>
                <SelectContent>
                  {estadosOrigem.map((estado) => (
                    <SelectItem key={estado.sigla} value={estado.sigla}>{estado.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="destino_cidade">Cidade de Destino *</Label>
              <Select disabled={!formData.destino_estado} value={formData.destino_cidade} onValueChange={(value) =>
                setFormData(prev => ({ ...prev, destino_cidade: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a cidade de destino" />
                </SelectTrigger>
                <SelectContent>
                  {cidadesDestino.map((cidade) => (
                    <SelectItem key={cidade.nome} value={cidade.nome}>{cidade.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Detalhes da Carga */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Detalhes da Carga</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tipo_mercadoria">Tipo de Mercadoria *</Label>
              <Select value={formData.tipo_mercadoria} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, tipo_mercadoria: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de mercadoria" />
                </SelectTrigger>
                <SelectContent>
                  {freightOptions.tiposMercadoria.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="peso_carga">Peso da Carga (kg)</Label>
                <Input
                  id="peso_carga"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.peso_carga}
                  onChange={(e) => setFormData(prev => ({ ...prev, peso_carga: e.target.value }))}
                  placeholder="Ex: 1500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="altura_carga">Altura (m)</Label>
                <Input
                  id="altura_carga"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.altura_carga}
                  onChange={(e) => setFormData(prev => ({ ...prev, altura_carga: e.target.value }))}
                  placeholder="Ex: 2.5"
                />
              </div>
              <div>
                <Label htmlFor="largura_carga">Largura (m)</Label>
                <Input
                  id="largura_carga"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.largura_carga}
                  onChange={(e) => setFormData(prev => ({ ...prev, largura_carga: e.target.value }))}
                  placeholder="Ex: 2.4"
                />
              </div>
              <div>
                <Label htmlFor="comprimento_carga">Comprimento (m)</Label>
                <Input
                  id="comprimento_carga"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.comprimento_carga}
                  onChange={(e) => setFormData(prev => ({ ...prev, comprimento_carga: e.target.value }))}
                  placeholder="Ex: 6.0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custos Estimados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Custos Estimados (R$)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="frete">Frete</Label>
                <Input
                  id="frete"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valores_definidos.frete}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    valores_definidos: { ...prev.valores_definidos, frete: e.target.value }
                  }))}
                  placeholder="Ex: 1200.00"
                />
              </div>
              <div>
                <Label htmlFor="pedagio">Pedágio</Label>
                <Input
                  id="pedagio"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valores_definidos.pedagio}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    valores_definidos: { ...prev.valores_definidos, pedagio: e.target.value }
                  }))}
                  placeholder="Ex: 150.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="combustivel">Combustível</Label>
                <Input
                  id="combustivel"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valores_definidos.combustivel}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    valores_definidos: { ...prev.valores_definidos, combustivel: e.target.value }
                  }))}
                  placeholder="Ex: 300.00"
                />
              </div>
              <div>
                <Label htmlFor="seguro">Seguro</Label>
                <Input
                  id="seguro"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valores_definidos.seguro}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    valores_definidos: { ...prev.valores_definidos, seguro: e.target.value }
                  }))}
                  placeholder="Ex: 80.00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="outros">Outros Custos</Label>
              <Input
                id="outros"
                type="number"
                step="0.01"
                min="0"
                value={formData.valores_definidos.outros}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  valores_definidos: { ...prev.valores_definidos, outros: e.target.value }
                }))}
                placeholder="Ex: 50.00"
              />
            </div>
          </CardContent>
        </Card>

        {/* Agendamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Agendamento</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data_coleta">Data de Coleta</Label>
                <Input
                  id="data_coleta"
                  type="date"
                  value={formData.data_coleta}
                  onChange={(e) => setFormData(prev => ({ ...prev, data_coleta: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="data_entrega">Data de Entrega</Label>
                <Input
                  id="data_entrega"
                  type="date"
                  value={formData.data_entrega}
                  onChange={(e) => setFormData(prev => ({ ...prev, data_entrega: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="horario_carregamento">Horário de Carregamento</Label>
              <Input
                id="horario_carregamento"
                type="time"
                value={formData.horario_carregamento}
                onChange={(e) => setFormData(prev => ({ ...prev, horario_carregamento: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Veículos e Carrocerias */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Truck className="w-5 h-5" />
              <span>Veículos e Carrocerias</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tipos de Veículos Aceitos</Label>
              <div className="flex flex-wrap gap-2">
                {freightOptions.tiposVeiculos.map((tipo) => (
                  <Badge
                    key={tipo}
                    variant={selectedVehicleTypes.includes(tipo) ? "default" : "outline"}
                    onClick={() => {
                      handleVehicleTypeChange(tipo);
                      setFormData(prev => ({
                        ...prev,
                        tipos_veiculos: selectedVehicleTypes.includes(tipo)
                          ? selectedVehicleTypes.filter((t) => t !== tipo)
                          : [...selectedVehicleTypes, tipo],
                      }));
                    }}
                    className="cursor-pointer"
                  >
                    {tipo}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Tipos de Carrocerias Aceitas</Label>
              <div className="flex flex-wrap gap-2">
                {freightOptions.tiposCarrocerias.map((tipo) => (
                  <Badge
                    key={tipo}
                    variant={selectedBodyTypes.includes(tipo) ? "default" : "outline"}
                    onClick={() => {
                      handleBodyTypeChange(tipo);
                      setFormData(prev => ({
                        ...prev,
                        tipos_carrocerias: selectedBodyTypes.includes(tipo)
                          ? selectedBodyTypes.filter((t) => t !== tipo)
                          : [...selectedBodyTypes, tipo],
                      }));
                    }}
                    className="cursor-pointer"
                  >
                    {tipo}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações e Extras */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Configurações e Extras</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="precisa_seguro" checked={formData.precisa_seguro} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, precisa_seguro: checked }))} />
              <Label htmlFor="precisa_seguro">Precisa de Seguro</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="precisa_rastreador" checked={formData.precisa_rastreador} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, precisa_rastreador: checked }))} />
              <Label htmlFor="precisa_rastreador">Precisa de Rastreador</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="precisa_ajudante" checked={formData.precisa_ajudante} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, precisa_ajudante: checked }))} />
              <Label htmlFor="precisa_ajudante">Precisa de Ajudante</Label>
            </div>

            <div>
              <Label htmlFor="pedagio_pago_por">Pedágio Pago Por</Label>
              <Select value={formData.pedagio_pago_por} onValueChange={(value) => setFormData(prev => ({ ...prev, pedagio_pago_por: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="embarcador">Embarcador</SelectItem>
                  <SelectItem value="transportador">Transportador</SelectItem>
                  <SelectItem value="terceiro">Terceiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Colaboradores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Colaboradores</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Selecione os colaboradores responsáveis</Label>
              <div className="flex flex-wrap gap-2">
                {availableCollaborators.map((collaborator) => (
                  <Badge
                    key={collaborator.id}
                    variant={selectedCollaborators.includes(collaborator.id) ? "default" : "outline"}
                    onClick={() => {
                      handleCollaboratorChange(collaborator.id);
                      setFormData(prev => ({
                        ...prev,
                        collaborator_ids: selectedCollaborators.includes(collaborator.id)
                          ? selectedCollaborators.filter((id) => id !== collaborator.id)
                          : [...selectedCollaborators, collaborator.id],
                      }));
                    }}
                    className="cursor-pointer"
                  >
                    {collaborator.name}
                  </Badge>
                ))}
              </div>
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
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Observações adicionais sobre o frete"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
            />
          </CardContent>
        </Card>

        <Button disabled={isSubmitting} className="w-full" type="submit">
          {isSubmitting ? "Cadastrando..." : "Cadastrar Frete"}
        </Button>
      </form>

      <FreightConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleSubmit}
        freightData={formData}
      />

      <FreightSuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        freight={createdFreight}
      />
    </div>
  );
};

export default FreightCompleteForm;
