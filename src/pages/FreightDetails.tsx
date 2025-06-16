
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFreightDetails } from '@/hooks/useFreightDetails';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  FileText, 
  Handshake 
} from 'lucide-react';
import FreightTypeBadge from '@/components/FreightTypeBadge';
import FreightDetailsSection from '@/components/FreightDetailsSection';

const FreightDetails = () => {
  const { freightCode } = useParams<{ freightCode: string }>();
  const navigate = useNavigate();
  const { freight, loading, error } = useFreightDetails(freightCode || '');
  const { user } = useAuth();

  const handleInterest = () => {
    if (user) {
      console.log('User interested in freight:', freightCode);
    } else {
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !freight) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Alert variant="destructive">
          <FileText className="h-4 w-4" />
          <AlertDescription>
            {error || 'Frete não encontrado'}
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          onClick={() => navigate('/lista-fretes')} 
          className="mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para lista
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/lista-fretes')}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <FreightTypeBadge type={freight.tipo_frete} />
        </div>
        
        <Button 
          onClick={handleInterest} 
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
        >
          <Handshake className="w-4 h-4 mr-2" />
          Tenho Interesse
        </Button>
      </div>

      {/* Título */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {freight.codigo_agregamento}
        </h1>
        <p className="text-gray-600 text-lg">
          {freight.tipo_frete === 'agregamento' && 'Sistema de Agregamento'}
          {freight.tipo_frete === 'frete_completo' && 'Frete Completo'}
          {freight.tipo_frete === 'frete_de_retorno' && 'Frete de Retorno'}
          {freight.tipo_frete === 'comum' && 'Frete Comum'}
          {' • '} 
          {freight.origem_cidade}, {freight.origem_estado} → {' '}
          {freight.destino_cidade ? `${freight.destino_cidade}, ${freight.destino_estado}` : 
           freight.destinos.length > 0 ? `${freight.destinos.length} destino(s)` : 'Múltiplos destinos'}
        </p>
      </div>

      {/* Conteúdo Detalhado */}
      <FreightDetailsSection freight={freight} />
    </div>
  );
};

export default FreightDetails;
