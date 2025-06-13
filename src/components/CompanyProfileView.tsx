
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, User, Phone, MapPin, Truck, CheckCircle } from 'lucide-react';

interface Company {
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

interface CompanyProfileViewProps {
  company: Company;
}

const CompanyProfileView: React.FC<CompanyProfileViewProps> = ({ company }) => {
  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
  };

  const formatCEP = (cep: string) => {
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const InfoItem = ({ label, value, icon: Icon }: { label: string; value: string; icon?: any }) => (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        {Icon && <Icon className="w-4 h-4 text-blue-600" />}
        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{label}</label>
      </div>
      <p className="text-lg text-gray-900 font-medium pl-6">{value}</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Informações da Empresa */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-3 text-xl">
            <Building className="w-6 h-6" />
            <span>Dados da Empresa</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <InfoItem
            label="Nome da Empresa"
            value={company.company_name}
            icon={Building}
          />
          
          <InfoItem
            label="CNPJ"
            value={formatCNPJ(company.cnpj)}
            icon={CheckCircle}
          />

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-blue-600" />
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Tipo de Empresa</label>
            </div>
            <div className="flex items-center space-x-3 pl-6">
              <div className={`w-3 h-3 rounded-full ${company.is_transporter ? 'bg-green-500' : 'bg-blue-500'}`}></div>
              <p className="text-lg text-gray-900 font-medium">
                {company.is_transporter ? 'Transportadora' : 'Embarcadora'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações de Contato */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-3 text-xl">
            <User className="w-6 h-6" />
            <span>Responsável</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <InfoItem
            label="Nome do Responsável"
            value={company.contact_name}
            icon={User}
          />
          
          <InfoItem
            label="Telefone Principal"
            value={formatPhone(company.phone)}
            icon={Phone}
          />

          <InfoItem
            label="Telefone Confirmação"
            value={formatPhone(company.confirm_phone)}
            icon={Phone}
          />
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card className="lg:col-span-2 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-3 text-xl">
            <MapPin className="w-6 h-6" />
            <span>Endereço Completo</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <InfoItem
              label="CEP"
              value={formatCEP(company.cep)}
            />
            
            <div className="md:col-span-2 lg:col-span-2">
              <InfoItem
                label="Rua"
                value={company.street}
              />
            </div>

            <InfoItem
              label="Número"
              value={company.number}
            />

            {company.complement && (
              <InfoItem
                label="Complemento"
                value={company.complement}
              />
            )}

            <InfoItem
              label="Bairro"
              value={company.neighborhood}
            />

            <InfoItem
              label="Cidade"
              value={company.city}
            />

            <InfoItem
              label="Estado"
              value={company.state}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyProfileView;
