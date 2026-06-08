import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import Header from '../components/Header'
import { ChevronLeft, ChevronRight, Lock, Loader2 } from 'lucide-react'

// ── FLAGS ─────────────────────────────────────────────────────────────────────
const FLAGS = {
  'Brasil':'🇧🇷','Argentina':'🇦🇷','França':'🇫🇷','Alemanha':'🇩🇪','Espanha':'🇪🇸',
  'Portugal':'🇵🇹','Inglaterra':'🏴','Holanda':'🇳🇱','Bélgica':'🇧🇪','Itália':'🇮🇹',
  'México':'🇲🇽','Estados Unidos':'🇺🇸','Uruguai':'🇺🇾','Japão':'🇯🇵','Canadá':'🇨🇦',
  'Austrália':'🇦🇺','Coreia do Sul':'🇰🇷','Marrocos':'🇲🇦','Senegal':'🇸🇳','Egito':'🇪🇬',
  'Escócia':'🏴','Croácia':'🇭🇷','Suíça':'🇨🇭','Áustria':'🇦🇹','Noruega':'🇳🇴',
  'Turquia':'🇹🇷','Irã':'🇮🇷','Colômbia':'🇨🇴','Paraguai':'🇵🇾','Gana':'🇬🇭','Panamá':'🇵🇦',
  'Argélia':'🇩🇿','Uzbequistão':'🇺🇿','Catar':'🇶🇦','Tunísia':'🇹🇳','Haiti':'🇭🇹',
  'Sérvia':'🇷🇸','Dinamarca':'🇩🇰','Ucrânia':'🇺🇦','Arábia Saudita':'🇸🇦','Iraque':'🇮🇶',
  'Nova Zelândia':'🇳🇿','Jordânia':'🇯🇴','RD Congo':'🇨🇩','África do Sul':'🇿🇦',
  'Cabo Verde':'🇨🇻','Equador':'🇪🇨','Costa do Marfim':'🇨🇮','Curaçao':'🇨🇼',
}
const getFlag = t => FLAGS[t] || '🏳️'

