
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Plus, X } from 'lucide-react';
import { DestinationComplete } from './types';

interface StepTwoProps {
  destinos: DestinationComplete[];
  destinoEstado: string;
  setDestinoEstado: (estado: string) => void;
  destinoCidade: string;
  setDestinoCidade: (cidade: string) => void;
  handleAddDestino: () => void;
  handleRemoveDestino: (id: string) => void;
  tipoMercadoria: string;
  setTipoMercadoria: (tipo: string) => void;
  estados: Array<{ id: number; sigla: string; nome: string }>;
  destinoCidades: Array<{ id: number; nome: string }>;
}

const StepTwoDestinationsLoad: React.FC<StepTwoProps> = ({
  destinos,
  destinoEstado,
  setDestinoEstado,
  destinoCidade,
  setDestinoCidade,
  handleAddDestino,
  handleRemoveDestino,
  tipoMercadoria,
  setTipoMercadoria,
  estados,
  destinoCidades,
}) => {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-orange-200">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
          <CardTitle className="flex items-center space-x-2 text-orange-800">
            <MapPin className="w-6 h-6" />
            <span>Destinos</span>
          </CardTitle>
          <CardDescription className="text-orange-600">
            Adicione os destinos para este frete completo
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Estado do Destino</Label>
                <Select value={destinoEstado} onValueChange={setDestinoEstado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
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
                <Label>Cidade do Destino</Label>
                <Select 
                  value={destinoCidade} 
                  onValueChange={setDestinoCidade}
                  disabled={!destinoEstado}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinoCidades.map((cidade) => (
                      <SelectItem key={cidade.id} value={cidade.nome}>
                        {cidade.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleAddDestino}
                  disabled={!destinoEstado || !destinoCidade}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </div>

            {destinos.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800">Destinos Adicionados:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {destinos.map((destino) => (
                    <div key={destino.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <span className="text-orange-800">
                        {destino.city}/{destino.state}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDestino(destino.id)}
                        className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
          <CardTitle className="text-purple-800">Informações da Carga</CardTitle>
          <CardDescription className="text-purple-600">
            Defina as características da mercadoria
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tipo-mercadoria">Tipo de Mercadoria *</Label>
              <Input
                id="tipo-mercadoria"
                value={tipoMercadoria}
                onChange={(e) => setTipoMercadoria(e.target.value)}
                placeholder="Ex: Produtos eletrônicos, roupas, alimentos..."
                className="border-purple-200 focus:border-purple-400"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StepTwoDestinationsLoad;
