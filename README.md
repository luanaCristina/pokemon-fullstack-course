# 🌐 Manual Integral de Desenvolvimento Web Full-Stack

## Pokémon Trading App — Projeto Educacional Gamificado

> **Prof. Dr. em Ciência da Computação** — Especialista em Desenvolvimento Web e Arquitetura Full-Stack

---

## 📋 Sobre o Projeto

Este projeto é uma **aplicação Full-Stack completa e gamificada** que serve como material didático para ensino de Desenvolvimento Web. Inclui:

- **Apresentação Online Interativa** (slides navegáveis com teclado)
- **Aplicação Web Completa** com autenticação, CRUD e sistema de trocas
- **Back-end em Node.js/Express** com API RESTful
- **Banco de Dados MySQL** com relacionamentos e integridade referencial
- **Front-end responsivo** com Bootstrap 5 e JavaScript assíncrono

---

## 🎮 Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| 🔐 Autenticação | Cadastro com sorteio de 3 Pokémons + Login/Logout com sessão |
| 📦 Coleção (CRUD) | Criar, listar, atualizar (treinar) e deletar (liberar) cards |
| 🔄 Mercado de Trocas | Ver Pokémons de outros treinadores e propor trocas |
| ⚔️ Batalha | Desafiar Pokémons selvagens e capturar novos (gamificação) |
| 📊 Slides | Apresentação online com 13 slides interativos |

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos

