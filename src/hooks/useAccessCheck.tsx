import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface AccessCheckResult {
  canAccess: boolean;
  reason?: string;
  message?: string;
  remainingViews?: number | "unlimited";
}

export function useAccessCheck() {
  const { profile } = useAuth();
  const [isChecking, setIsChecking] = useState(false);

  const checkAccess = async (action: 'create_freight' | 'view_contacts'): Promise<AccessCheckResult> => {
    if (!profile) {
      return {
        canAccess: false,
        reason: 'no_auth',
        message: 'Usuário não autenticado.'
      };
    }

    setIsChecking(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription-access', {
        body: {
          action,
          userRole: profile.role
        }
      });

      if (error) {
        console.error('Erro na verificação de acesso:', error);
        return {
          canAccess: false,
          reason: 'check_error',
          message: 'Erro ao verificar permissões. Tente novamente.'
        };
      }

      return data as AccessCheckResult;

    } catch (error) {
      console.error('Erro na verificação de acesso:', error);
      return {
        canAccess: false,
        reason: 'check_error',
        message: 'Erro ao verificar permissões. Tente novamente.'
      };
    } finally {
      setIsChecking(false);
    }
  };

  return {
    checkAccess,
    isChecking
  };
}