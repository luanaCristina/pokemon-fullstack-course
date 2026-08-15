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

// Descrições dos Pokémons
const DESCRICOES_POKEMON = {
  'Bulbasaur': 'Uma semente estranha foi plantada em suas costas ao nascer. A planta brota e cresce com ele.',
  'Ivysaur': 'Quando a flor em suas costas começa a liberar um aroma adocicado, é sinal de que vai florescer em breve.',
  'Venusaur': 'A planta floresce ao absorver energia solar. Ele é frequentemente encontrado em busca de luz solar.',
  'Charmander': 'A chama em sua cauda indica sua força vital. Se ele estiver saudável, a chama queima intensamente.',
  'Charmeleon': 'Tem um temperamento feroz. Na emoção da batalha, expele chamas azuladas intensas.',
  'Charizard': 'Cospe fogo tão quente que derrete rochas. É conhecido por causar incêndios florestais sem querer.',
  'Squirtle': 'Após nascer, suas costas incham e endurecem em uma carapaça. Ele espirra água com força pela boca.',
  'Wartortle': 'É reconhecido como um símbolo de longevidade. Suas orelhas e cauda peludas servem para equilíbrio.',
  'Blastoise': 'Ele esmaga seus inimigos com seu peso corporal. Em apuros, ele se esconde dentro de sua carapaça.',
  'Pikachu': 'Quando vários destes Pokémon se reúnem, a eletricidade deles pode causar tempestades de raios.',
  'Raichu': 'Sua cauda longa serve como fio-terra para se proteger de sua própria eletricidade de alta voltagem.',
  'Eevee': 'Possui um código genético irregular que permite evoluir em múltiplas formas de acordo com seu ambiente.',
  'Flareon': 'Possui uma bolsa de fogo dentro do corpo. Após uma respiração profunda, solta chamas de 1700°C.',
  'Jigglypuff': 'Quando seus olhos grandes e redondos se iluminam, ele canta uma melodia misteriosa que adormece todos.',
  'Wigglytuff': 'Seu corpo é muito elástico. Quando inspira profundamente, pode inflar-se até tamanhos impressionantes.',
  'Geodude': 'Encontrado frequentemente em caminhos de montanha. Se você pisar em um por engano, ele fica furioso.',
  'Graveler': 'Ele rola montanha abaixo para se mover. Ele esmaga tudo que está em seu caminho sem parar.',
  'Golem': 'Seu corpo é coberto por uma armadura rochosa extremamente dura. Ele troca de pele uma vez por ano.',
  'Rattata': 'Cauteloso ao extremo, mesmo dormindo ele mexe as orelhas para ouvir sons ao redor.',
  'Pidgey': 'Um Pokémon muito dócil. Se atacado, frequentemente atira areia para se proteger ao invés de revidar.',
  'Zubat': 'Forma colônias em cavernas escuras. Usa ondas ultrassônicas para detectar obstáculos durante o voo.',
  'Machop': 'Treina praticando todas as formas de artes marciais. Seu corpo é completamente feito de músculos.',
  'Abra': 'Dorme 18 horas por dia. Mesmo dormindo, consegue sentir perigo e se teletransportar para fugir.',
  'Gastly': 'Nascido de gases venenosos. Pode derrubar um elefante indiano em 2 segundos com seu gás tóxico.',
  'Gengar': 'Esconde-se na sombra das pessoas. A queda de temperatura que você sente é sinal de sua presença.',
  'Mega Gengar': 'Ao mega-evoluir, seu poder paranormal se intensifica. Ele pode amaldiçoar qualquer um com um olhar.',
  'Onix': 'Conforme cresce, seu corpo rochoso endurece como diamante. Pode cavar túneis a 80km/h.',
  'Scyther': 'Com suas garras afiadas como foices, pode cortar troncos grossos em um único golpe.',
  'Magikarp': 'Famoso por ser inútil. Só consegue usar Splash. No entanto, é na verdade muito resistente.',
  'Dratini': 'Um Pokémon místico e raro. Troca de pele constantemente e se esconde atrás de cascatas.',
  'Dragonite': 'Dizem que ele voa pelos oceanos. Sua inteligência rivaliza com a de humanos.',
  'Dragonite Mega': 'Uma forma lendária que poucos treinadores já presenciaram. Seu poder é imensurável.',
  'Mewtwo': 'Criado por manipulação genética. Porém, os cientistas falharam em dotá-lo de um coração bondoso.',
  'Mewtwo Mega': 'Na mega-evolução, todo seu poder psíquico se concentra. Capaz de destruir montanhas com o pensamento.'
};