- macOS (ou Linux/Windows com adaptações)
- [Homebrew](https://brew.sh/) instalado (para macOS)
- Terminal / linha de comando

---

### Passo 1 — Instalar o Node.js

Se ainda não tiver o Node.js instalado:

```bash
# Instalar via Homebrew
brew install node

# Verificar a instalação
node --version   # Deve mostrar v18+
npm --version
```

---

### Passo 2 — Instalar o MySQL

```bash
# Instalar MySQL via Homebrew
brew install mysql

# Iniciar o serviço MySQL
brew services start mysql

# Verificar se está rodando
brew services list
# Deve mostrar: mysql started
```

---

### Passo 3 — Configurar a Senha do MySQL

```bash
# Executar o assistente de segurança
mysql_secure_installation
```

O assistente vai perguntar:

1. **Validate password component?** → `y`
2. **Password validation policy** → Digite `2` (STRONG)
3. **New password** → Use uma senha forte, ex: `Pokemon@2026`
   - Precisa ter: 8+ caracteres, maiúscula, minúscula, número e caractere especial
4. **Continue with password provided?** → `y`
5. **Remove anonymous users?** → `y`
6. **Disallow root login remotely?** → `y`
7. **Remove test database?** → `y`
8. **Reload privilege tables?** → `y`

---

### Passo 4 — Clonar e Instalar o Projeto

```bash
# Clonar o repositório
git clone https://github.com/luanaCristina/pokemon-fullstack-course.git
cd pokemon-fullstack-course

# Instalar dependências do Node.js
npm install
```

---

### Passo 5 — Criar o Banco de Dados

```bash
# Executar o script SQL que cria o banco e as tabelas
mysql -u root -p < database/schema.sql
# Quando pedir senha, digite a que você configurou (ex: Pokemon@2026)
```

---

### Passo 6 — Configurar a Senha no Projeto

Edite o arquivo `config/db.js` e coloque a senha que você definiu no MySQL:

```javascript
password: process.env.DB_PASS || 'SUA_SENHA_AQUI',
```

---

### Passo 7 — Iniciar o Servidor

```bash
# Modo produção
npm start

# Ou modo desenvolvimento (com hot-reload automático)
npm run dev
```

---

### Passo 8 — Acessar a Aplicação

Abra o navegador:

```
http://localhost:3000        → Aplicação (Login/Cadastro)
http://localhost:3000/slides → Apresentação Online (13 slides)
```

---

### Resolução de Problemas

| Problema | Solução |
|----------|---------|
| `command not found: mysql` | Instale: `brew install mysql` |
| `password does not satisfy policy` | Use senha com 8+ chars, maiúsc., minúsc., número e especial |
| `ECONNREFUSED` ao rodar o app | MySQL não está rodando: `brew services start mysql` |
| `ER_ACCESS_DENIED_ERROR` | Senha em `config/db.js` não confere com a do MySQL |
| `ER_BAD_DB_ERROR` | Execute: `mysql -u root -p < database/schema.sql` |

### Acessar a Aplicação

| URL | Descrição |
|-----|-----------|
| http://localhost:3000 | Aplicação principal (Login/Cadastro) |
| http://localhost:3000/slides | Apresentação Online (13 slides, navegar com ← →) |

---

## 📊 Apresentação Online (Slides)

A apresentação cobre todo o conteúdo do curso em **13 slides interativos**:

1. **Capa** — Título e boas-vindas
2. **Índice** — Conteúdo programático dos 4 módulos
3. **Arquitetura Cliente-Servidor** — Diagrama e explicação
4. **Protocolo HTTP** — Métodos e Códigos de Status
5. **HTML5 Semântico** — Tags com significado
6. **CSS3 Box Model e Flexbox** — Layout moderno
7. **Bootstrap 5 Grid** — Sistema responsivo de 12 colunas
8. **Node.js + Express** — Estrutura do Back-end
9. **MySQL** — Diagrama ER do banco de dados
10. **JavaScript Assíncrono** — Fetch API
11. **CRUD Completo** — Tabela de operações REST
12. **Passo a Passo** — Como desenvolver do zero
13. **Encerramento** — Resumo e próximos passos

**Navegação:** Use as setas do teclado ← → ou os botões na tela.

---

## 🏗️ Arquitetura do Projeto

```
/pokemon-fullstack-course
├── server.js              # Servidor Express + todas as rotas REST
├── package.json           # Dependências e scripts npm
├── /config
│   └── db.js             # Pool de conexão MySQL
├── /database
│   └── schema.sql        # DDL completo do banco de dados
├── /public               # Arquivos estáticos (Front-end)
│   ├── index.html        # Página principal da aplicação
│   ├── /css
│   │   └── style.css     # Estilos customizados
│   └── /js
│       └── app.js        # Lógica JavaScript do cliente
├── /slides
│   └── index.html        # Apresentação interativa (13 slides)
└── README.md             # Este arquivo
```

---

## 🔌 Integração com PokeAPI

O projeto consome dados reais da [PokeAPI](https://pokeapi.co/api/v2) para enriquecer a experiência:

### Endpoints da PokeAPI Utilizados

| Endpoint | Uso no Projeto |
|----------|---------------|
| `GET /pokemon/{name}` | Stats base, sprites oficiais (artwork), tipos e habilidades |
| `GET /pokemon-species/{name}` | Descrição (flavor_text) em português/inglês, cadeia de evolução URL |
| `GET /evolution-chain/{id}` | Cadeia completa de evolução para determinar a próxima forma |

### Como funciona

1. **Descrição (📖 botão nos cards):** Ao clicar, o servidor faz 2 chamadas à PokeAPI:
   - Busca o Pokémon → extrai sprites HD, stats, tipos e habilidades
   - Busca a species → extrai a descrição da Pokédex em português (fallback: inglês)

2. **Evolução (após 5 vitórias):** O servidor consulta a cadeia de evolução:
   - Busca a species do Pokémon atual → obtém URL da evolution-chain
   - Percorre a cadeia para encontrar a próxima forma
   - Busca os dados da evolução → retorna sprite, stats e tipo reais

3. **Sprites:** Usa o Official Artwork (`sprites.other.official-artwork.front_default`) como imagem principal no modal de descrição.

### Exemplo de Fluxo (Código Simplificado)

```javascript
// Servidor busca dados reais da PokeAPI
const pokeRes = await fetch('https://pokeapi.co/api/v2/pokemon/pikachu');
const pokeData = await pokeRes.json();

// Sprite HD oficial
const sprite = pokeData.sprites.other['official-artwork'].front_default;

// Stats (hp, attack, defense, etc)
const stats = {};
pokeData.stats.forEach(s => stats[s.stat.name] = s.base_stat);

// Busca descrição da Pokédex
const speciesRes = await fetch(pokeData.species.url);
const speciesData = await speciesRes.json();
const descricao = speciesData.flavor_text_entries
  .find(e => e.language.name === 'en').flavor_text;
```

---

## 🔌 API Endpoints

### Autenticação
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/cadastrar` | Cria conta + concede 3 Pokémons |
| POST | `/api/login` | Autentica usuário e cria sessão |
| POST | `/api/logout` | Encerra sessão |
| GET | `/api/sessao` | Verifica sessão ativa |

### CRUD de Pokémons
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/meus-pokemons` | Lista cards do usuário logado |
| POST | `/api/pokemons` | Cria novo card manualmente |
| PUT | `/api/pokemons/:id` | Atualiza nível/ataque/hp |
| DELETE | `/api/pokemons/:id` | Remove card da coleção |

### Trocas e Batalha
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/mercado` | Lista Pokémons de outros treinadores |
| POST | `/api/trocas/propor` | Propõe troca entre treinadores |
| POST | `/api/trocas/:id/aceitar` | Aceita e executa troca |
| POST | `/api/desafio/batalhar` | Batalha contra Pokémon selvagem |
| POST | `/api/desafio/capturar` | Captura Pokémon selvagem derrotado |
| POST | `/api/desafio/evoluir` | Evolui Pokémon (5 vitórias, dados da PokeAPI) |

### PokeAPI (Dados Externos)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/pokemon/descricao/:nome` | Busca descrição, stats e sprite HD da PokeAPI |
| GET | `/api/pokemon/evolucao/:nome` | Busca próxima evolução na cadeia evolutiva |

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia |
|--------|-----------|
| Front-end | HTML5, CSS3, JavaScript ES6+, Bootstrap 5 |
| Back-end | Node.js, Express.js |
| Banco de Dados | MySQL 8 (mysql2/promise) |
| Autenticação | express-session |
| Apresentação | HTML/CSS/JS puros (sem framework) |

---

## 📚 Conteúdo Didático (Módulos)

### Módulo 1 — Fundamentos da Web
- Arquitetura Cliente-Servidor
- Protocolo HTTP/HTTPS
- DNS e ciclo Request/Response
- Ambiente de desenvolvimento (VS Code, DevTools, Emmet)

### Módulo 2 — HTML5
- Tags semânticas (header, nav, main, section, article, footer)
- Formulários com validação nativa
- Acessibilidade e SEO

### Módulo 3 — CSS3 e Bootstrap
- Box Model e especificidade
- Flexbox e Grid Layout
- Bootstrap 5: Grid, Cards, Navbar, Modais

### Módulo 4 — Projeto Full-Stack
- MySQL: DDL, chaves primárias e estrangeiras
- Node.js + Express: API RESTful completa
- Transações e integridade de dados
- JavaScript assíncrono: fetch() + manipulação do DOM
- Gamificação: sistema de batalha e recompensas

---

## 📄 Licença

MIT License — Livre para uso educacional.
