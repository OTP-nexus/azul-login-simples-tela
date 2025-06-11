import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Eye, EyeOff, Mail, Lock, User, Phone, FileText, Building2, ArrowLeft, ArrowRight, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ValidatedInput } from './ValidatedInput';
import { useValidation } from '@/hooks/useValidation';
import { useAuth } from '@/hooks/useAuth';
import { formatCNPJ, formatPhone, formatCEP, cleanFormatting } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AddressData {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

const CompanyRegistrationForm = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { validateEmail, validateCNPJ, validateCompanyPhone } = useValidation();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransporter, setIsTransporter] = useState(false);
  
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    confirmPhone: '',
    cnpj: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    password: '',
    confirmPassword: ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Verificar se o tipo da empresa foi selecionado
  useEffect(() => {
    const companyType = localStorage.getItem('companyType');
    if (companyType === null) {
      navigate('/register/company');
      return;
    }
    setIsTransporter(companyType === 'true');
  }, [navigate]);

  const totalSteps = 3;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleConfirmPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanValue = cleanFormatting(e.target.value);
    setFormData(prev => ({ ...prev, confirmPhone: cleanValue }));
    
    // Clear validation error when user starts typing
    if (validationErrors.confirmPhone) {
      setValidationErrors(prev => ({ ...prev, confirmPhone: '' }));
    }
  };

  const fetchAddressByCep = async (cep: string) => {
    const cleanCep = cleanFormatting(cep);
    if (cleanCep.length !== 8) return;
    
    setIsLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data: AddressData = await response.json();
      
      if (!data.logradouro) {
        toast({
          title: "CEP não encontrado",
          description: "Verifique o CEP digitado",
          variant: "destructive"
        });
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf
      }));
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast({
        title: "Erro ao buscar CEP",
        description: "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCep = formatCEP(e.target.value);
    setFormData(prev => ({ ...prev, cep: formattedCep }));
    
    const cleanCep = cleanFormatting(formattedCep);
    if (cleanCep.length === 8) {
      fetchAddressByCep(formattedCep);
    }
  };

  const validateStep = async (step: number): Promise<boolean> => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.companyName) errors.companyName = 'Nome da empresa é obrigatório';
      if (!formData.contactName) errors.contactName = 'Nome do responsável é obrigatório';
      if (!formData.email) errors.email = 'Email é obrigatório';
      if (!formData.phone) errors.phone = 'Telefone é obrigatório';
      if (!formData.confirmPhone) errors.confirmPhone = 'Confirmação de telefone é obrigatória';
      if (!formData.cnpj) errors.cnpj = 'CNPJ é obrigatório';

      // Comparar telefones sem formatação
      const cleanPhone = cleanFormatting(formData.phone);
      const cleanConfirmPhone = cleanFormatting(formData.confirmPhone);
      
      console.log('Phone validation:', { cleanPhone, cleanConfirmPhone, areEqual: cleanPhone === cleanConfirmPhone });
      
      if (cleanPhone !== cleanConfirmPhone) {
        errors.confirmPhone = 'Telefones não conferem';
      }
    }

    if (step === 2) {
      if (!formData.cep) errors.cep = 'CEP é obrigatório';
      if (!formData.street) errors.street = 'Rua é obrigatória';
      if (!formData.number) errors.number = 'Número é obrigatório';
      if (!formData.neighborhood) errors.neighborhood = 'Bairro é obrigatório';
      if (!formData.city) errors.city = 'Cidade é obrigatória';
      if (!formData.state) errors.state = 'Estado é obrigatório';
    }

    if (step === 3) {
      if (!formData.password) errors.password = 'Senha é obrigatória';
      if (formData.password.length < 6) errors.password = 'Senha deve ter pelo menos 6 caracteres';
      if (!formData.confirmPassword) errors.confirmPassword = 'Confirmação de senha é obrigatória';
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Senhas não conferem';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = await validateStep(3);
    if (!isValid) return;

    setIsSubmitting(true);
    
    try {
      const userData = {
        full_name: formData.contactName,
        role: 'company'
      };

      const { data: authData, error: authError } = await signUp(formData.email, formData.password, userData);
      
      if (authError) {
        console.error('Erro no cadastro:', authError);
        toast({
          title: "Erro no cadastro",
          description: authError.message || "Tente novamente",
          variant: "destructive"
        });
        return;
      }

      // Aguardar um pouco para garantir que o usuário foi criado
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Buscar o usuário criado para obter o ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não encontrado após cadastro');
      }

      // Salvar dados da empresa
      const { error: companyError } = await supabase
        .from('companies')
        .insert({
          user_id: user.id,
          company_name: formData.companyName,
          contact_name: formData.contactName,
          phone: cleanFormatting(formData.phone),
          confirm_phone: cleanFormatting(formData.confirmPhone),
          cnpj: cleanFormatting(formData.cnpj),
          cep: cleanFormatting(formData.cep),
          street: formData.street,
          number: formData.number,
          complement: formData.complement,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
          is_transporter: isTransporter
        });

      if (companyError) {
        console.error('Erro ao salvar dados da empresa:', companyError);
        toast({
          title: "Erro ao salvar dados",
          description: "Dados de autenticação criados, mas houve erro ao salvar informações da empresa",
          variant: "destructive"
        });
        return;
      }

      // Limpar o tipo da empresa do localStorage após o cadastro bem-sucedido
      localStorage.removeItem('companyType');

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Redirecionando para verificação de documentos...",
      });
      
      navigate('/document-verification');
    } catch (error) {
      console.error('Erro no cadastro:', error);
      toast({
        title: "Erro no cadastro",
        description: "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Dados da Empresa';
      case 2: return 'Endereço';
      case 3: return 'Acesso';
      default: return 'Cadastro';
    }
  };

  const getCompanyTypeDisplay = () => {
    return isTransporter ? 'Transportadora' : 'Empresa Cliente';
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">
          Nome da empresa *
        </Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="companyName"
            name="companyName"
            type="text"
            placeholder="Digite o nome da empresa"
            value={formData.companyName}
            onChange={handleInputChange}
            className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        {validationErrors.companyName && (
          <p className="text-sm text-red-600">{validationErrors.companyName}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactName" className="text-sm font-medium text-gray-700">
          Nome do responsável *
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="contactName"
            name="contactName"
            type="text"
            placeholder="Digite o nome do responsável"
            value={formData.contactName}
            onChange={handleInputChange}
            className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        {validationErrors.contactName && (
          <p className="text-sm text-red-600">{validationErrors.contactName}</p>
        )}
      </div>

      <ValidatedInput
        id="email"
        name="email"
        type="email"
        label="Email corporativo"
        value={formData.email}
        onChange={handleInputChange}
        onValidate={validateEmail}
        placeholder="Digite o email da empresa"
        required
        icon={<Mail className="h-4 w-4" />}
      />
      {validationErrors.email && (
        <p className="text-sm text-red-600">{validationErrors.email}</p>
      )}

      <ValidatedInput
        id="phone"
        name="phone"
        type="tel"
        label="Telefone"
        value={formData.phone}
        onChange={handleInputChange}
        onValidate={validateCompanyPhone}
        formatter={formatPhone}
        placeholder="(11) 99999-9999"
        required
        icon={<Phone className="h-4 w-4" />}
      />
      {validationErrors.phone && (
        <p className="text-sm text-red-600">{validationErrors.phone}</p>
      )}

      <div className="space-y-2">
        <Label htmlFor="confirmPhone" className="text-sm font-medium text-gray-700">
          Confirmar telefone *
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="confirmPhone"
            name="confirmPhone"
            type="tel"
            placeholder="(11) 99999-9999"
            value={formatPhone(formData.confirmPhone)}
            onChange={handleConfirmPhoneChange}
            className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        {validationErrors.confirmPhone && (
          <p className="text-sm text-red-600">{validationErrors.confirmPhone}</p>
        )}
      </div>

      <ValidatedInput
        id="cnpj"
        name="cnpj"
        label="CNPJ"
        value={formData.cnpj}
        onChange={handleInputChange}
        onValidate={validateCNPJ}
        formatter={formatCNPJ}
        placeholder="00.000.000/0000-00"
        required
        icon={<FileText className="h-4 w-4" />}
      />
      {validationErrors.cnpj && (
        <p className="text-sm text-red-600">{validationErrors.cnpj}</p>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cep" className="text-sm font-medium text-gray-700">
          CEP *
        </Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="cep"
            name="cep"
            type="text"
            placeholder="00000-000"
            value={formData.cep}
            onChange={handleCepChange}
            className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            maxLength={9}
            required
          />
          {isLoadingCep && (
            <div className="absolute right-3 top-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
        {validationErrors.cep && (
          <p className="text-sm text-red-600">{validationErrors.cep}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="street" className="text-sm font-medium text-gray-700">
          Rua *
        </Label>
        <Input
          id="street"
          name="street"
          type="text"
          placeholder="Nome da rua"
          value={formData.street}
          onChange={handleInputChange}
          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          required
        />
        {validationErrors.street && (
          <p className="text-sm text-red-600">{validationErrors.street}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="number" className="text-sm font-medium text-gray-700">
            Número *
          </Label>
          <Input
            id="number"
            name="number"
            type="text"
            placeholder="123"
            value={formData.number}
            onChange={handleInputChange}
            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            required
          />
          {validationErrors.number && (
            <p className="text-sm text-red-600">{validationErrors.number}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="complement" className="text-sm font-medium text-gray-700">
            Complemento
          </Label>
          <Input
            id="complement"
            name="complement"
            type="text"
            placeholder="Apto, sala..."
            value={formData.complement}
            onChange={handleInputChange}
            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="neighborhood" className="text-sm font-medium text-gray-700">
          Bairro *
        </Label>
        <Input
          id="neighborhood"
          name="neighborhood"
          type="text"
          placeholder="Nome do bairro"
          value={formData.neighborhood}
          onChange={handleInputChange}
          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          required
        />
        {validationErrors.neighborhood && (
          <p className="text-sm text-red-600">{validationErrors.neighborhood}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm font-medium text-gray-700">
            Cidade *
          </Label>
          <Input
            id="city"
            name="city"
            type="text"
            placeholder="Nome da cidade"
            value={formData.city}
            onChange={handleInputChange}
            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            required
          />
          {validationErrors.city && (
            <p className="text-sm text-red-600">{validationErrors.city}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state" className="text-sm font-medium text-gray-700">
            Estado *
          </Label>
          <Input
            id="state"
            name="state"
            type="text"
            placeholder="UF"
            value={formData.state}
            onChange={handleInputChange}
            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            maxLength={2}
            required
          />
          {validationErrors.state && (
            <p className="text-sm text-red-600">{validationErrors.state}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
          Senha *
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Digite sua senha"
            value={formData.password}
            onChange={handleInputChange}
            className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {validationErrors.password && (
          <p className="text-sm text-red-600">{validationErrors.password}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
          Confirmar senha *
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirme sua senha"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        {validationErrors.confirmPassword && (
          <p className="text-sm text-red-600">{validationErrors.confirmPassword}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-4 text-center pb-6">
            <button
              onClick={() => navigate('/register/company')}
              className="absolute left-6 top-6 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              {getStepTitle()}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {getCompanyTypeDisplay()} - Etapa {currentStep} de {totalSteps}
            </CardDescription>
            
            <div className="w-full px-4">
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              
              <div className="flex justify-between gap-4">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    className="flex-1 h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
                    disabled={isSubmitting}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                )}
                
                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                    disabled={isSubmitting}
                  >
                    Próximo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Criando conta...' : 'Criar conta'}
                  </Button>
                )}
              </div>
            </form>
            
            <div className="text-center">
              <span className="text-gray-600">
                Já tem uma conta?
              </span>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="ml-1 text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Fazer login
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyRegistrationForm;
