import { sql } from '../database';

/**
 * Utilitários para debug e verificação de dados
 */

export const debug = {
  /**
   * Verifica os dados de um cliente específico
   */
  async checkClientData(clienteId: string) {
    try {
      console.log('🔍 Verificando dados do cliente:', clienteId);
      
      // Buscar vendas do cliente
      const vendas = await sql`
        SELECT v.*, u.display_name as cliente_nome
        FROM vendas v
        JOIN users u ON v.cliente_id = u.id
        WHERE v.cliente_id = ${clienteId}
        ORDER BY v.created_at DESC
      `;
      
      // Buscar pagamentos do cliente
      const pagamentos = await sql`
        SELECT p.*, u.display_name as cliente_nome
        FROM pagamentos p
        JOIN users u ON p.cliente_id = u.id
        WHERE p.cliente_id = ${clienteId}
        ORDER BY p.paid_at DESC
      `;
      
      // Calcular totais manualmente
      const totalVendas = vendas.reduce((sum, venda) => sum + Number(venda.valor_total), 0);
      const totalPagamentos = pagamentos.reduce((sum, pagamento) => sum + Number(pagamento.valor_pago), 0);
      const saldoDevedor = totalVendas - totalPagamentos;
      
      console.log('📊 Dados do cliente:');
      console.log('Vendas:', vendas);
      console.log('Pagamentos:', pagamentos);
      console.log('📈 Totais calculados:');
      console.log('Total vendas:', totalVendas);
      console.log('Total pagamentos:', totalPagamentos);
      console.log('Saldo devedor:', saldoDevedor);
      
      // Buscar dados da view
      const balanceView = await sql`
        SELECT * FROM customer_balance WHERE cliente_id = ${clienteId}
      `;
      
      console.log('🎯 Dados da view:', balanceView[0]);
      
      return {
        vendas,
        pagamentos,
        calculado: {
          totalVendas,
          totalPagamentos,
          saldoDevedor
        },
        view: balanceView[0]
      };
      
    } catch (error) {
      console.error('❌ Erro ao verificar dados:', error);
      throw error;
    }
  },

  /**
   * Verifica todos os clientes de um vendedor
   */
  async checkVendorData(vendedorId: string) {
    try {
      console.log('🔍 Verificando dados do vendedor:', vendedorId);
      
      // Buscar todos os clientes do vendedor
      const clientes = await sql`
        SELECT id, display_name, email
        FROM users 
        WHERE vendedor_id = ${vendedorId} AND role = 'cliente'
      `;
      
      console.log('👥 Clientes encontrados:', clientes.length);
      
      // Verificar dados de cada cliente
      for (const cliente of clientes) {
        console.log(`\n📋 Verificando cliente: ${cliente.display_name}`);
        await this.checkClientData(cliente.id);
      }
      
      // Verificar totais do vendedor
      const vendorDashboard = await sql`
        SELECT * FROM vendor_dashboard WHERE vendedor_id = ${vendedorId}
      `;
      
      console.log('🎯 Dashboard do vendedor:', vendorDashboard[0]);
      
      return {
        clientes,
        dashboard: vendorDashboard[0]
      };
      
    } catch (error) {
      console.error('❌ Erro ao verificar dados do vendedor:', error);
      throw error;
    }
  },

  /**
   * Executa uma query de verificação personalizada
   */
  async runQuery(query: string, params: any[] = []) {
    try {
      console.log('🔍 Executando query:', query);
      console.log('📝 Parâmetros:', params);
      
      const result = await sql.unsafe(query);
      console.log('✅ Resultado:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Erro na query:', error);
      throw error;
    }
  },

  /**
   * Verifica a integridade dos dados
   */
  async checkDataIntegrity() {
    try {
      console.log('🔍 Verificando integridade dos dados...');
      
      // Verificar se há vendas sem cliente válido
      const vendasOrfas = await sql`
        SELECT v.* FROM vendas v
        LEFT JOIN users c ON v.cliente_id = c.id
        WHERE c.id IS NULL
      `;
      
      // Verificar se há pagamentos sem cliente válido
      const pagamentosOrfaos = await sql`
        SELECT p.* FROM pagamentos p
        LEFT JOIN users c ON p.cliente_id = c.id
        WHERE c.id IS NULL
      `;
      
      // Verificar se há clientes sem vendedor
      const clientesSemVendedor = await sql`
        SELECT c.* FROM users c
        WHERE c.role = 'cliente' AND c.vendedor_id IS NULL
      `;
      
      console.log('🚨 Problemas encontrados:');
      console.log('Vendas órfãs:', vendasOrfas.length);
      console.log('Pagamentos órfãos:', pagamentosOrfaos.length);
      console.log('Clientes sem vendedor:', clientesSemVendedor.length);
      
      if (vendasOrfas.length > 0) console.log('Vendas órfãs:', vendasOrfas);
      if (pagamentosOrfaos.length > 0) console.log('Pagamentos órfãos:', pagamentosOrfaos);
      if (clientesSemVendedor.length > 0) console.log('Clientes sem vendedor:', clientesSemVendedor);
      
      return {
        vendasOrfas,
        pagamentosOrfaos,
        clientesSemVendedor,
        isIntegre: vendasOrfas.length === 0 && pagamentosOrfaos.length === 0 && clientesSemVendedor.length === 0
      };
      
    } catch (error) {
      console.error('❌ Erro ao verificar integridade:', error);
      throw error;
    }
  }
};

// Função para adicionar ao objeto window para debug no console
if (typeof window !== 'undefined') {
  (window as any).debugLumina = debug;
}