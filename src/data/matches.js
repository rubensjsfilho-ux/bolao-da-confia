import React from 'react'
// ============================================================
// COPA DO MUNDO 2026 — TABELA OFICIAL FASE DE GRUPOS
// Horários em BRT (UTC-3) — Fonte: FIFA / Soccerway
// Times confirmados após repescagens (março 2026):
// UEFA: Turquia, Suécia, República Tcheca, Bósnia e Herz.
// Intercontinental: Iraque, RD Congo
// ============================================================

export const GROUPS = {
  A: ['México',          'África do Sul',    'Coreia do Sul',     'República Tcheca'],
  B: ['Canadá',          'Bósnia e Herz.',   'Catar',             'Suíça'],
  C: ['Brasil',          'Marrocos',         'Haiti',             'Escócia'],
  D: ['Estados Unidos',  'Paraguai',         'Austrália',         'Turquia'],
  E: ['Alemanha',        'Curaçao',          'Costa do Marfim',   'Equador'],
  F: ['Holanda',         'Japão',            'Suécia',            'Tunísia'],
  G: ['Bélgica',         'Egito',            'Irã',               'Nova Zelândia'],
  H: ['Espanha',         'Cabo Verde',       'Arábia Saudita',    'Uruguai'],
  I: ['França',          'Senegal',          'Noruega',           'Iraque'],
  J: ['Argentina',       'Argélia',          'Áustria',           'Jordânia'],
  K: ['Portugal',        'RD Congo',         'Uzbequistão',       'Colômbia'],
  L: ['Inglaterra',      'Croácia',          'Gana',              'Panamá'],
}

export const FLAGS = {
  'México':           'mx', 'África do Sul':   'za', 'Coreia do Sul':   'kr', 'República Tcheca':'cz',
  'Canadá':           'ca', 'Bósnia e Herz.':  'ba', 'Catar':           'qa', 'Suíça':           'ch',
  'Brasil':           'br', 'Marrocos':        'ma', 'Haiti':           'ht', 'Escócia':         'gb-sct',
  'Estados Unidos':   'us', 'Paraguai':        'py', 'Austrália':       'au', 'Turquia':         'tr',
  'Alemanha':         'de', 'Curaçao':         'cw', 'Costa do Marfim': 'ci', 'Equador':         'ec',
  'Holanda':          'nl', 'Japão':           'jp', 'Suécia':          'se', 'Tunísia':         'tn',
  'Bélgica':          'be', 'Egito':           'eg', 'Irã':             'ir', 'Nova Zelândia':   'nz',
  'Espanha':          'es', 'Cabo Verde':      'cv', 'Arábia Saudita':  'sa', 'Uruguai':         'uy',
  'França':           'fr', 'Senegal':         'sn', 'Noruega':         'no', 'Iraque':          'iq',
  'Argentina':        'ar', 'Argélia':         'dz', 'Áustria':         'at', 'Jordânia':        'jo',
  'Portugal':         'pt', 'RD Congo':        'cd', 'Uzbequistão':     'uz', 'Colômbia':        'co',
  'Inglaterra':       'gb-eng', 'Croácia':     'hr', 'Gana':            'gh', 'Panamá':          'pa',
}