// GET /api/pokemon/descricao/:nome - Busca descrição e dados da PokeAPI
app.get('/api/pokemon/descricao/:nome', async (req, res) => {
  const nome = req.params.nome.toLowerCase().replace(/ /g, '-');

  try {
    // Busca dados básicos do Pokémon
    const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${nome}`);

    if (!pokeRes.ok) {
      return res.json({
        nome: req.params.nome,
        descricao: 'Descrição não disponível para este Pokémon.',
        sprite: null,
        tipos: [],
        stats: {}
      });
    }

    const pokeData = await pokeRes.json();

    // Busca a species para pegar a descrição em português
    const speciesRes = await fetch(pokeData.species.url);
    const speciesData = await speciesRes.json();

    // Procura descrição em português, fallback para inglês
    let descricao = '';
    const flavorEntries = speciesData.flavor_text_entries || [];
    const ptEntry = flavorEntries.find(e => e.language.name === 'pt-BR' || e.language.name === 'pt');
    const enEntry = flavorEntries.find(e => e.language.name === 'en');

    if (ptEntry) {
      descricao = ptEntry.flavor_text.replace(/\n|\f/g, ' ');
    } else if (enEntry) {
      descricao = enEntry.flavor_text.replace(/\n|\f/g, ' ');
    } else {
      descricao = 'Descrição não disponível.';
    }

    // Extrai stats
    const stats = {};
    pokeData.stats.forEach(s => {
      stats[s.stat.name] = s.base_stat;
    });

    // Extrai tipos
    const tipos = pokeData.types.map(t => t.type.name);

    // Extrai habilidades
    const habilidades = pokeData.abilities.map(a => a.ability.name);

    // Sprite oficial (artwork se disponível, senão sprite padrão)
    const sprite = pokeData.sprites.other['official-artwork'].front_default
      || pokeData.sprites.front_default;

    res.json({
      nome: pokeData.name,
      nomeOriginal: req.params.nome,
      descricao,
      sprite,
      spriteAnimado: pokeData.sprites.other.showdown?.front_default || pokeData.sprites.front_default,
      tipos,
      habilidades,
      stats,
      peso: pokeData.weight / 10,
      altura: pokeData.height / 10,
      id: pokeData.id
    });

  } catch (erro) {
    console.error('Erro ao consultar PokeAPI:', erro.message);
    res.json({
      nome: req.params.nome,
      descricao: 'Erro ao buscar dados do Pokémon na PokeAPI.',
      sprite: null,
      tipos: [],
      stats: {}
    });
  }
});

// GET /api/pokemon/evolucao/:nome - Busca cadeia de evolução da PokeAPI
app.get('/api/pokemon/evolucao/:nome', async (req, res) => {
  const nome = req.params.nome.toLowerCase().replace(/ /g, '-');

  try {
    const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${nome}`);
    if (!speciesRes.ok) {
      return res.json({ evolucao: null, mensagem: 'Pokémon não encontrado na PokeAPI.' });
    }

    const speciesData = await speciesRes.json();
    const evoChainRes = await fetch(speciesData.evolution_chain.url);
    const evoChainData = await evoChainRes.json();

    // Percorre a cadeia para encontrar a próxima evolução
    let proximaEvolucao = null;

    function percorrerCadeia(chain) {
      if (chain.species.name === nome) {
        if (chain.evolves_to && chain.evolves_to.length > 0) {
          proximaEvolucao = chain.evolves_to[0].species.name;
        }
        return;
      }
      if (chain.evolves_to) {
        chain.evolves_to.forEach(evo => percorrerCadeia(evo));
      }
    }

    percorrerCadeia(evoChainData.chain);

    if (!proximaEvolucao) {
      return res.json({ evolucao: null, mensagem: 'Este Pokémon já está em sua forma final.' });
    }

    // Busca dados da evolução
    const evoPokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${proximaEvolucao}`);
    const evoPokeData = await evoPokeRes.json();

    const stats = {};
    evoPokeData.stats.forEach(s => {
      stats[s.stat.name] = s.base_stat;
    });

    const sprite = evoPokeData.sprites.other['official-artwork'].front_default
      || evoPokeData.sprites.front_default;

    res.json({
      evolucao: {
        nome: proximaEvolucao.charAt(0).toUpperCase() + proximaEvolucao.slice(1),
        tipo: evoPokeData.types[0].type.name,
        ataque: stats.attack || 50,
        hp: stats.hp || 50,
        sprite: sprite,
        spritePadrao: evoPokeData.sprites.front_default,
        stats
      }
    });

  } catch (erro) {
    console.error('Erro na cadeia de evolução:', erro.message);
    res.json({ evolucao: null, mensagem: 'Erro ao buscar evolução.' });
  }
});

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

// GET /api/perfil - Buscar dados do perfil do usuário logado
app.get('/api/perfil', autenticarSessao, async (req, res) => {
  try {
    const [linhas] = await db.execute(
      'SELECT id, nome, email, criado_em FROM usuarios WHERE id = ?',
      [req.session.usuarioId]
    );

    if (linhas.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    res.json(linhas[0]);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar perfil.' });
  }
});

// PUT /api/perfil - Atualizar dados do perfil
app.put('/api/perfil', autenticarSessao, async (req, res) => {
  const { nome, email, senhaAtual, novaSenha } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ erro: 'Nome e e-mail são obrigatórios.' });
  }

  try {
    // Se quiser trocar a senha, valida a senha atual
    if (novaSenha) {
      if (!senhaAtual) {
        return res.status(400).json({ erro: 'Informe a senha atual para alterá-la.' });
      }

      const [check] = await db.execute(
        'SELECT id FROM usuarios WHERE id = ? AND senha = ?',
        [req.session.usuarioId, senhaAtual]
      );

      if (check.length === 0) {
        return res.status(401).json({ erro: 'Senha atual incorreta.' });
      }

      await db.execute(
        'UPDATE usuarios SET nome = ?, email = ?, senha = ? WHERE id = ?',
        [nome, email, novaSenha, req.session.usuarioId]
      );
    } else {
      await db.execute(
        'UPDATE usuarios SET nome = ?, email = ? WHERE id = ?',
        [nome, email, req.session.usuarioId]
      );
    }

    // Atualiza nome na sessão
    req.session.usuarioNome = nome;

    res.json({ mensagem: 'Perfil atualizado com sucesso!' });
  } catch (erro) {
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ erro: 'Este e-mail já está em uso.' });
    }
    res.status(500).json({ erro: 'Erro ao atualizar perfil.' });
  }
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
// MÓDULO DE BATALHA (com sistema de vitórias e evolução)
// ============================================================================

// Mapa de evoluções dos Pokémons
const EVOLUCOES = {
  'Bulbasaur':  { nome: 'Ivysaur', tipo: 'Planta', ataque: 62, hp: 60, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png' },
  'Ivysaur':    { nome: 'Venusaur', tipo: 'Planta', ataque: 82, hp: 80, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png' },
  'Charmander': { nome: 'Charmeleon', tipo: 'Fogo', ataque: 64, hp: 58, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/5.png' },
  'Charmeleon': { nome: 'Charizard', tipo: 'Fogo', ataque: 84, hp: 78, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png' },
  'Squirtle':   { nome: 'Wartortle', tipo: 'Água', ataque: 63, hp: 59, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/8.png' },
  'Wartortle':  { nome: 'Blastoise', tipo: 'Água', ataque: 83, hp: 79, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png' },
  'Pikachu':    { nome: 'Raichu', tipo: 'Elétrico', ataque: 90, hp: 60, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/26.png' },
  'Eevee':      { nome: 'Flareon', tipo: 'Fogo', ataque: 130, hp: 65, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/136.png' },
  'Jigglypuff': { nome: 'Wigglytuff', tipo: 'Normal', ataque: 70, hp: 140, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/40.png' },
  'Geodude':    { nome: 'Graveler', tipo: 'Pedra', ataque: 95, hp: 55, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/75.png' },
  'Graveler':   { nome: 'Golem', tipo: 'Pedra', ataque: 120, hp: 80, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/76.png' },
  'Gengar':     { nome: 'Mega Gengar', tipo: 'Fantasma', ataque: 170, hp: 60, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png' },
  'Dragonite':  { nome: 'Dragonite Mega', tipo: 'Dragão', ataque: 160, hp: 91, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png' }
};

// Pokémons selvagens que aparecem na batalha
const SELVAGENS = [
  { nome: 'Rattata', tipo: 'Normal', ataque: 30, hp: 30, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/19.png' },
  { nome: 'Pidgey', tipo: 'Normal', ataque: 35, hp: 40, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/16.png' },
  { nome: 'Zubat', tipo: 'Veneno', ataque: 40, hp: 40, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/41.png' },
  { nome: 'Machop', tipo: 'Lutador', ataque: 55, hp: 70, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/66.png' },
  { nome: 'Abra', tipo: 'Psíquico', ataque: 60, hp: 25, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/63.png' },
  { nome: 'Gastly', tipo: 'Fantasma', ataque: 65, hp: 30, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/92.png' },
  { nome: 'Onix', tipo: 'Pedra', ataque: 70, hp: 35, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/95.png' },
  { nome: 'Scyther', tipo: 'Inseto', ataque: 80, hp: 70, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/123.png' },
  { nome: 'Magikarp', tipo: 'Água', ataque: 10, hp: 20, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/129.png' },
  { nome: 'Dratini', tipo: 'Dragão', ataque: 64, hp: 41, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/147.png' }
];

// POST /api/desafio/batalhar - Batalha com exibição dos dois Pokémons
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

    // Sorteia um Pokémon selvagem
    const selvagem = { ...SELVAGENS[Math.floor(Math.random() * SELVAGENS.length)] };
    // Variação aleatória no ataque do selvagem (+/- 20%)
    selvagem.ataque = Math.floor(selvagem.ataque * (0.8 + Math.random() * 0.4));

    const vitoria = meuPokemon.ataque > selvagem.ataque;

    if (vitoria) {
      // Incrementa vitórias do Pokémon
      const novasVitorias = (meuPokemon.vitorias || 0) + 1;
      await db.execute(
        'UPDATE pokemons SET vitorias = ? WHERE id = ?',
        [novasVitorias, meuPokemon.id]
      );

      // Verifica se pode evoluir (5 vitórias) consultando a PokeAPI
      let podeEvoluir = false;
      let evolucaoInfo = null;

      if (novasVitorias >= 5) {
        try {
          const nomeLower = meuPokemon.nome.toLowerCase().replace(/ /g, '-');
          const evoCheckRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${nomeLower}`);
          if (evoCheckRes.ok) {
            const speciesData = await evoCheckRes.json();
            const evoChainRes = await fetch(speciesData.evolution_chain.url);
            const evoChainData = await evoChainRes.json();

            let proximaEvolucao = null;
            function percorrerCadeia(chain) {
              if (chain.species.name === nomeLower) {
                if (chain.evolves_to && chain.evolves_to.length > 0) {
                  proximaEvolucao = chain.evolves_to[0].species.name;
                }
                return;
              }
              if (chain.evolves_to) {
                chain.evolves_to.forEach(evo => percorrerCadeia(evo));
              }
            }
            percorrerCadeia(evoChainData.chain);

            if (proximaEvolucao) {
              const evoPokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${proximaEvolucao}`);
              const evoPokeData = await evoPokeRes.json();
              const evoSprite = evoPokeData.sprites.other['official-artwork'].front_default || evoPokeData.sprites.front_default;

              podeEvoluir = true;
              evolucaoInfo = {
                nome: proximaEvolucao.charAt(0).toUpperCase() + proximaEvolucao.slice(1),
                tipo: evoPokeData.types[0].type.name,
                ataque: evoPokeData.stats.find(s => s.stat.name === 'attack').base_stat,
                hp: evoPokeData.stats.find(s => s.stat.name === 'hp').base_stat,
                sprite: evoSprite
              };
            }
          }
        } catch (evoErr) {
          console.error('Erro ao verificar evolução:', evoErr.message);
        }
      }

      return res.json({
        resultado: 'VITÓRIA',
        vitoria: true,
        meuPokemon: {
          id: meuPokemon.id,
          nome: meuPokemon.nome,
          tipo: meuPokemon.tipo,
          ataque: meuPokemon.ataque,
          hp: meuPokemon.hp,
          sprite_url: meuPokemon.sprite_url,
          vitorias: novasVitorias
        },
        selvagem: selvagem,
        podeEvoluir: podeEvoluir,
        evolucao: evolucaoInfo,
        mensagem: `Seu ${meuPokemon.nome} (Ataque: ${meuPokemon.ataque}) venceu ${selvagem.nome} (Ataque: ${selvagem.ataque})!`
      });
    }

    res.json({
      resultado: 'DERROTA',
      vitoria: false,
      meuPokemon: {
        id: meuPokemon.id,
        nome: meuPokemon.nome,
        tipo: meuPokemon.tipo,
        ataque: meuPokemon.ataque,
        hp: meuPokemon.hp,
        sprite_url: meuPokemon.sprite_url,
        vitorias: meuPokemon.vitorias || 0
      },
      selvagem: selvagem,
      mensagem: `${selvagem.nome} (Ataque: ${selvagem.ataque}) era mais forte que ${meuPokemon.nome} (Ataque: ${meuPokemon.ataque}). Treine mais!`
    });

  } catch (erro) {
    res.status(500).json({ erro: 'Erro na batalha.' });
  }
});

// POST /api/desafio/capturar - Captura o Pokémon selvagem derrotado
app.post('/api/desafio/capturar', autenticarSessao, async (req, res) => {
  const { nome, tipo, ataque, hp, sprite } = req.body;

  try {
    const [result] = await db.execute(
      'INSERT INTO pokemons (usuario_id, nome, tipo, nivel, ataque, hp, sprite_url, vitorias) VALUES (?, ?, ?, 1, ?, ?, ?, 0)',
      [req.session.usuarioId, nome, tipo, ataque, hp, sprite]
    );

    res.status(201).json({ mensagem: `${nome} foi capturado e adicionado à sua coleção!` });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao capturar.' });
  }
});

// POST /api/desafio/evoluir - Evolui usando dados reais da PokeAPI
app.post('/api/desafio/evoluir', autenticarSessao, async (req, res) => {
  const { pokemonId } = req.body;

  try {
    const [pokemons] = await db.execute(
      'SELECT * FROM pokemons WHERE id = ? AND usuario_id = ?',
      [pokemonId, req.session.usuarioId]
    );

    if (pokemons.length === 0) {
      return res.status(404).json({ erro: 'Pokémon não encontrado.' });
    }

    const pokemon = pokemons[0];

    if ((pokemon.vitorias || 0) < 5) {
      return res.status(400).json({ erro: 'Precisa de 5 vitórias para evoluir.' });
    }

    // Busca evolução na PokeAPI
    const nomeLower = pokemon.nome.toLowerCase().replace(/ /g, '-');
    const evoRes = await fetch(`http://localhost:${PORT}/api/pokemon/evolucao/${nomeLower}`);
    const evoData = await evoRes.json();

    if (!evoData.evolucao) {
      return res.status(400).json({ erro: 'Este Pokémon já está em sua forma final.' });
    }

    const evolucao = evoData.evolucao;

    await db.execute(
      'UPDATE pokemons SET nome = ?, tipo = ?, ataque = ?, hp = ?, sprite_url = ?, nivel = nivel + 10, vitorias = 0 WHERE id = ?',
      [evolucao.nome, evolucao.tipo, evolucao.ataque, evolucao.hp, evolucao.sprite, pokemonId]
    );

    res.json({
      mensagem: `${pokemon.nome} evoluiu para ${evolucao.nome}!`,
      evolucao: evolucao
    });
  } catch (erro) {
    console.error('Erro ao evoluir:', erro);
    res.status(500).json({ erro: 'Erro ao evoluir.' });
  }
});

// Inicialização
app.listen(PORT, () => {
  console.log(`🚀 Pokémon Trading App rodando em http://localhost:${PORT}`);
  console.log(`📊 Apresentação em http://localhost:${PORT}/slides`);
});
