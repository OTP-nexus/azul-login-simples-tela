import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Building, Mail, Phone, User } from "lucide-react";

interface FormData {
  companyName: string;
  cnpj: string;
  email: string;
  phone: string;
  confirmPhone: string;
  address: string;
  password: string;
  confirmPassword: string;
  responsibleName: string;
}

const CompanyRegistrationForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    cnpj: "",
    email: "",
    phone: "",
    confirmPhone: "",
    address: "",
    password: "",
    confirmPassword: "",
    responsibleName: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro de validação",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (formData.phone !== formData.confirmPhone) {
      toast({
        title: "Erro de validação", 
        description: "Os telefones não coincidem.",
        variant: "destructive",
      });
      return;
    }

    console.log('Form submitted:', formData);
    
    toast({
      title: "Cadastro realizado com sucesso!",
      description: "Agora você precisa enviar os documentos para verificação.",
    });

    // Redirect to document verification page
    setTimeout(() => {
      navigate("/document-verification");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cadastro de Empresa
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Preencha os dados da sua empresa para realizar o cadastro na plataforma.
          </p>
        </div>

        {/* Registration Form */}
        <Card className="shadow-lg rounded-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl">Informações da Empresa</CardTitle>
            <CardDescription>
              Preencha os campos abaixo para cadastrar sua empresa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-gray-700">
                  Nome da Empresa
                </Label>
                <Input
                  type="text"
                  id="companyName"
                  name="companyName"
                  placeholder="Digite o nome da empresa"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* CNPJ */}
              <div className="space-y-2">
                <Label htmlFor="cnpj" className="text-gray-700">
                  CNPJ
                </Label>
                <Input
                  type="text"
                  id="cnpj"
                  name="cnpj"
                  placeholder="Digite o CNPJ"
                  value={formData.cnpj}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Digite o email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700">
                  Telefone
                </Label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="Digite o telefone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Confirm Phone */}
              <div className="space-y-2">
                <Label htmlFor="confirmPhone" className="text-gray-700">
                  Confirmar Telefone
                </Label>
                <Input
                  type="tel"
                  id="confirmPhone"
                  name="confirmPhone"
                  placeholder="Confirme o telefone"
                  value={formData.confirmPhone}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-gray-700">
                  Endereço
                </Label>
                <Input
                  type="text"
                  id="address"
                  name="address"
                  placeholder="Digite o endereço"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Responsible Name */}
              <div className="space-y-2">
                <Label htmlFor="responsibleName" className="text-gray-700">
                  Nome do Responsável
                </Label>
                <Input
                  type="text"
                  id="responsibleName"
                  name="responsibleName"
                  placeholder="Digite o nome do responsável"
                  value={formData.responsibleName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">
                  Senha
                </Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Digite a senha"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">
                  Confirmar Senha
                </Label>
                <Input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirme a senha"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors">
                Cadastrar
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-500">
          <p>
            Já possui uma conta? <a href="/login" className="text-blue-600 hover:underline">Entre aqui</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanyRegistrationForm;
