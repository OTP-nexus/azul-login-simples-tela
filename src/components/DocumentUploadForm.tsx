import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle, AlertCircle, Building2, ArrowLeft, Clock, LogOut } from 'lucide-react';
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
  const { user, signOut } = useAuth();
  const { documentStatus, loading, updateDocumentStatus, refetch } = useDocumentStatus();
  const { toast } = useToast();
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({
    addressProof: null,
    cnpjCard: null,
    responsibleDocument: null
  });

  const [dragOver, setDragOver] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Buscar dados quando o componente carrega
  useEffect(() => {
    if (user && !loading) {
      refetch();
    }
  }, [user, refetch, loading]);

  // Verificar se o usuário tem documentos enviados ou aprovados
  const hasSubmittedDocuments = documentStatus && (
    (documentStatus.address_proof_status === 'pending' && documentStatus.address_proof_url) ||
    (documentStatus.cnpj_card_status === 'pending' && documentStatus.cnpj_card_url) ||
    (documentStatus.responsible_document_status === 'pending' && documentStatus.responsible_document_url) ||
    documentStatus.address_proof_status === 'approved' ||
    documentStatus.cnpj_card_status === 'approved' ||
    documentStatus.responsible_document_status === 'approved'
  );

  const handleFileSelect = (file: File, documentType: keyof UploadedFiles) => {
    // Verificar se o documento específico já está aprovado ou pendente com URL
    const docStatus = getDocumentStatus(documentType);
    const docUrl = getDocumentUrl(documentType);
    
    if (docStatus === 'approved' || (docStatus === 'pending' && docUrl)) {
      toast({
        title: "Documento já processado",
        description: "Este documento já foi enviado ou aprovado",
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

    setUploadedFiles(prev => ({
      ...prev,
      [documentType]: file
    }));

    toast({
      title: "Arquivo selecionado",
      description: `${file.name} pronto para envio`,
    });
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
      handleFileSelect(files[0], documentType);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, documentType: keyof UploadedFiles) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0], documentType);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    // Verificar se há documentos já aprovados ou pendentes com URL
    if (hasSubmittedDocuments) {
      toast({
        title: "Documentos já processados",
        description: "Você já possui documentos aprovados ou em análise",
        variant: "destructive"
      });
      return;
    }

    // Verificar se todos os documentos foram selecionados
    if (!uploadedFiles.addressProof || !uploadedFiles.cnpjCard || !uploadedFiles.responsibleDocument) {
      toast({
        title: "Documentos incompletos",
        description: "Por favor, selecione todos os documentos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Upload dos documentos para o Supabase Storage
      const uploads = await Promise.all([
        uploadDocument(uploadedFiles.addressProof, user.id, 'addressProof'),
        uploadDocument(uploadedFiles.cnpjCard, user.id, 'cnpjCard'),
        uploadDocument(uploadedFiles.responsibleDocument, user.id, 'responsibleDocument')
      ]);

      // Verificar se houve erro em algum upload
      const hasErrors = uploads.some(upload => upload.error);
      if (hasErrors) {
        throw new Error('Erro ao fazer upload de um ou mais documentos');
      }

      // Atualizar status no banco de dados
      const updateData = {
        address_proof_status: 'pending',
        address_proof_url: uploads[0].url,
        cnpj_card_status: 'pending', 
        cnpj_card_url: uploads[1].url,
        responsible_document_status: 'pending',
        responsible_document_url: uploads[2].url
      };

      const { error: updateError } = await updateDocumentStatus(updateData);

      if (updateError) {
        console.error('Error updating document status:', updateError);
        throw new Error('Erro ao atualizar status dos documentos');
      }

      // Recarregar dados após envio
      await refetch();

      toast({
        title: "Documentos enviados!",
        description: "Seus documentos foram enviados com sucesso! Você receberá um email quando a verificação for concluída.",
      });

      console.log('Documentos enviados com sucesso para verificação');

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Erro no envio",
        description: error.message || "Erro ao enviar documentos",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
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

  const getDocumentUrl = (documentType: keyof UploadedFiles) => {
    if (!documentStatus) return null;
    
    switch (documentType) {
      case 'addressProof':
        return documentStatus.address_proof_url;
      case 'cnpjCard':
        return documentStatus.cnpj_card_url;
      case 'responsibleDocument':
        return documentStatus.responsible_document_url;
      default:
        return null;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      });
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: "Erro no logout",
        description: "Não foi possível desconectar. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const documentsSelected = Object.values(uploadedFiles).filter(file => file !== null).length;
  
  // Calcular progresso considerando documentos aprovados como completos
  const approvedDocs = (documentStatus?.address_proof_status === 'approved' ? 1 : 0) +
                      (documentStatus?.cnpj_card_status === 'approved' ? 1 : 0) +
                      (documentStatus?.responsible_document_status === 'approved' ? 1 : 0);
  
  const pendingDocs = (documentStatus?.address_proof_status === 'pending' && documentStatus?.address_proof_url ? 1 : 0) +
                     (documentStatus?.cnpj_card_status === 'pending' && documentStatus?.cnpj_card_url ? 1 : 0) +
                     (documentStatus?.responsible_document_status === 'pending' && documentStatus?.responsible_document_url ? 1 : 0);

  const progressPercentage = hasSubmittedDocuments 
    ? ((approvedDocs + pendingDocs) / 3 * 100)
    : (documentsSelected / 3) * 100;

  const canSubmit = !hasSubmittedDocuments && documentsSelected === 3 && !uploading;

  const renderUploadArea = (
    documentType: keyof UploadedFiles,
    title: string,
    description: string
  ) => {
    const status = getDocumentStatus(documentType);
    const selectedFile = uploadedFiles[documentType];
    const documentUrl = getDocumentUrl(documentType);
    const isApproved = status === 'approved';
    const isPendingWithUrl = status === 'pending' && documentUrl;
    const isProcessed = isApproved || isPendingWithUrl;
    
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            {title}
            {isProcessed ? getStatusIcon(status) : <AlertCircle className="w-5 h-5 text-gray-400" />}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isApproved
                ? 'border-green-300 bg-green-50'
                : isPendingWithUrl
                ? 'border-amber-300 bg-amber-50'
                : dragOver === documentType
                ? 'border-blue-400 bg-blue-50'
                : selectedFile
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={(e) => !isProcessed && handleDragOver(e, documentType)}
            onDragLeave={!isProcessed ? handleDragLeave : undefined}
            onDrop={(e) => !isProcessed && handleDrop(e, documentType)}
          >
            {isApproved ? (
              <div className="space-y-2">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                <p className="font-medium text-green-700">
                  Documento aprovado
                </p>
                <p className="text-sm text-green-600">
                  Verificação concluída
                </p>
              </div>
            ) : isPendingWithUrl ? (
              <div className="space-y-2">
                <Clock className="w-12 h-12 text-amber-500 mx-auto" />
                <p className="font-medium text-amber-700">
                  Documento enviado
                </p>
                <p className="text-sm text-amber-600">
                  Aguardando verificação
                </p>
              </div>
            ) : selectedFile ? (
              <div className="space-y-2">
                <FileText className="w-12 h-12 text-green-500 mx-auto" />
                <p className="font-medium text-green-700">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-green-600">
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
            
            {!isProcessed && (
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

  // Mostrar loading enquanto busca dados
  if (loading || !user) {
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
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {hasSubmittedDocuments ? 'Voltar ao login' : 'Voltar ao cadastro'}
            </button>
            
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-700 hover:text-red-600 hover:border-red-300"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </Button>
          </div>
          
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
                : 'Selecione os documentos obrigatórios e clique em "Enviar" para verificar sua empresa'
              }
            </p>
            
            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progresso</span>
                <span>{hasSubmittedDocuments ? 'Enviados' : documentsSelected}/3 documentos</span>
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
                {hasSubmittedDocuments ? 'Status da verificação' : 'Envio de documentos'}
              </h3>
              <p className="text-gray-600">
                {hasSubmittedDocuments 
                  ? 'Nossa equipe está analisando seus documentos. Você pode acompanhar o status por email ou fazer login novamente para verificar.'
                  : uploading
                  ? 'Enviando documentos para verificação...'
                  : 'Selecione todos os documentos e clique em "Enviar" para iniciar a verificação.'
                }
              </p>
              
              <Button
                onClick={hasSubmittedDocuments ? () => navigate('/login') : handleSubmit}
                disabled={!canSubmit && !hasSubmittedDocuments}
                className="h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Enviando...</span>
                  </div>
                ) : hasSubmittedDocuments 
                  ? 'Voltar ao login'
                  : canSubmit 
                  ? 'Enviar documentos' 
                  : `Selecione ${3 - documentsSelected} documento(s) restante(s)`
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
