
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Building2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CompanyTypeSelectionProps {
  onSelect: (isTransporter: boolean) => void;
}

const CompanyTypeSelection: React.FC<CompanyTypeSelectionProps> = ({ onSelect }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-4 text-center pb-6">
            <button
              onClick={() => navigate('/register')}
              className="absolute left-6 top-6 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Tipo de Empresa
            </CardTitle>
            <CardDescription className="text-gray-600">
              Selecione o tipo da sua empresa
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card 
                className="cursor-pointer border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-200 group"
                onClick={() => onSelect(true)}
              >
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                    <Truck className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Transportadora
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Empresa que oferece serviços de transporte e logística
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-200 group"
                onClick={() => onSelect(false)}
              >
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Empresa Cliente
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Empresa que contrata serviços de transporte
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-center pt-4">
              <span className="text-gray-600">
                Já tem uma conta?
              </span>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="ml-1 text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Fazer login
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyTypeSelection;
