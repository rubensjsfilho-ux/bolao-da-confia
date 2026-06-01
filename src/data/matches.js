// ============================================================
// TABELA DE JOGOS — COPA DO MUNDO FIFA 2026
// Horários em UTC-3 (Horário de Brasília)
// Fase de Grupos: 11 de junho a 27 de junho de 2026
// ============================================================

export const GROUPS = {
  A: ['México', 'África do Sul', 'Coreia do Sul', 'República Tcheca'],
  B: ['Canadá', 'Catar', 'Suíça', 'Itália'],
  C: ['Brasil', 'Marrocos', 'Haiti', 'Escócia'],
  D: ['Estados Unidos', 'Paraguai', 'Austrália', 'Turquia'],
  E: ['Alemanha', 'Curaçao', 'Costa do Marfim', 'Equador'],
  F: ['Holanda', 'Japão', 'Tunísia', 'Ucrânia'],
  G: ['Bélgica', 'Egito', 'Irã', 'Nova Zelândia'],
  H: ['Espanha', 'Cabo Verde', 'Arábia Saudita', 'Uruguai'],
  I: ['França', 'Senegal', 'Noruega', 'Iraque'],
  J: ['Argentina', 'Argélia', 'Áustria', 'Jordânia'],
  K: ['Portugal', 'Uzbequistão', 'Colômbia', 'RD Congo'],
  L: ['Inglaterra', 'Croácia', 'Gana', 'Panamá'],
}

export const FLAGS = {
  'México': '🇲🇽',
  'África do Sul': '🇿🇦',
  'Coreia do Sul': '🇰🇷',
  'República Tcheca': '🇨🇿',
  'Canadá': '🇨🇦',
  'Catar': '🇶🇦',
  'Suíça': '🇨🇭',
  'Itália': '🇮🇹',
  'Brasil': '🇧🇷',
  'Marrocos': '🇲🇦',
  'Haiti': '🇭🇹',
  'Escócia': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Estados Unidos': '🇺🇸',
  'Paraguai': '🇵🇾',
  'Austrália': '🇦🇺',
  'Turquia': '🇹🇷',
  'Alemanha': '🇩🇪',
  'Curaçao': '🇨🇼',
  'Costa do Marfim': '🇨🇮',
  'Equador': '🇪🇨',
  'Holanda': '🇳🇱',
  'Japão': '🇯🇵',
  'Tunísia': '🇹🇳',
  'Ucrânia': '🇺🇦',
  'Bélgica': '🇧🇪',
  'Egito': '🇪🇬',
  'Irã': '🇮🇷',
  'Nova Zelândia': '🇳🇿',
  'Espanha': '🇪🇸',
  'Cabo Verde': '🇨🇻',
  'Arábia Saudita': '🇸🇦',
  'Uruguai': '🇺🇾',
  'França': '🇫🇷',
  'Senegal': '🇸🇳',
  'Noruega': '🇳🇴',
  'Iraque': '🇮🇶',
  'Argentina': '🇦🇷',
  'Argélia': '🇩🇿',
  'Áustria': '🇦🇹',
  'Jordânia': '🇯🇴',
  'Portugal': '🇵🇹',
  'Uzbequistão': '🇺🇿',
  'Colômbia': '🇨🇴',
  'RD Congo': '🇨🇩',
  'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Croácia': '🇭🇷',
  'Gana': '🇬🇭',
  'Panamá': '🇵🇦',
}

