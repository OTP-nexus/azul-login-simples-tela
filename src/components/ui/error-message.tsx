
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { FreightNotFound } from '@/components/FreightNotFound';

interface ErrorMessageProps {
  error?: string;
  freightCode?: string;
  showFreightNotFound?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  error, 
  freightCode,
  showFreightNotFound = false 
}) => {
  if (!error) return null;

  // Se for erro de frete não encontrado e temos o código, mostrar componente específico
  if (showFreightNotFound && error.includes('não encontrado')) {
    return <FreightNotFound freightCode={freightCode} error={error} />;
  }

  return (
    <div className="flex items-center space-x-2 text-red-600 text-sm mt-1">
      <AlertCircle className="w-4 h-4" />
      <span>{error}</span>
    </div>
  );
};
