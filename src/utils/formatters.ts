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
