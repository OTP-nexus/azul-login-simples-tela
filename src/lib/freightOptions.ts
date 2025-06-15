
export const vehicleTypeGroups = [
  {
    groupLabel: 'Pesados',
    types: [
      { value: 'carreta_simples', label: 'Carreta Simples' },
      { value: 'carreta_eixo_extendido', label: 'Carreta Eixo Extendido' },
      { value: 'bitrem', label: 'Bitrem / Tritrem' },
      { value: 'rodotrem', label: 'Rodotrem' },
    ],
  },
  {
    groupLabel: 'Médios',
    types: [{ value: 'caminhao_truck', label: 'Caminhão Truck' }],
  },
  {
    groupLabel: 'Leves',
    types: [
      { value: 'caminhao_toco', label: 'Caminhão Toco' },
      { value: 'caminhao_3_4', label: 'Caminhão 3/4 (VUC)' },
      { value: 'van', label: 'Van' },
      { value: 'fiorino', label: 'Fiorino' },
    ],
  },
  {
    groupLabel: 'Outro',
    types: [{ value: 'outro', label: 'Outro' }],
  },
];

export const bodyTypeGroups = [
  {
    groupLabel: 'Abertas',
    types: [
      { value: 'grade_baixa', label: 'Grade Baixa' },
      { value: 'graneleiro', label: 'Graneleiro' },
      { value: 'prancha', label: 'Prancha' },
    ],
  },
  {
    groupLabel: 'Fechadas',
    types: [
      { value: 'bau', label: 'Baú' },
      { value: 'bau_frigorifico', label: 'Baú Frigorífico' },
      { value: 'sider', label: 'Sider' },
    ],
  },
  {
    groupLabel: 'Especiais',
    types: [
      { value: 'porta_container', label: 'Porta Container' },
      { value: 'sogras', label: 'Sogras' },
      { value: 'outro', label: 'Outro' },
    ],
  },
];

export const freightTypes = [
    { value: 'agregamento', label: 'Agregamento' },
    { value: 'frete_completo', label: 'Frete Completo' },
    { value: 'frete_de_retorno', label: 'Frete de Retorno' },
    { value: 'comum', label: 'Frete Comum' },
];
