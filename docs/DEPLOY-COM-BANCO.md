# 🗄️ Deploy com Banco de Dados MySQL na Nuvem (Gratuito)

## Por que precisamos de um banco na nuvem?

Quando fazemos deploy no Render/Railway, nosso servidor Node.js fica online, mas ele precisa de um **banco MySQL** para guardar os dados dos usuários e pokémons.

Existem duas situações:

| Modo | Quando usar | Dados persistem? |
|------|------------|-----------------|
| 🗄️ **MySQL Real** | Local + Deploy com banco | ✅ Sim, ficam salvos |
| 💾 **In-Memory (fallback)** | Deploy sem banco | ❌ Não, somem ao reiniciar |

**Para ensino completo, use MySQL real (TiDB Cloud gratuito).**

---

## 🆓 TiDB Cloud Starter (MySQL Gratuito na Nuvem)

**O que é?** Um banco MySQL compatível, hospedado na nuvem pela PingCAP.

**Free Tier:** 5GB de armazenamento + 50 milhões de requisições/mês.

**Funciona com mysql2?** ✅ Sim! Usa o mesmo driver do MySQL.

---

## 📋 Passo a Passo: Configurar TiDB Cloud

### 1️⃣ Criar Conta

1. Acesse: **https://tidbcloud.com**
2. Clique em **"Start Free"**
3. Crie conta com Google ou GitHub

### 2️⃣ Criar Cluster (Banco)

1. No dashboard, clique **"Create Cluster"**
2. Selecione **"Starter"** (gratuito)
3. Escolha a região mais próxima (ex: `us-east-1`)
4. Nomeie: `pokemon-trading-db`
5. Clique **"Create"** — aguarde ~30 segundos

### 3️⃣ Definir Senha

1. Após criar, vá em **"Connect"** no cluster
2. Defina uma senha para o usuário root
3. **Anote a senha!** Exemplo: `TiDB@Pokemon2026`

### 4️⃣ Obter a URL de Conexão

1. Em "Connect", selecione **"General"** como método
2. Selecione **"Node.js"** como framework
3. Copie a `DATABASE_URL`, que será algo como:

```
mysql://root:SUA_SENHA@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/pokemon_trading_db?ssl={"rejectUnauthorized":true}
```

### 5️⃣ Criar as Tabelas no TiDB

1. No dashboard do TiDB, clique em **"SQL Editor"**
2. Cole e execute o conteúdo do arquivo `database/schema.sql`
3. Verifique se as 3 tabelas foram criadas (usuarios, pokemons, trocas)

### 6️⃣ Configurar no Deploy (Render)

1. No Render, vá em seu Web Service
2. Clique em **"Environment"**
3. Adicione a variável:
   - **Key:** `DATABASE_URL`
   - **Value:** `mysql://root:SUA_SENHA@gateway01...tidbcloud.com:4000/pokemon_trading_db`
4. Clique **"Save Changes"**
5. O Render reinicia automaticamente e conecta ao banco!

---

## 🔄 Como o Código Decide Qual Usar?

```javascript
// config/db.js - Lógica de decisão:

// 1. Se existe DATABASE_URL no ambiente → usa banco na nuvem
if (process.env.DATABASE_URL) {
  pool = mysql.createPool(process.env.DATABASE_URL);
  // Conecta no TiDB Cloud!
}

// 2. Se não existe DATABASE_URL → tenta MySQL local
else {
  pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Pokemon@2026',
    database: 'pokemon_trading_db'
  });
  // Conecta no MySQL da sua máquina!
}

// 3. Se MySQL local TAMBÉM não existe → modo in-memory
// (fallback para demonstração online)
```

---

## 💾 O que é o Modo In-Memory (Fallback)?

### Explicação Simples

Imagine que o banco de dados é um **caderno onde você anota tudo**. Os dados ficam lá mesmo se você fechar o caderno.

O modo in-memory é como um **quadro branco** — você escreve, mas quando apagar (reiniciar o servidor), tudo some.

### Quando é ativado?

Automaticamente quando:
- Não existe `DATABASE_URL` configurada
- E o MySQL local não está rodando
- Ou se configurar `FORCE_MEMORY=true`

### O que funciona?

| Funcionalidade | Funciona? | Por quê? |
|---|---|---|
| Cadastrar/Login | ✅ | Guarda na memória temporariamente |
| Ver/Criar Pokémons | ✅ | Guarda na memória |
| Pokédex (PokeAPI) | ✅ | Não usa banco (busca na API direto) |
| Slides | ✅ | São arquivos estáticos |
| Dados após reiniciar | ❌ | Memória RAM é volátil |

### Por que existe?

Para que o site fique **online e acessível** mesmo sem pagar por um banco na nuvem. Os alunos podem:
1. Ver os slides ✅
2. Usar a Pokédex ✅
3. Jogar "Quem é esse Pokémon?" ✅
4. Testar Login/CRUD (dados temporários) ✅

---

## 📊 Resumo: As 3 Formas de Rodar

### 1. Local com MySQL (modo ideal para aprender)
```bash
npm run dev
# Banco: MySQL local → dados persistentes
# URL: http://localhost:3000
```

### 2. Online com TiDB Cloud (modo produção gratuito)
```bash
# No Render, configure:
# DATABASE_URL = mysql://root:senha@tidb.cloud:4000/pokemon_trading_db
# Banco: TiDB Cloud → dados persistentes na nuvem!
```

### 3. Online sem banco (modo demonstração)
```bash
# No Render, NÃO configure DATABASE_URL
# Banco: In-Memory → dados temporários
# Pokédex, Slides e Jogo funcionam 100%
```

---

## ❓ Perguntas Frequentes

**P: Qual a diferença entre MySQL local e TiDB Cloud?**
R: Nenhuma para o código! Ambos usam SQL e o driver mysql2. A diferença é onde o banco roda (sua máquina vs nuvem).

**P: TiDB Cloud é realmente gratuito?**
R: Sim. O plano Starter dá 5GB + 50M requests/mês. Mais que suficiente para projetos educacionais.

**P: Posso usar outro banco na nuvem?**
R: Sim! Alternativas: Railway (MySQL addon), Aiven (MySQL free), ou até converter para PostgreSQL com Neon/Supabase.

**P: O modo in-memory é inseguro?**
R: Não é questão de segurança, é de persistência. Os dados simplesmente somem ao reiniciar. Para um app real, SEMPRE use um banco de dados real.
