# 🚀 Deploy Guide - Fast Learner AI

Este guia te ajudará a fazer o deploy completo da aplicação Fast Learner AI.

## 📋 Pré-requisitos

- [x] Conta no Supabase configurada
- [x] Aplicação testada localmente
- [x] Git repository configurado
- [x] Contas nas plataformas de deploy (Vercel, Railway, etc.)

## 🎯 Arquitetura de Deploy Recomendada

```
├── Frontend (React) → Vercel
├── Backend (Node.js) → Railway  
└── Database → Supabase (já configurado)
```

---

## 🔧 PASSO 1: Deploy do Backend (Railway)

### 1.1 Preparar o Backend
```bash
cd backend

# Instalar Railway CLI
npm install -g @railway/cli

# Login no Railway
railway login
```

### 1.2 Configurar Deploy
```bash
# Inicializar projeto Railway
railway init

# Fazer deploy
railway up
```

### 1.3 Configurar Variáveis de Ambiente
No painel do Railway (https://railway.app), vá em **Variables** e adicione:

```env
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 1.4 Verificar Deploy
```bash
# Ver logs
railway logs

# Obter URL do backend
railway domain
```

**✅ Resultado:** URL do backend (ex: `https://fast-learner-ai-backend.railway.app`)

---

## 🎨 PASSO 2: Deploy do Frontend (Vercel)

### 2.1 Preparar o Frontend
```bash
cd frontend

# Instalar Vercel CLI
npm i -g vercel

# Login no Vercel
vercel login
```

### 2.2 Configurar Variáveis de Ambiente
Criar arquivo `.env.production`:
```env
REACT_APP_API_URL=https://fast-learner-ai-backend.railway.app
REACT_APP_SUPABASE_URL=https://seu-projeto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2.3 Deploy
```bash
# Deploy inicial
vercel

# Deploy para produção
vercel --prod
```

### 2.4 Configurar Domínio (Opcional)
No painel Vercel:
1. **Settings** → **Domains** 
2. Adicionar domínio personalizado
3. Configurar DNS

**✅ Resultado:** URL do frontend (ex: `https://fast-learner-ai.vercel.app`)

---

## 🛡️ PASSO 3: Configurar CORS no Backend

Atualizar configuração CORS no backend para permitir o domínio do frontend:

```javascript
// No arquivo backend/src/index.ts
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://fast-learner-ai.vercel.app',
    'https://seu-dominio-personalizado.com'
  ],
  credentials: true
}));
```

Fazer redeploy do backend:
```bash
cd backend
railway up
```

---

## 🗄️ PASSO 4: Configurar Database (Supabase)

### 4.1 Aplicar Migrações
No Supabase SQL Editor, executar em ordem:
```sql
-- 1. schema.sql
-- 2. add_sentence_support.sql  
-- 3. ai_metadata_extension.sql
-- 4. add_difficulty_levels.sql
-- 5. add_lesson_covers_and_progress.sql
```

### 4.2 Configurar Storage
1. **Storage** → Criar bucket `audio-files`
2. **Policies** → Configurar políticas RLS:

```sql
-- Política para upload
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'audio-files');

-- Política para acesso
CREATE POLICY "Authenticated users can access files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'audio-files');
```

---

## 🔄 PASSO 5: Deploy Automático (CI/CD)

### 5.1 GitHub Actions (Opcional)
Criar `.github/workflows/deploy.yml`:
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway deploy --service backend

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          vercel --token ${{ secrets.VERCEL_TOKEN }} --prod
```

---

## 📊 PASSO 6: Verificação e Testes

### 6.1 Checklist de Verificação
- [ ] Backend responde na URL Railway
- [ ] Frontend carrega na URL Vercel
- [ ] Login/registro funcionando
- [ ] API calls funcionando (CORS ok)
- [ ] Upload de arquivos funcionando
- [ ] Funcionalidades de IA funcionando com chave do usuário

### 6.2 Testes de Produção
```bash
# Testar endpoints da API
curl https://fast-learner-ai-backend.railway.app/api/health

# Testar frontend
curl https://fast-learner-ai.vercel.app
```

---

## 🔧 Alternativas de Deploy

### Frontend Alternativas:
- **Netlify**: `netlify deploy --prod --dir=build`
- **GitHub Pages**: Para projetos públicos
- **AWS S3 + CloudFront**: Para controle total

### Backend Alternativas:
- **Heroku**: `heroku create && git push heroku main`
- **DigitalOcean App Platform**: Interface visual
- **AWS ECS/Fargate**: Para aplicações enterprise

---

## 🆘 Troubleshooting

### Problemas Comuns:

**1. CORS Error**
```javascript
// Verificar origins permitidas no backend
app.use(cors({
  origin: ['https://seu-frontend.vercel.app']
}));
```

**2. Environment Variables**
```bash
# Verificar no Railway
railway variables

# Verificar no Vercel
vercel env ls
```

**3. Build Errors**
```bash
# Limpar cache e rebuild
npm ci
npm run build
```

**4. Database Connection**
```bash
# Testar conexão Supabase
curl -H "apikey: SUA_ANON_KEY" \
     "https://seu-projeto.supabase.co/rest/v1/"
```

---

## 💰 Custos Estimados

### Tier Gratuito:
- **Vercel**: 100GB bandwidth/mês
- **Railway**: $5 crédito inicial + $5/mês
- **Supabase**: 500MB storage + 2GB bandwidth

### Produção (estimativa):
- **Vercel Pro**: $20/mês (domínio personalizado + mais recursos)
- **Railway**: ~$10-25/mês (baseado no uso)
- **Supabase Pro**: $25/mês (mais storage e recursos)

---

## 🎯 Próximos Passos

1. **Deploy inicial** seguindo os passos 1-6
2. **Configurar domínio personalizado**
3. **Configurar monitoramento** (logs, métricas)
4. **Configurar backup** da database
5. **Documentar processo** para a equipe

---

## 📞 Suporte

- **Railway**: https://docs.railway.app
- **Vercel**: https://vercel.com/docs
- **Supabase**: https://supabase.com/docs

**Boa sorte com o deploy! 🚀**