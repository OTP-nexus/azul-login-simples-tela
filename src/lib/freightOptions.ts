
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

// Exportação legacy para compatibilidade
export const freightOptions = {
  tiposVeiculos: vehicleTypeGroups.flatMap(group => group.types.map(type => type.label)),
  tiposCarrocerias: bodyTypeGroups.flatMap(group => group.types.map(type => type.label)),
  tiposMercadoria: [
    'Alimentos',
    'Bebidas',
    'Produtos Químicos',
    'Máquinas e Equipamentos',
    'Materiais de Construção',
    'Produtos Eletrônicos',
    'Móveis',
    'Roupas e Tecidos',
    'Combustíveis',
    'Medicamentos',
    'Produtos Agrícolas',
    'Automóveis',
    'Peças Automotivas',
    'Produtos Siderúrgicos',
    'Papel e Celulose',
    'Outros'
  ],
  estados: [
    { value: 'AC', label: 'Acre' },
    { value: 'AL', label: 'Alagoas' },
    { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' },
    { value: 'BA', label: 'Bahia' },
    { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' },
    { value: 'ES', label: 'Espírito Santo' },
    { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' },
    { value: 'MT', label: 'Mato Grosso' },
    { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'PA', label: 'Pará' },
    { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'SE', label: 'Sergipe' },
    { value: 'TO', label: 'Tocantins' }
  ]
};
