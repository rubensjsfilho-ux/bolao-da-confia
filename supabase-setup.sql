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

-- GRUPO A
(1,  'México',          'África do Sul',    '2026-06-11 19:00:00+00', 'Fase de Grupos', 'A', 'Estádio Azteca',          'Cidade do México'),
(2,  'Coreia do Sul',   'República Tcheca', '2026-06-12 16:00:00+00', 'Fase de Grupos', 'A', 'AT&T Stadium',             'Dallas'),
(25, 'México',          'Coreia do Sul',    '2026-06-19 19:00:00+00', 'Fase de Grupos', 'A', 'Estádio Azteca',          'Cidade do México'),
(26, 'África do Sul',   'República Tcheca', '2026-06-19 22:00:00+00', 'Fase de Grupos', 'A', 'Gillette Stadium',         'Boston'),
(49, 'México',          'República Tcheca', '2026-06-25 19:00:00+00', 'Fase de Grupos', 'A', 'MetLife Stadium',          'Nova York/NJ'),
(50, 'África do Sul',   'Coreia do Sul',    '2026-06-25 19:00:00+00', 'Fase de Grupos', 'A', 'Gillette Stadium',         'Boston'),

-- GRUPO B
(3,  'Canadá',          'Catar',            '2026-06-12 19:00:00+00', 'Fase de Grupos', 'B', 'BMO Field',                'Toronto'),
(4,  'Suíça',           'Itália',           '2026-06-13 01:00:00+00', 'Fase de Grupos', 'B', 'Lumen Field',              'Seattle'),
(27, 'Canadá',          'Suíça',            '2026-06-20 19:00:00+00', 'Fase de Grupos', 'B', 'BC Place',                 'Vancouver'),
(28, 'Catar',           'Itália',           '2026-06-21 01:00:00+00', 'Fase de Grupos', 'B', 'SoFi Stadium',             'Los Angeles'),
(51, 'Canadá',          'Itália',           '2026-06-25 22:00:00+00', 'Fase de Grupos', 'B', 'BC Place',                 'Vancouver'),
(52, 'Catar',           'Suíça',            '2026-06-25 22:00:00+00', 'Fase de Grupos', 'B', 'Lumen Field',              'Seattle'),

-- GRUPO C
(5,  'Brasil',          'Marrocos',         '2026-06-13 22:00:00+00', 'Fase de Grupos', 'C', 'MetLife Stadium',          'Nova York/NJ'),
(6,  'Haiti',           'Escócia',          '2026-06-14 01:00:00+00', 'Fase de Grupos', 'C', 'Arrowhead Stadium',        'Kansas City'),
(29, 'Brasil',          'Haiti',            '2026-06-20 00:30:00+00', 'Fase de Grupos', 'C', 'Lincoln Financial Field',  'Filadélfia'),
(30, 'Marrocos',        'Escócia',          '2026-06-19 16:00:00+00', 'Fase de Grupos', 'C', 'Estadio BBVA',             'Monterrey'),
(53, 'Brasil',          'Escócia',          '2026-06-24 22:00:00+00', 'Fase de Grupos', 'C', 'Hard Rock Stadium',        'Miami'),
(54, 'Marrocos',        'Haiti',            '2026-06-24 22:00:00+00', 'Fase de Grupos', 'C', 'Lincoln Financial Field',  'Filadélfia'),

-- GRUPO D
(7,  'Estados Unidos',  'Paraguai',         '2026-06-13 00:00:00+00', 'Fase de Grupos', 'D', 'SoFi Stadium',             'Los Angeles'),
(8,  'Austrália',       'Turquia',          '2026-06-14 16:00:00+00', 'Fase de Grupos', 'D', 'Mercedes-Benz Stadium',    'Atlanta'),
(31, 'Estados Unidos',  'Austrália',        '2026-06-21 22:00:00+00', 'Fase de Grupos', 'D', 'Levi''s Stadium',          'San Francisco'),
(32, 'Paraguai',        'Turquia',          '2026-06-20 16:00:00+00', 'Fase de Grupos', 'D', 'Arrowhead Stadium',        'Kansas City'),
(55, 'Estados Unidos',  'Turquia',          '2026-06-26 16:00:00+00', 'Fase de Grupos', 'D', 'SoFi Stadium',             'Los Angeles'),
(56, 'Paraguai',        'Austrália',        '2026-06-26 16:00:00+00', 'Fase de Grupos', 'D', 'AT&T Stadium',             'Dallas'),

