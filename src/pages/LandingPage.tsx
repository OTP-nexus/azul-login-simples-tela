
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Building2, Shield, Clock, MapPin, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleDriverLogin = () => {
    navigate('/login');
  };

  const handleCompanyLogin = () => {
    navigate('/login');
  };

  const handleDriverRegister = () => {
    navigate('/register/driver');
  };

  const handleCompanyRegister = () => {
    navigate('/register/company');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">FreightConnect</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={handleDriverLogin}>
                Login
              </Button>
              <Button onClick={handleCompanyRegister}>
                Começar Agora
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-800 mb-6">
            Conectamos <span className="text-blue-600">Motoristas</span> e <span className="text-blue-600">Empresas</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            A plataforma completa para gestão de fretes que simplifica a conexão entre transportadores e empresas, 
            otimizando custos e aumentando a eficiência logística.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Card para Motoristas */}
            <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-800">Para Motoristas</CardTitle>
                <CardDescription className="text-gray-600">
                  Encontre fretes próximos e aumente sua renda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Fretes próximos à sua localização</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Pagamentos garantidos e seguros</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Gestão completa de documentos</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Histórico detalhado de viagens</span>
                  </div>
                </div>
                <div className="pt-6 space-y-3">
                  <Button 
                    onClick={handleDriverRegister}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                  >
                    Cadastrar como Motorista
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleDriverLogin}
                    className="w-full border-green-500 text-green-600 hover:bg-green-50"
                  >
                    Já sou motorista
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Card para Empresas */}
            <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mb-4">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-800">Para Empresas</CardTitle>
                <CardDescription className="text-gray-600">
                  Otimize sua logística e reduza custos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700">Rede de motoristas verificados</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700">Gestão completa de fretes</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700">Rastreamento em tempo real</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700">Relatórios e analytics</span>
                  </div>
                </div>
                <div className="pt-6 space-y-3">
                  <Button 
                    onClick={handleCompanyRegister}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                  >
                    Cadastrar Empresa
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCompanyLogin}
                    className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    Já tenho conta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              Por que escolher nossa plataforma?
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Oferecemos uma solução completa e segura para conectar motoristas e empresas,
              com tecnologia de ponta e suporte especializado.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Segurança Total</h4>
              <p className="text-gray-600">
                Todos os usuários são verificados e documentos validados para garantir transações seguras.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Agilidade</h4>
              <p className="text-gray-600">
                Encontre fretes ou motoristas em poucos cliques, com processo otimizado e intuitivo.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Rastreamento</h4>
              <p className="text-gray-600">
                Acompanhe suas cargas em tempo real com tecnologia de geolocalização avançada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Pronto para revolucionar sua logística?
          </h3>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de motoristas e empresas que já confiam em nossa plataforma
            para otimizar seus processos logísticos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleCompanyRegister}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
            >
              Cadastrar Empresa
            </Button>
            <Button 
              onClick={handleDriverRegister}
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold"
            >
              Cadastrar Motorista
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <h5 className="text-xl font-bold">FreightConnect</h5>
              </div>
              <p className="text-gray-400">
                Conectando motoristas e empresas para uma logística mais eficiente.
              </p>
            </div>
            
            <div>
              <h6 className="font-semibold mb-4">Para Motoristas</h6>
              <ul className="space-y-2 text-gray-400">
                <li>Encontrar Fretes</li>
                <li>Gestão de Documentos</li>
                <li>Histórico de Viagens</li>
                <li>Suporte 24/7</li>
              </ul>
            </div>
            
            <div>
              <h6 className="font-semibold mb-4">Para Empresas</h6>
              <ul className="space-y-2 text-gray-400">
                <li>Solicitar Frete</li>
                <li>Rede de Motoristas</li>
                <li>Rastreamento</li>
                <li>Relatórios</li>
              </ul>
            </div>
            
            <div>
              <h6 className="font-semibold mb-4">Contato</h6>
              <ul className="space-y-2 text-gray-400">
                <li>suporte@freightconnect.com</li>
                <li>(11) 9999-9999</li>
                <li>Segunda - Sexta: 8h às 18h</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 FreightConnect. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
