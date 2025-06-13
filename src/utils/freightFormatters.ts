
export const formatCurrency = (value: string): string => {
  // Remove all non-digit characters
  const cleanValue = value.replace(/\D/g, '');
  
  if (!cleanValue) return '';
  
  // Convert to number and format
  const numValue = parseFloat(cleanValue) / 100;
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(numValue);
};

export const formatNumericInput = (value: string, maxDecimals: number = 2): string => {
  // Remove all non-digit and non-dot characters
  let cleanValue = value.replace(/[^\d.]/g, '');
  
  // Ensure only one decimal point
  const parts = cleanValue.split('.');
  if (parts.length > 2) {
    cleanValue = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Limit decimal places
  if (parts.length === 2 && parts[1].length > maxDecimals) {
    cleanValue = parts[0] + '.' + parts[1].substring(0, maxDecimals);
  }
  
  return cleanValue;
};

export const formatWeight = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '');
  
  if (!cleanValue) return '';
  
  // Add thousand separators
  return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const parseCurrencyValue = (formattedValue: string): string => {
  return formattedValue.replace(/[^\d,]/g, '').replace(',', '.');
};

export const validateNumericInput = (value: string, min: number = 0, max?: number): boolean => {
  const numValue = parseFloat(value);
  
  if (isNaN(numValue)) return false;
  if (numValue < min) return false;
  if (max !== undefined && numValue > max) return false;
  
  return true;
};

export const limitTextInput = (value: string, maxLength: number): string => {
  return value.slice(0, maxLength);
};
