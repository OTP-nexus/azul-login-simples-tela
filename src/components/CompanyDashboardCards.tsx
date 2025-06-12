
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, User, Activity, LogOut, Building2, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDocumentStatus } from '@/hooks/useDocumentStatus';
import { useToast } from '@/hooks/use-toast';

const CompanyDashboardCards = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { documentStatus, loading } = useDocumentStatus();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && user && documentStatus) {
      // Verificar se todos os documentos da empresa estão aprovados
      const isCompanyFullyApproved = 
        documentStatus.address_proof_status === 'approved' &&
        documentStatus.cnpj_card_status === 'approved' &&
        documentStatus.responsible_document_status === 'approved';
      
      if (!isCompanyFullyApproved) {
        console.log('Access denied - documents not fully approved');
        navigate('/document-verification');
        return;
      }
      
      console.log('Access granted - all documents approved');
      setIsLoading(false);
    } else if (!loading && (!user || !documentStatus)) {
      console.log('No user or document status, redirecting to login');
      navigate('/login');
    }
  }, [user, documentStatus, loading, navigate]);

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

  const handleCardClick = (cardType: string) => {
    console.log(`Clicked on ${cardType} card`);
    
    if (cardType === 'SOLICITAR FRETE') {
      navigate('/freight-request');
      return;
    }
    
    if (cardType === 'CADASTRAR COLABORADOR') {
      navigate('/collaborator-registration');
      return;
    }
    
    if (cardType === 'PERFIL') {
      navigate('/company-profile');
      return;
    }
    
    toast({
      title: "Em breve",
      description: `Funcionalidade "${cardType}" será implementada em breve!`,
    });
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Dashboard Empresa</h1>
                <p className="text-sm text-gray-600">Painel de controle</p>
              </div>
            </div>
            
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Bem-vindo ao seu dashboard</h2>
          <p className="text-gray-600">Gerencie suas operações de frete e colaboradores</p>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Solicitar Frete Card */}
          <Card 
            className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-br from-green-50 to-green-100 border-green-200 group"
            onClick={() => handleCardClick('SOLICITAR FRETE')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow mb-4">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-green-800">
                SOLICITAR FRETE
              </CardTitle>
              <CardDescription className="text-green-600">
                Criar nova solicitação de transporte de carga
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-green-700 mb-4">
                Solicite um novo frete informando origem, destino e detalhes da carga
              </p>
              <div className="bg-green-200 rounded-lg p-3">
                <p className="text-xs text-green-800 font-medium">
                  Clique para começar
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cadastrar Colaborador Card */}
          <Card 
            className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 group"
            onClick={() => handleCardClick('CADASTRAR COLABORADOR')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-blue-800">
                CADASTRAR COLABORADOR
              </CardTitle>
              <CardDescription className="text-blue-600">
                Adicionar novos membros à sua equipe
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-blue-700 mb-4">
                Gerencie sua equipe adicionando novos colaboradores e definindo permissões
              </p>
              <div className="bg-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800 font-medium">
                  Clique para cadastrar
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Fretes Ativos Card */}
          <Card 
            className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 group"
            onClick={() => handleCardClick('FRETES ATIVOS')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow mb-4">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-amber-800">
                FRETES ATIVOS
              </CardTitle>
              <CardDescription className="text-amber-600">
                Acompanhar transportes em andamento
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-amber-700 mb-4">
                Monitore o status dos seus fretes em tempo real e gerencie entregas
              </p>
              <div className="bg-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800 font-medium">
                  Clique para visualizar
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Perfil Card */}
          <Card 
            className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 group"
            onClick={() => handleCardClick('PERFIL')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow mb-4">
                <UserCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-purple-800">
                PERFIL
              </CardTitle>
              <CardDescription className="text-purple-600">
                Gerenciar informações da empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-purple-700 mb-4">
                Visualize e edite as informações de perfil da sua empresa
              </p>
              <div className="bg-purple-200 rounded-lg p-3">
                <p className="text-xs text-purple-800 font-medium">
                  Clique para acessar
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Info */}
        <div className="mt-8">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-green-800">Empresa Verificada</h3>
                  <p className="text-sm text-green-600">
                    Seus documentos foram aprovados e você tem acesso completo ao sistema.
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

export default CompanyDashboardCards;
