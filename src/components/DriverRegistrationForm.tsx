
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Eye, EyeOff, Mail, Lock, User, Phone, FileText, Car, ArrowLeft, ArrowRight, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ValidatedInput } from './ValidatedInput';
import { useValidation } from '@/hooks/useValidation';
import { useAuth } from '@/hooks/useAuth';
import { formatCPF, formatPhone, formatCNH, cleanFormatting } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';

const DriverRegistrationForm = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { validateEmail, validateCPF, validateCNH } = useValidation();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    confirmPhone: '',
    cpf: '',
    cnh: '',
    vehicleType: '',
    password: '',
    confirmPassword: ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const totalSteps = 3;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = async (step: number): Promise<boolean> => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName) errors.fullName = 'Nome completo é obrigatório';
      if (!formData.email) errors.email = 'Email é obrigatório';
      if (!formData.phone) errors.phone = 'Telefone é obrigatório';
      if (!formData.confirmPhone) errors.confirmPhone = 'Confirmação de telefone é obrigatória';

      if (formData.phone !== formData.confirmPhone) {
        errors.confirmPhone = 'Telefones não conferem';
      }
    }

    if (step === 2) {
      if (!formData.cpf) errors.cpf = 'CPF é obrigatório';
      if (!formData.cnh) errors.cnh = 'CNH é obrigatória';
      if (!formData.vehicleType) errors.vehicleType = 'Tipo de veículo é obrigatório';
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
        full_name: formData.fullName,
        role: 'driver',
        phone: cleanFormatting(formData.phone),
        cpf: cleanFormatting(formData.cpf),
        cnh: cleanFormatting(formData.cnh),
        vehicle_type: formData.vehicleType
      };

      const { error } = await signUp(formData.email, formData.password, userData);
      
      if (error) {
        console.error('Erro no cadastro:', error);
        toast({
          title: "Erro no cadastro",
          description: error.message || "Tente novamente",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Cadastro realizado!",
        description: "Redirecionando para verificação de documentos...",
      });
      
      navigate('/driver-document-verification');
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
      case 1: return 'Dados Pessoais';
      case 2: return 'Documentos';
      case 3: return 'Acesso';
      default: return 'Cadastro';
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
          Nome completo *
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Digite seu nome completo"
            value={formData.fullName}
            onChange={handleInputChange}
            className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        {validationErrors.fullName && (
          <p className="text-sm text-red-600">{validationErrors.fullName}</p>
        )}
      </div>

      <ValidatedInput
        id="email"
        name="email"
        type="email"
        label="Email"
        value={formData.email}
        onChange={handleInputChange}
        onValidate={validateEmail}
        placeholder="Digite seu email"
        required
        icon={<Mail className="h-4 w-4" />}
      />
      {validationErrors.email && (
        <p className="text-sm text-red-600">{validationErrors.email}</p>
      )}

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
          Telefone *
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="(11) 99999-9999"
            value={formatPhone(formData.phone)}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: cleanFormatting(e.target.value) }))}
            className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        {validationErrors.phone && (
          <p className="text-sm text-red-600">{validationErrors.phone}</p>
        )}
      </div>

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
            onChange={(e) => setFormData(prev => ({ ...prev, confirmPhone: cleanFormatting(e.target.value) }))}
            className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        {validationErrors.confirmPhone && (
          <p className="text-sm text-red-600">{validationErrors.confirmPhone}</p>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <ValidatedInput
        id="cpf"
        name="cpf"
        label="CPF"
        value={formData.cpf}
        onChange={handleInputChange}
        onValidate={validateCPF}
        formatter={formatCPF}
        placeholder="000.000.000-00"
        required
        icon={<CreditCard className="h-4 w-4" />}
      />
      {validationErrors.cpf && (
        <p className="text-sm text-red-600">{validationErrors.cpf}</p>
      )}

      <ValidatedInput
        id="cnh"
        name="cnh"
        label="CNH"
        value={formData.cnh}
        onChange={handleInputChange}
        onValidate={validateCNH}
        formatter={formatCNH}
        placeholder="Digite o número da CNH"
        required
        maxLength={11}
        icon={<FileText className="h-4 w-4" />}
      />
      {validationErrors.cnh && (
        <p className="text-sm text-red-600">{validationErrors.cnh}</p>
      )}

      <div className="space-y-2">
        <Label htmlFor="vehicleType" className="text-sm font-medium text-gray-700">
          Tipo de veículo *
        </Label>
        <div className="relative">
          <Car className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <select
            id="vehicleType"
            name="vehicleType"
            value={formData.vehicleType}
            onChange={handleInputChange}
            className="pl-10 h-12 w-full border border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500 bg-white"
            required
          >
            <option value="">Selecione o tipo de veículo</option>
            <option value="carro">Carro</option>
            <option value="moto">Moto</option>
            <option value="van">Van</option>
            <option value="caminhao">Caminhão</option>
          </select>
        </div>
        {validationErrors.vehicleType && (
          <p className="text-sm text-red-600">{validationErrors.vehicleType}</p>
        )}
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
              onClick={() => navigate('/register')}
              className="absolute left-6 top-6 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
              <Car className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              {getStepTitle()}
            </CardTitle>
            <CardDescription className="text-gray-600">
              Etapa {currentStep} de {totalSteps}
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

export default DriverRegistrationForm;