// Todos os 72 jogos da fase de grupos
// date: ISO com fuso BRT (UTC-3)
export const GROUP_MATCHES = [

  // ─── RODADA 1 ──────────────────────────────────────────────────────────────
  // GRUPO A
  { id:1,  team1:'México',         team2:'África do Sul',  date:'2026-06-11T16:00:00-03:00', group:'A', city:'Cidade do México', venue:'Estádio Azteca',           phase:'Fase de Grupos' },
  { id:2,  team1:'Coreia do Sul',  team2:'República Tcheca',date:'2026-06-11T23:00:00-03:00',group:'A', city:'Guadalajara',       venue:'Estadio Jalisco',           phase:'Fase de Grupos' },
  // GRUPO B
  { id:3,  team1:'Canadá',         team2:'Bósnia e Herz.', date:'2026-06-12T16:00:00-03:00', group:'B', city:'Toronto',           venue:'BMO Field',                 phase:'Fase de Grupos' },
  { id:4,  team1:'Estados Unidos', team2:'Paraguai',        date:'2026-06-12T22:00:00-03:00', group:'D', city:'Los Angeles',       venue:'SoFi Stadium',              phase:'Fase de Grupos' },
  // GRUPO D
  { id:5,  team1:'Austrália',      team2:'Turquia',         date:'2026-06-14T01:00:00-03:00', group:'D', city:'Vancouver',         venue:'BC Place',                  phase:'Fase de Grupos' },
  { id:6,  team1:'Catar',          team2:'Suíça',           date:'2026-06-13T16:00:00-03:00', group:'B', city:'San Francisco',     venue:'Levi\'s Stadium',           phase:'Fase de Grupos' },
  // GRUPO C
  { id:7,  team1:'Brasil',         team2:'Marrocos',        date:'2026-06-13T19:00:00-03:00', group:'C', city:'Nova York/NJ',      venue:'MetLife Stadium',           phase:'Fase de Grupos' },
  { id:8,  team1:'Haiti',          team2:'Escócia',         date:'2026-06-13T22:00:00-03:00', group:'C', city:'Boston',            venue:'Gillette Stadium',          phase:'Fase de Grupos' },
  // GRUPO E
  { id:9,  team1:'Alemanha',       team2:'Curaçao',         date:'2026-06-14T14:00:00-03:00', group:'E', city:'Houston',           venue:'NRG Stadium',               phase:'Fase de Grupos' },
  // GRUPO F
  { id:10, team1:'Holanda',        team2:'Japão',           date:'2026-06-14T17:00:00-03:00', group:'F', city:'Dallas',            venue:'AT&T Stadium',              phase:'Fase de Grupos' },
  // GRUPO E
  { id:11, team1:'Costa do Marfim',team2:'Equador',         date:'2026-06-14T20:00:00-03:00', group:'E', city:'Filadélfia',        venue:'Lincoln Financial Field',   phase:'Fase de Grupos' },
  // GRUPO F
  { id:12, team1:'Suécia',         team2:'Tunísia',         date:'2026-06-14T23:00:00-03:00', group:'F', city:'Monterrey',         venue:'Estadio BBVA',              phase:'Fase de Grupos' },
  // GRUPO H
  { id:13, team1:'Espanha',        team2:'Cabo Verde',      date:'2026-06-15T13:00:00-03:00', group:'H', city:'Atlanta',           venue:'Mercedes-Benz Stadium',     phase:'Fase de Grupos' },
  // GRUPO G
  { id:14, team1:'Bélgica',        team2:'Egito',           date:'2026-06-15T16:00:00-03:00', group:'G', city:'Seattle',           venue:'Lumen Field',               phase:'Fase de Grupos' },
  // GRUPO H
  { id:15, team1:'Arábia Saudita', team2:'Uruguai',         date:'2026-06-15T19:00:00-03:00', group:'H', city:'Miami',             venue:'Hard Rock Stadium',         phase:'Fase de Grupos' },
  // GRUPO G
  { id:16, team1:'Irã',            team2:'Nova Zelândia',   date:'2026-06-15T22:00:00-03:00', group:'G', city:'Los Angeles',       venue:'SoFi Stadium',              phase:'Fase de Grupos' },
  // GRUPO J
  { id:17, team1:'Argentina',      team2:'Argélia',         date:'2026-06-16T14:00:00-03:00', group:'J', city:'Kansas City',       venue:'Arrowhead Stadium',         phase:'Fase de Grupos' },
  // GRUPO I
  { id:18, team1:'França',         team2:'Senegal',         date:'2026-06-16T16:00:00-03:00', group:'I', city:'Nova York/NJ',      venue:'MetLife Stadium',           phase:'Fase de Grupos' },
  { id:19, team1:'Iraque',         team2:'Noruega',         date:'2026-06-16T19:00:00-03:00', group:'I', city:'Boston',            venue:'Gillette Stadium',          phase:'Fase de Grupos' },
  // GRUPO J
  { id:20, team1:'Áustria',        team2:'Jordânia',        date:'2026-06-17T01:00:00-03:00', group:'J', city:'San Francisco',     venue:'Levi\'s Stadium',           phase:'Fase de Grupos' },
  // GRUPO K
  { id:21, team1:'Portugal',       team2:'RD Congo',        date:'2026-06-17T14:00:00-03:00', group:'K', city:'Houston',           venue:'NRG Stadium',               phase:'Fase de Grupos' },
  // GRUPO L
  { id:22, team1:'Inglaterra',     team2:'Croácia',         date:'2026-06-17T17:00:00-03:00', group:'L', city:'Dallas',            venue:'AT&T Stadium',              phase:'Fase de Grupos' },
  { id:23, team1:'Gana',           team2:'Panamá',          date:'2026-06-17T20:00:00-03:00', group:'L', city:'Toronto',           venue:'BMO Field',                 phase:'Fase de Grupos' },
  // GRUPO K
  { id:24, team1:'Uzbequistão',    team2:'Colômbia',        date:'2026-06-17T23:00:00-03:00', group:'K', city:'Cidade do México',  venue:'Estadio Azteca',            phase:'Fase de Grupos' },

  // ─── RODADA 2 ──────────────────────────────────────────────────────────────
  // GRUPO A
  { id:25, team1:'República Tcheca',team2:'África do Sul', date:'2026-06-18T13:00:00-03:00', group:'A', city:'Atlanta',           venue:'Mercedes-Benz Stadium',     phase:'Fase de Grupos' },
  // GRUPO B
  { id:26, team1:'Suíça',          team2:'Bósnia e Herz.', date:'2026-06-18T16:00:00-03:00', group:'B', city:'Los Angeles',       venue:'SoFi Stadium',              phase:'Fase de Grupos' },
  { id:27, team1:'Canadá',         team2:'Catar',           date:'2026-06-18T19:00:00-03:00', group:'B', city:'Vancouver',         venue:'BC Place',                  phase:'Fase de Grupos' },
  // GRUPO A
  { id:28, team1:'México',         team2:'Coreia do Sul',   date:'2026-06-18T22:00:00-03:00', group:'A', city:'Guadalajara',       venue:'Estadio Jalisco',           phase:'Fase de Grupos' },
  // GRUPO D
  { id:29, team1:'Turquia',        team2:'Paraguai',        date:'2026-06-19T01:00:00-03:00', group:'D', city:'San Francisco',     venue:'Levi\'s Stadium',           phase:'Fase de Grupos' },
  { id:30, team1:'Estados Unidos', team2:'Austrália',       date:'2026-06-19T16:00:00-03:00', group:'D', city:'Seattle',           venue:'Lumen Field',               phase:'Fase de Grupos' },
  // GRUPO C
  { id:31, team1:'Escócia',        team2:'Marrocos',        date:'2026-06-19T19:00:00-03:00', group:'C', city:'Boston',            venue:'Gillette Stadium',          phase:'Fase de Grupos' },
  { id:32, team1:'Brasil',         team2:'Haiti',           date:'2026-06-19T22:00:00-03:00', group:'C', city:'Filadélfia',        venue:'Lincoln Financial Field',   phase:'Fase de Grupos' },
  // GRUPO F
  { id:33, team1:'Holanda',        team2:'Suécia',          date:'2026-06-20T14:00:00-03:00', group:'F', city:'Houston',           venue:'NRG Stadium',               phase:'Fase de Grupos' },
  // GRUPO E
  { id:34, team1:'Alemanha',       team2:'Costa do Marfim', date:'2026-06-20T17:00:00-03:00', group:'E', city:'Toronto',           venue:'BMO Field',                 phase:'Fase de Grupos' },
  { id:35, team1:'Equador',        team2:'Curaçao',         date:'2026-06-20T21:00:00-03:00', group:'E', city:'Kansas City',       venue:'Arrowhead Stadium',         phase:'Fase de Grupos' },
  // GRUPO F
  { id:36, team1:'Tunísia',        team2:'Japão',           date:'2026-06-21T01:00:00-03:00', group:'F', city:'Monterrey',         venue:'Estadio BBVA',              phase:'Fase de Grupos' },
  // GRUPO H
  { id:37, team1:'Espanha',        team2:'Arábia Saudita',  date:'2026-06-21T13:00:00-03:00', group:'H', city:'Atlanta',           venue:'Mercedes-Benz Stadium',     phase:'Fase de Grupos' },
  // GRUPO G
  { id:38, team1:'Bélgica',        team2:'Irã',             date:'2026-06-21T16:00:00-03:00', group:'G', city:'Los Angeles',       venue:'SoFi Stadium',              phase:'Fase de Grupos' },
  // GRUPO H
  { id:39, team1:'Uruguai',        team2:'Cabo Verde',      date:'2026-06-21T19:00:00-03:00', group:'H', city:'Miami',             venue:'Hard Rock Stadium',         phase:'Fase de Grupos' },
  // GRUPO G
  { id:40, team1:'Nova Zelândia',  team2:'Egito',           date:'2026-06-21T22:00:00-03:00', group:'G', city:'Vancouver',         venue:'BC Place',                  phase:'Fase de Grupos' },
  // GRUPO J
  { id:41, team1:'Argentina',      team2:'Áustria',         date:'2026-06-22T14:00:00-03:00', group:'J', city:'Dallas',            venue:'AT&T Stadium',              phase:'Fase de Grupos' },
  // GRUPO I
  { id:42, team1:'França',         team2:'Iraque',          date:'2026-06-22T18:00:00-03:00', group:'I', city:'Filadélfia',        venue:'Lincoln Financial Field',   phase:'Fase de Grupos' },
  { id:43, team1:'Noruega',        team2:'Senegal',         date:'2026-06-22T21:00:00-03:00', group:'I', city:'Nova York/NJ',      venue:'MetLife Stadium',           phase:'Fase de Grupos' },
  // GRUPO J
  { id:44, team1:'Jordânia',       team2:'Argélia',         date:'2026-06-23T00:00:00-03:00', group:'J', city:'San Francisco',     venue:'Levi\'s Stadium',           phase:'Fase de Grupos' },
  // GRUPO K
  { id:45, team1:'Portugal',       team2:'Uzbequistão',     date:'2026-06-23T14:00:00-03:00', group:'K', city:'Houston',           venue:'NRG Stadium',               phase:'Fase de Grupos' },
  // GRUPO L
  { id:46, team1:'Inglaterra',     team2:'Gana',            date:'2026-06-23T17:00:00-03:00', group:'L', city:'Boston',            venue:'Gillette Stadium',          phase:'Fase de Grupos' },
  { id:47, team1:'Panamá',         team2:'Croácia',         date:'2026-06-23T20:00:00-03:00', group:'L', city:'Toronto',           venue:'BMO Field',                 phase:'Fase de Grupos' },
  // GRUPO K
  { id:48, team1:'Colômbia',       team2:'RD Congo',        date:'2026-06-23T23:00:00-03:00', group:'K', city:'Guadalajara',       venue:'Estadio Jalisco',           phase:'Fase de Grupos' },

  // ─── RODADA 3 ──────────────────────────────────────────────────────────────
  // GRUPO B (simultâneos)
  { id:49, team1:'Suíça',          team2:'Canadá',          date:'2026-06-24T16:00:00-03:00', group:'B', city:'Vancouver',         venue:'BC Place',                  phase:'Fase de Grupos' },
  { id:50, team1:'Bósnia e Herz.', team2:'Catar',           date:'2026-06-24T16:00:00-03:00', group:'B', city:'Seattle',           venue:'Lumen Field',               phase:'Fase de Grupos' },
  // GRUPO C (simultâneos)
  { id:51, team1:'Escócia',        team2:'Brasil',          date:'2026-06-24T19:00:00-03:00', group:'C', city:'Miami',             venue:'Hard Rock Stadium',         phase:'Fase de Grupos' },
  { id:52, team1:'Marrocos',       team2:'Haiti',           date:'2026-06-24T19:00:00-03:00', group:'C', city:'Atlanta',           venue:'Mercedes-Benz Stadium',     phase:'Fase de Grupos' },
  // GRUPO A (simultâneos)
  { id:53, team1:'República Tcheca',team2:'México',         date:'2026-06-24T22:00:00-03:00', group:'A', city:'Cidade do México',  venue:'Estadio Azteca',            phase:'Fase de Grupos' },
  { id:54, team1:'África do Sul',  team2:'Coreia do Sul',   date:'2026-06-24T22:00:00-03:00', group:'A', city:'Monterrey',         venue:'Estadio BBVA',              phase:'Fase de Grupos' },
  // GRUPO E (simultâneos)
  { id:55, team1:'Equador',        team2:'Alemanha',        date:'2026-06-25T17:00:00-03:00', group:'E', city:'Nova York/NJ',      venue:'MetLife Stadium',           phase:'Fase de Grupos' },
  { id:56, team1:'Curaçao',        team2:'Costa do Marfim', date:'2026-06-25T17:00:00-03:00', group:'E', city:'Filadélfia',        venue:'Lincoln Financial Field',   phase:'Fase de Grupos' },
  // GRUPO F (simultâneos)
  { id:57, team1:'Japão',          team2:'Suécia',          date:'2026-06-25T20:00:00-03:00', group:'F', city:'Dallas',            venue:'AT&T Stadium',              phase:'Fase de Grupos' },
  { id:58, team1:'Tunísia',        team2:'Holanda',         date:'2026-06-25T20:00:00-03:00', group:'F', city:'Kansas City',       venue:'Arrowhead Stadium',         phase:'Fase de Grupos' },
  // GRUPO D (simultâneos)
  { id:59, team1:'Turquia',        team2:'Estados Unidos',  date:'2026-06-25T23:00:00-03:00', group:'D', city:'Los Angeles',       venue:'SoFi Stadium',              phase:'Fase de Grupos' },
  { id:60, team1:'Paraguai',       team2:'Austrália',       date:'2026-06-25T23:00:00-03:00', group:'D', city:'San Francisco',     venue:'Levi\'s Stadium',           phase:'Fase de Grupos' },
  // GRUPO I (simultâneos)
  { id:61, team1:'Noruega',        team2:'França',          date:'2026-06-26T16:00:00-03:00', group:'I', city:'Boston',            venue:'Gillette Stadium',          phase:'Fase de Grupos' },
  { id:62, team1:'Senegal',        team2:'Iraque',          date:'2026-06-26T16:00:00-03:00', group:'I', city:'Toronto',           venue:'BMO Field',                 phase:'Fase de Grupos' },
  // GRUPO H (simultâneos)
  { id:63, team1:'Cabo Verde',     team2:'Arábia Saudita',  date:'2026-06-26T21:00:00-03:00', group:'H', city:'Houston',           venue:'NRG Stadium',               phase:'Fase de Grupos' },
  { id:64, team1:'Uruguai',        team2:'Espanha',         date:'2026-06-26T21:00:00-03:00', group:'H', city:'Guadalajara',       venue:'Estadio Jalisco',           phase:'Fase de Grupos' },
  // GRUPO G (simultâneos)
  { id:65, team1:'Egito',          team2:'Irã',             date:'2026-06-27T00:00:00-03:00', group:'G', city:'Seattle',           venue:'Lumen Field',               phase:'Fase de Grupos' },
  { id:66, team1:'Nova Zelândia',  team2:'Bélgica',         date:'2026-06-27T00:00:00-03:00', group:'G', city:'Vancouver',         venue:'BC Place',                  phase:'Fase de Grupos' },
  // GRUPO L (simultâneos)
  { id:67, team1:'Panamá',         team2:'Inglaterra',      date:'2026-06-27T18:00:00-03:00', group:'L', city:'Nova York/NJ',      venue:'MetLife Stadium',           phase:'Fase de Grupos' },
  { id:68, team1:'Croácia',        team2:'Gana',            date:'2026-06-27T18:00:00-03:00', group:'L', city:'Filadélfia',        venue:'Lincoln Financial Field',   phase:'Fase de Grupos' },
  // GRUPO K (simultâneos)
  { id:69, team1:'Colômbia',       team2:'Portugal',        date:'2026-06-27T20:30:00-03:00', group:'K', city:'Miami',             venue:'Hard Rock Stadium',         phase:'Fase de Grupos' },
  { id:70, team1:'RD Congo',       team2:'Uzbequistão',     date:'2026-06-27T20:30:00-03:00', group:'K', city:'Atlanta',           venue:'Mercedes-Benz Stadium',     phase:'Fase de Grupos' },
  // GRUPO J (simultâneos)
  { id:71, team1:'Argélia',        team2:'Áustria',         date:'2026-06-27T23:00:00-03:00', group:'J', city:'Kansas City',       venue:'Arrowhead Stadium',         phase:'Fase de Grupos' },
  { id:72, team1:'Jordânia',       team2:'Argentina',       date:'2026-06-27T23:00:00-03:00', group:'J', city:'Dallas',            venue:'AT&T Stadium',              phase:'Fase de Grupos' },
]

// ── Utilitários ───────────────────────────────────────────────────────────────
export function getFlag(team, size) {
  const sz = size || 20
  const code = FLAGS[team]
  if (!code) return '🏳️'
  return React.createElement('img', {
    src: 'https://flagcdn.com/w' + (sz * 2) + '/' + code + '.png',
    alt: team,
    style: { width: sz, height: Math.round(sz * 0.67), objectFit: 'cover', borderRadius: 2, display: 'inline-block', verticalAlign: 'middle' },
    onError: function(e) { e.target.style.display = 'none' }
  })
}

export function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', {
    weekday: 'short', day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })
}

export function isMatchOpen(match) {
  // Palpites fecham 1 min antes do jogo
  const matchTime = new Date(match.date)
  const cutoff    = new Date(matchTime.getTime() - 1 * 60 * 1000)
  return new Date() < cutoff
}
