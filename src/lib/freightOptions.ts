
export const vehicleTypeGroups = [
  {
    groupLabel: 'Pesados',
    types: [
      { value: 'carreta', label: 'Carreta' },
      { value: 'carreta_ls', label: 'Carreta LS' },
      { value: 'vanderleia', label: 'Vanderléia' },
      { value: 'bitrem', label: 'Bitrem' },
      { value: 'rodotrem', label: 'Rodotrem' },
    ],
  },
  {
    groupLabel: 'Médios',
    types: [
      { value: 'truck', label: 'Truck' },
      { value: 'bitruck', label: 'Bitruck' },
    ],
  },
  {
    groupLabel: 'Leves',
    types: [
      { value: 'toco', label: 'Toco' },
      { value: '3_4', label: '3/4' },
      { value: 'vuc', label: 'VLC / VUC' },
      { value: 'fiorino', label: 'Fiorino' },
      { value: 'van', label: 'Van' },
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
      { value: 'cacamba', label: 'Caçamba' },
      { value: 'plataforma', label: 'Plataforma' },
    ],
  },
  {
    groupLabel: 'Fechadas',
    types: [
      { value: 'bau', label: 'Baú' },
      { value: 'bau_frigorifico', label: 'Baú Frigorífico' },
      { value: 'bau_refrigerado', label: 'Baú Refrigerado' },
      { value: 'sider', label: 'Sider' },
    ],
  },
  {
    groupLabel: 'Especiais',
    types: [
      { value: 'porta_container', label: 'Bug Porta Container' },
      { value: 'munk', label: 'Munk' },
      { value: 'silo', label: 'Silo' },
      { value: 'tanque', label: 'Tanque' },
      { value: 'gaiola', label: 'Gaiola' },
      { value: 'cegonheiro', label: 'Cegonheiro' },
      { value: 'cavaqueira', label: 'Cavaqueira' },
      { value: 'hopper', label: 'Hopper' },
      { value: 'apenas_cavalo', label: 'Apenas Cavalo' },
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
