
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export function useValidation() {
  const [isValidating, setIsValidating] = useState(false);

  const validateEmail = useCallback(async (email: string): Promise<ValidationResult> => {
    if (!email) return { isValid: false, message: 'Email é obrigatório' };
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Email inválido' };
    }

    setIsValidating(true);
    try {
      const { data, error } = await supabase.rpc('check_email_exists', { email_param: email });
      
      if (error) {
        console.error('Erro ao validar email:', error);
        return { isValid: false, message: 'Erro ao validar email' };
      }

      if (data) {
        return { isValid: false, message: 'Este email já está cadastrado' };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Erro ao validar email:', error);
      return { isValid: false, message: 'Erro ao validar email' };
    } finally {
      setIsValidating(false);
    }
  }, []);

  const validateCNPJ = useCallback(async (cnpj: string): Promise<ValidationResult> => {
    if (!cnpj) return { isValid: false, message: 'CNPJ é obrigatório' };
    
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    if (cleanCNPJ.length !== 14) {
      return { isValid: false, message: 'CNPJ deve ter 14 dígitos' };
    }

    setIsValidating(true);
    try {
      const { data, error } = await supabase.rpc('check_cnpj_exists', { cnpj_param: cleanCNPJ });
      
      if (error) {
        console.error('Erro ao validar CNPJ:', error);
        return { isValid: false, message: 'Erro ao validar CNPJ' };
      }

      if (data) {
        return { isValid: false, message: 'Este CNPJ já está cadastrado' };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Erro ao validar CNPJ:', error);
      return { isValid: false, message: 'Erro ao validar CNPJ' };
    } finally {
      setIsValidating(false);
    }
  }, []);

  const validateCompanyPhone = useCallback(async (phone: string): Promise<ValidationResult> => {
    if (!phone) return { isValid: false, message: 'Telefone é obrigatório' };
    
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return { isValid: false, message: 'Telefone inválido' };
    }

    setIsValidating(true);
    try {
      const { data, error } = await supabase.rpc('check_company_phone_exists', { phone_param: cleanPhone });
      
      if (error) {
        console.error('Erro ao validar telefone:', error);
        return { isValid: false, message: 'Erro ao validar telefone' };
      }

      if (data) {
        return { isValid: false, message: 'Este telefone já está cadastrado' };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Erro ao validar telefone:', error);
      return { isValid: false, message: 'Erro ao validar telefone' };
    } finally {
      setIsValidating(false);
    }
  }, []);

  const validateCPF = useCallback(async (cpf: string): Promise<ValidationResult> => {
    if (!cpf) return { isValid: false, message: 'CPF é obrigatório' };
    
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) {
      return { isValid: false, message: 'CPF deve ter 11 dígitos' };
    }

    setIsValidating(true);
    try {
      const { data, error } = await supabase.rpc('check_cpf_exists', { cpf_param: cleanCPF });
      
      if (error) {
        console.error('Erro ao validar CPF:', error);
        return { isValid: false, message: 'Erro ao validar CPF' };
      }

      if (data) {
        return { isValid: false, message: 'Este CPF já está cadastrado' };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Erro ao validar CPF:', error);
      return { isValid: false, message: 'Erro ao validar CPF' };
    } finally {
      setIsValidating(false);
    }
  }, []);

  const validateCNH = useCallback(async (cnh: string): Promise<ValidationResult> => {
    if (!cnh) return { isValid: false, message: 'CNH é obrigatória' };
    
    const cleanCNH = cnh.replace(/\D/g, '');
    if (cleanCNH.length !== 11) {
      return { isValid: false, message: 'CNH deve ter 11 dígitos' };
    }

    setIsValidating(true);
    try {
      const { data, error } = await supabase.rpc('check_cnh_exists', { cnh_param: cleanCNH });
      
      if (error) {
        console.error('Erro ao validar CNH:', error);
        return { isValid: false, message: 'Erro ao validar CNH' };
      }

      if (data) {
        return { isValid: false, message: 'Esta CNH já está cadastrada' };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Erro ao validar CNH:', error);
      return { isValid: false, message: 'Erro ao validar CNH' };
    } finally {
      setIsValidating(false);
    }
  }, []);

  return {
    validateEmail,
    validateCNPJ,
    validateCompanyPhone,
    validateCPF,
    validateCNH,
    isValidating
  };
}
