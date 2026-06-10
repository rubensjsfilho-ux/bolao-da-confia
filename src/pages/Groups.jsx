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
  const hasScore   = result && result.score1 !== null && result.score1 !== undefined
  const isFinished = result?.is_finished
  const d          = match.date ? new Date(match.date) : null
  const dateStr    = d ? d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',timeZone:'America/Sao_Paulo'}) : 'DD/MM'
  const timeStr    = d ? d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',timeZone:'America/Sao_Paulo'}) : 'HH:MM'

  return (
    <div style={{ display:'flex', alignItems:'center', background:'#fff', borderRadius:10, border:'1px solid #E8EDF2', marginBottom:6, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,40,85,0.06)' }}>
      {/* Borda lateral colorida */}
      <div style={{ width:4, alignSelf:'stretch', background:isFinished?'#009639':hasScore?'#F5A623':'#1A73E8', flexShrink:0 }}/>
      {/* Data/hora */}
      <div style={{ padding:'10px 10px', textAlign:'center', minWidth:52, flexShrink:0 }}>
        <div style={{ fontSize:10, fontWeight:800, color:'#002855' }}>{dateStr}</div>
        <div style={{ fontSize:10, fontWeight:700, color:'#9BABB8' }}>{timeStr}</div>
        <div style={{ fontSize:8, color:'#C8D5E0', marginTop:2 }}>{match.city?.split('/')[0]||''}</div>
      </div>
      {/* Time 1 */}
      <div style={{ flex:1, display:'flex', alignItems:'center', gap:6, justifyContent:'flex-end', padding:'0 8px' }}>
        <span style={{ fontSize:12, fontWeight:800, color:'#002855', textAlign:'right', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{match.team1}</span>
        <span style={{ fontSize:22 }}>{getFlag(match.team1)}</span>
      </div>
      {/* Placar/VS */}
      <div style={{ minWidth:60, textAlign:'center', flexShrink:0 }}>
        {hasScore ? (
          <div style={{ background:isFinished?'#009639':'#F5A623', borderRadius:6, padding:'4px 8px', display:'inline-block' }}>
            <span style={{ fontSize:14, fontWeight:900, color:'#fff', letterSpacing:1 }}>{result.score1} × {result.score2}</span>
          </div>
        ) : (
          <div style={{ background:'#1A73E8', borderRadius:6, padding:'4px 8px', display:'inline-block' }}>
            <span style={{ fontSize:12, fontWeight:900, color:'#fff', letterSpacing:1 }}>VS</span>
          </div>
        )}
      </div>
      {/* Time 2 */}
      <div style={{ flex:1, display:'flex', alignItems:'center', gap:6, padding:'0 8px' }}>
        <span style={{ fontSize:22 }}>{getFlag(match.team2)}</span>
        <span style={{ fontSize:12, fontWeight:800, color:'#002855', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{match.team2}</span>
      </div>
    </div>
  )
}

function KOMatchRow({ db }) {
  const hasTeams   = db?.team1 && db?.team2
  const hasScore   = db && db.score1 !== null && db.score1 !== undefined
  const isFinished = db?.is_finished

  if (!hasTeams) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'12px', background:'#F8FAFC', borderRadius:10, border:'1px solid #E8EDF2', marginBottom:6 }}>
      <span style={{ fontSize:11, color:'#9BABB8', fontWeight:700 }}>⏳ A definir</span>
    </div>
  )
  return (
    <div style={{ display:'flex', alignItems:'center', background:'#fff', borderRadius:10, border:'1px solid #E8EDF2', marginBottom:6, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,40,85,0.06)' }}>
      <div style={{ width:4, alignSelf:'stretch', background:isFinished?'#009639':hasScore?'#F5A623':'#1A73E8', flexShrink:0 }}/>
      <div style={{ flex:1, display:'flex', alignItems:'center', gap:6, justifyContent:'flex-end', padding:'10px 8px' }}>
        <span style={{ fontSize:12, fontWeight:800, color:'#002855', textAlign:'right', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{db.team1}</span>
        <span style={{ fontSize:22 }}>{getFlag(db.team1)}</span>
      </div>
      <div style={{ minWidth:60, textAlign:'center', flexShrink:0 }}>
        {hasScore ? (
          <div style={{ background:isFinished?'#009639':'#F5A623', borderRadius:6, padding:'4px 8px', display:'inline-block' }}>
            <span style={{ fontSize:14, fontWeight:900, color:'#fff', letterSpacing:1 }}>{db.score1} × {db.score2}</span>
          </div>
        ) : (
          <div style={{ background:'#1A73E8', borderRadius:6, padding:'4px 8px', display:'inline-block' }}>
            <span style={{ fontSize:12, fontWeight:900, color:'#fff' }}>VS</span>
          </div>
        )}
      </div>
      <div style={{ flex:1, display:'flex', alignItems:'center', gap:6, padding:'10px 8px' }}>
        <span style={{ fontSize:22 }}>{getFlag(db.team2)}</span>
        <span style={{ fontSize:12, fontWeight:800, color:'#002855', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{db.team2}</span>
      </div>
    </div>
  )
}

function GroupTable({ letter, results }) {
  const standings    = calcStandings(letter, results)
  const groupMatches = GROUP_MATCHES.filter(m => m.group === letter)
  const finished     = groupMatches.filter(m => results[m.id]?.is_finished).length

  return (
    <div style={{ background:'#fff', borderRadius:16, overflow:'hidden', border:'1px solid #E2EAF0', marginBottom:16, boxShadow:'0 2px 12px rgba(0,40,85,0.07)' }}>
      {/* Header estilo FIFA */}
      <div style={{ background:'#002855', padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ fontSize:28 }}>⚽</div>
        <div>
          <div style={{ color:'rgba(255,255,255,0.5)', fontSize:9, fontWeight:800, letterSpacing:2, textTransform:'uppercase' }}>Copa do Mundo 2026</div>
          <div style={{ color:'#fff', fontWeight:900, fontSize:22, letterSpacing:-0.5, textTransform:'uppercase', lineHeight:1 }}>Grupo {letter}</div>
          <div style={{ width:32, height:3, background:'#009639', borderRadius:2, marginTop:4 }}/>
        </div>
        <div style={{ marginLeft:'auto', color:'rgba(255,255,255,0.4)', fontSize:11 }}>{finished}/{groupMatches.length} jogos</div>
      </div>

      {/* Cabeçalho tabela */}
      <div style={{ display:'grid', gridTemplateColumns:'40px 1fr 32px 32px 32px 32px 32px 32px 32px 36px', background:'#1a2a3a', padding:'7px 12px' }}>
        <span style={{ fontSize:9, fontWeight:800, color:'rgba(255,255,255,0.5)', textTransform:'uppercase' }}>POS</span>
        <span style={{ fontSize:9, fontWeight:800, color:'rgba(255,255,255,0.5)', textTransform:'uppercase' }}>EQUIPE</span>
        {['J','V','E','D','GP','GC','SG','PTS'].map(h=>(
          <span key={h} style={{ fontSize:9, fontWeight:800, color:'rgba(255,255,255,0.5)', textAlign:'center' }}>{h}</span>
        ))}
      </div>

      {/* Linhas */}
      {standings.map((s, i) => {
        const qualified = i < 2, bubble = i === 2
        const posColor  = qualified ? '#009639' : bubble ? '#F5A623' : '#9BABB8'
        return (
          <div key={s.team} style={{ display:'grid', gridTemplateColumns:'40px 1fr 32px 32px 32px 32px 32px 32px 32px 36px', padding:'9px 12px', borderBottom:'1px solid #F0F4F8', background:qualified?'rgba(0,150,57,0.03)':bubble?'rgba(245,166,35,0.03)':'#fff', alignItems:'center' }}>
            {/* Posição com badge */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:24, height:24, borderRadius:6, background:posColor, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ color:'#fff', fontWeight:900, fontSize:12 }}>{i+1}</span>
              </div>
            </div>
            {/* Time */}
            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
              <span style={{ fontSize:20 }}>{getFlag(s.team)}</span>
              <span style={{ fontSize:12, fontWeight:700, color:'#002855', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.team}</span>
            </div>
            {[s.j,s.v,s.e,s.d,s.gp,s.gc,s.sg].map((val,idx)=>(
              <span key={idx} style={{ fontSize:12, fontWeight:idx===6?700:500, color:idx===6?(val>0?'#009639':val<0?'#e53':'#9BABB8'):'#3A4A5C', textAlign:'center' }}>
                {val>0&&idx===6?`+${val}`:val}
              </span>
            ))}
            <span style={{ fontSize:13, fontWeight:900, color:posColor, textAlign:'center' }}>{s.pts}</span>
          </div>
        )
      })}

      {/* Legenda */}
      <div style={{ padding:'8px 14px', background:'#F8FAFC', display:'flex', gap:16, borderTop:'1px solid #E8EDF2', borderBottom:'1px solid #E8EDF2' }}>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ width:10, height:10, borderRadius:3, background:'#009639' }}/>
          <span style={{ fontSize:9, color:'#6B7A8D', fontWeight:700 }}>Classificado</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ width:10, height:10, borderRadius:3, background:'#F5A623' }}/>
          <span style={{ fontSize:9, color:'#6B7A8D', fontWeight:700 }}>Possível 3º colocado</span>
        </div>
      </div>

      {/* Partidas */}
      <div style={{ padding:'12px 12px 8px' }}>
        <div style={{ fontSize:11, fontWeight:900, color:'#002855', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>
          Partidas do Grupo {letter}
        </div>
        {groupMatches.map(m => <MatchRow key={m.id} match={m} result={results[m.id]}/>)}
      </div>
    </div>
  )
}

function KnockoutTab({ koMatches }) {
  const [activeRound, setActiveRound] = useState('r2')
  const current  = KO_ROUNDS.find(r => r.id === activeRound)
  const roundIds = Array.from({ length:current.count }, (_,i) => `${activeRound}_${i+1}`)
  const hasAny   = roundIds.some(id => koMatches[id]?.team1)
  const finished = roundIds.filter(id => koMatches[id]?.is_finished).length
  const total    = roundIds.filter(id => koMatches[id]?.team1).length

  return (
    <div>
      <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:8, marginBottom:14 }}>
        {KO_ROUNDS.map(r => {
          const rIds  = Array.from({ length:r.count }, (_,i) => `${r.id}_${i+1}`)
          const hasR  = rIds.some(id => koMatches[id]?.team1)
          const active = activeRound === r.id
          return (
            <button key={r.id} onClick={() => setActiveRound(r.id)} style={{
              flexShrink:0, padding:'7px 16px', border:'none', borderRadius:20,
              fontWeight:800, fontSize:11, cursor:'pointer', fontFamily:'Nunito,sans-serif',
              background: active ? '#002855' : '#F0F4F8',
              color: active ? '#fff' : hasR ? '#002855' : '#9BABB8',
            }}>
              {r.label}
              {hasR && <span style={{ marginLeft:4, fontSize:9, opacity:.6 }}>
                {rIds.filter(id=>koMatches[id]?.is_finished).length}/{rIds.filter(id=>koMatches[id]?.team1).length}
              </span>}
            </button>
          )
        })}
      </div>

      {!hasAny ? (
        <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E2EAF0', padding:'32px 16px', textAlign:'center' }}>
          <div style={{ fontSize:36, marginBottom:8 }}>⏳</div>
          <div style={{ color:'#002855', fontWeight:800, fontSize:14 }}>Rodada ainda não liberada</div>
          <div style={{ color:'#9BABB8', fontSize:12, marginTop:4 }}>Os confrontos serão definidos após a fase anterior.</div>
        </div>
      ) : (
        <div style={{ background:'#fff', borderRadius:16, overflow:'hidden', border:'1px solid #E2EAF0', boxShadow:'0 2px 12px rgba(0,40,85,0.07)' }}>
          <div style={{ background:'#002855', padding:'14px 16px', display:'flex', alignItems:'center', gap:10 }}>
            <div>
              <div style={{ color:'rgba(255,255,255,0.5)', fontSize:9, fontWeight:800, letterSpacing:2, textTransform:'uppercase' }}>Copa do Mundo 2026</div>
              <div style={{ color:'#fff', fontWeight:900, fontSize:18, textTransform:'uppercase', lineHeight:1 }}>{current.label}</div>
              <div style={{ width:32, height:3, background:'#F5A623', borderRadius:2, marginTop:4 }}/>
            </div>
            <span style={{ marginLeft:'auto', color:'rgba(255,255,255,0.4)', fontSize:11 }}>{finished}/{total} jogos</span>
          </div>
          <div style={{ padding:'12px 12px 8px' }}>
            {roundIds.map((id, i) => (
              <div key={id}>
                <div style={{ fontSize:9, fontWeight:800, color:'#9BABB8', textTransform:'uppercase', letterSpacing:.5, marginBottom:4, marginTop:i>0?8:0 }}>Jogo {i+1}</div>
                <KOMatchRow db={koMatches[id]}/>
              </div>
            ))}
          </div>
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
    supabase.from('matches').select('id,team1,team2,score1,score2,is_finished,date,city')
      .then(({ data }) => { const map={}; data?.forEach(m=>{map[m.id]=m}); setResults(map); setLoading(false) })
      .catch(()=>setLoading(false))
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
    <div style={{ minHeight:'100vh', background:'#F4F6F9', paddingBottom:80 }}>
      <Header participant={participant} onLogout={onLogout}/>

      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#002855 0%,#004080 100%)', padding:'70px 16px 20px' }}>
        <div style={{ color:'rgba(255,255,255,0.5)', fontSize:9, fontWeight:800, letterSpacing:3, textTransform:'uppercase', marginBottom:4 }}>Copa do Mundo 2026</div>
        <h1 style={{ color:'#fff', fontWeight:900, fontSize:28, margin:'0 0 12px', letterSpacing:-0.5, textTransform:'uppercase' }}>RESULTADOS</h1>
        <div style={{ display:'flex', gap:8 }}>
          {[[totalFinished,'Jogos','#F5A623'],[72-totalFinished,'Restantes','#4ade80'],[koFinished,'Mata-Mata','#93c5fd']].map(([v,l,c])=>(
            <div key={l} style={{ background:'rgba(255,255,255,0.1)', borderRadius:10, padding:'8px 12px', textAlign:'center', flex:1 }}>
              <div style={{ color:c, fontWeight:900, fontSize:20 }}>{v}</div>
              <div style={{ color:'rgba(255,255,255,0.5)', fontSize:9, textTransform:'uppercase', letterSpacing:.5, marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background:'#fff', borderBottom:'2px solid #E2EAF0', padding:'0 12px', display:'flex', gap:0 }}>
        {[['groups','Fase de Grupos'],['knockout','⚔️ Mata-Mata']].map(([key,label])=>(
          <button key={key} onClick={()=>setTab(key)} style={{
            padding:'14px 16px', border:'none', borderBottom:tab===key?'3px solid #002855':'3px solid transparent',
            fontWeight:800, fontSize:12, cursor:'pointer', fontFamily:'Nunito,sans-serif',
            background:'transparent', color:tab===key?'#002855':'#9BABB8', marginBottom:-2,
          }}>{label}</button>
        ))}
      </div>

      {tab==='groups' && (
        <>
          <div style={{ background:'#fff', borderBottom:'1px solid #E2EAF0', padding:'8px 12px', display:'flex', gap:6 }}>
            {[['Por Grupo',false],['Todos os Grupos',true]].map(([label,val])=>(
              <button key={label} onClick={()=>setViewAll(val)} style={{
                padding:'6px 14px', border:'none', borderRadius:20, fontWeight:800, fontSize:11,
                cursor:'pointer', fontFamily:'Nunito,sans-serif',
                background: viewAll===val?'#E8F0FE':'transparent',
                color: viewAll===val?'#002855':'#9BABB8',
              }}>{label}</button>
            ))}
          </div>
          {!viewAll && (
            <div style={{ background:'#fff', borderBottom:'1px solid #E2EAF0', padding:'8px 10px', display:'flex', gap:5, overflowX:'auto' }}>
              {GROUPS.map(g=>(
                <button key={g} onClick={()=>setActiveGroup(g)} style={{
                  flexShrink:0, width:34, height:30, borderRadius:8, border:'none',
                  fontWeight:800, fontSize:11, cursor:'pointer', fontFamily:'Nunito,sans-serif',
                  background: activeGroup===g?'#002855':'#F0F4F8',
                  color: activeGroup===g?'#fff':'#6B7A8D',
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
