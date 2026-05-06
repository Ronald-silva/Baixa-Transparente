/**
 * Utilitários para máscaras de input
 */

export const masks = {
  /**
   * Máscara para valores monetários (BRL)
   */
  currency: (value: string): string => {
    // Remove tudo que não é dígito
    const numericValue = value.replace(/\D/g, '');
    
    if (!numericValue) return '';
    
    // Converte para centavos
    const cents = parseInt(numericValue, 10);
    
    // Formata como moeda
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(cents / 100);
  },

  /**
   * Máscara para CPF
   */
  cpf: (value: string): string => {
    const numericValue = value.replace(/\D/g, '');
    return numericValue
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  },

  /**
   * Máscara para CNPJ
   */
  cnpj: (value: string): string => {
    const numericValue = value.replace(/\D/g, '');
    return numericValue
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  },

  /**
   * Máscara para telefone
   */
  phone: (value: string): string => {
    const numericValue = value.replace(/\D/g, '');
    
    if (numericValue.length <= 10) {
      return numericValue
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    
    return numericValue
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  },

  /**
   * Remove máscara e retorna apenas números
   */
  unmask: (value: string): string => {
    return value.replace(/\D/g, '');
  },

  /**
   * Converte valor monetário mascarado para número
   */
  currencyToNumber: (value: string): number => {
    const numericValue = value.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(numericValue) || 0;
  }
};

export const validators = {
  /**
   * Valida CPF
   */
  cpf: (cpf: string): boolean => {
    const numericCpf = masks.unmask(cpf);
    
    if (numericCpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(numericCpf)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numericCpf.charAt(i)) * (10 - i);
    }
    
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numericCpf.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numericCpf.charAt(i)) * (11 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    
    return remainder === parseInt(numericCpf.charAt(10));
  },

  /**
   * Valida CNPJ
   */
  cnpj: (cnpj: string): boolean => {
    const numericCnpj = masks.unmask(cnpj);
    
    if (numericCnpj.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(numericCnpj)) return false;
    
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(numericCnpj.charAt(i)) * weights1[i];
    }
    
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    
    if (digit1 !== parseInt(numericCnpj.charAt(12))) return false;
    
    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(numericCnpj.charAt(i)) * weights2[i];
    }
    
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;
    
    return digit2 === parseInt(numericCnpj.charAt(13));
  },

  /**
   * Valida email
   */
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Valida valor monetário
   */
  currency: (value: string | number): boolean => {
    const numericValue = typeof value === 'string' ? masks.currencyToNumber(value) : value;
    return numericValue > 0 && numericValue <= 999999999.99;
  },

  /**
   * Valida senha forte
   */
  strongPassword: (password: string): boolean => {
    // Mínimo 8 caracteres, pelo menos 1 maiúscula, 1 minúscula, 1 número
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }
};