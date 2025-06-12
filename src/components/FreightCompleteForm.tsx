
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useEstados, useCidades } from '@/hooks/useIBGE';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import FreightCompleteVerificationDialog from './FreightCompleteVerificationDialog';
import FreightCompleteLoadingAnimation from './FreightCompleteLoadingAnimation';
import FreightCompleteSuccessDialog from './FreightCompleteSuccessDialog';
import StepOneCollaboratorsOrigin from './freight-complete/StepOneCollaboratorsOrigin';
import StepTwoDestinationsLoad from './freight-complete/StepTwoDestinationsLoad';
import { useFreightCompleteSubmit } from './freight-complete/useFreightCompleteSubmit';
import { availableVehicleTypes, availableBodyTypes } from './freight-complete/constants';
import { 
  CollaboratorComplete, 
  DestinationComplete, 
  VehicleTypeComplete, 
  BodyTypeComplete, 
  VehiclePriceTableComplete, 
  PriceRangeComplete,
  FreightFormDataComplete
} from './freight-complete/types';

const FreightCompleteForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { estados, loading: estadosLoading } = useEstados();
  const [currentStep, setCurrentStep] = useState(1);

  // Form data state
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([]);
  const [origemEstado, setOrigemEstado] = useState('');
  const [origemCidade, setOrigemCidade] = useState('');
  const [destinos, setDestinos] = useState<DestinationComplete[]>([]);
  const [destinoEstado, setDestinoEstado] = useState('');
  const [destinoCidade, setDestinoCidade] = useState('');
  const [tipoMercadoria, setTipoMercadoria] = useState('');
  const [tiposVeiculos, setTiposVeiculos] = useState<VehicleTypeComplete[]>([]);
  const [tiposCarrocerias, setTiposCarrocerias] = useState<BodyTypeComplete[]>([]);
  const [vehiclePriceTables, setVehiclePriceTables] = useState<VehiclePriceTableComplete[]>([]);
  const [regrasAgendamento, setRegrasAgendamento] = useState<string[]>([]);
  const [beneficios, setBeneficios] = useState<string[]>([]);
  const [horarioCarregamento, setHorarioCarregamento] = useState('');
  const [precisaAjudante, setPrecisaAjudante] = useState(false);
  const [precisaRastreador, setPrecisaRastreador] = useState(false);
  const [precisaSeguro, setPrecisaSeguro] = useState(false);
  const [pedagogioPagoPor, setPedagogioPagoPor] = useState('');
  const [pedagogioDirecao, setPedagogioDirecao] = useState('');
  const [observacoes, setObservacoes] = useState('');
  
  // Dialog states
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const { cidades: origemCidades, loading: origemCidadesLoading } = useCidades(origemEstado);
  const { cidades: destinoCidades, loading: destinoCidadesLoading } = useCidades(destinoEstado);

  const { 
    handleSubmit: submitFreight, 
    showLoadingAnimation, 
    setShowLoadingAnimation,
    generatedFreights, 
    setGeneratedFreights 
  } = useFreightCompleteSubmit();

  // Fetch collaborators
  const { data: collaborators = [], isLoading: collaboratorsLoading } = useQuery({
    queryKey: ['collaborators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collaborators')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as CollaboratorComplete[];
    }
  });

  const handleAddDestino = () => {
    if (destinoEstado && destinoCidade) {
      const novoDestino: DestinationComplete = {
        id: Date.now().toString(),
        state: destinoEstado,
        city: destinoCidade
      };
      setDestinos([...destinos, novoDestino]);
      setDestinoEstado('');
      setDestinoCidade('');
    }
  };

  const handleRemoveDestino = (id: string) => {
    setDestinos(destinos.filter(d => d.id !== id));
  };

  const getFormData = (): FreightFormDataComplete => ({
    collaborator_ids: selectedCollaborators,
    origem_cidade: origemCidade,
    origem_estado: origemEstado,
    destinos,
    tipo_mercadoria: tipoMercadoria,
    tipos_veiculos: tiposVeiculos,
    tipos_carrocerias: tiposCarrocerias,
    vehicle_price_tables: vehiclePriceTables,
    regras_agendamento: regrasAgendamento,
    beneficios,
    horario_carregamento: horarioCarregamento,
    precisa_ajudante: precisaAjudante,
    precisa_rastreador: precisaRastreador,
    precisa_seguro: precisaSeguro,
    pedagio_pago_por: pedagogioPagoPor,
    pedagio_direcao: pedagogioDirecao,
    observacoes
  });

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return selectedCollaborators.length > 0 && origemCidade && origemEstado;
      case 2:
        return destinos.length > 0 && tipoMercadoria;
      case 3:
        return tiposVeiculos.some(v => v.selected);
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        setShowVerificationDialog(true);
      }
    } else {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios antes de continuar.",
        variant: "destructive"
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBack = () => {
    navigate('/freight-request');
  };

  const handleSubmit = async () => {
    setShowVerificationDialog(false);
    try {
      const createdFreights = await submitFreight(getFormData(), vehiclePriceTables);
      setGeneratedFreights(createdFreights);
      setShowSuccessDialog(true);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleNewFreight = () => {
    setShowSuccessDialog(false);
    window.location.reload();
  };

  const handleBackToDashboard = () => {
    navigate('/company-dashboard');
  };

  React.useEffect(() => {
    if (availableVehicleTypes.length > 0 && tiposVeiculos.length === 0) {
      setTiposVeiculos(availableVehicleTypes);
    }
    if (availableBodyTypes.length > 0 && tiposCarrocerias.length === 0) {
      setTiposCarrocerias(availableBodyTypes);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
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
                <p className="text-sm text-gray-600">Solicitação de frete completo</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Etapa {currentStep} de 4
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
                    {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step 1: Collaborators and Origin */}
        {currentStep === 1 && (
          <StepOneCollaboratorsOrigin
            collaborators={collaborators}
            collaboratorsLoading={collaboratorsLoading}
            selectedCollaborators={selectedCollaborators}
            setSelectedCollaborators={setSelectedCollaborators}
            origemEstado={origemEstado}
            setOrigemEstado={setOrigemEstado}
            origemCidade={origemCidade}
            setOrigemCidade={setOrigemCidade}
            estados={estados}
            origemCidades={origemCidades}
          />
        )}

        {/* Step 2: Destinations and Load */}
        {currentStep === 2 && (
          <StepTwoDestinationsLoad
            destinos={destinos}
            destinoEstado={destinoEstado}
            setDestinoEstado={setDestinoEstado}
            destinoCidade={destinoCidade}
            setDestinoCidade={setDestinoCidade}
            handleAddDestino={handleAddDestino}
            handleRemoveDestino={handleRemoveDestino}
            tipoMercadoria={tipoMercadoria}
            setTipoMercadoria={setTipoMercadoria}
            estados={estados}
            destinoCidades={destinoCidades}
          />
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-8">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </Button>
          <Button
            onClick={handleNext}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center space-x-2"
          >
            <span>{currentStep === 4 ? 'Revisar Pedido' : 'Próxima'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </main>

      {/* Dialogs */}
      <FreightCompleteVerificationDialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
        formData={getFormData()}
        collaborators={collaborators}
        onEdit={() => setShowVerificationDialog(false)}
        onConfirm={handleSubmit}
        loading={false}
      />

      <FreightCompleteLoadingAnimation open={showLoadingAnimation} />

      <FreightCompleteSuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        generatedFreights={generatedFreights}
        onNewFreight={handleNewFreight}
        onBackToDashboard={handleBackToDashboard}
      />
    </div>
  );
};

export default FreightCompleteForm;
