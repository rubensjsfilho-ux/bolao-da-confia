import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import Header from '../components/Header'
import { GROUP_MATCHES, getFlag } from '../data/matches'
import { Loader2 } from 'lucide-react'

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

const GROUP_TEAMS = {
  A: ['México','África do Sul','Coreia do Sul','República Tcheca'],
  B: ['Canadá','Catar','Suíça','Bósnia e Herz.'],
  C: ['Brasil','Marrocos','Haiti','Escócia'],
  D: ['Estados Unidos','Paraguai','Austrália','Turquia'],
  E: ['Alemanha','Curaçao','Costa do Marfim','Equador'],
  F: ['Holanda','Japão','Tunísia','Suécia'],
  G: ['Bélgica','Egito','Irã','Nova Zelândia'],
  H: ['Espanha','Cabo Verde','Arábia Saudita','Uruguai'],
  I: ['França','Senegal','Noruega','Iraque'],
  J: ['Argentina','Argélia','Áustria','Jordânia'],
  K: ['Portugal','Uzbequistão','Colômbia','RD Congo'],
  L: ['Inglaterra','Croácia','Gana','Panamá'],
}

const KO_ROUNDS = [
  { id:'r2',  label:'2ª Fase',         count:16 },
  { id:'r16', label:'Oitavas de Final', count:8  },
  { id:'qf',  label:'Quartas de Final', count:4  },
  { id:'sf',  label:'Semifinais',       count:2  },
  { id:'f',   label:'Final',            count:2  },
]

function calcStandings(groupLetter, results) {
  const teams = GROUP_TEAMS[groupLetter] || []
  const standings = {}
  teams.forEach(t => { standings[t] = { team:t, pts:0, j:0, v:0, e:0, d:0, gp:0, gc:0, sg:0 } })

  GROUP_MATCHES.filter(m => m.group === groupLetter).forEach(m => {
    const res = results[m.id]
    if (!res || res.score1 === null || res.score1 === undefined) return
    const s1 = res.score1, s2 = res.score2
    const t1 = standings[m.team1], t2 = standings[m.team2]
    if (!t1 || !t2) return
    t1.j++; t2.j++
    t1.gp += s1; t1.gc += s2; t1.sg += (s1-s2)
    t2.gp += s2; t2.gc += s1; t2.sg += (s2-s1)
    if (s1 > s2)      { t1.v++; t1.pts+=3; t2.d++ }
    else if (s1 < s2) { t2.v++; t2.pts+=3; t1.d++ }
    else              { t1.e++; t1.pts++; t2.e++; t2.pts++ }
  })

  return Object.values(standings).sort((a,b) => {
    if (b.pts !== a.pts) return b.pts - a.pts
    if (b.sg !== a.sg)   return b.sg - a.sg
    if (b.gp !== a.gp)   return b.gp - a.gp
    return a.team.localeCompare(b.team)
  })
}

