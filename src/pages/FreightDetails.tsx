
import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useFreightByCode } from '@/hooks/useFreightByCode';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  const safeParseJson = (data: any): any[] => {
    if (!data) return [];
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    if (Array.isArray(data)) return data;
    return [];
  };

  const formatDestinations = () => {
    const destinos = safeParseJson(freight.destinos);
    if (destinos.length > 0) {
      return destinos.map((destino: any, index: number) => (
        <span key={index}>
          {destino.cidade || destino.city}, {destino.estado || destino.state}
          {index < destinos.length - 1 && ' | '}
        </span>
      ));
    }
    if (freight.destino_cidade && freight.destino_estado) {
      return `${freight.destino_cidade}, ${freight.destino_estado}`;
    }
    return 'Não definido';
  };

  const formatStops = () => {
    const paradas = safeParseJson(freight.paradas);
    if (paradas.length > 0) {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cidade</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paradas.map((parada: any, index: number) => (
              <TableRow key={index}>
                <TableCell>{parada.cidade}</TableCell>
                <TableCell>{parada.estado}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }
    return <span className="text-gray-500">Nenhuma parada definida</span>;
  };

  const formatPriceTables = () => {
    const tabelas = safeParseJson(freight.tabelas_preco);
    if (tabelas.length > 0) {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo de Veículo</TableHead>
              <TableHead>KM Inicial</TableHead>
              <TableHead>KM Final</TableHead>
              <TableHead>Preço</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tabelas.map((tabela: any, index: number) => (
              <TableRow key={index}>
                <TableCell>{tabela.vehicleType || 'Não especificado'}</TableCell>
                <TableCell>{tabela.kmStart || 'Não definido'}</TableCell>
                <TableCell>{tabela.kmEnd || 'Não definido'}</TableCell>
                <TableCell>{tabela.price ? formatValue(tabela.price) : 'Não definido'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }
    return <span className="text-gray-500">Nenhuma tabela de preço definida</span>;
  };

  const formatDetailedItems = () => {
    const itens = safeParseJson(freight.itens_detalhados);
    if (itens.length > 0) {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Peso</TableHead>
              <TableHead>Dimensões</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itens.map((item: any, index: number) => (
              <TableRow key={index}>
                <TableCell>{item.nome || item.name || 'Não especificado'}</TableCell>
                <TableCell>{item.quantidade || item.quantity || 'Não definida'}</TableCell>
                <TableCell>{item.peso || item.weight || 'Não definido'}</TableCell>
                <TableCell>{item.dimensoes || item.dimensions || 'Não definidas'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }
    return <span className="text-gray-500">Nenhum item detalhado</span>;
  };

  const formatBenefits = () => {
    const beneficios = safeParseJson(freight.beneficios);
    if (beneficios.length > 0) {
      return (
        <ul className="list-disc ml-6">
          {beneficios.map((beneficio: any, index: number) => (
            <li key={index}>
              {typeof beneficio === 'string' ? beneficio : beneficio.label || beneficio.name || JSON.stringify(beneficio)}
            </li>
          ))}
        </ul>
      );
    }
    return <span className="text-gray-500">Nenhum benefício especificado</span>;
  };

  const formatSchedulingRules = () => {
    const regras = safeParseJson(freight.regras_agendamento);
    if (regras.length > 0) {
      return (
        <ul className="list-disc ml-6">
          {regras.map((regra: any, index: number) => (
            <li key={index}>
              {typeof regra === 'string' ? regra : regra.label || regra.name || JSON.stringify(regra)}
            </li>
          ))}
        </ul>
      );
    }
    return <span className="text-gray-500">Nenhuma regra de agendamento definida</span>;
  };

  const formatDefinedValues = () => {
    if (freight.valores_definidos && typeof freight.valores_definidos === 'object' && freight.valores_definidos !== null) {
      const valores = freight.valores_definidos as any;
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo de Valor</TableHead>
              <TableHead>Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {valores.valorFrete && (
              <TableRow>
                <TableCell>Valor do Frete</TableCell>
                <TableCell>{formatValue(valores.valorFrete)}</TableCell>
              </TableRow>
            )}
            {valores.valorKm && (
              <TableRow>
                <TableCell>Valor por KM</TableCell>
                <TableCell>{formatValue(valores.valorKm)}</TableCell>
              </TableRow>
            )}
            {valores.valorFixo && (
              <TableRow>
                <TableCell>Valor Fixo</TableCell>
                <TableCell>{formatValue(valores.valorFixo)}</TableCell>
              </TableRow>
            )}
            {valores.valorPorcentagem && (
              <TableRow>
                <TableCell>Porcentagem</TableCell>
                <TableCell>{valores.valorPorcentagem}%</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      );
    }
    return <span className="text-gray-500">Nenhum valor definido</span>;
  };

  const formatVehicleTypes = () => {
    const tipos = safeParseJson(freight.tipos_veiculos);
    if (tipos.length > 0) {
      return tipos.map((tipo: any) => {
        if (typeof tipo === 'string') return tipo;
        if (typeof tipo === 'object' && tipo !== null) {
          return tipo.label || tipo.type || tipo.value || tipo.name || JSON.stringify(tipo);
        }
        return String(tipo);
      }).join(', ');
    }
    return 'Não definido';
  };

  const formatBodyTypes = () => {
    const tipos = safeParseJson(freight.tipos_carrocerias);
    if (tipos.length > 0) {
      return tipos.map((tipo: any) => {
        if (typeof tipo === 'string') return tipo;
        if (typeof tipo === 'object' && tipo !== null) {
          return tipo.label || tipo.type || tipo.value || tipo.name || JSON.stringify(tipo);
        }
        return String(tipo);
      }).join(', ');
    }
    return 'Não definido';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold">Tipo de Frete</TableCell>
                  <TableCell>
                    {freight.tipo_frete === 'agregamento' && 'Agregamento'}
                    {freight.tipo_frete === 'frete_completo' && 'Frete Completo'}
                    {freight.tipo_frete === 'frete_de_retorno' && 'Frete de Retorno'}
                    {freight.tipo_frete === 'comum' && 'Comum'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Origem</TableCell>
                  <TableCell>{freight.origem_cidade}, {freight.origem_estado}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Destino</TableCell>
                  <TableCell>{formatDestinations()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Tipo de Mercadoria</TableCell>
                  <TableCell>{freight.tipo_mercadoria}</TableCell>
                </TableRow>
                {freight.peso_carga && (
                  <TableRow>
                    <TableCell className="font-semibold">Peso da Carga</TableCell>
                    <TableCell>{freight.peso_carga} kg</TableCell>
                  </TableRow>
                )}
                {freight.valor_carga && (
                  <TableRow>
                    <TableCell className="font-semibold">Valor da Carga</TableCell>
                    <TableCell className="text-green-600 font-medium">{formatValue(freight.valor_carga)}</TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell className="font-semibold">Data de Coleta</TableCell>
                  <TableCell>{formatDate(freight.data_coleta)}</TableCell>
                </TableRow>
                {freight.data_entrega && (
                  <TableRow>
                    <TableCell className="font-semibold">Data de Entrega</TableCell>
                    <TableCell>{formatDate(freight.data_entrega)}</TableCell>
                  </TableRow>
                )}
                {freight.horario_carregamento && (
                  <TableRow>
                    <TableCell className="font-semibold">Horário de Carregamento</TableCell>
                    <TableCell>{freight.horario_carregamento}</TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell className="font-semibold">Status</TableCell>
                  <TableCell>{freight.status || 'Ativo'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Veículos e Carrocerias */}
        <Card>
          <CardHeader>
            <CardTitle>Veículos e Carrocerias</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold">Veículos Compatíveis</TableCell>
                  <TableCell>{formatVehicleTypes()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Tipos de Carroceria</TableCell>
                  <TableCell>{formatBodyTypes()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recursos da Origem */}
        <Card>
          <CardHeader>
            <CardTitle>Recursos da Origem</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold">Carga/Descarga</TableCell>
                  <TableCell>{freight.origem_possui_carga_descarga ? 'Sim' : 'Não'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Escada</TableCell>
                  <TableCell>{freight.origem_possui_escada ? 'Sim' : 'Não'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Elevador</TableCell>
                  <TableCell>{freight.origem_possui_elevador ? 'Sim' : 'Não'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Doca</TableCell>
                  <TableCell>{freight.origem_possui_doca ? 'Sim' : 'Não'}</TableCell>
                </TableRow>
                {freight.origem_tipo_endereco && (
                  <TableRow>
                    <TableCell className="font-semibold">Tipo de Endereço</TableCell>
                    <TableCell>{freight.origem_tipo_endereco}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recursos do Destino */}
        <Card>
          <CardHeader>
            <CardTitle>Recursos do Destino</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold">Carga/Descarga</TableCell>
                  <TableCell>{freight.destino_possui_carga_descarga ? 'Sim' : 'Não'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Escada</TableCell>
                  <TableCell>{freight.destino_possui_escada ? 'Sim' : 'Não'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Elevador</TableCell>
                  <TableCell>{freight.destino_possui_elevador ? 'Sim' : 'Não'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Doca</TableCell>
                  <TableCell>{freight.destino_possui_doca ? 'Sim' : 'Não'}</TableCell>
                </TableRow>
                {freight.destino_tipo_endereco && (
                  <TableRow>
                    <TableCell className="font-semibold">Tipo de Endereço</TableCell>
                    <TableCell>{freight.destino_tipo_endereco}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Serviços Necessários */}
        <Card>
          <CardHeader>
            <CardTitle>Serviços Necessários</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold">Seguro</TableCell>
                  <TableCell>{freight.precisa_seguro ? 'Sim' : 'Não'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Rastreador</TableCell>
                  <TableCell>{freight.precisa_rastreador ? 'Sim' : 'Não'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Ajudante</TableCell>
                  <TableCell>{freight.precisa_ajudante ? 'Sim' : 'Não'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Montar/Desmontar</TableCell>
                  <TableCell>{freight.precisa_montar_desmontar ? 'Sim' : 'Não'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Embalagem</TableCell>
                  <TableCell>{freight.precisa_embalagem ? 'Sim' : 'Não'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Informações do Pedágio */}
        {(freight.pedagio_pago_por || freight.pedagio_direcao) && (
          <Card>
            <CardHeader>
              <CardTitle>Informações do Pedágio</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {freight.pedagio_pago_por && (
                    <TableRow>
                      <TableCell className="font-semibold">Pedágio Pago Por</TableCell>
                      <TableCell>{freight.pedagio_pago_por}</TableCell>
                    </TableRow>
                  )}
                  {freight.pedagio_direcao && (
                    <TableRow>
                      <TableCell className="font-semibold">Direção do Pedágio</TableCell>
                      <TableCell>{freight.pedagio_direcao}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Paradas */}
      {safeParseJson(freight.paradas).length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Paradas</CardTitle>
          </CardHeader>
          <CardContent>
            {formatStops()}
          </CardContent>
        </Card>
      )}

      {/* Tabelas de Preço para Agregamento */}
      {freight.tipo_frete === 'agregamento' && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Tabelas de Preço</CardTitle>
          </CardHeader>
          <CardContent>
            {formatPriceTables()}
          </CardContent>
        </Card>
      )}

      {/* Valores Definidos */}
      {freight.valores_definidos && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Valores Definidos</CardTitle>
          </CardHeader>
          <CardContent>
            {formatDefinedValues()}
          </CardContent>
        </Card>
      )}

      {/* Itens Detalhados */}
      {safeParseJson(freight.itens_detalhados).length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Itens Detalhados</CardTitle>
          </CardHeader>
          <CardContent>
            {formatDetailedItems()}
          </CardContent>
        </Card>
      )}

      {/* Informações Adicionais */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Informações Adicionais</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              {freight.tipo_listagem_itens && (
                <TableRow>
                  <TableCell className="font-semibold">Tipo de Listagem de Itens</TableCell>
                  <TableCell>{freight.tipo_listagem_itens}</TableCell>
                </TableRow>
              )}
              {freight.descricao_livre_itens && (
                <TableRow>
                  <TableCell className="font-semibold">Descrição Livre dos Itens</TableCell>
                  <TableCell>{freight.descricao_livre_itens}</TableCell>
                </TableRow>
              )}
              {freight.local_possui_restricao && (
                <TableRow>
                  <TableCell className="font-semibold">Restrições do Local</TableCell>
                  <TableCell className="text-red-600">
                    Sim
                    {freight.descricao_restricao && (
                      <div className="mt-1 text-gray-700">
                        <strong>Descrição:</strong> {freight.descricao_restricao}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )}
              {freight.tipo_solicitacao && (
                <TableRow>
                  <TableCell className="font-semibold">Tipo de Solicitação</TableCell>
                  <TableCell>{freight.tipo_solicitacao}</TableCell>
                </TableRow>
              )}
              {freight.solicitante_nome && (
                <TableRow>
                  <TableCell className="font-semibold">Nome do Solicitante</TableCell>
                  <TableCell>{freight.solicitante_nome}</TableCell>
                </TableRow>
              )}
              {freight.solicitante_telefone && (
                <TableRow>
                  <TableCell className="font-semibold">Telefone do Solicitante</TableCell>
                  <TableCell>{freight.solicitante_telefone}</TableCell>
                </TableRow>
              )}
              {freight.observacoes && (
                <TableRow>
                  <TableCell className="font-semibold">Observações</TableCell>
                  <TableCell>{freight.observacoes}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Benefícios */}
      {safeParseJson(freight.beneficios).length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Benefícios</CardTitle>
          </CardHeader>
          <CardContent>
            {formatBenefits()}
          </CardContent>
        </Card>
      )}

      {/* Regras de Agendamento */}
      {safeParseJson(freight.regras_agendamento).length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Regras de Agendamento</CardTitle>
          </CardHeader>
          <CardContent>
            {formatSchedulingRules()}
          </CardContent>
        </Card>
      )}

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
