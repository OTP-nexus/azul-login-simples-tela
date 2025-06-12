
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Building2, Upload, Camera, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CompanyData {
  id: string;
  company_name: string;
  cnpj: string;
  contact_name: string;
  phone: string;
  confirm_phone: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  is_transporter: boolean;
  logo_url?: string;
}

const CompanyProfile = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          throw error;
        }

        setCompanyData(data);
      } catch (error) {
        console.error('Erro ao carregar dados da empresa:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados da empresa.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [user, toast]);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar uma imagem para fazer upload.');
      }

      const file = event.target.files[0];
      
      // Validar tipo de arquivo
      if (!file.type.includes('image/png')) {
        throw new Error('Apenas arquivos PNG são permitidos.');
      }

      // Validar tamanho do arquivo (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('O arquivo deve ter no máximo 2MB.');
      }

      if (!user || !companyData) {
        throw new Error('Usuário não autenticado ou dados da empresa não carregados.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload do arquivo
      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(fileName);

      // Atualizar URL do logo na tabela companies
      const { error: updateError } = await supabase
        .from('companies')
        .update({ logo_url: publicUrl })
        .eq('id', companyData.id);

      if (updateError) {
        throw updateError;
      }

      // Atualizar estado local
      setCompanyData(prev => prev ? { ...prev, logo_url: publicUrl } : null);

      toast({
        title: "Logo atualizado com sucesso!",
        description: "O logo da sua empresa foi atualizado.",
      });

    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados da empresa...</p>
        </div>
      </div>
    );
  }

  if (!companyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">Dados da empresa não encontrados.</p>
            <Button onClick={() => navigate('/company-dashboard')} className="mt-4">
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/company-dashboard')}
                className="mr-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Perfil da Empresa</h1>
                <p className="text-sm text-gray-600">Dados cadastrais</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Logo Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Logo da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={companyData.logo_url} alt={companyData.company_name} />
                  <AvatarFallback className="text-2xl font-bold bg-blue-100 text-blue-600">
                    {companyData.company_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-3">
                    Adicione ou atualize o logo da sua empresa (formato PNG, máximo 2MB)
                  </p>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/png"
                      onChange={handleLogoUpload}
                      disabled={uploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="logo-upload"
                    />
                    <Button 
                      disabled={uploading}
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {uploading ? 'Enviando...' : 'Escolher Arquivo PNG'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Nome da Empresa</Label>
                  <Input value={companyData.company_name} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <Label>CNPJ</Label>
                  <Input value={companyData.cnpj} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <Label>Nome do Responsável</Label>
                  <Input value={companyData.contact_name} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <Label>Tipo de Empresa</Label>
                  <Input 
                    value={companyData.is_transporter ? 'Transportadora' : 'Embarcadora'} 
                    readOnly 
                    className="bg-gray-50" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Telefone</Label>
                  <Input value={companyData.phone} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <Label>Confirmação do Telefone</Label>
                  <Input value={companyData.confirm_phone} readOnly className="bg-gray-50" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>CEP</Label>
                  <Input value={companyData.cep} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <Label>Rua</Label>
                  <Input value={companyData.street} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <Label>Número</Label>
                  <Input value={companyData.number} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <Label>Complemento</Label>
                  <Input value={companyData.complement || ''} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <Label>Bairro</Label>
                  <Input value={companyData.neighborhood} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <Label>Cidade</Label>
                  <Input value={companyData.city} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <Label>Estado</Label>
                  <Input value={companyData.state} readOnly className="bg-gray-50" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Note */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">ℹ</span>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800 mb-1">Informação</h3>
                  <p className="text-sm text-blue-700">
                    Os dados cadastrais da empresa são somente leitura. Para alterações, entre em contato com o suporte.
                    Apenas o logo da empresa pode ser atualizado através desta tela.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CompanyProfile;
