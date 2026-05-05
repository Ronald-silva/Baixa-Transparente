import React, { useState, useEffect } from 'react';
import { auth, db } from './database';
import { User, Venda, Pagamento, UserRole, Notification as NotificationType } from './types';
import { createNotification } from './notifications';
import { 
  LogOut, 
  Users, 
  Receipt, 
  DollarSign, 
  TrendingDown,
  TrendingUp,
  Search,
  X,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Plus,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ============================================
// Componentes de UI
// ============================================

const Loading = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0a0a0b] via-[#141416] to-[#0a0a0b]">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-white/5 rounded-full"></div>
      <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-[#c5a059] rounded-full animate-spin"></div>
      <div className="absolute inset-2 w-12 h-12 border-4 border-transparent border-t-[#d4af37] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
    </div>
  </div>
);

const NotificationToast = ({ notification, onClose }: { notification: NotificationType; onClose: () => void }) => {
  const icons = {
    success: <CheckCircle size={18} className="text-emerald-400" />,
    error: <AlertCircle size={18} className="text-rose-400" />,
    info: <Sparkles size={18} className="text-[#c5a059]" />
  };

  const styles = {
    success: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20',
    error: 'from-rose-500/10 to-rose-600/5 border-rose-500/20',
    info: 'from-[#c5a059]/10 to-[#d4af37]/5 border-[#c5a059]/20'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-xl border backdrop-blur-xl bg-gradient-to-r ${styles[notification.type]} flex items-center gap-4 shadow-2xl shadow-black/20`}
    >
      <div className="p-2 rounded-full bg-white/5">{icons[notification.type]}</div>
      <p className="text-sm font-medium text-white/90">{notification.message}</p>
      <button onClick={onClose} className="ml-4 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all">
        <X size={16} />
      </button>
    </motion.div>
  );
};

const LoginPage = ({ onLogin, onNotify }: { onLogin: (user: User) => void; onNotify: (msg: string, type: 'success' | 'error' | 'info') => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const user = await auth.login(email, password);
    
    if (user) {
      onNotify('Login realizado com sucesso!', 'success');
      onLogin(user as User);
    } else {
      onNotify('Email ou senha incorretos', 'error');
    }
    
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0a0a0b] via-[#111113] to-[#0a0a0b] p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#c5a059]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#c5a059]/5 rounded-full blur-3xl"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 p-10 rounded-2xl shadow-2xl shadow-black/40">
          {/* Logo & Header */}
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c5a059] to-[#d4af37] mb-6 shadow-lg shadow-[#c5a059]/20"
            >
              <Sparkles size={32} className="text-black" />
            </motion.div>
            <h1 className="text-xs uppercase tracking-[0.4em] text-[#c5a059] font-bold mb-2">Plataforma de Transparência</h1>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Lumina Ledger</h2>
            <p className="text-sm text-white/40 mt-3">Transparência total em suas vendas e pagamentos</p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-white/50 font-semibold ml-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[#c5a059] focus:bg-white/[0.08] text-sm text-white placeholder:text-white/20 transition-all hover:border-white/20"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-white/50 font-semibold ml-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[#c5a059] focus:bg-white/[0.08] text-sm text-white placeholder:text-white/20 transition-all hover:border-white/20"
              />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-[#c5a059] to-[#d4af37] hover:from-[#d4af37] hover:to-[#e5c158] text-black font-bold text-sm uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#c5a059]/20 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  Entrando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Entrar
                  <ArrowRight size={16} />
                </span>
              )}
            </motion.button>
          </form>
          
          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-xs text-white/30 text-center">
              Login padrão: admin@lumina.local / MudeEstaSenha123!
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================
// Componentes do Dashboard
// ============================================

const StatCard = ({ label, value, progress, isCritical }: { label: string; value: number; progress?: number; isCritical?: boolean }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5, scale: 1.02 }}
    transition={{ type: 'spring', stiffness: 300 }}
    className="group relative overflow-hidden rounded-2xl border border-white/10 hover:border-[#c5a059]/40 bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl p-6 shadow-2xl shadow-black/40 transition-all duration-300"
  >
    {/* Hover gradient effect */}
    <div className="absolute inset-0 bg-gradient-to-br from-[#c5a059]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs uppercase tracking-wider text-white/40 font-semibold">{label}</p>
        {isCritical && (
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
        )}
      </div>
      
      <p className="text-3xl font-bold font-serif tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent mb-3">
        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
      </p>
      
      {progress !== undefined && (
        <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-[#c5a059] to-[#d4af37] rounded-full"
          />
        </div>
      )}

      {isCritical && (
        <p className="text-xs uppercase tracking-wider text-amber-400 mt-3 font-semibold flex items-center gap-2">
          <AlertCircle size={12} />
          Ações necessárias
        </p>
      )}
    </div>
  </motion.div>
);

const RecentList = ({ title, items, type }: { title: string; items: any[]; type: 'venda' | 'pagamento' }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col h-full"
  >
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-sm uppercase tracking-wider text-white font-bold">{title}</h3>
      {items.length > 0 && (
        <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-white/50 font-semibold">
          {items.length} {items.length === 1 ? 'Registro' : 'Registros'}
        </span>
      )}
    </div>
    
    <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
      {items.length === 0 ? (
        <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Receipt size={24} className="text-white/20" />
          </div>
          <p className="text-sm text-white/30">Nenhum registro encontrado</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="px-6 py-5 hover:bg-white/[0.03] transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white/90 truncate uppercase tracking-wide">
                    {item.descricao}
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    {new Date(item.created_at || item.paid_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className={`text-right font-bold ${type === 'pagamento' ? 'text-emerald-400' : 'text-red-400'}`}>
                  <p className="text-lg font-serif">
                    {type === 'pagamento' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(type === 'venda' ? item.valor_total : item.valor_pago)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  </motion.div>
);

const Modal = ({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
    />
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-full max-w-lg bg-gradient-to-br from-[#141416] to-[#111113] border border-white/10 rounded-2xl shadow-2xl shadow-[#c5a059]/10 relative z-10 overflow-y-auto max-h-[90vh] mx-4"
    >
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.04] backdrop-blur-md sticky top-0 z-20">
        <h3 className="text-sm uppercase tracking-wider font-bold text-[#c5a059]">{title}</h3>
        <motion.button 
          whileHover={{ rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose} 
          className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all"
        >
          <X size={20} />
        </motion.button>
      </div>
      <div className="p-8">
        {children}
      </div>
    </motion.div>
  </div>
);

// ============================================
// Dashboards
// ============================================

function VendorDashboard({ user, onNotify }: { user: User; onNotify: (msg: string, type: 'success' | 'error' | 'info') => void }) {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [showAddVenda, setShowAddVenda] = useState(false);
  const [showAddPagamento, setShowAddPagamento] = useState(false);
  const [showAddCliente, setShowAddCliente] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vendasData, pagamentosData, clientesData, dashboardData] = await Promise.all([
        db.getVendasByVendedor(user.id),
        db.getPagamentosByVendedor(user.id),
        db.getClientesByVendedor(user.id),
        db.getVendorDashboard(user.id)
      ]);
      
      setVendas(vendasData as Venda[]);
      setPagamentos(pagamentosData as Pagamento[]);
      setClientes(clientesData);
      setDashboard(dashboardData);
    } catch (error) {
      onNotify('Erro ao carregar dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const displayedVendas = vendas.filter(v => 
    (selectedClientId === '' || v.cliente_id === selectedClientId) &&
    v.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedPagamentos = pagamentos.filter(p => 
    (selectedClientId === '' || p.cliente_id === selectedClientId) &&
    p.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalVendidoGlobal = vendas.reduce((acc, curr) => acc + Number(curr.valor_total), 0);
  const totalRecebidoGlobal = pagamentos.reduce((acc, curr) => acc + Number(curr.valor_pago), 0);

  let currentStats = {
    total_vendido: totalVendidoGlobal,
    total_recebido: totalRecebidoGlobal,
    saldo_pendente: totalVendidoGlobal - totalRecebidoGlobal
  };

  if (selectedClientId !== '') {
    const totalVendidoCliente = vendas.filter(v => v.cliente_id === selectedClientId).reduce((acc, curr) => acc + Number(curr.valor_total), 0);
    const totalRecebidoCliente = pagamentos.filter(p => p.cliente_id === selectedClientId).reduce((acc, curr) => acc + Number(curr.valor_pago), 0);
    currentStats = {
      total_vendido: totalVendidoCliente,
      total_recebido: totalRecebidoCliente,
      saldo_pendente: totalVendidoCliente - totalRecebidoCliente
    };
  }

  if (loading) return <Loading />;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label={selectedClientId === '' ? "Total a Receber" : "Total Comprado (Cliente)"} 
          value={currentStats.total_vendido} 
          progress={(currentStats.total_recebido / (currentStats.total_vendido || 1)) * 100}
        />
        <StatCard 
          label={selectedClientId === '' ? "Liquidez Recebida" : "Total Pago (Cliente)"} 
          value={currentStats.total_recebido} 
        />
        <StatCard 
          label="Saldo Pendente" 
          value={currentStats.saldo_pendente} 
          isCritical={currentStats.saldo_pendente > 0}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm"
      >
        <h2 className="text-sm uppercase tracking-wider text-white/80 font-semibold">Fluxo Recente</h2>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full sm:w-48 px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[#c5a059] focus:bg-white/[0.08] text-sm text-white transition-all appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#141416]">Visão Geral (Todos)</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id} className="bg-[#141416]">{c.display_name}</option>
              ))}
            </select>
          </div>
          <div className="relative w-full sm:w-auto">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Buscar transações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-56 pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[#c5a059] focus:bg-white/[0.08] text-sm text-white placeholder:text-white/20 transition-all"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddVenda(true)} 
              className="w-full sm:w-auto text-xs uppercase tracking-wider border border-white/20 px-5 py-3 rounded-xl hover:bg-white hover:text-black transition-all whitespace-nowrap font-semibold flex items-center justify-center"
            >
              Nova Venda
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddPagamento(true)} 
              className="w-full sm:w-auto text-xs uppercase tracking-wider bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-black px-5 py-3 rounded-xl hover:from-[#d4af37] hover:to-[#e5c158] transition-all font-bold whitespace-nowrap shadow-lg shadow-[#c5a059]/20 flex items-center justify-center"
            >
              Registrar Baixa
            </motion.button>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddCliente(true)} 
            className="w-full sm:w-auto text-xs uppercase tracking-wider border border-white/20 px-5 py-3 rounded-xl hover:bg-white hover:text-black transition-all font-semibold flex items-center justify-center"
          >
            Novo Cliente
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <RecentList title={selectedClientId === '' ? "Todas as Vendas" : "Vendas do Cliente"} items={displayedVendas} type="venda" />
        </div>
        <div className="lg:col-span-5">
          <RecentList title={selectedClientId === '' ? "Todos os Pagamentos" : "Pagamentos do Cliente"} items={displayedPagamentos} type="pagamento" />
        </div>
      </div>

      <AnimatePresence>
        {showAddVenda && (
          <Modal onClose={() => setShowAddVenda(false)} title="Nova Venda">
            <FormAddVenda 
              vendedorId={user.id} 
              clientes={clientes} 
              onClose={() => { setShowAddVenda(false); loadData(); }}
              onNotify={onNotify}
            />
          </Modal>
        )}
        {showAddPagamento && (
          <Modal onClose={() => setShowAddPagamento(false)} title="Registrar Pagamento">
            <FormAddPagamento 
              vendedorId={user.id} 
              clientes={clientes}
              vendas={vendas.filter(v => v.status !== 'paga')}
              onClose={() => { setShowAddPagamento(false); loadData(); }}
              onNotify={onNotify}
            />
          </Modal>
        )}
        {showAddCliente && (
          <Modal onClose={() => setShowAddCliente(false)} title="Novo Cliente">
            <FormAddCliente 
              vendedorId={user.id} 
              onClose={() => { setShowAddCliente(false); loadData(); }}
              onNotify={onNotify}
            />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function CustomerDashboard({ user, onNotify }: { user: User; onNotify: (msg: string, type: 'success' | 'error' | 'info') => void }) {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [balance, setBalance] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vendasData, pagamentosData, balanceData] = await Promise.all([
        db.getVendasByCliente(user.id),
        db.getPagamentosByCliente(user.id),
        db.getCustomerBalance(user.id)
      ]);
      
      setVendas(vendasData as Venda[]);
      setPagamentos(pagamentosData as Pagamento[]);
      setBalance(balanceData);
    } catch (error) {
      onNotify('Erro ao carregar dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredVendas = vendas.filter(v => 
    v.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPagamentos = pagamentos.filter(p => 
    p.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <div className="grid grid-cols-12 gap-8">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="col-span-12 lg:col-span-4 space-y-6"
      >
        <h3 className="text-sm uppercase tracking-wider text-white/60 font-semibold">Sua Transparência</h3>
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#c5a059] via-[#d4af37] to-[#e5c158] p-8 shadow-2xl shadow-[#c5a059]/40 border border-[#e5c158]/50"
        >
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="mb-8">
              <p className="text-xs uppercase font-bold tracking-wider text-black/50 mb-2">Canal Direto</p>
              <p className="text-2xl font-bold leading-tight text-black">
                Olá, <span className="italic">{user.display_name}</span>
              </p>
            </div>
            
            <div className="bg-black/10 backdrop-blur-sm p-6 rounded-xl border border-black/10 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase font-bold tracking-wider text-black/60">Saldo Devedor</span>
                <span className="text-xl font-bold text-black">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance?.saldo_devedor || 0)}
                </span>
              </div>
              <div className="h-px bg-black/10"></div>
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase font-bold tracking-wider text-black/60">Já Liquidado</span>
                <span className="text-xl font-bold text-black">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance?.total_pago || 0)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="col-span-12 lg:col-span-8 flex flex-col gap-6"
      >
        <h3 className="text-sm uppercase tracking-wider font-semibold opacity-0 hidden lg:block pointer-events-none select-none">
          Alinhamento
        </h3>
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Buscar transações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[#c5a059] focus:bg-white/[0.08] text-sm text-white placeholder:text-white/20 transition-all"
          />
        </div>
        <RecentList title="Suas Compras" items={filteredVendas} type="venda" />
        <RecentList title="Seus Pagamentos" items={filteredPagamentos} type="pagamento" />
      </motion.div>
    </div>
  );
}

// ============================================
// Formulários
// ============================================

function FormAddVenda({ vendedorId, clientes, onClose, onNotify }: { vendedorId: string; clientes: any[]; onClose: () => void; onNotify: (msg: string, type: 'success' | 'error' | 'info') => void }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await db.createVenda({
        descricao: formData.get('descricao') as string,
        valor_total: Number(formData.get('valor')),
        cliente_id: formData.get('clienteId') as string,
        vendedor_id: vendedorId,
        data: (formData.get('data') as string) ? `${formData.get('data')}T12:00:00Z` : undefined
      });
      onNotify('Venda registrada!', 'success');
      onClose();
    } catch (error) {
      onNotify('Erro ao registrar venda', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wider font-semibold text-[#c5a059]">Cliente</label>
        <select name="clienteId" required className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[#c5a059] focus:bg-white/[0.08] text-sm text-white transition-all hover:border-white/20">
          <option value="">Selecione um cliente</option>
          {clientes.map(c => (
            <option key={c.id} value={c.id} className="bg-[#141416]">{c.display_name}</option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#c5a059]">Valor</label>
          <input type="number" name="valor" step="0.01" required placeholder="0,00" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[#c5a059] focus:bg-white/[0.08] text-lg text-white placeholder:text-white/20 transition-all hover:border-white/20 font-mono" />
        </div>
        <div className="space-y-2">
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#c5a059]">Descrição</label>
          <input type="text" name="descricao" required placeholder="Ex: Venda #01" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[#c5a059] focus:bg-white/[0.08] text-sm text-white placeholder:text-white/20 transition-all hover:border-white/20" />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wider font-semibold text-[#c5a059]">Data (Opcional)</label>
        <input type="date" name="data" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[#c5a059] focus:bg-white/[0.08] text-sm text-white transition-all hover:border-white/20" style={{ colorScheme: 'dark' }} />
      </div>
      
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit" 
        disabled={loading} 
        className="w-full py-4 bg-gradient-to-r from-white to-white/90 text-black text-xs uppercase tracking-widest font-bold rounded-xl hover:from-[#c5a059] hover:to-[#d4af37] hover:text-white transition-all disabled:opacity-30 mt-4 shadow-lg"
      >
        {loading ? 'Processando...' : 'Confirmar Venda'}
      </motion.button>
    </form>
  );
}

function FormAddPagamento({ vendedorId, clientes, vendas, onClose, onNotify }: { vendedorId: string; clientes: any[]; vendas: Venda[]; onClose: () => void; onNotify: (msg: string, type: 'success' | 'error' | 'info') => void }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const vendaId = formData.get('vendaId') as string;
    
    try {
      await db.createPagamento({
        valor_pago: Number(formData.get('valor')),
        descricao: (formData.get('descricao') as string) || 'Pagamento recebido',
        cliente_id: formData.get('clienteId') as string,
        vendedor_id: vendedorId,
        venda_id: vendaId || undefined,
        data: (formData.get('data') as string) ? `${formData.get('data')}T12:00:00Z` : undefined
      });

      if (vendaId) {
        await db.updateVendaStatus(vendaId, 'paga');
      }

      onNotify('Pagamento registrado!', 'success');
      onClose();
    } catch (error) {
      onNotify('Erro ao registrar pagamento', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wider font-semibold text-[#c5a059]">Cliente</label>
        <select name="clienteId" required className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[#c5a059] focus:bg-white/[0.08] text-sm text-white transition-all hover:border-white/20">
          <option value="">Selecione um cliente</option>
          {clientes.map(c => (
            <option key={c.id} value={c.id} className="bg-[#141416]">{c.display_name}</option>
          ))}
        </select>
      </div>
      
      {vendas.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#c5a059]">Venda (Opcional)</label>
          <select name="vendaId" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[#c5a059] focus:bg-white/[0.08] text-sm text-white transition-all hover:border-white/20">
            <option value="">Pagamento geral</option>
            {vendas.map(v => (
              <option key={v.id} value={v.id} className="bg-[#141416]">{v.descricao} - R$ {v.valor_total}</option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wider font-semibold text-[#c5a059]">Valor</label>
        <input type="number" name="valor" step="0.01" required placeholder="0,00" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[#c5a059] focus:bg-white/[0.08] text-lg text-white placeholder:text-white/20 transition-all hover:border-white/20 font-mono" />
      </div>
      
      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wider font-semibold text-[#c5a059]">Descrição</label>
        <input type="text" name="descricao" placeholder="Ex: Transferência" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[#c5a059] focus:bg-white/[0.08] text-sm text-white placeholder:text-white/20 transition-all hover:border-white/20" />
      </div>
      
      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wider font-semibold text-[#c5a059]">Data (Opcional)</label>
        <input type="date" name="data" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[#c5a059] focus:bg-white/[0.08] text-sm text-white transition-all hover:border-white/20" style={{ colorScheme: 'dark' }} />
      </div>
      
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit" 
        disabled={loading} 
        className="w-full py-4 bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-black text-xs uppercase tracking-widest font-bold rounded-xl hover:from-[#d4af37] hover:to-[#e5c158] transition-all disabled:opacity-30 mt-4 shadow-lg shadow-[#c5a059]/20"
      >
        {loading ? 'Processando...' : 'Efetuar Baixa'}
      </motion.button>
    </form>
  );
}

function FormAddCliente({ vendedorId, onClose, onNotify }: { vendedorId: string; onClose: () => void; onNotify: (msg: string, type: 'success' | 'error' | 'info') => void }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      await db.createCliente({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        display_name: formData.get('name') as string,
        vendedor_id: vendedorId
      });
      onNotify('Cliente criado!', 'success');
      onClose();
    } catch (error) {
      onNotify('Erro ao criar cliente', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wider font-semibold text-[#c5a059]">Nome</label>
        <input type="text" name="name" required placeholder="Nome Completo" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[#c5a059] focus:bg-white/[0.08] text-sm text-white placeholder:text-white/20 transition-all hover:border-white/20" />
      </div>
      
      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wider font-semibold text-[#c5a059]">Email</label>
        <input type="email" name="email" required placeholder="email@exemplo.com" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[#c5a059] focus:bg-white/[0.08] text-sm text-white placeholder:text-white/20 transition-all hover:border-white/20" />
      </div>
      
      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wider font-semibold text-[#c5a059]">Senha Inicial</label>
        <input type="password" name="password" required placeholder="Senha para o cliente" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[#c5a059] focus:bg-white/[0.08] text-sm text-white placeholder:text-white/20 transition-all hover:border-white/20" />
      </div>
      
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit" 
        disabled={loading} 
        className="w-full py-4 bg-gradient-to-r from-white to-white/90 text-black text-xs uppercase tracking-widest font-bold rounded-xl hover:from-[#c5a059] hover:to-[#d4af37] hover:text-white transition-all disabled:opacity-30 mt-4 shadow-lg"
      >
        {loading ? 'Criando...' : 'Criar Cliente'}
      </motion.button>
    </form>
  );
}

// ============================================
// App Principal
// ============================================

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const notification = createNotification(message, type);
    setNotifications(prev => [...prev, notification]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('lumina_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('lumina_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('lumina_user');
    addNotification('Logout realizado', 'info');
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0b] via-[#111113] to-[#0a0a0b] text-white flex flex-col font-sans">
      <AnimatePresence>
        {notifications.map(notification => (
          <NotificationToast 
            key={notification.id} 
            notification={notification} 
            onClose={() => removeNotification(notification.id)} 
          />
        ))}
      </AnimatePresence>

      {!user ? (
        <LoginPage onLogin={handleLogin} onNotify={addNotification} />
      ) : (
        <>
          <motion.header 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="bg-white/[0.03] backdrop-blur-2xl border-b border-white/10 px-6 py-4 sticky top-0 z-30 shadow-lg shadow-black/20"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c5a059] to-[#d4af37] flex items-center justify-center shadow-lg shadow-[#c5a059]/20">
                  <Sparkles size={20} className="text-black" />
                </div>
                <div>
                  <h1 className="text-xs uppercase tracking-wider text-[#c5a059] font-bold">Logística Financeira</h1>
                  <h2 className="text-xl font-bold text-white">Lumina Ledger</h2>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-white">{user.display_name}</p>
                  <p className="text-xs text-[#c5a059] uppercase tracking-wider font-semibold">{user.role}</p>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLogout}
                  className="p-3 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all"
                >
                  <LogOut size={18} />
                </motion.button>
              </div>
            </div>
          </motion.header>

          <main className="flex-1 max-w-7xl w-full mx-auto p-6 pb-24">
            {user.role === 'vendedor' ? (
              <VendorDashboard user={user} onNotify={addNotification} />
            ) : (
              <CustomerDashboard user={user} onNotify={addNotification} />
            )}
          </main>
        </>
      )}
    </div>
  );
}