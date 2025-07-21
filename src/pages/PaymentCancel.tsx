import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <CardTitle className="text-red-700">Pagamento Cancelado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              O pagamento foi cancelado. Nenhuma cobrança foi realizada.
            </p>
            
            <p className="text-sm text-muted-foreground">
              Se você encontrou algum problema, entre em contato conosco para obter ajuda.
            </p>

            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/plans')} 
                className="w-full"
              >
                Tentar Novamente
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/')} 
                className="w-full"
              >
                Voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default PaymentCancel;