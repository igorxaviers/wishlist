# Configuração de Variáveis de Ambiente

## 📁 Estrutura Recomendada

Para projetos com múltiplas aplicações, cada diretório deve ter seus próprios arquivos `.env`:

```
wishlist/
├── api/
│   ├── .env              # Variáveis da API
│   ├── .env.example      # Exemplo para a API
│   └── src/
├── web/
│   ├── .env              # Variáveis do Frontend
│   ├── .env.example      # Exemplo para o Frontend
│   └── src/
└── .gitignore            # Ignora todos os .env
```

## 🔧 Configuração por Aplicação

### API (Backend)

**Arquivo:** `api/.env`

```bash
# Configurações do Servidor
PORT=4000
NODE_ENV=development

# JWT
JWT_SECRET=seu-jwt-secret-super-seguro-aqui

# Banco de Dados
DATABASE_URL="file:./dev.db"

# CORS
CORS_ORIGIN=http://localhost:3000

# Logs
LOG_LEVEL=info
```

### Web (Frontend)

**Arquivo:** `web/.env`

```bash
# Configurações do Next.js
NEXT_PUBLIC_API_URL=http://localhost:4000/graphql

# Configurações de Desenvolvimento
NODE_ENV=development

# Analytics (opcional)
NEXT_PUBLIC_GA_ID=

# Outras configurações do frontend
NEXT_PUBLIC_APP_NAME=Wishlist App
```

## 🚀 Como Configurar

### 1. Copiar arquivos de exemplo
```bash
# Na pasta api
cp api/.env.example api/.env

# Na pasta web
cp web/.env.example web/.env
```

### 2. Editar as variáveis
- Abra cada arquivo `.env`
- Configure os valores específicos do seu ambiente
- **NUNCA** commite arquivos `.env` no Git

### 3. Para produção
Crie arquivos específicos:
- `api/.env.production`
- `web/.env.production`

## 🔐 Segurança

### ✅ Boas Práticas
- Use `.env.example` para documentar variáveis necessárias
- Configure `.gitignore` para ignorar `.env`
- Use valores diferentes para cada ambiente
- Rotacione secrets regularmente

### ❌ Evite
- Commitar arquivos `.env` no Git
- Usar secrets fracos
- Usar as mesmas variáveis em todos os ambientes
- Hardcodar valores sensíveis no código

## 🌍 Ambientes

### Desenvolvimento
```bash
NODE_ENV=development
```

### Produção
```bash
NODE_ENV=production
JWT_SECRET=secret-super-forte-producao
DATABASE_URL=postgresql://user:pass@host:port/db
```

### Teste
```bash
NODE_ENV=test
DATABASE_URL=file:./test.db
```

## 📋 Checklist

- [ ] Criar `.env.example` em cada aplicação
- [ ] Configurar `.env` com valores reais
- [ ] Adicionar `.env*` ao `.gitignore`
- [ ] Documentar variáveis necessárias
- [ ] Testar configuração em desenvolvimento
- [ ] Configurar variáveis de produção

## 🔧 Troubleshooting

### Erro: "Cannot find module 'dotenv'"
```bash
npm install dotenv
```

### Erro: "JWT_SECRET is not defined"
- Verifique se o arquivo `.env` existe
- Confirme se `dotenv/config` está importado
- Reinicie o servidor após mudanças

### Erro: "Database connection failed"
- Verifique `DATABASE_URL` no `.env`
- Confirme se o banco está acessível
- Teste a conexão manualmente 