// ── ESTRUTURA COMPLETA DO MATA-MATA COPA 2026 ─────────────────────────────────
const ROUNDS = [
  {
    id: 'r2', label: 'Segunda Fase', short: '2ª Fase',
    matches: [
      { id:'r2_1',  pos:1,  label:'2ª Fase 1',  date:'2026-06-28T19:00:00Z', city:'Los Angeles',      venue:'SoFi Stadium',            info:'1º A × 2º B' },
      { id:'r2_2',  pos:2,  label:'2ª Fase 2',  date:'2026-06-28T22:00:00Z', city:'Kansas City',      venue:'Arrowhead Stadium',       info:'1º C × 2º D' },
      { id:'r2_3',  pos:3,  label:'2ª Fase 3',  date:'2026-06-29T17:30:00Z', city:'Boston',           venue:'Gillette Stadium',        info:'1º E × 3º ABCDF' },
      { id:'r2_4',  pos:4,  label:'2ª Fase 4',  date:'2026-06-29T22:00:00Z', city:'Monterrey',        venue:'El Gigante de Acero',     info:'1º F × 2º C' },
      { id:'r2_5',  pos:5,  label:'2ª Fase 5',  date:'2026-06-30T16:00:00Z', city:'Dallas',           venue:'AT&T Stadium',            info:'2º D × 3º ABCEG' },
      { id:'r2_6',  pos:6,  label:'2ª Fase 6',  date:'2026-06-30T18:00:00Z', city:'Nova York/NJ',     venue:'MetLife Stadium',         info:'1º I × 3º CDFGH' },
      { id:'r2_7',  pos:7,  label:'2ª Fase 7',  date:'2026-07-01T16:00:00Z', city:'Seattle',          venue:'Lumen Field',             info:'1º G × 3º ABCIJ' },
      { id:'r2_8',  pos:8,  label:'2ª Fase 8',  date:'2026-07-01T19:00:00Z', city:'Guadalajara',      venue:'Estadio Jalisco',         info:'1º H × 2º E' },
      { id:'r2_9',  pos:9,  label:'2ª Fase 9',  date:'2026-07-01T22:00:00Z', city:'Vancouver',        venue:'BC Place',                info:'2º I × 3º DFGHJ' },
      { id:'r2_10', pos:10, label:'2ª Fase 10', date:'2026-07-02T16:00:00Z', city:'Filadélfia',       venue:'Lincoln Financial Field', info:'1º B × 2º A' },
      { id:'r2_11', pos:11, label:'2ª Fase 11', date:'2026-07-02T19:00:00Z', city:'Miami',            venue:'Hard Rock Stadium',       info:'1º J × 2º F' },
      { id:'r2_12', pos:12, label:'2ª Fase 12', date:'2026-07-02T22:00:00Z', city:'Cidade do México', venue:'Estádio Azteca',          info:'2º G × 3º EGHIKL' },
      { id:'r2_13', pos:13, label:'2ª Fase 13', date:'2026-07-03T16:00:00Z', city:'Atlanta',          venue:'Mercedes-Benz Stadium',   info:'1º K × 2º J' },
      { id:'r2_14', pos:14, label:'2ª Fase 14', date:'2026-07-03T19:00:00Z', city:'Houston',          venue:'NRG Stadium',             info:'2º H × 3º BCDIL' },
      { id:'r2_15', pos:15, label:'2ª Fase 15', date:'2026-07-03T22:00:00Z', city:'Toronto',          venue:'BMO Field',               info:'1º D × 2º K' },
      { id:'r2_16', pos:16, label:'2ª Fase 16', date:'2026-07-04T16:00:00Z', city:'San Francisco',    venue:"Levi's Stadium",          info:'2º L × 1º L' },
    ]
  },
  {
    id: 'r16', label: 'Oitavas de Final', short: 'Oitavas',
    matches: [
      { id:'r16_1', pos:1, label:'Oitavas 1', date:'2026-07-04T21:00:00Z', city:'Filadélfia',   venue:'Lincoln Financial Field', info:'Venc. 2ª Fase 1 × Venc. 2ª Fase 2' },
      { id:'r16_2', pos:2, label:'Oitavas 2', date:'2026-07-04T17:00:00Z', city:'Houston',      venue:'NRG Stadium',             info:'Venc. 2ª Fase 3 × Venc. 2ª Fase 4' },
      { id:'r16_3', pos:3, label:'Oitavas 3', date:'2026-07-05T17:00:00Z', city:'Nova York/NJ', venue:'MetLife Stadium',         info:'Venc. 2ª Fase 5 × Venc. 2ª Fase 6' },
      { id:'r16_4', pos:4, label:'Oitavas 4', date:'2026-07-05T21:00:00Z', city:'Seattle',      venue:'Lumen Field',             info:'Venc. 2ª Fase 7 × Venc. 2ª Fase 8' },
      { id:'r16_5', pos:5, label:'Oitavas 5', date:'2026-07-06T16:00:00Z', city:'Dallas',       venue:'AT&T Stadium',            info:'Venc. 2ª Fase 9 × Venc. 2ª Fase 10' },
      { id:'r16_6', pos:6, label:'Oitavas 6', date:'2026-07-06T21:00:00Z', city:'Los Angeles',  venue:'SoFi Stadium',            info:'Venc. 2ª Fase 11 × Venc. 2ª Fase 12' },
      { id:'r16_7', pos:7, label:'Oitavas 7', date:'2026-07-07T16:00:00Z', city:'Vancouver',    venue:'BC Place',                info:'Venc. 2ª Fase 13 × Venc. 2ª Fase 14' },
      { id:'r16_8', pos:8, label:'Oitavas 8', date:'2026-07-07T21:00:00Z', city:'Kansas City',  venue:'Arrowhead Stadium',       info:'Venc. 2ª Fase 15 × Venc. 2ª Fase 16' },
    ]
  },
  {
    id: 'qf', label: 'Quartas de Final', short: 'Quartas',
    matches: [
      { id:'qf_1', pos:1, label:'Quartas 1', date:'2026-07-09T20:00:00Z', city:'Boston',       venue:'Gillette Stadium',        info:'Venc. Oitavas 1 × Venc. Oitavas 2' },
      { id:'qf_2', pos:2, label:'Quartas 2', date:'2026-07-09T16:00:00Z', city:'Los Angeles',  venue:'SoFi Stadium',            info:'Venc. Oitavas 3 × Venc. Oitavas 4' },
      { id:'qf_3', pos:3, label:'Quartas 3', date:'2026-07-10T21:00:00Z', city:'Miami',        venue:'Hard Rock Stadium',       info:'Venc. Oitavas 5 × Venc. Oitavas 6' },
      { id:'qf_4', pos:4, label:'Quartas 4', date:'2026-07-11T21:00:00Z', city:'Kansas City',  venue:'Arrowhead Stadium',       info:'Venc. Oitavas 7 × Venc. Oitavas 8' },
    ]
  },
  {
    id: 'sf', label: 'Semifinais', short: 'Semis',
    matches: [
      { id:'sf_1', pos:1, label:'Semifinal 1', date:'2026-07-14T20:00:00Z', city:'Dallas',   venue:'AT&T Stadium',          info:'Venc. Quartas 1 × Venc. Quartas 2' },
      { id:'sf_2', pos:2, label:'Semifinal 2', date:'2026-07-15T20:00:00Z', city:'Atlanta',  venue:'Mercedes-Benz Stadium', info:'Venc. Quartas 3 × Venc. Quartas 4' },
    ]
  },
  {
    id: 'f', label: 'Final', short: 'Final',
    matches: [
      { id:'f_3',  pos:1, label:'🥉 3º Lugar', date:'2026-07-18T21:00:00Z', city:'Miami',        venue:'Hard Rock Stadium', info:'Perd. Semifinal 1 × Perd. Semifinal 2' },
      { id:'f_1',  pos:2, label:'🏆 FINAL',    date:'2026-07-19T20:00:00Z', city:'Nova Jersey',  venue:'MetLife Stadium',   info:'Venc. Semifinal 1 × Venc. Semifinal 2' },
    ]
  },
]

