
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle, AlertCircle, Building2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DocumentStatus {
  addressProof: 'pending' | 'uploaded' | 'approved';
  cnpjCard: 'pending' | 'uploaded' | 'approved';
  responsibleDocument: 'pending' | 'uploaded' | 'approved';
}

interface UploadedFiles {
  addressProof: File | null;
  cnpjCard: File | null;
  responsibleDocument: File | null;
}

const DocumentUploadForm = () => {
  const navigate = useNavigate();
  const [documentStatus, setDocumentStatus] = useState<DocumentStatus>({
    addressProof: 'pending',
    cnpjCard: 'pending',
    responsibleDocument: 'pending'
  });
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({
    addressProof: null,
    cnpjCard: null,
    responsibleDocument: null
  });

  const [dragOver, setDragOver] = useState<string | null>(null);

  const handleFileUpload = (file: File, documentType: keyof UploadedFiles) => {
    // Validar tipo de arquivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Por favor, envie apenas arquivos PDF, JPG ou PNG');
      return;
    }

    // Validar tamanho (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('O arquivo deve ter no máximo 5MB');
      return;
    }

    setUploadedFiles(prev => ({
      ...prev,
      [documentType]: file
    }));

    setDocumentStatus(prev => ({
      ...prev,
      [documentType]: 'uploaded'
    }));

    console.log(`Arquivo ${documentType} enviado:`, file.name);
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
      case 'uploaded':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'uploaded':
        return 'Enviado - Em análise';
      case 'approved':
        return 'Aprovado';
      default:
        return 'Pendente';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded':
        return 'text-green-600';
      case 'approved':
        return 'text-green-700';
      default:
        return 'text-amber-600';
    }
  };

  const documentsUploaded = Object.values(uploadedFiles).filter(file => file !== null).length;
  const progressPercentage = (documentsUploaded / 3) * 100;

  const canFinish = Object.values(documentStatus).every(status => status !== 'pending');

  const handleFinish = () => {
    console.log('Verificação de documentos finalizada');
    // Aqui você implementaria o envio final dos documentos
    alert('Documentos enviados com sucesso! Você receberá um email quando a verificação for concluída.');
  };

  const renderUploadArea = (
    documentType: keyof UploadedFiles,
    title: string,
    description: string
  ) => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          {title}
          {getStatusIcon(documentStatus[documentType])}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver === documentType
              ? 'border-blue-400 bg-blue-50'
              : uploadedFiles[documentType]
              ? 'border-green-400 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={(e) => handleDragOver(e, documentType)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, documentType)}
        >
          {uploadedFiles[documentType] ? (
            <div className="space-y-2">
              <FileText className="w-12 h-12 text-green-500 mx-auto" />
              <p className="font-medium text-green-700">
                {uploadedFiles[documentType]!.name}
              </p>
              <p className={`text-sm ${getStatusColor(documentStatus[documentType])}`}>
                {getStatusText(documentStatus[documentType])}
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
          
          <input
            id={`file-${documentType}`}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleInputChange(e, documentType)}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate('/register/company')}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar ao cadastro
          </button>
          
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Verificação de Documentos
            </h1>
            <p className="text-gray-600 mb-6">
              Envie os documentos obrigatórios para verificar sua empresa
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
                Próximos passos
              </h3>
              <p className="text-gray-600">
                Após o envio dos documentos, nossa equipe analisará em até 24 horas úteis.
                Você receberá um email com o resultado da verificação.
              </p>
              
              <Button
                onClick={handleFinish}
                disabled={!canFinish}
                className="h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {canFinish ? 'Finalizar Verificação' : `Envie ${3 - documentsUploaded} documento(s) restante(s)`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentUploadForm;
