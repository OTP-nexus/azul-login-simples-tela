
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Camera, AlertCircle, ImageIcon } from 'lucide-react';
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
    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center space-x-3 text-xl">
          <Camera className="w-6 h-6" />
          <span>Logo da Empresa</span>
          <span className="text-pink-200 text-lg">*</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        {/* Preview do Logo */}
        <div className="flex justify-center">
          <div className="w-72 h-48 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden hover:border-blue-400 transition-colors">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Logo da empresa"
                className="max-w-full max-h-full object-contain p-4"
              />
            ) : (
              <div className="text-center text-gray-500">
                <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-base font-medium">Nenhum logo carregado</p>
                <p className="text-sm text-gray-400 mt-1">Clique no botão abaixo para fazer upload</p>
              </div>
            )}
          </div>
        </div>

        {/* Informações sobre requisitos */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-bold mb-3 text-base">Requisitos do logo:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Formato: PNG obrigatório</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Tamanho máximo: 5MB</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Dimensões: 512x320px (16:10)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Fundo transparente preferível</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botão de Upload */}
        <Button
          onClick={triggerFileSelect}
          disabled={uploading}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
          size="lg"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
              Fazendo upload...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 mr-3" />
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
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-700 font-semibold text-center flex items-center justify-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>O upload do logo é obrigatório para completar o perfil da empresa</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LogoUpload;
