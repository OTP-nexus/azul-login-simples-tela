
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Truck, User, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Collaborator {
  id: string;
  name: string;
  sector: string;
  phone: string;
  email?: string;
}

interface FreightFormData {
  collaborator_ids: string[];
  origin_city: string;
  origin_state: string;
  destination_city: string;
  destination_state: string;
  cargo_type: string;
  cargo_weight: string;
  cargo_value: string;
  pickup_date: string;
  delivery_date: string;
  observations: string;
}

const FreightAggregationForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loadingCollaborators, setLoadingCollaborators] = useState(true);
  const [formData, setFormData] = useState<FreightFormData>({
    collaborator_ids: [],
    origin_city: '',
    origin_state: '',
    destination_city: '',
    destination_state: '',
    cargo_type: '',
    cargo_weight: '',
    cargo_value: '',
    pickup_date: '',
    delivery_date: '',
    observations: ''
  });

  const handleBack = () => {
    navigate('/freight-request');
  };

  const handleBackToDashboard = () => {
    navigate('/company-dashboard');
  };

  const fetchCollaborators = async () => {
    if (!user) return;

    try {
      // Buscar a empresa do usuário
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (companyError || !company) {
        throw new Error('Empresa não encontrada');
      }

      // Buscar colaboradores da empresa
      const { data: collaboratorsData, error: collaboratorsError } = await supabase
        .from('collaborators')
        .select('*')
        .eq('company_id', company.id)
        .order('name', { ascending: true });

      if (collaboratorsError) {
        throw collaboratorsError;
      }

      setCollaborators(collaboratorsData || []);
    } catch (error: any) {
      console.error('Erro ao buscar colaboradores:', error);
      toast({
        title: "Erro ao carregar colaboradores",
        description: error.message || "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setLoadingCollaborators(false);
    }
  };

  useEffect(() => {
    fetchCollaborators();
  }, [user]);

  const handleInputChange = (field: keyof FreightFormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCollaboratorToggle = (collaboratorId: string) => {
    setFormData(prev => ({
      ...prev,
      collaborator_ids: prev.collaborator_ids.includes(collaboratorId)
        ? prev.collaborator_ids.filter(id => id !== collaboratorId)
        : [...prev.collaborator_ids, collaboratorId]
    }));
  };

  const getSelectedCollaborators = () => {
    return collaborators.filter(collaborator => 
      formData.collaborator_ids.includes(collaborator.id)
    );
  };

  const validateForm = () => {
    if (formData.collaborator_ids.length === 0) {
      toast({
        title: "Erro de validação",
        description: "Selecione pelo menos um colaborador responsável",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.origin_city || !formData.origin_state) {
      toast({
        title: "Erro de validação",
        description: "Informe a cidade e estado de origem",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.destination_city || !formData.destination_state) {
      toast({
        title: "Erro de validação",
        description: "Informe a cidade e estado de destino",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.cargo_type) {
      toast({
        title: "Erro de validação",
        description: "Informe o tipo de carga",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.pickup_date || !formData.delivery_date) {
      toast({
        title: "Erro de validação",
        description: "Informe as datas de coleta e entrega",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Aqui você pode implementar a lógica para salvar o frete
      // Por enquanto, apenas mostramos uma mensagem de sucesso
      
      toast({
        title: "Sucesso!",
        description: `Solicitação de frete criada com ${formData.collaborator_ids.length} colaborador(es) responsável(is)`
      });

      // Limpar formulário
      setFormData({
        collaborator_ids: [],
        origin_city: '',
        origin_state: '',
        destination_city: '',
        destination_state: '',
        cargo_type: '',
        cargo_weight: '',
        cargo_value: '',
        pickup_date: '',
        delivery_date: '',
        observations: ''
      });

    } catch (error: any) {
      console.error('Erro ao salvar frete:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar a solicitação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingCollaborators) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (collaborators.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Frete de Agregamento</h1>
                  <p className="text-sm text-gray-600">Solicitação de frete</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Nenhum colaborador cadastrado
              </h3>
              <p className="text-base text-gray-600 mb-6">
                Para solicitar um frete, você precisa ter pelo menos um colaborador cadastrado como responsável pelo pedido.
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => navigate('/collaborator-registration')}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Colaborador
                </Button>
                <Button
                  onClick={handleBackToDashboard}
                  variant="outline"
                >
                  Voltar ao Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const selectedCollaborators = getSelectedCollaborators();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleBack}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Frete de Agregamento</h1>
                <p className="text-sm text-gray-600">Solicitação de frete para motoristas agregados</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-800">Nova Solicitação de Frete</CardTitle>
                <CardDescription>Selecione os colaboradores responsáveis e preencha as informações do frete</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Seleção de Colaboradores */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">
                  Colaboradores Responsáveis *
                </Label>
                <p className="text-sm text-gray-600">
                  Selecione um ou mais colaboradores que serão responsáveis por este pedido de frete.
                </p>
                
                {/* Lista de colaboradores para seleção */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border rounded-lg p-4">
                  {collaborators.map((collaborator) => (
                    <div key={collaborator.id} className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-gray-50">
                      <Checkbox
                        id={collaborator.id}
                        checked={formData.collaborator_ids.includes(collaborator.id)}
                        onCheckedChange={() => handleCollaboratorToggle(collaborator.id)}
                      />
                      <label
                        htmlFor={collaborator.id}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium text-gray-800">{collaborator.name}</div>
                        <div className="text-sm text-gray-600">{collaborator.sector}</div>
                        <div className="text-xs text-gray-500">{collaborator.phone}</div>
                      </label>
                    </div>
                  ))}
                </div>

                {/* Colaboradores selecionados */}
                {selectedCollaborators.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-green-700">
                      Colaboradores Selecionados ({selectedCollaborators.length})
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedCollaborators.map((collaborator) => (
                        <div
                          key={collaborator.id}
                          className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                        >
                          <span>{collaborator.name}</span>
                          <button
                            type="button"
                            onClick={() => handleCollaboratorToggle(collaborator.id)}
                            className="hover:bg-green-200 rounded-full p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Origem */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origin_city" className="text-sm font-medium text-gray-700">
                    Cidade de Origem *
                  </Label>
                  <Input
                    id="origin_city"
                    type="text"
                    value={formData.origin_city}
                    onChange={(e) => handleInputChange('origin_city', e.target.value)}
                    placeholder="Ex: São Paulo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="origin_state" className="text-sm font-medium text-gray-700">
                    Estado de Origem *
                  </Label>
                  <Input
                    id="origin_state"
                    type="text"
                    value={formData.origin_state}
                    onChange={(e) => handleInputChange('origin_state', e.target.value)}
                    placeholder="Ex: SP"
                    required
                  />
                </div>
              </div>

              {/* Destino */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="destination_city" className="text-sm font-medium text-gray-700">
                    Cidade de Destino *
                  </Label>
                  <Input
                    id="destination_city"
                    type="text"
                    value={formData.destination_city}
                    onChange={(e) => handleInputChange('destination_city', e.target.value)}
                    placeholder="Ex: Rio de Janeiro"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination_state" className="text-sm font-medium text-gray-700">
                    Estado de Destino *
                  </Label>
                  <Input
                    id="destination_state"
                    type="text"
                    value={formData.destination_state}
                    onChange={(e) => handleInputChange('destination_state', e.target.value)}
                    placeholder="Ex: RJ"
                    required
                  />
                </div>
              </div>

              {/* Informações da Carga */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cargo_type" className="text-sm font-medium text-gray-700">
                    Tipo de Carga *
                  </Label>
                  <Input
                    id="cargo_type"
                    type="text"
                    value={formData.cargo_type}
                    onChange={(e) => handleInputChange('cargo_type', e.target.value)}
                    placeholder="Ex: Eletrônicos"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo_weight" className="text-sm font-medium text-gray-700">
                    Peso (kg)
                  </Label>
                  <Input
                    id="cargo_weight"
                    type="number"
                    value={formData.cargo_weight}
                    onChange={(e) => handleInputChange('cargo_weight', e.target.value)}
                    placeholder="Ex: 1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo_value" className="text-sm font-medium text-gray-700">
                    Valor da Carga (R$)
                  </Label>
                  <Input
                    id="cargo_value"
                    type="number"
                    step="0.01"
                    value={formData.cargo_value}
                    onChange={(e) => handleInputChange('cargo_value', e.target.value)}
                    placeholder="Ex: 50000.00"
                  />
                </div>
              </div>

              {/* Datas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pickup_date" className="text-sm font-medium text-gray-700">
                    Data de Coleta *
                  </Label>
                  <Input
                    id="pickup_date"
                    type="date"
                    value={formData.pickup_date}
                    onChange={(e) => handleInputChange('pickup_date', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery_date" className="text-sm font-medium text-gray-700">
                    Data de Entrega *
                  </Label>
                  <Input
                    id="delivery_date"
                    type="date"
                    value={formData.delivery_date}
                    onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="observations" className="text-sm font-medium text-gray-700">
                  Observações
                </Label>
                <Textarea
                  id="observations"
                  value={formData.observations}
                  onChange={(e) => handleInputChange('observations', e.target.value)}
                  placeholder="Informações adicionais sobre o frete..."
                  rows={4}
                />
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Truck className="w-4 h-4 mr-2" />
                      Solicitar Frete
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default FreightAggregationForm;
