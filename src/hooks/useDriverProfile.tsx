import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface DriverProfileData {
  // Dados do perfil (profiles table)
  profile: {
    id: string;
    email: string;
    full_name: string;
    phone: string | null;
    role: string;
    created_at: string;
    updated_at: string;
  } | null;
  
  // Dados do motorista (drivers table) - Expandido com novos campos
  driver: {
    id: string;
    user_id: string;
    cpf: string;
    cnh: string;
    vehicle_type: string;
    // Novos campos de prioridade alta
    date_of_birth: string | null;
    cnh_categories: string[] | null;
    cnh_expiry_date: string | null;
    cep: string | null;
    street: string | null;
    number: string | null;
    complement: string | null;
    neighborhood: string | null;
    city: string | null;
    state: string | null;
    main_vehicle_plate: string | null;
    main_vehicle_model: string | null;
    main_vehicle_year: number | null;
    main_vehicle_capacity: number | null;
    // Novos campos de prioridade média
    main_vehicle_body_type: string | null;
    main_vehicle_renavam: string | null;
    main_vehicle_insurance_expiry: string | null;
    accepts_multiple_vehicles: boolean | null;
    created_at: string;
    updated_at: string;
  } | null;
  
  // Status dos documentos (document_verifications table)
  documents: {
    id: string;
    cnh_document_status: string;
    photo_status: string;
    driver_address_proof_status: string;
    overall_status: string;
    cnh_document_url: string | null;
    photo_url: string | null;
    driver_address_proof_url: string | null;
    verified_at: string | null;
    rejection_reason: string | null;
  } | null;

  // Dados de disponibilidade (driver_availability table)
  availability: {
    id: string;
    driver_id: string;
    available_days: number[] | null;
    start_time: string | null;
    end_time: string | null;
    preferred_regions: string[] | null;
    created_at: string;
    updated_at: string;
  } | null;
}

export function useDriverProfile() {
  const { user } = useAuth();
  const [data, setData] = useState<DriverProfileData>({
    profile: null,
    driver: null,
    documents: null,
    availability: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDriverProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar dados do perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setError('Erro ao buscar perfil do usuário');
        return;
      }

      // Buscar dados do motorista (pode não existir ainda)
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (driverError) {
        console.error('Error fetching driver:', driverError);
        // Não tratamos como erro fatal se não existir dados do motorista
      }

      // Buscar status dos documentos (pode não existir ainda)
      const { data: documentsData, error: documentsError } = await supabase
        .from('document_verifications')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (documentsError) {
        console.error('Error fetching documents:', documentsError);
        // Não tratamos como erro fatal se não existir verificação de documentos
      }

      // Buscar dados de disponibilidade (se o motorista existir)
      let availabilityData = null;
      if (driverData) {
        const { data: availData, error: availError } = await supabase
          .from('driver_availability')
          .select('*')
          .eq('driver_id', driverData.id)
          .maybeSingle();

        if (availError) {
          console.error('Error fetching availability:', availError);
          // Não tratamos como erro fatal
        } else {
          availabilityData = availData;
        }
      }

      setData({
        profile: profileData,
        driver: driverData,
        documents: documentsData,
        availability: availabilityData
      });

    } catch (err) {
      console.error('Error in fetchDriverProfile:', err);
      setError('Erro interno ao buscar dados do motorista');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<{ full_name: string; phone: string; }>) => {
    if (!user) return { error: 'Usuário não autenticado' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Atualizar dados locais
      setData(prev => ({
        ...prev,
        profile: prev.profile ? { ...prev.profile, ...updates } : null
      }));

      return { error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error: 'Erro ao atualizar perfil' };
    }
  };

  const updateDriver = async (updates: Partial<{
    vehicle_type: string;
    date_of_birth: string;
    cnh_categories: string[];
    cnh_expiry_date: string;
    cep: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    main_vehicle_plate: string;
    main_vehicle_model: string;
    main_vehicle_year: number;
    main_vehicle_capacity: number;
    main_vehicle_body_type: string;
    main_vehicle_renavam: string;
    main_vehicle_insurance_expiry: string;
    accepts_multiple_vehicles: boolean;
  }>) => {
    if (!user) return { error: 'Usuário não autenticado' };

    try {
      const { error } = await supabase
        .from('drivers')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      // Atualizar dados locais
      setData(prev => ({
        ...prev,
        driver: prev.driver ? { ...prev.driver, ...updates } : null
      }));

      return { error: null };
    } catch (error) {
      console.error('Error updating driver:', error);
      return { error: 'Erro ao atualizar dados do motorista' };
    }
  };

  const updateAvailability = async (updates: Partial<{
    available_days: number[];
    start_time: string;
    end_time: string;
    preferred_regions: string[];
  }>) => {
    if (!user || !data.driver) return { error: 'Usuário não autenticado ou motorista não encontrado' };

    try {
      if (data.availability) {
        // Atualizar disponibilidade existente
        const { error } = await supabase
          .from('driver_availability')
          .update(updates)
          .eq('driver_id', data.driver.id);

        if (error) throw error;

        // Atualizar dados locais
        setData(prev => ({
          ...prev,
          availability: prev.availability ? { ...prev.availability, ...updates } : null
        }));
      } else {
        // Criar nova disponibilidade
        const { data: newAvailability, error } = await supabase
          .from('driver_availability')
          .insert({
            driver_id: data.driver.id,
            ...updates
          })
          .select()
          .single();

        if (error) throw error;

        // Atualizar dados locais
        setData(prev => ({
          ...prev,
          availability: newAvailability
        }));
      }

      return { error: null };
    } catch (error) {
      console.error('Error updating availability:', error);
      return { error: 'Erro ao atualizar disponibilidade' };
    }
  };

  useEffect(() => {
    fetchDriverProfile();
  }, [user]);

  return {
    data,
    loading,
    error,
    refetch: fetchDriverProfile,
    updateProfile,
    updateDriver,
    updateAvailability
  };
}