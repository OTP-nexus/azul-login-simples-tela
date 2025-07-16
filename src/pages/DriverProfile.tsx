import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Phone, 
  Mail, 
  CreditCard, 
  Truck, 
  FileText, 
  Camera,
  Home,
  CheckCircle,
  AlertCircle,
  XCircle,
  Edit2,
  Save,
  X,
  ArrowLeft,
  HelpCircle
} from 'lucide-react';
import { useDriverProfile } from '@/hooks/useDriverProfile';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const DriverProfile = () => {
  const { data, loading, error, updateProfile, updateDriver } = useDriverProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    vehicle_type: ''
  });

  // Inicializar dados do formulário quando os dados estão carregados
  React.useEffect(() => {
    if (data.profile && data.driver) {
      setFormData({
        full_name: data.profile.full_name || '',
        phone: data.profile.phone || '',
        vehicle_type: data.driver.vehicle_type || ''
      });
    }
  }, [data.profile, data.driver]);

  const handleSave = async () => {
    try {
      const profileUpdates = {
        full_name: formData.full_name,
        phone: formData.phone
      };

      const driverUpdates = {
        vehicle_type: formData.vehicle_type
      };

      const [profileResult, driverResult] = await Promise.all([
        updateProfile(profileUpdates),
        updateDriver(driverUpdates)
      ]);

      if (profileResult.error || driverResult.error) {
        toast({
          title: "Erro",
          description: "Erro ao atualizar dados",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Dados atualizados com sucesso!",
        variant: "default"
      });

      setEditing(false);
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao salvar dados",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    // Restaurar dados originais
    if (data.profile && data.driver) {
      setFormData({
        full_name: data.profile.full_name || '',
        phone: data.profile.phone || '',
        vehicle_type: data.driver.vehicle_type || ''
      });
    }
    setEditing(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800 text-sm"><CheckCircle className="w-4 h-4 mr-1" />Aprovado</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-sm"><AlertCircle className="w-4 h-4 mr-1" />Pendente</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="text-sm"><XCircle className="w-4 h-4 mr-1" />Rejeitado</Badge>;
      default:
        return <Badge variant="outline" className="text-sm"><FileText className="w-4 h-4 mr-1" />Não enviado</Badge>;
    }
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '';
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-xl">Erro</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => navigate('/driver-dashboard')} className="w-full">
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { profile, driver, documents } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/driver-dashboard')}
                  className="p-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
                  <p className="text-gray-600">Gerencie suas informações pessoais</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {!editing ? (
                  <Button onClick={() => setEditing(true)} className="flex items-center space-x-2">
                    <Edit2 className="h-4 w-4" />
                    <span>Editar</span>
                  </Button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button onClick={handleSave} className="flex items-center space-x-2">
                      <Save className="h-4 w-4" />
                      <span>Salvar</span>
                    </Button>
                    <Button variant="outline" onClick={handleCancel} className="flex items-center space-x-2">
                      <X className="h-4 w-4" />
                      <span>Cancelar</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={documents?.photo_url || undefined} />
                  <AvatarFallback className="text-xl">
                    {profile?.full_name?.charAt(0) || 'M'}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{profile?.full_name}</CardTitle>
                <p className="text-gray-600">Motorista</p>
                <div className="mt-4">
                  {getStatusBadge(documents?.overall_status || 'not_submitted')}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-700">{profile?.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-700">
                      {profile?.phone ? formatPhone(profile.phone) : 'Não informado'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-700">
                      {driver?.cpf ? formatCPF(driver.cpf) : 'Não informado'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HelpCircle className="h-5 w-5" />
                  <span>Precisa de Ajuda?</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Nossa equipe está pronta para ajudá-lo com qualquer dúvida.
                </p>
                <Button variant="outline" className="w-full">
                  Entrar em Contato
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Informações Pessoais</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="full_name" className="text-base font-medium">Nome Completo</Label>
                    {editing ? (
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                        className="mt-2 text-base h-12"
                        placeholder="Digite seu nome completo"
                      />
                    ) : (
                      <p className="mt-2 text-base text-gray-900 bg-gray-50 p-3 rounded-md">
                        {profile?.full_name || 'Não informado'}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-base font-medium">Telefone</Label>
                    {editing ? (
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="mt-2 text-base h-12"
                        placeholder="(11) 99999-9999"
                      />
                    ) : (
                      <p className="mt-2 text-base text-gray-900 bg-gray-50 p-3 rounded-md">
                        {profile?.phone ? formatPhone(profile.phone) : 'Não informado'}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-base font-medium">Email</Label>
                    <p className="mt-2 text-base text-gray-900 bg-gray-50 p-3 rounded-md">
                      {profile?.email}
                    </p>
                  </div>

                  <div>
                    <Label className="text-base font-medium">CPF</Label>
                    <p className="mt-2 text-base text-gray-900 bg-gray-50 p-3 rounded-md">
                      {driver?.cpf ? formatCPF(driver.cpf) : 'Não informado'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="h-5 w-5" />
                  <span>Informações do Veículo</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="vehicle_type" className="text-base font-medium">Tipo de Veículo</Label>
                    {editing ? (
                      <Input
                        id="vehicle_type"
                        value={formData.vehicle_type}
                        onChange={(e) => setFormData(prev => ({ ...prev, vehicle_type: e.target.value }))}
                        className="mt-2 text-base h-12"
                        placeholder="Ex: Caminhão, Van, Carreta"
                      />
                    ) : (
                      <p className="mt-2 text-base text-gray-900 bg-gray-50 p-3 rounded-md">
                        {driver?.vehicle_type || 'Não informado'}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-base font-medium">CNH</Label>
                    <p className="mt-2 text-base text-gray-900 bg-gray-50 p-3 rounded-md">
                      {driver?.cnh || 'Não informado'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Status dos Documentos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <span className="text-base font-medium">CNH</span>
                    </div>
                    {getStatusBadge(documents?.cnh_document_status || 'not_submitted')}
                  </div>

                  <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Camera className="h-5 w-5 text-gray-400" />
                      <span className="text-base font-medium">Foto do Perfil</span>
                    </div>
                    {getStatusBadge(documents?.photo_status || 'not_submitted')}
                  </div>

                  <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Home className="h-5 w-5 text-gray-400" />
                      <span className="text-base font-medium">Comprovante de Endereço</span>
                    </div>
                    {getStatusBadge(documents?.driver_address_proof_status || 'not_submitted')}
                  </div>

                  {documents?.rejection_reason && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        <strong>Motivo da rejeição:</strong> {documents.rejection_reason}
                      </p>
                    </div>
                  )}

                  {documents?.overall_status === 'not_submitted' && (
                    <div className="mt-4">
                      <Button 
                        onClick={() => navigate('/driver-document-verification')}
                        className="w-full text-base h-12"
                      >
                        Enviar Documentos
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;