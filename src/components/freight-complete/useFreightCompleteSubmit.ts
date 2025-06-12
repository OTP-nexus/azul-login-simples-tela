
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FreightFormDataComplete, GeneratedFreightComplete, VehiclePriceTableComplete } from './types';

export const useFreightCompleteSubmit = () => {
  const { toast } = useToast();
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(false);
  const [generatedFreights, setGeneratedFreights] = useState<GeneratedFreightComplete[]>([]);

  const handleSubmit = async (formData: FreightFormDataComplete, vehiclePriceTables: VehiclePriceTableComplete[]) => {
    setShowLoadingAnimation(true);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        throw new Error('Usuário não autenticado');
      }

      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', userData.user.id)
        .single();

      if (companyError || !companyData) {
        throw new Error('Empresa não encontrada');
      }

      const baseFreightData = {
        company_id: companyData.id,
        collaborator_ids: formData.collaborator_ids,
        origem_cidade: formData.origem_cidade,
        origem_estado: formData.origem_estado,
        tipo_mercadoria: formData.tipo_mercadoria,
        tipos_veiculos: formData.tipos_veiculos.filter(v => v.selected) as any,
        tipos_carrocerias: formData.tipos_carrocerias.filter(b => b.selected) as any,
        regras_agendamento: formData.regras_agendamento as any,
        beneficios: formData.beneficios as any,
        horario_carregamento: formData.horario_carregamento || null,
        precisa_ajudante: formData.precisa_ajudante,
        precisa_rastreador: formData.precisa_rastreador,
        precisa_seguro: formData.precisa_seguro,
        pedagio_pago_por: formData.pedagio_pago_por || null,
        pedagio_direcao: formData.pedagio_direcao || null,
        observacoes: formData.observacoes || null,
        tipo_frete: 'completo'
      };

      const createdFreights: GeneratedFreightComplete[] = [];

      for (const destino of formData.destinos) {
        const freightData = {
          ...baseFreightData,
          destinos: [destino] as any
        };

        const { data: freight, error: freightError } = await supabase
          .from('fretes')
          .insert(freightData)
          .select('id, codigo_agregamento')
          .single();

        if (freightError) {
          console.error('Erro ao criar frete:', freightError);
          throw freightError;
        }

        if (freight) {
          createdFreights.push({
            id: freight.id,
            codigo_agregamento: freight.codigo_agregamento || 'N/A',
            destino_cidade: destino.city,
            destino_estado: destino.state
          });

          for (const table of vehiclePriceTables) {
            for (const range of table.ranges) {
              await supabase
                .from('freight_price_tables')
                .insert({
                  frete_id: freight.id,
                  vehicle_type: table.vehicleType,
                  km_start: range.kmStart,
                  km_end: range.kmEnd,
                  price: range.price
                });
            }
          }
        }
      }

      setGeneratedFreights(createdFreights);
      setShowLoadingAnimation(false);
      
      toast({
        title: "Frete completo criado com sucesso!",
        description: `${createdFreights.length === 1 ? 'Frete criado' : `${createdFreights.length} fretes criados`} para ${createdFreights.length === 1 ? 'o destino' : 'os destinos'}.`,
      });

      return createdFreights;

    } catch (error) {
      console.error('Erro ao criar frete completo:', error);
      setShowLoadingAnimation(false);
      toast({
        title: "Erro ao criar frete",
        description: "Ocorreu um erro ao criar o frete completo. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    handleSubmit,
    showLoadingAnimation,
    setShowLoadingAnimation,
    generatedFreights,
    setGeneratedFreights
  };
};
