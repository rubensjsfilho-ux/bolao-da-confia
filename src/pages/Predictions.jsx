import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import Header from '../components/Header'
import { GROUP_MATCHES, getFlag, formatDate, isMatchOpen } from '../data/matches'
import { Check, Lock, Loader2 } from 'lucide-react'

const FILTERS = [
  { key:'all',    label:'Todos' },
  { key:'open',   label:'Em Aberto' },
  { key:'done',   label:'Com Palpite' },
  { key:'brazil', label:'🇧🇷 Brasil' },
]
const GROUPS = ['all','A','B','C','D','E','F','G','H','I','J','K','L']

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
              <input className="score-input" type="number" min="0" max="20" value={s1} onChange={e=>setS1(e.target.value)} placeholder="–" />
              <span style={{ color:'#9BABB8', fontWeight:900, fontSize:18 }}>×</span>
              <input className="score-input" type="number" min="0" max="20" value={s2} onChange={e=>setS2(e.target.value)} placeholder="–" />
            </>
          ) : (
            <>
              <div className="score-input" style={{ display:'flex', alignItems:'center', justifyContent:'center', cursor:'default', background:'#F4F6F9' }}>{prediction?.score1??'–'}</div>
              <span style={{ color:'#9BABB8', fontWeight:900, fontSize:18 }}>×</span>
              <div className="score-input" style={{ display:'flex', alignItems:'center', justifyContent:'center', cursor:'default', background:'#F4F6F9' }}>{prediction?.score2??'–'}</div>
            </>
          )}
        </div>
        <div style={{ flex:1, textAlign:'center' }}>
          <div style={{ fontSize:32 }}>{getFlag(m.team2)}</div>
          <div style={{ color:'#002855', fontWeight:800, fontSize:12, marginTop:4 }}>{m.team2}</div>
        </div>
      </div>
      {m.is_finished && m.score1!==null && <div style={{ textAlign:'center', color:'#9BABB8', fontSize:11, marginTop:8 }}>Resultado real: {m.score1} × {m.score2}</div>}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:12 }}>
        {b ? <span className={b.cls} style={{ borderRadius:20, padding:'3px 12px', fontSize:11, fontWeight:800 }}>{b.label}</span> : <span />}
        {open && (
          <button onClick={save} disabled={s1===''||s2===''||saving} className="btn-green" style={{ padding:'8px 18px', fontSize:12, opacity:s1!==''&&s2!==''?1:0.4 }}>
            {saving?<Loader2 size={13} className="animate-spin"/>:saved?<><Check size={13}/> Salvo!</>:prediction?'Atualizar':'Salvar'}
          </button>
        )}
        {!open&&!prediction&&!m.is_finished&&<span style={{ color:'#9BABB8', fontSize:11, fontStyle:'italic' }}>Sem palpite</span>}
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
    const { data } = await supabase.from('predictions').select('match_id,score1,score2,points').eq('participant_id',participant.id)
    const m={}; data?.forEach(p=>{ m[p.match_id]=p }); setPreds(m); setLoading(false)
  },[participant.id])

  useEffect(()=>{ fetch() },[fetch])

  const save = async (id,s1,s2) => {
    if (preds[id]) { await supabase.from('predictions').update({score1:s1,score2:s2,updated_at:new Date().toISOString()}).eq('participant_id',participant.id).eq('match_id',id) }
    else { await supabase.from('predictions').insert([{participant_id:participant.id,match_id:id,score1:s1,score2:s2}]) }
    setPreds(p=>({...p,[id]:{score1:s1,score2:s2,points:p[id]?.points}}))
  }

  let list = GROUP_MATCHES
  if (grp!=='all') list=list.filter(m=>m.group===grp)
  if (filter==='open')   list=list.filter(isMatchOpen)
  if (filter==='done')   list=list.filter(m=>preds[m.id])
  if (filter==='brazil') list=list.filter(m=>m.team1==='Brasil'||m.team2==='Brasil')
  const open = GROUP_MATCHES.filter(m=>isMatchOpen(m)&&!preds[m.id]).length

  return (
    <div style={{ minHeight:'100vh', background:'#F4F6F9', paddingBottom:80 }}>
      <Header participant={participant} onLogout={onLogout} />
      <main style={{ paddingTop:70, padding:'70px 12px 80px' }}>
        <div style={{ marginBottom:16 }}>
          <h1 style={{ color:'#002855', fontWeight:900, fontSize:24 }}>Meus Palpites</h1>
          {open>0 && <p style={{ color:'#D4890A', fontSize:13, marginTop:4, fontWeight:700 }}>⚠️ {open} jogo{open!==1?'s':''} aguardando seu palpite!</p>}
        </div>
        {/* Filtros */}
        <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:8, marginBottom:10 }}>
          {FILTERS.map(f=>(
            <button key={f.key} onClick={()=>setFilter(f.key)} style={{ flexShrink:0, padding:'7px 16px', borderRadius:20, border: filter===f.key?'none':'1.5px solid #E2EAF0', fontWeight:800, fontSize:12, cursor:'pointer', background:filter===f.key?'#009639':'#fff', color:filter===f.key?'#fff':'#6B7A8D', fontFamily:'Nunito,sans-serif', transition:'all .15s' }}>
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:10, marginBottom:14 }}>
          {GROUPS.map(g=>(
            <button key={g} onClick={()=>setGrp(g)} style={{ flexShrink:0, width:34, height:34, borderRadius:10, border: grp===g?'2px solid #009639':'1.5px solid #E2EAF0', fontWeight:800, fontSize:11, cursor:'pointer', background:grp===g?'#e8f5ee':'#fff', color:grp===g?'#009639':'#6B7A8D', fontFamily:'Nunito,sans-serif' }}>
              {g==='all'?'✦':g}
            </button>
          ))}
        </div>
        {loading ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'#9BABB8' }}><Loader2 size={28} className="animate-spin" style={{ margin:'0 auto 12px' }} /></div>
        ) : list.length===0 ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'#9BABB8' }}><div style={{ fontSize:48 }}>🔍</div><p style={{ marginTop:8 }}>Nenhum jogo neste filtro.</p></div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {list.map(m=><MatchRow key={m.id} match={m} prediction={preds[m.id]} onSave={save}/>)}
          </div>
        )}
      </main>
    </div>
  )
}
