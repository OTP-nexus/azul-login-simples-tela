
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Company {
  id: string;
  company_name: string;
  cnpj: string;
  contact_name: string;
  phone: string;
  confirm_phone: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  is_transporter: boolean;
  logo_url?: string;
}

export const useCompany = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCompany();
    }
  }, [user]);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Erro ao buscar empresa:', error);
        setError('Erro ao carregar dados da empresa');
        return;
      }

      setCompany(data);
    } catch (error) {
      console.error('Erro ao buscar empresa:', error);
      setError('Erro ao carregar dados da empresa');
    } finally {
      setLoading(false);
    }
  };

  const updateLogo = async (logoUrl: string) => {
    if (!user || !company) return { error: 'Usuário ou empresa não encontrados' };

    try {
      const { error } = await supabase
        .from('companies')
        .update({ logo_url: logoUrl })
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao atualizar logo:', error);
        return { error: 'Erro ao salvar logo' };
      }

      setCompany(prev => prev ? { ...prev, logo_url: logoUrl } : null);
      return { error: null };
    } catch (error) {
      console.error('Erro ao atualizar logo:', error);
      return { error: 'Erro ao salvar logo' };
    }
  };

  return {
    company,
    loading,
    error,
    updateLogo,
    refetch: fetchCompany
  };
};
