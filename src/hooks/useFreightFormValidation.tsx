
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface ValidationErrors {
  collaborators?: string;
  origem?: string;
  paradas?: string;
  dataColeta?: string;
  horarioColeta?: string;
  tiposVeiculos?: string;
  tiposCarrocerias?: string;
  tipoValor?: string;
  valorOfertado?: string;
  pedagioPagoPor?: string;
  pedagioDirecao?: string;
}

export interface FreightFormData {
  selectedCollaborators: string[];
  origem: {
    estado: string;
    cidade: string;
  };
  paradas: Array<{ id: string; estado: string; cidade: string }>;
  dataColeta: string;
  horarioColeta: string;
  dimensoes: {
    altura: string;
    largura: string;
    comprimento: string;
  };
  peso: string;
  tiposVeiculos: Array<{ id: string; type: string; category: 'heavy' | 'medium' | 'light'; selected: boolean }>;
  tiposCarrocerias: Array<{ id: string; type: string; category: 'closed' | 'open' | 'special'; selected: boolean }>;
  tipoValor: string;
  valorOfertado: string;
  pedagioPagoPor: string;
  pedagioDirecao: string;
  precisaSeguro: boolean;
  precisaAjudante: boolean;
  precisaRastreador: boolean;
  observacoes: string;
}

export const useFreightFormValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const { toast } = useToast();

  const validateStep1 = useCallback((formData: FreightFormData): boolean => {
    const newErrors: ValidationErrors = {};

    if (formData.selectedCollaborators.length === 0) {
      newErrors.collaborators = 'Selecione pelo menos um colaborador responsável';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios antes de continuar",
        variant: "destructive",
      });
      return false;
    }

    return true;
  }, [toast]);

  const validateStep2 = useCallback((formData: FreightFormData): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.origem.estado || !formData.origem.cidade) {
      newErrors.origem = 'Selecione o estado e cidade de origem';
    }

    if (formData.paradas.length === 0) {
      newErrors.paradas = 'Adicione pelo menos uma parada no trajeto';
    } else {
      const invalidParadas = formData.paradas.some(parada => !parada.estado || !parada.cidade);
      if (invalidParadas) {
        newErrors.paradas = 'Preencha estado e cidade para todas as paradas';
      }

      // Check for duplicate paradas
      const paradaKeys = formData.paradas.map(p => `${p.estado}-${p.cidade}`);
      const uniqueParadas = new Set(paradaKeys);
      if (paradaKeys.length !== uniqueParadas.size) {
        newErrors.paradas = 'Não é possível adicionar paradas duplicadas';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios antes de continuar",
        variant: "destructive",
      });
      return false;
    }

    return true;
  }, [toast]);

  const validateStep3 = useCallback((formData: FreightFormData): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.dataColeta) {
      newErrors.dataColeta = 'Selecione a data de coleta';
    } else {
      const selectedDate = new Date(formData.dataColeta);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.dataColeta = 'A data de coleta não pode ser no passado';
      }
    }

    if (!formData.horarioColeta) {
      newErrors.horarioColeta = 'Selecione o horário de coleta';
    }

    if (formData.tiposVeiculos.length === 0) {
      newErrors.tiposVeiculos = 'Selecione pelo menos um tipo de veículo';
    }

    if (formData.tiposCarrocerias.length === 0) {
      newErrors.tiposCarrocerias = 'Selecione pelo menos um tipo de carroceria';
    }

    if (!formData.tipoValor) {
      newErrors.tipoValor = 'Selecione como será definido o valor do frete';
    } else if (formData.tipoValor === 'valor') {
      if (!formData.valorOfertado || parseFloat(formData.valorOfertado) <= 0) {
        newErrors.valorOfertado = 'Informe um valor válido maior que zero';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios antes de continuar",
        variant: "destructive",
      });
      return false;
    }

    return true;
  }, [toast]);

  const validateStep4 = useCallback((formData: FreightFormData): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.pedagioPagoPor) {
      newErrors.pedagioPagoPor = 'Selecione quem pagará o pedágio';
    } else if (formData.pedagioPagoPor === 'empresa' && !formData.pedagioDirecao) {
      newErrors.pedagioDirecao = 'Selecione a direção do pedágio quando a empresa paga';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios antes de finalizar",
        variant: "destructive",
      });
      return false;
    }

    return true;
  }, [toast]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validateStep1,
    validateStep2,
    validateStep3,
    validateStep4,
    clearErrors
  };
};
