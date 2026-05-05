

import { neon, neonConfig } from '@neondatabase/serverless';

neonConfig.disableWarningInBrowsers = true;

const connectionString = (import.meta as any).env.VITE_NEON_CONNECTION_STRING;

if (!connectionString) {
  throw new Error('Missing Neon connection string. Please set VITE_NEON_CONNECTION_STRING in .env.local');
}

export const sql = neon(connectionString);


export const auth = {
  async login(email: string, password: string) {
    try {
      const result = await sql`SELECT * FROM login_user(${email}, ${password})`;
      return result[0] || null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },

  async register(email: string, password: string, displayName: string, role: 'vendedor' | 'cliente', vendedorId?: string) {
    try {
      if (vendedorId) {
        const result = await sql`INSERT INTO users (email, password_hash, display_name, role, vendedor_id) VALUES (${email}, crypt(${password}, gen_salt('bf')), ${displayName}, ${role}, ${vendedorId}) RETURNING id, email, display_name, role, vendedor_id`;
        return result[0];
      } else {
        const result = await sql`SELECT register_user(${email}, ${password}, ${displayName}, ${role}) as user_id`;
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
    return await sql`SELECT * FROM vendas WHERE vendedor_id = ${vendedorId} ORDER BY created_at DESC`;
  },

  async getVendasByCliente(clienteId: string) {
    return await sql`SELECT * FROM vendas WHERE cliente_id = ${clienteId} ORDER BY created_at DESC`;
  },

  async createVenda(data: { descricao: string; valor_total: number; cliente_id: string; vendedor_id: string; data?: string }) {
    if (data.data) {
      return await sql`INSERT INTO vendas (descricao, valor_total, cliente_id, vendedor_id, status, created_at) VALUES (${data.descricao}, ${data.valor_total}, ${data.cliente_id}, ${data.vendedor_id}, 'pendente', ${data.data}) RETURNING *`;
    }
    return await sql`INSERT INTO vendas (descricao, valor_total, cliente_id, vendedor_id, status) VALUES (${data.descricao}, ${data.valor_total}, ${data.cliente_id}, ${data.vendedor_id}, 'pendente') RETURNING *`;
  },

  async updateVendaStatus(vendaId: string, status: 'pendente' | 'paga' | 'parcial') {
    return await sql`UPDATE vendas SET status = ${status} WHERE id = ${vendaId} RETURNING *`;
  },

  async getPagamentosByVendedor(vendedorId: string) {
    return await sql`SELECT * FROM pagamentos WHERE vendedor_id = ${vendedorId} ORDER BY paid_at DESC`;
  },

  async getPagamentosByCliente(clienteId: string) {
    return await sql`SELECT * FROM pagamentos WHERE cliente_id = ${clienteId} ORDER BY paid_at DESC`;
  },

  async createPagamento(data: { valor_pago: number; descricao: string; cliente_id: string; vendedor_id: string; venda_id?: string; data?: string }) {
    if (data.data) {
      return await sql`INSERT INTO pagamentos (valor_pago, descricao, cliente_id, vendedor_id, venda_id, paid_at) VALUES (${data.valor_pago}, ${data.descricao || 'Pagamento recebido'}, ${data.cliente_id}, ${data.vendedor_id}, ${data.venda_id || null}, ${data.data}) RETURNING *`;
    }
    return await sql`INSERT INTO pagamentos (valor_pago, descricao, cliente_id, vendedor_id, venda_id) VALUES (${data.valor_pago}, ${data.descricao || 'Pagamento recebido'}, ${data.cliente_id}, ${data.vendedor_id}, ${data.venda_id || null}) RETURNING *`;
  },

  async getClientesByVendedor(vendedorId: string) {
    return await sql`SELECT id, email, display_name, role, vendedor_id FROM users WHERE vendedor_id = ${vendedorId} AND role = 'cliente' ORDER BY display_name`;
  },

  async createCliente(data: { email: string; password: string; display_name: string; vendedor_id: string }) {
    return await auth.register(data.email, data.password, data.display_name, 'cliente', data.vendedor_id);
  },

  async getVendorDashboard(vendedorId: string) {
    const result = await sql`SELECT * FROM vendor_dashboard WHERE vendedor_id = ${vendedorId}`;
    return result[0] || { vendedor_id: vendedorId, vendedor_nome: '', total_vendido: 0, total_recebido: 0, saldo_pendente: 0 };
  },

  async getCustomerBalance(clienteId: string) {
    const result = await sql`SELECT * FROM customer_balance WHERE cliente_id = ${clienteId}`;
    return result[0] || { cliente_id: clienteId, cliente_nome: '', cliente_email: '', vendedor_id: '', vendedor_nome: '', total_comprado: 0, total_pago: 0, saldo_devedor: 0 };
  }
};
