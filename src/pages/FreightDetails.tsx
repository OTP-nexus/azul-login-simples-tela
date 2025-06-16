
import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useFreightByCode } from '@/hooks/useFreightByCode';

const FreightDetails = () => {
  const { freightCode } = useParams<{ freightCode: string }>();
  const navigate = useNavigate();
  const { data: freight, isLoading, error } = useFreightByCode(freightCode);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !freight) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Frete não encontrado</h1>
          <p className="text-gray-600 mb-6">O código do frete informado não foi encontrado.</p>
          <Button onClick={() => navigate('/lista-fretes')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para lista
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'Não definida';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatValue = (value: number | null) => {
    if (!value) return 'Não definido';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatArray = (arr: any): string => {
    if (!arr) return 'Não definido';
    if (typeof arr === 'string') return arr;
    if (Array.isArray(arr)) {
      if (arr.length === 0) return 'Não definido';
      return arr.map((item: any) => {
        if (typeof item === 'string') return item;
        if (typeof item === 'object' && item !== null) {
          return item.label || item.type || item.value || item.name || JSON.stringify(item);
        }
        return String(item);
      }).join(', ');
    }
    if (typeof arr === 'object' && arr !== null) {
      return JSON.stringify(arr);
    }
    return String(arr);
  };

  const formatDestinations = () => {
    if (freight.destinos && Array.isArray(freight.destinos) && freight.destinos.length > 0) {
      return freight.destinos.map((destino: any, index: number) => (
        <span key={index}>
          {destino.cidade || destino.city}, {destino.estado || destino.state}
          {index < freight.destinos.length - 1 && ' | '}
        </span>
      ));
    }
    if (freight.destino_cidade && freight.destino_estado) {
      return `${freight.destino_cidade}, ${freight.destino_estado}`;
    }
    return 'Não definido';
  };

  const formatStops = () => {
    if (freight.paradas && Array.isArray(freight.paradas) && freight.paradas.length > 0) {
      return freight.paradas.map((parada: any, index: number) => (
        <div key={index} className="ml-4">
          • {parada.cidade}, {parada.estado}
        </div>
      ));
    }
    return null;
  };

  const formatPriceTables = () => {
    if (freight.tabelas_preco && Array.isArray(freight.tabelas_preco) && freight.tabelas_preco.length > 0) {
      return freight.tabelas_preco.map((tabela: any, index: number) => (
        <div key={index} className="ml-4 text-sm bg-gray-50 p-3 rounded mt-2">
          <div><strong>Veículo:</strong> {tabela.vehicleType || 'Não especificado'}</div>
          <div><strong>KM Inicial:</strong> {tabela.kmStart || 'Não definido'}</div>
          <div><strong>KM Final:</strong> {tabela.kmEnd || 'Não definido'}</div>
          <div><strong>Preço:</strong> {tabela.price ? formatValue(tabela.price) : 'Não definido'}</div>
        </div>
      ));
    }
    return <span className="text-gray-500">Nenhuma tabela de preço definida</span>;
  };

  const formatDetailedItems = () => {
    if (freight.itens_detalhados && Array.isArray(freight.itens_detalhados) && freight.itens_detalhados.length > 0) {
      return freight.itens_detalhados.map((item: any, index: number) => (
        <div key={index} className="ml-4 text-sm bg-gray-50 p-3 rounded mt-2">
          <div><strong>Item:</strong> {item.nome || item.name || 'Não especificado'}</div>
          <div><strong>Quantidade:</strong> {item.quantidade || item.quantity || 'Não definida'}</div>
          <div><strong>Peso:</strong> {item.peso || item.weight || 'Não definido'}</div>
          <div><strong>Dimensões:</strong> {item.dimensoes || item.dimensions || 'Não definidas'}</div>
        </div>
      ));
    }
    return null;
  };

  const formatBenefits = () => {
    if (freight.beneficios && Array.isArray(freight.beneficios) && freight.beneficios.length > 0) {
      return freight.beneficios.map((beneficio: any, index: number) => (
        <div key={index} className="ml-4">
          • {typeof beneficio === 'string' ? beneficio : beneficio.label || beneficio.name || JSON.stringify(beneficio)}
        </div>
      ));
    }
    return <span className="text-gray-500">Nenhum benefício especificado</span>;
  };

  const formatSchedulingRules = () => {
    if (freight.regras_agendamento && Array.isArray(freight.regras_agendamento) && freight.regras_agendamento.length > 0) {
      return freight.regras_agendamento.map((regra: any, index: number) => (
        <div key={index} className="ml-4">
          • {typeof regra === 'string' ? regra : regra.label || regra.name || JSON.stringify(regra)}
        </div>
      ));
    }
    return <span className="text-gray-500">Nenhuma regra de agendamento definida</span>;
  };

  const formatDefinedValues = () => {
    if (freight.valores_definidos && typeof freight.valores_definidos === 'object' && freight.valores_definidos !== null) {
      const valores = freight.valores_definidos as any;
      return (
        <div className="ml-4 space-y-2">
          {valores.valorFrete && <div><strong>Valor do Frete:</strong> {formatValue(valores.valorFrete)}</div>}
          {valores.valorKm && <div><strong>Valor por KM:</strong> {formatValue(valores.valorKm)}</div>}
          {valores.valorFixo && <div><strong>Valor Fixo:</strong> {formatValue(valores.valorFixo)}</div>}
          {valores.valorPorcentagem && <div><strong>Porcentagem:</strong> {valores.valorPorcentagem}%</div>}
        </div>
      );
    }
    return <span className="text-gray-500">Nenhum valor definido</span>;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {freight.codigo_agregamento}
        </h1>
        <p className="text-gray-600">Detalhes do frete</p>
      </div>

      <div className="space-y-4 text-lg leading-relaxed">
        <div>
          <span className="font-semibold text-gray-700">Tipo de Frete:</span>{' '}
          <span className="text-gray-900">
            {freight.tipo_frete === 'agregamento' && 'Agregamento'}
            {freight.tipo_frete === 'frete_completo' && 'Frete Completo'}
            {freight.tipo_frete === 'frete_de_retorno' && 'Frete de Retorno'}
            {freight.tipo_frete === 'comum' && 'Comum'}
          </span>
        </div>

        <div>
          <span className="font-semibold text-gray-700">Origem:</span>{' '}
          <span className="text-gray-900">{freight.origem_cidade}, {freight.origem_estado}</span>
        </div>

        <div>
          <span className="font-semibold text-gray-700">Destino:</span>{' '}
          <span className="text-gray-900">{formatDestinations()}</span>
        </div>

        {freight.paradas && Array.isArray(freight.paradas) && freight.paradas.length > 0 && (
          <div>
            <span className="font-semibold text-gray-700">Paradas:</span>
            <div className="mt-2">{formatStops()}</div>
          </div>
        )}

        <div>
          <span className="font-semibold text-gray-700">Tipo de Mercadoria:</span>{' '}
          <span className="text-gray-900">{freight.tipo_mercadoria}</span>
        </div>

        {freight.peso_carga && (
          <div>
            <span className="font-semibold text-gray-700">Peso da Carga:</span>{' '}
            <span className="text-gray-900">{freight.peso_carga} kg</span>
          </div>
        )}

        {freight.valor_carga && (
          <div>
            <span className="font-semibold text-gray-700">Valor da Carga:</span>{' '}
            <span className="text-green-600 font-medium">{formatValue(freight.valor_carga)}</span>
          </div>
        )}

        <div>
          <span className="font-semibold text-gray-700">Data de Coleta:</span>{' '}
          <span className="text-gray-900">{formatDate(freight.data_coleta)}</span>
        </div>

        {freight.data_entrega && (
          <div>
            <span className="font-semibold text-gray-700">Data de Entrega:</span>{' '}
            <span className="text-gray-900">{formatDate(freight.data_entrega)}</span>
          </div>
        )}

        {freight.horario_carregamento && (
          <div>
            <span className="font-semibold text-gray-700">Horário de Carregamento:</span>{' '}
            <span className="text-gray-900">{freight.horario_carregamento}</span>
          </div>
        )}

        {freight.tipos_veiculos && (
          <div>
            <span className="font-semibold text-gray-700">Veículos Compatíveis:</span>{' '}
            <span className="text-gray-900">{formatArray(freight.tipos_veiculos)}</span>
          </div>
        )}

        {freight.tipos_carrocerias && (
          <div>
            <span className="font-semibold text-gray-700">Tipos de Carroceria:</span>{' '}
            <span className="text-gray-900">{formatArray(freight.tipos_carrocerias)}</span>
          </div>
        )}

        {freight.tipo_frete === 'agregamento' && (
          <div>
            <span className="font-semibold text-gray-700">Tabelas de Preço:</span>
            <div className="mt-2">{formatPriceTables()}</div>
          </div>
        )}

        {freight.valores_definidos && (
          <div>
            <span className="font-semibold text-gray-700">Valores Definidos:</span>
            <div className="mt-2">{formatDefinedValues()}</div>
          </div>
        )}

        {freight.itens_detalhados && Array.isArray(freight.itens_detalhados) && freight.itens_detalhados.length > 0 && (
          <div>
            <span className="font-semibold text-gray-700">Itens Detalhados:</span>
            <div className="mt-2">{formatDetailedItems()}</div>
          </div>
        )}

        {freight.tipo_listagem_itens && (
          <div>
            <span className="font-semibold text-gray-700">Tipo de Listagem de Itens:</span>{' '}
            <span className="text-gray-900">{freight.tipo_listagem_itens}</span>
          </div>
        )}

        {freight.descricao_livre_itens && (
          <div>
            <span className="font-semibold text-gray-700">Descrição Livre dos Itens:</span>{' '}
            <span className="text-gray-900">{freight.descricao_livre_itens}</span>
          </div>
        )}

        {freight.beneficios && (
          <div>
            <span className="font-semibold text-gray-700">Benefícios:</span>
            <div className="mt-2">{formatBenefits()}</div>
          </div>
        )}

        {freight.regras_agendamento && (
          <div>
            <span className="font-semibold text-gray-700">Regras de Agendamento:</span>
            <div className="mt-2">{formatSchedulingRules()}</div>
          </div>
        )}

        {freight.origem_tipo_endereco && (
          <div>
            <span className="font-semibold text-gray-700">Tipo de Endereço de Origem:</span>{' '}
            <span className="text-gray-900">{freight.origem_tipo_endereco}</span>
          </div>
        )}

        {freight.destino_tipo_endereco && (
          <div>
            <span className="font-semibold text-gray-700">Tipo de Endereço de Destino:</span>{' '}
            <span className="text-gray-900">{freight.destino_tipo_endereco}</span>
          </div>
        )}

        {freight.pedagio_pago_por && (
          <div>
            <span className="font-semibold text-gray-700">Pedágio Pago Por:</span>{' '}
            <span className="text-gray-900">{freight.pedagio_pago_por}</span>
          </div>
        )}

        {freight.pedagio_direcao && (
          <div>
            <span className="font-semibold text-gray-700">Direção do Pedágio:</span>{' '}
            <span className="text-gray-900">{freight.pedagio_direcao}</span>
          </div>
        )}

        <div>
          <span className="font-semibold text-gray-700">Recursos da Origem:</span>
          <div className="ml-4 space-y-1">
            <div>• Carga/Descarga: {freight.origem_possui_carga_descarga ? 'Sim' : 'Não'}</div>
            <div>• Escada: {freight.origem_possui_escada ? 'Sim' : 'Não'}</div>
            <div>• Elevador: {freight.origem_possui_elevador ? 'Sim' : 'Não'}</div>
            <div>• Doca: {freight.origem_possui_doca ? 'Sim' : 'Não'}</div>
          </div>
        </div>

        <div>
          <span className="font-semibold text-gray-700">Recursos do Destino:</span>
          <div className="ml-4 space-y-1">
            <div>• Carga/Descarga: {freight.destino_possui_carga_descarga ? 'Sim' : 'Não'}</div>
            <div>• Escada: {freight.destino_possui_escada ? 'Sim' : 'Não'}</div>
            <div>• Elevador: {freight.destino_possui_elevador ? 'Sim' : 'Não'}</div>
            <div>• Doca: {freight.destino_possui_doca ? 'Sim' : 'Não'}</div>
          </div>
        </div>

        <div>
          <span className="font-semibold text-gray-700">Serviços Necessários:</span>
          <div className="ml-4 space-y-1">
            <div>• Seguro: {freight.precisa_seguro ? 'Sim' : 'Não'}</div>
            <div>• Rastreador: {freight.precisa_rastreador ? 'Sim' : 'Não'}</div>
            <div>• Ajudante: {freight.precisa_ajudante ? 'Sim' : 'Não'}</div>
            <div>• Montar/Desmontar: {freight.precisa_montar_desmontar ? 'Sim' : 'Não'}</div>
            <div>• Embalagem: {freight.precisa_embalagem ? 'Sim' : 'Não'}</div>
          </div>
        </div>

        {freight.local_possui_restricao && (
          <div>
            <span className="font-semibold text-gray-700">Restrições do Local:</span>{' '}
            <span className="text-red-600">Sim</span>
            {freight.descricao_restricao && (
              <div className="ml-4 mt-1 text-gray-700">
                <strong>Descrição:</strong> {freight.descricao_restricao}
              </div>
            )}
          </div>
        )}

        {freight.tipo_solicitacao && (
          <div>
            <span className="font-semibold text-gray-700">Tipo de Solicitação:</span>{' '}
            <span className="text-gray-900">{freight.tipo_solicitacao}</span>
          </div>
        )}

        {freight.solicitante_nome && (
          <div>
            <span className="font-semibold text-gray-700">Nome do Solicitante:</span>{' '}
            <span className="text-gray-900">{freight.solicitante_nome}</span>
          </div>
        )}

        {freight.solicitante_telefone && (
          <div>
            <span className="font-semibold text-gray-700">Telefone do Solicitante:</span>{' '}
            <span className="text-gray-900">{freight.solicitante_telefone}</span>
          </div>
        )}

        <div>
          <span className="font-semibold text-gray-700">Status:</span>{' '}
          <span className="text-gray-900">{freight.status || 'Ativo'}</span>
        </div>

        {freight.observacoes && (
          <div>
            <span className="font-semibold text-gray-700">Observações:</span>{' '}
            <span className="text-gray-900">{freight.observacoes}</span>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <Button 
          size="lg" 
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          onClick={() => navigate('/login')}
        >
          Tenho Interesse neste Frete
        </Button>
      </div>
    </div>
  );
};

export default FreightDetails;
