import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import Header from '../components/Header'

const FLAGS = {
  'Brasil':'🇧🇷','Argentina':'🇦🇷','França':'🇫🇷','Alemanha':'🇩🇪',
  'Espanha':'🇪🇸','Portugal':'🇵🇹','Inglaterra':'🏴','Holanda':'🇳🇱',
  'Bélgica':'🇧🇪','Itália':'🇮🇹','México':'🇲🇽','Estados Unidos':'🇺🇸',
  'Uruguai':'🇺🇾','Japão':'🇯🇵','Canadá':'🇨🇦','Austrália':'🇦🇺',
  'Coreia do Sul':'🇰🇷','Marrocos':'🇲🇦','Senegal':'🇸🇳','Egito':'🇪🇬',
  'Escócia':'🏴','Croácia':'🇭🇷','Suíça':'🇨🇭','Áustria':'🇦🇹',
  'Noruega':'🇳🇴','Polônia':'🇵🇱','Dinamarca':'🇩🇰','Sérvia':'🇷🇸',
  'Turquia':'🇹🇷','Irã':'🇮🇷','Costa Rica':'🇨🇷','Panamá':'🇵🇦',
}
const getFlag = t => FLAGS[t] || '🏳️'

// Copa 2026: 48 times → 32 avançam para o mata-mata
const ROUNDS = [
  { id:'r32', label:'16 Avos de Final', short:'16 Avos', matchCount:16 },
  { id:'r16', label:'Oitavas de Final',  short:'Oitavas', matchCount:8 },
  { id:'qf',  label:'Quartas de Final',  short:'Quartas', matchCount:4 },
  { id:'sf',  label:'Semifinais',        short:'Semis',   matchCount:2 },
  { id:'f',   label:'Final',             short:'Final',   matchCount:2 }, // 3º lugar + final
]

function emptyMatches(round) {
  if (round.id === 'f') {
    return [
      { id:'f_1', round:'f', position:1, label:'3º Lugar', team1:null, score1:null, team2:null, score2:null, is_finished:false },
      { id:'f_2', round:'f', position:2, label:'FINAL 🏆', team1:null, score1:null, team2:null, score2:null, is_finished:false },
    ]
  }
  return Array.from({ length: round.matchCount }, (_, i) => ({
    id: `${round.id}_${i+1}`, round: round.id, position: i+1,
    team1:null, score1:null, team2:null, score2:null, is_finished:false,
  }))
}

function MatchCard({ match }) {
  const t1Won = match.is_finished && match.score1 > match.score2
  const t2Won = match.is_finished && match.score2 > match.score1

  const row = (team, score, won) => (
    <div style={{
      display:'flex', alignItems:'center', gap:6,
      padding:'6px 10px',
      background: won ? 'rgba(0,150,57,0.18)' : 'transparent',
      borderRadius:6,
    }}>
      <span style={{ fontSize:16 }}>{team ? getFlag(team) : '🏳️'}</span>
      <span style={{
        flex:1, fontSize:11, fontWeight: won ? 900 : 600,
        color: team ? (won ? '#4ade80' : '#fff') : 'rgba(255,255,255,0.25)',
        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
      }}>{team || 'A definir'}</span>
      {match.is_finished && (
        <span style={{ color: won ? '#4ade80' : 'rgba(255,255,255,0.5)', fontWeight:900, fontSize:16, minWidth:14, textAlign:'right' }}>{score}</span>
      )}
    </div>
  )

  return (
    <div style={{
      background:'rgba(255,255,255,0.06)',
      border: match.is_finished ? '1px solid rgba(0,150,57,0.35)' : '1px solid rgba(255,255,255,0.08)',
      borderRadius:10, overflow:'hidden', minWidth:0,
    }}>
      {match.label && (
        <div style={{
          background: match.label.includes('FINAL') ? 'rgba(245,166,35,0.2)' : 'rgba(255,255,255,0.05)',
          padding:'3px 10px', fontSize:9, fontWeight:900, letterSpacing:1,
          color: match.label.includes('FINAL') ? '#F5A623' : 'rgba(255,255,255,0.4)',
          textAlign:'center', textTransform:'uppercase',
        }}>{match.label}</div>
      )}
      {row(match.team1, match.score1, t1Won)}
      <div style={{ height:1, background:'rgba(255,255,255,0.06)', margin:'0 8px' }}/>
      {row(match.team2, match.score2, t2Won)}
    </div>
  )
}