-- GRUPO E
(9,  'Alemanha',        'Curaçao',          '2026-06-14 22:00:00+00', 'Fase de Grupos', 'E', 'NRG Stadium',              'Houston'),
(10, 'Costa do Marfim', 'Equador',          '2026-06-15 01:00:00+00', 'Fase de Grupos', 'E', 'Gillette Stadium',         'Boston'),
(33, 'Alemanha',        'Costa do Marfim',  '2026-06-21 16:00:00+00', 'Fase de Grupos', 'E', 'MetLife Stadium',          'Nova York/NJ'),
(34, 'Curaçao',         'Equador',          '2026-06-22 01:00:00+00', 'Fase de Grupos', 'E', 'Mercedes-Benz Stadium',    'Atlanta'),
(57, 'Alemanha',        'Equador',          '2026-06-26 19:00:00+00', 'Fase de Grupos', 'E', 'NRG Stadium',              'Houston'),
(58, 'Curaçao',         'Costa do Marfim',  '2026-06-26 19:00:00+00', 'Fase de Grupos', 'E', 'Mercedes-Benz Stadium',    'Atlanta'),

-- GRUPO F
(11, 'Holanda',         'Japão',            '2026-06-15 16:00:00+00', 'Fase de Grupos', 'F', 'BC Place',                 'Vancouver'),
(12, 'Tunísia',         'Ucrânia',          '2026-06-16 01:00:00+00', 'Fase de Grupos', 'F', 'Estadio BBVA',             'Monterrey'),
(35, 'Holanda',         'Tunísia',          '2026-06-22 16:00:00+00', 'Fase de Grupos', 'F', 'AT&T Stadium',             'Dallas'),
(36, 'Japão',           'Ucrânia',          '2026-06-23 01:00:00+00', 'Fase de Grupos', 'F', 'Hard Rock Stadium',        'Miami'),
(59, 'Holanda',         'Ucrânia',          '2026-06-26 22:00:00+00', 'Fase de Grupos', 'F', 'Arrowhead Stadium',        'Kansas City'),
(60, 'Japão',           'Tunísia',          '2026-06-26 22:00:00+00', 'Fase de Grupos', 'F', 'Levi''s Stadium',          'San Francisco'),

-- GRUPO G
(13, 'Bélgica',         'Egito',            '2026-06-15 19:00:00+00', 'Fase de Grupos', 'G', 'Lincoln Financial Field',  'Filadélfia'),
(14, 'Irã',             'Nova Zelândia',    '2026-06-16 16:00:00+00', 'Fase de Grupos', 'G', 'Hard Rock Stadium',        'Miami'),
(37, 'Bélgica',         'Irã',              '2026-06-22 19:00:00+00', 'Fase de Grupos', 'G', 'NRG Stadium',              'Houston'),
(38, 'Egito',           'Nova Zelândia',    '2026-06-22 22:00:00+00', 'Fase de Grupos', 'G', 'Gillette Stadium',         'Boston'),
(61, 'Bélgica',         'Nova Zelândia',    '2026-06-27 01:00:00+00', 'Fase de Grupos', 'G', 'Hard Rock Stadium',        'Miami'),
(62, 'Egito',           'Irã',              '2026-06-27 01:00:00+00', 'Fase de Grupos', 'G', 'Estadio BBVA',             'Monterrey'),

-- GRUPO H
(15, 'Espanha',         'Cabo Verde',       '2026-06-15 15:00:00+00', 'Fase de Grupos', 'H', 'Mercedes-Benz Stadium',    'Atlanta'),
(16, 'Arábia Saudita',  'Uruguai',          '2026-06-17 01:00:00+00', 'Fase de Grupos', 'H', 'Levi''s Stadium',          'San Francisco'),
(39, 'Espanha',         'Arábia Saudita',   '2026-06-21 15:00:00+00', 'Fase de Grupos', 'H', 'Mercedes-Benz Stadium',    'Atlanta'),
(40, 'Cabo Verde',      'Uruguai',          '2026-06-23 19:00:00+00', 'Fase de Grupos', 'H', 'Lumen Field',              'Seattle'),
(63, 'Espanha',         'Uruguai',          '2026-06-27 16:00:00+00', 'Fase de Grupos', 'H', 'Lincoln Financial Field',  'Filadélfia'),
(64, 'Cabo Verde',      'Arábia Saudita',   '2026-06-27 16:00:00+00', 'Fase de Grupos', 'H', 'BC Place',                 'Vancouver'),

