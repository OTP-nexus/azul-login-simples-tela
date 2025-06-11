
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, User, Phone, Mail, Building2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import CollaboratorFormDialog from './CollaboratorFormDialog';

interface Collaborator {
  id: string;
  name: string;
  sector: string;
  phone: string;
  email?: string;
  created_at: string;
}

const CollaboratorsList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleBack = () => {
    navigate('/company-dashboard');
  };

  const fetchCollaborators = async () => {
    if (!user) return;

    try {
      // Primeiro, buscar a empresa do usuário
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
        .order('created_at', { ascending: false });

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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaborators();
  }, [user]);

  const handleDialogSuccess = () => {
    fetchCollaborators(); // Recarregar a lista após adicionar um colaborador
  };

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
                <h1 className="text-xl font-bold text-gray-800">Colaboradores</h1>
                <p className="text-sm text-gray-600">Gerencie os responsáveis de cada setor</p>
              </div>
            </div>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Colaborador</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : collaborators.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Nenhum colaborador cadastrado
              </h3>
              <p className="text-gray-600 mb-6">
                Comece adicionando os responsáveis por cada setor da sua empresa
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Colaborador
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collaborators.map((collaborator) => (
              <Card key={collaborator.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-800">
                        {collaborator.name}
                      </CardTitle>
                      <CardDescription className="flex items-center text-sm text-gray-600">
                        <Building2 className="w-3 h-3 mr-1" />
                        {collaborator.sector}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm text-gray-700">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {collaborator.phone}
                  </div>
                  {collaborator.email && (
                    <div className="flex items-center text-sm text-gray-700">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {collaborator.email}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 pt-2">
                    Cadastrado em {new Date(collaborator.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Card */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">i</span>
              </div>
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">Sobre os colaboradores</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Todos os colaboradores ficam vinculados à sua empresa</li>
                  <li>• O email é opcional, mas recomendado para comunicação</li>
                  <li>• Você pode cadastrar quantos colaboradores precisar</li>
                  <li>• Os dados podem ser editados posteriormente</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Dialog para novo colaborador */}
      <CollaboratorFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
};

export default CollaboratorsList;
