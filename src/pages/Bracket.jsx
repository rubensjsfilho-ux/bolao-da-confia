import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import Header from '../components/Header'
import { Loader2 } from 'lucide-react'

// Estrutura do mata-mata Copa 2026 (48 times, 32 nas oitavas)
const BRACKET_STRUCTURE = {
  r32: {
    label: 'Oitavas de Final',
    short: 'R32',
    matches: Array.from({ length: 16 }, (_, i) => ({
      id: `r32_${i + 1}`,
      round: 'r32',
      position: i + 1,
      team1: null, score1: null,
      team2: null, score2: null,
      is_finished: false,
    }))
  },
  r16: {
    label: 'Quartas de Final',
    short: 'R16',
    matches: Array.from({ length: 8 }, (_, i) => ({
      id: `r16_${i + 1}`,
      round: 'r16',
      position: i + 1,
      team1: null, score1: null,
      team2: null, score2: null,
      is_finished: false,
    }))
  },
  qf: {
    label: 'Semifinais',
    short: 'SF',
    matches: Array.from({ length: 4 }, (_, i) => ({
      id: `qf_${i + 1}`,
      round: 'qf',
      position: i + 1,
      team1: null, score1: null,
      team2: null, score2: null,
      is_finished: false,
    }))
  },
  sf: {
    label: 'Final',
    short: 'F',
    matches: [
      { id: 'sf_1', round: 'sf', position: 1, label: '3º Lugar', team1: null, score1: null, team2: null, score2: null, is_finished: false },
      { id: 'sf_2', round: 'sf', position: 2, label: 'FINAL', team1: null, score1: null, team2: null, score2: null, is_finished: false },
    ]
  }
}

const ROUND_ORDER = ['r32', 'r16', 'qf', 'sf']

function getFlag(team) {
  const flags = {
    'Brasil': '🇧🇷', 'Argentina': '🇦🇷', 'França': '🇫🇷', 'Alemanha': '🇩🇪',
    'Espanha': '🇪🇸', 'Portugal': '🇵🇹', 'Inglaterra': '🏴', 'Holanda': '🇳🇱',
    'Bélgica': '🇧🇪', 'Itália': '🇮🇹', 'México': '🇲🇽', 'Estados Unidos': '🇺🇸',
    'Uruguai': '🇺🇾', 'Japão': '🇯🇵', 'Canadá': '🇨🇦', 'Austrália': '🇦🇺',
    'Coreia do Sul': '🇰🇷', 'Marrocos': '🇲🇦', 'Senegal': '🇸🇳', 'Egito': '🇪🇬',
    'Escócia': '🏴', 'Croácia': '🇭🇷', 'Suíça': '🇨🇭', 'Áustria': '🇦🇹',
    'Noruega': '🇳🇴', 'Polônia': '🇵🇱', 'Dinamarca': '🇩🇰', 'Sérvia': '🇷🇸',
    'Turquia': '🇹🇷', 'Irã': '🇮🇷', 'Costa Rica': '🇨🇷', 'Panamá': '🇵🇦',
  }
  return flags[team] || '🏳️'
}

// Card de uma partida no chaveamento
function MatchCard({ match, compact = false }) {
  const h = compact ? 48 : 58
  const fs = compact ? 9 : 11
  const fsScore = compact ? 14 : 18

  const team1Won = match.is_finished && match.score1 > match.score2
  const team2Won = match.is_finished && match.score2 > match.score1

  const teamRow = (team, score, won) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: compact ? 4 : 6,
      padding: compact ? '4px 8px' : '6px 10px',
      background: won ? 'rgba(0,150,57,0.15)' : 'transparent',
      borderRadius: 6,
    }}>
      <span style={{ fontSize: compact ? 14 : 18 }}>{team ? getFlag(team) : '🏳️'}</span>
      <span style={{
        flex: 1, color: team ? (won ? '#4ade80' : '#fff') : 'rgba(255,255,255,0.25)',
        fontWeight: won ? 900 : 700, fontSize: fs,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {team || 'A definir'}
      </span>
      {match.is_finished && (
        <span style={{
          color: won ? '#4ade80' : 'rgba(255,255,255,0.5)',
          fontWeight: 900, fontSize: fsScore, minWidth: 16, textAlign: 'right',
        }}>{score}</span>
      )}
    </div>
  )

  return (
    <div style={{
      background: 'rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden',
      border: match.is_finished ? '1px solid rgba(0,150,57,0.3)' : '1px solid rgba(255,255,255,0.08)',
      minWidth: compact ? 130 : 160,
    }}>
      {match.label && (
        <div style={{
          background: match.label === 'FINAL' ? 'rgba(245,166,35,0.2)' : 'rgba(255,255,255,0.05)',
          padding: '3px 8px', fontSize: 8, fontWeight: 900, letterSpacing: 1,
          color: match.label === 'FINAL' ? '#F5A623' : 'rgba(255,255,255,0.4)',
          textAlign: 'center', textTransform: 'uppercase',
        }}>{match.label}</div>
      )}
      {teamRow(match.team1, match.score1, team1Won)}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 8px' }} />
      {teamRow(match.team2, match.score2, team2Won)}
    </div>
  )
}

