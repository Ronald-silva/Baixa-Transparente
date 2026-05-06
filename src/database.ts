

import { neon, neonConfig } from '@neondatabase/serverless';
import { security } from './utils/security';

neonConfig.disableWarningInBrowsers = true;

const connectionString = (import.meta as any).env.VITE_NEON_CONNECTION_STRING;

if (!connectionString) {
  throw new Error('Missing Neon connection string. Please set VITE_NEON_CONNECTION_STRING in .env.local');
}

export const sql = neon(connectionString);


export const auth = {
  async login(email: string, password: string) {
    try {
      // Rate limiting
      if (!security.rateLimiter.checkLimit(`login_${email}`, 5, 300000)) {
        throw new Error('Muitas tentativas de login. Tente novamente em 5 minutos.');
      }

      // Sanitização
      const sanitizedEmail = security.sanitizeString(email).toLowerCase();
      const sanitizedPassword = security.sanitizeString(password);

      if (!sanitizedEmail || !sanitizedPassword) {
        throw new Error('Email e senha são obrigatórios');
      }

      const result = await sql`SELECT * FROM login_user(${sanitizedEmail}, ${sanitizedPassword})`;
      
      if (result[0]) {
        // Reset rate limit em caso de sucesso
        security.rateLimiter.reset(`login_${email}`);
      }
      
      return result[0] || null;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(email: string, password: string, displayName: string, role: 'vendedor' | 'cliente', vendedorId?: string) {
    try {
      // Validação de entrada
      const validation = security.validateUserInput({
        email,
        password,
        display_name: displayName,
        role
      });

      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Sanitização
      const sanitizedEmail = security.sanitizeString(email).toLowerCase();
      const sanitizedDisplayName = security.sanitizeString(displayName);
      const sanitizedPassword = security.sanitizeString(password);

      if (vendedorId) {
        if (!security.validateUUID(vendedorId)) {
          throw new Error('ID do vendedor inválido');
        }

        const result = await sql`INSERT INTO users (email, password_hash, display_name, role, vendedor_id) VALUES (${sanitizedEmail}, crypt(${sanitizedPassword}, gen_salt('bf')), ${sanitizedDisplayName}, ${role}, ${vendedorId}) RETURNING id, email, display_name, role, vendedor_id`;
        return result[0];
      } else {
        const result = await sql`SELECT register_user(${sanitizedEmail}, ${sanitizedPassword}, ${sanitizedDisplayName}, ${role}) as user_id`;
        const userId = result[0].user_id;
        const user = await this.getUserById(userId);
        return user;
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  async getUserById(userId: string) {
    try {
      if (!security.validateUUID(userId)) {
        throw new Error('ID de usuário inválido');
      }

      const result = await sql`SELECT id, email, display_name, role, vendedor_id FROM users WHERE id = ${userId}`;
      return result[0] || null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }
};

export const db = {
  async getVendasByVendedor(vendedorId: string) {
    if (!security.validateUUID(vendedorId)) {
      throw new Error('ID do vendedor inválido');
    }
    return await sql`SELECT * FROM vendas WHERE vendedor_id = ${vendedorId} ORDER BY created_at DESC`;
  },

  async getVendasByCliente(clienteId: string) {
    if (!security.validateUUID(clienteId)) {
      throw new Error('ID do cliente inválido');
    }
    return await sql`SELECT * FROM vendas WHERE cliente_id = ${clienteId} ORDER BY created_at DESC`;
  },

  async createVenda(data: { descricao: string; valor_total: number; cliente_id: string; vendedor_id: string; data?: string }) {
    // Validação de entrada
    const validation = security.validateVendaInput(data);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // Sanitização
    const sanitizedData = {
      descricao: security.sanitizeString(data.descricao),
      valor_total: Number(data.valor_total),
      cliente_id: data.cliente_id,
      vendedor_id: data.vendedor_id,
      data: data.data
    };

    if (sanitizedData.data) {
      return await sql`INSERT INTO vendas (descricao, valor_total, cliente_id, vendedor_id, status, created_at) VALUES (${sanitizedData.descricao}, ${sanitizedData.valor_total}, ${sanitizedData.cliente_id}, ${sanitizedData.vendedor_id}, 'pendente', ${sanitizedData.data}) RETURNING *`;
    }
    return await sql`INSERT INTO vendas (descricao, valor_total, cliente_id, vendedor_id, status) VALUES (${sanitizedData.descricao}, ${sanitizedData.valor_total}, ${sanitizedData.cliente_id}, ${sanitizedData.vendedor_id}, 'pendente') RETURNING *`;
  },

  async updateVendaStatus(vendaId: string, status: 'pendente' | 'paga' | 'parcial') {
    if (!security.validateUUID(vendaId)) {
      throw new Error('ID da venda inválido');
    }
    
    if (!['pendente', 'paga', 'parcial'].includes(status)) {
      throw new Error('Status inválido');
    }

    return await sql`UPDATE vendas SET status = ${status} WHERE id = ${vendaId} RETURNING *`;
  },

  async getPagamentosByVendedor(vendedorId: string) {
    if (!security.validateUUID(vendedorId)) {
      throw new Error('ID do vendedor inválido');
    }
    return await sql`SELECT * FROM pagamentos WHERE vendedor_id = ${vendedorId} ORDER BY paid_at DESC`;
  },

  async getPagamentosByCliente(clienteId: string) {
    if (!security.validateUUID(clienteId)) {
      throw new Error('ID do cliente inválido');
    }
    return await sql`SELECT * FROM pagamentos WHERE cliente_id = ${clienteId} ORDER BY paid_at DESC`;
  },

  async createPagamento(data: { valor_pago: number; descricao: string; cliente_id: string; vendedor_id: string; venda_id?: string; data?: string }) {
    // Validação de entrada
    const validation = security.validatePagamentoInput(data);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // Sanitização
    const sanitizedData = {
      valor_pago: Number(data.valor_pago),
      descricao: security.sanitizeString(data.descricao || 'Pagamento recebido'),
      cliente_id: data.cliente_id,
      vendedor_id: data.vendedor_id,
      venda_id: data.venda_id || null,
      data: data.data
    };

    if (sanitizedData.data) {
      return await sql`INSERT INTO pagamentos (valor_pago, descricao, cliente_id, vendedor_id, venda_id, paid_at) VALUES (${sanitizedData.valor_pago}, ${sanitizedData.descricao}, ${sanitizedData.cliente_id}, ${sanitizedData.vendedor_id}, ${sanitizedData.venda_id}, ${sanitizedData.data}) RETURNING *`;
    }
    return await sql`INSERT INTO pagamentos (valor_pago, descricao, cliente_id, vendedor_id, venda_id) VALUES (${sanitizedData.valor_pago}, ${sanitizedData.descricao}, ${sanitizedData.cliente_id}, ${sanitizedData.vendedor_id}, ${sanitizedData.venda_id}) RETURNING *`;
  },

  async getClientesByVendedor(vendedorId: string) {
    if (!security.validateUUID(vendedorId)) {
      throw new Error('ID do vendedor inválido');
    }
    return await sql`SELECT id, email, display_name, role, vendedor_id FROM users WHERE vendedor_id = ${vendedorId} AND role = 'cliente' ORDER BY display_name`;
  },

  async createCliente(data: { email: string; password: string; display_name: string; vendedor_id: string }) {
    return await auth.register(data.email, data.password, data.display_name, 'cliente', data.vendedor_id);
  },

  async getVendorDashboard(vendedorId: string) {
    if (!security.validateUUID(vendedorId)) {
      throw new Error('ID do vendedor inválido');
    }
    const result = await sql`SELECT * FROM vendor_dashboard WHERE vendedor_id = ${vendedorId}`;
    return result[0] || { vendedor_id: vendedorId, vendedor_nome: '', total_vendido: 0, total_recebido: 0, saldo_pendente: 0 };
  },

  async getCustomerBalance(clienteId: string) {
    if (!security.validateUUID(clienteId)) {
      throw new Error('ID do cliente inválido');
    }
    const result = await sql`SELECT * FROM customer_balance WHERE cliente_id = ${clienteId}`;
    return result[0] || { cliente_id: clienteId, cliente_nome: '', cliente_email: '', vendedor_id: '', vendedor_nome: '', total_comprado: 0, total_pago: 0, saldo_devedor: 0 };
  }
};
