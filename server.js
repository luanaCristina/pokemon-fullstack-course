const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/slides', express.static(path.join(__dirname, 'slides')));

// Configuração da Sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'chave_secreta_pokemon_2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 }
}));

// Middleware de Autenticação
function autenticarSessao(req, res, next) {
  if (req.session && req.session.usuarioId) {
    return next();
  }
  return res.status(401).json({ erro: 'Acesso negado. Realize o login.' });
}

// Pokémons Iniciais para Sorteio
const POKEMONS_INICIAIS = [
  { nome: 'Bulbasaur', tipo: 'Planta', ataque: 49, hp: 45, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png' },
  { nome: 'Charmander', tipo: 'Fogo', ataque: 52, hp: 39, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png' },
  { nome: 'Squirtle', tipo: 'Água', ataque: 48, hp: 44, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png' },
  { nome: 'Pikachu', tipo: 'Elétrico', ataque: 55, hp: 35, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png' },
  { nome: 'Eevee', tipo: 'Normal', ataque: 55, hp: 55, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png' },
  { nome: 'Jigglypuff', tipo: 'Normal', ataque: 45, hp: 115, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png' },
  { nome: 'Geodude', tipo: 'Pedra', ataque: 80, hp: 40, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/74.png' }
];

// ============================================================================
// ROTAS DE AUTENTICAÇÃO
// ============================================================================

// POST /api/cadastrar
app.post('/api/cadastrar', async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
  }

  const conexao = await db.getConnection();

  try {
    await conexao.beginTransaction();

    const [resultUser] = await conexao.execute(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, senha]
    );

    const novoUsuarioId = resultUser.insertId;

    // Sorteia 3 Pokémons sem repetição
    const pokemonsSorteados = [...POKEMONS_INICIAIS]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    for (let poke of pokemonsSorteados) {
      await conexao.execute(
        'INSERT INTO pokemons (usuario_id, nome, tipo, nivel, ataque, hp, sprite_url) VALUES (?, ?, ?, 1, ?, ?, ?)',
        [novoUsuarioId, poke.nome, poke.tipo, poke.ataque, poke.hp, poke.sprite]
      );
    }

    await conexao.commit();
    res.status(201).json({ mensagem: 'Treinador cadastrado! 3 Pokémons concedidos.' });

  } catch (erro) {
    await conexao.rollback();
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ erro: 'E-mail já cadastrado.' });
    }
    res.status(500).json({ erro: 'Erro interno ao cadastrar.' });
  } finally {
    conexao.release();
  }
});

// POST /api/login
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const [linhas] = await db.execute(
      'SELECT id, nome, email FROM usuarios WHERE email = ? AND senha = ?',
      [email, senha]
    );

    if (linhas.length === 0) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const usuario = linhas[0];
    req.session.usuarioId = usuario.id;
    req.session.usuarioNome = usuario.nome;

    res.json({ mensagem: 'Login realizado!', usuario });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro no login.' });
  }
});

// POST /api/logout
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ mensagem: 'Sessão encerrada.' });
});

// GET /api/sessao
app.get('/api/sessao', (req, res) => {
  if (req.session && req.session.usuarioId) {
    return res.json({ logado: true, nome: req.session.usuarioNome, id: req.session.usuarioId });
  }
  res.json({ logado: false });
});

// ============================================================================
// CRUD DE POKÉMONS
// ============================================================================

// READ
app.get('/api/meus-pokemons', autenticarSessao, async (req, res) => {
  try {
    const [pokemons] = await db.execute(
      'SELECT * FROM pokemons WHERE usuario_id = ? ORDER BY id DESC',
      [req.session.usuarioId]
    );
    res.json(pokemons);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar Pokémons.' });
  }
});

// CREATE
app.post('/api/pokemons', autenticarSessao, async (req, res) => {
  const { nome, tipo, nivel, ataque, hp, sprite_url } = req.body;

  try {
    const [result] = await db.execute(
      'INSERT INTO pokemons (usuario_id, nome, tipo, nivel, ataque, hp, sprite_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.session.usuarioId, nome, tipo, nivel || 1, ataque, hp, sprite_url]
    );

    res.status(201).json({ id: result.insertId, mensagem: 'Card criado!' });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao criar card.' });
  }
});

// UPDATE
app.put('/api/pokemons/:id', autenticarSessao, async (req, res) => {
  const { id } = req.params;
  const { nivel, ataque, hp } = req.body;

  try {
    const [result] = await db.execute(
      'UPDATE pokemons SET nivel = ?, ataque = ?, hp = ? WHERE id = ? AND usuario_id = ?',
      [nivel, ataque, hp, id, req.session.usuarioId]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ erro: 'Operação não permitida.' });
    }

    res.json({ mensagem: 'Pokémon atualizado!' });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao atualizar.' });
  }
});

// DELETE
app.delete('/api/pokemons/:id', autenticarSessao, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute(
      'DELETE FROM pokemons WHERE id = ? AND usuario_id = ?',
      [id, req.session.usuarioId]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ erro: 'Operação não permitida.' });
    }

    res.json({ mensagem: 'Pokémon liberado!' });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao deletar.' });
  }
});

