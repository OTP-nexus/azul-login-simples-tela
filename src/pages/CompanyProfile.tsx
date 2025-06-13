
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit3, CheckCircle, AlertTriangle } from 'lucide-react';
import { useCompany } from '@/hooks/useCompany';
import LogoUpload from '@/components/LogoUpload';
import CompanyProfileView from '@/components/CompanyProfileView';

const CompanyProfile = () => {
  const navigate = useNavigate();
  const { company, loading, error, updateLogo } = useCompany();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/company-dashboard')} className="w-full">
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header minimalista */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/company-dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          
          <h1 className="text-lg font-semibold text-gray-900">Perfil da Empresa</h1>
          
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <Edit3 className="w-4 h-4" />
            Editar
          </Button>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Card do logo - estilo perfil */}
        <Card className="mb-6 overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
            <div className="px-6 pb-6">
              <div className="flex items-end -mt-16 mb-4">
                <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg">
                  <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    {company.logo_url ? (
                      <img
                        src={company.logo_url}
                        alt="Logo da empresa"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-gray-400 text-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2"></div>
                        <span className="text-xs">Logo</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{company.company_name}</h2>
                  <p className="text-gray-600 flex items-center gap-2 mt-1">
                    {company.is_transporter ? 'Transportadora' : 'Embarcadora'}
                    {company.logo_url ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload do logo */}
        <div className="mb-6">
          <LogoUpload
            currentLogoUrl={company.logo_url}
            onLogoUpdate={updateLogo}
          />
        </div>

        {/* Informações da empresa */}
        <CompanyProfileView company={company} />

        {/* Status do perfil */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                company.logo_url ? 'bg-green-100' : 'bg-amber-100'
              }`}>
                {company.logo_url ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                )}
              </div>
              <div>
                <h3 className={`font-semibold ${
                  company.logo_url ? 'text-green-800' : 'text-amber-800'
                }`}>
                  {company.logo_url ? 'Perfil Completo' : 'Logo Obrigatório'}
                </h3>
                <p className="text-sm text-gray-600">
                  {company.logo_url 
                    ? 'Seu perfil está completo e pronto para uso.'
                    : 'Adicione um logo para completar seu perfil.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CompanyProfile;
