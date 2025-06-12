
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { User, MapPin } from 'lucide-react';
import { CollaboratorComplete } from './types';

interface StepOneProps {
  collaborators: CollaboratorComplete[];
  collaboratorsLoading: boolean;
  selectedCollaborators: string[];
  setSelectedCollaborators: (ids: string[]) => void;
  origemEstado: string;
  setOrigemEstado: (estado: string) => void;
  origemCidade: string;
  setOrigemCidade: (cidade: string) => void;
  estados: Array<{ id: number; sigla: string; nome: string }>;
  origemCidades: Array<{ id: number; nome: string }>;
}

const StepOneCollaboratorsOrigin: React.FC<StepOneProps> = ({
  collaborators,
  collaboratorsLoading,
  selectedCollaborators,
  setSelectedCollaborators,
  origemEstado,
  setOrigemEstado,
  origemCidade,
  setOrigemCidade,
  estados,
  origemCidades,
}) => {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <User className="w-6 h-6" />
            <span>Colaboradores Responsáveis</span>
          </CardTitle>
          <CardDescription className="text-blue-600">
            Selecione os colaboradores que serão responsáveis por este frete
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {collaboratorsLoading ? (
            <div className="text-center py-4">Carregando colaboradores...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {collaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedCollaborators.includes(collaborator.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => {
                    setSelectedCollaborators(
                      selectedCollaborators.includes(collaborator.id)
                        ? selectedCollaborators.filter(id => id !== collaborator.id)
                        : [...selectedCollaborators, collaborator.id]
                    );
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={selectedCollaborators.includes(collaborator.id)}
                      onChange={() => {}}
                    />
                    <div>
                      <h3 className="font-medium text-gray-800">{collaborator.name}</h3>
                      <p className="text-sm text-gray-600">{collaborator.sector}</p>
                      <p className="text-xs text-gray-500">{collaborator.phone}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg border-green-200">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <MapPin className="w-6 h-6" />
            <span>Origem</span>
          </CardTitle>
          <CardDescription className="text-green-600">
            Defina o local de origem da carga
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="origem-estado">Estado de Origem *</Label>
              <Select value={origemEstado} onValueChange={setOrigemEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {estados.map((estado) => (
                    <SelectItem key={estado.id} value={estado.sigla}>
                      {estado.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="origem-cidade">Cidade de Origem *</Label>
              <Select 
                value={origemCidade} 
                onValueChange={setOrigemCidade}
                disabled={!origemEstado}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a cidade" />
                </SelectTrigger>
                <SelectContent>
                  {origemCidades.map((cidade) => (
                    <SelectItem key={cidade.id} value={cidade.nome}>
                      {cidade.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StepOneCollaboratorsOrigin;
