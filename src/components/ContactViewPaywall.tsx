
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Star, Phone, MessageCircle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface ContactViewPaywallProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export const ContactViewPaywall: React.FC<ContactViewPaywallProps> = ({
  isOpen,
  onClose,
  onUpgrade
}) => {
  const { contactViewsRemaining, plan } = useSubscription();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await onUpgrade();
    } finally {
      setIsUpgrading(false);
    }
  };

  const features = [
    {
      icon: Eye,
      title: 'Visualizações Ilimitadas',
      description: 'Veja todos os contatos das empresas sem limite'
    },
    {
      icon: Phone,
      title: 'Telefone Direto',
      description: 'Acesso ao telefone completo das empresas'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp Direto',
      description: 'Link direto para WhatsApp das empresas'
    },
    {
      icon: Star,
      title: 'Suporte Prioritário',
      description: 'Atendimento prioritário e suporte técnico'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {contactViewsRemaining > 0 ? 'Limite Quase Atingido' : 'Limite de Visualizações Atingido'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {contactViewsRemaining > 0 
              ? `Você tem apenas ${contactViewsRemaining} visualizações restantes este mês.`
              : 'Você atingiu o limite de visualizações de contato deste mês.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-800">R$ 29,90</div>
                <div className="text-sm text-orange-600">/mês</div>
                <div className="text-lg font-semibold text-orange-800 mt-1">Plano Premium</div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-start gap-3">
                  <Icon className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">{feature.title}</div>
                    <div className="text-xs text-gray-600">{feature.description}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-2 pt-4">
            <Button 
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="w-full"
            >
              {isUpgrading ? 'Processando...' : 'Fazer Upgrade Agora'}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              Continuar com Plano Gratuito
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Cancele a qualquer momento • Suporte 24/7 • Sem taxas ocultas
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
