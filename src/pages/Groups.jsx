import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import Header from '../components/Header'
import { GROUP_MATCHES, getFlag } from '../data/matches'
import { Loader2 } from 'lucide-react'

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

// Times de cada grupo
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

function calcStandings(groupLetter, results) {
  const teams = GROUP_TEAMS[groupLetter] || []
  const standings = {}

  teams.forEach(t => {
    standings[t] = { team:t, pts:0, j:0, v:0, e:0, d:0, gp:0, gc:0, sg:0 }
  })

  const groupMatches = GROUP_MATCHES.filter(m => m.group === groupLetter)
  groupMatches.forEach(m => {
    const res = results[m.id]
    if (!res || res.score1 === null || res.score1 === undefined) return

    const s1 = res.score1, s2 = res.score2
    const t1 = standings[m.team1]
    const t2 = standings[m.team2]
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
    if (b.sg !== a.sg) return b.sg - a.sg
    if (b.gp !== a.gp) return b.gp - a.gp
    return a.team.localeCompare(b.team)
  })
}

function GroupTable({ letter, results }) {
  const standings = calcStandings(letter, results)
  const hasResults = Object.keys(results).length > 0

  return (
    <div style={{ background:'#fff', borderRadius:14, overflow:'hidden', border:'1px solid #E2EAF0', boxShadow:'0 2px 12px rgba(0,40,85,0.06)', marginBottom:12 }}>
      {/* Header do grupo */}
      <div style={{ background:'linear-gradient(135deg,#002855,#003f7f)', padding:'10px 14px', display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ background:'rgba(245,166,35,0.2)', border:'1px solid rgba(245,166,35,0.4)', borderRadius:8, padding:'3px 10px' }}>
          <span style={{ color:'#F5A623', fontWeight:900, fontSize:12, letterSpacing:1 }}>GRUPO {letter}</span>
        </div>
        <span style={{ color:'rgba(255,255,255,0.5)', fontSize:10 }}>
          {GROUP_MATCHES.filter(m => m.group === letter && results[m.id]?.is_finished).length}/
          {GROUP_MATCHES.filter(m => m.group === letter).length} jogos
        </span>
      </div>

      {/* Cabeçalho da tabela */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 28px 28px 28px 28px 28px 28px 32px', gap:0, padding:'6px 14px', background:'#F4F6F9', borderBottom:'1px solid #E2EAF0' }}>
        <span style={{ fontSize:9, fontWeight:800, color:'#9BABB8', textTransform:'uppercase' }}>Seleção</span>
        {['J','V','E','D','GP','GC','SG','PTS'].map(h => (
          <span key={h} style={{ fontSize:9, fontWeight:800, color:'#9BABB8', textAlign:'center' }}>{h}</span>
        ))}
      </div>

      {/* Linhas */}
      {standings.map((s, i) => {
        const qualified = i < 2
        const bubble = i === 2 // possível terceiro
        return (
          <div key={s.team} style={{
            display:'grid', gridTemplateColumns:'1fr 28px 28px 28px 28px 28px 28px 32px',
            padding:'9px 14px', borderBottom: i < 3 ? '1px solid #F4F6F9' : 'none',
            background: qualified ? 'rgba(0,150,57,0.04)' : bubble ? 'rgba(245,166,35,0.04)' : '#fff',
          }}>
            {/* Time */}
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:14, textAlign:'center', fontSize:9, fontWeight:900, color: qualified?'#009639':bubble?'#D4890A':'#9BABB8' }}>
                {qualified ? (i===0?'①':'②') : bubble ? '③' : `${i+1}`}
              </div>
              <span style={{ fontSize:18 }}>{getFlag(s.team)}</span>
              <span style={{ fontSize:11, fontWeight:700, color:'#002855', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.team}</span>
            </div>
            {[s.j,s.v,s.e,s.d,s.gp,s.gc,s.sg].map((val,idx) => (
              <span key={idx} style={{ fontSize:11, fontWeight: idx===6?700:400, color: idx===6?(val>0?'#009639':val<0?'#e55':'#9BABB8'):'#3A4A5C', textAlign:'center', alignSelf:'center' }}>
                {val > 0 && idx===6 ? `+${val}` : val}
              </span>
            ))}
            <span style={{ fontSize:12, fontWeight:900, color: qualified?'#009639':'#002855', textAlign:'center', alignSelf:'center' }}>
              {s.pts}
            </span>
          </div>
        )
      })}

      {/* Legenda */}
      <div style={{ padding:'6px 14px', background:'#F4F6F9', display:'flex', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <div style={{ width:8, height:8, borderRadius:2, background:'rgba(0,150,57,0.2)', border:'1px solid #009639' }}/>
          <span style={{ fontSize:8, color:'#9BABB8', fontWeight:700 }}>Classificado</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <div style={{ width:8, height:8, borderRadius:2, background:'rgba(245,166,35,0.2)', border:'1px solid #F5A623' }}/>
          <span style={{ fontSize:8, color:'#9BABB8', fontWeight:700 }}>Possível 3º</span>
        </div>
      </div>
    </div>
  )
}

export default function Groups({ participant, onLogout }) {
  const [activeGroup, setActiveGroup] = useState('A')
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(true)
  const [viewAll, setViewAll] = useState(false)

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

  const totalFinished = GROUP_MATCHES.filter(m => results[m.id]?.is_finished).length

  return (
    <div style={{ minHeight:'100vh', background:'#F4F6F9', paddingBottom:80 }}>
      <Header participant={participant} onLogout={onLogout} />

      {/* Cabeçalho */}
      <div style={{ paddingTop:58, background:'linear-gradient(135deg,#002855,#009639)', padding:'70px 16px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
          <span style={{ fontSize:28 }}>📊</span>
          <div>
            <h1 style={{ color:'#fff', fontWeight:900, fontSize:22, margin:0 }}>Classificação</h1>
            <p style={{ color:'rgba(255,255,255,0.6)', fontSize:12, margin:0 }}>Fase de Grupos · Copa 2026</p>
          </div>
        </div>
        <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:10, padding:'8px 12px', marginTop:8, display:'flex', gap:16 }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ color:'#F5A623', fontWeight:900, fontSize:18 }}>{totalFinished}</div>
            <div style={{ color:'rgba(255,255,255,0.6)', fontSize:9, textTransform:'uppercase', letterSpacing:.5 }}>Jogos</div>
          </div>
          <div style={{ width:1, background:'rgba(255,255,255,0.15)' }}/>
          <div style={{ textAlign:'center' }}>
            <div style={{ color:'#4ade80', fontWeight:900, fontSize:18 }}>{72-totalFinished}</div>
            <div style={{ color:'rgba(255,255,255,0.6)', fontSize:9, textTransform:'uppercase', letterSpacing:.5 }}>Restantes</div>
          </div>
          <div style={{ width:1, background:'rgba(255,255,255,0.15)' }}/>
          <div style={{ textAlign:'center' }}>
            <div style={{ color:'#fff', fontWeight:900, fontSize:18 }}>12</div>
            <div style={{ color:'rgba(255,255,255,0.6)', fontSize:9, textTransform:'uppercase', letterSpacing:.5 }}>Grupos</div>
          </div>
        </div>
      </div>

      {/* Toggle — Um grupo ou todos */}
      <div style={{ background:'#fff', borderBottom:'1px solid #E2EAF0', padding:'8px 12px', display:'flex', gap:6, alignItems:'center' }}>
        <button onClick={() => setViewAll(false)} style={{ padding:'6px 14px', border:'none', borderRadius:20, fontWeight:800, fontSize:11, cursor:'pointer', fontFamily:'Nunito,sans-serif', background:!viewAll?'#002855':'transparent', color:!viewAll?'#fff':'#9BABB8' }}>
          Por Grupo
        </button>
        <button onClick={() => setViewAll(true)} style={{ padding:'6px 14px', border:'none', borderRadius:20, fontWeight:800, fontSize:11, cursor:'pointer', fontFamily:'Nunito,sans-serif', background:viewAll?'#002855':'transparent', color:viewAll?'#fff':'#9BABB8' }}>
          Todos os Grupos
        </button>
      </div>

      {/* Filtro de grupos (só quando Por Grupo) */}
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

      <main style={{ padding:'14px 12px' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:48 }}>
            <Loader2 size={28} style={{ animation:'spin 1s linear infinite', margin:'0 auto 8px', display:'block', color:'#002855' }}/>
            <p style={{ color:'#9BABB8' }}>Carregando...</p>
            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : viewAll ? (
          GROUPS.map(g => <GroupTable key={g} letter={g} results={results}/>)
        ) : (
          <GroupTable letter={activeGroup} results={results}/>
        )}
      </main>
    </div>
  )
}
