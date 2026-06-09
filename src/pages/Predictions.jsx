import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Header from '../components/Header'
import { GROUP_MATCHES, getFlag, formatDate, isMatchOpen, GROUPS as ALL_GROUPS } from '../data/matches'
import { Check, Lock, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

const CHAMPION_DEADLINE = new Date('2026-06-11T22:00:00Z')
const isChampionClosed = () => new Date() >= CHAMPION_DEADLINE

const FILTERS = [
  { key:'all',    label:'Todos' },
  { key:'open',   label:'Em Aberto' },
  { key:'done',   label:'Com Palpite' },
  { key:'finished', label:'Encerrados' },
  { key:'brazil', label:'🇧🇷 Brasil' },
]
const GROUPS = ['all','A','B','C','D','E','F','G','H','I','J','K','L']

// ── Card compacto de palpite final ────────────────────────────────────────────
function ChampionCard({ participant }) {
  const navigate = useNavigate()
  const [pred, setPred] = useState({ champion:'', runner_up:'', third_place:'' })
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const closed = isChampionClosed()
  const filled = pred.champion && pred.runner_up && pred.third_place

  useEffect(() => {
    supabase.from('champion_predictions').select('*').eq('participant_id', participant.id).single()
      .then(({ data }) => {
        if (data) setPred({ champion: data.champion, runner_up: data.runner_up, third_place: data.third_place })
        setLoading(false)
      })
  }, [participant.id])

  return (
    <div style={{ background:'linear-gradient(135deg,#002855,#003520)', borderRadius:16, marginBottom:16, overflow:'hidden', border:'1px solid rgba(245,166,35,0.2)' }}>
      <div onClick={() => setOpen(o => !o)}
        style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
        <span style={{ fontSize:24 }}>🏆</span>
        <div style={{ flex:1 }}>
          <div style={{ color:'#F5A623', fontWeight:900, fontSize:16 }}>Palpite Final</div>
          <div style={{ color:'#ccc', fontSize:12 }}>
            {loading ? 'Carregando…' : filled ? 'Preenchido' : 'Pendente'}
          </div>
        </div>
        {open ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
      </div>

      {open && (
        <div style={{ padding:16, borderTop:'1px solid rgba(255,255,255,0.1)' }}>
          {loading ? (
            <Loader2 className="animate-spin"/>
          ) : (
            <>
              <div>🥇 {pred.champion || '-'}</div>
              <div>🥈 {pred.runner_up || '-'}</div>
              <div>🥉 {pred.third_place || '-'}</div>
              {!closed && (
                <button onClick={() => navigate('/champion')}>
                  Editar
                </button>
              )}
              {closed && <Lock size={16}/>}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function Predictions() {
  const [participant, setParticipant] = useState(null)
  const [predictions, setPredictions] = useState({})
  const [filter, setFilter] = useState('all')
  const [group, setGroup] = useState('all')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setParticipant(data.user)
    })
  }, [])

  const loadPredictions = useCallback(async () => {
    if (!participant) return
    const { data } = await supabase
      .from('predictions')
      .select('*')
      .eq('participant_id', participant.id)

    const map = {}
    data?.forEach(p => {
      map[p.match_id] = p
    })
    setPredictions(map)
  }, [participant])

  useEffect(() => {
    loadPredictions()
  }, [loadPredictions])

  const filteredMatches = GROUP_MATCHES.filter(m => {
    if (group !== 'all' && m.group !== group) return false

    if (filter === 'open') return isMatchOpen(m)
    if (filter === 'done') return predictions[m.id]
    if (filter === 'finished') return !isMatchOpen(m)
    if (filter === 'brazil') return m.home === 'BRA' || m.away === 'BRA'

    return true
  })

  return (
    <div>
      <Header/>

      {participant && <ChampionCard participant={participant}/>}

      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:8 }}>
        {GROUPS.map(g => (
          <button key={g} onClick={() => setGroup(g)}>
            {g}
          </button>
        ))}
      </div>

      <div style={{ marginTop:16 }}>
        {filteredMatches.map(match => {
          const pred = predictions[match.id]
          const open = isMatchOpen(match)

          return (
            <div key={match.id} style={{ border:'1px solid #ccc', marginBottom:8, padding:8 }}>
              <div>
                {getFlag(match.home)} {match.home} vs {getFlag(match.away)} {match.away}
              </div>
              <div>{formatDate(match.date)}</div>

              <div>
                {pred ? (
                  <span><Check size={16}/> {pred.home_score} x {pred.away_score}</span>
                ) : (
                  <span>{open ? 'Aberto' : 'Encerrado'}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}