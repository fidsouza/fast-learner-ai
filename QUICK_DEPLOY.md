# ⚡ Quick Deploy Commands

Comandos rápidos para deploy do Fast Learner AI.

## 🚀 Deploy Rápido (Opção 1: Script Automatizado)

```bash
# Execute o script de deploy
./deploy.sh
```

## 🛠️ Deploy Manual

### Backend → Railway
```bash
cd backend
npm install -g @railway/cli
railway login
railway init
railway up
```

### Frontend → Vercel
```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

## 🐳 Deploy com Docker

### Desenvolvimento Local
```bash
docker-compose up --build
```

### Produção Local
```bash
docker-compose -f docker-compose.prod.yml up --build
```

## ⚙️ Configuração Rápida

### 1. Criar .env.production (Frontend)
```bash
cd frontend
cp .env.production.example .env.production
# Editar com suas credenciais
```

### 2. Configurar Variáveis Railway (Backend)
```bash
railway variables set NODE_ENV=production
railway variables set SUPABASE_URL=sua-url
railway variables set SUPABASE_ANON_KEY=sua-key
railway variables set SUPABASE_SERVICE_KEY=sua-service-key
```

### 3. Configurar Variáveis Vercel (Frontend)
```bash
vercel env add REACT_APP_API_URL production
vercel env add REACT_APP_SUPABASE_URL production
vercel env add REACT_APP_SUPABASE_ANON_KEY production
```

## 🔍 Verificação Rápida

### Testar Backend
```bash
curl https://sua-app.railway.app/health
```

### Testar Frontend
```bash
curl https://sua-app.vercel.app/health
```

## 🆘 Troubleshooting Rápido

### CORS Error
```javascript
// backend/src/index.ts - Adicionar domínio do frontend
app.use(cors({
  origin: ['https://sua-app.vercel.app']
}));
```

### Environment Variables
```bash
# Verificar Railway
railway variables

# Verificar Vercel
vercel env ls
```

### Rebuild
```bash
# Railway
railway up --detach

# Vercel
vercel --prod
```

---

**💡 Dica:** Use `./deploy.sh` para deploy guiado passo a passo!