import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle, AlertCircle, Building2, ArrowLeft, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDocumentStatus } from '@/hooks/useDocumentStatus';
import { useAuth } from '@/hooks/useAuth';
import { uploadDocument } from '@/utils/fileUpload';
import { useToast } from '@/hooks/use-toast';

interface UploadedFiles {
  addressProof: File | null;
  cnpjCard: File | null;
  responsibleDocument: File | null;
}

const DocumentUploadForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { documentStatus, loading, updateDocumentStatus } = useDocumentStatus();
  const { toast } = useToast();
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({
    addressProof: null,
    cnpjCard: null,
    responsibleDocument: null
  });

  const [dragOver, setDragOver] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  // Verificar se o usuário já enviou documentos
  const hasSubmittedDocuments = documentStatus && (
    documentStatus.address_proof_status !== 'not_submitted' ||
    documentStatus.cnpj_card_status !== 'not_submitted' ||
    documentStatus.responsible_document_status !== 'not_submitted'
  );

  const handleFileUpload = async (file: File, documentType: keyof UploadedFiles) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    // Só permite upload se não tiver documentos pendentes
    if (hasSubmittedDocuments) {
      console.log('Upload blocked - documents already pending verification');
      toast({
        title: "Upload bloqueado",
        description: "Documentos já foram enviados e estão em análise",
        variant: "destructive"
      });
      return;
    }

    // Validar tipo de arquivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, envie apenas arquivos PDF, JPG ou PNG",
        variant: "destructive"
      });
      return;
    }

    // Validar tamanho (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 5MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(documentType);

    try {
      // Upload do arquivo para o Supabase Storage
      const { url, error } = await uploadDocument(file, user.id, documentType);

      if (error) {
        throw error;
      }

      // Atualizar arquivo local
      setUploadedFiles(prev => ({
        ...prev,
        [documentType]: file
      }));

      // Atualizar status no banco de dados
      const statusField = documentType === 'addressProof' ? 'address_proof_status' : 
                         documentType === 'cnpjCard' ? 'cnpj_card_status' : 
                         'responsible_document_status';
      const urlField = documentType === 'addressProof' ? 'address_proof_url' : 
                      documentType === 'cnpjCard' ? 'cnpj_card_url' : 
                      'responsible_document_url';

      const updateData: any = {};
      updateData[statusField] = 'pending';
      updateData[urlField] = url;

      const { error: updateError } = await updateDocumentStatus(updateData);

      if (updateError) {
        console.error('Error updating document status:', updateError);
        toast({
          title: "Erro ao salvar",
          description: "Erro ao salvar status do documento",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Documento enviado",
        description: `${file.name} foi enviado com sucesso!`,
      });

      console.log(`Arquivo ${documentType} enviado:`, file.name, 'URL:', url);
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

  const handleDragOver = (e: React.DragEvent, documentType: string) => {
    e.preventDefault();
    setDragOver(documentType);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, documentType: keyof UploadedFiles) => {
    e.preventDefault();
    setDragOver(null);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0], documentType);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, documentType: keyof UploadedFiles) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0], documentType);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Enviado - Aguardando verificação';
      case 'approved':
        return 'Aprovado';
      default:
        return 'Pendente';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-amber-600';
      case 'approved':
        return 'text-green-700';
      default:
        return 'text-gray-600';
    }
  };

  const getDocumentStatus = (documentType: keyof UploadedFiles) => {
    if (!documentStatus) return 'not_submitted';
    
    switch (documentType) {
      case 'addressProof':
        return documentStatus.address_proof_status || 'not_submitted';
      case 'cnpjCard':
        return documentStatus.cnpj_card_status || 'not_submitted';
      case 'responsibleDocument':
        return documentStatus.responsible_document_status || 'not_submitted';
      default:
        return 'not_submitted';
    }
  };

  const documentsUploaded = hasSubmittedDocuments 
    ? (documentStatus?.address_proof_status !== 'not_submitted' ? 1 : 0) +
      (documentStatus?.cnpj_card_status !== 'not_submitted' ? 1 : 0) +
      (documentStatus?.responsible_document_status !== 'not_submitted' ? 1 : 0)
    : Object.values(uploadedFiles).filter(file => file !== null).length;
  
  const progressPercentage = (documentsUploaded / 3) * 100;

  const canFinish = hasSubmittedDocuments 
    ? false 
    : Object.values(uploadedFiles).every(file => file !== null);

  const handleFinish = async () => {
    if (hasSubmittedDocuments) {
      console.log('Documents already submitted, user is waiting for verification');
      return;
    }

    if (!canFinish) {
      toast({
        title: "Documentos incompletos",
        description: "Por favor, envie todos os documentos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Documentos enviados!",
      description: "Seus documentos foram enviados com sucesso! Você receberá um email quando a verificação for concluída.",
    });

    console.log('Verificação de documentos finalizada');
  };

  const renderUploadArea = (
    documentType: keyof UploadedFiles,
    title: string,
    description: string
  ) => {
    const status = getDocumentStatus(documentType);
    const isUploading = uploading === documentType;
    
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            {title}
            {getStatusIcon(status)}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              hasSubmittedDocuments
                ? 'border-amber-300 bg-amber-50'
                : isUploading
                ? 'border-blue-400 bg-blue-50'
                : dragOver === documentType
                ? 'border-blue-400 bg-blue-50'
                : uploadedFiles[documentType]
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={(e) => !hasSubmittedDocuments && !isUploading && handleDragOver(e, documentType)}
            onDragLeave={!hasSubmittedDocuments && !isUploading ? handleDragLeave : undefined}
            onDrop={(e) => !hasSubmittedDocuments && !isUploading && handleDrop(e, documentType)}
          >
            {isUploading ? (
              <div className="space-y-2">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="font-medium text-blue-700">
                  Enviando documento...
                </p>
                <p className="text-sm text-blue-600">
                  Por favor, aguarde
                </p>
              </div>
            ) : hasSubmittedDocuments || status === 'pending' ? (
              <div className="space-y-2">
                <Clock className="w-12 h-12 text-amber-500 mx-auto" />
                <p className="font-medium text-amber-700">
                  Documento enviado
                </p>
                <p className="text-sm text-amber-600">
                  Aguardando verificação
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Prazo de análise: até 24 horas úteis
                </p>
              </div>
            ) : uploadedFiles[documentType] ? (
              <div className="space-y-2">
                <FileText className="w-12 h-12 text-green-500 mx-auto" />
                <p className="font-medium text-green-700">
                  {uploadedFiles[documentType]!.name}
                </p>
                <p className={`text-sm ${getStatusColor(status)}`}>
                  Pronto para envio
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById(`file-${documentType}`)?.click()}
                  className="mt-2"
                >
                  Alterar arquivo
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-gray-600">Arraste o arquivo aqui ou</p>
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById(`file-${documentType}`)?.click()}
                    className="mt-2"
                  >
                    Selecionar arquivo
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Formatos aceitos: PDF, JPG, PNG (máx. 5MB)
                </p>
              </div>
            )}
            
            {!hasSubmittedDocuments && !isUploading && (
              <input
                id={`file-${documentType}`}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleInputChange(e, documentType)}
                className="hidden"
              />
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando status dos documentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {hasSubmittedDocuments ? 'Voltar ao login' : 'Voltar ao cadastro'}
          </button>
          
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Verificação de Documentos
            </h1>
            <p className="text-gray-600 mb-6">
              {hasSubmittedDocuments 
                ? 'Seus documentos estão em análise. Aguarde a confirmação por email.'
                : 'Envie os documentos obrigatórios para verificar sua empresa'
              }
            </p>
            
            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progresso</span>
                <span>{documentsUploaded}/3 documentos</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
          </div>
        </div>

        {hasSubmittedDocuments && (
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

        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {renderUploadArea(
            'addressProof',
            'Comprovante de Endereço',
            'Conta de luz, água, telefone ou extrato bancário (até 3 meses)'
          )}
          
          {renderUploadArea(
            'cnpjCard',
            'Cartão CNPJ',
            'Documento oficial emitido pela Receita Federal'
          )}
          
          {renderUploadArea(
            'responsibleDocument',
            'Documento do Responsável',
            'RG ou CNH do responsável pela empresa (frente e verso)'
          )}
        </div>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {hasSubmittedDocuments ? 'Status da verificação' : 'Próximos passos'}
              </h3>
              <p className="text-gray-600">
                {hasSubmittedDocuments 
                  ? 'Nossa equipe está analisando seus documentos. Você pode acompanhar o status por email ou fazer login novamente para verificar.'
                  : 'Após o envio dos documentos, nossa equipe analisará em até 24 horas úteis. Você receberá um email com o resultado da verificação.'
                }
              </p>
              
              <Button
                onClick={hasSubmittedDocuments ? () => navigate('/login') : handleFinish}
                disabled={!canFinish && !hasSubmittedDocuments}
                className="h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {hasSubmittedDocuments 
                  ? 'Voltar ao login'
                  : canFinish 
                  ? 'Finalizar verificação' 
                  : `Envie ${3 - documentsUploaded} documento(s) restante(s)`
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentUploadForm;