-- GRUPO I
(17, 'França',          'Senegal',          '2026-06-16 19:00:00+00', 'Fase de Grupos', 'I', 'MetLife Stadium',          'Nova York/NJ'),
(18, 'Noruega',         'Iraque',           '2026-06-16 22:00:00+00', 'Fase de Grupos', 'I', 'SoFi Stadium',             'Los Angeles'),
(41, 'França',          'Noruega',          '2026-06-23 22:00:00+00', 'Fase de Grupos', 'I', 'Lincoln Financial Field',  'Filadélfia'),
(42, 'Senegal',         'Iraque',           '2026-06-24 01:00:00+00', 'Fase de Grupos', 'I', 'Estadio Jalisco',          'Guadalajara'),
(65, 'França',          'Iraque',           '2026-06-27 19:00:00+00', 'Fase de Grupos', 'I', 'MetLife Stadium',          'Nova York/NJ'),
(66, 'Senegal',         'Noruega',          '2026-06-27 19:00:00+00', 'Fase de Grupos', 'I', 'Gillette Stadium',         'Boston'),

-- GRUPO J
(19, 'Argentina',       'Argélia',          '2026-06-17 19:00:00+00', 'Fase de Grupos', 'J', 'AT&T Stadium',             'Dallas'),
(20, 'Áustria',         'Jordânia',         '2026-06-17 22:00:00+00', 'Fase de Grupos', 'J', 'Estadio Jalisco',          'Guadalajara'),
(43, 'Argentina',       'Áustria',          '2026-06-23 16:00:00+00', 'Fase de Grupos', 'J', 'BC Place',                 'Vancouver'),
(44, 'Argélia',         'Jordânia',         '2026-06-24 16:00:00+00', 'Fase de Grupos', 'J', 'SoFi Stadium',             'Los Angeles'),
(67, 'Argentina',       'Jordânia',         '2026-06-27 22:00:00+00', 'Fase de Grupos', 'J', 'AT&T Stadium',             'Dallas'),
(68, 'Argélia',         'Áustria',          '2026-06-27 22:00:00+00', 'Fase de Grupos', 'J', 'NRG Stadium',              'Houston'),

-- GRUPO K
(21, 'Portugal',        'Uzbequistão',      '2026-06-17 16:00:00+00', 'Fase de Grupos', 'K', 'Arrowhead Stadium',        'Kansas City'),
(22, 'Colômbia',        'RD Congo',         '2026-06-18 01:00:00+00', 'Fase de Grupos', 'K', 'Hard Rock Stadium',        'Miami'),
(45, 'Portugal',        'Colômbia',         '2026-06-24 19:00:00+00', 'Fase de Grupos', 'K', 'Arrowhead Stadium',        'Kansas City'),
(46, 'Uzbequistão',     'RD Congo',         '2026-06-24 22:00:00+00', 'Fase de Grupos', 'K', 'Levi''s Stadium',          'San Francisco'),
(69, 'Portugal',        'RD Congo',         '2026-06-28 01:00:00+00', 'Fase de Grupos', 'K', 'SoFi Stadium',             'Los Angeles'),
(70, 'Uzbequistão',     'Colômbia',         '2026-06-28 01:00:00+00', 'Fase de Grupos', 'K', 'Lumen Field',              'Seattle'),

-- GRUPO L
(23, 'Inglaterra',      'Croácia',          '2026-06-18 19:00:00+00', 'Fase de Grupos', 'L', 'NRG Stadium',              'Houston'),
(24, 'Gana',            'Panamá',           '2026-06-19 01:00:00+00', 'Fase de Grupos', 'L', 'Lumen Field',              'Seattle'),
(47, 'Inglaterra',      'Gana',             '2026-06-25 01:00:00+00', 'Fase de Grupos', 'L', 'AT&T Stadium',             'Dallas'),
(48, 'Croácia',         'Panamá',           '2026-06-25 16:00:00+00', 'Fase de Grupos', 'L', 'NRG Stadium',              'Houston'),
(71, 'Inglaterra',      'Panamá',           '2026-06-27 16:00:00+00', 'Fase de Grupos', 'L', 'Arrowhead Stadium',        'Kansas City'),
(72, 'Croácia',         'Gana',             '2026-06-27 16:00:00+00', 'Fase de Grupos', 'L', 'Estadio Jalisco',          'Guadalajara')

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
