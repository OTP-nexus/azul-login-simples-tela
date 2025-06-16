
import React from 'react';
import { AlertCircle, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface FreightNotFoundProps {
  freightCode?: string;
  error?: string;
}

export const FreightNotFound: React.FC<FreightNotFoundProps> = ({ 
  freightCode, 
  error = 'Frete não encontrado' 
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="bg-red-50 rounded-full p-4 mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {error}
      </h2>
      
      {freightCode && (
        <p className="text-gray-600 mb-4">
          O código do frete <span className="font-mono font-semibold">{freightCode}</span> não foi encontrado.
        </p>
      )}
      
      <p className="text-gray-500 mb-6 max-w-md">
        Verifique se o código está correto ou se o frete ainda está ativo. 
        Fretes podem ser removidos ou ter seu status alterado.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={() => navigate('/public-freights-list-v2')}
          variant="default"
          className="flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Ver Todos os Fretes
        </Button>
        
        <Button 
          onClick={() => navigate(-1)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
      </div>
    </div>
  );
};
