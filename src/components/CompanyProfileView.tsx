
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, User, Phone, MapPin, FileText, Truck } from 'lucide-react';

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Informações da Empresa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="w-5 h-5" />
            <span>Dados da Empresa</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Nome da Empresa</label>
            <p className="text-base font-medium text-gray-900">{company.company_name}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">CNPJ</label>
            <p className="text-base text-gray-900">{formatCNPJ(company.cnpj)}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Tipo de Empresa</label>
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-blue-600" />
              <p className="text-base text-gray-900">
                {company.is_transporter ? 'Transportadora' : 'Embarcadora'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações de Contato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Responsável</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Nome do Responsável</label>
            <p className="text-base font-medium text-gray-900">{company.contact_name}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Telefone Principal</label>
            <p className="text-base text-gray-900">{formatPhone(company.phone)}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Telefone Confirmação</label>
            <p className="text-base text-gray-900">{formatPhone(company.confirm_phone)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Endereço</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">CEP</label>
              <p className="text-base text-gray-900">{formatCEP(company.cep)}</p>
            </div>
            
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-600">Rua</label>
              <p className="text-base text-gray-900">{company.street}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Número</label>
              <p className="text-base text-gray-900">{company.number}</p>
            </div>

            {company.complement && (
              <div>
                <label className="text-sm font-medium text-gray-600">Complemento</label>
                <p className="text-base text-gray-900">{company.complement}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-600">Bairro</label>
              <p className="text-base text-gray-900">{company.neighborhood}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Cidade</label>
              <p className="text-base text-gray-900">{company.city}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Estado</label>
              <p className="text-base text-gray-900">{company.state}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyProfileView;
