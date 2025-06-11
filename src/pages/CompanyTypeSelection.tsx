
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyTypeSelection from '@/components/CompanyTypeSelection';

const CompanyTypeSelectionPage = () => {
  const navigate = useNavigate();

  const handleCompanyTypeSelect = (isTransporter: boolean) => {
    // Armazenar o tipo da empresa no localStorage temporariamente
    localStorage.setItem('companyType', isTransporter.toString());
    
    // Navegar para o formulário de cadastro da empresa
    navigate('/register/company/form');
  };

  return <CompanyTypeSelection onSelect={handleCompanyTypeSelect} />;
};

export default CompanyTypeSelectionPage;
