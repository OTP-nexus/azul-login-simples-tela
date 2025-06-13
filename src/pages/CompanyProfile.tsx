
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCompany } from '@/hooks/useCompany';
import LogoUpload from '@/components/LogoUpload';
import CompanyProfileView from '@/components/CompanyProfileView';

const CompanyProfile = () => {
  const navigate = useNavigate();
  const { company, loading, error, updateLogo } = useCompany();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Carregando dados da empresa...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="pt-8">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Erro ao carregar dados</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={() => navigate('/company-dashboard')} className="w-full">
                Voltar ao Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                onClick={() => navigate('/company-dashboard')}
                className="flex items-center space-x-2 hover:bg-blue-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Voltar</span>
              </Button>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Perfil da Empresa</h1>
                  <p className="text-gray-600">Gerencie as informações da sua empresa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Logo Section with Modern Card */}
          <div className="flex justify-center">
            <div className="w-full max-w-lg">
              <LogoUpload
                currentLogoUrl={company.logo_url}
                onLogoUpdate={updateLogo}
              />
            </div>
          </div>

          {/* Company Info with Modern Layout */}
          <CompanyProfileView company={company} />

          {/* Modern Status Card */}
          <div className="flex justify-center">
            <Card className={`w-full max-w-2xl border-0 shadow-lg ${
              company.logo_url 
                ? "bg-gradient-to-r from-green-50 to-emerald-50" 
                : "bg-gradient-to-r from-amber-50 to-orange-50"
            }`}>
              <CardContent className="pt-8 pb-8">
                <div className="flex items-center justify-center space-x-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
                    company.logo_url 
                      ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                      : "bg-gradient-to-r from-amber-500 to-orange-500"
                  }`}>
                    {company.logo_url ? (
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    ) : (
                      <AlertCircle className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className={`text-xl font-bold mb-2 ${
                      company.logo_url ? "text-green-800" : "text-amber-800"
                    }`}>
                      {company.logo_url ? "Perfil Completo!" : "Logo Obrigatório"}
                    </h3>
                    <p className={`text-base ${
                      company.logo_url ? "text-green-700" : "text-amber-700"
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
        </div>
      </main>
    </div>
  );
};

export default CompanyProfile;
