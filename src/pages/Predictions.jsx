import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Header from '../components/Header'
import { GROUP_MATCHES, getFlag, formatDate, isMatchOpen, GROUPS as ALL_GROUPS } from '../data/matches'
import { Check, Lock, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

const CHAMPION_DEADLINE = new Date('2026-06-11T22:00:00Z')
const isChampionClosed = () => new Date() >= CHAMPION_DEADLINE

const FILTERS = [
  { key:'all',      label:'Todos' },
  { key:'open',     label:'Em Aberto' },
  { key:'done',     label:'Com Palpite' },
  { key:'finished', label:'Encerrados' },
  { key:'brazil',   label:'🇧🇷 Brasil' },
]
const GROUPS = ['all','A','B','C','D','E','F','G','H','I','J','K','L']

function ChampionCard({ participant }) {
  const navigate = useNavigate()
  const [pred, setPred]   = useState({ champion:'', runner_up:'', third_place:'' })
  const [loading, setLoading] = useState(true)
  const [open, setOpen]   = useState(false)
  const closed = isChampionClosed()
  const filled = pred.champion && pred.runner_up && pred.third_place

  useEffect(() => {
    supabase.from('champion_predictions').select('*').eq('participant_id',participant.id).single()
      .then(({ data }) => { if(data) setPred({ champion:data.champion, runner_up:data.runner_up, third_place:data.third_place }); setLoading(false) })
  }, [participant.id])

  return (
    <div style={{ background:'linear-gradient(135deg,#1a0a00,#2a1500)', borderRadius:16, marginBottom:16, overflow:'hidden', border:'1px solid rgba(245,166,35,0.25)' }}>
      <div onClick={()=>setOpen(o=>!o)} style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
        <span style={{ fontSize:24 }}>🏆</span>
        <div style={{ flex:1 }}>
          <div style={{ color:'#F5A623', fontWeight:900, fontSize:14 }}>Palpite Final</div>
          <div style={{ color:'rgba(255,255,255,0.4)', fontSize:11 }}>
            {loading?'Carregando...':filled?`${pred.champion} · ${pred.runner_up} · ${pred.third_place}`:closed?'Encerrado':'⚠️ Ainda não preenchido!'}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {filled && <span style={{ background:'rgba(0,196,79,0.2)', color:'#00c44f', borderRadius:20, padding:'2px 8px', fontSize:10, fontWeight:800 }}>✓ Feito</span>}
          {!filled&&!closed && <span style={{ background:'rgba(245,166,35,0.2)', color:'#F5A623', borderRadius:20, padding:'2px 8px', fontSize:10, fontWeight:800 }}>Pendente</span>}
          {open?<ChevronUp size={16} color="rgba(255,255,255,0.3)"/>:<ChevronDown size={16} color="rgba(255,255,255,0.3)"/>}
        </div>
      </div>
      {open && (
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', padding:'14px 16px' }}>
          {filled && (
            <div style={{ marginBottom:12 }}>
              {[['🥇',pred.champion,'+10 pts'],['🥈',pred.runner_up,'+5 pts'],['🥉',pred.third_place,'+3 pts']].map(([icon,team,pts])=>(
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
            <button onClick={()=>navigate('/campeao')}
              style={{ width:'100%', background:'#F5A623', color:'#000', border:'none', borderRadius:10, padding:'11px', fontWeight:900, fontSize:13, cursor:'pointer', fontFamily:'Nunito,sans-serif' }}>
              {filled?'✏️ Editar Palpite Final':'🏆 Fazer Palpite Final'}
            </button>
          ) : (
            <div style={{ background:'rgba(220,53,69,0.1)', border:'1px solid rgba(220,53,69,0.2)', borderRadius:10, padding:'10px', display:'flex', alignItems:'center', gap:8, color:'#f87171', fontSize:12, fontWeight:700 }}>
              <Lock size={13}/> Palpites encerrados · A Copa já começou!
            </div>
          )}
          <div style={{ color:'rgba(255,255,255,0.25)', fontSize:10, textAlign:'center', marginTop:8 }}>Encerra em 11/06 às 19h · +18 pts possíveis</div>
        </div>
      )}
    </div>
  )
}

function MatchRow({ match: m, prediction, onSave }) {
  const [s1, setS1] = useState(prediction?.score1??'')
  const [s2, setS2] = useState(prediction?.score2??'')
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)
  const open = isMatchOpen(m) && !m.is_finished

  useEffect(() => { setS1(prediction?.score1??''); setS2(prediction?.score2??'') }, [prediction?.score1, prediction?.score2])

  const save = async () => {
    if (!open||s1===''||s2==='') return
    setSaving(true); await onSave(m.id,+s1,+s2); setSaving(false); setSaved(true); setTimeout(()=>setSaved(false),2000)
  }

  const badge = () => {
    if (!m.is_finished||!prediction) return null
    const p = prediction.points
    if (p===3) return { label:'+3 Exato! 🎯', color:'#F5A623', bg:'rgba(245,166,35,0.15)' }
    if (p===1) return { label:'+1 Resultado ✓', color:'#00c44f', bg:'rgba(0,196,79,0.12)' }
    return { label:'0 Errou ✗', color:'#f87171', bg:'rgba(248,113,113,0.12)' }
  }
  const b = badge()

  return (
    <div style={{
      background:'#0d1b2e', borderRadius:16, padding:'14px',
      border: m.is_finished ? '1px solid rgba(0,196,79,0.15)' : open ? '1px solid rgba(245,166,35,0.25)' : '1px solid rgba(255,255,255,0.08)',
      boxShadow:'0 2px 12px rgba(0,0,0,0.3)',
    }}>
      {/* Header do card */}
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10, fontSize:11 }}>
        <span style={{ color:'rgba(255,255,255,0.35)' }}>{formatDate(m.date)} · Grupo {m.group} · {m.city}</span>
        <span style={{ color:m.is_finished?'#00c44f':open?'#F5A623':'rgba(255,255,255,0.3)', fontWeight:700 }}>
          {m.is_finished?'✓ Encerrado':open?'● Aberto':'🔒 Fechado'}
        </span>
      </div>

      {/* Times + Placar */}
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ flex:1, textAlign:'center' }}>
          <div style={{ fontSize:36 }}>{getFlag(m.team1)}</div>
          <div style={{ color:'#fff', fontWeight:800, fontSize:12, marginTop:4 }}>{m.team1}</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          {open ? (
            <>
              <input type="number" min="0" max="20" value={s1} onChange={e=>setS1(e.target.value)} placeholder="–"
                style={{ width:52, height:52, background:'rgba(255,255,255,0.08)', border:'1.5px solid rgba(255,255,255,0.15)', borderRadius:12, fontSize:22, fontWeight:900, textAlign:'center', color:'#fff', outline:'none', fontFamily:'Nunito,sans-serif' }}/>
              <span style={{ color:'rgba(255,255,255,0.3)', fontWeight:900, fontSize:20 }}>×</span>
              <input type="number" min="0" max="20" value={s2} onChange={e=>setS2(e.target.value)} placeholder="–"
                style={{ width:52, height:52, background:'rgba(255,255,255,0.08)', border:'1.5px solid rgba(255,255,255,0.15)', borderRadius:12, fontSize:22, fontWeight:900, textAlign:'center', color:'#fff', outline:'none', fontFamily:'Nunito,sans-serif' }}/>
            </>
          ) : (
            <>
              <div style={{ width:52, height:52, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:900, color:'rgba(255,255,255,0.5)' }}>{prediction?.score1??'–'}</div>
              <span style={{ color:'rgba(255,255,255,0.2)', fontWeight:900, fontSize:20 }}>×</span>
              <div style={{ width:52, height:52, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:900, color:'rgba(255,255,255,0.5)' }}>{prediction?.score2??'–'}</div>
            </>
          )}
        </div>
        <div style={{ flex:1, textAlign:'center' }}>
          <div style={{ fontSize:36 }}>{getFlag(m.team2)}</div>
          <div style={{ color:'#fff', fontWeight:800, fontSize:12, marginTop:4 }}>{m.team2}</div>
        </div>
      </div>

      {/* Resultado final */}
      {m.is_finished && m.score1 !== null && (
        <div style={{ textAlign:'center', marginTop:10, background:'rgba(0,196,79,0.08)', borderRadius:10, padding:'6px', border:'1px solid rgba(0,196,79,0.15)' }}>
          <span style={{ color:'rgba(255,255,255,0.4)', fontSize:11 }}>Resultado final: </span>
          <span style={{ color:'#00c44f', fontWeight:900, fontSize:14 }}>{m.score1} × {m.score2}</span>
        </div>
      )}

      {/* Footer */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:12 }}>
        {b
          ? <span style={{ background:b.bg, color:b.color, borderRadius:20, padding:'3px 12px', fontSize:11, fontWeight:800 }}>{b.label}</span>
          : <span/>
        }
        {open && (
          <button onClick={save} disabled={s1===''||s2===''||saving}
            style={{ background:saved?'#009639':'#F5A623', color:saved?'#fff':'#000', border:'none', borderRadius:10, padding:'8px 20px', fontWeight:900, fontSize:12, cursor:'pointer', fontFamily:'Nunito,sans-serif', opacity:s1!==''&&s2!==''?1:0.4 }}>
            {saving?<Loader2 size={13} style={{ animation:'spin 1s linear infinite' }}/>:saved?<><Check size={13}/> Salvo!</>:prediction?'Atualizar':'Salvar'}
          </button>
        )}
        {!open&&!prediction&&!m.is_finished && (
          <span style={{ color:'rgba(255,255,255,0.25)', fontSize:11, fontStyle:'italic' }}>Sem palpite</span>
        )}
      </div>
    </div>
  )
}

