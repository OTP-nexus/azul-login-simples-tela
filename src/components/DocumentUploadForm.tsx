
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Upload, CheckCircle, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface DocumentState {
  file: File | null;
  uploaded: boolean;
}

const DocumentUploadForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [documents, setDocuments] = useState({
    addressProof: { file: null, uploaded: false } as DocumentState,
    cnpjCard: { file: null, uploaded: false } as DocumentState,
    responsibleId: { file: null, uploaded: false } as DocumentState,
  });

  const handleFileUpload = (documentType: keyof typeof documents, file: File | null) => {
    if (file) {
      setDocuments(prev => ({
        ...prev,
        [documentType]: { file, uploaded: true }
      }));
      
      toast({
        title: "Documento enviado",
        description: "Documento carregado com sucesso!",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const allUploaded = Object.values(documents).every(doc => doc.uploaded);
    
    if (!allUploaded) {
      toast({
        title: "Documentos incompletos",
        description: "Por favor, envie todos os documentos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Documentos enviados com sucesso!",
      description: "Seus documentos estão sendo analisados. Você receberá um retorno em até 2 dias úteis.",
    });

    // Simular processamento e redirecionar
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  const DocumentUploadCard = ({ 
    title, 
    description, 
    documentType, 
    icon: Icon 
  }: { 
    title: string; 
    description: string; 
    documentType: keyof typeof documents;
    icon: React.ComponentType<any>;
  }) => (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg">{title}</CardTitle>
          {documents[documentType].uploaded && (
            <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
          )}
        </div>
        <CardDescription className="text-sm">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <Label
              htmlFor={documentType}
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                documents[documentType].uploaded
                  ? "border-green-300 bg-green-50 hover:bg-green-100"
                  : "border-gray-300 bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className={`w-8 h-8 mb-3 ${
                  documents[documentType].uploaded ? "text-green-600" : "text-gray-400"
                }`} />
                <p className="mb-2 text-sm text-gray-500">
                  {documents[documentType].uploaded ? (
                    <span className="font-semibold text-green-600">
                      {documents[documentType].file?.name}
                    </span>
                  ) : (
                    <>
                      <span className="font-semibold">Clique para enviar</span> ou arraste o arquivo
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-500">PNG, JPG ou PDF (MAX. 10MB)</p>
              </div>
              <Input
                id={documentType}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload(documentType, e.target.files?.[0] || null)}
              />
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verificação de Documentos
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Para finalizar seu cadastro, envie os documentos obrigatórios. 
            Todos os documentos serão analisados e você receberá uma confirmação em até 2 dias úteis.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload Cards */}
          <div className="grid md:grid-cols-1 gap-6">
            <DocumentUploadCard
              title="Comprovante de Endereço"
              description="Envie uma conta de luz, água, telefone ou extrato bancário (máximo 3 meses)"
              documentType="addressProof"
              icon={FileText}
            />
            
            <DocumentUploadCard
              title="Cartão CNPJ"
              description="Cartão CNPJ atualizado da Receita Federal"
              documentType="cnpjCard"
              icon={Building}
            />
            
            <DocumentUploadCard
              title="Documento do Responsável"
              description="RG ou CNH do responsável legal da empresa"
              documentType="responsibleId"
              icon={FileText}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <Button
              type="submit"
              size="lg"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              Enviar Documentos
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>
              Ao enviar os documentos, você concorda que as informações são verdadeiras e 
              autoriza a verificação dos dados fornecidos.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentUploadForm;