// ── Mini-card de partida (fase de grupos) ─────────────────────────────────────
function MatchCard({ match, result }) {
  const hasScore  = result && result.score1 !== null && result.score1 !== undefined
  const isFinished = result?.is_finished

  return (
    <div style={{
      display:'flex', alignItems:'center', gap:8, padding:'8px 12px',
      background: isFinished ? 'rgba(0,150,57,0.06)' : hasScore ? 'rgba(245,166,35,0.06)' : 'rgba(0,40,85,0.03)',
      borderRadius:10, border:`1px solid ${isFinished?'rgba(0,150,57,0.15)':hasScore?'rgba(245,166,35,0.15)':'#E2EAF0'}`,
    }}>
      <div style={{ flex:1, display:'flex', alignItems:'center', gap:5, justifyContent:'flex-end' }}>
        <span style={{ fontSize:11, fontWeight:700, color:'#002855', textAlign:'right', maxWidth:80, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{match.team1}</span>
        <span style={{ fontSize:18 }}>{getFlag(match.team1)}</span>
      </div>
      <div style={{ minWidth:52, textAlign:'center', background: isFinished?'rgba(0,150,57,0.12)':hasScore?'rgba(245,166,35,0.12)':'rgba(0,40,85,0.06)', borderRadius:8, padding:'3px 8px', border:`1px solid ${isFinished?'rgba(0,150,57,0.2)':hasScore?'rgba(245,166,35,0.2)':'rgba(0,40,85,0.08)'}` }}>
        {hasScore
          ? <span style={{ fontSize:14, fontWeight:900, color:isFinished?'#009639':'#D4890A', letterSpacing:1 }}>{result.score1} × {result.score2}</span>
          : <span style={{ fontSize:11, fontWeight:700, color:'#9BABB8' }}>vs</span>
        }
      </div>
      <div style={{ flex:1, display:'flex', alignItems:'center', gap:5 }}>
        <span style={{ fontSize:18 }}>{getFlag(match.team2)}</span>
        <span style={{ fontSize:11, fontWeight:700, color:'#002855', maxWidth:80, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{match.team2}</span>
      </div>
      {isFinished && <span style={{ fontSize:9, fontWeight:800, color:'#009639', background:'rgba(0,150,57,0.1)', borderRadius:6, padding:'2px 6px', flexShrink:0 }}>✓ FIM</span>}
      {!isFinished && hasScore && <span style={{ fontSize:9, fontWeight:800, color:'#D4890A', background:'rgba(245,166,35,0.1)', borderRadius:6, padding:'2px 6px', flexShrink:0 }}>⏱</span>}
    </div>
  )
}

// ── Card de confronto mata-mata ────────────────────────────────────────────────
function KOMatchCard({ matchId, db }) {
  const hasTeams   = db?.team1 && db?.team2
  const hasScore   = db && db.score1 !== null && db.score1 !== undefined
  const isFinished = db?.is_finished

  if (!hasTeams) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'10px 12px', background:'rgba(0,40,85,0.03)', borderRadius:10, border:'1px solid #E2EAF0' }}>
      <span style={{ fontSize:10, color:'#9BABB8', fontWeight:700 }}>⏳ A definir</span>
    </div>
  )

  return (
    <div style={{
      display:'flex', alignItems:'center', gap:8, padding:'8px 12px',
      background: isFinished ? 'rgba(0,150,57,0.06)' : hasScore ? 'rgba(245,166,35,0.06)' : 'rgba(0,40,85,0.03)',
      borderRadius:10, border:`1px solid ${isFinished?'rgba(0,150,57,0.15)':hasScore?'rgba(245,166,35,0.15)':'#E2EAF0'}`,
    }}>
      <div style={{ flex:1, display:'flex', alignItems:'center', gap:5, justifyContent:'flex-end' }}>
        <span style={{ fontSize:11, fontWeight:700, color:'#002855', textAlign:'right', maxWidth:80, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{db.team1}</span>
        <span style={{ fontSize:18 }}>{getFlag(db.team1)}</span>
      </div>
      <div style={{ minWidth:52, textAlign:'center', background: isFinished?'rgba(0,150,57,0.12)':hasScore?'rgba(245,166,35,0.12)':'rgba(0,40,85,0.06)', borderRadius:8, padding:'3px 8px', border:`1px solid ${isFinished?'rgba(0,150,57,0.2)':hasScore?'rgba(245,166,35,0.2)':'rgba(0,40,85,0.08)'}` }}>
        {hasScore
          ? <span style={{ fontSize:14, fontWeight:900, color:isFinished?'#009639':'#D4890A', letterSpacing:1 }}>{db.score1} × {db.score2}</span>
          : <span style={{ fontSize:11, fontWeight:700, color:'#9BABB8' }}>vs</span>
        }
      </div>
      <div style={{ flex:1, display:'flex', alignItems:'center', gap:5 }}>
        <span style={{ fontSize:18 }}>{getFlag(db.team2)}</span>
        <span style={{ fontSize:11, fontWeight:700, color:'#002855', maxWidth:80, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{db.team2}</span>
      </div>
      {isFinished && <span style={{ fontSize:9, fontWeight:800, color:'#009639', background:'rgba(0,150,57,0.1)', borderRadius:6, padding:'2px 6px', flexShrink:0 }}>✓ FIM</span>}
      {!isFinished && hasScore && <span style={{ fontSize:9, fontWeight:800, color:'#D4890A', background:'rgba(245,166,35,0.1)', borderRadius:6, padding:'2px 6px', flexShrink:0 }}>⏱</span>}
    </div>
  )
}

// ── Aba Mata-Mata ─────────────────────────────────────────────────────────────
function KnockoutTab({ koMatches }) {
  const [activeRound, setActiveRound] = useState('r2')

  const current = KO_ROUNDS.find(r => r.id === activeRound)
  const roundMatches = Array.from({ length: current.count }, (_, i) => `${activeRound}_${i+1}`)
  const hasAny = roundMatches.some(id => koMatches[id]?.team1)

  const finished = roundMatches.filter(id => koMatches[id]?.is_finished).length
  const total    = roundMatches.filter(id => koMatches[id]?.team1).length

  return (
    <div>
      {/* Abas de rodada */}
      <div style={{ display:'flex', gap:5, overflowX:'auto', paddingBottom:8, marginBottom:14 }}>
        {KO_ROUNDS.map(r => {
          const rMatches = Array.from({ length:r.count }, (_,i) => `${r.id}_${i+1}`)
          const hasRound = rMatches.some(id => koMatches[id]?.team1)
          return (
            <button key={r.id} onClick={() => setActiveRound(r.id)} style={{
              flexShrink:0, padding:'6px 14px', border:'none', borderRadius:20,
              fontWeight:800, fontSize:11, cursor:'pointer', fontFamily:'Nunito,sans-serif',
              background: activeRound===r.id ? '#002855' : '#F4F6F9',
              color: activeRound===r.id ? '#fff' : hasRound ? '#002855' : '#9BABB8',
              opacity: hasRound ? 1 : 0.5,
            }}>
              {r.label}
              {hasRound && <span style={{ marginLeft:4, fontSize:9, opacity:.7 }}>
                {rMatches.filter(id=>koMatches[id]?.is_finished).length}/{rMatches.filter(id=>koMatches[id]?.team1).length}
              </span>}
            </button>
          )
        })}
      </div>

      {/* Conteúdo da rodada */}
      {!hasAny ? (
        <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E2EAF0', padding:'32px 16px', textAlign:'center' }}>
          <div style={{ fontSize:36, marginBottom:8 }}>⏳</div>
          <div style={{ color:'#002855', fontWeight:800, fontSize:14 }}>Rodada ainda não liberada</div>
          <div style={{ color:'#9BABB8', fontSize:12, marginTop:4 }}>Os confrontos serão definidos após a fase anterior.</div>
        </div>
      ) : (
        <div style={{ background:'#fff', borderRadius:14, overflow:'hidden', border:'1px solid #E2EAF0', boxShadow:'0 2px 12px rgba(0,40,85,0.06)' }}>
          {/* Header */}
          <div style={{ background:'linear-gradient(135deg,#002855,#003f7f)', padding:'10px 14px', display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ background:'rgba(245,166,35,0.2)', border:'1px solid rgba(245,166,35,0.4)', borderRadius:8, padding:'3px 10px' }}>
              <span style={{ color:'#F5A623', fontWeight:900, fontSize:12, letterSpacing:1 }}>{current.label.toUpperCase()}</span>
            </div>
            <span style={{ color:'rgba(255,255,255,0.5)', fontSize:10 }}>{finished}/{total} jogos</span>
          </div>
          {/* Lista de jogos */}
          <div style={{ padding:'10px 12px', display:'flex', flexDirection:'column', gap:5 }}>
            {roundMatches.map((id, i) => (
              <div key={id}>
                <div style={{ fontSize:9, fontWeight:700, color:'#9BABB8', marginBottom:3, paddingLeft:2 }}>
                  Jogo {i+1}
                </div>
                <KOMatchCard matchId={id} db={koMatches[id]} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Tabela de grupo ───────────────────────────────────────────────────────────
function GroupTable({ letter, results }) {
  const standings    = calcStandings(letter, results)
  const groupMatches = GROUP_MATCHES.filter(m => m.group === letter)

  return (
    <div style={{ background:'#fff', borderRadius:14, overflow:'hidden', border:'1px solid #E2EAF0', boxShadow:'0 2px 12px rgba(0,40,85,0.06)', marginBottom:12 }}>
      <div style={{ background:'linear-gradient(135deg,#002855,#003f7f)', padding:'10px 14px', display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ background:'rgba(245,166,35,0.2)', border:'1px solid rgba(245,166,35,0.4)', borderRadius:8, padding:'3px 10px' }}>
          <span style={{ color:'#F5A623', fontWeight:900, fontSize:12, letterSpacing:1 }}>GRUPO {letter}</span>
        </div>
        <span style={{ color:'rgba(255,255,255,0.5)', fontSize:10 }}>
          {groupMatches.filter(m => results[m.id]?.is_finished).length}/{groupMatches.length} jogos
        </span>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 28px 28px 28px 28px 28px 28px 32px', padding:'6px 14px', background:'#F4F6F9', borderBottom:'1px solid #E2EAF0' }}>
        <span style={{ fontSize:9, fontWeight:800, color:'#9BABB8', textTransform:'uppercase' }}>Seleção</span>
        {['J','V','E','D','GP','GC','SG','PTS'].map(h => (
          <span key={h} style={{ fontSize:9, fontWeight:800, color:'#9BABB8', textAlign:'center' }}>{h}</span>
        ))}
      </div>
      {standings.map((s, i) => {
        const qualified = i < 2, bubble = i === 2
        return (
          <div key={s.team} style={{ display:'grid', gridTemplateColumns:'1fr 28px 28px 28px 28px 28px 28px 32px', padding:'9px 14px', borderBottom:i<3?'1px solid #F4F6F9':'none', background:qualified?'rgba(0,150,57,0.04)':bubble?'rgba(245,166,35,0.04)':'#fff' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:14, textAlign:'center', fontSize:9, fontWeight:900, color:qualified?'#009639':bubble?'#D4890A':'#9BABB8' }}>
                {qualified?(i===0?'①':'②'):bubble?'③':`${i+1}`}
              </div>
              <span style={{ fontSize:18 }}>{getFlag(s.team)}</span>
              <span style={{ fontSize:11, fontWeight:700, color:'#002855', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.team}</span>
            </div>
            {[s.j,s.v,s.e,s.d,s.gp,s.gc,s.sg].map((val,idx) => (
              <span key={idx} style={{ fontSize:11, fontWeight:idx===6?700:400, color:idx===6?(val>0?'#009639':val<0?'#e55':'#9BABB8'):'#3A4A5C', textAlign:'center', alignSelf:'center' }}>
                {val>0&&idx===6?`+${val}`:val}
              </span>
            ))}
            <span style={{ fontSize:12, fontWeight:900, color:qualified?'#009639':'#002855', textAlign:'center', alignSelf:'center' }}>{s.pts}</span>
          </div>
        )
      })}
      <div style={{ padding:'6px 14px', background:'#F4F6F9', display:'flex', gap:12, borderBottom:'1px solid #E2EAF0' }}>
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <div style={{ width:8, height:8, borderRadius:2, background:'rgba(0,150,57,0.2)', border:'1px solid #009639' }}/>
          <span style={{ fontSize:8, color:'#9BABB8', fontWeight:700 }}>Classificado</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <div style={{ width:8, height:8, borderRadius:2, background:'rgba(245,166,35,0.2)', border:'1px solid #F5A623' }}/>
          <span style={{ fontSize:8, color:'#9BABB8', fontWeight:700 }}>Possível 3º</span>
        </div>
      </div>
      <div style={{ padding:'10px 12px' }}>
        <div style={{ fontSize:9, fontWeight:800, color:'#9BABB8', textTransform:'uppercase', letterSpacing:.5, marginBottom:8 }}>Partidas</div>
        <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
          {groupMatches.map(m => <MatchCard key={m.id} match={m} result={results[m.id]}/>)}
        </div>
      </div>
    </div>
  )
}

// ── PÁGINA PRINCIPAL ──────────────────────────────────────────────────────────
export default function Groups({ participant, onLogout }) {
  const [tab,         setTab]         = useState('groups') // 'groups' | 'knockout'
  const [activeGroup, setActiveGroup] = useState('A')
  const [viewAll,     setViewAll]     = useState(false)
  const [results,     setResults]     = useState({})
  const [koMatches,   setKoMatches]   = useState({})
  const [loading,     setLoading]     = useState(true)

  // Busca partidas da fase de grupos
  useEffect(() => {
    supabase.from('matches').select('id,team1,team2,score1,score2,is_finished')
      .then(({ data }) => {
        const map = {}
        data?.forEach(m => { map[m.id] = m })
        setResults(map)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Busca confrontos do mata-mata
  useEffect(() => {
    supabase.from('bracket_matches').select('*')
      .then(({ data }) => {
        const map = {}
        data?.forEach(m => { map[m.id] = m })
        setKoMatches(map)
      })
  }, [])

  // Realtime: fase de grupos
  useEffect(() => {
    const ch = supabase.channel('groups-rt')
      .on('postgres_changes', { event:'UPDATE', schema:'public', table:'matches' }, (payload) => {
        const m = payload.new
        setResults(prev => ({ ...prev, [m.id]: m }))
      })
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  // Realtime: mata-mata
  useEffect(() => {
    const ch = supabase.channel('knockout-rt')
      .on('postgres_changes', { event:'UPDATE', schema:'public', table:'bracket_matches' }, (payload) => {
        const m = payload.new
        setKoMatches(prev => ({ ...prev, [m.id]: m }))
      })
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'bracket_matches' }, (payload) => {
        const m = payload.new
        setKoMatches(prev => ({ ...prev, [m.id]: m }))
      })
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  const totalFinished = GROUP_MATCHES.filter(m => results[m.id]?.is_finished).length
  const koFinished    = Object.values(koMatches).filter(m => m.is_finished).length

  return (
    <div style={{ minHeight:'100vh', background:'#F4F6F9', paddingBottom:80 }}>
      <Header participant={participant} onLogout={onLogout} />

      {/* Cabeçalho */}
      <div style={{ background:'linear-gradient(135deg,#002855,#009639)', padding:'70px 16px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
          <span style={{ fontSize:28 }}>📊</span>
          <div>
            <h1 style={{ color:'#fff', fontWeight:900, fontSize:22, margin:0 }}>Resultados</h1>
            <p style={{ color:'rgba(255,255,255,0.6)', fontSize:12, margin:0 }}>Copa do Mundo 2026</p>
          </div>
        </div>
        <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:10, padding:'8px 12px', marginTop:8, display:'flex', gap:16 }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ color:'#F5A623', fontWeight:900, fontSize:18 }}>{totalFinished}</div>
            <div style={{ color:'rgba(255,255,255,0.6)', fontSize:9, textTransform:'uppercase', letterSpacing:.5 }}>Grupos</div>
          </div>
          <div style={{ width:1, background:'rgba(255,255,255,0.15)' }}/>
          <div style={{ textAlign:'center' }}>
            <div style={{ color:'#4ade80', fontWeight:900, fontSize:18 }}>{72-totalFinished}</div>
            <div style={{ color:'rgba(255,255,255,0.6)', fontSize:9, textTransform:'uppercase', letterSpacing:.5 }}>Restantes</div>
          </div>
          <div style={{ width:1, background:'rgba(255,255,255,0.15)' }}/>
          <div style={{ textAlign:'center' }}>
            <div style={{ color:'#fff', fontWeight:900, fontSize:18 }}>{koFinished}</div>
            <div style={{ color:'rgba(255,255,255,0.6)', fontSize:9, textTransform:'uppercase', letterSpacing:.5 }}>Mata-Mata</div>
          </div>
        </div>
      </div>

      {/* Tabs principais: Fase de Grupos / Mata-Mata */}
      <div style={{ background:'#fff', borderBottom:'1px solid #E2EAF0', padding:'8px 12px', display:'flex', gap:6 }}>
        <button onClick={() => setTab('groups')} style={{
          padding:'7px 18px', border:'none', borderRadius:20, fontWeight:800, fontSize:12,
          cursor:'pointer', fontFamily:'Nunito,sans-serif',
          background: tab==='groups' ? '#002855' : 'transparent',
          color: tab==='groups' ? '#fff' : '#9BABB8',
        }}>
          Fase de Grupos
        </button>
        <button onClick={() => setTab('knockout')} style={{
          padding:'7px 18px', border:'none', borderRadius:20, fontWeight:800, fontSize:12,
          cursor:'pointer', fontFamily:'Nunito,sans-serif',
          background: tab==='knockout' ? '#002855' : 'transparent',
          color: tab==='knockout' ? '#fff' : '#9BABB8',
        }}>
          ⚔️ Mata-Mata
        </button>
      </div>

      {/* Sub-filtros da fase de grupos */}
      {tab === 'groups' && (
        <>
          <div style={{ background:'#fff', borderBottom:'1px solid #E2EAF0', padding:'8px 12px', display:'flex', gap:6 }}>
            <button onClick={() => setViewAll(false)} style={{ padding:'6px 14px', border:'none', borderRadius:20, fontWeight:800, fontSize:11, cursor:'pointer', fontFamily:'Nunito,sans-serif', background:!viewAll?'rgba(0,40,85,0.1)':'transparent', color:!viewAll?'#002855':'#9BABB8' }}>
              Por Grupo
            </button>
            <button onClick={() => setViewAll(true)} style={{ padding:'6px 14px', border:'none', borderRadius:20, fontWeight:800, fontSize:11, cursor:'pointer', fontFamily:'Nunito,sans-serif', background:viewAll?'rgba(0,40,85,0.1)':'transparent', color:viewAll?'#002855':'#9BABB8' }}>
              Todos os Grupos
            </button>
          </div>
          {!viewAll && (
            <div style={{ background:'#fff', borderBottom:'1px solid #E2EAF0', padding:'6px 10px', display:'flex', gap:5, overflowX:'auto' }}>
              {GROUPS.map(g => (
                <button key={g} onClick={() => setActiveGroup(g)} style={{
                  flexShrink:0, width:34, height:30, borderRadius:8, border:'none',
                  fontWeight:800, fontSize:11, cursor:'pointer', fontFamily:'Nunito,sans-serif',
                  background: activeGroup===g ? 'rgba(0,40,85,0.1)' : '#F4F6F9',
                  color: activeGroup===g ? '#002855' : '#9BABB8',
                }}>{g}</button>
              ))}
            </div>
          )}
        </>
      )}

      <main style={{ padding:'14px 12px' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:48 }}>
            <Loader2 size={28} style={{ animation:'spin 1s linear infinite', margin:'0 auto 8px', display:'block', color:'#002855' }}/>
            <p style={{ color:'#9BABB8' }}>Carregando...</p>
            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : tab === 'knockout' ? (
          <KnockoutTab koMatches={koMatches} />
        ) : viewAll ? (
          GROUPS.map(g => <GroupTable key={g} letter={g} results={results}/>)
        ) : (
          <GroupTable letter={activeGroup} results={results}/>
        )}
      </main>
    </div>
  )
}