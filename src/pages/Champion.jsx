import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import Header from '../components/Header'
import { GROUPS, getFlag } from '../data/matches'
import { Check, Loader2, Lock } from 'lucide-react'

const ALL_TEAMS = Object.values(GROUPS).flat()
const DEADLINE  = new Date('2026-06-11T22:00:00Z')
const isClosed  = () => new Date() >= DEADLINE
const POSITIONS = [
  { key:'champion',    label:'Campeão',      icon:'🥇', pts:10, color:'#D4890A', bg:'rgba(245,166,35,0.10)', border:'rgba(245,166,35,0.3)' },
  { key:'runner_up',   label:'Vice-Campeão', icon:'🥈', pts:5,  color:'#6B7A8D', bg:'rgba(107,122,141,0.08)',border:'rgba(107,122,141,0.2)' },
  { key:'third_place', label:'3º Lugar',      icon:'🥉', pts:3,  color:'#C96A2A', bg:'rgba(205,127,50,0.10)', border:'rgba(205,127,50,0.25)' },
]

function Picker({ label, icon, pts, color, bg, border, value, onChange, disabled, taken }) {
  const [open,setOpen] = useState(false)
  const [q,setQ]       = useState('')
  const opts = ALL_TEAMS.filter(t=>t.toLowerCase().includes(q.toLowerCase())&&!taken.includes(t))
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
        <span style={{ fontSize:22 }}>{icon}</span>
        <div>
          <div style={{ color:'#002855', fontWeight:800, fontSize:13 }}>{label}</div>
          <div style={{ color:'#9BABB8', fontSize:11 }}>+{pts} pontos se acertar</div>
        </div>
      </div>
      <button onClick={()=>!disabled&&setOpen(o=>!o)} style={{ width:'100%', display:'flex', alignItems:'center', gap:10, background: value?bg:'#F4F6F9', border:`1.5px solid ${value?border:'#E2EAF0'}`, borderRadius:12, padding:'11px 14px', cursor:disabled?'default':'pointer', fontFamily:'Nunito,sans-serif' }}>
        {value ? <><span style={{ fontSize:26 }}>{getFlag(value)}</span><span style={{ flex:1, color:'#002855', fontWeight:800, fontSize:14, textAlign:'left' }}>{value}</span>{!disabled&&<span style={{ color:'#9BABB8', fontSize:12 }}>trocar ▾</span>}</>
               : <><span style={{ fontSize:22, opacity:.3 }}>🏳️</span><span style={{ flex:1, color:'#9BABB8', fontSize:13, textAlign:'left' }}>{disabled?'Não selecionado':'Selecione um time...'}</span>{!disabled&&<span style={{ color:'#9BABB8', fontSize:12 }}>▾</span>}</>}
      </button>
      {open && !disabled && (
        <div style={{ marginTop:4, background:'#fff', border:'1px solid #E2EAF0', borderRadius:14, boxShadow:'0 8px 24px rgba(0,40,85,0.12)', overflow:'hidden' }}>
          <div style={{ padding:'10px 12px', borderBottom:'1px solid #F4F6F9' }}>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar time..." autoFocus className="input-field" style={{ fontSize:13, padding:'9px 12px' }} />
          </div>
          <div style={{ maxHeight:200, overflowY:'auto' }}>
            {opts.map(t=>(
              <button key={t} onClick={()=>{onChange(t);setOpen(false);setQ('')}} style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'transparent', border:'none', cursor:'pointer', fontFamily:'Nunito,sans-serif', textAlign:'left' }}
                onMouseEnter={e=>e.currentTarget.style.background='#F4F6F9'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <span style={{ fontSize:22 }}>{getFlag(t)}</span><span style={{ color:'#002855', fontWeight:700, fontSize:13 }}>{t}</span>
              </button>
            ))}
            {opts.length===0&&<div style={{ padding:16, color:'#9BABB8', textAlign:'center', fontSize:13 }}>Nenhum time encontrado</div>}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Champion({ participant, onLogout }) {
  const [pred,setPred]   = useState({champion:'',runner_up:'',third_place:''})
  const [result,setResult] = useState(null)
  const [loading,setLoading] = useState(true)
  const [saving,setSaving]   = useState(false)
  const [saved,setSaved]     = useState(false)
  const closed = isClosed()

  useEffect(()=>{
    Promise.all([
      supabase.from('champion_predictions').select('*').eq('participant_id',participant.id).single(),
      supabase.from('champion_results').select('*').eq('id',1).single(),
    ]).then(([{data:p},{data:r}])=>{
      if(p) setPred({champion:p.champion,runner_up:p.runner_up,third_place:p.third_place})
      if(r?.champion) setResult(r)
      setLoading(false)
    })
  },[participant.id])

  const save = async () => {
    if(!pred.champion||!pred.runner_up||!pred.third_place) return
    setSaving(true)
    const pl = { participant_id:participant.id, ...pred, updated_at:new Date().toISOString() }
    const {data:ex} = await supabase.from('champion_predictions').select('id').eq('participant_id',participant.id).single()
    if(ex) await supabase.from('champion_predictions').update(pl).eq('participant_id',participant.id)
    else   await supabase.from('champion_predictions').insert([pl])
    setSaving(false); setSaved(true); setTimeout(()=>setSaved(false),3000)
  }

  const taken = Object.values(pred).filter(Boolean)
  const full  = pred.champion && pred.runner_up && pred.third_place

  const pts = result ? [
    result.champion===pred.champion?10:0,
    result.runner_up===pred.runner_up?5:0,
    result.third_place===pred.third_place?3:0,
  ] : [null,null,null]

  return (
    <div style={{ minHeight:'100vh', background:'#F4F6F9', paddingBottom:80 }}>
      <Header participant={participant} onLogout={onLogout} />
      <main style={{ padding:'70px 12px 80px' }}>
        <div style={{ marginBottom:16 }}>
          <h1 style={{ color:'#002855', fontWeight:900, fontSize:24 }}>🏆 Palpite Final</h1>
          <p style={{ color:'#9BABB8', fontSize:13, marginTop:2 }}>Quem vai levantar a taça em julho?</p>
        </div>

        {/* Pontuação extra */}
        <div style={{ background:'linear-gradient(135deg,#009639,#007a2e)', borderRadius:16, padding:'16px', marginBottom:16, color:'#fff' }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:1, opacity:.7, marginBottom:12, textTransform:'uppercase' }}>Pontuação Extra</div>
          <div style={{ display:'flex', justifyContent:'space-around' }}>
            {POSITIONS.map(p=>(
              <div key={p.key} style={{ textAlign:'center' }}>
                <div style={{ fontSize:26 }}>{p.icon}</div>
                <div style={{ fontWeight:900, fontSize:22, marginTop:2 }}>+{p.pts}</div>
                <div style={{ opacity:.7, fontSize:10 }}>pts</div>
              </div>
            ))}
          </div>
          <div style={{ opacity:.6, fontSize:11, textAlign:'center', marginTop:12, borderTop:'1px solid rgba(255,255,255,0.15)', paddingTop:10 }}>
            Palpites encerram em 11/06 às 19h (início da Copa)
          </div>
        </div>

        {closed&&<div style={{ background:'rgba(220,53,69,0.07)', border:'1px solid rgba(220,53,69,0.2)', borderRadius:12, padding:'10px 14px', marginBottom:14, display:'flex', alignItems:'center', gap:8, color:'#C0392B', fontWeight:700, fontSize:13 }}><Lock size={14}/>Palpites encerrados · A Copa já começou!</div>}

        {result?.champion&&(
          <div style={{ background:'#fff', borderRadius:16, padding:'16px', border:'1px solid #E2EAF0', marginBottom:16 }}>
            <div style={{ color:'#002855', fontWeight:900, fontSize:15, marginBottom:12 }}>🏆 Resultado Oficial</div>
            {POSITIONS.map((pos,i)=>(
              <div key={pos.key} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid #F4F6F9' }}>
                <span style={{ fontSize:22 }}>{pos.icon}</span>
                <span style={{ fontSize:22 }}>{getFlag(result[pos.key])}</span>
                <span style={{ flex:1, color:'#002855', fontWeight:700 }}>{result[pos.key]}</span>
                {pts[i]!==null&&<span style={{ background:pts[i]>0?'rgba(0,150,57,0.10)':'rgba(220,53,69,0.07)', color:pts[i]>0?'#009639':'#C0392B', borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:800 }}>{pts[i]>0?`+${pts[i]} pts ✓`:'0 pts ✗'}</span>}
              </div>
            ))}
          </div>
        )}

        {loading ? <div style={{ textAlign:'center', padding:32, color:'#9BABB8' }}><Loader2 size={24} className="animate-spin"/></div> : (
          <div style={{ background:'#fff', borderRadius:16, padding:'20px', border:'1px solid #E2EAF0', boxShadow:'0 2px 12px rgba(0,40,85,0.06)' }}>
            {POSITIONS.map(pos=>(
              <Picker key={pos.key} {...pos} value={pred[pos.key]} onChange={v=>setPred(p=>({...p,[pos.key]:v}))} disabled={closed} taken={taken.filter(t=>t!==pred[pos.key])} />
            ))}
            {!closed&&(
              <button onClick={save} disabled={!full||saving} className="btn-green" style={{ width:'100%', fontSize:14, marginTop:4, opacity:full?1:0.4, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                {saving?<><Loader2 size={15} className="animate-spin"/>Salvando...</>:saved?<><Check size={15}/>Palpite salvo! 🎉</>:'Salvar Palpite Final'}
              </button>
            )}
            {!full&&!closed&&<p style={{ color:'#9BABB8', fontSize:12, textAlign:'center', marginTop:8 }}>Selecione os 3 times para salvar</p>}
          </div>
        )}
      </main>
    </div>
  )
}
