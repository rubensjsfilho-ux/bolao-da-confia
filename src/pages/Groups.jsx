import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import Header from '../components/Header'
import { GROUP_MATCHES, getFlag, formatDate } from '../data/matches'
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

// ── Mini-card de partida ───────────────────────────────────────────────────────
function MatchCard({ match, result }) {
  const hasScore = result && result.score1 !== null && result.score1 !== undefined
  const isFinished = result?.is_finished

  return (
    <div style={{
      display:'flex', alignItems:'center', gap:8, padding:'8px 12px',
      background: isFinished ? 'rgba(0,150,57,0.06)' : hasScore ? 'rgba(245,166,35,0.06)' : 'rgba(0,40,85,0.03)',
      borderRadius:10, border:`1px solid ${isFinished?'rgba(0,150,57,0.15)':hasScore?'rgba(245,166,35,0.15)':'#E2EAF0'}`,
    }}>
      <div style={{ flex:1, display:'flex', alignItems:'center', gap:5, justifyContent:'flex-end' }}>
        <span style={{ fontSize:11, fontWeight:700 }}>{match.team1}</span>
        <span style={{ fontSize:18 }}>{getFlag(match.team1)}</span>
      </div>

      <div style={{ minWidth:52, textAlign:'center' }}>
        {hasScore ? `${result.score1} × ${result.score2}` : 'vs'}
      </div>

      <div style={{ flex:1, display:'flex', alignItems:'center', gap:5 }}>
        <span style={{ fontSize:18 }}>{getFlag(match.team2)}</span>
        <span style={{ fontSize:11, fontWeight:700 }}>{match.team2}</span>
      </div>
    </div>
  )
}

function GroupTable({ letter, results }) {
  const standings = calcStandings(letter, results)
  const groupMatches = GROUP_MATCHES.filter(m => m.group === letter)

  return (
    <div>
      <h3>Grupo {letter}</h3>

      {standings.map((s) => (
        <div key={s.team}>
          {s.team} - {s.pts} pts
        </div>
      ))}

      <div>
        {groupMatches.map(m => (
          <MatchCard key={m.id} match={m} result={results[m.id]} />
        ))}
      </div>
    </div>
  )
}

export default function Groups({ participant, onLogout }) {
  const [activeGroup, setActiveGroup] = useState('A')
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('matches').select('*')
      .then(({ data }) => {
        const map = {}
        data?.forEach(m => { map[m.id] = m })
        setResults(map)
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <Header participant={participant} onLogout={onLogout} />

      {loading ? (
        <Loader2 />
      ) : (
        <GroupTable letter={activeGroup} results={results}/>
      )}
    </div>
  )
}