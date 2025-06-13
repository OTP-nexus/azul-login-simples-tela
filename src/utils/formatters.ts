
// Formatar moeda
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Formatar data
export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('pt-BR');
};

// Formatar texto para apenas letras e maiúsculas
export const formatNameInput = (value: string): string => {
  return value
    .replace(/[^a-zA-ZÀ-ÿ\s]/g, '') // Remove caracteres que não são letras ou espaços
    .toUpperCase(); // Converte para maiúscula
};

// Formatar telefone
export const formatPhoneInput = (value: string): string => {
  // Remove todos os caracteres que não são números
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const limitedNumbers = numbers.slice(0, 11);
  
  // Aplica a formatação
  if (limitedNumbers.length <= 2) {
    return limitedNumbers;
  } else if (limitedNumbers.length <= 7) {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
  } else if (limitedNumbers.length <= 10) {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 6)}-${limitedNumbers.slice(6)}`;
  } else {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7, 11)}`;
  }
};

// Validar se o telefone está completo
export const isValidPhone = (phone: string): boolean => {
  const numbers = phone.replace(/\D/g, '');
  return numbers.length >= 10; // Pelo menos 10 dígitos (telefone fixo)
};

// Formatar telefone (alias para compatibilidade)
export const formatPhone = (value: string): string => {
  return formatPhoneInput(value);
};

// Formatar CNPJ
export const formatCNPJ = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  const limitedNumbers = numbers.slice(0, 14);
  
  if (limitedNumbers.length <= 2) {
    return limitedNumbers;
  } else if (limitedNumbers.length <= 5) {
    return `${limitedNumbers.slice(0, 2)}.${limitedNumbers.slice(2)}`;
  } else if (limitedNumbers.length <= 8) {
    return `${limitedNumbers.slice(0, 2)}.${limitedNumbers.slice(2, 5)}.${limitedNumbers.slice(5)}`;
  } else if (limitedNumbers.length <= 12) {
    return `${limitedNumbers.slice(0, 2)}.${limitedNumbers.slice(2, 5)}.${limitedNumbers.slice(5, 8)}/${limitedNumbers.slice(8)}`;
  } else {
    return `${limitedNumbers.slice(0, 2)}.${limitedNumbers.slice(2, 5)}.${limitedNumbers.slice(5, 8)}/${limitedNumbers.slice(8, 12)}-${limitedNumbers.slice(12)}`;
  }
};

// Formatar CPF
export const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  const limitedNumbers = numbers.slice(0, 11);
  
  if (limitedNumbers.length <= 3) {
    return limitedNumbers;
  } else if (limitedNumbers.length <= 6) {
    return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3)}`;
  } else if (limitedNumbers.length <= 9) {
    return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3, 6)}.${limitedNumbers.slice(6)}`;
  } else {
    return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3, 6)}.${limitedNumbers.slice(6, 9)}-${limitedNumbers.slice(9)}`;
  }
};

// Formatar CNH
export const formatCNH = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  return numbers.slice(0, 11); // CNH tem 11 dígitos
};

// Formatar CEP
export const formatCEP = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  const limitedNumbers = numbers.slice(0, 8);
  
  if (limitedNumbers.length <= 5) {
    return limitedNumbers;
  } else {
    return `${limitedNumbers.slice(0, 5)}-${limitedNumbers.slice(5)}`;
  }
};

// Remover formatação (manter apenas números)
export const cleanFormatting = (value: string): string => {
  return value.replace(/\D/g, '');
};
