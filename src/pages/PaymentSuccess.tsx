import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const { refreshSubscription } = useSubscription();

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      
      try {
        // Primeiro, aguardar um pouco para o webhook processar
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Tentar atualizar a assinatura
        await refreshSubscription();
        
        // Se temos session_id, verificar manualmente como backup
        if (sessionId) {
          try {
            const { data, error } = await supabase.functions.invoke('verify-payment', {
              body: { sessionId }
            });
            
            if (error) {
              console.warn('Verificação manual falhou:', error);
            } else if (data?.success) {
              toast.success('Assinatura ativada com sucesso!');
              await refreshSubscription();
            }
          } catch (verifyError) {
            console.warn('Erro na verificação manual:', verifyError);
          }
        }
        
      } catch (error) {
        console.error('Erro na verificação de pagamento:', error);
        setVerificationError('Não foi possível verificar o pagamento. Tente atualizar a página.');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [refreshSubscription, searchParams]);

  const sessionId = searchParams.get('session_id');

  const handleManualVerification = async () => {
    if (!sessionId) {
      toast.error('ID da sessão não encontrado');
      return;
    }

    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { sessionId }
      });
      
      if (error) {
        toast.error('Erro ao verificar pagamento');
        setVerificationError('Erro na verificação manual');
      } else if (data?.success) {
        toast.success('Assinatura ativada com sucesso!');
        await refreshSubscription();
        setVerificationError(null);
      }
    } catch (error) {
      toast.error('Erro ao verificar pagamento');
      setVerificationError('Erro na verificação manual');
    } finally {
      setIsVerifying(false);
    }
  };

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
              {verificationError && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mx-auto mb-2" />
                  <p className="text-sm text-yellow-700">{verificationError}</p>
                  {sessionId && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleManualVerification}
                      className="mt-2"
                    >
                      Tentar Novamente
                    </Button>
                  )}
                </div>
              )}
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