function formatMatchDate(dateStr) {
  const d = new Date(dateStr)
  const dia = d.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', timeZone:'America/Sao_Paulo' })
  const diaSem = d.toLocaleDateString('pt-BR', { weekday:'long', timeZone:'America/Sao_Paulo' })
  const hora = d.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit', timeZone:'America/Sao_Paulo' })
  return { dia, diaSem: diaSem.charAt(0).toUpperCase()+diaSem.slice(1), hora }
}

// ── CARD DE PARTIDA ───────────────────────────────────────────────────────────
function MatchCard({ match, dbMatch, compact }) {
  const team1 = dbMatch?.team1 || null
  const team2 = dbMatch?.team2 || null
  const score1 = dbMatch?.score1
  const score2 = dbMatch?.score2
  const finished = dbMatch?.is_finished

  const t1Won = finished && score1 > score2
  const t2Won = finished && score2 > score1
  const isFinal = match.label.includes('FINAL') || match.label.includes('3º')
  const { dia, diaSem, hora } = formatMatchDate(match.date)

  const teamRow = (team, score, won, align='left') => (
    <div style={{
      display:'flex', alignItems:'center',
      flexDirection: align==='right' ? 'row-reverse' : 'row',
      gap:8, padding:'6px 0',
    }}>
      <div style={{ width:32, height:32, borderRadius:'50%', background: team ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
        {team ? getFlag(team) : '🏳️'}
      </div>
      <div style={{ flex:1, textAlign: align }}>
        <div style={{ color: team ? (won?'#4ade80':'#fff') : 'rgba(255,255,255,0.3)', fontWeight: won?900:700, fontSize:12, lineHeight:1.2 }}>
          {team || (align==='left' ? match.info?.split(' × ')[0] || 'A definir' : match.info?.split(' × ')[1] || 'A definir')}
        </div>
      </div>
      {finished && (
        <div style={{ color: won?'#4ade80':'rgba(255,255,255,0.5)', fontWeight:900, fontSize:22, minWidth:20, textAlign:'center' }}>
          {score}
        </div>
      )}
    </div>
  )

  return (
    <div style={{
      background: isFinal ? 'rgba(245,166,35,0.08)' : 'rgba(255,255,255,0.05)',
      border: isFinal ? '1px solid rgba(245,166,35,0.25)' : finished ? '1px solid rgba(74,222,128,0.2)' : '1px solid rgba(255,255,255,0.08)',
      borderRadius:14, overflow:'hidden', marginBottom:10,
    }}>
      {/* Header do card */}
      <div style={{ background: isFinal ? 'rgba(245,166,35,0.12)' : 'rgba(255,255,255,0.04)', padding:'8px 14px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ color: isFinal?'#F5A623':'rgba(255,255,255,0.5)', fontWeight:800, fontSize:10, textTransform:'uppercase', letterSpacing:1 }}>
          {match.label}
        </span>
        {finished && <span style={{ color:'#4ade80', fontSize:10, fontWeight:800 }}>✓ Encerrado</span>}
      </div>

      <div style={{ padding:'10px 14px' }}>
        {/* Data, hora e local */}
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10, flexWrap:'wrap' }}>
          <span style={{ color:'#F5A623', fontWeight:900, fontSize:11 }}>{dia}</span>
          <span style={{ color:'rgba(255,255,255,0.3)', fontSize:10 }}>·</span>
          <span style={{ color:'rgba(255,255,255,0.5)', fontSize:10 }}>{diaSem}</span>
          <span style={{ color:'rgba(255,255,255,0.3)', fontSize:10 }}>·</span>
          <span style={{ color:'rgba(255,255,255,0.5)', fontSize:10, fontWeight:800 }}>{hora}</span>
          <span style={{ color:'rgba(255,255,255,0.3)', fontSize:10 }}>·</span>
          <span style={{ color:'rgba(255,255,255,0.4)', fontSize:10 }}>📍 {match.city}</span>
        </div>

        {/* Times */}
        {teamRow(team1, score1, t1Won, 'left')}
        <div style={{ height:1, background:'rgba(255,255,255,0.06)', margin:'2px 0' }}/>
        {teamRow(team2, score2, t2Won, 'left')}

        {/* Estádio */}
        <div style={{ marginTop:8, color:'rgba(255,255,255,0.25)', fontSize:9, letterSpacing:.5 }}>
          🏟️ {match.venue}
        </div>
      </div>
    </div>
  )
}

// ── PÁGINA PRINCIPAL ──────────────────────────────────────────────────────────
export default function Bracket({ participant, onLogout }) {
  const [activeRound, setActiveRound] = useState('r2')
  const [dbMatches, setDbMatches] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('bracket_matches').select('*')
      .then(({ data }) => {
        const map = {}
        data?.forEach(m => { map[m.id] = m })
        setDbMatches(map)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const current = ROUNDS.find(r => r.id === activeRound)

  // Progresso de cada rodada
  const getRoundProgress = (round) => {
    const total = round.matches.length
    const done = round.matches.filter(m => dbMatches[m.id]?.is_finished).length
    const hasTeams = round.matches.filter(m => dbMatches[m.id]?.team1).length
    return { total, done, hasTeams }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#0a1628', paddingBottom:80 }}>
      <Header participant={participant} onLogout={onLogout} />

      {/* Cabeçalho */}
      <div style={{ paddingTop:58, background:'linear-gradient(135deg,#002855 0%,#009639 100%)', padding:'70px 16px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:28 }}>🏆</span>
          <div>
            <h1 style={{ color:'#fff', fontWeight:900, fontSize:22, margin:0 }}>Chaveamento</h1>
            <p style={{ color:'rgba(255,255,255,0.6)', fontSize:12, margin:0 }}>Copa do Mundo 2026 · 48 seleções</p>
          </div>
        </div>
      </div>

      {/* Abas */}
      <div style={{ background:'#001a3d', borderBottom:'1px solid rgba(255,255,255,0.08)', padding:'8px 10px', display:'flex', gap:6, overflowX:'auto', position:'sticky', top:58, zIndex:30 }}>
        {ROUNDS.map(r => {
          const { done, total, hasTeams } = getRoundProgress(r)
          const active = activeRound === r.id
          return (
            <button key={r.id} onClick={() => setActiveRound(r.id)} style={{
              flexShrink:0, padding:'7px 12px', border:'none', borderRadius:20,
              fontWeight:800, fontSize:11, cursor:'pointer', fontFamily:'Nunito,sans-serif',
              background: active ? '#009639' : 'rgba(255,255,255,0.06)',
              color: active ? '#fff' : 'rgba(255,255,255,0.5)',
            }}>
              {r.short}
              {done > 0 && <span style={{ marginLeft:4, fontSize:9, opacity:.7 }}>{done}/{total}</span>}
              {done === 0 && hasTeams > 0 && <span style={{ marginLeft:4, fontSize:8, color:'#F5A623' }}>•</span>}
            </button>
          )
        })}
      </div>

      <main style={{ padding:'16px 12px' }}>
        {/* Título da rodada */}
        <div style={{ marginBottom:14, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ background:'rgba(245,166,35,0.15)', border:'1px solid rgba(245,166,35,0.3)', borderRadius:8, padding:'3px 10px', fontSize:10, fontWeight:900, color:'#F5A623', textTransform:'uppercase', letterSpacing:1 }}>
              {current?.short}
            </span>
            <span style={{ color:'#fff', fontWeight:800, fontSize:14 }}>{current?.label}</span>
          </div>
          <span style={{ color:'rgba(255,255,255,0.3)', fontSize:11 }}>
            {current?.matches.filter(m => dbMatches[m.id]?.is_finished).length}/{current?.matches.length}
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:48, color:'rgba(255,255,255,0.3)' }}>
            <Loader2 size={28} style={{ animation:'spin 1s linear infinite', margin:'0 auto 8px', display:'block' }}/>
            <p>Carregando...</p>
            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <div>
            {current?.matches.map(m => (
              <MatchCard key={m.id} match={m} dbMatch={dbMatches[m.id]} />
            ))}
          </div>
        )}

        {/* Aviso se rodada ainda não tem times */}
        {!loading && current?.matches.every(m => !dbMatches[m.id]?.team1) && (
          <div style={{ background:'rgba(245,166,35,0.08)', border:'1px solid rgba(245,166,35,0.2)', borderRadius:14, padding:'20px 16px', textAlign:'center', marginTop:8 }}>
            <div style={{ fontSize:36, marginBottom:8 }}>⏳</div>
            <div style={{ color:'#F5A623', fontWeight:800, fontSize:14 }}>{current?.label} ainda não começou</div>
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:12, marginTop:4 }}>
              Os confrontos serão definidos após a fase anterior.
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
