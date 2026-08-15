-- ============================================================================
-- POKÉMON TRADING APP - Schema do Banco de Dados
-- Manual Integral de Desenvolvimento Web Full-Stack
-- ============================================================================

-- 1. Criação do Banco de Dados
CREATE DATABASE IF NOT EXISTS pokemon_trading_db
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE pokemon_trading_db;

-- 2. Tabela de Usuários (Treinadores)
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Tabela de Cards de Pokémons
CREATE TABLE IF NOT EXISTS pokemons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  nome VARCHAR(50) NOT NULL,
  tipo VARCHAR(30) NOT NULL,
  nivel INT NOT NULL DEFAULT 1,
  ataque INT NOT NULL,
  hp INT NOT NULL,
  sprite_url VARCHAR(255) NOT NULL,
  vitorias INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_pokemons_usuarios
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Tabela de Propostas de Troca entre Treinadores
CREATE TABLE IF NOT EXISTS trocas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pokemon_ofertado_id INT NOT NULL,
  pokemon_desejado_id INT NOT NULL,
  status ENUM('PENDENTE', 'ACEITA', 'RECUSADA') DEFAULT 'PENDENTE',
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pokemon_ofertado_id) REFERENCES pokemons(id) ON DELETE CASCADE,
  FOREIGN KEY (pokemon_desejado_id) REFERENCES pokemons(id) ON DELETE CASCADE
) ENGINE=InnoDB;
