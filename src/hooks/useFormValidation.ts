import { useState, useCallback } from 'react';
import { validators } from '../utils/masks';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message: string;
}

interface ValidationRules {
  [key: string]: ValidationRule[];
}

interface FormErrors {
  [key: string]: string;
}

export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateField = useCallback((name: string, value: any): string => {
    const fieldRules = rules[name];
    if (!fieldRules) return '';

    for (const rule of fieldRules) {
      // Required validation
      if (rule.required && (!value || value.toString().trim() === '')) {
        return rule.message;
      }

      // Skip other validations if field is empty and not required
      if (!value || value.toString().trim() === '') {
        continue;
      }

      // Min length validation
      if (rule.minLength && value.toString().length < rule.minLength) {
        return rule.message;
      }

      // Max length validation
      if (rule.maxLength && value.toString().length > rule.maxLength) {
        return rule.message;
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(value.toString())) {
        return rule.message;
      }

      // Custom validation
      if (rule.custom && !rule.custom(value)) {
        return rule.message;
      }
    }

    return '';
  }, [rules]);

  const validateForm = useCallback((formData: { [key: string]: any }): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(rules).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [rules, validateField]);

  const validateSingleField = useCallback((name: string, value: any) => {
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
    return error === '';
  }, [validateField]);

  const touchField = useCallback((name: string) => {
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  const clearFieldError = useCallback((name: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  return {
    errors,
    touched,
    validateForm,
    validateSingleField,
    touchField,
    clearErrors,
    clearFieldError,
    hasErrors: Object.keys(errors).length > 0
  };
};

// Regras de validação pré-definidas
export const commonValidationRules = {
  email: [
    { required: true, message: 'Email é obrigatório' },
    { custom: validators.email, message: 'Email inválido' }
  ],
  password: [
    { required: true, message: 'Senha é obrigatória' },
    { minLength: 8, message: 'Senha deve ter pelo menos 8 caracteres' }
  ],
  strongPassword: [
    { required: true, message: 'Senha é obrigatória' },
    { custom: validators.strongPassword, message: 'Senha deve ter pelo menos 8 caracteres, 1 maiúscula, 1 minúscula e 1 número' }
  ],
  name: [
    { required: true, message: 'Nome é obrigatório' },
    { minLength: 2, message: 'Nome deve ter pelo menos 2 caracteres' },
    { maxLength: 100, message: 'Nome deve ter no máximo 100 caracteres' }
  ],
  description: [
    { required: true, message: 'Descrição é obrigatória' },
    { minLength: 3, message: 'Descrição deve ter pelo menos 3 caracteres' },
    { maxLength: 500, message: 'Descrição deve ter no máximo 500 caracteres' }
  ],
  currency: [
    { required: true, message: 'Valor é obrigatório' },
    { custom: (value: string) => validators.currency(value), message: 'Valor deve ser maior que zero' }
  ],
  cpf: [
    { custom: (value: string) => !value || validators.cpf(value), message: 'CPF inválido' }
  ],
  cnpj: [
    { custom: (value: string) => !value || validators.cnpj(value), message: 'CNPJ inválido' }
  ]
};