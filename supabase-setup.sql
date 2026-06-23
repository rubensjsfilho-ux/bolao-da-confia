-- ============================================================
-- BOLÃO COPA 2026 — Setup do Banco de Dados (Supabase)
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- 1. PARTICIPANTES
CREATE TABLE IF NOT EXISTS participants (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name             TEXT NOT NULL,
  avatar_emoji     TEXT DEFAULT '⚽',
  total_points     INTEGER DEFAULT 0,
  exact_hits       INTEGER DEFAULT 0,
  result_hits      INTEGER DEFAULT 0,
  predictions_count INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 2. JOGOS
CREATE TABLE IF NOT EXISTS matches (
  id          SERIAL PRIMARY KEY,
  team1       TEXT NOT NULL,
  team2       TEXT NOT NULL,
  match_date  TIMESTAMPTZ NOT NULL,
  phase       TEXT NOT NULL DEFAULT 'Fase de Grupos',
  group_name  TEXT,
  venue       TEXT,
  city        TEXT,
  score1      INTEGER,
  score2      INTEGER,
  is_finished BOOLEAN DEFAULT FALSE,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PALPITES
CREATE TABLE IF NOT EXISTS predictions (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  match_id       INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  score1         INTEGER NOT NULL,
  score2         INTEGER NOT NULL,
  points         INTEGER,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (participant_id, match_id)
);

-- ── ÍNDICES ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_predictions_participant ON predictions(participant_id);
CREATE INDEX IF NOT EXISTS idx_predictions_match      ON predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_participants_points    ON participants(total_points DESC);

-- ── RLS (Row Level Security) ──────────────────────────────────────────────────
ALTER TABLE participants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches       ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions   ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode ler participantes e jogos
CREATE POLICY "leitura_publica_participants" ON participants  FOR SELECT USING (true);
CREATE POLICY "leitura_publica_matches"      ON matches       FOR SELECT USING (true);
CREATE POLICY "leitura_publica_predictions"  ON predictions   FOR SELECT USING (true);

-- Qualquer pessoa pode criar e editar participantes (login via nome)
CREATE POLICY "inserir_participants"  ON participants FOR INSERT WITH CHECK (true);
CREATE POLICY "atualizar_participants" ON participants FOR UPDATE USING (true);

-- Qualquer pessoa pode criar e editar seus próprios palpites
CREATE POLICY "inserir_predictions"  ON predictions FOR INSERT WITH CHECK (true);
CREATE POLICY "atualizar_predictions" ON predictions FOR UPDATE USING (true);

-- Admin pode editar jogos (via service role no painel admin ou anon key com política aberta)
CREATE POLICY "atualizar_matches" ON matches FOR UPDATE USING (true);
CREATE POLICY "inserir_matches"   ON matches FOR INSERT WITH CHECK (true);

-- ── POPULAR TABELA DE JOGOS (FASE DE GRUPOS) ─────────────────────────────────
INSERT INTO matches (id, team1, team2, match_date, phase, group_name, venue, city) VALUES
(1, 'México', 'África do Sul', '2026-06-11 19:00:00+00', 'Fase de Grupos', 'A', 'Estádio Azteca', 'Cidade do México'),
(2, 'Coreia do Sul', 'República Tcheca', '2026-06-12 16:00:00+00', 'Fase de Grupos', 'A', 'Estadio Jalisco', 'Guadalajara'),
(3, 'Canadá', 'Bósnia e Herz.', '2026-06-12 19:00:00+00', 'Fase de Grupos', 'B', 'BMO Field', 'Toronto'),
(4, 'Estados Unidos', 'Paraguai', '2026-06-12 22:00:00+00', 'Fase de Grupos', 'D', 'SoFi Stadium', 'Los Angeles'),
(5, 'Austrália', 'Turquia', '2026-06-14 01:00:00+00', 'Fase de Grupos', 'D', 'BC Place', 'Vancouver'),
(6, 'Catar', 'Suíça', '2026-06-13 16:00:00+00', 'Fase de Grupos', 'B', 'Levi''s Stadium', 'San Francisco'),
(7, 'Brasil', 'Marrocos', '2026-06-13 19:00:00+00', 'Fase de Grupos', 'C', 'MetLife Stadium', 'Nova York/NJ'),
(8, 'Haiti', 'Escócia', '2026-06-13 22:00:00+00', 'Fase de Grupos', 'C', 'Gillette Stadium', 'Boston'),
(9, 'Alemanha', 'Curaçao', '2026-06-14 14:00:00+00', 'Fase de Grupos', 'E', 'NRG Stadium', 'Houston'),
(10, 'Holanda', 'Japão', '2026-06-14 17:00:00+00', 'Fase de Grupos', 'F', 'AT&T Stadium', 'Dallas'),
(11, 'Costa do Marfim', 'Equador', '2026-06-14 20:00:00+00', 'Fase de Grupos', 'E', 'Lincoln Financial Field', 'Filadélfia'),
(12, 'Suécia', 'Tunísia', '2026-06-14 23:00:00+00', 'Fase de Grupos', 'F', 'Estadio BBVA', 'Monterrey'),
(13, 'Espanha', 'Cabo Verde', '2026-06-15 13:00:00+00', 'Fase de Grupos', 'H', 'Mercedes-Benz Stadium', 'Atlanta'),
(14, 'Bélgica', 'Egito', '2026-06-15 16:00:00+00', 'Fase de Grupos', 'G', 'Lumen Field', 'Seattle'),
(15, 'Arábia Saudita', 'Uruguai', '2026-06-15 19:00:00+00', 'Fase de Grupos', 'H', 'Hard Rock Stadium', 'Miami'),
(16, 'Irã', 'Nova Zelândia', '2026-06-15 22:00:00+00', 'Fase de Grupos', 'G', 'SoFi Stadium', 'Los Angeles'),
(17, 'Argentina', 'Argélia', '2026-06-16 22:00:00+00', 'Fase de Grupos', 'J', 'Arrowhead Stadium', 'Kansas City'),
(18, 'França', 'Senegal', '2026-06-16 16:00:00+00', 'Fase de Grupos', 'I', 'MetLife Stadium', 'Nova York/NJ'),
(19, 'Iraque', 'Noruega', '2026-06-16 19:00:00+00', 'Fase de Grupos', 'I', 'Gillette Stadium', 'Boston'),
(20, 'Áustria', 'Jordânia', '2026-06-17 01:00:00+00', 'Fase de Grupos', 'J', 'Levi''s Stadium', 'San Francisco'),
(21, 'Portugal', 'RD Congo', '2026-06-17 14:00:00+00', 'Fase de Grupos', 'K', 'NRG Stadium', 'Houston'),
(22, 'Inglaterra', 'Croácia', '2026-06-17 17:00:00+00', 'Fase de Grupos', 'L', 'AT&T Stadium', 'Dallas'),
(23, 'Gana', 'Panamá', '2026-06-17 20:00:00+00', 'Fase de Grupos', 'L', 'BMO Field', 'Toronto'),
(24, 'Uzbequistão', 'Colômbia', '2026-06-17 23:00:00+00', 'Fase de Grupos', 'K', 'Estadio Azteca', 'Cidade do México'),
(25, 'República Tcheca', 'África do Sul', '2026-06-18 13:00:00+00', 'Fase de Grupos', 'A', 'Mercedes-Benz Stadium', 'Atlanta'),
(26, 'Suíça', 'Bósnia e Herz.', '2026-06-18 16:00:00+00', 'Fase de Grupos', 'B', 'SoFi Stadium', 'Los Angeles'),
(27, 'Canadá', 'Catar', '2026-06-18 19:00:00+00', 'Fase de Grupos', 'B', 'BC Place', 'Vancouver'),
(28, 'México', 'Coreia do Sul', '2026-06-18 22:00:00+00', 'Fase de Grupos', 'A', 'Estadio Jalisco', 'Guadalajara'),
(29, 'Turquia', 'Paraguai', '2026-06-20 00:00:00+00', 'Fase de Grupos', 'D', 'Levi''s Stadium', 'San Francisco'),
(30, 'Estados Unidos', 'Austrália', '2026-06-19 16:00:00+00', 'Fase de Grupos', 'D', 'Lumen Field', 'Seattle'),
(31, 'Escócia', 'Marrocos', '2026-06-19 19:00:00+00', 'Fase de Grupos', 'C', 'Gillette Stadium', 'Boston'),
(32, 'Brasil', 'Haiti', '2026-06-19 21:30:00+00', 'Fase de Grupos', 'C', 'Lincoln Financial Field', 'Filadélfia'),
(33, 'Holanda', 'Suécia', '2026-06-20 14:00:00+00', 'Fase de Grupos', 'F', 'NRG Stadium', 'Houston'),
(34, 'Alemanha', 'Costa do Marfim', '2026-06-20 17:00:00+00', 'Fase de Grupos', 'E', 'BMO Field', 'Toronto'),
(35, 'Equador', 'Curaçao', '2026-06-20 21:00:00+00', 'Fase de Grupos', 'E', 'Arrowhead Stadium', 'Kansas City'),
(36, 'Tunísia', 'Japão', '2026-06-21 01:00:00+00', 'Fase de Grupos', 'F', 'Estadio BBVA', 'Monterrey'),
(37, 'Espanha', 'Arábia Saudita', '2026-06-21 13:00:00+00', 'Fase de Grupos', 'H', 'Mercedes-Benz Stadium', 'Atlanta'),
(38, 'Bélgica', 'Irã', '2026-06-21 16:00:00+00', 'Fase de Grupos', 'G', 'SoFi Stadium', 'Los Angeles'),
(39, 'Uruguai', 'Cabo Verde', '2026-06-21 19:00:00+00', 'Fase de Grupos', 'H', 'Hard Rock Stadium', 'Miami'),
(40, 'Nova Zelândia', 'Egito', '2026-06-21 22:00:00+00', 'Fase de Grupos', 'G', 'BC Place', 'Vancouver'),
(41, 'Argentina', 'Áustria', '2026-06-22 14:00:00+00', 'Fase de Grupos', 'J', 'AT&T Stadium', 'Dallas'),
(42, 'França', 'Iraque', '2026-06-22 18:00:00+00', 'Fase de Grupos', 'I', 'Lincoln Financial Field', 'Filadélfia'),
(43, 'Noruega', 'Senegal', '2026-06-22 21:00:00+00', 'Fase de Grupos', 'I', 'MetLife Stadium', 'Nova York/NJ'),
(44, 'Jordânia', 'Argélia', '2026-06-23 00:00:00+00', 'Fase de Grupos', 'J', 'Levi''s Stadium', 'San Francisco'),
(45, 'Portugal', 'Uzbequistão', '2026-06-23 14:00:00+00', 'Fase de Grupos', 'K', 'NRG Stadium', 'Houston'),
(46, 'Inglaterra', 'Gana', '2026-06-23 17:00:00+00', 'Fase de Grupos', 'L', 'Gillette Stadium', 'Boston'),
(47, 'Panamá', 'Croácia', '2026-06-23 20:00:00+00', 'Fase de Grupos', 'L', 'BMO Field', 'Toronto'),
(48, 'Colômbia', 'RD Congo', '2026-06-23 23:00:00+00', 'Fase de Grupos', 'K', 'Estadio Jalisco', 'Guadalajara'),
(49, 'Suíça', 'Canadá', '2026-06-24 16:00:00+00', 'Fase de Grupos', 'B', 'BC Place', 'Vancouver'),
(50, 'Bósnia e Herz.', 'Catar', '2026-06-24 16:00:00+00', 'Fase de Grupos', 'B', 'Lumen Field', 'Seattle'),
(51, 'Escócia', 'Brasil', '2026-06-24 19:00:00+00', 'Fase de Grupos', 'C', 'Hard Rock Stadium', 'Miami'),
(52, 'Marrocos', 'Haiti', '2026-06-24 19:00:00+00', 'Fase de Grupos', 'C', 'Mercedes-Benz Stadium', 'Atlanta'),
(53, 'República Tcheca', 'México', '2026-06-24 22:00:00+00', 'Fase de Grupos', 'A', 'Estadio Azteca', 'Cidade do México'),
(54, 'África do Sul', 'Coreia do Sul', '2026-06-24 22:00:00+00', 'Fase de Grupos', 'A', 'Estadio BBVA', 'Monterrey'),
(55, 'Equador', 'Alemanha', '2026-06-25 17:00:00+00', 'Fase de Grupos', 'E', 'MetLife Stadium', 'Nova York/NJ'),
(56, 'Curaçao', 'Costa do Marfim', '2026-06-25 17:00:00+00', 'Fase de Grupos', 'E', 'Lincoln Financial Field', 'Filadélfia'),
(57, 'Japão', 'Suécia', '2026-06-25 20:00:00+00', 'Fase de Grupos', 'F', 'AT&T Stadium', 'Dallas'),
(58, 'Tunísia', 'Holanda', '2026-06-25 20:00:00+00', 'Fase de Grupos', 'F', 'Arrowhead Stadium', 'Kansas City'),
(59, 'Turquia', 'Estados Unidos', '2026-06-25 23:00:00+00', 'Fase de Grupos', 'D', 'SoFi Stadium', 'Los Angeles'),
(60, 'Paraguai', 'Austrália', '2026-06-25 23:00:00+00', 'Fase de Grupos', 'D', 'Levi''s Stadium', 'San Francisco'),
(61, 'Noruega', 'França', '2026-06-26 16:00:00+00', 'Fase de Grupos', 'I', 'Gillette Stadium', 'Boston'),
(62, 'Senegal', 'Iraque', '2026-06-26 16:00:00+00', 'Fase de Grupos', 'I', 'BMO Field', 'Toronto'),
(63, 'Cabo Verde', 'Arábia Saudita', '2026-06-26 21:00:00+00', 'Fase de Grupos', 'H', 'NRG Stadium', 'Houston'),
(64, 'Uruguai', 'Espanha', '2026-06-26 21:00:00+00', 'Fase de Grupos', 'H', 'Estadio Jalisco', 'Guadalajara'),
(65, 'Egito', 'Irã', '2026-06-27 00:00:00+00', 'Fase de Grupos', 'G', 'Lumen Field', 'Seattle'),
(66, 'Nova Zelândia', 'Bélgica', '2026-06-27 00:00:00+00', 'Fase de Grupos', 'G', 'BC Place', 'Vancouver'),
(67, 'Panamá', 'Inglaterra', '2026-06-27 18:00:00+00', 'Fase de Grupos', 'L', 'MetLife Stadium', 'Nova York/NJ'),
(68, 'Croácia', 'Gana', '2026-06-27 18:00:00+00', 'Fase de Grupos', 'L', 'Lincoln Financial Field', 'Filadélfia'),
(69, 'Colômbia', 'Portugal', '2026-06-27 20:30:00+00', 'Fase de Grupos', 'K', 'Hard Rock Stadium', 'Miami'),
(70, 'RD Congo', 'Uzbequistão', '2026-06-27 20:30:00+00', 'Fase de Grupos', 'K', 'Mercedes-Benz Stadium', 'Atlanta'),
(71, 'Argélia', 'Áustria', '2026-06-27 23:00:00+00', 'Fase de Grupos', 'J', 'Arrowhead Stadium', 'Kansas City'),
(72, 'Jordânia', 'Argentina', '2026-06-27 23:00:00+00', 'Fase de Grupos', 'J', 'AT&T Stadium', 'Dallas')
ON CONFLICT (id) DO NOTHING;

-- ── PALPITE DE CAMPEÃO / VICE / 3º ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS champion_predictions (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id    UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  champion          TEXT NOT NULL,
  runner_up         TEXT NOT NULL,
  third_place       TEXT NOT NULL,
  champion_points   INTEGER DEFAULT 0,
  runner_up_points  INTEGER DEFAULT 0,
  third_points      INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_id)
);

-- ── RESULTADO OFICIAL (1 única linha, id = 1) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS champion_results (
  id          SERIAL PRIMARY KEY,
  champion    TEXT,
  runner_up   TEXT,
  third_place TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO champion_results (id) VALUES (1) ON CONFLICT DO NOTHING;

-- RLS para as novas tabelas
ALTER TABLE champion_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE champion_results     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leitura_champion_predictions" ON champion_predictions FOR SELECT USING (true);
CREATE POLICY "inserir_champion_predictions" ON champion_predictions FOR INSERT WITH CHECK (true);
CREATE POLICY "atualizar_champion_predictions" ON champion_predictions FOR UPDATE USING (true);

CREATE POLICY "leitura_champion_results" ON champion_results FOR SELECT USING (true);
CREATE POLICY "inserir_champion_results" ON champion_results FOR INSERT WITH CHECK (true);
CREATE POLICY "atualizar_champion_results" ON champion_results FOR UPDATE USING (true);

-- ── HABILITAR TEMPO REAL (execute no SQL Editor do Supabase) ──────────────────
-- Isso permite que o ranking atualize automaticamente em todos os dispositivos.
ALTER PUBLICATION supabase_realtime ADD TABLE participants;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE predictions;
ALTER PUBLICATION supabase_realtime ADD TABLE champion_predictions;

-- ── FOTO DE PERFIL ────────────────────────────────────────────────────────────

-- 1. Adiciona coluna avatar_url na tabela participants
ALTER TABLE participants ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Cria o bucket de armazenamento de fotos (execute no SQL Editor)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,  -- 5MB
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif']
) ON CONFLICT (id) DO NOTHING;

-- 3. Políticas de acesso ao storage
CREATE POLICY "Qualquer um pode fazer upload de avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Qualquer um pode ler avatares"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Qualquer um pode atualizar avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars');

CREATE POLICY "Qualquer um pode deletar avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars');
