import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Settings, DollarSign, Bell, FileText, Zap, MoreHorizontal, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  price_monthly: number;
  target_user_type: string;
  features: string[];
  contact_views_limit: number;
  freight_limit: number;
  trial_days: number;
  is_active: boolean;
}

interface SystemSetting {
  key: string;
  value: any;
  description: string;
}

export default function AdminSettings() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar planos reais (usando 'as any' para contornar limitações do schema)
      const { data: plansData, error: plansError } = await supabase
        .from('subscription_plans' as any)
        .select('*')
        .order('price_monthly', { ascending: true });

      if (plansError) {
        console.error('Erro ao buscar planos:', plansError);
      } else {
        setPlans((plansData as any) || []);
      }

      // Buscar configurações reais do sistema (usando 'as any' para contornar limitações do schema)
      const { data: settingsData, error: settingsError } = await supabase
        .from('system_settings' as any)
        .select('*');

      if (settingsError) {
        console.error('Erro ao buscar configurações:', settingsError);
        // Se não encontrar configurações, criar algumas padrões
        const defaultSettings: SystemSetting[] = [
          { key: 'platform_name', value: 'FreteFlow', description: 'Nome da plataforma' },
          { key: 'support_email', value: 'suporte@freteflow.com', description: 'Email de suporte' },
          { key: 'maintenance_mode', value: false, description: 'Modo de manutenção' }
        ];
        setSettings(defaultSettings);
      } else {
        // Mapear dados para o formato esperado
        const formattedSettings: SystemSetting[] = (settingsData || []).map((setting: any) => ({
          key: setting.key,
          value: setting.value,
          description: setting.description || ''
        }));
        setSettings(formattedSettings);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      // Tentar atualizar no banco (usando 'as any' para contornar limitações do schema)
      const { error } = await supabase
        .from('system_settings' as any)
        .upsert({ 
          key, 
          value: typeof value === 'object' ? value : { value },
          description: settings.find(s => s.key === key)?.description || ''
        });

      if (error) {
        console.error('Erro ao atualizar configuração:', error);
        toast({
          title: "Erro",
          description: "Erro ao salvar configuração no banco de dados.",
          variant: "destructive"
        });
        return;
      }

      // Atualizar estado local
      setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
      toast({
        title: "Configuração atualizada",
        description: "A configuração foi salva com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar configuração.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-center">Carregando configurações...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="plans">Planos</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="integrations">Integrações</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações Gerais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="platform-name">Nome da Plataforma</Label>
                    <Input 
                      id="platform-name" 
                      defaultValue="FreteFlow" 
                      onBlur={(e) => updateSetting('platform_name', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="support-email">Email de Suporte</Label>
                    <Input 
                      id="support-email" 
                      type="email" 
                      defaultValue="suporte@freteflow.com"
                      onBlur={(e) => updateSetting('support_email', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maintenance-message">Mensagem de Manutenção</Label>
                  <Textarea 
                    id="maintenance-message" 
                    placeholder="Mensagem exibida durante manutenção"
                    onBlur={(e) => updateSetting('maintenance_message', e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    id="maintenance-mode" 
                    onCheckedChange={(checked) => updateSetting('maintenance_mode', checked)}
                  />
                  <Label htmlFor="maintenance-mode">Modo de Manutenção</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    id="new-registrations" 
                    defaultChecked
                    onCheckedChange={(checked) => updateSetting('allow_new_registrations', checked)}
                  />
                  <Label htmlFor="new-registrations">Permitir Novos Cadastros</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Planos de Assinatura</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Plano
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Limite de Contatos</TableHead>
                      <TableHead>Limite de Fretes</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell className="font-medium">{plan.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{plan.target_user_type}</Badge>
                        </TableCell>
                        <TableCell>
                          {plan.price_monthly ? `R$ ${plan.price_monthly}` : 'Gratuito'}
                        </TableCell>
                        <TableCell>
                          {plan.contact_views_limit === -1 ? 'Ilimitado' : plan.contact_views_limit}
                        </TableCell>
                        <TableCell>
                          {plan.freight_limit === -1 ? 'Ilimitado' : plan.freight_limit}
                        </TableCell>
                        <TableCell>
                          <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                            {plan.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>Editar</DropdownMenuItem>
                              <DropdownMenuItem>
                                {plan.is_active ? 'Desativar' : 'Ativar'}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Configurações de Notificação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="email-notifications" defaultChecked />
                  <Label htmlFor="email-notifications">Notificações por Email</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="push-notifications" defaultChecked />
                  <Label htmlFor="push-notifications">Notificações Push</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="sms-notifications" />
                  <Label htmlFor="sms-notifications">Notificações por SMS</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notification-frequency">Frequência de Relatórios</Label>
                  <select className="w-full p-2 border rounded">
                    <option value="daily">Diário</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Integrações Externas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Stripe</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Processamento de pagamentos
                    </p>
                    <Badge variant="default">Conectado</Badge>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">SendGrid</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Envio de emails transacionais
                    </p>
                    <Badge variant="secondary">Não conectado</Badge>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Google Analytics</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Analytics e métricas
                    </p>
                    <Badge variant="secondary">Não conectado</Badge>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Webhooks</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Integrações personalizadas
                    </p>
                    <Badge variant="default">Ativo</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}