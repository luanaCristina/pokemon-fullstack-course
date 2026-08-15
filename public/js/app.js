// ============================================================================
// Pokémon Trading App - Lógica Front-End
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  verificarSessao();

  document.getElementById('form-login').addEventListener('submit', fazerLogin);
  document.getElementById('form-cadastro').addEventListener('submit', fazerCadastro);
  document.getElementById('form-novo-pokemon').addEventListener('submit', cadastrarPokemon);
});

// ============================================================================
// AUTENTICAÇÃO
// ============================================================================

async function verificarSessao() {
  try {
    const res = await fetch('/api/sessao');
    const data = await res.json();

    if (data.logado) {
      document.getElementById('secao-auth').classList.add('d-none');
      document.getElementById('secao-app').classList.remove('d-none');
      carregarMeusPokemons();
    }
  } catch (e) {
    console.error('Erro ao verificar sessão:', e);
  }
}

async function fazerLogin(event) {
  event.preventDefault();

  const email = document.getElementById('login-email').value;
  const senha = document.getElementById('login-senha').value;

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    const data = await res.json();

    if (res.ok) {
      document.getElementById('secao-auth').classList.add('d-none');
      document.getElementById('secao-app').classList.remove('d-none');
      carregarMeusPokemons();
    } else {
      alert(data.erro);
    }
  } catch (e) {
    alert('Erro de conexão');
  }
}

async function fazerCadastro(event) {
  event.preventDefault();

  const nome = document.getElementById('cad-nome').value;
  const email = document.getElementById('cad-email').value;
  const senha = document.getElementById('cad-senha').value;

  try {
    const res = await fetch('/api/cadastrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha })
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.mensagem);
      // Auto-login após cadastro
      await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });
      document.getElementById('secao-auth').classList.add('d-none');
      document.getElementById('secao-app').classList.remove('d-none');
      carregarMeusPokemons();
    } else {
      alert(data.erro);
    }
  } catch (e) {
    alert('Erro de conexão');
  }
}

async function logout() {
  await fetch('/api/logout', { method: 'POST' });
  location.reload();
}

function mostrarCadastro() {
  document.getElementById('painel-cadastro').classList.remove('d-none');
}

// ============================================================================
// NAVEGAÇÃO
// ============================================================================

function mostrarSecao(secao) {
  document.getElementById('secao-colecao').classList.add('d-none');
  document.getElementById('secao-mercado').classList.add('d-none');
  document.getElementById('secao-batalha').classList.add('d-none');

  if (secao === 'colecao') {
    document.getElementById('secao-colecao').classList.remove('d-none');
    document.getElementById('titulo-secao').textContent = 'Sua Coleção de Cards';
    carregarMeusPokemons();
  } else if (secao === 'mercado') {
    document.getElementById('secao-mercado').classList.remove('d-none');
    document.getElementById('titulo-secao').textContent = 'Mercado de Trocas';
    carregarMercado();
  } else if (secao === 'batalha') {
    document.getElementById('secao-batalha').classList.remove('d-none');
    document.getElementById('titulo-secao').textContent = '⚔️ Arena de Batalha';
    carregarBatalha();
  }
}

// ============================================================================
// COLEÇÃO (READ)
// ============================================================================

function getBadgeClass(tipo) {
  const map = {
    'Fogo': 'badge-fogo', 'Água': 'badge-agua', 'Planta': 'badge-planta',
    'Elétrico': 'badge-eletrico', 'Normal': 'badge-normal', 'Psíquico': 'badge-psiquico',
    'Dragão': 'badge-dragao', 'Fantasma': 'badge-fantasma', 'Pedra': 'badge-pedra',
    'Lendário': 'badge-lendario'
  };
  return map[tipo] || 'bg-secondary';
}

