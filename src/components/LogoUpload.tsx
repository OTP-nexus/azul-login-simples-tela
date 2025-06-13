
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Camera, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface LogoUploadProps {
  currentLogoUrl?: string;
  onLogoUpdate: (logoUrl: string) => Promise<{ error: string | null }>;
}

const LogoUpload: React.FC<LogoUploadProps> = ({ currentLogoUrl, onLogoUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validar formato PNG
    if (file.type !== 'image/png') {
      toast({
        title: "Formato inválido",
        description: "O logo deve ser um arquivo PNG",
        variant: "destructive"
      });
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O logo deve ter no máximo 5MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Criar preview local
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Upload para Supabase
      const fileName = `${user.id}/logo_${Date.now()}.png`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        toast({
          title: "Erro no upload",
          description: "Não foi possível fazer upload do logo",
          variant: "destructive"
        });
        return;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(fileName);

      // Atualizar no banco de dados
      const { error: updateError } = await onLogoUpdate(publicUrl);
      
      if (updateError) {
        toast({
          title: "Erro ao salvar",
          description: updateError,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Logo atualizado",
        description: "Logo da empresa salvo com sucesso!"
      });

    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: "Erro inesperado ao fazer upload",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Camera className="w-5 h-5" />
          <span>Logo da Empresa</span>
          <span className="text-red-500 text-sm">*</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview do Logo */}
        <div className="flex justify-center">
          <div className="w-48 h-32 md:w-64 md:h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 relative overflow-hidden">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Logo da empresa"
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <div className="text-center text-gray-500">
                <Upload className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Nenhum logo carregado</p>
              </div>
            )}
          </div>
        </div>

        {/* Informações sobre requisitos */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Requisitos do logo:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Formato: PNG obrigatório</li>
                <li>Tamanho máximo: 5MB</li>
                <li>Dimensões recomendadas: 512x320px ou proporção 16:10</li>
                <li>Fundo transparente ou branco recomendado</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botão de Upload */}
        <Button
          onClick={triggerFileSelect}
          disabled={uploading}
          className="w-full"
          size="lg"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Fazendo upload...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {previewUrl ? 'Alterar Logo' : 'Fazer Upload do Logo'}
            </>
          )}
        </Button>

        {/* Input oculto para arquivo */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png"
          onChange={handleFileSelect}
          className="hidden"
        />

        {!currentLogoUrl && (
          <p className="text-sm text-red-600 font-medium text-center">
            ⚠️ O upload do logo é obrigatório para completar o perfil da empresa
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default LogoUpload;
