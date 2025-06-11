
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, User, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface CollaboratorFormData {
  name: string;
  sector: string;
  phone: string;
  email: string;
}

interface Collaborator {
  id: string;
  name: string;
  sector: string;
  phone: string;
  email?: string;
  created_at: string;
}

interface CollaboratorFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingCollaborator?: Collaborator | null;
}

const CollaboratorFormDialog = ({ isOpen, onClose, onSuccess, editingCollaborator }: CollaboratorFormDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CollaboratorFormData>({
    name: '',
    sector: '',
    phone: '',
    email: ''
  });

  const isEditing = !!editingCollaborator;

  // Preencher formulário quando estiver editando
  useEffect(() => {
    if (editingCollaborator) {
      setFormData({
        name: editingCollaborator.name,
        sector: editingCollaborator.sector,
        phone: editingCollaborator.phone,
        email: editingCollaborator.email || ''
      });
    } else {
      setFormData({
        name: '',
        sector: '',
        phone: '',
        email: ''
      });
    }
  }, [editingCollaborator]);

  const handleInputChange = (field: keyof CollaboratorFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Erro de validação",
        description: "Nome é obrigatório",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.sector.trim()) {
      toast({
        title: "Erro de validação",
        description: "Setor responsável é obrigatório",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.phone.trim()) {
      toast({
        title: "Erro de validação",
        description: "Telefone de contato é obrigatório",
        variant: "destructive"
      });
      return false;
    }

    // Validação básica de email se fornecido
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({
        title: "Erro de validação",
        description: "Email inválido",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      if (isEditing && editingCollaborator) {
        // Atualizar colaborador existente
        const { error: updateError } = await supabase
          .from('collaborators')
          .update({
            name: formData.name.trim(),
            sector: formData.sector.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim() || null
          })
          .eq('id', editingCollaborator.id);

        if (updateError) {
          throw updateError;
        }

        toast({
          title: "Sucesso!",
          description: "Colaborador atualizado com sucesso"
        });
      } else {
        // Criar novo colaborador
        // Primeiro, buscar a empresa do usuário
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (companyError || !company) {
          throw new Error('Empresa não encontrada');
        }

        // Inserir o colaborador
        const { error: insertError } = await supabase
          .from('collaborators')
          .insert({
            company_id: company.id,
            name: formData.name.trim(),
            sector: formData.sector.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim() || null
          });

        if (insertError) {
          throw insertError;
        }

        toast({
          title: "Sucesso!",
          description: "Colaborador cadastrado com sucesso"
        });
      }

      // Limpar formulário e fechar dialog
      setFormData({
        name: '',
        sector: '',
        phone: '',
        email: ''
      });

      onSuccess();
      onClose();

    } catch (error: any) {
      console.error('Erro ao salvar colaborador:', error);
      toast({
        title: isEditing ? "Erro ao atualizar" : "Erro ao cadastrar",
        description: error.message || `Não foi possível ${isEditing ? 'atualizar' : 'cadastrar'} o colaborador. Tente novamente.`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      sector: '',
      phone: '',
      email: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] w-[95%] max-w-[95%] sm:w-full mx-auto">
        <DialogHeader>
          <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg mb-3 sm:mb-4">
            {isEditing ? (
              <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            ) : (
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            )}
          </div>
          <DialogTitle className="text-lg sm:text-xl font-bold text-gray-800 text-center">
            {isEditing ? 'Editar Colaborador' : 'Novo Colaborador'}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-gray-600 text-center px-2">
            {isEditing 
              ? 'Atualize as informações do colaborador' 
              : 'Preencha as informações do colaborador responsável pelo setor'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Nome */}
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Nome Completo *
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Digite o nome completo"
              className="w-full h-10 sm:h-10 text-sm sm:text-base"
              required
            />
          </div>

          {/* Setor */}
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="sector" className="text-sm font-medium text-gray-700">
              Setor Responsável *
            </Label>
            <Input
              id="sector"
              type="text"
              value={formData.sector}
              onChange={(e) => handleInputChange('sector', e.target.value)}
              placeholder="Ex: Logística, Comercial, Financeiro"
              className="w-full h-10 sm:h-10 text-sm sm:text-base"
              required
            />
          </div>

          {/* Telefone */}
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Telefone de Contato *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="(11) 99999-9999"
              className="w-full h-10 sm:h-10 text-sm sm:text-base"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email (Opcional)
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="colaborador@empresa.com"
              className="w-full h-10 sm:h-10 text-sm sm:text-base"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-10 sm:h-10 text-sm sm:text-base"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-10 sm:h-10 text-sm sm:text-base bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  {isEditing ? (
                    <>
                      <Edit className="w-4 h-4 mr-1 sm:mr-2" />
                      <span>Atualizar</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                      <span>Cadastrar</span>
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CollaboratorFormDialog;
