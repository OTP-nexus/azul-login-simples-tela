
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface CollaboratorFormData {
  name: string;
  sector: string;
  phone: string;
  email: string;
}

const CollaboratorRegistrationForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CollaboratorFormData>({
    name: '',
    sector: '',
    phone: '',
    email: ''
  });

  const handleBack = () => {
    navigate('/company-dashboard');
  };

  const handleInputChange = (field: keyof CollaboratorFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Erro de validação",
        description: "Nome é obrigatório",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.sector.trim()) {
      toast({
        title: "Erro de validação",
        description: "Setor responsável é obrigatório",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.phone.trim()) {
      toast({
        title: "Erro de validação",
        description: "Telefone de contato é obrigatório",
        variant: "destructive"
      });
      return false;
    }

    // Validação básica de email se fornecido
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({
        title: "Erro de validação",
        description: "Email inválido",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Primeiro, buscar a empresa do usuário
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (companyError || !company) {
        throw new Error('Empresa não encontrada');
      }

      // Inserir o colaborador
      const { error: insertError } = await supabase
        .from('collaborators')
        .insert({
          company_id: company.id,
          name: formData.name.trim(),
          sector: formData.sector.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || null
        });

      if (insertError) {
        throw insertError;
      }

      toast({
        title: "Sucesso!",
        description: "Colaborador cadastrado com sucesso"
      });

      // Limpar formulário
      setFormData({
        name: '',
        sector: '',
        phone: '',
        email: ''
      });

    } catch (error: any) {
      console.error('Erro ao cadastrar colaborador:', error);
      toast({
        title: "Erro ao cadastrar",
        description: error.message || "Não foi possível cadastrar o colaborador. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleBack}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Cadastrar Colaborador</h1>
                <p className="text-sm text-gray-600">Adicione responsáveis por cada setor</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Novo Colaborador
            </CardTitle>
            <CardDescription className="text-gray-600">
              Preencha as informações do colaborador responsável pelo setor
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Nome Completo *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Digite o nome completo"
                  className="w-full"
                  required
                />
              </div>

              {/* Setor */}
              <div className="space-y-2">
                <Label htmlFor="sector" className="text-sm font-medium text-gray-700">
                  Setor Responsável *
                </Label>
                <Input
                  id="sector"
                  type="text"
                  value={formData.sector}
                  onChange={(e) => handleInputChange('sector', e.target.value)}
                  placeholder="Ex: Logística, Comercial, Financeiro"
                  className="w-full"
                  required
                />
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Telefone de Contato *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email (Opcional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="colaborador@empresa.com"
                  className="w-full"
                />
              </div>

              {/* Botão de Submit */}
              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Cadastrar Colaborador</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">i</span>
              </div>
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">Informações importantes</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Todos os colaboradores ficam vinculados à sua empresa</li>
                  <li>• O email é opcional, mas recomendado para comunicação</li>
                  <li>• Você pode cadastrar quantos colaboradores precisar</li>
                  <li>• Os dados podem ser editados posteriormente</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CollaboratorRegistrationForm;
