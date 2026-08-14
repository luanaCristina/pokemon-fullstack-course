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

- [Node.js](https://nodejs.org/) v18+ instalado
- [MySQL](https://dev.mysql.com/downloads/) 8.0+ instalado e rodando
- Terminal / linha de comando

### Passo a Passo

```bash
# 1. Clone o repositório
git clone https://github.com/SEU_USUARIO/pokemon-fullstack-course.git
cd pokemon-fullstack-course

# 2. Instale as dependências
npm install

# 3. Configure o Banco de Dados MySQL
# Abra o MySQL e execute o script:
mysql -u root -p < database/schema.sql

# Ou copie e cole o conteúdo de database/schema.sql no MySQL Workbench

# 4. (Opcional) Configure variáveis de ambiente
# Crie um arquivo .env ou edite config/db.js com suas credenciais MySQL

# 5. Inicie o servidor
npm start

# Ou em modo de desenvolvimento (com hot-reload):
npm run dev
```

### Acessar a Aplicação

| URL | Descrição |
|-----|-----------|
| http://localhost:3000 | Aplicação principal (Login/Cadastro) |
| http://localhost:3000/slides | Apresentação Online (13 slides) |

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
