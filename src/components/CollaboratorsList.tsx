
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, User, Phone, Mail, Building2, Users, edit, trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import CollaboratorFormDialog from './CollaboratorFormDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);
  const [deletingCollaboratorId, setDeletingCollaboratorId] = useState<string | null>(null);

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
    fetchCollaborators(); // Recarregar a lista após adicionar/editar um colaborador
    setEditingCollaborator(null); // Limpar estado de edição
  };

  const handleEditCollaborator = (collaborator: Collaborator) => {
    setEditingCollaborator(collaborator);
    setIsDialogOpen(true);
  };

  const handleDeleteCollaborator = async (collaboratorId: string) => {
    try {
      const { error } = await supabase
        .from('collaborators')
        .delete()
        .eq('id', collaboratorId);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso!",
        description: "Colaborador excluído com sucesso"
      });

      fetchCollaborators(); // Recarregar a lista
    } catch (error: any) {
      console.error('Erro ao excluir colaborador:', error);
      toast({
        title: "Erro ao excluir",
        description: error.message || "Não foi possível excluir o colaborador. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleNewCollaborator = () => {
    setEditingCollaborator(null);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingCollaborator(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header - Mobile Optimized */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <Button
                onClick={handleBack}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Voltar</span>
              </Button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate">Colaboradores</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Gerencie os responsáveis de cada setor</p>
              </div>
            </div>
            <Button
              onClick={handleNewCollaborator}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center space-x-1 sm:space-x-2 flex-shrink-0"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Colaborador</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Mobile Optimized */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {loading ? (
          <div className="flex justify-center items-center h-32 sm:h-64">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : collaborators.length === 0 ? (
          <Card className="text-center py-8 sm:py-12 mx-2 sm:mx-0">
            <CardContent>
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                Nenhum colaborador cadastrado
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
                Comece adicionando os responsáveis por cada setor da sua empresa
              </p>
              <Button
                onClick={handleNewCollaborator}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="text-sm">Adicionar Primeiro Colaborador</span>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {collaborators.map((collaborator) => (
              <Card key={collaborator.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2 sm:pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm sm:text-lg font-semibold text-gray-800 truncate">
                          {collaborator.name}
                        </CardTitle>
                        <CardDescription className="flex items-center text-xs sm:text-sm text-gray-600">
                          <Building2 className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{collaborator.sector}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleEditCollaborator(collaborator)}
                      >
                        <edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <trash className="h-4 w-4 text-red-600" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="sm:max-w-[425px] w-[95%] max-w-[95%] sm:w-full mx-auto">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o colaborador <strong>{collaborator.name}</strong>? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCollaborator(collaborator.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1 sm:space-y-2 pt-0">
                  <div className="flex items-center text-xs sm:text-sm text-gray-700">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{collaborator.phone}</span>
                  </div>
                  {collaborator.email && (
                    <div className="flex items-center text-xs sm:text-sm text-gray-700">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{collaborator.email}</span>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 pt-1 sm:pt-2">
                    Cadastrado em {new Date(collaborator.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Card - Mobile Optimized */}
        <Card className="mt-6 sm:mt-8 bg-blue-50 border-blue-200 mx-2 sm:mx-0">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs sm:text-sm font-bold">i</span>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">Sobre os colaboradores</h3>
                <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
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

      {/* Dialog para novo/editar colaborador */}
      <CollaboratorFormDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onSuccess={handleDialogSuccess}
        editingCollaborator={editingCollaborator}
      />
    </div>
  );
};

export default CollaboratorsList;
