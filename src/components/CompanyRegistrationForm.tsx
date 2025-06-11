import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Eye, EyeOff, Mail, Lock, User, Phone, FileText, Building2, ArrowLeft, ArrowRight, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AddressData {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

const CompanyRegistrationForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
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

  const totalSteps = 4;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const sendOtpCode = async () => {
    console.log('Enviando código OTP para:', formData.phone);
    // Aqui você implementaria o envio real do SMS
    // Por enquanto, apenas simularemos o envio
  };

  const verifyOtpCode = async () => {
    if (otpValue.length !== 6) return;
    
    setIsVerifyingOtp(true);
    try {
      console.log('Verificando código OTP:', otpValue);
      // Aqui você implementaria a verificação real do código
      // Por enquanto, vamos simular uma verificação (aceita qualquer código de 6 dígitos)
      await new Promise(resolve => setTimeout(resolve, 1000));
      handleNextStep();
    } catch (error) {
      console.error('Erro ao verificar OTP:', error);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const fetchAddressByCep = async (cep: string) => {
    if (cep.length !== 8) return;
    
    setIsLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data: AddressData = await response.json();
      
      if (!data.logradouro) {
        console.error('CEP não encontrado');
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
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, cep }));
    
    if (cep.length === 8) {
      fetchAddressByCep(cep);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Ao sair da primeira etapa, enviar o código OTP
      sendOtpCode();
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Company registration:', formData);
    // Aqui você implementaria a lógica de cadastro
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Dados da Empresa';
      case 2: return 'Confirmar Telefone';
      case 3: return 'Endereço';
      case 4: return 'Acesso';
      default: return 'Cadastro';
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">
          Nome da empresa
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactName" className="text-sm font-medium text-gray-700">
          Nome do responsável
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email corporativo
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Digite o email da empresa"
            value={formData.email}
            onChange={handleInputChange}
            className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
          Telefone
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="(11) 99999-9999"
            value={formData.phone}
            onChange={handleInputChange}
            className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cnpj" className="text-sm font-medium text-gray-700">
          CNPJ
        </Label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="cnpj"
            name="cnpj"
            type="text"
            placeholder="00.000.000/0000-00"
            value={formData.cnpj}
            onChange={handleInputChange}
            className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Phone className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">
          Confirme seu telefone
        </h3>
        <p className="text-gray-600 text-sm">
          Enviamos um código de 6 dígitos para<br />
          <span className="font-medium">{formData.phone}</span>
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otpValue}
            onChange={(value) => setOtpValue(value)}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          type="button"
          onClick={verifyOtpCode}
          disabled={otpValue.length !== 6 || isVerifyingOtp}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:transform-none"
        >
          {isVerifyingOtp ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Verificando...
            </div>
          ) : (
            'Verificar código'
          )}
        </Button>

        <div className="text-center">
          <span className="text-gray-600 text-sm">Não recebeu o código? </span>
          <button
            type="button"
            onClick={sendOtpCode}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
          >
            Reenviar
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cep" className="text-sm font-medium text-gray-700">
          CEP
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
            maxLength={8}
            required
          />
          {isLoadingCep && (
            <div className="absolute right-3 top-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="street" className="text-sm font-medium text-gray-700">
          Rua
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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="number" className="text-sm font-medium text-gray-700">
            Número
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
          Bairro
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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm font-medium text-gray-700">
            Cidade
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="state" className="text-sm font-medium text-gray-700">
            Estado
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
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
          Senha
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
          Confirmar senha
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
              <Building2 className="w-8 h-8 text-white" />
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
              {currentStep === 4 && renderStep4()}
              
              {currentStep !== 2 && (
                <div className="flex justify-between gap-4">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevStep}
                      className="flex-1 h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
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
                    >
                      Próximo
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                    >
                      Criar conta
                    </Button>
                  )}
                </div>
              )}
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
