
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building, User, Phone, MapPin } from 'lucide-react';

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

  const InfoSection = ({ icon: Icon, title, children }: { 
    icon: any; 
    title: string; 
    children: React.ReactNode;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <Icon className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
            <div className="space-y-3">
              {children}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const InfoItem = ({ label, value }: { label: string; value: string }) => (
    <div>
      <span className="text-sm text-gray-500 block">{label}</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Dados da Empresa */}
      <InfoSection icon={Building} title="Dados da Empresa">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem label="Nome da Empresa" value={company.company_name} />
          <InfoItem label="CNPJ" value={formatCNPJ(company.cnpj)} />
        </div>
      </InfoSection>

      {/* Contato */}
      <InfoSection icon={User} title="Responsável">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem label="Nome" value={company.contact_name} />
          <InfoItem label="Telefone" value={formatPhone(company.phone)} />
          <InfoItem label="Confirmação" value={formatPhone(company.confirm_phone)} />
        </div>
      </InfoSection>

      {/* Endereço */}
      <InfoSection icon={MapPin} title="Endereço">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoItem label="CEP" value={formatCEP(company.cep)} />
          <InfoItem label="Rua" value={company.street} />
          <InfoItem label="Número" value={company.number} />
          {company.complement && (
            <InfoItem label="Complemento" value={company.complement} />
          )}
          <InfoItem label="Bairro" value={company.neighborhood} />
          <InfoItem label="Cidade" value={company.city} />
          <InfoItem label="Estado" value={company.state} />
        </div>
      </InfoSection>
    </div>
  );
};

export default CompanyProfileView;
