
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Package, 
  Calendar, 
  DollarSign, 
  Truck, 
  Settings, 
  Building, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  Calculator,
  Route,
  FileText,
  Boxes,
  Phone,
  User
} from 'lucide-react';
import type { Freight } from '@/hooks/usePublicFreights';

interface FreightDetailsSectionProps {
  freight: Freight;
}

const FreightDetailsSection = ({ freight }: FreightDetailsSectionProps) => {
  const formatValue = (value: number | null) => {
    if (!value) return 'Não definido';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Não definida';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const renderArrayData = (data: any[], emptyMessage = 'Não especificado') => {
    if (!Array.isArray(data) || data.length === 0) {
      return <p className="text-gray-500 italic">{emptyMessage}</p>;
    }

    return (
      <div className="flex flex-wrap gap-2">
        {data.map((item, index) => {
          let displayText = '';
          
          if (typeof item === 'string') {
            displayText = item;
          } else if (typeof item === 'object' && item !== null) {
            // Handle different object structures
            if (item.label) {
              displayText = item.label;
            } else if (item.nome) {
              displayText = item.nome;
            } else if (item.type) {
              displayText = item.type;
            } else if (item.value) {
              displayText = item.value;
            } else if (item.categoria) {
              displayText = item.categoria;
            } else {
              displayText = JSON.stringify(item);
            }
          } else {
            displayText = String(item);
          }

          return (
            <Badge key={index} variant="outline" className="mr-1 mb-1">
              {displayText}
            </Badge>
          );
        })}
      </div>
    );
  };

  const renderFacilities = (prefix: 'origem' | 'destino') => {
    const facilities = [
      { key: `${prefix}_possui_carga_descarga`, label: 'Carga/Descarga' },
      { key: `${prefix}_possui_doca`, label: 'Doca' },
      { key: `${prefix}_possui_elevador`, label: 'Elevador' },
      { key: `${prefix}_possui_escada`, label: 'Escada' }
    ];

    return (
      <div className="grid grid-cols-2 gap-2">
        {facilities.map(({ key, label }) => {
          const hasFeature = freight[key as keyof Freight] as boolean;
          return (
            <div key={key} className="flex items-center space-x-2">
              {hasFeature ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-400" />
              )}
              <span className={hasFeature ? 'text-green-700' : 'text-gray-500'}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTabelasPreco = () => {
    if (!freight.tabelas_preco || freight.tabelas_preco.length === 0) {
      return <p className="text-gray-500 italic">Nenhuma tabela de preços definida</p>;
    }

    return (
      <div className="space-y-3">
        {freight.tabelas_preco.map((tabela: any, index: number) => (
          <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-gray-600">Tipo de Veículo</p>
                <p className="font-medium">{tabela.vehicle_type || tabela.tipo_veiculo || 'Não especificado'}</p>
              </div>
              <div>
                <p className="text-gray-600">Distância (km)</p>
                <p className="font-medium">{tabela.km_start || 0} - {tabela.km_end || 0} km</p>
              </div>
              <div>
                <p className="text-gray-600">Valor</p>
                <p className="font-medium text-green-600">{formatValue(tabela.price || tabela.preco)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getDestinationsText = () => {
    if (freight.destinos && freight.destinos.length > 0) {
      return freight.destinos.map((dest: any, index: number) => (
        <div key={index} className="bg-green-50 p-2 rounded border border-green-200 mb-2">
          <p className="font-medium text-green-900">
            {typeof dest === 'string' ? dest : `${dest.cidade || dest.city || ''}, ${dest.estado || dest.state || ''}`}
          </p>
        </div>
      ));
    }
    if (freight.destino_cidade && freight.destino_estado) {
      return (
        <div className="bg-green-50 p-2 rounded border border-green-200">
          <p className="font-medium text-green-900">{freight.destino_cidade}, {freight.destino_estado}</p>
        </div>
      );
    }
    return <p className="text-gray-500 italic">Destino não definido</p>;
  };

  const renderBeneficios = () => {
    if (!freight.beneficios || freight.beneficios.length === 0) {
      return <p className="text-gray-500 italic">Nenhum benefício especificado</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {freight.beneficios.map((beneficio: any, index: number) => {
          let titulo = '';
          let descricao = '';
          
          if (typeof beneficio === 'string') {
            titulo = beneficio;
          } else if (typeof beneficio === 'object' && beneficio !== null) {
            titulo = beneficio.titulo || beneficio.nome || beneficio.type || 'Benefício';
            descricao = beneficio.descricao || beneficio.description || '';
          }

          return (
            <div key={index} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="font-medium text-blue-900">{titulo}</p>
              {descricao && <p className="text-sm text-blue-700 mt-1">{descricao}</p>}
            </div>
          );
        })}
      </div>
    );
  };

  const renderRegrasAgendamento = () => {
    if (!freight.regras_agendamento || freight.regras_agendamento.length === 0) {
      return <p className="text-gray-500 italic">Nenhuma regra especificada</p>;
    }

    return (
      <div className="space-y-2">
        {freight.regras_agendamento.map((regra: any, index: number) => {
          let texto = '';
          
          if (typeof regra === 'string') {
            texto = regra;
          } else if (typeof regra === 'object' && regra !== null) {
            texto = regra.descricao || regra.texto || regra.rule || JSON.stringify(regra);
          }

          return (
            <div key={index} className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <p className="text-purple-900">{texto}</p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Tipo de Solicitação</p>
            <p className="font-medium capitalize">{freight.tipo_solicitacao || 'Empresa'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <Badge variant={freight.status === 'ativo' ? 'default' : 'secondary'}>
              {freight.status}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500">Criado em</p>
            <p className="font-medium">{formatDate(freight.created_at)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Atualizado em</p>
            <p className="font-medium">{formatDate(freight.updated_at)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Trajeto Completo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
            Trajeto Completo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Origem */}
          <div>
            <h4 className="font-semibold text-blue-700 mb-3">Origem</h4>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="font-medium text-lg">{freight.origem_cidade}, {freight.origem_estado}</p>
              {freight.origem_tipo_endereco && (
                <p className="text-sm text-gray-600 mt-1">Tipo: {freight.origem_tipo_endereco}</p>
              )}
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Facilidades:</p>
                {renderFacilities('origem')}
              </div>
            </div>
          </div>

          {/* Paradas */}
          {freight.paradas && freight.paradas.length > 0 && (
            <div>
              <h4 className="font-semibold text-yellow-700 mb-3">Paradas</h4>
              <div className="space-y-2">
                {freight.paradas.map((parada: any, index: number) => (
                  <div key={index} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <p className="font-medium text-yellow-900">
                      Parada {index + 1}: {typeof parada === 'string' ? parada : `${parada.cidade}, ${parada.estado}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Destinos */}
          <div>
            <h4 className="font-semibold text-green-700 mb-3">Destino(s)</h4>
            <div className="space-y-2">
              {getDestinationsText()}
            </div>
            {freight.destino_tipo_endereco && (
              <p className="text-sm text-gray-600 mt-2">Tipo: {freight.destino_tipo_endereco}</p>
            )}
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Facilidades:</p>
              {renderFacilities('destino')}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Datas e Horários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-purple-600" />
            Datas e Horários
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Data de Coleta</p>
            <p className="font-medium">{formatDate(freight.data_coleta)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Data de Entrega</p>
            <p className="font-medium">{formatDate(freight.data_entrega)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Horário de Carregamento</p>
            <p className="font-medium">{freight.horario_carregamento || 'Não definido'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Informações da Carga */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2 text-orange-600" />
            Informações da Carga
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Tipo de Mercadoria</p>
              <p className="font-medium">{freight.tipo_mercadoria}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Peso da Carga</p>
              <p className="font-medium">{freight.peso_carga ? `${freight.peso_carga} kg` : 'Não definido'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Valor da Carga</p>
              <p className="font-medium">{formatValue(freight.valor_carga)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tipo de Listagem</p>
              <p className="font-medium">{freight.tipo_listagem_itens || 'Não especificado'}</p>
            </div>
          </div>

          {freight.descricao_livre_itens && (
            <div>
              <p className="text-sm text-gray-500">Descrição dos Itens</p>
              <p className="font-medium bg-gray-50 p-3 rounded-lg">{freight.descricao_livre_itens}</p>
            </div>
          )}

          {freight.itens_detalhados && freight.itens_detalhados.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Itens Detalhados</p>
              {renderArrayData(freight.itens_detalhados, 'Nenhum item detalhado')}
            </div>
          )}

          {/* Serviços Adicionais */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Serviços Adicionais:</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                {freight.precisa_montar_desmontar ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className={freight.precisa_montar_desmontar ? 'text-green-700' : 'text-gray-500'}>
                  Montar/Desmontar
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {freight.precisa_embalagem ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className={freight.precisa_embalagem ? 'text-green-700' : 'text-gray-500'}>
                  Embalagem
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Veículos e Carrocerias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="w-5 h-5 mr-2 text-purple-600" />
            Veículos e Carrocerias
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-2">Tipos de Veículos Aceitos</p>
            {renderArrayData(freight.tipos_veiculos, 'Nenhum tipo de veículo especificado')}
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Tipos de Carrocerias Aceitas</p>
            {renderArrayData(freight.tipos_carrocerias, 'Nenhum tipo de carroceria especificado')}
          </div>
        </CardContent>
      </Card>

      {/* Requisitos e Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2 text-red-600" />
            Requisitos e Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              {freight.precisa_seguro ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-400" />
              )}
              <span className={freight.precisa_seguro ? 'text-green-700' : 'text-gray-500'}>
                Seguro {freight.precisa_seguro ? 'obrigatório' : 'não obrigatório'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {freight.precisa_rastreador ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-400" />
              )}
              <span className={freight.precisa_rastreador ? 'text-green-700' : 'text-gray-500'}>
                Rastreador {freight.precisa_rastreador ? 'obrigatório' : 'não obrigatório'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {freight.precisa_ajudante ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-400" />
              )}
              <span className={freight.precisa_ajudante ? 'text-green-700' : 'text-gray-500'}>
                Ajudante {freight.precisa_ajudante ? 'obrigatório' : 'não obrigatório'}
              </span>
            </div>
          </div>

          {(freight.pedagio_pago_por || freight.pedagio_direcao) && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-900">Informações sobre Pedágio:</p>
              {freight.pedagio_pago_por && (
                <p className="text-sm text-blue-700">Pago por: {freight.pedagio_pago_por}</p>
              )}
              {freight.pedagio_direcao && (
                <p className="text-sm text-blue-700">Direção: {freight.pedagio_direcao}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restrições */}
      {freight.local_possui_restricao && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
              Restrições
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-yellow-800">
                {freight.descricao_restricao || 'Local possui restrições específicas'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seções específicas por tipo de frete */}
      {freight.tipo_frete === 'agregamento' && (
        <>
          {/* Tabelas de Preços */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-green-600" />
                Tabelas de Preços
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderTabelasPreco()}
            </CardContent>
          </Card>

          {/* Benefícios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Benefícios Oferecidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderBeneficios()}
            </CardContent>
          </Card>

          {/* Regras de Agendamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Route className="w-5 h-5 mr-2 text-purple-600" />
                Regras de Agendamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderRegrasAgendamento()}
            </CardContent>
          </Card>
        </>
      )}

      {/* Contato */}
      {freight.tipo_frete === 'comum' && (freight.solicitante_nome || freight.solicitante_telefone) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="w-5 h-5 mr-2 text-blue-600" />
              Informações do Solicitante
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {freight.solicitante_nome && (
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-600" />
                <span className="font-medium">{freight.solicitante_nome}</span>
              </div>
            )}
            {freight.solicitante_telefone && (
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-600" />
                <span className="font-medium">{freight.solicitante_telefone}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Observações */}
      {freight.observacoes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-gray-600" />
              Observações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
              {freight.observacoes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FreightDetailsSection;
