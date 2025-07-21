import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';
import Navbar from '@/components/Navbar';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const { refreshSubscription } = useSubscription();

  useEffect(() => {
    const verifyPayment = async () => {
      // Aguardar um pouco para o webhook processar
      setTimeout(async () => {
        await refreshSubscription();
        setIsVerifying(false);
      }, 3000);
    };

    verifyPayment();
  }, [refreshSubscription]);

  const sessionId = searchParams.get('session_id');

  if (isVerifying) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <CardTitle>Verificando Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Aguarde enquanto confirmamos seu pagamento...
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <CardTitle className="text-green-700">Pagamento Confirmado!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Seu pagamento foi processado com sucesso. Sua assinatura já está ativa!
            </p>
            
            {sessionId && (
              <p className="text-sm text-muted-foreground">
                ID da sessão: {sessionId.slice(-8)}
              </p>
            )}

            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/dashboard')} 
                className="w-full"
              >
                Ir para Dashboard
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

export default PaymentSuccess;