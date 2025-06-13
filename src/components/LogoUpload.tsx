import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Camera, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
interface LogoUploadProps {
  currentLogoUrl?: string;
  onLogoUpdate: (logoUrl: string) => Promise<{
    error: string | null;
  }>;
}
const LogoUpload: React.FC<LogoUploadProps> = ({
  currentLogoUrl,
  onLogoUpdate
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    if (file.type !== 'image/png') {
      toast({
        title: "Formato inválido",
        description: "Use apenas arquivos PNG",
        variant: "destructive"
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "Máximo 5MB",
        variant: "destructive"
      });
      return;
    }
    setUploading(true);
    try {
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      const fileName = `${user.id}/logo_${Date.now()}.png`;
      const {
        data,
        error: uploadError
      } = await supabase.storage.from('company-logos').upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });
      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        toast({
          title: "Erro no upload",
          description: "Tente novamente",
          variant: "destructive"
        });
        return;
      }
      const {
        data: {
          publicUrl
        }
      } = supabase.storage.from('company-logos').getPublicUrl(fileName);
      const {
        error: updateError
      } = await onLogoUpdate(publicUrl);
      if (updateError) {
        toast({
          title: "Erro ao salvar",
          description: updateError,
          variant: "destructive"
        });
        return;
      }
      toast({
        title: "Logo atualizado!",
        description: "Salvo com sucesso"
      });
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro",
        description: "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };
  return <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <Camera className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Logo da Empresa</h3>
            <p className="text-sm text-gray-600 mb-4">Adicione o logo da sua empresa. Formato PNG, máxiadicmo 5MB.</p>
            
            <div className="flex items-center gap-4">
              <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} variant="outline" size="sm">
                {uploading ? <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    Enviando...
                  </> : <>
                    <Upload className="w-4 h-4 mr-2" />
                    {previewUrl ? 'Alterar Logo' : 'Adicionar Logo'}
                  </>}
              </Button>
              
              {!currentLogoUrl && <div className="flex items-center gap-1 text-amber-600">
                  <Info className="w-4 h-4" />
                  <span className="text-sm font-medium">Obrigatório</span>
                </div>}
            </div>
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept="image/png" onChange={handleFileSelect} className="hidden" />
      </CardContent>
    </Card>;
};
export default LogoUpload;