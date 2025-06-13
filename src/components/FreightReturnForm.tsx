import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, ArrowRight, Users, MapPin, Truck, Settings, Calendar, Package, DollarSign, Plus, X, GripVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import FreightLoadingAnimation from './FreightLoadingAnimation';
import FreightVerificationDialog from './FreightVerificationDialog';
import FreightSuccessDialog from './FreightSuccessDialog';
import { useEstados, useCidades } from '@/hooks/useIBGE';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useFreightFormValidation, FreightFormData } from '@/hooks/useFreightFormValidation';
import { formatCurrency, formatNumericInput, formatWeight, parseCurrencyValue, limitTextInput } from '@/utils/freightFormatters';
import { ErrorMessage } from '@/components/ui/error-message';

const vehicleTypes = {
  heavy: [
    { id: 'carreta', type: 'Carreta', category: 'heavy' as const },
    { id: 'carreta-ls', type: 'Carreta LS', category: 'heavy' as const },
    { id: 'vanderleia', type: 'Vanderléia', category: 'heavy' as const },
    { id: 'bitrem', type: 'Bitrem', category: 'heavy' as const },
    { id: 'rodotrem', type: 'Rodotrem', category: 'heavy' as const }
  ],
  medium: [
    { id: 'truck', type: 'Truck', category: 'medium' as const },
    { id: 'bitruck', type: 'Bitruck', category: 'medium' as const },
    { id: 'toco', type: 'Toco', category: 'medium' as const }
  ],
  light: [
    { id: 'fiorino', type: 'Fiorino', category: 'light' as const },
    { id: 'vlc', type: 'VLC', category: 'light' as const },
    { id: 'tres-quartos', type: '3/4', category: 'light' as const },
    { id: 'van', type: 'Van', category: 'light' as const },
    { id: 'hr', type: 'HR (Hyundai HR)', category: 'light' as const },
    { id: 'utilitario', type: 'Utilitário', category: 'light' as const },
    { id: 'kombi', type: 'Kombi', category: 'light' as const },
    { id: 'moto', type: 'Moto', category: 'light' as const }
  ]
};

const bodyTypes = {
  open: [
    { id: 'graneleiro', type: 'Graneleiro', category: 'open' as const },
    { id: 'grade-baixa', type: 'Grade Baixa', category: 'open' as const },
    { id: 'prancha', type: 'Prancha', category: 'open' as const },
    { id: 'cacamba', type: 'Caçamba', category: 'open' as const },
    { id: 'plataforma', type: 'Plataforma', category: 'open' as const }
  ],
  closed: [
    { id: 'sider', type: 'Sider', category: 'closed' as const },
    { id: 'bau', type: 'Baú', category: 'closed' as const },
    { id: 'bau-frigorifico', type: 'Baú Frigorífico', category: 'closed' as const },
    { id: 'bau-refrigerado', type: 'Baú Refrigerado', category: 'closed' as const }
  ],
  special: [
    { id: 'silo', type: 'Silo', category: 'special' as const },
    { id: 'cegonheiro', type: 'Cegonheiro', category: 'special' as const },
    { id: 'gaiola', type: 'Gaiola', category: 'special' as const },
    { id: 'tanque', type: 'Tanque', category: 'special' as const },
    { id: 'bug-porta-container', type: 'Bug Porta Container', category: 'special' as const },
    { id: 'munk', type: 'Munk', category: 'special' as const },
    { id: 'apenas-cavalo', type: 'Apenas Cavalo', category: 'special' as const },
    { id: 'cavaqueira', type: 'Cavaqueira', category: 'special' as const },
    { id: 'hopper', type: 'Hopper', category: 'special' as const },
    { id: 'cegonha', type: 'Cegonha', category: 'special' as const },
    { id: 'porta-container', type: 'Porta Container', category: 'special' as const }
  ]
};

const FreightReturnForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [generatedFreights, setGeneratedFreights] = useState([]);

  const {
    errors,
    validateStep1,
    validateStep2,
    validateStep3,
    validateStep4,
    clearErrors
  } = useFreightFormValidation();

  const [formData, setFormData] = useState<FreightFormData>({
    selectedCollaborators: [] as string[],
    origem: {
      estado: '',
      cidade: ''
    },
    paradas: [] as Array<{ id: string; estado: string; cidade: string }>,
    dataColeta: '',
    horarioColeta: '',
    dimensoes: {
      altura: '',
      largura: '',
      comprimento: ''
    },
    peso: '',
    tiposVeiculos: [] as Array<{ id: string; type: string; category: 'heavy' | 'medium' | 'light'; selected: boolean }>,
    tiposCarrocerias: [] as Array<{ id: string; type: string; category: 'closed' | 'open' | 'special'; selected: boolean }>,
    tipoValor: '',
    valorOfertado: '',
    pedagioPagoPor: '',
    pedagioDirecao: '',
    precisaSeguro: false,
    precisaAjudante: false,
    precisaRastreador: false,
    observacoes: ''
  });

  const { estados } = useEstados();
  const { cidades: cidadesOrigem } = useCidades(formData.origem.estado);

  const handleSubmit = async () => {
    if (!validateStep4(formData)) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!company) throw new Error('Empresa não encontrada');

      const destinos = formData.paradas.map((parada, index) => ({
        id: parada.id || index.toString(),
        state: parada.estado,
        city: parada.cidade
      }));

      const valoresDefinidos = formData.tipoValor === 'valor' ? {
        tipo: 'valor_fixo',
        valor: formData.valorOfertado ? parseFloat(formData.valorOfertado) : 0
      } : {
        tipo: 'a_combinar'
      };

      const freightData = {
        company_id: company.id,
        tipo_frete: 'frete_de_retorno',
        origem_estado: formData.origem.estado,
        origem_cidade: formData.origem.cidade,
        destinos: destinos,
        tipo_mercadoria: 'Geral',
        paradas: formData.paradas.map(parada => ({
          estado: parada.estado,
          cidade: parada.cidade,
          ordem: formData.paradas.indexOf(parada) + 1
        })),
        data_coleta: formData.dataColeta || null,
        horario_carregamento: formData.horarioColeta || null,
        peso_carga: formData.peso ? parseFloat(formData.peso.replace(/\./g, '')) : null,
        tipos_veiculos: formData.tiposVeiculos,
        tipos_carrocerias: formData.tiposCarrocerias,
        valores_definidos: valoresDefinidos,
        precisa_ajudante: formData.precisaAjudante,
        precisa_rastreador: formData.precisaRastreador,
        precisa_seguro: formData.precisaSeguro,
        pedagio_pago_por: formData.pedagioPagoPor,
        pedagio_direcao: formData.pedagioPagoPor === 'motorista' ? null : formData.pedagioDirecao || null,
        observacoes: formData.observacoes,
        collaborator_ids: formData.selectedCollaborators,
        status: 'ativo'
      };

      console.log('Dados do frete a serem salvos:', freightData);

      const { data, error } = await supabase
        .from('fretes')
        .insert([freightData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar frete:', error);
        throw error;
      }

      console.log('Frete salvo com sucesso:', data);

      const generatedFreightsList = [{
        id: data.id,
        codigo_agregamento: data.codigo_agregamento || `FRR-${Date.now()}`,
        destino_cidade: formData.paradas[0]?.cidade || 'N/A',
        destino_estado: formData.paradas[0]?.estado || 'N/A'
      }];

      setGeneratedFreights(generatedFreightsList);
      setIsSubmitting(false);
      setShowVerificationDialog(false);
      setShowSuccessDialog(true);

      toast({
        title: "Sucesso!",
        description: "Frete de retorno criado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao criar frete de retorno:', error);
      setIsSubmitting(false);
      setShowVerificationDialog(false);
      toast({
        title: "Erro",
        description: `Erro ao criar frete de retorno: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => navigate('/freight-request')}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Frete de Retorno</h1>
                <p className="text-sm text-gray-600">Etapa {currentStep} de 4</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Steps and other UI elements */}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Form steps and content */}
      </main>

      <FreightVerificationDialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
        formData={formData}
        collaborators={[]} // Pass collaborators if needed
        onEdit={() => setShowVerificationDialog(false)}
        onConfirm={handleSubmit}
        loading={isSubmitting}
      />

      <FreightSuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        generatedFreights={generatedFreights}
        onNewFreight={() => {
          setShowSuccessDialog(false);
          setCurrentStep(1);
          setFormData({
            selectedCollaborators: [],
            origem: { estado: '', cidade: '' },
            paradas: [],
            dataColeta: '',
            horarioColeta: '',
            dimensoes: { altura: '', largura: '', comprimento: '' },
            peso: '',
            tiposVeiculos: [],
            tiposCarrocerias: [],
            tipoValor: '',
            valorOfertado: '',
            pedagioPagoPor: '',
            pedagioDirecao: '',
            precisaSeguro: false,
            precisaAjudante: false,
            precisaRastreador: false,
            observacoes: ''
          });
        }}
        onBackToDashboard={() => {
          setShowSuccessDialog(false);
          navigate('/company-dashboard');
        }}
      />
    </div>
  );
};

export default FreightReturnForm;