async function carregarMeusPokemons() {
  const container = document.getElementById('grid-pokemons');

  try {
    const res = await fetch('/api/meus-pokemons');
    if (res.status === 401) return;

    const pokemons = await res.json();
    container.innerHTML = '';

    if (pokemons.length === 0) {
      container.innerHTML = '<div class="col-12"><p class="text-center alert alert-warning">Sua coleção está vazia! Cadastre ou ganhe Pokémons em batalhas.</p></div>';
      return;
    }

    pokemons.forEach(poke => {
      container.innerHTML += `
        <div class="col-12 col-md-6 col-lg-4" id="card-pokemon-${poke.id}">
          <div class="card pokemon-card text-center h-100 shadow-sm border-0">
            <div class="card-header bg-white border-0 pt-3">
              <span class="badge ${getBadgeClass(poke.tipo)} rounded-pill px-3 py-2">${poke.tipo}</span>
            </div>
            <img src="${poke.sprite_url}" class="card-img-top mt-2" alt="${poke.nome}">
            <div class="card-body">
              <h5 class="card-title fw-bold">${poke.nome}</h5>
              <p class="card-text text-muted mb-1">Nível: <strong>${poke.nivel}</strong></p>
              <div class="d-flex justify-content-center gap-3">
                <small><strong>Ataque:</strong> ${poke.ataque}</small>
                <small><strong>HP:</strong> ${poke.hp}</small>
              </div>
            </div>
            <div class="card-footer bg-white border-0 pb-3 d-flex justify-content-center gap-2">
              <button class="btn btn-info btn-sm text-white" onclick="verDescricao('${poke.nome}', '${poke.tipo}', '${poke.sprite_url}')">📖 Descrição</button>
              <button class="btn btn-primary btn-sm" onclick="subirNivel(${poke.id}, ${poke.nivel}, ${poke.ataque}, ${poke.hp})">⚡ Treinar</button>
              <button class="btn btn-outline-danger btn-sm" onclick="liberarPokemon(${poke.id})">🗑️ Liberar</button>
            </div>
          </div>
        </div>`;
    });
  } catch (e) {
    console.error('Erro:', e);
  }
}

// ============================================================================
// CREATE
// ============================================================================

async function cadastrarPokemon(event) {
  event.preventDefault();

  const novoPoke = {
    nome: document.getElementById('nome').value,
    tipo: document.getElementById('tipo').value,
    nivel: parseInt(document.getElementById('nivel').value),
    ataque: parseInt(document.getElementById('ataque').value),
    hp: parseInt(document.getElementById('hp').value),
    sprite_url: document.getElementById('sprite_url').value || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
  };

  try {
    const res = await fetch('/api/pokemons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoPoke)
    });

    if (res.ok) {
      alert('Pokémon registrado!');
      bootstrap.Modal.getInstance(document.getElementById('modalNovoPokemon')).hide();
      carregarMeusPokemons();
      document.getElementById('form-novo-pokemon').reset();
    }
  } catch (e) {
    console.error('Erro:', e);
  }
}

// ============================================================================
// UPDATE
// ============================================================================