export default function Bracket({ participant, onLogout }) {
  const [activeRound, setActiveRound] = useState('r32')
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: rows } = await supabase.from('bracket_matches').select('*').order('position')
      const grouped = {}
      for (const r of ROUNDS) {
        const fromDB = rows?.filter(m => m.round === r.id) || []
        grouped[r.id] = fromDB.length ? fromDB : emptyMatches(r)
      }
      setData(grouped)
      setLoading(false)
    }
    load()
  }, [])

  const current = ROUNDS.find(r => r.id === activeRound)
  const matches = data[activeRound] || emptyMatches(current)
  const cols = activeRound === 'r32' ? 2 : activeRound === 'r16' ? 2 : 1

  return (
    <div style={{ minHeight:'100vh', background:'#0a1628', paddingBottom:80 }}>
      <Header participant={participant} onLogout={onLogout} />

      {/* Cabeçalho */}
      <div style={{ paddingTop:58, background:'linear-gradient(135deg,#002855,#009639)', padding:'70px 16px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:28 }}>🏆</span>
          <div>
            <h1 style={{ color:'#fff', fontWeight:900, fontSize:22, margin:0 }}>Chaveamento</h1>
            <p style={{ color:'rgba(255,255,255,0.6)', fontSize:12, margin:0 }}>Copa do Mundo 2026 · 48 seleções</p>
          </div>
        </div>
      </div>

      {/* Abas de rodada */}
      <div style={{
        background:'#001a3d', borderBottom:'1px solid rgba(255,255,255,0.08)',
        padding:'8px 10px', display:'flex', gap:6, overflowX:'auto',
        position:'sticky', top:58, zIndex:30,
      }}>
        {ROUNDS.map(r => {
          const finished = (data[r.id] || []).filter(m => m.is_finished).length
          const total = r.matchCount
          const active = activeRound === r.id
          return (
            <button key={r.id} onClick={() => setActiveRound(r.id)} style={{
              flexShrink:0, padding:'6px 12px', border:'none', borderRadius:20,
              fontWeight:800, fontSize:11, cursor:'pointer', fontFamily:'Nunito,sans-serif',
              background: active ? '#009639' : 'rgba(255,255,255,0.06)',
              color: active ? '#fff' : 'rgba(255,255,255,0.5)',
            }}>
              {r.short}
              {finished > 0 && <span style={{ marginLeft:4, fontSize:9, opacity:0.7 }}>{finished}/{total}</span>}
            </button>
          )
        })}
      </div>

      <main style={{ padding:'16px 12px' }}>
        {/* Título da rodada */}
        <div style={{ marginBottom:12, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <span style={{
              background:'rgba(245,166,35,0.15)', border:'1px solid rgba(245,166,35,0.3)',
              borderRadius:8, padding:'3px 10px', fontSize:10, fontWeight:900,
              color:'#F5A623', textTransform:'uppercase', letterSpacing:1,
            }}>{current?.short}</span>
            <span style={{ color:'#fff', fontWeight:800, fontSize:14, marginLeft:8 }}>{current?.label}</span>
          </div>
          <span style={{ color:'rgba(255,255,255,0.3)', fontSize:11 }}>
            {matches.filter(m=>m.is_finished).length}/{matches.length} encerrados
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:48, color:'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize:32, animation:'spin 1s linear infinite', display:'inline-block' }}>⚽</div>
            <p style={{ marginTop:8 }}>Carregando...</p>
            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols},1fr)`, gap:8 }}>
            {matches.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        )}

        {/* Aviso se rodada ainda não tem times */}
        {!loading && matches.every(m => !m.team1) && (
          <div style={{
            background:'rgba(245,166,35,0.08)', border:'1px solid rgba(245,166,35,0.2)',
            borderRadius:14, padding:'20px 16px', textAlign:'center', marginTop:12,
          }}>
            <div style={{ fontSize:36, marginBottom:8 }}>⏳</div>
            <div style={{ color:'#F5A623', fontWeight:800, fontSize:14 }}>{current?.label} ainda não começou</div>
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:12, marginTop:4 }}>
              Os confrontos serão definidos após as rodadas anteriores.
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
