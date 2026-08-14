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

    pokemons.forEach(poke => {
      container.innerHTML += `
        <div class="col-6 col-md-4 col-lg-3">
          <div class="card pokemon-card text-center h-100 shadow-sm border-0" style="cursor:pointer" onclick="batalhar(${poke.id})">
            <img src="${poke.sprite_url}" class="card-img-top mt-3" style="width:80px;height:80px;object-fit:contain;margin:0 auto;" alt="${poke.nome}">
            <div class="card-body p-2">
              <h6 class="card-title fw-bold mb-0">${poke.nome}</h6>
              <small class="text-muted">Ataque: ${poke.ataque}</small>
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
      div.innerHTML = `<div class="resultado-vitoria"><h4>🏆 ${data.resultado}</h4><p>${data.mensagem}</p></div>`;
    } else {
      div.innerHTML = `<div class="resultado-derrota"><h4>💀 ${data.resultado}</h4><p>${data.mensagem}</p></div>`;
    }
  } catch (e) {
    console.error('Erro:', e);
  }
}
