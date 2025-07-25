import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Freight {
  id: string;
  tipo_frete: string;
  origem_cidade: string;
  origem_estado: string;
  destino_cidade: string;
  destino_estado: string;
  tipo_mercadoria: string;
  peso_carga: number;
  valor_carga: number;
  status: string;
  observacoes?: string;
  precisa_rastreador?: boolean;
  precisa_ajudante?: boolean;
  precisa_seguro?: boolean;
  companies: {
    company_name: string;
    contact_name: string;
  };
}

interface FreightEditDialogProps {
  freight: Freight;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function FreightEditDialog({ freight, open, onOpenChange, onUpdate }: FreightEditDialogProps) {
  const [formData, setFormData] = useState({
    tipo_frete: freight.tipo_frete,
    origem_cidade: freight.origem_cidade,
    origem_estado: freight.origem_estado,
    destino_cidade: freight.destino_cidade,
    destino_estado: freight.destino_estado,
    tipo_mercadoria: freight.tipo_mercadoria,
    peso_carga: freight.peso_carga || 0,
    valor_carga: freight.valor_carga || 0,
    status: freight.status,
    observacoes: freight.observacoes || '',
    precisa_rastreador: freight.precisa_rastreador || false,
    precisa_ajudante: freight.precisa_ajudante || false,
    precisa_seguro: freight.precisa_seguro || false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        tipo_frete: freight.tipo_frete,
        origem_cidade: freight.origem_cidade,
        origem_estado: freight.origem_estado,
        destino_cidade: freight.destino_cidade,
        destino_estado: freight.destino_estado,
        tipo_mercadoria: freight.tipo_mercadoria,
        peso_carga: freight.peso_carga || 0,
        valor_carga: freight.valor_carga || 0,
        status: freight.status,
        observacoes: freight.observacoes || '',
        precisa_rastreador: freight.precisa_rastreador || false,
        precisa_ajudante: freight.precisa_ajudante || false,
        precisa_seguro: freight.precisa_seguro || false
      });
    }
  }, [freight, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('fretes')
        .update({
          tipo_frete: formData.tipo_frete,
          origem_cidade: formData.origem_cidade,
          origem_estado: formData.origem_estado,
          destino_cidade: formData.destino_cidade,
          destino_estado: formData.destino_estado,
          tipo_mercadoria: formData.tipo_mercadoria,
          peso_carga: formData.peso_carga,
          valor_carga: formData.valor_carga,
          status: formData.status,
          observacoes: formData.observacoes,
          precisa_rastreador: formData.precisa_rastreador,
          precisa_ajudante: formData.precisa_ajudante,
          precisa_seguro: formData.precisa_seguro,
          updated_at: new Date().toISOString()
        })
        .eq('id', freight.id);

      if (error) throw error;

      toast.success('Frete atualizado com sucesso');
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao atualizar frete:', error);
      toast.error('Erro ao atualizar frete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Frete</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo_frete">Tipo de Frete</Label>
              <Select 
                value={formData.tipo_frete} 
                onValueChange={(value) => setFormData({ ...formData, tipo_frete: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agregamento">Agregamento</SelectItem>
                  <SelectItem value="frete_completo">Frete Completo</SelectItem>
                  <SelectItem value="frete_de_retorno">Frete de Retorno</SelectItem>
                  <SelectItem value="comum">Comum</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="pausado">Pausado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origem_cidade">Cidade de Origem</Label>
              <Input
                id="origem_cidade"
                value={formData.origem_cidade}
                onChange={(e) => setFormData({ ...formData, origem_cidade: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="origem_estado">Estado de Origem</Label>
              <Input
                id="origem_estado"
                value={formData.origem_estado}
                onChange={(e) => setFormData({ ...formData, origem_estado: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="destino_cidade">Cidade de Destino</Label>
              <Input
                id="destino_cidade"
                value={formData.destino_cidade}
                onChange={(e) => setFormData({ ...formData, destino_cidade: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destino_estado">Estado de Destino</Label>
              <Input
                id="destino_estado"
                value={formData.destino_estado}
                onChange={(e) => setFormData({ ...formData, destino_estado: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo_mercadoria">Tipo de Mercadoria</Label>
            <Input
              id="tipo_mercadoria"
              value={formData.tipo_mercadoria}
              onChange={(e) => setFormData({ ...formData, tipo_mercadoria: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="peso_carga">Peso da Carga (kg)</Label>
              <Input
                id="peso_carga"
                type="number"
                value={formData.peso_carga}
                onChange={(e) => setFormData({ ...formData, peso_carga: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor_carga">Valor da Carga (R$)</Label>
              <Input
                id="valor_carga"
                type="number"
                step="0.01"
                value={formData.valor_carga}
                onChange={(e) => setFormData({ ...formData, valor_carga: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>Requisitos Especiais</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="precisa_rastreador"
                  checked={formData.precisa_rastreador}
                  onCheckedChange={(checked) => setFormData({ ...formData, precisa_rastreador: checked })}
                />
                <Label htmlFor="precisa_rastreador">Precisa de Rastreador</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="precisa_ajudante"
                  checked={formData.precisa_ajudante}
                  onCheckedChange={(checked) => setFormData({ ...formData, precisa_ajudante: checked })}
                />
                <Label htmlFor="precisa_ajudante">Precisa de Ajudante</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="precisa_seguro"
                  checked={formData.precisa_seguro}
                  onCheckedChange={(checked) => setFormData({ ...formData, precisa_seguro: checked })}
                />
                <Label htmlFor="precisa_seguro">Precisa de Seguro</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}