// ============================================================================
// MÓDULO DE TROCAS
// ============================================================================

// Listar todos os Pokémons disponíveis para troca (de outros treinadores)
app.get('/api/mercado', autenticarSessao, async (req, res) => {
  try {
    const [pokemons] = await db.execute(
      'SELECT p.*, u.nome as treinador FROM pokemons p JOIN usuarios u ON p.usuario_id = u.id WHERE p.usuario_id != ? ORDER BY p.id DESC',
      [req.session.usuarioId]
    );
    res.json(pokemons);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar mercado.' });
  }
});

// Propor troca
app.post('/api/trocas/propor', autenticarSessao, async (req, res) => {
  const { pokemonOfertadoId, pokemonDesejadoId } = req.body;

  try {
    await db.execute(
      'INSERT INTO trocas (pokemon_ofertado_id, pokemon_desejado_id, status) VALUES (?, ?, "PENDENTE")',
      [pokemonOfertadoId, pokemonDesejadoId]
    );
    res.status(201).json({ mensagem: 'Proposta enviada!' });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao propor troca.' });
  }
});

// Aceitar troca
app.post('/api/trocas/:id/aceitar', autenticarSessao, async (req, res) => {
  const { id } = req.params;
  const conexao = await db.getConnection();

  try {
    await conexao.beginTransaction();

    const [trocas] = await conexao.execute(
      'SELECT * FROM trocas WHERE id = ? AND status = "PENDENTE"', [id]
    );

    if (trocas.length === 0) {
      return res.status(404).json({ erro: 'Proposta não encontrada.' });
    }

    const troca = trocas[0];

    const [poke1] = await conexao.execute('SELECT usuario_id FROM pokemons WHERE id = ?', [troca.pokemon_ofertado_id]);
    const [poke2] = await conexao.execute('SELECT usuario_id FROM pokemons WHERE id = ?', [troca.pokemon_desejado_id]);

    const dono1Id = poke1[0].usuario_id;
    const dono2Id = poke2[0].usuario_id;

    await conexao.execute('UPDATE pokemons SET usuario_id = ? WHERE id = ?', [dono2Id, troca.pokemon_ofertado_id]);
    await conexao.execute('UPDATE pokemons SET usuario_id = ? WHERE id = ?', [dono1Id, troca.pokemon_desejado_id]);
    await conexao.execute('UPDATE trocas SET status = "ACEITA" WHERE id = ?', [id]);

    await conexao.commit();
    res.json({ mensagem: 'Troca concluída!' });

  } catch (erro) {
    await conexao.rollback();
    res.status(500).json({ erro: 'Falha na troca.' });
  } finally {
    conexao.release();
  }
});

// ============================================================================
// MÓDULO DE BATALHA
// ============================================================================

app.post('/api/desafio/batalhar', autenticarSessao, async (req, res) => {
  const { meuPokemonId } = req.body;

  try {
    const [pokemons] = await db.execute(
      'SELECT * FROM pokemons WHERE id = ? AND usuario_id = ?',
      [meuPokemonId, req.session.usuarioId]
    );

    if (pokemons.length === 0) {
      return res.status(404).json({ erro: 'Pokémon não encontrado.' });
    }

    const meuPokemon = pokemons[0];
    const ataqueSelvagem = Math.floor(Math.random() * 70) + 10;
    const vitoria = meuPokemon.ataque > ataqueSelvagem;

    if (vitoria) {
      const premios = [
        { nome: 'Mewtwo', tipo: 'Psíquico', ataque: 110, hp: 106, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png' },
        { nome: 'Dragonite', tipo: 'Dragão', ataque: 134, hp: 91, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png' },
        { nome: 'Gengar', tipo: 'Fantasma', ataque: 65, hp: 60, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png' }
      ];

      const premio = premios[Math.floor(Math.random() * premios.length)];

      await db.execute(
        'INSERT INTO pokemons (usuario_id, nome, tipo, nivel, ataque, hp, sprite_url) VALUES (?, ?, ?, 50, ?, ?, ?)',
        [req.session.usuarioId, premio.nome, premio.tipo, premio.ataque, premio.hp, premio.sprite]
      );

      return res.json({
        resultado: 'VITÓRIA',
        mensagem: `Seu ${meuPokemon.nome} (Ataque: ${meuPokemon.ataque}) venceu o Selvagem (Ataque: ${ataqueSelvagem}). Capturou um ${premio.nome}!`,
        vitoria: true
      });
    }

    res.json({
      resultado: 'DERROTA',
      mensagem: `O Selvagem (Ataque: ${ataqueSelvagem}) era mais forte que ${meuPokemon.nome} (Ataque: ${meuPokemon.ataque}). Treine mais!`,
      vitoria: false
    });

  } catch (erro) {
    res.status(500).json({ erro: 'Erro na batalha.' });
  }
});

// Inicialização
app.listen(PORT, () => {
  console.log(`🚀 Pokémon Trading App rodando em http://localhost:${PORT}`);
  console.log(`📊 Apresentação em http://localhost:${PORT}/slides`);
});
