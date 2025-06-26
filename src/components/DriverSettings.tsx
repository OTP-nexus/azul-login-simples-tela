
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Bell, 
  Shield, 
  MapPin, 
  Truck, 
  CreditCard,
  Mail,
  Phone,
  Save,
  Key
} from 'lucide-react';

const DriverSettings = () => {
  const [notifications, setNotifications] = useState({
    newFreights: true,
    priceChanges: false,
    systemUpdates: true,
    marketing: false
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
        <p className="text-gray-600">Gerencie suas preferências e informações pessoais</p>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Pessoais
          </CardTitle>
          <CardDescription>
            Mantenha seus dados atualizados para melhor experiência
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input id="fullName" defaultValue="João Silva Santos" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" defaultValue="123.456.789-00" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="joao.silva@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" defaultValue="(11) 99999-9999" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnh">CNH</Label>
              <Input id="cnh" defaultValue="12345678900" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleType">Tipo de Veículo</Label>
              <Select defaultValue="caminhao">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="caminhao">Caminhão</SelectItem>
                  <SelectItem value="carreta">Carreta</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                  <SelectItem value="pickup">Pickup</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="w-full md:w-auto">
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </CardContent>
      </Card>

      {/* Vehicle Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Informações do Veículo
          </CardTitle>
          <CardDescription>
            Configure as especificações do seu veículo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plate">Placa</Label>
              <Input id="plate" defaultValue="ABC-1234" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidade (kg)</Label>
              <Input id="capacity" type="number" defaultValue="5000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="length">Comprimento (m)</Label>
              <Input id="length" type="number" step="0.1" defaultValue="6.0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Altura (m)</Label>
              <Input id="height" type="number" step="0.1" defaultValue="2.5" />
            </div>
          </div>
          <Button className="w-full md:w-auto">
            <Save className="h-4 w-4 mr-2" />
            Atualizar Veículo
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
          </CardTitle>
          <CardDescription>
            Configure como e quando você quer ser notificado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Novos Fretes</Label>
                <p className="text-sm text-gray-600">
                  Receba notificações quando novos fretes estiverem disponíveis
                </p>
              </div>
              <Switch
                checked={notifications.newFreights}
                onCheckedChange={(checked) =>
                  setNotifications(prev => ({ ...prev, newFreights: checked }))
                }
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mudanças de Preço</Label>
                <p className="text-sm text-gray-600">
                  Notificações sobre alterações de preços em fretes favoritos
                </p>
              </div>
              <Switch
                checked={notifications.priceChanges}
                onCheckedChange={(checked) =>
                  setNotifications(prev => ({ ...prev, priceChanges: checked }))
                }
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Atualizações do Sistema</Label>
                <p className="text-sm text-gray-600">
                  Informações sobre novas funcionalidades e manutenções
                </p>
              </div>
              <Switch
                checked={notifications.systemUpdates}
                onCheckedChange={(checked) =>
                  setNotifications(prev => ({ ...prev, systemUpdates: checked }))
                }
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Marketing</Label>
                <p className="text-sm text-gray-600">
                  Ofertas especiais e conteúdo promocional
                </p>
              </div>
              <Switch
                checked={notifications.marketing}
                onCheckedChange={(checked) =>
                  setNotifications(prev => ({ ...prev, marketing: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Segurança
          </CardTitle>
          <CardDescription>
            Gerencie a segurança da sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full md:w-auto">
            <Key className="h-4 w-4 mr-2" />
            Alterar Senha
          </Button>
          <div className="text-sm text-gray-600">
            <p>Última alteração de senha: 15 de dezembro de 2024</p>
          </div>
        </CardContent>
      </Card>

      {/* Location Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Preferências de Localização
          </CardTitle>
          <CardDescription>
            Configure suas regiões preferenciais para fretes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="baseCity">Cidade Base</Label>
              <Input id="baseCity" defaultValue="São Paulo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseState">Estado Base</Label>
              <Select defaultValue="SP">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SP">São Paulo</SelectItem>
                  <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                  <SelectItem value="MG">Minas Gerais</SelectItem>
                  <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="radius">Raio de Operação (km)</Label>
            <Input id="radius" type="number" defaultValue="500" />
          </div>
          <Button className="w-full md:w-auto">
            <Save className="h-4 w-4 mr-2" />
            Salvar Preferências
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverSettings;
