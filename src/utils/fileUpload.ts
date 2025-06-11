
import { supabase } from '@/integrations/supabase/client';

export const uploadDocument = async (
  file: File,
  userId: string,
  documentType: string
): Promise<{ url?: string; error?: any }> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${documentType}_${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return { error };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    return { url: publicUrl };
  } catch (error) {
    console.error('Upload error:', error);
    return { error };
  }
};

export const getDocumentUrl = (path: string) => {
  if (!path) return null;
  
  const { data } = supabase.storage
    .from('documents')
    .getPublicUrl(path);
  
  return data.publicUrl;
};
