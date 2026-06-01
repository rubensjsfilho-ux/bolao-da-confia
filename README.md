# ⚽ Bolão Copa 2026

Site completo de bolão da Copa do Mundo 2026, com palpites, ranking em tempo real e painel admin.

---

## 🚀 Como colocar no ar (passo a passo)

### 1. Criar conta no Supabase (banco de dados gratuito)

1. Acesse **https://supabase.com** e crie uma conta gratuita
2. Clique em **"New Project"**
3. Dê um nome (ex: `bolao-copa-2026`) e crie uma senha
4. Aguarde o projeto ser criado (~1 min)

### 2. Configurar o banco de dados

1. No painel do Supabase, clique em **"SQL Editor"** no menu lateral
2. Clique em **"New query"**
3. Abra o arquivo `supabase-setup.sql` deste projeto
4. Cole todo o conteúdo no editor e clique em **"Run"**
5. Pronto! O banco estará configurado com todos os 72 jogos da fase de grupos.

### 3. Pegar as credenciais do Supabase

1. No painel, vá em **"Project Settings" → "API"**
2. Copie:
   - **Project URL** (ex: `https://xxxx.supabase.co`)
   - **anon / public key** (chave longa que começa com `eyJ...`)

### 4. Configurar o projeto

1. Na pasta do projeto, copie `.env.example` para `.env`:
   ```
   cp .env.example .env
   ```
2. Abra o `.env` e preencha:
   ```
   VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...SUA_CHAVE...
   VITE_JOIN_CODE=bolao2026        # código que os amigos usam para entrar
   VITE_ADMIN_PASSWORD=SuaSenhaAdmin  # sua senha do painel admin
   ```

### 5. Fazer o deploy no Netlify

**Opção A — pelo site (mais fácil):**
1. Acesse **https://netlify.com** e crie uma conta gratuita
2. Clique em **"Add new site" → "Deploy manually"**
3. Execute localmente: `npm install && npm run build`
4. Arraste a pasta **`dist/`** gerada para a área do Netlify
5. Pronto! O site já está no ar.

**Opção B — pelo GitHub (recomendado para atualizações fáceis):**
1. Suba o projeto para um repositório no GitHub
2. No Netlify, clique em **"Import from Git"**
3. Conecte seu GitHub e selecione o repositório
4. Configurações de build:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Clique em **"Environment variables"** e adicione as 4 variáveis do `.env`
6. Clique em **"Deploy site"**

---

## 🎮 Como usar

### Para os participantes
1. Acessar o link do site
2. Digitar o **código do bolão** (você define no `.env`)
3. Escolher um nome e avatar
4. Fazer os palpites antes de cada jogo (fecha 30 min antes)
5. Acompanhar o ranking em tempo real

### Para o admin (você)
1. Acessar `/admin` no seu site (ex: `seusite.netlify.app/admin`)
2. Digitar a senha do admin
3. Após cada jogo, inserir o placar real
4. Os pontos são calculados automaticamente!

---

## 📊 Sistema de pontuação

| Acerto | Pontos |
|--------|--------|
| Placar exato (ex: 2×1 = 2×1) | **+3 pontos** 🎯 |
| Resultado correto (vitória/empate) | **+1 ponto** ✓ |
| Errou o resultado | **0 pontos** ✗ |

---

## 🗂 Estrutura do projeto

```
bolao-copa-2026/
├── src/
│   ├── pages/
│   │   ├── Login.jsx        # Tela de entrada com código do bolão
│   │   ├── Dashboard.jsx    # Início: countdown, próximos jogos, mini-ranking
│   │   ├── Predictions.jsx  # Fazer e editar palpites
│   │   ├── Rankings.jsx     # Ranking completo com pódio
│   │   └── Admin.jsx        # Painel admin (inserir resultados)
│   ├── components/
│   │   └── Header.jsx       # Navegação principal
│   ├── data/
│   │   └── matches.js       # Todos os 72 jogos da fase de grupos
│   ├── supabase.js          # Cliente Supabase
│   └── App.jsx              # Roteamento
├── supabase-setup.sql       # Script SQL para configurar o banco
├── netlify.toml             # Configuração de deploy
└── .env.example             # Modelo de variáveis de ambiente
```

---

## ❓ Dúvidas frequentes

**Como adicionar jogos das oitavas/quartas?**
No painel admin do Supabase, vá em **Table Editor → matches** e adicione manualmente as partidas conforme forem definidas.

**Como compartilhar com os amigos?**
Envie o link do Netlify + o código do bolão que você definiu no `.env`.

**O site é gratuito?**
Sim! Netlify (gratuito até 100GB/mês) + Supabase (gratuito até 500MB banco) são mais que suficientes para um bolão.

---

Desenvolvido com React + Vite + Supabase + Tailwind CSS 💚💛
