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

const openModal = (p) => { if (window.__openParticipantModal) window.__openParticipantModal(p) }

function calcStandings(groupLetter, results) {
  const teams = GROUP_TEAMS[groupLetter] || []
  const standings = {}
  teams.forEach(t => { standings[t] = { team:t, pts:0, j:0, v:0, e:0, d:0, gp:0, gc:0, sg:0 } })
  GROUP_MATCHES.filter(m => m.group === groupLetter).forEach(m => {
    const res = results[m.id]
    if (!res || res.score1 === null || res.score1 === undefined) return
    const s1=res.score1, s2=res.score2
    const t1=standings[m.team1], t2=standings[m.team2]
    if (!t1||!t2) return
    t1.j++; t2.j++
    t1.gp+=s1; t1.gc+=s2; t1.sg+=(s1-s2)
    t2.gp+=s2; t2.gc+=s1; t2.sg+=(s2-s1)
    if (s1>s2)      { t1.v++; t1.pts+=3; t2.d++ }
    else if (s1<s2) { t2.v++; t2.pts+=3; t1.d++ }
    else            { t1.e++; t1.pts++; t2.e++; t2.pts++ }
  })
  return Object.values(standings).sort((a,b) => {
    if (b.pts!==a.pts) return b.pts-a.pts
    if (b.sg!==a.sg)   return b.sg-a.sg
    if (b.gp!==a.gp)   return b.gp-a.gp
    return a.team.localeCompare(b.team)
  })
}

