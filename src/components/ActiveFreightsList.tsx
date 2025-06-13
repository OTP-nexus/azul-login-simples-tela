
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Plus,
  AlertCircle,
  Truck
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import FreightCard from './FreightCard';
import FreightDetailsModal from './FreightDetailsModal';
import { useActiveFreights, type ActiveFreight } from '@/hooks/useActiveFreights';
import { useNavigate } from 'react-router-dom';

const ActiveFreightsList = () => {
  const navigate = useNavigate();
  const { freights, loading, error, refetch, updateFreightStatus, deleteFreight } = useActiveFreights();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedFreight, setSelectedFreight] = useState<ActiveFreight | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [freightToDelete, setFreightToDelete] = useState<string | null>(null);

  // Filtrar fretes
  const filteredFreights = freights.filter(freight => {
    const matchesSearch = !searchTerm || 
      freight.codigo_agregamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freight.tipo_mercadoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freight.origem_cidade?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || freight.status === statusFilter;
    const matchesType = typeFilter === 'all' || freight.tipo_frete === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleViewDetails = (freight: ActiveFreight) => {
    setSelectedFreight(freight);
  };

  const handleComplete = async (freightId: string) => {
    await updateFreightStatus(freightId, 'concluido');
  };

  const handleDeleteClick = (freightId: string) => {
    setFreightToDelete(freightId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (freightToDelete) {
      await deleteFreight(freightToDelete);
      setDeleteDialogOpen(false);
      setFreightToDelete(null);
    }
  };

  const getStatusCounts = () => {
    const counts = {
      total: freights.length,
      pendente: freights.filter(f => f.status === 'pendente').length,
      em_andamento: freights.filter(f => f.status === 'em_andamento').length,
      concluido: freights.filter(f => f.status === 'concluido').length,
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando fretes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Erro ao carregar fretes</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={refetch} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-800">{statusCounts.total}</p>
              </div>
              <Truck className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.pendente}</p>
              </div>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {statusCounts.pendente}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold text-blue-600">{statusCounts.em_andamento}</p>
              </div>
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                {statusCounts.em_andamento}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Concluídos</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.concluido}</p>
              </div>
              <Badge variant="default" className="bg-green-100 text-green-800">
                {statusCounts.concluido}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por código, mercadoria ou cidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Todos os Status</option>
                <option value="pendente">Pendente</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Todos os Tipos</option>
                <option value="agregamento">Agregamento</option>
                <option value="frete_completo">Frete Completo</option>
                <option value="frete_de_retorno">Frete de Retorno</option>
              </select>
              
              <Button variant="outline" onClick={refetch}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Fretes */}
      {filteredFreights.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {freights.length === 0 ? 'Nenhum frete encontrado' : 'Nenhum frete corresponde aos filtros'}
            </h3>
            <p className="text-gray-600 mb-6">
              {freights.length === 0 
                ? 'Comece criando seu primeiro pedido de frete'
                : 'Tente ajustar os filtros de busca'
              }
            </p>
            {freights.length === 0 && (
              <Button onClick={() => navigate('/freight-request')}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Novo Frete
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFreights.map((freight) => (
            <FreightCard
              key={freight.id}
              freight={freight}
              onViewDetails={handleViewDetails}
              onComplete={handleComplete}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Modal de Detalhes */}
      <FreightDetailsModal
        freight={selectedFreight}
        isOpen={!!selectedFreight}
        onClose={() => setSelectedFreight(null)}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este frete? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ActiveFreightsList;