// Rodada compacta para mobile
function RoundSection({ roundKey, roundData, matches }) {
  const roundMatches = matches[roundKey] || roundData.matches
  const cols = roundKey === 'r32' ? 2 : roundKey === 'r16' ? 2 : 1

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
      }}>
        <div style={{
          background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.3)',
          borderRadius: 8, padding: '3px 10px', fontSize: 10, fontWeight: 900,
          color: '#F5A623', textTransform: 'uppercase', letterSpacing: 1,
        }}>{roundData.short}</div>
        <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>{roundData.label}</span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginLeft: 'auto' }}>
          {roundMatches.filter(m => m.is_finished).length}/{roundMatches.length} encerrados
        </span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 8,
      }}>
        {roundMatches.map(m => (
          <MatchCard key={m.id} match={m} compact={roundKey === 'r32'} />
        ))}
      </div>
    </div>
  )
}

export default function Bracket({ participant, onLogout }) {
  const [bracketData, setBracketData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeRound, setActiveRound] = useState('r32')

  useEffect(() => {
    const loadBracket = async () => {
      try {
        const { data } = await supabase
          .from('bracket_matches')
          .select('*')
          .order('position')

        if (data && data.length > 0) {
          // Agrupa por round
          const grouped = {}
          for (const round of ROUND_ORDER) {
            grouped[round] = data.filter(m => m.round === round)
            // Se não tem dados do banco, usa estrutura padrão
            if (!grouped[round].length) {
              grouped[round] = BRACKET_STRUCTURE[round].matches
            }
          }
          setBracketData(grouped)
        } else {
          // Sem dados no banco, usa estrutura vazia
          const empty = {}
          for (const round of ROUND_ORDER) {
            empty[round] = BRACKET_STRUCTURE[round].matches
          }
          setBracketData(empty)
        }
      } catch {
        const empty = {}
        for (const round of ROUND_ORDER) {
          empty[round] = BRACKET_STRUCTURE[round].matches
        }
        setBracketData(empty)
      }
      setLoading(false)
    }
    loadBracket()
  }, [])

  const roundTabs = [
    { id: 'r32', label: 'Oitavas' },
    { id: 'r16', label: 'Quartas' },
    { id: 'qf', label: 'Semis' },
    { id: 'sf', label: 'Final' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0a1628', paddingBottom: 80 }}>
      <Header participant={participant} onLogout={onLogout} />

      {/* Header da página */}
      <div style={{
        paddingTop: 70, background: 'linear-gradient(135deg, #002855 0%, #009639 100%)',
        padding: '70px 16px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 28 }}>🏆</span>
          <div>
            <h1 style={{ color: '#fff', fontWeight: 900, fontSize: 22, margin: 0 }}>Chaveamento</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: 0 }}>Copa do Mundo 2026</p>
          </div>
        </div>
      </div>

      {/* Abas de rodada */}
      <div style={{
        background: '#001a3d', borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '8px 12px', display: 'flex', gap: 6, overflowX: 'auto',
        position: 'sticky', top: 58, zIndex: 30,
      }}>
        {roundTabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveRound(tab.id)}
            style={{
              flexShrink: 0, padding: '7px 14px', border: 'none', borderRadius: 20,
              fontWeight: 800, fontSize: 12, cursor: 'pointer', fontFamily: 'Nunito,sans-serif',
              background: activeRound === tab.id ? '#009639' : 'rgba(255,255,255,0.06)',
              color: activeRound === tab.id ? '#fff' : 'rgba(255,255,255,0.5)',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      <main style={{ padding: '16px 12px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'rgba(255,255,255,0.3)' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
            <p>Carregando chaveamento...</p>
            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <>
            {bracketData && (
              <RoundSection
                roundKey={activeRound}
                roundData={BRACKET_STRUCTURE[activeRound]}
                matches={bracketData}
              />
            )}

            {/* Aviso se rodada ainda não começou */}
            {bracketData && bracketData[activeRound]?.every(m => !m.team1) && (
              <div style={{
                background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)',
                borderRadius: 14, padding: '20px 16px', textAlign: 'center', marginTop: 8,
              }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>⏳</div>
                <div style={{ color: '#F5A623', fontWeight: 800, fontSize: 14 }}>
                  {BRACKET_STRUCTURE[activeRound].label} ainda não começou
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>
                  Os confrontos serão definidos após a fase de grupos.
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
