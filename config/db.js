// ============================================================================
// CONEXÃO COM BANCO DE DADOS — Explicação Didática
// ============================================================================
//
// Este arquivo tem DUAS formas de funcionar:
//
// 1️⃣ MODO MYSQL (Padrão) — Usa um banco de dados real
//    → Quando: Rodar local com MySQL OU deploy com TiDB Cloud
//    → Como ativa: Tendo MySQL rodando ou variáveis de ambiente configuradas
//    → Resultado: Dados persistem (ficam salvos mesmo reiniciando)
//
// 2️⃣ MODO IN-MEMORY (Fallback) — Simula o banco na memória RAM
//    → Quando: Deploy sem banco configurado (ex: Render free sem addon)
//    → Como ativa: Automaticamente se MySQL não estiver acessível
//    → Resultado: Dados somem ao reiniciar (temporários)
//
// Para os ALUNOS: O modo MySQL é o correto para aprender.
// O fallback existe apenas para que o site fique online sem custo.
// ============================================================================

const mysql = require('mysql2/promise');

// ============================================================================
// CONFIGURAÇÃO DO MYSQL
// Prioridade: DATABASE_URL > variáveis individuais > padrão local
// ============================================================================

const dbConfig = process.env.DATABASE_URL
  ? {
      // Modo URL (TiDB Cloud, Railway, PlanetScale)
      // O formato é: mysql://user:password@host:port/database
      uri: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: true } // TiDB exige SSL
    }
  : {
      // Modo local (MySQL instalado na máquina)
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || 'Pokemon@2026',
      database: process.env.DB_NAME || 'pokemon_trading_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };

// ============================================================================
// CRIAÇÃO DO POOL DE CONEXÃO
// ============================================================================

let pool;

try {
  if (process.env.DATABASE_URL) {
    // Conexão via URL (serviços cloud)
    pool = mysql.createPool(process.env.DATABASE_URL);
    console.log('☁️  Conectado ao MySQL na nuvem (TiDB/Railway)');
  } else {
    pool = mysql.createPool(dbConfig);
    console.log('📦 Conectado ao MySQL local');
  }
} catch (e) {
  console.error('❌ Erro ao criar pool MySQL:', e.message);
  pool = null;
}

// ============================================================================
// FALLBACK IN-MEMORY (quando MySQL não está disponível)
// ============================================================================
//
// O QUE É ISSO?
// É uma simulação do banco de dados que roda apenas na memória RAM.
// Serve para que o site funcione online mesmo sem MySQL configurado.
//
// COMO FUNCIONA?
// Em vez de usar tabelas SQL reais, usamos arrays JavaScript.
// As funções simulam INSERT, SELECT, UPDATE e DELETE.
//
// LIMITAÇÕES:
// - Dados SOMEM ao reiniciar o servidor
// - Não tem validações SQL reais (UNIQUE, FK, etc)
// - Apenas para demonstração e funcionalidades básicas
//
// QUANDO USAR?
// - Deploy rápido no Render/Railway sem addon de banco
// - Demonstrar que o site funciona para slides/pokédex
// - NUNCA em produção real!
// ============================================================================

if (!pool || process.env.FORCE_MEMORY === 'true') {
  console.log('💾 Modo In-Memory ativado');
  console.log('   → Pokédex, Slides e Jogo funcionam normalmente');
  console.log('   → Login/CRUD funcionam mas dados são temporários');
  console.log('   → Para persistência, configure DATABASE_URL');

  const usuarios = [];
  const pokemons = [];
  let nextUserId = 1;
  let nextPokeId = 1;

  pool = {
    async execute(sql, params = []) {
      // INSERT INTO usuarios
      if (sql.includes('INSERT INTO usuarios')) {
        if (usuarios.find(u => u.email === params[1])) {
          const err = new Error('Duplicate'); err.code = 'ER_DUP_ENTRY'; throw err;
        }
        const user = { id: nextUserId++, nome: params[0], email: params[1], senha: params[2], criado_em: new Date() };
        usuarios.push(user);
        return [{ insertId: user.id, affectedRows: 1 }];
      }
      // SELECT usuarios (login)
      if (sql.includes('SELECT') && sql.includes('usuarios') && sql.includes('email = ?') && sql.includes('senha')) {
        return [usuarios.filter(u => u.email === params[0] && u.senha === params[1])];
      }
      // SELECT usuario by id (perfil)
      if (sql.includes('SELECT') && sql.includes('usuarios') && sql.includes('WHERE id')) {
        return [usuarios.filter(u => u.id === params[0])];
      }
      // UPDATE usuarios
      if (sql.includes('UPDATE usuarios')) {
        const user = usuarios.find(u => u.id === params[params.length - 1]);
        if (user) { user.nome = params[0]; user.email = params[1]; if (params.length > 3) user.senha = params[2]; }
        return [{ affectedRows: user ? 1 : 0 }];
      }
      // INSERT INTO pokemons
      if (sql.includes('INSERT INTO pokemons')) {
        const poke = { id: nextPokeId++, usuario_id: params[0], nome: params[1], tipo: params[2], nivel: params[3] || 1, ataque: params[4] || params[3], hp: params[5] || params[4], sprite_url: params[6] || params[5], vitorias: 0 };
        pokemons.push(poke);
        return [{ insertId: poke.id, affectedRows: 1 }];
      }
      // SELECT pokemons by user
      if (sql.includes('SELECT') && sql.includes('pokemons') && sql.includes('usuario_id = ?') && !sql.includes('JOIN')) {
        return [pokemons.filter(p => p.usuario_id === params[0]).reverse()];
      }
      // SELECT pokemon by id + user
      if (sql.includes('SELECT') && sql.includes('pokemons') && sql.includes('id = ?') && sql.includes('usuario_id')) {
        return [pokemons.filter(p => p.id === Number(params[0]) && p.usuario_id === params[1])];
      }
      // UPDATE pokemons (treinar)
      if (sql.includes('UPDATE pokemons') && sql.includes('nivel')) {
        const poke = pokemons.find(p => p.id === Number(params[3]) && p.usuario_id === params[4]);
        if (poke) { poke.nivel = params[0]; poke.ataque = params[1]; poke.hp = params[2]; }
        return [{ affectedRows: poke ? 1 : 0 }];
      }
      // UPDATE pokemons (vitorias)
      if (sql.includes('UPDATE pokemons') && sql.includes('vitorias')) {
        const poke = pokemons.find(p => p.id === params[1]);
        if (poke) poke.vitorias = params[0];
        return [{ affectedRows: 1 }];
      }
      // UPDATE pokemons (evoluir)
      if (sql.includes('UPDATE pokemons SET nome')) {
        const poke = pokemons.find(p => p.id === params[params.length - 1]);
        if (poke) { poke.nome = params[0]; poke.tipo = params[1]; poke.ataque = params[2]; poke.hp = params[3]; poke.sprite_url = params[4]; poke.nivel += 10; poke.vitorias = 0; }
        return [{ affectedRows: poke ? 1 : 0 }];
      }
      // DELETE pokemons
      if (sql.includes('DELETE FROM pokemons')) {
        const idx = pokemons.findIndex(p => p.id === Number(params[0]) && p.usuario_id === params[1]);
        if (idx >= 0) { pokemons.splice(idx, 1); return [{ affectedRows: 1 }]; }
        return [{ affectedRows: 0 }];
      }
      // MERCADO
      if (sql.includes('JOIN') && sql.includes('usuarios')) {
        const found = pokemons.filter(p => p.usuario_id !== params[0]).map(p => {
          const u = usuarios.find(usr => usr.id === p.usuario_id);
          return { ...p, treinador: u ? u.nome : 'Desconhecido' };
        });
        return [found];
      }
      return [[]];
    },
    async getConnection() {
      return {
        async execute(sql, params) { return pool.execute(sql, params); },
        async beginTransaction() {},
        async commit() {},
        async rollback() {},
        release() {}
      };
    }
  };
}

module.exports = pool;
