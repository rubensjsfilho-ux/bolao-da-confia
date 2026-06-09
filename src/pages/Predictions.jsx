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
  { key:'brazil', label:'🇧🇷 Brasil' },
]
const GROUPS = ['all','A','B','C','D','E','F','G','H','I','J','K','L']

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
          <div style={{ color:'#F5A623', fontWeight:900, fontSize:14 }}>Palpite Final</div>
          <div style={{ color:'rgba(255,255,255,0.5)', fontSize:11 }}>
            {loading ? 'Carregando...'
              : filled ? `${pred.champion} · ${pred.runner_up} · ${pred.third_place}`
              : closed ? 'Encerrado'
              : '⚠️ Ainda não preenchido!'}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {filled && <span style={{ background:'rgba(74,222,128,0.2)', color:'#4ade80', borderRadius:20, padding:'2px 8px', fontSize:10, fontWeight:800 }}>✓ Feito</span>}
          {!filled && !closed && <span style={{ background:'rgba(245,166,35,0.2)', color:'#F5A623', borderRadius:20, padding:'2px 8px', fontSize:10, fontWeight:800 }}>Pendente</span>}
          {open ? <ChevronUp size={16} color="rgba(255,255,255,0.4)"/> : <ChevronDown size={16} color="rgba(255,255,255,0.4)"/>}
        </div>
      </div>

      {open && (
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', padding:'14px 16px' }}>
          {filled && (
            <div style={{ marginBottom:12 }}>
              {[['🥇', pred.champion, '+10 pts'], ['🥈', pred.runner_up, '+5 pts'], ['🥉', pred.third_place, '+3 pts']].map(([icon, team, pts]) => (
                <div key={icon} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize:18 }}>{icon}</span>
                  <span style={{ fontSize:16 }}>{getFlag(team)}</span>
                  <span style={{ color:'#fff', fontWeight:700, fontSize:12, flex:1 }}>{team}</span>
                  <span style={{ color:'#F5A623', fontWeight:900, fontSize:11 }}>{pts}</span>
                </div>
              ))}
            </div>
          )}
          {!closed ? (
            <button onClick={() => navigate('/campeao')}
              style={{ width:'100%', background:'#F5A623', color:'#002855', border:'none', borderRadius:10, padding:'11px', fontWeight:900, fontSize:13, cursor:'pointer', fontFamily:'Nunito,sans-serif' }}>
              {filled ? '✏️ Editar Palpite Final' : '🏆 Fazer Palpite Final'}
            </button>
          ) : (
            <div style={{ background:'rgba(220,53,69,0.1)', border:'1px solid rgba(220,53,69,0.2)', borderRadius:10, padding:'10px', display:'flex', alignItems:'center', gap:8, color:'#f87171', fontSize:12, fontWeight:700 }}>
              <Lock size={13}/> Palpites encerrados · A Copa já começou!
            </div>
          )}
          <div style={{ color:'rgba(255,255,255,0.3)', fontSize:10, textAlign:'center', marginTop:8 }}>
            Encerra em 11/06 às 19h · +18 pts possíveis
          </div>
        </div>
      )}
    </div>
  )
}

function MatchRow({ match: m, prediction, onSave }) {
  const [s1,setS1] = useState(prediction?.score1??'')
  const [s2,setS2] = useState(prediction?.score2??'')
  const [saving,setSaving] = useState(false)
  const [saved,setSaved] = useState(false)
  const open = isMatchOpen(m)

  const save = async () => {
    if (!open||s1===''||s2==='') return
    setSaving(true); await onSave(m.id,+s1,+s2); setSaving(false); setSaved(true); setTimeout(()=>setSaved(false),2000)
  }

  const badge = () => {
    if (!m.is_finished||!prediction) return null
    const p = prediction.points
    if (p===3) return { label:'+3 Exato! 🎯', cls:'badge-exact' }
    if (p===1) return { label:'+1 Resultado ✓', cls:'badge-result' }
    return { label:'0 Errou ✗', cls:'badge-miss' }
  }
  const b = badge()

  return (
    <div style={{ background:'#fff', borderRadius:16, padding:'14px', border:'1px solid #E2EAF0', boxShadow:'0 1px 6px rgba(0,40,85,0.05)', opacity: m.is_finished?0.75:1 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10, fontSize:11 }}>
        <span style={{ color:'#6B7A8D' }}>{formatDate(m.date)} · Grupo {m.group} · {m.city}</span>
        <span style={{ color: m.is_finished?'#9BABB8': open?'#009639':'#9BABB8', fontWeight:700 }}>
          {m.is_finished ? '✓ Encerrado' : open ? '● Aberto' : '🔒 Fechado'}
        </span>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ flex:1, textAlign:'center' }}>
          <div style={{ fontSize:32 }}>{getFlag(m.team1)}</div>
          <div style={{ color:'#002855', fontWeight:800, fontSize:12, marginTop:4 }}>{m.team1}</div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          {open ? (
            <>
              <input className="score-input" type="number" value={s1} onChange={e=>setS1(e.target.value)} />
              <span>×</span>
              <input className="score-input" type="number" value={s2} onChange={e=>setS2(e.target.value)} />
            </>
          ) : (
            <>
              <div className="score-input">{prediction?.score1??'–'}</div>
              <span>×</span>
              <div className="score-input">{prediction?.score2??'–'}</div>
            </>
          )}
        </div>

        <div style={{ flex:1, textAlign:'center' }}>
          <div style={{ fontSize:32 }}>{getFlag(m.team2)}</div>
          <div style={{ color:'#002855', fontWeight:800, fontSize:12 }}>{m.team2}</div>
        </div>
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', marginTop:12 }}>
        {b && <span>{b.label}</span>}
        {open && <button onClick={save}>{saving?'...':'Salvar'}</button>}
      </div>
    </div>
  )
}

export default function Predictions({ participant, onLogout }) {
  const [preds,setPreds] = useState({})
  const [filter,setFilter] = useState('all')
  const [grp,setGrp] = useState('all')
  const [loading,setLoading] = useState(true)

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('predictions').select('*').eq('participant_id',participant.id)
    const m={}; data?.forEach(p=>{ m[p.match_id]=p }); setPreds(m); setLoading(false)
  },[participant.id])

  useEffect(()=>{ fetch() },[fetch])

  const save = async (id,s1,s2) => {
    if (preds[id]) {
      await supabase.from('predictions').update({score1:s1,score2:s2}).eq('match_id',id)
    } else {
      await supabase.from('predictions').insert([{participant_id:participant.id,match_id:id,score1:s1,score2:s2}])
    }
  }

  return (
    <div>
      <Header participant={participant} onLogout={onLogout}/>
      <ChampionCard participant={participant}/>
      {loading ? <Loader2/> : <div>OK</div>}
    </div>
  )
}