
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ValidatedInputProps {
  id: string;
  name: string;
  type?: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValidate?: (value: string) => Promise<{ isValid: boolean; message?: string }>;
  formatter?: (value: string) => string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  id,
  name,
  type = "text",
  label,
  value,
  onChange,
  onValidate,
  formatter,
  placeholder,
  required = false,
  maxLength,
  icon,
  className,
  disabled = false
}) => {
  const [validationState, setValidationState] = useState<{
    isValid?: boolean;
    message?: string;
    isValidating: boolean;
  }>({ isValidating: false });

  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!onValidate || !value || value.length < 3) {
      setValidationState({ isValidating: false });
      return;
    }

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(async () => {
      setValidationState({ isValidating: true });
      try {
        const result = await onValidate(value);
        setValidationState({
          isValid: result.isValid,
          message: result.message,
          isValidating: false
        });
      } catch (error) {
        setValidationState({
          isValid: false,
          message: 'Erro na validação',
          isValidating: false
        });
      }
    }, 500);

    setDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [value, onValidate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formattedValue = formatter ? formatter(inputValue) : inputValue;
    
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: formattedValue,
        name
      }
    };
    
    onChange(syntheticEvent);
  };

  const getValidationIcon = () => {
    if (validationState.isValidating) {
      return <Loader2 className="h-4 w-4 animate-spin text-gray-400" />;
    }
    if (validationState.isValid === true) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (validationState.isValid === false) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getBorderColor = () => {
    if (validationState.isValid === true) return 'border-green-500 focus:border-green-500';
    if (validationState.isValid === false) return 'border-red-500 focus:border-red-500';
    return 'border-gray-200 focus:border-blue-500';
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-3 h-4 w-4 text-gray-400">
            {icon}
          </div>
        )}
        <Input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          className={cn(
            "h-12 focus:ring-blue-500",
            icon ? "pl-10" : "pl-3",
            "pr-10",
            getBorderColor(),
            className
          )}
          required={required}
          maxLength={maxLength}
          disabled={disabled}
        />
        <div className="absolute right-3 top-3">
          {getValidationIcon()}
        </div>
      </div>
      {validationState.message && (
        <p className={cn(
          "text-sm",
          validationState.isValid ? "text-green-600" : "text-red-600"
        )}>
          {validationState.message}
        </p>
      )}
    </div>
  );
};
