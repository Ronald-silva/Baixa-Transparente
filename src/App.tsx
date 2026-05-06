import React, { useState, useEffect } from 'react';
import { auth, db } from './database';
import { User, Venda, Pagamento, Notification as NotificationType } from './types';
import { createNotification } from './notifications';
import { masks } from './utils/masks';
import { MaskedInput } from './components/ui/MaskedInput';
import { useFormValidation, commonValidationRules } from './hooks/useFormValidation';
import {
  LogOut,
  Receipt,
  Search,
  X,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
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
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const { errors, validateForm, validateSingleField, touchField } = useFormValidation({
    email: commonValidationRules.email,
    password: [{ required: true, message: 'Senha é obrigatória' }]
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      onNotify('Por favor, corrija os erros no formulário', 'error');
      return;
    }

    setLoading(true);

    try {
      const user = await auth.login(formData.email, formData.password);
      
      if (user) {
        onNotify('Login realizado com sucesso!', 'success');
        onLogin(user as User);
      } else {
        onNotify('Email ou senha incorretos', 'error');
      }
    } catch (error: any) {
      onNotify(error.message || 'Erro ao fazer login', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    touchField(field);
    validateSingleField(field, value);
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
              <label className="text-xs uppercase tracking-wider text-white/50 font-semibold ml-1">
                Email <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value.toLowerCase())}
                placeholder="seu@email.com"
                className={`w-full px-5 py-4 bg-white/5 border rounded-xl outline-none text-sm text-white placeholder:text-white/20 transition-all hover:border-white/20 focus:bg-white/[0.08] ${
                  errors.email ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-[#c5a059]'
                }`}
              />
              {errors.email && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-rose-400"></span>
                  {errors.email}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-white/50 font-semibold ml-1">
                Senha <span className="text-rose-400">*</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                placeholder="••••••••"
                className={`w-full px-5 py-4 bg-white/5 border rounded-xl outline-none text-sm text-white placeholder:text-white/20 transition-all hover:border-white/20 focus:bg-white/[0.08] ${
                  errors.password ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-[#c5a059]'
                }`}
              />
              {errors.password && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-rose-400"></span>
                  {errors.password}
                </p>
              )}
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


const RecentList = ({ title, items, type, context = 'vendor' }: { title: string; items: any[]; type: 'venda' | 'pagamento'; context?: 'vendor' | 'customer' }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col h-full"
  >
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-sm uppercase tracking-wider text-white font-bold">{title}</h3>
      {items.length > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-white/50 font-semibold">
            {items.length} {items.length === 1 ? 'Registro' : 'Registros'}
          </span>
          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
            type === 'pagamento'
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : context === 'customer'
              ? 'bg-white/5 text-white/50 border border-white/10'
              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
          }`}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
              items.reduce((sum, item) => sum + Number(type === 'venda' ? item.valor_total : item.valor_pago), 0)
            )}
          </span>
        </div>
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
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${
                      type === 'pagamento' ? 'bg-green-500' : context === 'customer' ? 'bg-white/40' : 'bg-blue-500'
                    }`}></div>
                    <p className="text-sm font-semibold text-white/90 truncate uppercase tracking-wide">
                      {item.descricao}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-white/40">
                    <span>{new Date(item.created_at || item.paid_at).toLocaleDateString('pt-BR')}</span>
                    {item.status && context === 'vendor' && (
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'paga'
                          ? 'bg-green-500/10 text-green-400'
                          : item.status === 'parcial'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {item.status === 'paga' ? 'Paga' : item.status === 'parcial' ? 'Parcial' : 'Pendente'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold font-mono ${
                    type === 'pagamento' ? 'text-green-400' : context === 'customer' ? 'text-white/80' : 'text-blue-400'
                  }`}>
                    {type === 'pagamento' ? '+' : ''} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(type === 'venda' ? item.valor_total : item.valor_pago)}
                  </div>
                  <div className="text-xs text-white/40">
                    {type === 'pagamento'
                      ? (context === 'customer' ? 'Pago' : 'Recebido')
                      : (context === 'customer' ? 'Comprado' : 'A receber')}
                  </div>
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
      const [vendasData, pagamentosData, clientesData] = await Promise.all([
        db.getVendasByVendedor(user.id),
        db.getPagamentosByVendedor(user.id),
        db.getClientesByVendedor(user.id)
      ]);
      
      setVendas(vendasData as Venda[]);
      setPagamentos(pagamentosData as Pagamento[]);
      setClientes(clientesData);
      
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
        {/* Total a Receber */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -5, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="group relative overflow-hidden rounded-2xl border border-white/10 hover:border-[#c5a059]/40 bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-xl p-6 shadow-2xl shadow-black/40 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <p className="text-xs uppercase tracking-wider text-white/60 font-semibold">Total a Receber</p>
              </div>
              <Receipt size={20} className="text-blue-400" />
            </div>
            
            <p className="text-3xl font-bold font-mono tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent mb-3">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentStats.total_vendido)}
            </p>
            
            <div className="text-xs text-white/40">
              {vendas.length} {vendas.length === 1 ? 'venda registrada' : 'vendas registradas'}
            </div>
            
            {currentStats.total_vendido > 0 && (
              <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((currentStats.total_recebido / currentStats.total_vendido) * 100, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* Total Recebido */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -5, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
          className="group relative overflow-hidden rounded-2xl border border-white/10 hover:border-green-500/40 bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-xl p-6 shadow-2xl shadow-black/40 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <p className="text-xs uppercase tracking-wider text-white/60 font-semibold">Já Recebido</p>
              </div>
              <CheckCircle size={20} className="text-green-400" />
            </div>
            
            <p className="text-3xl font-bold font-mono tracking-tight text-green-400 mb-3">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentStats.total_recebido)}
            </p>
            
            <div className="text-xs text-white/40">
              {pagamentos.length} {pagamentos.length === 1 ? 'pagamento recebido' : 'pagamentos recebidos'}
            </div>
            
            {currentStats.total_vendido > 0 && (
              <div className="text-xs text-green-400 mt-2 font-semibold">
                {Math.round((currentStats.total_recebido / currentStats.total_vendido) * 100)}% recebido
              </div>
            )}
          </div>
        </motion.div>

        {/* Saldo Pendente */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -5, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
          className={`group relative overflow-hidden rounded-2xl border backdrop-blur-xl p-6 shadow-2xl shadow-black/40 transition-all duration-300 ${
            currentStats.saldo_pendente > 0 
              ? 'border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-amber-600/5 hover:border-amber-500/60' 
              : 'border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] hover:border-green-500/40'
          }`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
            currentStats.saldo_pendente > 0 ? 'from-amber-500/10 to-transparent' : 'from-green-500/10 to-transparent'
          }`}></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${
                  currentStats.saldo_pendente > 0 ? 'bg-amber-500 animate-pulse' : 'bg-green-500'
                }`}></div>
                <p className="text-xs uppercase tracking-wider text-white/60 font-semibold">Saldo Pendente</p>
              </div>
              {currentStats.saldo_pendente > 0 ? (
                <AlertCircle size={20} className="text-amber-400" />
              ) : (
                <CheckCircle size={20} className="text-green-400" />
              )}
            </div>
            
            <p className={`text-3xl font-bold font-mono tracking-tight mb-3 ${
              currentStats.saldo_pendente > 0 ? 'text-amber-400' : 'text-green-400'
            }`}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentStats.saldo_pendente)}
            </p>
            
            <div className="flex items-center gap-2">
              {currentStats.saldo_pendente <= 0 ? (
                <>
                  <CheckCircle size={12} className="text-green-400" />
                  <span className="text-xs text-green-400 font-semibold">Tudo Quitado</span>
                </>
              ) : (
                <>
                  <AlertCircle size={12} className="text-amber-400" />
                  <span className="text-xs text-amber-400 font-semibold">Aguardando Pagamento</span>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Resumo Visual Adicional */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-6"
      >
        <h3 className="text-sm uppercase tracking-wider text-white/60 font-semibold mb-4">Resumo Financeiro</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="space-y-2">
            <div className="text-2xl font-bold font-mono text-blue-400">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentStats.total_vendido)}
            </div>
            <div className="text-xs text-white/50">Total Vendido</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-2xl font-bold font-mono text-green-400">
              -{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentStats.total_recebido)}
            </div>
            <div className="text-xs text-white/50">Já Recebido</div>
          </div>
          
          <div className="space-y-2">
            <div className={`text-2xl font-bold font-mono ${
              currentStats.saldo_pendente > 0 ? 'text-amber-400' : 'text-green-400'
            }`}>
              ={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentStats.saldo_pendente)}
            </div>
            <div className="text-xs text-white/50">Saldo Pendente</div>
          </div>
        </div>
        
        {/* Barra de Progresso Global */}
        {currentStats.total_vendido > 0 && (
          <div className="mt-6">
            <div className="flex justify-between text-xs text-white/60 mb-2">
              <span>Progresso dos Recebimentos</span>
              <span>{Math.round((currentStats.total_recebido / currentStats.total_vendido) * 100)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((currentStats.total_recebido / currentStats.total_vendido) * 100, 100)}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
              />
            </div>
          </div>
        )}
      </motion.div>

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
      const [vendasData, pagamentosData] = await Promise.all([
        db.getVendasByCliente(user.id),
        db.getPagamentosByCliente(user.id)
      ]);
      
      setVendas(vendasData as Venda[]);
      setPagamentos(pagamentosData as Pagamento[]);
      
      // CALCULAR TOTAIS MANUALMENTE (CORREÇÃO DEFINITIVA)
      const totalComprado = vendasData.reduce((sum, venda) => sum + Number(venda.valor_total), 0);
      const totalPago = pagamentosData.reduce((sum, pagamento) => sum + Number(pagamento.valor_pago), 0);
      const saldoDevedor = totalComprado - totalPago;
      
      // Criar objeto balance com valores corretos
      const balanceCorreto = {
        cliente_id: user.id,
        cliente_nome: user.display_name,
        cliente_email: user.email,
        total_comprado: totalComprado,
        total_pago: totalPago,
        saldo_devedor: saldoDevedor
      };
      
      setBalance(balanceCorreto);
      
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
        <div className="flex items-center justify-between">
          <h3 className="text-sm uppercase tracking-wider text-white/60 font-semibold">Sua Transparência</h3>
        </div>
        
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#c5a059] via-[#d4af37] to-[#e5c158] p-5 sm:p-8 shadow-2xl shadow-[#c5a059]/40 border border-[#e5c158]/50"
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
            
            {/* RESUMO FINANCEIRO MELHORADO */}
            <div className="space-y-4">
              {/* Total das Compras */}
              <div className="bg-black/10 backdrop-blur-sm p-4 rounded-xl border border-black/10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0"></div>
                  <span className="text-xs uppercase font-bold tracking-wider text-black/60">Total das Compras</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold text-black font-mono">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance?.total_comprado || 0)}
                  </span>
                  <span className="text-xs text-black/50">
                    {vendas.length} {vendas.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>
              </div>

              {/* Valor Já Pago */}
              <div className="bg-black/10 backdrop-blur-sm p-4 rounded-xl border border-black/10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-600 flex-shrink-0"></div>
                  <span className="text-xs uppercase font-bold tracking-wider text-black/60">Já Pago</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold text-green-800 font-mono">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance?.total_pago || 0)}
                  </span>
                  <span className="text-xs text-black/50">
                    {pagamentos.length} {pagamentos.length === 1 ? 'pagamento' : 'pagamentos'}
                  </span>
                </div>
              </div>

              {/* Saldo Restante */}
              <div className="bg-gradient-to-r from-black/20 to-black/10 backdrop-blur-sm p-4 rounded-xl border-2 border-black/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse flex-shrink-0"></div>
                  <span className="text-xs uppercase font-bold tracking-wider text-black/70">Saldo Restante</span>
                </div>
                <div className="flex items-baseline justify-between mb-3">
                  <span className={`text-2xl font-bold font-mono ${(balance?.saldo_devedor || 0) <= 0 ? 'text-green-700' : 'text-red-800'}`}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance?.saldo_devedor || 0)}
                  </span>
                </div>
                
                {/* Barra de Progresso */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-black/60 mb-2">
                    <span>Progresso do Pagamento</span>
                    <span>
                      {balance?.total_comprado > 0 
                        ? Math.round(((balance?.total_pago || 0) / (balance?.total_comprado || 1)) * 100)
                        : 0
                      }%
                    </span>
                  </div>
                  <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ 
                        width: balance?.total_comprado > 0 
                          ? `${Math.min(((balance?.total_pago || 0) / (balance?.total_comprado || 1)) * 100, 100)}%`
                          : '0%'
                      }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-green-600 to-green-500 rounded-full shadow-lg"
                    />
                  </div>
                </div>

                {/* Status do Pagamento */}
                <div className="flex items-center gap-2">
                  {(balance?.saldo_devedor || 0) <= 0 ? (
                    <>
                      <CheckCircle size={16} className="text-green-700" />
                      <span className="text-xs font-semibold text-green-700">Totalmente Quitado</span>
                    </>
                  ) : (balance?.total_pago || 0) > 0 ? (
                    <>
                      <AlertCircle size={16} className="text-amber-700" />
                      <span className="text-xs font-semibold text-amber-700">Pagamento Parcial</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={16} className="text-red-700" />
                      <span className="text-xs font-semibold text-red-700">Pendente de Pagamento</span>
                    </>
                  )}
                </div>
              </div>

              {/* Resumo Rápido */}
              <div className="bg-black/5 backdrop-blur-sm p-4 rounded-xl border border-black/5 space-y-3">
                <div className="text-xs text-black/60 font-semibold uppercase tracking-wider">Resumo</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-black/60">Total comprado</span>
                  <span className="text-sm font-bold text-black font-mono">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance?.total_comprado || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-black/10 pt-2">
                  <span className="text-xs font-semibold text-black/60">Já pago</span>
                  <span className="text-sm font-bold text-green-700 font-mono">
                    − {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance?.total_pago || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-black/20 pt-2">
                  <span className="text-xs font-bold text-black/70 uppercase tracking-wide">Restante</span>
                  <span className={`text-sm font-bold font-mono ${(balance?.saldo_devedor || 0) <= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    = {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance?.saldo_devedor || 0)}
                  </span>
                </div>
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
        <RecentList title="Suas Compras" items={filteredVendas} type="venda" context="customer" />
        <RecentList title="Seus Pagamentos" items={filteredPagamentos} type="pagamento" context="customer" />
      </motion.div>
    </div>
  );
}

// ============================================
// Formulários
// ============================================

function FormAddVenda({ vendedorId, clientes, onClose, onNotify }: { vendedorId: string; clientes: any[]; onClose: () => void; onNotify: (msg: string, type: 'success' | 'error' | 'info') => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clienteId: '',
    valor: '',
    descricao: '',
    data: new Date().toISOString().split('T')[0]
  });

  const { errors, validateForm, validateSingleField, touchField } = useFormValidation({
    clienteId: [{ required: true, message: 'Cliente é obrigatório' }],
    valor: commonValidationRules.currency,
    descricao: commonValidationRules.description,
    data: []
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      onNotify('Por favor, corrija os erros no formulário', 'error');
      return;
    }

    setLoading(true);
    
    try {
      await db.createVenda({
        descricao: formData.descricao,
        valor_total: masks.currencyToNumber(formData.valor),
        cliente_id: formData.clienteId,
        vendedor_id: vendedorId,
        data: formData.data ? `${formData.data}T12:00:00Z` : undefined
      });
      onNotify('Venda registrada com sucesso!', 'success');
      onClose();
    } catch (error: any) {
      onNotify(error.message || 'Erro ao registrar venda', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: string, value: string, unmaskedValue?: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    touchField(field);
    validateSingleField(field, field === 'valor' ? unmaskedValue || value : value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wider font-semibold text-[#c5a059]">
          Cliente <span className="text-rose-400">*</span>
        </label>
        <select 
          value={formData.clienteId}
          onChange={(e) => handleFieldChange('clienteId', e.target.value)}
          className={`w-full px-5 py-4 bg-white/5 border rounded-xl outline-none text-sm text-white transition-all hover:border-white/20 focus:bg-white/[0.08] ${
            errors.clienteId ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-[#c5a059]'
          }`}
        >
          <option value="">Selecione um cliente</option>
          {clientes.map(c => (
            <option key={c.id} value={c.id} className="bg-[#141416]">{c.display_name}</option>
          ))}
        </select>
        {errors.clienteId && (
          <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-rose-400"></span>
            {errors.clienteId}
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <MaskedInput
          mask="currency"
          value={formData.valor}
          onChange={(value, unmasked) => handleFieldChange('valor', value, unmasked)}
          label="Valor"
          placeholder="R$ 0,00"
          required
          error={errors.valor}
        />
        
        <div className="space-y-2">
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#c5a059]">
            Descrição <span className="text-rose-400">*</span>
          </label>
          <input 
            type="text" 
            value={formData.descricao}
            onChange={(e) => handleFieldChange('descricao', e.target.value)}
            placeholder="Ex: Venda #01" 
            className={`w-full px-5 py-4 bg-white/5 border rounded-xl outline-none text-sm text-white placeholder:text-white/20 transition-all hover:border-white/20 focus:bg-white/[0.08] ${
              errors.descricao ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-[#c5a059]'
            }`}
          />
          {errors.descricao && (
            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-rose-400"></span>
              {errors.descricao}
            </p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wider font-semibold text-[#c5a059]">Data (Opcional)</label>
        <input 
          type="date" 
          value={formData.data}
          onChange={(e) => handleFieldChange('data', e.target.value)}
          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[#c5a059] focus:bg-white/[0.08] text-sm text-white transition-all hover:border-white/20" 
          style={{ colorScheme: 'dark' }} 
        />
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
  const [formData, setFormData] = useState({
    clienteId: '',
    vendaId: '',
    valor: '',
    descricao: '',
    data: new Date().toISOString().split('T')[0]
  });

  const { errors, validateForm, validateSingleField, touchField } = useFormValidation({
    clienteId: [{ required: true, message: 'Cliente é obrigatório' }],
    valor: commonValidationRules.currency,
    descricao: [
      { required: true, message: 'Descrição é obrigatória' },
      { minLength: 3, message: 'Descrição deve ter pelo menos 3 caracteres' },
      { maxLength: 500, message: 'Descrição deve ter no máximo 500 caracteres' }
    ]
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      onNotify('Por favor, corrija os erros no formulário', 'error');
      return;
    }

    setLoading(true);
    
    try {
      await db.createPagamento({
        valor_pago: masks.currencyToNumber(formData.valor),
        descricao: formData.descricao || 'Pagamento recebido',
        cliente_id: formData.clienteId,
        vendedor_id: vendedorId,
        venda_id: formData.vendaId || undefined,
        data: formData.data ? `${formData.data}T12:00:00Z` : undefined
      });

      if (formData.vendaId) {
        const selectedVenda = vendas.find(v => v.id === formData.vendaId);
        const valorPago = masks.currencyToNumber(formData.valor);
        const newStatus = selectedVenda && valorPago >= Number(selectedVenda.valor_total) ? 'paga' : 'parcial';
        await db.updateVendaStatus(formData.vendaId, newStatus);
      }

      onNotify('Pagamento registrado com sucesso!', 'success');
      onClose();
    } catch (error: any) {
      onNotify(error.message || 'Erro ao registrar pagamento', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: string, value: string, unmaskedValue?: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    touchField(field);
    validateSingleField(field, field === 'valor' ? unmaskedValue || value : value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wider font-semibold text-[#c5a059]">
          Cliente <span className="text-rose-400">*</span>
        </label>
        <select 
          value={formData.clienteId}
          onChange={(e) => handleFieldChange('clienteId', e.target.value)}
          className={`w-full px-5 py-4 bg-white/5 border rounded-xl outline-none text-sm text-white transition-all hover:border-white/20 focus:bg-white/[0.08] ${
            errors.clienteId ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-[#c5a059]'
          }`}
        >
          <option value="">Selecione um cliente</option>
          {clientes.map(c => (
            <option key={c.id} value={c.id} className="bg-[#141416]">{c.display_name}</option>
          ))}
        </select>
        {errors.clienteId && (
          <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-rose-400"></span>
            {errors.clienteId}
          </p>
        )}
      </div>
      
      {vendas.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#c5a059]">Venda (Opcional)</label>
          <select 
            value={formData.vendaId}
            onChange={(e) => handleFieldChange('vendaId', e.target.value)}
            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[#c5a059] focus:bg-white/[0.08] text-sm text-white transition-all hover:border-white/20"
          >
            <option value="">Pagamento geral</option>
            {vendas.map(v => (
              <option key={v.id} value={v.id} className="bg-[#141416]">
                {v.descricao} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v.valor_total)}
              </option>
            ))}
          </select>
        </div>
      )}

      <MaskedInput
        mask="currency"
        value={formData.valor}
        onChange={(value, unmasked) => handleFieldChange('valor', value, unmasked)}
        label="Valor"
        placeholder="R$ 0,00"
        required
        error={errors.valor}
      />
      
      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wider font-semibold text-[#c5a059]">
          Descrição <span className="text-rose-400">*</span>
        </label>
        <input 
          type="text" 
          value={formData.descricao}
          onChange={(e) => handleFieldChange('descricao', e.target.value)}
          placeholder="Ex: Transferência PIX" 
          className={`w-full px-5 py-4 bg-white/5 border rounded-xl outline-none text-sm text-white placeholder:text-white/20 transition-all hover:border-white/20 focus:bg-white/[0.08] ${
            errors.descricao ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-[#c5a059]'
          }`}
        />
        {errors.descricao && (
          <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-rose-400"></span>
            {errors.descricao}
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wider font-semibold text-[#c5a059]">Data (Opcional)</label>
        <input 
          type="date" 
          value={formData.data}
          onChange={(e) => handleFieldChange('data', e.target.value)}
          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[#c5a059] focus:bg-white/[0.08] text-sm text-white transition-all hover:border-white/20" 
          style={{ colorScheme: 'dark' }} 
        />
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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const { errors, validateForm, validateSingleField, touchField } = useFormValidation({
    name: commonValidationRules.name,
    email: commonValidationRules.email,
    password: commonValidationRules.strongPassword
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      onNotify('Por favor, corrija os erros no formulário', 'error');
      return;
    }

    setLoading(true);

    try {
      await db.createCliente({
        email: formData.email,
        password: formData.password,
        display_name: formData.name,
        vendedor_id: vendedorId
      });
      onNotify('Cliente criado com sucesso!', 'success');
      onClose();
    } catch (error: any) {
      onNotify(error.message || 'Erro ao criar cliente', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    touchField(field);
    validateSingleField(field, value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wider font-semibold text-[#c5a059]">
          Nome Completo <span className="text-rose-400">*</span>
        </label>
        <input 
          type="text" 
          value={formData.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          placeholder="Nome Completo" 
          className={`w-full px-5 py-4 bg-white/5 border rounded-xl outline-none text-sm text-white placeholder:text-white/20 transition-all hover:border-white/20 focus:bg-white/[0.08] ${
            errors.name ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-[#c5a059]'
          }`}
        />
        {errors.name && (
          <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-rose-400"></span>
            {errors.name}
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wider font-semibold text-[#c5a059]">
          Email <span className="text-rose-400">*</span>
        </label>
        <input 
          type="email" 
          value={formData.email}
          onChange={(e) => handleFieldChange('email', e.target.value.toLowerCase())}
          placeholder="email@exemplo.com" 
          className={`w-full px-5 py-4 bg-white/5 border rounded-xl outline-none text-sm text-white placeholder:text-white/20 transition-all hover:border-white/20 focus:bg-white/[0.08] ${
            errors.email ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-[#c5a059]'
          }`}
        />
        {errors.email && (
          <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-rose-400"></span>
            {errors.email}
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wider font-semibold text-[#c5a059]">
          Senha Inicial <span className="text-rose-400">*</span>
        </label>
        <input 
          type="password" 
          value={formData.password}
          onChange={(e) => handleFieldChange('password', e.target.value)}
          placeholder="Senha segura para o cliente" 
          className={`w-full px-5 py-4 bg-white/5 border rounded-xl outline-none text-sm text-white placeholder:text-white/20 transition-all hover:border-white/20 focus:bg-white/[0.08] ${
            errors.password ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-[#c5a059]'
          }`}
        />
        {errors.password && (
          <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-rose-400"></span>
            {errors.password}
          </p>
        )}
        <p className="text-xs text-white/40 mt-2">
          A senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula e número
        </p>
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