
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useDocumentStatus() {
  const { user } = useAuth();
  const [documentStatus, setDocumentStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDocumentStatus();
    } else {
      setDocumentStatus(null);
      setLoading(false);
    }
  }, [user]);

  const fetchDocumentStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('document_verifications')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching document status:', error);
        return;
      }

      setDocumentStatus(data);
    } catch (error) {
      console.error('Error fetching document status:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDocumentStatus = async (updates: any) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { data, error } = await supabase
        .from('document_verifications')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (!error) {
        setDocumentStatus(data);
      }

      return { data, error };
    } catch (error) {
      console.error('Error updating document status:', error);
      return { error };
    }
  };

  return {
    documentStatus,
    loading,
    updateDocumentStatus,
    refetch: fetchDocumentStatus
  };
}
