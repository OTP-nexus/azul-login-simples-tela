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
  HelpCircle,
  Crown
} from 'lucide-react';
import { useDriverProfile } from '@/hooks/useDriverProfile';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const DriverProfile = () => {
  const { data, loading, error, refetch, updateProfile, updateDriver, updateAvailability } = useDriverProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    vehicle_type: '',
    // Novos campos de endereço
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    // Novos campos de veículo
    main_vehicle_plate: '',
    main_vehicle_model: '',
    main_vehicle_year: '',
    main_vehicle_capacity: '',
    main_vehicle_body_type: '',
    // Campos de disponibilidade
    available_days: [] as number[],
    start_time: '',
    end_time: '',
    preferred_regions: [] as string[]
  });

  // Inicializar dados do formulário quando os dados estão carregados
  React.useEffect(() => {
    if (data.profile || data.driver || data.availability) {
      setFormData({
        full_name: data.profile?.full_name || '',
        phone: data.profile?.phone || '',
        vehicle_type: data.driver?.vehicle_type || '',
        // Campos de endereço
        cep: data.driver?.cep || '',
        street: data.driver?.street || '',
        number: data.driver?.number || '',
        complement: data.driver?.complement || '',
        neighborhood: data.driver?.neighborhood || '',
        city: data.driver?.city || '',
        state: data.driver?.state || '',
        // Campos de veículo
        main_vehicle_plate: data.driver?.main_vehicle_plate || '',
        main_vehicle_model: data.driver?.main_vehicle_model || '',
        main_vehicle_year: data.driver?.main_vehicle_year?.toString() || '',
        main_vehicle_capacity: data.driver?.main_vehicle_capacity?.toString() || '',
        main_vehicle_body_type: data.driver?.main_vehicle_body_type || '',
        // Campos de disponibilidade
        available_days: data.availability?.available_days || [],
        start_time: data.availability?.start_time || '',
        end_time: data.availability?.end_time || '',
        preferred_regions: data.availability?.preferred_regions || []
      });
    }
  }, [data.profile, data.driver, data.availability]);

  const handleSave = async () => {
    try {
      // Atualizar perfil
      const profileUpdates = {
        full_name: formData.full_name,
        phone: formData.phone
      };

      // Atualizar dados do motorista se existir
      const updates = [updateProfile(profileUpdates)];
      
      if (data.driver) {
        const driverUpdates = {
          vehicle_type: formData.vehicle_type,
          cep: formData.cep,
          street: formData.street,
          number: formData.number,
          complement: formData.complement,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
          main_vehicle_plate: formData.main_vehicle_plate,
          main_vehicle_model: formData.main_vehicle_model,
          main_vehicle_year: parseInt(formData.main_vehicle_year) || undefined,
          main_vehicle_capacity: parseFloat(formData.main_vehicle_capacity) || undefined,
          main_vehicle_body_type: formData.main_vehicle_body_type
        };
        updates.push(updateDriver(driverUpdates));
      }

      // Atualizar disponibilidade
      if (data.driver) {
        const availabilityUpdates = {
          available_days: formData.available_days,
          start_time: formData.start_time,
          end_time: formData.end_time,
          preferred_regions: formData.preferred_regions
        };
        updates.push(updateAvailability(availabilityUpdates));
      }

      const results = await Promise.all(updates);
      
      if (results.some(result => result.error)) {
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
      refetch(); // Recarregar dados
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
    if (data.profile || data.driver || data.availability) {
      setFormData({
        full_name: data.profile?.full_name || '',
        phone: data.profile?.phone || '',
        vehicle_type: data.driver?.vehicle_type || '',
        // Campos de endereço
        cep: data.driver?.cep || '',
        street: data.driver?.street || '',
        number: data.driver?.number || '',
        complement: data.driver?.complement || '',
        neighborhood: data.driver?.neighborhood || '',
        city: data.driver?.city || '',
        state: data.driver?.state || '',
        // Campos de veículo
        main_vehicle_plate: data.driver?.main_vehicle_plate || '',
        main_vehicle_model: data.driver?.main_vehicle_model || '',
        main_vehicle_year: data.driver?.main_vehicle_year?.toString() || '',
        main_vehicle_capacity: data.driver?.main_vehicle_capacity?.toString() || '',
        main_vehicle_body_type: data.driver?.main_vehicle_body_type || '',
        // Campos de disponibilidade
        available_days: data.availability?.available_days || [],
        start_time: data.availability?.start_time || '',
        end_time: data.availability?.end_time || '',
        preferred_regions: data.availability?.preferred_regions || []
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
  
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-xl">Perfil não encontrado</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">Não foi possível carregar os dados do seu perfil.</p>
            <Button onClick={() => navigate('/driver-dashboard')} className="w-full">
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/driver-dashboard')}
                  className="p-2"
                >
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Meu Perfil</h1>
                  <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Gerencie suas informações pessoais</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-3">
                {!editing ? (
                  <Button onClick={() => setEditing(true)} className="flex items-center space-x-2 text-sm sm:text-base h-9 sm:h-10">
                    <Edit2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Editar</span>
                  </Button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button onClick={handleSave} className="flex items-center space-x-2 text-sm sm:text-base h-9 sm:h-10">
                      <Save className="h-4 w-4" />
                      <span className="hidden sm:inline">Salvar</span>
                    </Button>
                    <Button variant="outline" onClick={handleCancel} className="flex items-center space-x-2 text-sm sm:text-base h-9 sm:h-10">
                      <X className="h-4 w-4" />
                      <span className="hidden sm:inline">Cancelar</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center p-4 sm:p-6">
                <Avatar className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-3 sm:mb-4">
                  <AvatarImage src={documents?.photo_url || undefined} />
                  <AvatarFallback className="text-lg sm:text-xl">
                    {profile?.full_name?.charAt(0) || 'M'}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-lg sm:text-xl">{profile?.full_name}</CardTitle>
                <p className="text-sm sm:text-base text-gray-600">Motorista</p>
                <div className="mt-4">
                  {getStatusBadge(documents?.overall_status || 'not_submitted')}
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    <span className="text-xs sm:text-sm text-gray-700 break-all">{profile?.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    <span className="text-xs sm:text-sm text-gray-700">
                      {profile?.phone ? formatPhone(profile.phone) : 'Não informado'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    <span className="text-xs sm:text-sm text-gray-700">
                      {driver?.cpf ? formatCPF(driver.cpf) : 'Não informado'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* My Plan Card */}
            <Card className="mt-4 sm:mt-6">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                  <Crown className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Meu Plano</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="text-center space-y-3">
                  <div className="px-3 py-2 bg-gray-100 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">Plano Gratuito</p>
                    <p className="text-xs text-gray-600">5 contatos por mês</p>
                  </div>
                  <Button 
                    onClick={() => navigate('/driver/plans')}
                    className="w-full h-9 sm:h-10 text-sm sm:text-base"
                  >
                    Ver Planos
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Support Card */}
            <Card className="mt-4 sm:mt-6">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                  <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Precisa de Ajuda?</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="text-sm text-gray-600 mb-4">
                  Nossa equipe está pronta para ajudá-lo com qualquer dúvida.
                </p>
                <Button variant="outline" className="w-full h-9 sm:h-10 text-sm sm:text-base">
                  Entrar em Contato
                </Button>
              </CardContent>
            </Card>
          </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Alert for incomplete driver data */}
            {!driver && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                    <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-orange-900 text-sm sm:text-base">Cadastro Incompleto</h3>
                      <p className="text-sm text-orange-700 mt-1">
                        Você precisa completar seu cadastro como motorista para acessar todas as funcionalidades.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button 
                      onClick={() => navigate('/driver-registration')}
                      className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto h-9 sm:h-10 text-sm sm:text-base"
                    >
                      Completar Cadastro
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Personal Information */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Informações Pessoais</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Label htmlFor="full_name" className="text-sm sm:text-base font-medium">Nome Completo</Label>
                    {editing ? (
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                        className="mt-2 text-sm sm:text-base h-10 sm:h-12"
                        placeholder="Digite seu nome completo"
                      />
                    ) : (
                      <p className="mt-2 text-sm sm:text-base text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">
                        {profile?.full_name || 'Não informado'}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm sm:text-base font-medium">Telefone</Label>
                    {editing ? (
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="mt-2 text-sm sm:text-base h-10 sm:h-12"
                        placeholder="(11) 99999-9999"
                      />
                    ) : (
                      <p className="mt-2 text-sm sm:text-base text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">
                        {profile?.phone ? formatPhone(profile.phone) : 'Não informado'}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm sm:text-base font-medium">Email</Label>
                    <p className="mt-2 text-sm sm:text-base text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">
                      {profile?.email}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm sm:text-base font-medium">CPF</Label>
                    <p className="mt-2 text-sm sm:text-base text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">
                      {driver?.cpf ? formatCPF(driver.cpf) : 'Não informado'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Information */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                  <Truck className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Informações do Veículo</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Label htmlFor="vehicle_type" className="text-sm sm:text-base font-medium">Tipo de Veículo</Label>
                    {editing ? (
                      <Input
                        id="vehicle_type"
                        value={formData.vehicle_type}
                        onChange={(e) => setFormData(prev => ({ ...prev, vehicle_type: e.target.value }))}
                        className="mt-2 text-sm sm:text-base h-10 sm:h-12"
                        placeholder="Ex: Caminhão, Van, Carreta"
                      />
                    ) : (
                      <p className="mt-2 text-sm sm:text-base text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">
                        {data.driver?.vehicle_type || 'Não informado'}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm sm:text-base font-medium">CNH</Label>
                    <p className="mt-2 text-sm sm:text-base text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">
                      {data.driver?.cnh || 'Não informado'}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="main_vehicle_plate" className="text-sm sm:text-base font-medium">Placa</Label>
                    {editing ? (
                      <Input
                        id="main_vehicle_plate"
                        value={formData.main_vehicle_plate}
                        onChange={(e) => setFormData(prev => ({ ...prev, main_vehicle_plate: e.target.value }))}
                        className="mt-2 text-sm sm:text-base h-10 sm:h-12 uppercase"
                        placeholder="ABC-1234"
                      />
                    ) : (
                      <p className="mt-2 text-sm sm:text-base text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">
                        {data.driver?.main_vehicle_plate || 'Não informado'}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="main_vehicle_model" className="text-sm sm:text-base font-medium">Modelo</Label>
                    {editing ? (
                      <Input
                        id="main_vehicle_model"
                        value={formData.main_vehicle_model}
                        onChange={(e) => setFormData(prev => ({ ...prev, main_vehicle_model: e.target.value }))}
                        className="mt-2 text-sm sm:text-base h-10 sm:h-12"
                        placeholder="Ex: Scania R450"
                      />
                    ) : (
                      <p className="mt-2 text-sm sm:text-base text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">
                        {data.driver?.main_vehicle_model || 'Não informado'}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="main_vehicle_year" className="text-sm sm:text-base font-medium">Ano</Label>
                    {editing ? (
                      <Input
                        id="main_vehicle_year"
                        value={formData.main_vehicle_year}
                        onChange={(e) => setFormData(prev => ({ ...prev, main_vehicle_year: e.target.value }))}
                        className="mt-2 text-sm sm:text-base h-10 sm:h-12"
                        placeholder="2020"
                        type="number"
                      />
                    ) : (
                      <p className="mt-2 text-sm sm:text-base text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">
                        {data.driver?.main_vehicle_year || 'Não informado'}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="main_vehicle_capacity" className="text-sm sm:text-base font-medium">Capacidade (t)</Label>
                    {editing ? (
                      <Input
                        id="main_vehicle_capacity"
                        value={formData.main_vehicle_capacity}
                        onChange={(e) => setFormData(prev => ({ ...prev, main_vehicle_capacity: e.target.value }))}
                        className="mt-2 text-sm sm:text-base h-10 sm:h-12"
                        placeholder="15.5"
                        type="number"
                        step="0.1"
                      />
                    ) : (
                      <p className="mt-2 text-sm sm:text-base text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">
                        {data.driver?.main_vehicle_capacity ? `${data.driver.main_vehicle_capacity}t` : 'Não informado'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                  <Home className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Endereço Completo</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Label htmlFor="cep" className="text-sm sm:text-base font-medium">CEP</Label>
                    {editing ? (
                      <Input
                        id="cep"
                        value={formData.cep}
                        onChange={(e) => setFormData(prev => ({ ...prev, cep: e.target.value }))}
                        className="mt-2 text-sm sm:text-base h-10 sm:h-12"
                        placeholder="00000-000"
                      />
                    ) : (
                      <p className="mt-2 text-sm sm:text-base text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">
                        {data.driver?.cep || 'Não informado'}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="street" className="text-sm sm:text-base font-medium">Rua</Label>
                    {editing ? (
                      <Input
                        id="street"
                        value={formData.street}
                        onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                        className="mt-2 text-sm sm:text-base h-10 sm:h-12"
                        placeholder="Nome da rua"
                      />
                    ) : (
                      <p className="mt-2 text-sm sm:text-base text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">
                        {data.driver?.street || 'Não informado'}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="number" className="text-sm sm:text-base font-medium">Número</Label>
                    {editing ? (
                      <Input
                        id="number"
                        value={formData.number}
                        onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                        className="mt-2 text-sm sm:text-base h-10 sm:h-12"
                        placeholder="123"
                      />
                    ) : (
                      <p className="mt-2 text-sm sm:text-base text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">
                        {data.driver?.number || 'Não informado'}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="complement" className="text-sm sm:text-base font-medium">Complemento</Label>
                    {editing ? (
                      <Input
                        id="complement"
                        value={formData.complement}
                        onChange={(e) => setFormData(prev => ({ ...prev, complement: e.target.value }))}
                        className="mt-2 text-sm sm:text-base h-10 sm:h-12"
                        placeholder="Apto, casa, etc."
                      />
                    ) : (
                      <p className="mt-2 text-sm sm:text-base text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">
                        {data.driver?.complement || 'Não informado'}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="neighborhood" className="text-sm sm:text-base font-medium">Bairro</Label>
                    {editing ? (
                      <Input
                        id="neighborhood"
                        value={formData.neighborhood}
                        onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                        className="mt-2 text-sm sm:text-base h-10 sm:h-12"
                        placeholder="Nome do bairro"
                      />
                    ) : (
                      <p className="mt-2 text-sm sm:text-base text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">
                        {data.driver?.neighborhood || 'Não informado'}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="city" className="text-sm sm:text-base font-medium">Cidade</Label>
                    {editing ? (
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        className="mt-2 text-sm sm:text-base h-10 sm:h-12"
                        placeholder="Nome da cidade"
                      />
                    ) : (
                      <p className="mt-2 text-sm sm:text-base text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">
                        {data.driver?.city || 'Não informado'}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="state" className="text-sm sm:text-base font-medium">Estado</Label>
                    {editing ? (
                      <select
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                        className="mt-2 h-10 sm:h-12 w-full border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500 bg-white text-sm sm:text-base"
                      >
                        <option value="">Selecione</option>
                        <option value="AC">Acre</option>
                        <option value="AL">Alagoas</option>
                        <option value="AP">Amapá</option>
                        <option value="AM">Amazonas</option>
                        <option value="BA">Bahia</option>
                        <option value="CE">Ceará</option>
                        <option value="DF">Distrito Federal</option>
                        <option value="ES">Espírito Santo</option>
                        <option value="GO">Goiás</option>
                        <option value="MA">Maranhão</option>
                        <option value="MT">Mato Grosso</option>
                        <option value="MS">Mato Grosso do Sul</option>
                        <option value="MG">Minas Gerais</option>
                        <option value="PA">Pará</option>
                        <option value="PB">Paraíba</option>
                        <option value="PR">Paraná</option>
                        <option value="PE">Pernambuco</option>
                        <option value="PI">Piauí</option>
                        <option value="RJ">Rio de Janeiro</option>
                        <option value="RN">Rio Grande do Norte</option>
                        <option value="RS">Rio Grande do Sul</option>
                        <option value="RO">Rondônia</option>
                        <option value="RR">Roraima</option>
                        <option value="SC">Santa Catarina</option>
                        <option value="SP">São Paulo</option>
                        <option value="SE">Sergipe</option>
                        <option value="TO">Tocantins</option>
                      </select>
                    ) : (
                      <p className="mt-2 text-sm sm:text-base text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">
                        {data.driver?.state || 'Não informado'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document Status */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Status dos Documentos</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 px-3 sm:px-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      <span className="text-sm sm:text-base font-medium">CNH</span>
                    </div>
                    {getStatusBadge(documents?.cnh_document_status || 'not_submitted')}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 px-3 sm:px-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-3">
                      <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      <span className="text-sm sm:text-base font-medium">Foto do Perfil</span>
                    </div>
                    {getStatusBadge(documents?.photo_status || 'not_submitted')}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 px-3 sm:px-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-3">
                      <Home className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      <span className="text-sm sm:text-base font-medium">Comprovante de Endereço</span>
                    </div>
                    {getStatusBadge(documents?.driver_address_proof_status || 'not_submitted')}
                  </div>

                  {documents?.rejection_reason && (
                    <div className="mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        <strong>Motivo da rejeição:</strong> {documents.rejection_reason}
                      </p>
                    </div>
                  )}

                  {documents?.overall_status === 'not_submitted' && (
                    <div className="mt-4">
                      <Button 
                        onClick={() => navigate('/driver-document-verification')}
                        className="w-full text-sm sm:text-base h-10 sm:h-12"
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