function MatchRow({ match, result }) {
  const hasScore  = result && result.score1 !== null && result.score1 !== undefined
  const isFinished = result?.is_finished
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:isFinished?'rgba(0,150,57,0.05)':hasScore?'rgba(245,166,35,0.05)':'transparent', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ flex:1, display:'flex', alignItems:'center', gap:6, justifyContent:'flex-end' }}>
        <span style={{ fontSize:12, fontWeight:700, color:'#fff', textAlign:'right', maxWidth:90, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{match.team1}</span>
        <span style={{ fontSize:20 }}>{getFlag(match.team1)}</span>
      </div>
      <div style={{ minWidth:58, textAlign:'center', background:isFinished?'rgba(0,196,79,0.15)':hasScore?'rgba(245,166,35,0.15)':'rgba(255,255,255,0.08)', borderRadius:8, padding:'4px 10px', border:`1px solid ${isFinished?'rgba(0,196,79,0.3)':hasScore?'rgba(245,166,35,0.3)':'rgba(255,255,255,0.1)'}` }}>
        {hasScore
          ? <span style={{ fontSize:15, fontWeight:900, color:isFinished?'#00c44f':'#F5A623', letterSpacing:1 }}>{result.score1} × {result.score2}</span>
          : <span style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.3)' }}>vs</span>
        }
      </div>
      <div style={{ flex:1, display:'flex', alignItems:'center', gap:6 }}>
        <span style={{ fontSize:20 }}>{getFlag(match.team2)}</span>
        <span style={{ fontSize:12, fontWeight:700, color:'#fff', maxWidth:90, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{match.team2}</span>
      </div>
      {isFinished && <span style={{ fontSize:8, fontWeight:800, color:'#00c44f', background:'rgba(0,196,79,0.15)', borderRadius:5, padding:'2px 6px', flexShrink:0 }}>FIM</span>}
      {!isFinished && hasScore && <span style={{ fontSize:8, fontWeight:800, color:'#F5A623', background:'rgba(245,166,35,0.15)', borderRadius:5, padding:'2px 6px', flexShrink:0 }}>⏱</span>}
    </div>
  )
}

function KOMatchRow({ db }) {
  const hasTeams  = db?.team1 && db?.team2
  const hasScore  = db && db.score1 !== null && db.score1 !== undefined
  const isFinished = db?.is_finished
  if (!hasTeams) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'12px 14px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
      <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)', fontWeight:700 }}>⏳ A definir</span>
    </div>
  )
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:isFinished?'rgba(0,150,57,0.05)':hasScore?'rgba(245,166,35,0.05)':'transparent', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ flex:1, display:'flex', alignItems:'center', gap:6, justifyContent:'flex-end' }}>
        <span style={{ fontSize:12, fontWeight:700, color:'#fff', textAlign:'right', maxWidth:90, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{db.team1}</span>
        <span style={{ fontSize:20 }}>{getFlag(db.team1)}</span>
      </div>
      <div style={{ minWidth:58, textAlign:'center', background:isFinished?'rgba(0,196,79,0.15)':hasScore?'rgba(245,166,35,0.15)':'rgba(255,255,255,0.08)', borderRadius:8, padding:'4px 10px', border:`1px solid ${isFinished?'rgba(0,196,79,0.3)':hasScore?'rgba(245,166,35,0.3)':'rgba(255,255,255,0.1)'}` }}>
        {hasScore
          ? <span style={{ fontSize:15, fontWeight:900, color:isFinished?'#00c44f':'#F5A623', letterSpacing:1 }}>{db.score1} × {db.score2}</span>
          : <span style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.3)' }}>vs</span>
        }
      </div>
      <div style={{ flex:1, display:'flex', alignItems:'center', gap:6 }}>
        <span style={{ fontSize:20 }}>{getFlag(db.team2)}</span>
        <span style={{ fontSize:12, fontWeight:700, color:'#fff', maxWidth:90, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{db.team2}</span>
      </div>
      {isFinished && <span style={{ fontSize:8, fontWeight:800, color:'#00c44f', background:'rgba(0,196,79,0.15)', borderRadius:5, padding:'2px 6px', flexShrink:0 }}>FIM</span>}
      {!isFinished && hasScore && <span style={{ fontSize:8, fontWeight:800, color:'#F5A623', background:'rgba(245,166,35,0.15)', borderRadius:5, padding:'2px 6px', flexShrink:0 }}>⏱</span>}
    </div>
  )
}

function GroupTable({ letter, results }) {
  const standings    = calcStandings(letter, results)
  const groupMatches = GROUP_MATCHES.filter(m => m.group === letter)
  const finished     = groupMatches.filter(m => results[m.id]?.is_finished).length

  return (
    <div style={{ background:'#0d1b2e', borderRadius:16, overflow:'hidden', border:'1px solid rgba(255,255,255,0.08)', marginBottom:12, boxShadow:'0 4px 20px rgba(0,0,0,0.3)' }}>
      {/* Header do grupo */}
      <div style={{ background:'linear-gradient(90deg,#002855,#004080)', padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ background:'#F5A623', borderRadius:8, padding:'4px 12px' }}>
            <span style={{ color:'#000', fontWeight:900, fontSize:13, letterSpacing:1 }}>GRUPO {letter}</span>
          </div>
          <span style={{ color:'rgba(255,255,255,0.4)', fontSize:11 }}>{finished}/{groupMatches.length} jogos</span>
        </div>
      </div>

      {/* Cabeçalho tabela */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 28px 28px 28px 28px 28px 28px 32px', padding:'6px 14px', background:'rgba(0,0,0,0.3)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontSize:9, fontWeight:800, color:'rgba(255,255,255,0.35)', textTransform:'uppercase' }}>Seleção</span>
        {['J','V','E','D','GP','GC','SG','PTS'].map(h => (
          <span key={h} style={{ fontSize:9, fontWeight:800, color:'rgba(255,255,255,0.35)', textAlign:'center' }}>{h}</span>
        ))}
      </div>

      {/* Linhas da tabela */}
      {standings.map((s, i) => {
        const qualified = i < 2, bubble = i === 2
        return (
          <div key={s.team} style={{ display:'grid', gridTemplateColumns:'1fr 28px 28px 28px 28px 28px 28px 32px', padding:'9px 14px', borderBottom:i<3?'1px solid rgba(255,255,255,0.05)':'none', background:qualified?'rgba(0,196,79,0.06)':bubble?'rgba(245,166,35,0.04)':'transparent' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:16, textAlign:'center', fontSize:10, fontWeight:900, color:qualified?'#00c44f':bubble?'#F5A623':'rgba(255,255,255,0.3)' }}>
                {qualified?(i===0?'①':'②'):bubble?'③':`${i+1}`}
              </div>
              <span style={{ fontSize:20 }}>{getFlag(s.team)}</span>
              <span style={{ fontSize:11, fontWeight:700, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.team}</span>
            </div>
            {[s.j,s.v,s.e,s.d,s.gp,s.gc,s.sg].map((val,idx) => (
              <span key={idx} style={{ fontSize:11, fontWeight:idx===6?700:400, color:idx===6?(val>0?'#00c44f':val<0?'#f87171':'rgba(255,255,255,0.4)'):'rgba(255,255,255,0.6)', textAlign:'center', alignSelf:'center' }}>
                {val>0&&idx===6?`+${val}`:val}
              </span>
            ))}
            <span style={{ fontSize:13, fontWeight:900, color:qualified?'#00c44f':'#F5A623', textAlign:'center', alignSelf:'center' }}>{s.pts}</span>
          </div>
        )
      })}

      {/* Legenda */}
      <div style={{ padding:'6px 14px', background:'rgba(0,0,0,0.2)', display:'flex', gap:14, borderTop:'1px solid rgba(255,255,255,0.06)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <div style={{ width:8, height:8, borderRadius:2, background:'rgba(0,196,79,0.3)', border:'1px solid #00c44f' }}/>
          <span style={{ fontSize:8, color:'rgba(255,255,255,0.4)', fontWeight:700 }}>Classificado</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <div style={{ width:8, height:8, borderRadius:2, background:'rgba(245,166,35,0.3)', border:'1px solid #F5A623' }}/>
          <span style={{ fontSize:8, color:'rgba(255,255,255,0.4)', fontWeight:700 }}>Possível 3º</span>
        </div>
      </div>

      {/* Partidas */}
      <div style={{ padding:'10px 0 4px' }}>
        <div style={{ fontSize:9, fontWeight:800, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:1, padding:'0 14px', marginBottom:4 }}>Partidas</div>
        {groupMatches.map(m => <MatchRow key={m.id} match={m} result={results[m.id]}/>)}
      </div>
    </div>
  )
}

function KnockoutTab({ koMatches }) {
  const [activeRound, setActiveRound] = useState('r2')
  const current     = KO_ROUNDS.find(r => r.id === activeRound)
  const roundIds    = Array.from({ length:current.count }, (_,i) => `${activeRound}_${i+1}`)
  const hasAny      = roundIds.some(id => koMatches[id]?.team1)
  const finished    = roundIds.filter(id => koMatches[id]?.is_finished).length
  const total       = roundIds.filter(id => koMatches[id]?.team1).length

  return (
    <div>
      {/* Abas de rodada */}
      <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:8, marginBottom:14 }}>
        {KO_ROUNDS.map(r => {
          const rIds   = Array.from({ length:r.count }, (_,i) => `${r.id}_${i+1}`)
          const hasR   = rIds.some(id => koMatches[id]?.team1)
          const active = activeRound === r.id
          return (
            <button key={r.id} onClick={() => setActiveRound(r.id)} style={{
              flexShrink:0, padding:'7px 14px', border:'none', borderRadius:20,
              fontWeight:800, fontSize:11, cursor:'pointer', fontFamily:'Nunito,sans-serif',
              background: active ? '#F5A623' : 'rgba(255,255,255,0.08)',
              color: active ? '#000' : hasR ? '#fff' : 'rgba(255,255,255,0.3)',
            }}>
              {r.label}
              {hasR && <span style={{ marginLeft:4, fontSize:9, opacity:.7 }}>
                {rIds.filter(id=>koMatches[id]?.is_finished).length}/{rIds.filter(id=>koMatches[id]?.team1).length}
              </span>}
            </button>
          )
        })}
      </div>

      {!hasAny ? (
        <div style={{ background:'#0d1b2e', borderRadius:16, border:'1px solid rgba(255,255,255,0.08)', padding:'32px 16px', textAlign:'center' }}>
          <div style={{ fontSize:36, marginBottom:8 }}>⏳</div>
          <div style={{ color:'#fff', fontWeight:800, fontSize:14 }}>Rodada ainda não liberada</div>
          <div style={{ color:'rgba(255,255,255,0.4)', fontSize:12, marginTop:4 }}>Os confrontos serão definidos após a fase anterior.</div>
        </div>
      ) : (
        <div style={{ background:'#0d1b2e', borderRadius:16, overflow:'hidden', border:'1px solid rgba(255,255,255,0.08)', boxShadow:'0 4px 20px rgba(0,0,0,0.3)' }}>
          <div style={{ background:'linear-gradient(90deg,#002855,#004080)', padding:'12px 16px', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ background:'#F5A623', borderRadius:8, padding:'4px 12px' }}>
              <span style={{ color:'#000', fontWeight:900, fontSize:13, letterSpacing:1 }}>{current.label.toUpperCase()}</span>
            </div>
            <span style={{ color:'rgba(255,255,255,0.4)', fontSize:11 }}>{finished}/{total} jogos</span>
          </div>
          {roundIds.map((id, i) => (
            <div key={id}>
              <div style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.3)', padding:'8px 14px 2px', textTransform:'uppercase', letterSpacing:.5 }}>Jogo {i+1}</div>
              <KOMatchRow db={koMatches[id]}/>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Groups({ participant, onLogout }) {
  const [tab,         setTab]         = useState('groups')
  const [activeGroup, setActiveGroup] = useState('A')
  const [viewAll,     setViewAll]     = useState(false)
  const [results,     setResults]     = useState({})
  const [koMatches,   setKoMatches]   = useState({})
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    supabase.from('matches').select('id,team1,team2,score1,score2,is_finished')
      .then(({ data }) => {
        const map = {}; data?.forEach(m => { map[m.id]=m }); setResults(map); setLoading(false)
      }).catch(()=>setLoading(false))
  }, [])

  useEffect(() => {
    supabase.from('bracket_matches').select('*')
      .then(({ data }) => { const map={}; data?.forEach(m=>{map[m.id]=m}); setKoMatches(map) })
  }, [])

  useEffect(() => {
    const ch = supabase.channel('groups-rt')
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'matches'},(p)=>{ setResults(prev=>({...prev,[p.new.id]:p.new})) })
      .subscribe()
    return ()=>supabase.removeChannel(ch)
  }, [])

  useEffect(() => {
    const ch = supabase.channel('knockout-rt')
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'bracket_matches'},(p)=>{ setKoMatches(prev=>({...prev,[p.new.id]:p.new})) })
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'bracket_matches'},(p)=>{ setKoMatches(prev=>({...prev,[p.new.id]:p.new})) })
      .subscribe()
    return ()=>supabase.removeChannel(ch)
  }, [])

  const totalFinished = GROUP_MATCHES.filter(m=>results[m.id]?.is_finished).length
  const koFinished    = Object.values(koMatches).filter(m=>m.is_finished).length

  return (
    <div style={{ minHeight:'100vh', background:'#060d18', paddingBottom:80 }}>
      <Header participant={participant} onLogout={onLogout}/>

      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#001a3a 0%,#002855 60%,#003d00 100%)', padding:'70px 16px 24px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-60, right:-60, width:220, height:220, borderRadius:'50%', background:'rgba(0,150,57,0.07)', pointerEvents:'none' }}/>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16, position:'relative', zIndex:1 }}>
          <div>
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:9, fontWeight:800, letterSpacing:3, textTransform:'uppercase', marginBottom:4 }}>Copa do Mundo 2026</div>
            <h1 style={{ color:'#fff', fontWeight:900, fontSize:32, margin:0, letterSpacing:-1, textTransform:'uppercase' }}>RESULTADOS</h1>
          </div>
        </div>
        {/* Stats rápidos */}
        <div style={{ display:'flex', gap:1, background:'rgba(255,255,255,0.06)', borderRadius:12, overflow:'hidden', position:'relative', zIndex:1 }}>
          {[
            [totalFinished,   'Jogos',    '#F5A623'],
            [72-totalFinished,'Restantes','#00c44f'],
            [koFinished,      'Mata-Mata','#7B8CE8'],
          ].map(([v,l,c])=>(
            <div key={l} style={{ flex:1, padding:'12px 8px', textAlign:'center', borderRight:'1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ color:c, fontWeight:900, fontSize:22 }}>{v}</div>
              <div style={{ color:'rgba(255,255,255,0.4)', fontSize:9, textTransform:'uppercase', letterSpacing:.5, marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs principais */}
      <div style={{ background:'#0d1b2e', borderBottom:'1px solid rgba(255,255,255,0.08)', padding:'10px 12px', display:'flex', gap:6 }}>
        {[['groups','Fase de Grupos'],['knockout','⚔️ Mata-Mata']].map(([key,label])=>(
          <button key={key} onClick={()=>setTab(key)} style={{
            padding:'8px 18px', border:'none', borderRadius:20, fontWeight:800, fontSize:12,
            cursor:'pointer', fontFamily:'Nunito,sans-serif',
            background: tab===key ? '#F5A623' : 'rgba(255,255,255,0.06)',
            color: tab===key ? '#000' : 'rgba(255,255,255,0.5)',
          }}>{label}</button>
        ))}
      </div>

      {/* Sub-filtros grupos */}
      {tab==='groups' && (
        <>
          <div style={{ background:'#0d1b2e', borderBottom:'1px solid rgba(255,255,255,0.08)', padding:'8px 12px', display:'flex', gap:6 }}>
            {[['Por Grupo',false],['Todos',true]].map(([label,val])=>(
              <button key={label} onClick={()=>setViewAll(val)} style={{
                padding:'6px 14px', border:'none', borderRadius:20, fontWeight:800, fontSize:11,
                cursor:'pointer', fontFamily:'Nunito,sans-serif',
                background: viewAll===val ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: viewAll===val ? '#fff' : 'rgba(255,255,255,0.4)',
              }}>{label}</button>
            ))}
          </div>
          {!viewAll && (
            <div style={{ background:'#0d1b2e', borderBottom:'1px solid rgba(255,255,255,0.08)', padding:'8px 10px', display:'flex', gap:5, overflowX:'auto' }}>
              {GROUPS.map(g=>(
                <button key={g} onClick={()=>setActiveGroup(g)} style={{
                  flexShrink:0, width:34, height:30, borderRadius:8, border:'none',
                  fontWeight:800, fontSize:11, cursor:'pointer', fontFamily:'Nunito,sans-serif',
                  background: activeGroup===g ? '#F5A623' : 'rgba(255,255,255,0.06)',
                  color: activeGroup===g ? '#000' : 'rgba(255,255,255,0.5)',
                }}>{g}</button>
              ))}
            </div>
          )}
        </>
      )}

      <main style={{ padding:'14px 12px' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:48 }}>
            <Loader2 size={28} style={{ animation:'spin 1s linear infinite', margin:'0 auto 8px', display:'block', color:'#F5A623' }}/>
            <p style={{ color:'rgba(255,255,255,0.4)' }}>Carregando...</p>
            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : tab==='knockout' ? (
          <KnockoutTab koMatches={koMatches}/>
        ) : viewAll ? (
          GROUPS.map(g=><GroupTable key={g} letter={g} results={results}/>)
        ) : (
          <GroupTable letter={activeGroup} results={results}/>
        )}
      </main>
    </div>
  )
}