export default function Predictions({ participant, onLogout }) {
  const [preds,   setPreds]   = useState({})
  const [results, setResults] = useState({})
  const [filter,  setFilter]  = useState('all')
  const [grp,     setGrp]     = useState('all')
  const [loading, setLoading] = useState(true)

  const fetchPreds = useCallback(async () => {
    const { data } = await supabase.from('predictions').select('match_id,score1,score2,points').eq('participant_id',participant.id)
    const m={}; data?.forEach(p=>{m[p.match_id]=p}); setPreds(m)
  }, [participant.id])

  const fetchResults = useCallback(async () => {
    const { data } = await supabase.from('matches').select('id,score1,score2,is_finished')
    const m={}; data?.forEach(r=>{m[r.id]=r}); setResults(m)
  }, [])

  useEffect(() => { Promise.all([fetchPreds(), fetchResults()]).then(()=>setLoading(false)) }, [fetchPreds, fetchResults])

  useEffect(() => {
    const ch = supabase.channel('predictions-matches-rt')
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'matches'},(payload)=>{
        const m=payload.new; setResults(prev=>({...prev,[m.id]:m})); if(m.is_finished) fetchPreds()
      }).subscribe()
    return ()=>supabase.removeChannel(ch)
  }, [fetchPreds])

  const save = async (id,s1,s2) => {
    if (preds[id]) await supabase.from('predictions').update({score1:s1,score2:s2,updated_at:new Date().toISOString()}).eq('participant_id',participant.id).eq('match_id',id)
    else           await supabase.from('predictions').insert([{participant_id:participant.id,match_id:id,score1:s1,score2:s2}])
    setPreds(p=>({...p,[id]:{score1:s1,score2:s2,points:p[id]?.points}}))
  }

  const enriched = GROUP_MATCHES.map(m=>({...m,...(results[m.id]||{})}))
  let list = enriched
  if (grp!=='all')           list=list.filter(m=>m.group===grp)
  if (filter==='open')       list=list.filter(m=>isMatchOpen(m)&&!m.is_finished)
  if (filter==='done')       list=list.filter(m=>preds[m.id])
  if (filter==='finished')   list=list.filter(m=>m.is_finished)
  if (filter==='brazil')     list=list.filter(m=>m.team1==='Brasil'||m.team2==='Brasil')

  const openCount = enriched.filter(m=>isMatchOpen(m)&&!m.is_finished&&!preds[m.id]).length

  return (
    <div style={{ minHeight:'100vh', background:'#060d18', paddingBottom:80 }}>
      <Header participant={participant} onLogout={onLogout}/>

      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#001a3a 0%,#002855 60%,#003d00 100%)', padding:'70px 16px 24px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-50, right:-50, width:200, height:200, borderRadius:'50%', background:'rgba(0,150,57,0.08)', pointerEvents:'none' }}/>
        <div style={{ color:'rgba(255,255,255,0.4)', fontSize:9, fontWeight:800, letterSpacing:3, textTransform:'uppercase', marginBottom:4 }}>Copa do Mundo 2026</div>
        <h1 style={{ color:'#fff', fontWeight:900, fontSize:32, margin:'0 0 4px', letterSpacing:-1, textTransform:'uppercase' }}>MEUS PALPITES</h1>
        {openCount>0 && (
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(245,166,35,0.15)', border:'1px solid rgba(245,166,35,0.3)', borderRadius:20, padding:'5px 12px', marginTop:8 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#F5A623', animation:'pulse 1.5s infinite' }}/>
            <span style={{ color:'#F5A623', fontWeight:800, fontSize:12 }}>⚠️ {openCount} jogo{openCount!==1?'s':''} aguardando palpite!</span>
          </div>
        )}
      </div>

      {/* Filtros de status */}
      <div style={{ background:'#0d1b2e', borderBottom:'1px solid rgba(255,255,255,0.08)', padding:'10px 12px', display:'flex', gap:6, overflowX:'auto' }}>
        {FILTERS.map(f=>(
          <button key={f.key} onClick={()=>setFilter(f.key)} style={{
            flexShrink:0, padding:'7px 14px', borderRadius:20,
            border: filter===f.key?'none':'1px solid rgba(255,255,255,0.1)',
            fontWeight:800, fontSize:11, cursor:'pointer',
            background: filter===f.key?'#009639':'transparent',
            color: filter===f.key?'#fff':'rgba(255,255,255,0.4)',
            fontFamily:'Nunito,sans-serif',
          }}>{f.label}</button>
        ))}
      </div>

      {/* Filtros de grupo */}
      <div style={{ background:'#0d1b2e', borderBottom:'1px solid rgba(255,255,255,0.08)', padding:'8px 10px', display:'flex', gap:5, overflowX:'auto' }}>
        {GROUPS.map(g=>(
          <button key={g} onClick={()=>setGrp(g)} style={{
            flexShrink:0, width:g==='all'?38:34, height:30, borderRadius:8, border:'none',
            fontWeight:800, fontSize:11, cursor:'pointer', fontFamily:'Nunito,sans-serif',
            background: grp===g?'#F5A623':'rgba(255,255,255,0.06)',
            color: grp===g?'#000':'rgba(255,255,255,0.4)',
          }}>{g==='all'?'✦':g}</button>
        ))}
      </div>

      <main style={{ padding:'14px 12px' }}>
        <ChampionCard participant={participant}/>

        {loading ? (
          <div style={{ textAlign:'center', padding:'48px 0' }}>
            <Loader2 size={28} style={{ animation:'spin 1s linear infinite', margin:'0 auto 12px', display:'block', color:'#009639' }}/>
            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : list.length===0 ? (
          <div style={{ textAlign:'center', padding:'48px 0' }}>
            <div style={{ fontSize:48 }}>🔍</div>
            <p style={{ color:'rgba(255,255,255,0.3)', marginTop:8 }}>Nenhum jogo neste filtro.</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {list.map(m=><MatchRow key={m.id} match={m} prediction={preds[m.id]} onSave={save}/>)}
          </div>
        )}
      </main>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>
  )
}
