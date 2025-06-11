
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Camera, Home, CheckCircle, Clock, AlertCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDocumentStatus } from '@/hooks/useDocumentStatus';
import { uploadDocument } from '@/utils/fileUpload';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url?: string;
}

const DriverDocumentUploadForm = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { documentStatus, updateDocumentStatus, loading: statusLoading } = useDocumentStatus();
  const { toast } = useToast();
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{
    cnh: UploadedFile | null;
    photo: UploadedFile | null;
    addressProof: UploadedFile | null;
  }>({
    cnh: null,
    photo: null,
    addressProof: null
  });

  const cnhInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);

  // Redirect if user is not authenticated or not a driver
  useEffect(() => {
    if (!authLoading && (!user || !profile)) {
      navigate('/login');
      return;
    }

    if (!authLoading && profile && profile.role !== 'driver') {
      navigate('/');
      return;
    }
  }, [user, profile, authLoading, navigate]);

  // Initialize uploaded files from document status
  useEffect(() => {
    if (documentStatus) {
      setUploadedFiles({
        cnh: documentStatus.cnh_document_url ? {
          name: 'CNH enviada',
          size: 0,
          type: 'document',
          url: documentStatus.cnh_document_url
        } : null,
        photo: documentStatus.photo_url ? {
          name: 'Foto enviada',
          size: 0,
          type: 'image',
          url: documentStatus.photo_url
        } : null,
        addressProof: documentStatus.driver_address_proof_url ? {
          name: 'Comprovante enviado',
          size: 0,
          type: 'document',
          url: documentStatus.driver_address_proof_url
        } : null
      });
    }
  }, [documentStatus]);

  const handleFileUpload = async (type: 'cnh' | 'photo' | 'addressProof', file: File) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 5MB",
        variant: "destructive"
      });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipo de arquivo não permitido",
        description: "Use apenas JPG, PNG ou PDF",
        variant: "destructive"
      });
      return;
    }

    setUploading(type);

    try {
      // Upload file to Supabase Storage
      const { url, error } = await uploadDocument(file, user.id, type);

      if (error) {
        throw error;
      }

      // Update local state
      setUploadedFiles(prev => ({
        ...prev,
        [type]: {
          name: file.name,
          size: file.size,
          type: file.type,
          url
        }
      }));

      // Update document status in database
      const updateData: any = {};
      const statusField = type === 'cnh' ? 'cnh_document_status' : 
                         type === 'photo' ? 'photo_status' : 
                         'driver_address_proof_status';
      const urlField = type === 'cnh' ? 'cnh_document_url' : 
                      type === 'photo' ? 'photo_url' : 
                      'driver_address_proof_url';

      updateData[statusField] = 'pending';
      updateData[urlField] = url;

      const { error: updateError } = await updateDocumentStatus(updateData);

      if (updateError) {
        console.error('Error updating document status:', updateError);
      }

      toast({
        title: "Documento enviado",
        description: "Arquivo enviado com sucesso!",
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Erro no upload",
        description: error.message || "Erro ao enviar arquivo",
        variant: "destructive"
      });
    } finally {
      setUploading(null);
    }
  };

  const handleDrop = (e: React.DragEvent, type: 'cnh' | 'photo' | 'addressProof') => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(type, file);
    }
  };

  const handleSubmit = () => {
    if (!uploadedFiles.cnh || !uploadedFiles.photo || !uploadedFiles.addressProof) {
      toast({
        title: "Documentos incompletos",
        description: "Por favor, envie todos os documentos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Documentos enviados!",
      description: "Seus documentos estão sendo analisados. Você receberá um email quando a verificação for concluída.",
    });

    // Redirect to login or a waiting page
    navigate('/login');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentStatus = (type: 'cnh' | 'photo' | 'addressProof') => {
    if (!documentStatus) return 'not_submitted';
    
    switch (type) {
      case 'cnh':
        return documentStatus.cnh_document_status;
      case 'photo':
        return documentStatus.photo_status;
      case 'addressProof':
        return documentStatus.driver_address_proof_status;
      default:
        return 'not_submitted';
    }
  };

  const DocumentUploadCard = ({ 
    title, 
    description, 
    icon: Icon, 
    type, 
    inputRef,
    accept = "image/jpeg,image/png,image/jpg,application/pdf"
  }: {
    title: string;
    description: string;
    icon: any;
    type: 'cnh' | 'photo' | 'addressProof';
    inputRef: React.RefObject<HTMLInputElement>;
    accept?: string;
  }) => {
    const file = uploadedFiles[type];
    const status = getDocumentStatus(type);
    const isUploading = uploading === type;
    
    return (
      <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
        <CardContent className="p-6">
          <div className="text-center">
            <Icon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-600 mb-4">{description}</p>
            
            {isUploading ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm font-medium text-blue-800">Enviando...</span>
                </div>
              </div>
            ) : file && status === 'pending' ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">Aguardando verificação</span>
                </div>
                <p className="text-xs text-amber-600 mt-1">{file.name}</p>
              </div>
            ) : file && status === 'approved' ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Documento aprovado</span>
                </div>
                <p className="text-xs text-green-600 mt-1">{file.name}</p>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 cursor-pointer transition-colors"
                onClick={() => inputRef.current?.click()}
                onDrop={(e) => handleDrop(e, type)}
                onDragOver={(e) => e.preventDefault()}
              >
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Clique ou arraste o arquivo aqui</p>
                <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (máx. 5MB)</p>
              </div>
            )}
            
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(type, file);
              }}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  // Show loading while checking auth
  if (authLoading || statusLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  const allDocumentsSubmitted = uploadedFiles.cnh && uploadedFiles.photo && uploadedFiles.addressProof;
  const isPending = documentStatus?.overall_status === 'pending';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm mb-8">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Verificação de Documentos - Motorista
            </CardTitle>
            <CardDescription className="text-gray-600">
              {isPending 
                ? 'Seus documentos estão em análise. Aguarde a confirmação por email.'
                : 'Envie os documentos necessários para verificar sua conta'
              }
            </CardDescription>
          </CardHeader>
        </Card>

        {isPending && (
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-amber-600" />
                <div>
                  <h3 className="font-semibold text-amber-800">Documentos em análise</h3>
                  <p className="text-sm text-amber-600">
                    Seus documentos foram enviados e estão sendo verificados pela nossa equipe. 
                    Você receberá um email com o resultado em até 24 horas úteis.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <DocumentUploadCard
            title="CNH"
            description="Carteira Nacional de Habilitação (frente e verso ou documento único)"
            icon={FileText}
            type="cnh"
            inputRef={cnhInputRef}
          />
          
          <DocumentUploadCard
            title="Foto do Rosto"
            description="Selfie para verificação de identidade (foto nítida do rosto)"
            icon={Camera}
            type="photo"
            inputRef={photoInputRef}
            accept="image/jpeg,image/png,image/jpg"
          />
          
          <DocumentUploadCard
            title="Comprovante de Endereço"
            description="Conta de luz, água, telefone ou similar (máx. 3 meses)"
            icon={Home}
            type="addressProof"
            inputRef={addressInputRef}
          />
        </div>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">Instruções importantes:</h4>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• Envie documentos nítidos e legíveis</li>
                    <li>• A foto do rosto deve mostrar claramente seu rosto</li>
                    <li>• O comprovante de endereço deve ser recente (até 3 meses)</li>
                    <li>• Formatos aceitos: PDF, JPG, PNG (máximo 5MB cada)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/login')}
                className="flex-1"
              >
                Voltar para Login
              </Button>
              
              <Button
                onClick={handleSubmit}
                disabled={!allDocumentsSubmitted || isPending}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              >
                {isPending ? 'Documentos em análise' : 'Finalizar envio'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DriverDocumentUploadForm;