async function subirNivel(id, nivelAtual, ataqueAtual, hpAtual) {
  try {
    const res = await fetch(`/api/pokemons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nivel: nivelAtual + 1,
        ataque: ataqueAtual + 5,
        hp: hpAtual + 10
      })
    });

    if (res.ok) carregarMeusPokemons();
  } catch (e) {
    console.error('Erro:', e);
  }
}

// ============================================================================
// DELETE
// ============================================================================

async function liberarPokemon(id) {
  if (!confirm('Deseja realmente soltar este Pokémon?')) return;

  try {
    const res = await fetch(`/api/pokemons/${id}`, { method: 'DELETE' });
    if (res.ok) {
      document.getElementById(`card-pokemon-${id}`).remove();
    }
  } catch (e) {
    console.error('Erro:', e);
  }
}

// ============================================================================
// MERCADO
// ============================================================================

async function carregarMercado() {
  const container = document.getElementById('grid-mercado');

  try {
    const res = await fetch('/api/mercado');
    const pokemons = await res.json();
    container.innerHTML = '';

    if (pokemons.length === 0) {
      container.innerHTML = '<div class="col-12"><p class="text-center alert alert-info">Nenhum Pokémon disponível no mercado.</p></div>';
      return;
    }

    pokemons.forEach(poke => {
      container.innerHTML += `
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card mercado-card text-center h-100 shadow-sm">
            <div class="card-header bg-white border-0 pt-3">
              <span class="badge ${getBadgeClass(poke.tipo)} rounded-pill px-3 py-2">${poke.tipo}</span>
              <small class="d-block text-muted mt-1">Treinador: ${poke.treinador}</small>
            </div>
            <img src="${poke.sprite_url}" style="width:100px;height:100px;object-fit:contain;margin:0 auto;" alt="${poke.nome}">
            <div class="card-body">
              <h5 class="card-title fw-bold">${poke.nome}</h5>
              <small>Nível ${poke.nivel} | Ataque ${poke.ataque} | HP ${poke.hp}</small>
            </div>
          </div>
        </div>`;
    });
  } catch (e) {
    console.error('Erro:', e);
  }
}

// ============================================================================
// BATALHA
// ============================================================================

async function carregarBatalha() {
  const container = document.getElementById('grid-batalha');
  document.getElementById('resultado-batalha').innerHTML = '';

  try {
    const res = await fetch('/api/meus-pokemons');
    const pokemons = await res.json();
    container.innerHTML = '';

    if (pokemons.length === 0) {
      container.innerHTML = '<div class="col-12"><p class="alert alert-warning text-center">Você não tem Pokémons! Cadastre ou ganhe alguns.</p></div>';
      return;
    }

    pokemons.forEach(poke => {
      const vitorias = poke.vitorias || 0;
      const barraProgresso = Math.min((vitorias / 5) * 100, 100);
      container.innerHTML += `
        <div class="col-6 col-md-4 col-lg-3">
          <div class="card pokemon-card text-center h-100 shadow-sm border-0" style="cursor:pointer" onclick="batalhar(${poke.id})">
            <img src="${poke.sprite_url}" class="card-img-top mt-3" style="width:80px;height:80px;object-fit:contain;margin:0 auto;" alt="${poke.nome}">
            <div class="card-body p-2">
              <h6 class="card-title fw-bold mb-0">${poke.nome}</h6>
              <small class="text-muted">Ataque: ${poke.ataque}</small>
              <div class="progress mt-2" style="height:6px;" title="${vitorias}/5 vitórias para evoluir">
                <div class="progress-bar bg-success" style="width:${barraProgresso}%"></div>
              </div>
              <small class="text-muted">${vitorias}/5 vitórias</small>
            </div>
          </div>
        </div>`;
    });
  } catch (e) {
    console.error('Erro:', e);
  }
}

async function batalhar(meuPokemonId) {
  try {
    const res = await fetch('/api/desafio/batalhar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meuPokemonId })
    });

    const data = await res.json();
    const div = document.getElementById('resultado-batalha');

    if (data.vitoria) {
      let botoesExtra = `
        <div class="mt-3 d-flex justify-content-center gap-2 flex-wrap">
          <button class="btn btn-success" onclick="capturarSelvagem('${data.selvagem.nome}', '${data.selvagem.tipo}', ${data.selvagem.ataque}, ${data.selvagem.hp}, '${data.selvagem.sprite}')">
            ✅ Capturar ${data.selvagem.nome}
          </button>
          <button class="btn btn-outline-light" onclick="document.getElementById('resultado-batalha').innerHTML=''; carregarBatalha();">
            ❌ Liberar na Natureza
          </button>
        </div>`;

      let evolucaoHtml = '';
      if (data.podeEvoluir) {
        evolucaoHtml = `
          <div class="mt-3 p-3" style="background:rgba(255,255,255,0.1);border-radius:8px;">
            <h5>🌟 ${data.meuPokemon.nome} pode EVOLUIR para ${data.evolucao.nome}!</h5>
            <img src="${data.evolucao.sprite}" style="width:80px;height:80px;" alt="${data.evolucao.nome}">
            <p class="mb-2">Novos stats: Ataque ${data.evolucao.ataque} | HP ${data.evolucao.hp}</p>
            <div class="d-flex justify-content-center gap-2">
              <button class="btn btn-warning fw-bold" onclick="evoluirPokemon(${data.meuPokemon.id})">
                ⚡ Evoluir para ${data.evolucao.nome}!
              </button>
              <button class="btn btn-outline-light" onclick="document.getElementById('resultado-batalha').innerHTML=''; carregarBatalha();">
                Manter como está
              </button>
            </div>
          </div>`;
      }

      div.innerHTML = `
        <div class="resultado-vitoria">
          <h4>🏆 ${data.resultado}</h4>
          <div class="d-flex justify-content-center align-items-center gap-5 my-3">
            <div class="text-center">
              <img src="${data.meuPokemon.sprite_url}" style="width:100px;height:100px;" alt="${data.meuPokemon.nome}">
              <p class="fw-bold mb-0">${data.meuPokemon.nome}</p>
              <small>Ataque: ${data.meuPokemon.ataque}</small>
              <br><small>Vitórias: ${data.meuPokemon.vitorias}/5</small>
            </div>
            <h3>⚔️ VS</h3>
            <div class="text-center">
              <img src="${data.selvagem.sprite}" style="width:100px;height:100px;" alt="${data.selvagem.nome}">
              <p class="fw-bold mb-0">${data.selvagem.nome} <small>(selvagem)</small></p>
              <small>Ataque: ${data.selvagem.ataque}</small>
            </div>
          </div>
          <p>${data.mensagem}</p>
          ${botoesExtra}
          ${evolucaoHtml}
        </div>`;
    } else {
      div.innerHTML = `
        <div class="resultado-derrota">
          <h4>💀 ${data.resultado}</h4>
          <div class="d-flex justify-content-center align-items-center gap-5 my-3">
            <div class="text-center">
              <img src="${data.meuPokemon.sprite_url}" style="width:100px;height:100px;" alt="${data.meuPokemon.nome}">
              <p class="fw-bold mb-0">${data.meuPokemon.nome}</p>
              <small>Ataque: ${data.meuPokemon.ataque}</small>
            </div>
            <h3>⚔️ VS</h3>
            <div class="text-center">
              <img src="${data.selvagem.sprite}" style="width:100px;height:100px;" alt="${data.selvagem.nome}">
              <p class="fw-bold mb-0">${data.selvagem.nome} <small>(selvagem)</small></p>
              <small>Ataque: ${data.selvagem.ataque}</small>
            </div>
          </div>
          <p>${data.mensagem}</p>
          <button class="btn btn-outline-light mt-2" onclick="document.getElementById('resultado-batalha').innerHTML=''; carregarBatalha();">
            Tentar novamente
          </button>
        </div>`;
    }
  } catch (e) {
    console.error('Erro:', e);
  }
}

async function capturarSelvagem(nome, tipo, ataque, hp, sprite) {
  try {
    const res = await fetch('/api/desafio/capturar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, tipo, ataque, hp, sprite })
    });

    const data = await res.json();
    if (res.ok) {
      alert(data.mensagem);
      document.getElementById('resultado-batalha').innerHTML = '';
      carregarBatalha();
    }
  } catch (e) {
    console.error('Erro:', e);
  }
}

async function evoluirPokemon(pokemonId) {
  try {
    const res = await fetch('/api/desafio/evoluir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pokemonId })
    });

    const data = await res.json();
    if (res.ok) {
      const resultDiv = document.getElementById('resultado-batalha');
      resultDiv.innerHTML = `
        <div class="resultado-vitoria">
          <h4>🌟 Evolução Completa!</h4>
          <div class="text-center my-3">
            <img src="${data.evolucao.sprite}" style="width:150px;height:150px;" alt="${data.evolucao.nome}">
            <h3 class="mt-2 fw-bold">${data.evolucao.nome}</h3>
            <p>Tipo: ${data.evolucao.tipo} | Ataque: ${data.evolucao.ataque} | HP: ${data.evolucao.hp}</p>
          </div>
          <p>${data.mensagem}</p>
          <button class="btn btn-outline-light mt-2" onclick="document.getElementById('resultado-batalha').innerHTML=''; carregarBatalha();">
            Continuar
          </button>
        </div>`;
    } else {
      alert(data.erro);
    }
  } catch (e) {
    console.error('Erro:', e);
  }
}


// ============================================================================
// DESCRIÇÃO DO POKÉMON (via PokeAPI)
// ============================================================================

const TIPO_CORES = {
  fire: '#fd7d24', water: '#6890f0', grass: '#78c850', electric: '#f8d030',
  normal: '#a8a878', psychic: '#f85888', dragon: '#7038f8', ghost: '#705898',
  rock: '#b8a038', fighting: '#c03028', poison: '#a040a0', bug: '#a8b820',
  flying: '#a890f0', ice: '#98d8d8', ground: '#e0c068', steel: '#b8b8d0',
  dark: '#705848', fairy: '#ee99ac'
};

async function verDescricao(nome, tipo, sprite) {
  const modal = new bootstrap.Modal(document.getElementById('modalDescricao'));
  modal.show();

  // Mostra loading
  document.getElementById('descricao-loading').classList.remove('d-none');
  document.getElementById('descricao-sprite').style.display = 'none';
  document.getElementById('descricao-nome').textContent = '';
  document.getElementById('descricao-texto').textContent = '';
  document.getElementById('descricao-stats').innerHTML = '';
  document.getElementById('descricao-habilidades').innerHTML = '';
  document.getElementById('descricao-tipos').innerHTML = '';
  document.getElementById('descricao-fisico').textContent = '';

  try {
    const res = await fetch(`/api/pokemon/descricao/${encodeURIComponent(nome)}`);
    const data = await res.json();

    document.getElementById('descricao-loading').classList.add('d-none');
    document.getElementById('descricao-sprite').style.display = 'block';

    // Sprite (oficial artwork da PokeAPI)
    document.getElementById('descricao-sprite').src = data.sprite || sprite;
    document.getElementById('descricao-sprite').alt = nome;

    // Nome e título
    document.getElementById('descricao-titulo').textContent = `📖 #${data.id || '???'} ${nome}`;
    document.getElementById('descricao-nome').textContent = nome;

    // Tipos com cores
    const tiposDiv = document.getElementById('descricao-tipos');
    if (data.tipos && data.tipos.length > 0) {
      tiposDiv.innerHTML = data.tipos.map(t => {
        const cor = TIPO_CORES[t] || '#999';
        return `<span class="badge rounded-pill me-1 px-3 py-2" style="background-color:${cor}">${t}</span>`;
      }).join('');
    }

    // Dados físicos
    if (data.peso && data.altura) {
      document.getElementById('descricao-fisico').textContent = `Peso: ${data.peso}kg | Altura: ${data.altura}m`;
    }

    // Descrição
    document.getElementById('descricao-texto').textContent = data.descricao || 'Sem descrição.';

    // Stats com barras de progresso
    const statsDiv = document.getElementById('descricao-stats');
    if (data.stats) {
      const nomesStat = { hp: 'HP', attack: 'Ataque', defense: 'Defesa', 'special-attack': 'Atq. Esp.', 'special-defense': 'Def. Esp.', speed: 'Velocidade' };
      statsDiv.innerHTML = Object.entries(data.stats).map(([key, val]) => {
        const pct = Math.min((val / 150) * 100, 100);
        const label = nomesStat[key] || key;
        return `<div class="d-flex align-items-center mb-1">
          <small class="text-muted" style="width:80px">${label}</small>
          <div class="progress flex-grow-1" style="height:10px">
            <div class="progress-bar bg-info" style="width:${pct}%"></div>
          </div>
          <small class="ms-2 fw-bold" style="width:30px">${val}</small>
        </div>`;
      }).join('');
    }

    // Habilidades
    const habDiv = document.getElementById('descricao-habilidades');
    if (data.habilidades && data.habilidades.length > 0) {
      habDiv.innerHTML = data.habilidades.map(h =>
        `<span class="badge bg-secondary me-1 text-capitalize">${h.replace('-', ' ')}</span>`
      ).join('');
    }

  } catch (e) {
    document.getElementById('descricao-loading').classList.add('d-none');
    document.getElementById('descricao-texto').textContent = 'Erro ao carregar dados.';
    console.error('Erro:', e);
  }
}

// ============================================================================
// PERFIL DO USUÁRIO
// ============================================================================

async function abrirPerfil() {
  try {
    const res = await fetch('/api/perfil');
    if (!res.ok) return;

    const perfil = await res.json();

    document.getElementById('perfil-nome').value = perfil.nome;
    document.getElementById('perfil-email').value = perfil.email;
    document.getElementById('perfil-criado').value = new Date(perfil.criado_em).toLocaleDateString('pt-BR');
    document.getElementById('perfil-senha-atual').value = '';
    document.getElementById('perfil-nova-senha').value = '';
    document.getElementById('perfil-mensagem').innerHTML = '';

    const modal = new bootstrap.Modal(document.getElementById('modalPerfil'));
    modal.show();
  } catch (e) {
    console.error('Erro ao carregar perfil:', e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const formPerfil = document.getElementById('form-perfil');
  if (formPerfil) {
    formPerfil.addEventListener('submit', salvarPerfil);
  }
});

async function salvarPerfil(event) {
  event.preventDefault();

  const dados = {
    nome: document.getElementById('perfil-nome').value,
    email: document.getElementById('perfil-email').value
  };

  const senhaAtual = document.getElementById('perfil-senha-atual').value;
  const novaSenha = document.getElementById('perfil-nova-senha').value;

  if (novaSenha) {
    dados.senhaAtual = senhaAtual;
    dados.novaSenha = novaSenha;
  }

  const msgDiv = document.getElementById('perfil-mensagem');

  try {
    const res = await fetch('/api/perfil', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });

    const data = await res.json();

    if (res.ok) {
      msgDiv.innerHTML = `<div class="alert alert-success">${data.mensagem}</div>`;
    } else {
      msgDiv.innerHTML = `<div class="alert alert-danger">${data.erro}</div>`;
    }
  } catch (e) {
    msgDiv.innerHTML = '<div class="alert alert-danger">Erro de conexão.</div>';
  }
}