// Fase de grupos — todos os 72 jogos
// Formato: { id, team1, team2, date (ISO com horário BRT), group, venue, city, phase }
export const GROUP_MATCHES = [
  // ─── RODADA 1 ────────────────────────────────────────────────
  // GRUPO A
  { id: 1,  team1: 'México',         team2: 'África do Sul',   date: '2026-06-11T16:00:00', group: 'A', venue: 'Estádio Azteca',             city: 'Cidade do México', phase: 'Fase de Grupos' },
  { id: 2,  team1: 'Coreia do Sul',  team2: 'República Tcheca',date: '2026-06-12T13:00:00', group: 'A', venue: 'AT&T Stadium',                city: 'Dallas',           phase: 'Fase de Grupos' },
  // GRUPO B
  { id: 3,  team1: 'Canadá',         team2: 'Catar',           date: '2026-06-12T16:00:00', group: 'B', venue: 'BMO Field',                   city: 'Toronto',          phase: 'Fase de Grupos' },
  { id: 4,  team1: 'Suíça',          team2: 'Itália',          date: '2026-06-12T22:00:00', group: 'B', venue: 'Lumen Field',                  city: 'Seattle',          phase: 'Fase de Grupos' },
  // GRUPO C
  { id: 5,  team1: 'Brasil',         team2: 'Marrocos',        date: '2026-06-13T19:00:00', group: 'C', venue: 'MetLife Stadium',              city: 'Nova York/NJ',     phase: 'Fase de Grupos' },
  { id: 6,  team1: 'Haiti',          team2: 'Escócia',         date: '2026-06-13T22:00:00', group: 'C', venue: 'Arrowhead Stadium',            city: 'Kansas City',      phase: 'Fase de Grupos' },
  // GRUPO D
  { id: 7,  team1: 'Estados Unidos', team2: 'Paraguai',        date: '2026-06-12T21:00:00', group: 'D', venue: 'SoFi Stadium',                 city: 'Los Angeles',      phase: 'Fase de Grupos' },
  { id: 8,  team1: 'Austrália',      team2: 'Turquia',         date: '2026-06-14T13:00:00', group: 'D', venue: 'Mercedes-Benz Stadium',        city: 'Atlanta',          phase: 'Fase de Grupos' },
  // GRUPO E
  { id: 9,  team1: 'Alemanha',       team2: 'Curaçao',         date: '2026-06-14T19:00:00', group: 'E', venue: 'NRG Stadium',                  city: 'Houston',          phase: 'Fase de Grupos' },
  { id: 10, team1: 'Costa do Marfim',team2: 'Equador',         date: '2026-06-14T22:00:00', group: 'E', venue: 'Gillette Stadium',             city: 'Boston',           phase: 'Fase de Grupos' },
  // GRUPO F
  { id: 11, team1: 'Holanda',        team2: 'Japão',           date: '2026-06-15T13:00:00', group: 'F', venue: 'BC Place',                     city: 'Vancouver',        phase: 'Fase de Grupos' },
  { id: 12, team1: 'Tunísia',        team2: 'Ucrânia',         date: '2026-06-15T22:00:00', group: 'F', venue: 'Estadio BBVA',                 city: 'Monterrey',        phase: 'Fase de Grupos' },
  // GRUPO G
  { id: 13, team1: 'Bélgica',        team2: 'Egito',           date: '2026-06-15T16:00:00', group: 'G', venue: 'Lincoln Financial Field',      city: 'Filadélfia',       phase: 'Fase de Grupos' },
  { id: 14, team1: 'Irã',            team2: 'Nova Zelândia',   date: '2026-06-16T13:00:00', group: 'G', venue: 'Hard Rock Stadium',            city: 'Miami',            phase: 'Fase de Grupos' },
  // GRUPO H
  { id: 15, team1: 'Espanha',        team2: 'Cabo Verde',      date: '2026-06-15T12:00:00', group: 'H', venue: 'Mercedes-Benz Stadium',        city: 'Atlanta',          phase: 'Fase de Grupos' },
  { id: 16, team1: 'Arábia Saudita', team2: 'Uruguai',         date: '2026-06-16T22:00:00', group: 'H', venue: 'Levi\'s Stadium',              city: 'San Francisco',    phase: 'Fase de Grupos' },
  // GRUPO I
  { id: 17, team1: 'França',         team2: 'Senegal',         date: '2026-06-16T16:00:00', group: 'I', venue: 'MetLife Stadium',              city: 'Nova York/NJ',     phase: 'Fase de Grupos' },
  { id: 18, team1: 'Noruega',        team2: 'Iraque',          date: '2026-06-16T19:00:00', group: 'I', venue: 'SoFi Stadium',                 city: 'Los Angeles',      phase: 'Fase de Grupos' },
  // GRUPO J
  { id: 19, team1: 'Argentina',      team2: 'Argélia',         date: '2026-06-17T16:00:00', group: 'J', venue: 'AT&T Stadium',                 city: 'Dallas',           phase: 'Fase de Grupos' },
  { id: 20, team1: 'Áustria',        team2: 'Jordânia',        date: '2026-06-17T19:00:00', group: 'J', venue: 'Estadio Jalisco',              city: 'Guadalajara',      phase: 'Fase de Grupos' },
  // GRUPO K
  { id: 21, team1: 'Portugal',       team2: 'Uzbequistão',     date: '2026-06-17T13:00:00', group: 'K', venue: 'Arrowhead Stadium',            city: 'Kansas City',      phase: 'Fase de Grupos' },
  { id: 22, team1: 'Colômbia',       team2: 'RD Congo',        date: '2026-06-17T22:00:00', group: 'K', venue: 'Hard Rock Stadium',            city: 'Miami',            phase: 'Fase de Grupos' },
  // GRUPO L
  { id: 23, team1: 'Inglaterra',     team2: 'Croácia',         date: '2026-06-18T16:00:00', group: 'L', venue: 'NRG Stadium',                  city: 'Houston',          phase: 'Fase de Grupos' },
  { id: 24, team1: 'Gana',           team2: 'Panamá',          date: '2026-06-18T22:00:00', group: 'L', venue: 'Lumen Field',                  city: 'Seattle',          phase: 'Fase de Grupos' },

  // ─── RODADA 2 ────────────────────────────────────────────────
  // GRUPO A
  { id: 25, team1: 'México',         team2: 'Coreia do Sul',   date: '2026-06-19T16:00:00', group: 'A', venue: 'Estadio Azteca',               city: 'Cidade do México', phase: 'Fase de Grupos' },
  { id: 26, team1: 'África do Sul',  team2: 'República Tcheca',date: '2026-06-19T19:00:00', group: 'A', venue: 'Gillette Stadium',             city: 'Boston',           phase: 'Fase de Grupos' },
  // GRUPO B
  { id: 27, team1: 'Canadá',         team2: 'Suíça',           date: '2026-06-20T16:00:00', group: 'B', venue: 'BC Place',                     city: 'Vancouver',        phase: 'Fase de Grupos' },
  { id: 28, team1: 'Catar',          team2: 'Itália',          date: '2026-06-20T22:00:00', group: 'B', venue: 'SoFi Stadium',                 city: 'Los Angeles',      phase: 'Fase de Grupos' },
  // GRUPO C
  { id: 29, team1: 'Brasil',         team2: 'Haiti',           date: '2026-06-19T21:30:00', group: 'C', venue: 'Lincoln Financial Field',      city: 'Filadélfia',       phase: 'Fase de Grupos' },
  { id: 30, team1: 'Marrocos',       team2: 'Escócia',         date: '2026-06-19T13:00:00', group: 'C', venue: 'Estadio BBVA',                 city: 'Monterrey',        phase: 'Fase de Grupos' },
  // GRUPO D
  { id: 31, team1: 'Estados Unidos', team2: 'Austrália',       date: '2026-06-21T19:00:00', group: 'D', venue: 'Levi\'s Stadium',              city: 'San Francisco',    phase: 'Fase de Grupos' },
  { id: 32, team1: 'Paraguai',       team2: 'Turquia',         date: '2026-06-20T13:00:00', group: 'D', venue: 'Arrowhead Stadium',            city: 'Kansas City',      phase: 'Fase de Grupos' },
  // GRUPO E
  { id: 33, team1: 'Alemanha',       team2: 'Costa do Marfim', date: '2026-06-21T13:00:00', group: 'E', venue: 'MetLife Stadium',              city: 'Nova York/NJ',     phase: 'Fase de Grupos' },
  { id: 34, team1: 'Curaçao',        team2: 'Equador',         date: '2026-06-21T22:00:00', group: 'E', venue: 'Mercedes-Benz Stadium',        city: 'Atlanta',          phase: 'Fase de Grupos' },
  // GRUPO F
  { id: 35, team1: 'Holanda',        team2: 'Tunísia',         date: '2026-06-22T13:00:00', group: 'F', venue: 'AT&T Stadium',                 city: 'Dallas',           phase: 'Fase de Grupos' },
  { id: 36, team1: 'Japão',          team2: 'Ucrânia',         date: '2026-06-22T22:00:00', group: 'F', venue: 'Hard Rock Stadium',            city: 'Miami',            phase: 'Fase de Grupos' },
  // GRUPO G
  { id: 37, team1: 'Bélgica',        team2: 'Irã',             date: '2026-06-22T16:00:00', group: 'G', venue: 'NRG Stadium',                  city: 'Houston',          phase: 'Fase de Grupos' },
  { id: 38, team1: 'Egito',          team2: 'Nova Zelândia',   date: '2026-06-22T19:00:00', group: 'G', venue: 'Gillette Stadium',             city: 'Boston',           phase: 'Fase de Grupos' },
  // GRUPO H
  { id: 39, team1: 'Espanha',        team2: 'Arábia Saudita',  date: '2026-06-21T12:00:00', group: 'H', venue: 'Mercedes-Benz Stadium',        city: 'Atlanta',          phase: 'Fase de Grupos' },
  { id: 40, team1: 'Cabo Verde',     team2: 'Uruguai',         date: '2026-06-23T16:00:00', group: 'H', venue: 'Lumen Field',                  city: 'Seattle',          phase: 'Fase de Grupos' },
  // GRUPO I
  { id: 41, team1: 'França',         team2: 'Noruega',         date: '2026-06-23T19:00:00', group: 'I', venue: 'Lincoln Financial Field',      city: 'Filadélfia',       phase: 'Fase de Grupos' },
  { id: 42, team1: 'Senegal',        team2: 'Iraque',          date: '2026-06-23T22:00:00', group: 'I', venue: 'Estadio Jalisco',              city: 'Guadalajara',      phase: 'Fase de Grupos' },
  // GRUPO J
  { id: 43, team1: 'Argentina',      team2: 'Áustria',         date: '2026-06-23T13:00:00', group: 'J', venue: 'BC Place',                     city: 'Vancouver',        phase: 'Fase de Grupos' },
  { id: 44, team1: 'Argélia',        team2: 'Jordânia',        date: '2026-06-24T13:00:00', group: 'J', venue: 'SoFi Stadium',                 city: 'Los Angeles',      phase: 'Fase de Grupos' },
  // GRUPO K
  { id: 45, team1: 'Portugal',       team2: 'Colômbia',        date: '2026-06-24T16:00:00', group: 'K', venue: 'Arrowhead Stadium',            city: 'Kansas City',      phase: 'Fase de Grupos' },
  { id: 46, team1: 'Uzbequistão',    team2: 'RD Congo',        date: '2026-06-24T19:00:00', group: 'K', venue: 'Levi\'s Stadium',              city: 'San Francisco',    phase: 'Fase de Grupos' },
  // GRUPO L
  { id: 47, team1: 'Inglaterra',     team2: 'Gana',            date: '2026-06-24T22:00:00', group: 'L', venue: 'AT&T Stadium',                 city: 'Dallas',           phase: 'Fase de Grupos' },
  { id: 48, team1: 'Croácia',        team2: 'Panamá',          date: '2026-06-25T13:00:00', group: 'L', venue: 'NRG Stadium',                  city: 'Houston',          phase: 'Fase de Grupos' },

  // ─── RODADA 3 ────────────────────────────────────────────────
  // GRUPO A
  { id: 49, team1: 'México',         team2: 'República Tcheca',date: '2026-06-25T16:00:00', group: 'A', venue: 'MetLife Stadium',              city: 'Nova York/NJ',     phase: 'Fase de Grupos' },
  { id: 50, team1: 'África do Sul',  team2: 'Coreia do Sul',   date: '2026-06-25T16:00:00', group: 'A', venue: 'Gillette Stadium',             city: 'Boston',           phase: 'Fase de Grupos' },
  // GRUPO B
  { id: 51, team1: 'Canadá',         team2: 'Itália',          date: '2026-06-25T19:00:00', group: 'B', venue: 'BC Place',                     city: 'Vancouver',        phase: 'Fase de Grupos' },
  { id: 52, team1: 'Catar',          team2: 'Suíça',           date: '2026-06-25T19:00:00', group: 'B', venue: 'Lumen Field',                  city: 'Seattle',          phase: 'Fase de Grupos' },
  // GRUPO C
  { id: 53, team1: 'Brasil',         team2: 'Escócia',         date: '2026-06-24T19:00:00', group: 'C', venue: 'Hard Rock Stadium',            city: 'Miami',            phase: 'Fase de Grupos' },
  { id: 54, team1: 'Marrocos',       team2: 'Haiti',           date: '2026-06-24T19:00:00', group: 'C', venue: 'Lincoln Financial Field',      city: 'Filadélfia',       phase: 'Fase de Grupos' },
  // GRUPO D
  { id: 55, team1: 'Estados Unidos', team2: 'Turquia',         date: '2026-06-26T13:00:00', group: 'D', venue: 'SoFi Stadium',                 city: 'Los Angeles',      phase: 'Fase de Grupos' },
  { id: 56, team1: 'Paraguai',       team2: 'Austrália',       date: '2026-06-26T13:00:00', group: 'D', venue: 'AT&T Stadium',                 city: 'Dallas',           phase: 'Fase de Grupos' },
  // GRUPO E
  { id: 57, team1: 'Alemanha',       team2: 'Equador',         date: '2026-06-26T16:00:00', group: 'E', venue: 'NRG Stadium',                  city: 'Houston',          phase: 'Fase de Grupos' },
  { id: 58, team1: 'Curaçao',        team2: 'Costa do Marfim', date: '2026-06-26T16:00:00', group: 'E', venue: 'Mercedes-Benz Stadium',        city: 'Atlanta',          phase: 'Fase de Grupos' },
  // GRUPO F
  { id: 59, team1: 'Holanda',        team2: 'Ucrânia',         date: '2026-06-26T19:00:00', group: 'F', venue: 'Arrowhead Stadium',            city: 'Kansas City',      phase: 'Fase de Grupos' },
  { id: 60, team1: 'Japão',          team2: 'Tunísia',         date: '2026-06-26T19:00:00', group: 'F', venue: 'Levi\'s Stadium',              city: 'San Francisco',    phase: 'Fase de Grupos' },
  // GRUPO G
  { id: 61, team1: 'Bélgica',        team2: 'Nova Zelândia',   date: '2026-06-26T22:00:00', group: 'G', venue: 'Hard Rock Stadium',            city: 'Miami',            phase: 'Fase de Grupos' },
  { id: 62, team1: 'Egito',          team2: 'Irã',             date: '2026-06-26T22:00:00', group: 'G', venue: 'Estadio BBVA',                 city: 'Monterrey',        phase: 'Fase de Grupos' },
  // GRUPO H
  { id: 63, team1: 'Espanha',        team2: 'Uruguai',         date: '2026-06-27T13:00:00', group: 'H', venue: 'Lincoln Financial Field',      city: 'Filadélfia',       phase: 'Fase de Grupos' },
  { id: 64, team1: 'Cabo Verde',     team2: 'Arábia Saudita',  date: '2026-06-27T13:00:00', group: 'H', venue: 'BC Place',                     city: 'Vancouver',        phase: 'Fase de Grupos' },
  // GRUPO I
  { id: 65, team1: 'França',         team2: 'Iraque',          date: '2026-06-27T16:00:00', group: 'I', venue: 'MetLife Stadium',              city: 'Nova York/NJ',     phase: 'Fase de Grupos' },
  { id: 66, team1: 'Senegal',        team2: 'Noruega',         date: '2026-06-27T16:00:00', group: 'I', venue: 'Gillette Stadium',             city: 'Boston',           phase: 'Fase de Grupos' },
  // GRUPO J
  { id: 67, team1: 'Argentina',      team2: 'Jordânia',        date: '2026-06-27T19:00:00', group: 'J', venue: 'AT&T Stadium',                 city: 'Dallas',           phase: 'Fase de Grupos' },
  { id: 68, team1: 'Argélia',        team2: 'Áustria',         date: '2026-06-27T19:00:00', group: 'J', venue: 'NRG Stadium',                  city: 'Houston',          phase: 'Fase de Grupos' },
  // GRUPO K
  { id: 69, team1: 'Portugal',       team2: 'RD Congo',        date: '2026-06-27T22:00:00', group: 'K', venue: 'SoFi Stadium',                 city: 'Los Angeles',      phase: 'Fase de Grupos' },
  { id: 70, team1: 'Uzbequistão',    team2: 'Colômbia',        date: '2026-06-27T22:00:00', group: 'K', venue: 'Lumen Field',                  city: 'Seattle',          phase: 'Fase de Grupos' },
  // GRUPO L
  { id: 71, team1: 'Inglaterra',     team2: 'Panamá',          date: '2026-06-27T13:00:00', group: 'L', venue: 'Arrowhead Stadium',            city: 'Kansas City',      phase: 'Fase de Grupos' },
  { id: 72, team1: 'Croácia',        team2: 'Gana',            date: '2026-06-27T13:00:00', group: 'L', venue: 'Estadio Jalisco',              city: 'Guadalajara',      phase: 'Fase de Grupos' },
]

// Funções utilitárias
export function getFlag(teamName) {
  return FLAGS[teamName] || '🏳️'
}

export function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })
}

export function isMatchOpen(match) {
  // Palpites fecham 30 min antes do jogo
  const matchTime = new Date(match.date)
  const cutoff = new Date(matchTime.getTime() - 30 * 60 * 1000)
  return new Date() < cutoff
}
