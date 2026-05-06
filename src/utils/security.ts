/**
 * Utilitários de segurança para sanitização e validação
 */

export const security = {
  /**
   * Sanitiza string removendo caracteres perigosos
   */
  sanitizeString: (input: string): string => {
    if (typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove < e >
      .replace(/javascript:/gi, '') // Remove javascript:
      .replace(/on\w+=/gi, '') // Remove event handlers
      .substring(0, 1000); // Limita tamanho
  },

  /**
   * Sanitiza input HTML removendo tags perigosas
   */
  sanitizeHtml: (input: string): string => {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  },

  /**
   * Valida se o valor é um número válido
   */
  validateNumber: (value: any): boolean => {
    const num = Number(value);
    return !isNaN(num) && isFinite(num);
  },

  /**
   * Valida se o valor monetário está dentro dos limites
   */
  validateCurrency: (value: number): boolean => {
    return security.validateNumber(value) && 
           value > 0 && 
           value <= 999999999.99 && 
           Number.isFinite(value);
  },

  /**
   * Valida UUID
   */
  validateUUID: (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  /**
   * Escape SQL para prevenir injection (básico)
   */
  escapeSql: (input: string): string => {
    if (typeof input !== 'string') return '';
    return input.replace(/'/g, "''");
  },

  /**
   * Valida se a string tem tamanho apropriado
   */
  validateStringLength: (input: string, min: number = 0, max: number = 1000): boolean => {
    if (typeof input !== 'string') return false;
    return input.length >= min && input.length <= max;
  },

  /**
   * Rate limiting simples (em memória)
   */
  rateLimiter: (() => {
    const attempts: { [key: string]: { count: number; lastAttempt: number } } = {};
    
    return {
      checkLimit: (identifier: string, maxAttempts: number = 5, windowMs: number = 300000): boolean => {
        const now = Date.now();
        const userAttempts = attempts[identifier];
        
        if (!userAttempts) {
          attempts[identifier] = { count: 1, lastAttempt: now };
          return true;
        }
        
        // Reset se passou da janela de tempo
        if (now - userAttempts.lastAttempt > windowMs) {
          attempts[identifier] = { count: 1, lastAttempt: now };
          return true;
        }
        
        // Incrementa tentativas
        userAttempts.count++;
        userAttempts.lastAttempt = now;
        
        return userAttempts.count <= maxAttempts;
      },
      
      reset: (identifier: string): void => {
        delete attempts[identifier];
      }
    };
  })(),

  /**
   * Gera token aleatório seguro
   */
  generateSecureToken: (length: number = 32): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  },

  /**
   * Valida dados de entrada para vendas
   */
  validateVendaInput: (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!data.descricao || typeof data.descricao !== 'string') {
      errors.push('Descrição é obrigatória');
    } else if (!security.validateStringLength(data.descricao, 3, 500)) {
      errors.push('Descrição deve ter entre 3 e 500 caracteres');
    }
    
    if (!security.validateCurrency(data.valor_total)) {
      errors.push('Valor total inválido');
    }
    
    if (!data.cliente_id || !security.validateUUID(data.cliente_id)) {
      errors.push('Cliente inválido');
    }
    
    if (!data.vendedor_id || !security.validateUUID(data.vendedor_id)) {
      errors.push('Vendedor inválido');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Valida dados de entrada para pagamentos
   */
  validatePagamentoInput: (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!security.validateCurrency(data.valor_pago)) {
      errors.push('Valor pago inválido');
    }
    
    if (!data.descricao || typeof data.descricao !== 'string') {
      errors.push('Descrição é obrigatória');
    } else if (!security.validateStringLength(data.descricao, 3, 500)) {
      errors.push('Descrição deve ter entre 3 e 500 caracteres');
    }
    
    if (!data.cliente_id || !security.validateUUID(data.cliente_id)) {
      errors.push('Cliente inválido');
    }
    
    if (!data.vendedor_id || !security.validateUUID(data.vendedor_id)) {
      errors.push('Vendedor inválido');
    }
    
    if (data.venda_id && !security.validateUUID(data.venda_id)) {
      errors.push('Venda inválida');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Valida dados de usuário
   */
  validateUserInput: (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!data.email || typeof data.email !== 'string') {
      errors.push('Email é obrigatório');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('Email inválido');
      }
    }
    
    if (!data.display_name || typeof data.display_name !== 'string') {
      errors.push('Nome é obrigatório');
    } else if (!security.validateStringLength(data.display_name, 2, 100)) {
      errors.push('Nome deve ter entre 2 e 100 caracteres');
    }
    
    if (!data.password || typeof data.password !== 'string') {
      errors.push('Senha é obrigatória');
    } else if (data.password.length < 8) {
      errors.push('Senha deve ter pelo menos 8 caracteres');
    }
    
    if (data.role && !['vendedor', 'cliente'].includes(data.role)) {
      errors.push('Tipo de usuário inválido');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};