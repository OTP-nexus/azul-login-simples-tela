
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MapPin, GripVertical, Trash2, Plus, Clock, Weight, Package } from 'lucide-react';
import { useIBGE } from '@/hooks/useIBGE';
import { Parada } from '@/types/freightComplete';

interface ParadasManagerProps {
  paradas: Parada[];
  onParadasChange: (paradas: Parada[]) => void;
}

const ParadasManager: React.FC<ParadasManagerProps> = ({ paradas, onParadasChange }) => {
  const { states, cities, loadCities } = useIBGE();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addParada = () => {
    const newParada: Parada = {
      id: `parada-${Date.now()}`,
      state: '',
      city: '',
      order: paradas.length + 1,
      tipoOperacao: 'descarga',
      tempoPermanencia: 60
    };
    onParadasChange([...paradas, newParada]);
  };

  const removeParada = (index: number) => {
    const updatedParadas = paradas.filter((_, i) => i !== index);
    const reorderedParadas = updatedParadas.map((parada, i) => ({
      ...parada,
      order: i + 1
    }));
    onParadasChange(reorderedParadas);
  };

  const updateParada = (index: number, field: keyof Parada, value: any) => {
    const updatedParadas = paradas.map((parada, i) => 
      i === index ? { ...parada, [field]: value } : parada
    );
    onParadasChange(updatedParadas);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newParadas = [...paradas];
    const draggedItem = newParadas[draggedIndex];
    newParadas.splice(draggedIndex, 1);
    newParadas.splice(dropIndex, 0, draggedItem);

    const reorderedParadas = newParadas.map((parada, i) => ({
      ...parada,
      order: i + 1
    }));

    onParadasChange(reorderedParadas);
    setDraggedIndex(null);
  };

  const handleStateChange = (index: number, state: string) => {
    updateParada(index, 'state', state);
    updateParada(index, 'city', '');
    loadCities(state);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-green-800">Paradas do Frete Completo</h3>
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            {paradas.length} parada{paradas.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        <Button 
          type="button" 
          onClick={addParada}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Parada
        </Button>
      </div>

      <div className="space-y-4">
        {paradas.map((parada, index) => (
          <Card 
            key={parada.id}
            className="border-l-4 border-l-green-500 bg-green-50/50"
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-600 text-white">
                      Parada {parada.order}
                    </Badge>
                    <Select 
                      value={parada.tipoOperacao} 
                      onValueChange={(value: 'carga' | 'descarga' | 'ambos') => 
                        updateParada(index, 'tipoOperacao', value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="carga">Carga</SelectItem>
                        <SelectItem value="descarga">Descarga</SelectItem>
                        <SelectItem value="ambos">Ambos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeParada(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>Estado</Label>
                  <Select 
                    value={parada.state} 
                    onValueChange={(value) => handleStateChange(index, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map(state => (
                        <SelectItem key={state.sigla} value={state.sigla}>
                          {state.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Cidade</Label>
                  <Select 
                    value={parada.city} 
                    onValueChange={(value) => updateParada(index, 'city', value)}
                    disabled={!parada.state}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a cidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map(city => (
                        <SelectItem key={city.nome} value={city.nome}>
                          {city.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div className="flex-1">
                    <Label>Tempo de Permanência (min)</Label>
                    <Input
                      type="number"
                      value={parada.tempoPermanencia || ''}
                      onChange={(e) => updateParada(index, 'tempoPermanencia', parseInt(e.target.value) || 0)}
                      placeholder="60"
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Weight className="w-4 h-4 text-gray-500" />
                  <div className="flex-1">
                    <Label>Peso Específico (kg)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={parada.pesoEspecifico || ''}
                      onChange={(e) => updateParada(index, 'pesoEspecifico', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-gray-500" />
                  <div className="flex-1">
                    <Label>Volume Específico (m³)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={parada.volumeEspecifico || ''}
                      onChange={(e) => updateParada(index, 'volumeEspecifico', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <Label>Horário Estimado</Label>
                  <Input
                    type="time"
                    value={parada.tempoEstimado || ''}
                    onChange={(e) => updateParada(index, 'tempoEstimado', e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label>Observações da Parada</Label>
                <Textarea
                  value={parada.observacoes || ''}
                  onChange={(e) => updateParada(index, 'observacoes', e.target.value)}
                  placeholder="Observações específicas para esta parada..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {paradas.length === 0 && (
        <Card className="border-2 border-dashed border-green-300 bg-green-50/30">
          <CardContent className="p-8 text-center">
            <MapPin className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-green-700 mb-2">
              Nenhuma parada adicionada
            </h3>
            <p className="text-green-600 mb-4">
              Adicione as paradas sequenciais do seu frete completo
            </p>
            <Button onClick={addParada} className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeira Parada
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ParadasManager;
