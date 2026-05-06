# Lumina Ledger - Plataforma de Transparência Financeira

Sistema moderno e seguro para gestão de vendas e pagamentos entre vendedor e cliente, com foco em transparência e usabilidade.

<div align="center">
  
**Desenvolvido por [RonalDigital](https://github.com/RonalDigital)**

</div>

---

## 🚀 Configuração Rápida

### 1. Banco de Dados (Neon)

1. Crie uma conta em [neon.tech](https://neon.tech/)
2. Crie um projeto
3. Copie a **Connection String**
4. Execute o schema SQL no editor do Neon:

```sql
-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('vendedor', 'cliente')),
    vendedor_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de vendas
CREATE TABLE vendas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    descricao VARCHAR(500) NOT NULL,
    valor_total DECIMAL(12,2) NOT NULL CHECK (valor_total > 0),
    cliente_id UUID NOT NULL REFERENCES users(id),
    vendedor_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'paga', 'parcial')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de pagamentos
CREATE TABLE pagamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    valor_pago DECIMAL(12,2) NOT NULL CHECK (valor_pago > 0),
    descricao VARCHAR(500) NOT NULL,
    cliente_id UUID NOT NULL REFERENCES users(id),
    vendedor_id UUID NOT NULL REFERENCES users(id),
    venda_id UUID REFERENCES vendas(id),
    paid_at TIMESTAMP DEFAULT NOW()
);

-- Função de login seguro
CREATE OR REPLACE FUNCTION login_user(user_email TEXT, user_password TEXT)
RETURNS TABLE(id UUID, email VARCHAR, display_name VARCHAR, role VARCHAR, vendedor_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.email, u.display_name, u.role, u.vendedor_id
    FROM users u
    WHERE u.email = user_email 
    AND u.password_hash = crypt(user_password, u.password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função de registro de usuário
CREATE OR REPLACE FUNCTION register_user(user_email TEXT, user_password TEXT, user_display_name TEXT, user_role TEXT)
RETURNS UUID AS $$
DECLARE
    new_user_id UUID;
BEGIN
    INSERT INTO users (email, password_hash, display_name, role)
    VALUES (user_email, crypt(user_password, gen_salt('bf')), user_display_name, user_role)
    RETURNING id INTO new_user_id;
    
    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View para dashboard do vendedor
CREATE VIEW vendor_dashboard AS
SELECT 
    v.id as vendedor_id,
    v.display_name as vendedor_nome,
    COALESCE(SUM(ve.valor_total), 0) as total_vendido,
    COALESCE(SUM(p.valor_pago), 0) as total_recebido,
    COALESCE(SUM(ve.valor_total), 0) - COALESCE(SUM(p.valor_pago), 0) as saldo_pendente
FROM users v
LEFT JOIN vendas ve ON v.id = ve.vendedor_id
LEFT JOIN pagamentos p ON v.id = p.vendedor_id
WHERE v.role = 'vendedor'
GROUP BY v.id, v.display_name;

-- View para balanço do cliente
CREATE VIEW customer_balance AS
SELECT 
    c.id as cliente_id,
    c.display_name as cliente_nome,
    c.email as cliente_email,
    v.id as vendedor_id,
    v.display_name as vendedor_nome,
    COALESCE(SUM(ve.valor_total), 0) as total_comprado,
    COALESCE(SUM(p.valor_pago), 0) as total_pago,
    COALESCE(SUM(ve.valor_total), 0) - COALESCE(SUM(p.valor_pago), 0) as saldo_devedor
FROM users c
LEFT JOIN users v ON c.vendedor_id = v.id
LEFT JOIN vendas ve ON c.id = ve.cliente_id
LEFT JOIN pagamentos p ON c.id = p.cliente_id
WHERE c.role = 'cliente'
GROUP BY c.id, c.display_name, c.email, v.id, v.display_name;

-- Inserir usuário admin padrão
INSERT INTO users (email, password_hash, display_name, role) 
VALUES ('admin@lumina.local', crypt('MudeEstaSenha123!', gen_salt('bf')), 'Administrador', 'vendedor')
ON CONFLICT (email) DO NOTHING;

-- Índices para performance
CREATE INDEX idx_vendas_vendedor ON vendas(vendedor_id);
CREATE INDEX idx_vendas_cliente ON vendas(cliente_id);
CREATE INDEX idx_pagamentos_vendedor ON pagamentos(vendedor_id);
CREATE INDEX idx_pagamentos_cliente ON pagamentos(cliente_id);
CREATE INDEX idx_users_vendedor ON users(vendedor_id);
```

### 2. Configuração do Ambiente

1. Clone o repositório
2. Copie `.env.example` para `.env`
3. Configure a string de conexão do Neon:

```env
VITE_NEON_CONNECTION_STRING="sua_connection_string_aqui"
```

### 3. Instalação e Execução

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Verificar código
npm run lint
```

---

## ✨ Melhorias Implementadas

### 🔒 Segurança Aprimorada

- **Validação de entrada**: Sanitização e validação de todos os inputs
- **Rate limiting**: Proteção contra ataques de força bruta
- **Validação de UUID**: Verificação de IDs válidos
- **Senhas seguras**: Validação de complexidade de senhas
- **Sanitização SQL**: Proteção contra SQL injection

### 🎭 Máscaras e Validação

- **Máscara monetária**: Formatação automática de valores em R$
- **Validação em tempo real**: Feedback imediato nos formulários
- **Componente MaskedInput**: Reutilizável para diferentes tipos de máscara
- **Hook de validação**: Sistema flexível de validação de formulários

### 🎨 Interface Melhorada

- **Feedback visual**: Estados de erro e sucesso claramente indicados
- **Campos obrigatórios**: Marcação visual com asterisco vermelho
- **Mensagens de erro**: Contextuais e específicas
- **Loading states**: Indicadores visuais durante operações

### 🛡️ Tratamento de Erros

- **Try-catch robusto**: Captura e tratamento adequado de erros
- **Mensagens amigáveis**: Erros técnicos convertidos em linguagem clara
- **Fallbacks**: Comportamento gracioso em caso de falhas

### ⚡ Performance

- **Validação otimizada**: Debounce e validação inteligente
- **Re-renders controlados**: Uso eficiente do React
- **Componentes otimizados**: Memoização onde necessário

---

## 🏗️ Arquitetura

### Frontend
- **React 19** com TypeScript
- **Vite** para build e desenvolvimento
- **TailwindCSS** para estilização
- **Motion** para animações
- **Lucide React** para ícones

### Backend
- **Neon PostgreSQL** (serverless)
- **Funções SQL** para lógica de negócio
- **Views** para dashboards otimizados

### Segurança
- **Bcrypt** para hash de senhas
- **Validação client-side e server-side**
- **Rate limiting** em memória
- **Sanitização de inputs**

---

## 📁 Estrutura do Projeto

```
src/
├── components/
│   └── ui/
│       └── MaskedInput.tsx      # Componente de input com máscara
├── hooks/
│   └── useFormValidation.ts     # Hook para validação de formulários
├── utils/
│   ├── masks.ts                 # Utilitários de máscara e validação
│   └── security.ts              # Utilitários de segurança
├── App.tsx                      # Componente principal
├── database.ts                  # Conexão e operações do banco
├── types.ts                     # Definições de tipos TypeScript
└── notifications.ts             # Sistema de notificações
```

---

## 🔐 Recursos de Segurança

### Validações Implementadas

1. **Entrada de dados**:
   - Sanitização de strings
   - Validação de tipos
   - Limites de tamanho
   - Caracteres especiais

2. **Autenticação**:
   - Rate limiting de login
   - Senhas com complexidade mínima
   - Hash seguro com bcrypt

3. **Autorização**:
   - Validação de UUIDs
   - Verificação de propriedade
   - Isolamento de dados por usuário

4. **Prevenção de ataques**:
   - SQL injection
   - XSS (Cross-site scripting)
   - CSRF (Cross-site request forgery)
   - Força bruta

---

## 🎯 Funcionalidades

### Para Vendedores
- Dashboard com métricas financeiras
- Gestão completa de vendas
- Registro de pagamentos recebidos
- Criação e gestão de clientes
- Filtros e busca avançada
- Visão por cliente específico

### Para Clientes
- Dashboard transparente
- Histórico de compras
- Histórico de pagamentos
- Saldo devedor atualizado
- Interface intuitiva

---

## 🚀 Deploy

### Netlify (Recomendado)

O projeto está configurado para deploy automático no Netlify:

1. Conecte seu repositório
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Outras Plataformas

- **Vercel**: Suporte nativo para Vite
- **Railway**: Deploy com banco incluído
- **Render**: Hospedagem gratuita

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

---

## 📞 Suporte

Para suporte e dúvidas:

- **GitHub Issues**: Para bugs e feature requests
- **Email**: contato@ronaldigital.com
- **Documentação**: Consulte este README

---

**Lumina Ledger** - Transparência que ilumina seus negócios ✨
   