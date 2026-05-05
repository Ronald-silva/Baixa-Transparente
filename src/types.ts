export type UserRole = 'vendedor' | 'cliente';
export type VendaStatus = 'pendente' | 'paga' | 'parcial';

export interface User {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  vendedor_id: string | null;
}

export interface Venda {
  id: string;
  descricao: string;
  valor_total: number;
  cliente_id: string;
  vendedor_id: string;
  status: VendaStatus;
  created_at: string;
}

export interface Pagamento {
  id: string;
  valor_pago: number;
  descricao: string;
  cliente_id: string;
  vendedor_id: string;
  venda_id: string | null;
  paid_at: string;
}

export interface VendorDashboard {
  vendedor_id: string;
  vendedor_nome: string;
  total_vendido: number;
  total_recebido: number;
  saldo_pendente: number;
}

export interface CustomerBalance {
  cliente_id: string;
  cliente_nome: string;
  cliente_email: string;
  vendedor_id: string;
  vendedor_nome: string;
  total_comprado: number;
  total_pago: number;
  saldo_devedor: number;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
