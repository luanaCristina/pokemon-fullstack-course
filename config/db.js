// ============================================================================
// Conexão com Banco de Dados
// Suporta MySQL (local) e modo in-memory (deploy sem banco)
// ============================================================================

const isProduction = process.env.NODE_ENV === 'production';
const hasDBUrl = process.env.DATABASE_URL || process.env.DB_HOST;

let pool;

if (hasDBUrl || !isProduction) {
  // Modo MySQL (local ou com banco configurado)
  try {
    const mysql = require('mysql2/promise');

    const dbConfig = process.env.DATABASE_URL
      ? { uri: process.env.DATABASE_URL }
      : {
          host: process.env.DB_HOST || 'localhost',
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASS || 'Pokemon@2026',
          database: process.env.DB_NAME || 'pokemon_trading_db',
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0
        };

    pool = mysql.createPool(dbConfig);
    console.log('📦 Conectado ao MySQL');
  } catch (e) {
    console.log('⚠️ MySQL não disponível, usando modo in-memory');
    pool = null;
  }
}

// ============================================================================
// Fallback In-Memory (para deploy sem banco de dados)
// Permite que a Pokédex, slides e páginas estáticas funcionem online
// ============================================================================
if (!pool) {
  console.log('💾 Modo In-Memory ativado (funcionalidades que dependem de BD serão limitadas)');

  // Dados em memória
  const usuarios = [];
  const pokemons = [];
  const trocas = [];
  let nextUserId = 1;
  let nextPokeId = 1;
  let nextTrocaId = 1;

  // Simula a interface do mysql2/promise
  pool = {
    async execute(sql, params = []) {
      // INSERT INTO usuarios
      if (sql.includes('INSERT INTO usuarios')) {
        const user = { id: nextUserId++, nome: params[0], email: params[1], senha: params[2], criado_em: new Date() };
        if (usuarios.find(u => u.email === params[1])) {
          const err = new Error('Duplicate'); err.code = 'ER_DUP_ENTRY'; throw err;
        }
        usuarios.push(user);
        return [{ insertId: user.id, affectedRows: 1 }];
      }
      // SELECT usuarios (login)
      if (sql.includes('SELECT') && sql.includes('usuarios') && sql.includes('email')) {
        const found = usuarios.filter(u => u.email === params[0] && u.senha === params[1]);
        return [found];
      }
      // SELECT usuario by id
      if (sql.includes('SELECT') && sql.includes('usuarios') && sql.includes('WHERE id')) {
        const found = usuarios.filter(u => u.id === params[0]);
        return [found];
      }
      // UPDATE usuarios (perfil)
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
        const found = pokemons.filter(p => p.usuario_id === params[0]).reverse();
        return [found];
      }
      // SELECT pokemons by id and user
      if (sql.includes('SELECT') && sql.includes('pokemons') && sql.includes('id = ?') && sql.includes('usuario_id')) {
        const found = pokemons.filter(p => p.id === params[0] && p.usuario_id === params[1]);
        return [found];
      }
      // UPDATE pokemons
      if (sql.includes('UPDATE pokemons') && sql.includes('nivel')) {
        const poke = pokemons.find(p => p.id === Number(params[3]) && p.usuario_id === params[4]);
        if (poke) { poke.nivel = params[0]; poke.ataque = params[1]; poke.hp = params[2]; }
        return [{ affectedRows: poke ? 1 : 0 }];
      }
      if (sql.includes('UPDATE pokemons') && sql.includes('vitorias')) {
        const poke = pokemons.find(p => p.id === params[1]);
        if (poke) poke.vitorias = params[0];
        return [{ affectedRows: 1 }];
      }
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
      // MERCADO (pokemons de outros)
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
