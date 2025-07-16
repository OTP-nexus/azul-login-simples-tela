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
  
  // Dados do motorista (drivers table)
  driver: {
    id: string;
    user_id: string;
    cpf: string;
    cnh: string;
    vehicle_type: string;
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
}

export function useDriverProfile() {
  const { user } = useAuth();
  const [data, setData] = useState<DriverProfileData>({
    profile: null,
    driver: null,
    documents: null
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
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setError('Erro ao buscar perfil do usuário');
        return;
      }

      // Buscar dados do motorista
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (driverError) {
        console.error('Error fetching driver:', driverError);
        setError('Erro ao buscar dados do motorista');
        return;
      }

      // Buscar status dos documentos
      const { data: documentsData, error: documentsError } = await supabase
        .from('document_verifications')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (documentsError) {
        console.error('Error fetching documents:', documentsError);
        setError('Erro ao buscar status dos documentos');
        return;
      }

      setData({
        profile: profileData,
        driver: driverData,
        documents: documentsData
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

  const updateDriver = async (updates: Partial<{ vehicle_type: string; }>) => {
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

  useEffect(() => {
    fetchDriverProfile();
  }, [user]);

  return {
    data,
    loading,
    error,
    refetch: fetchDriverProfile,
    updateProfile,
    updateDriver
  };
}