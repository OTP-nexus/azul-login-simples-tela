
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, AlertCircle } from 'lucide-react';
import { useCompany } from '@/hooks/useCompany';
import LogoUpload from '@/components/LogoUpload';
import CompanyProfileView from '@/components/CompanyProfileView';

const CompanyProfile = () => {
  const navigate = useNavigate();
  const { company, loading, error, updateLogo } = useCompany();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados da empresa...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar dados</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => navigate('/company-dashboard')}>
                Voltar ao Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/company-dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Perfil da Empresa</h1>
                  <p className="text-sm text-gray-600">Visualize e gerencie informações</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Logo Upload Section */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <LogoUpload
                currentLogoUrl={company.logo_url}
                onLogoUpdate={updateLogo}
              />
            </div>
          </div>

          {/* Company Info */}
          <CompanyProfileView company={company} />

          {/* Status Card */}
          <Card className={company.logo_url ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  company.logo_url ? "bg-green-500" : "bg-yellow-500"
                }`}>
                  <span className="text-white text-sm font-bold">
                    {company.logo_url ? "✓" : "!"}
                  </span>
                </div>
                <div>
                  <h3 className={`font-semibold ${
                    company.logo_url ? "text-green-800" : "text-yellow-800"
                  }`}>
                    {company.logo_url ? "Perfil Completo" : "Logo Obrigatório"}
                  </h3>
                  <p className={`text-sm ${
                    company.logo_url ? "text-green-600" : "text-yellow-700"
                  }`}>
                    {company.logo_url 
                      ? "Seu perfil está completo e pronto para uso."
                      : "Faça upload do logo da empresa para completar seu perfil."
                    }
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
