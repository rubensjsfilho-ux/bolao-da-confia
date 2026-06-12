import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { GROUP_MATCHES, getFlag, formatDate } from '../data/matches'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'

const C = {
  bg:       '#011901',
  card:     'rgba(255,255,255,0.06)',
  border:   'rgba(255,255,255,0.10)',
  text:     '#ffffff',
  textMuted:'rgba(255,255,255,0.45)',
  gold:     '#F5A623',
  green:    '#4ade80',
  red:      '#f87171',
  header:   'rgba(1,25,1,0.97)',
}

function calcPoints(p1,p2,r1,r2){
  if(p1===r1&&p2===r2)return 3
  if(Math.sign(p1-p2)===Math.sign(r1-r2))return 1
  return 0
}

// ── Card de resultado ─────────────────────────────────────────────────────────
function MatchRow({ match, onSave, onFinish, onReset, onSaveStream }){
  const [s1,setS1]=useState(match.score1??'')
  const [s2,setS2]=useState(match.score2??'')
  const [streamUrl,setStreamUrl]=useState(match.stream_url||'')
  const [streamSaved,setStreamSaved]=useState(false)
  const [saving,setSaving]=useState(false)
  const [finishing,setFinishing]=useState(false)
  const [resetting,setResetting]=useState(false)
  const [saved,setSaved]=useState(false)
  const [confirmReset,setConfirmReset]=useState(false)
  const [confirmFinish,setConfirmFinish]=useState(false)

  // Só sincroniza quando a partida for resetada (score volta a null)
  // Não sincroniza ao salvar parcial, para não zerar o que o admin está digitando
  useEffect(()=>{
    if(match.score1===null||match.score1===undefined){
      setS1('')
      setS2('')
    }
  },[match.score1])

  const save = async()=>{
    if(s1===''||s2==='')return
    setSaving(true)
    await onSave(match.id,parseInt(s1),parseInt(s2))
    setSaving(false);setSaved(true)
    setTimeout(()=>setSaved(false),2500)
  }

  const saveStream = async()=>{
    await onSaveStream(match.id, streamUrl.trim())
    setStreamSaved(true)
    setTimeout(()=>setStreamSaved(false),2500)
  }

  const finish = async()=>{
    if(s1===''||s2==='')return
    setConfirmFinish(false)
    setFinishing(true)
    await onFinish(match.id,parseInt(s1),parseInt(s2))
    setFinishing(false)
  }

  const reset = async()=>{
    setConfirmReset(false)
    setResetting(true)
    await onReset(match.id)
    setResetting(false)
  }

  return(
    <div style={{ background:C.card, border:`1px solid ${match.is_finished?C.green:C.border}`, borderRadius:12, padding:'12px 14px', marginBottom:10 }}>
      {/* Cabeçalho */}
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
        <span style={{ color:C.textMuted, fontSize:10 }}>Grupo {match.group} · {formatDate(match.date)}</span>
        {match.is_finished
          ? <span style={{ color:C.green, fontSize:10, fontWeight:800 }}>✓ Encerrado</span>
          : match.score1!==null&&match.score1!==undefined
            ? <span style={{ color:C.gold, fontSize:10, fontWeight:800 }}>⏱ Em andamento</span>
            : null
        }
      </div>

      {/* Times e placar */}
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:20 }}>{getFlag(match.team1)}</span>
        <span style={{ flex:1, color:C.text, fontSize:12, fontWeight:700 }}>{match.team1}</span>

        {match.is_finished ? (
          <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.2)', borderRadius:10, padding:'6px 14px' }}>
            <span style={{ color:C.green, fontSize:26, fontWeight:900, minWidth:24, textAlign:'center' }}>{match.score1}</span>
            <span style={{ color:C.textMuted, fontWeight:900 }}>×</span>
            <span style={{ color:C.green, fontSize:26, fontWeight:900, minWidth:24, textAlign:'center' }}>{match.score2}</span>
          </div>
        ) : (
          <>
            <input type="number" min="0" max="20" value={s1} onChange={e=>setS1(e.target.value)}
              style={{ width:48, height:40, background:'rgba(255,255,255,0.1)', border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:20, fontWeight:900, textAlign:'center', outline:'none' }}/>
            <span style={{ color:C.textMuted, fontWeight:900 }}>×</span>
            <input type="number" min="0" max="20" value={s2} onChange={e=>setS2(e.target.value)}
              style={{ width:48, height:40, background:'rgba(255,255,255,0.1)', border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:20, fontWeight:900, textAlign:'center', outline:'none' }}/>
          </>
        )}

        <span style={{ flex:1, color:C.text, fontSize:12, fontWeight:700, textAlign:'right' }}>{match.team2}</span>
        <span style={{ fontSize:20 }}>{getFlag(match.team2)}</span>
      </div>

      {/* Botões */}
      <div style={{ display:'flex', justifyContent:'flex-end', gap:6, marginTop:10 }}>
        {match.is_finished ? (
          confirmReset ? (
            <div style={{ display:'flex', gap:6, alignItems:'center' }}>
              <span style={{ color:C.textMuted, fontSize:10 }}>Tem certeza?</span>
              <button onClick={reset} disabled={resetting}
                style={{ background:'rgba(248,113,113,0.2)', color:C.red, border:'1px solid rgba(248,113,113,0.4)', borderRadius:8, padding:'7px 12px', fontWeight:900, fontSize:11, cursor:'pointer' }}>
                {resetting?'Resetando...':'✓ Confirmar'}
              </button>
              <button onClick={()=>setConfirmReset(false)}
                style={{ background:'rgba(255,255,255,0.08)', color:C.textMuted, border:`1px solid ${C.border}`, borderRadius:8, padding:'7px 12px', fontWeight:900, fontSize:11, cursor:'pointer' }}>
                Cancelar
              </button>
            </div>
          ) : (
            <button onClick={()=>setConfirmReset(true)}
              style={{ background:'rgba(248,113,113,0.1)', color:C.red, border:'1px solid rgba(248,113,113,0.25)', borderRadius:8, padding:'7px 14px', fontWeight:900, fontSize:11, cursor:'pointer' }}>
              ↩ Resetar Jogo
            </button>
          )
        ) : (
          <>
            <button onClick={save} disabled={s1===''||s2===''||saving}
              style={{ background:'rgba(255,255,255,0.1)', color:saved?C.green:C.text, border:`1px solid ${C.border}`, borderRadius:8, padding:'7px 14px', fontWeight:900, fontSize:11, cursor:'pointer', opacity:(s1===''||s2==='')?0.4:1 }}>
              {saving?'Salvando...' : saved?'✓ Salvo!':'💾 Salvar placar'}
            </button>
            {confirmFinish ? (
              <>
                <button onClick={finish} disabled={finishing}
                  style={{ background:C.gold, color:'#000', border:'none', borderRadius:8, padding:'7px 14px', fontWeight:900, fontSize:11, cursor:'pointer' }}>
                  {finishing?'Encerrando...':'✓ Confirmar'}
                </button>
                <button onClick={()=>setConfirmFinish(false)}
                  style={{ background:'rgba(255,255,255,0.08)', color:C.textMuted, border:`1px solid ${C.border}`, borderRadius:8, padding:'7px 10px', fontWeight:900, fontSize:11, cursor:'pointer' }}>
                  ✕
                </button>
              </>
            ) : (
              <button onClick={()=>{ if(s1===''||s2==='')return; setConfirmFinish(true) }}
                disabled={s1===''||s2===''}
                style={{ background:C.gold, color:'#000', border:'none', borderRadius:8, padding:'7px 14px', fontWeight:900, fontSize:11, cursor:'pointer', opacity:(s1===''||s2==='')?0.4:1 }}>
                ✓ Encerrar
              </button>
            )}
          </>
        )}
      </div>
      {/* Link da transmissão ao vivo */}
      <div style={{ marginTop:10, display:'flex', gap:6, alignItems:'center' }}>
        <input
          type="text"
          value={streamUrl}
          onChange={e=>setStreamUrl(e.target.value)}
          placeholder="🔴 Link YouTube do jogo (ex: youtube.com/watch?v=...)"
          style={{ flex:1, background:'rgba(255,255,255,0.07)', border:`1px solid ${C.border}`, borderRadius:8, padding:'7px 10px', color:C.text, fontSize:11, fontFamily:'Nunito,sans-serif', outline:'none' }}
        />
        <button onClick={saveStream}
          style={{ background:streamSaved?'rgba(0,150,57,0.2)':'rgba(255,255,255,0.1)', color:streamSaved?C.green:C.text, border:`1px solid ${streamSaved?C.green:C.border}`, borderRadius:8, padding:'7px 12px', fontWeight:900, fontSize:11, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
          {streamSaved?'✓ Salvo!':'📡 Salvar link'}
        </button>
      </div>
    </div>
  )
}

// ── Aba de resultados ─────────────────────────────────────────────────────────
function ResultsTab({ matches, loading, onSave, onFinish, onReset, onSaveStream }){
  const [group,setGroup]=useState('all')
  const [showDone,setShowDone]=useState(true) // ← padrão true para ver encerrados
  const groups=['all','A','B','C','D','E','F','G','H','I','J','K','L']

  const enriched = GROUP_MATCHES.map(gm=>{
    const db=matches.find(m=>m.id===gm.id)
    return db?{...gm,...db}:gm
  })

  const done = enriched.filter(m=>m.is_finished).length
  const pending = enriched.filter(m=>!m.is_finished).length

  let filtered = enriched
  if(group!=='all') filtered=filtered.filter(m=>m.group===group)
  if(!showDone) filtered=filtered.filter(m=>!m.is_finished)

  return(
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:12, textAlign:'center' }}>
          <div style={{ color:C.green, fontWeight:900, fontSize:26 }}>{done}</div>
          <div style={{ color:C.textMuted, fontSize:10 }}>Encerrados</div>
        </div>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:12, textAlign:'center' }}>
          <div style={{ color:C.gold, fontWeight:900, fontSize:26 }}>{pending}</div>
          <div style={{ color:C.textMuted, fontSize:10 }}>Pendentes</div>
        </div>
      </div>

      <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:8, marginBottom:8 }}>
        {groups.map(g=>(
          <button key={g} onClick={()=>setGroup(g)} style={{
            flexShrink:0, width:36, height:32, borderRadius:8, border:'none', fontWeight:800, fontSize:11, cursor:'pointer',
            background: group===g ? 'rgba(245,166,35,0.2)' : 'rgba(255,255,255,0.08)',
            color: group===g ? C.gold : C.textMuted,
          }}>{g==='all'?'✦':g}</button>
        ))}
      </div>

      <label style={{ display:'flex', alignItems:'center', gap:8, color:C.textMuted, fontSize:13, marginBottom:14, cursor:'pointer' }}>
        <input type="checkbox" checked={showDone} onChange={e=>setShowDone(e.target.checked)}/>
        Mostrar encerrados ({done})
      </label>

      {loading ? (
        <div style={{ textAlign:'center', padding:40, color:C.textMuted }}>⚽ Carregando...</div>
      ) : filtered.length===0 ? (
        <div style={{ textAlign:'center', padding:40, color:C.textMuted }}>
          <div style={{ fontSize:40, marginBottom:8 }}>✅</div>
          <p>Nenhum jogo neste filtro.</p>
        </div>
      ) : filtered.map(m=><MatchRow key={m.id} match={m} onSave={onSave} onFinish={onFinish} onReset={onReset} onSaveStream={onSaveStream}/>)}
    </div>
  )
}

// ── Aba de participantes ──────────────────────────────────────────────────────
function ParticipantsTab(){
  const [parts,setParts]=useState([])
  const [loading,setLoading]=useState(true)
  const [confirm,setConfirm]=useState(null)
  const [deleting,setDeleting]=useState(false)
  const [msg,setMsg]=useState('')
  const [msgType,setMsgType]=useState('ok')

  const load = async()=>{
    setLoading(true)
    const {data}=await supabase.from('participants')
      .select('id,name,avatar_emoji,avatar_url,total_points,exact_hits,result_hits,predictions_count')
      .order('total_points',{ascending:false})
    setParts(data||[])
    setLoading(false)
  }
  useEffect(()=>{load()},[])

  const del = async(p)=>{
    setDeleting(true)
    try{
      const {error:e1}=await supabase.from('predictions').delete().eq('participant_id',p.id)
      const {error:e2}=await supabase.from('champion_predictions').delete().eq('participant_id',p.id)
      const {error:e3}=await supabase.from('participants').delete().eq('id',p.id)
      if(e1||e2||e3){
        const err=e1||e2||e3
        setMsgType('err')
        setMsg(`❌ Erro: ${err.message}`)
      } else {
        setMsgType('ok')
        setMsg(`✅ ${p.name} removido!`)
      }
    }catch(e){
      setMsgType('err')
      setMsg('❌ Erro inesperado: '+e.message)
    }
    setConfirm(null)
    setDeleting(false)
    setTimeout(()=>setMsg(''),4000)
    load()
  }

  if(loading) return <div style={{textAlign:'center',padding:40,color:C.textMuted}}>⚽ Carregando...</div>

  return(
    <div>
      {msg&&<div style={{ background: msgType==='ok'?'rgba(74,222,128,0.1)':'rgba(248,113,113,0.1)', border:`1px solid ${msgType==='ok'?'rgba(74,222,128,0.3)':'rgba(248,113,113,0.3)'}`, borderRadius:10, padding:'10px 14px', marginBottom:12, color: msgType==='ok'?C.green:C.red, fontSize:12 }}>{msg}</div>}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <span style={{ color:C.text, fontWeight:800, fontSize:16 }}>{parts.length} participante{parts.length!==1?'s':''}</span>
        <button onClick={load} style={{ background:'rgba(255,255,255,0.08)', border:`1px solid ${C.border}`, borderRadius:8, padding:'6px 12px', color:C.textMuted, fontSize:11, fontWeight:700, cursor:'pointer' }}>↺ Atualizar</button>
      </div>
      {parts.map((p,i)=>(
        <div key={p.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:'10px 12px', marginBottom:8, display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ width:24, textAlign:'center', color:C.gold, fontWeight:900, fontSize:13, flexShrink:0 }}>
            {i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}º`}
          </span>
          <div style={{ width:36,height:36,borderRadius:'50%',background:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0,overflow:'hidden' }}>
            {p.avatar_url?<img src={p.avatar_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>{e.target.style.display='none'}}/>:<span>{p.avatar_emoji||'⚽'}</span>}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ color:C.text, fontWeight:800, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</div>
            <div style={{ color:C.textMuted, fontSize:10, marginTop:2 }}>⚡{p.exact_hits||0} exatos · ✓{p.result_hits||0} result.</div>
          </div>
          <div style={{ textAlign:'right', flexShrink:0, marginRight:6 }}>
            <div style={{ color:C.gold, fontWeight:900, fontSize:20 }}>{p.total_points||0}</div>
            <div style={{ color:C.textMuted, fontSize:9 }}>pts</div>
          </div>
          {confirm?.id===p.id ? (
            <div style={{ display:'flex', flexDirection:'column', gap:4, flexShrink:0 }}>
              <button onClick={()=>del(p)} disabled={deleting}
                style={{ background:'rgba(248,113,113,0.2)', border:'1px solid rgba(248,113,113,0.4)', color:C.red, borderRadius:8, padding:'4px 8px', fontSize:10, fontWeight:800, cursor:'pointer' }}>
                {deleting?'...':'Confirmar'}
              </button>
              <button onClick={()=>setConfirm(null)}
                style={{ background:'rgba(255,255,255,0.06)', border:`1px solid ${C.border}`, color:C.textMuted, borderRadius:8, padding:'4px 8px', fontSize:10, fontWeight:800, cursor:'pointer' }}>
                Cancelar
              </button>
            </div>
          ):(
            <button onClick={()=>setConfirm(p)}
              style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:8, padding:'8px', cursor:'pointer', flexShrink:0 }}>
              🗑️
            </button>
          )}
        </div>
      ))}
      {parts.length===0&&<div style={{ textAlign:'center', padding:48, color:C.textMuted }}><div style={{ fontSize:40, marginBottom:8 }}>👥</div><p>Nenhum participante ainda.</p></div>}
    </div>
  )
}

// ── ABA MATA-MATA NO ADMIN ────────────────────────────────────────────────────
const KO_ROUNDS = [
  { id:'r2', label:'2ª Fase', count:16 },
  { id:'r16',label:'Oitavas', count:8  },
  { id:'qf', label:'Quartas', count:4  },
  { id:'sf', label:'Semis',   count:2  },
  { id:'f',  label:'Final',   count:2  },
]
const ALL_TEAMS = ['África do Sul','Alemanha','Arábia Saudita','Argentina','Argélia','Austrália','Áustria','Bélgica','Bósnia e Herz.','Brasil','Cabo Verde','Canadá','Catar','Colômbia','Coreia do Sul','Costa do Marfim','Croácia','Curaçao','Egito','Equador','Escócia','Espanha','Estados Unidos','França','Gana','Haiti','Holanda','Inglaterra','Iraque','Irã','Japão','Jordânia','Marrocos','México','Nova Zelândia','Noruega','Panamá','Paraguai','Portugal','RD Congo','República Tcheca','Senegal','Suécia','Suíça','Tunísia','Turquia','Uruguai','Uzbequistão']

function KOMatchRow({ matchId, label, db, onSave, onFinish, onReset }) {
  const [s1, setS1] = useState(db.score1 ?? '')
  const [s2, setS2] = useState(db.score2 ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [confirmFinish, setConfirmFinish] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    if (db.score1 === null || db.score1 === undefined) { setS1(''); setS2('') }
  }, [db.score1])

  const hasTeams = db.team1 && db.team2

  const save = async () => {
    if (s1 === '' || s2 === '') return
    setSaving(true)
    await onSave(matchId, db.team1, db.team2, parseInt(s1), parseInt(s2))
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const finish = async () => {
    if (s1 === '' || s2 === '') return
    setConfirmFinish(false); setFinishing(true)
    await onFinish(matchId, db.team1, db.team2, parseInt(s1), parseInt(s2))
    setFinishing(false)
  }

  const reset = async () => {
    setConfirmReset(false); setResetting(true)
    await onReset(matchId)
    setResetting(false)
  }

  return (
    <div style={{ background:C.card, border:`1px solid ${db.is_finished?C.green:C.border}`, borderRadius:12, padding:'12px 14px', marginBottom:10 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
        <span style={{ color:C.gold, fontWeight:800, fontSize:11 }}>{label}</span>
        {db.is_finished
          ? <span style={{ color:C.green, fontSize:10, fontWeight:800 }}>✓ Encerrado</span>
          : db.score1!==null&&db.score1!==undefined
            ? <span style={{ color:C.gold, fontSize:10, fontWeight:800 }}>⏱ Em andamento</span>
            : null
        }
      </div>

      {/* Seleção de times */}
      <div style={{ display:'flex', gap:8, marginBottom:10 }}>
        <select value={db.team1||''} disabled={db.is_finished}
          onChange={e => onSave(matchId, e.target.value, db.team2||'', db.score1??null, db.score2??null)}
          style={{ flex:1, padding:'8px 8px', background:'rgba(255,255,255,0.08)', border:`1px solid ${C.border}`, borderRadius:8, color:db.team1?C.text:C.textMuted, fontSize:11, outline:'none', opacity:db.is_finished?.6:1 }}>
          <option value="">Time 1...</option>
          {ALL_TEAMS.map(t => <option key={t} value={t} style={{background:'#011901'}}>{t}</option>)}
        </select>
        <select value={db.team2||''} disabled={db.is_finished}
          onChange={e => onSave(matchId, db.team1||'', e.target.value, db.score1??null, db.score2??null)}
          style={{ flex:1, padding:'8px 8px', background:'rgba(255,255,255,0.08)', border:`1px solid ${C.border}`, borderRadius:8, color:db.team2?C.text:C.textMuted, fontSize:11, outline:'none', opacity:db.is_finished?.6:1 }}>
          <option value="">Time 2...</option>
          {ALL_TEAMS.map(t => <option key={t} value={t} style={{background:'#011901'}}>{t}</option>)}
        </select>
      </div>

      {/* Placar */}
      {hasTeams && (
        <>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
            <span style={{ flex:1, color:C.text, fontSize:12, fontWeight:700 }}>{db.team1}</span>
            {db.is_finished ? (
              <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.2)', borderRadius:10, padding:'6px 14px' }}>
                <span style={{ color:C.green, fontSize:24, fontWeight:900, minWidth:24, textAlign:'center' }}>{db.score1}</span>
                <span style={{ color:C.textMuted, fontWeight:900 }}>×</span>
                <span style={{ color:C.green, fontSize:24, fontWeight:900, minWidth:24, textAlign:'center' }}>{db.score2}</span>
              </div>
            ) : (
              <>
                <input type="number" min="0" max="20" value={s1} onChange={e=>setS1(e.target.value)}
                  style={{ width:48, height:40, background:'rgba(255,255,255,0.1)', border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:20, fontWeight:900, textAlign:'center', outline:'none' }}/>
                <span style={{ color:C.textMuted, fontWeight:900 }}>×</span>
                <input type="number" min="0" max="20" value={s2} onChange={e=>setS2(e.target.value)}
                  style={{ width:48, height:40, background:'rgba(255,255,255,0.1)', border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:20, fontWeight:900, textAlign:'center', outline:'none' }}/>
              </>
            )}
            <span style={{ flex:1, color:C.text, fontSize:12, fontWeight:700, textAlign:'right' }}>{db.team2}</span>
          </div>

          {/* Botões */}
          <div style={{ display:'flex', justifyContent:'flex-end', gap:6 }}>
            {db.is_finished ? (
              confirmReset ? (
                <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                  <span style={{ color:C.textMuted, fontSize:10 }}>Tem certeza?</span>
                  <button onClick={reset} disabled={resetting}
                    style={{ background:'rgba(248,113,113,0.2)', color:C.red, border:'1px solid rgba(248,113,113,0.4)', borderRadius:8, padding:'7px 12px', fontWeight:900, fontSize:11, cursor:'pointer' }}>
                    {resetting?'Resetando...':'✓ Confirmar'}
                  </button>
                  <button onClick={()=>setConfirmReset(false)}
                    style={{ background:'rgba(255,255,255,0.08)', color:C.textMuted, border:`1px solid ${C.border}`, borderRadius:8, padding:'7px 12px', fontWeight:900, fontSize:11, cursor:'pointer' }}>
                    Cancelar
                  </button>
                </div>
              ) : (
                <button onClick={()=>setConfirmReset(true)}
                  style={{ background:'rgba(248,113,113,0.1)', color:C.red, border:'1px solid rgba(248,113,113,0.25)', borderRadius:8, padding:'7px 14px', fontWeight:900, fontSize:11, cursor:'pointer' }}>
                  ↩ Resetar Jogo
                </button>
              )
            ) : (
              <>
                <button onClick={save} disabled={s1===''||s2===''||saving}
                  style={{ background:'rgba(255,255,255,0.1)', color:saved?C.green:C.text, border:`1px solid ${C.border}`, borderRadius:8, padding:'7px 14px', fontWeight:900, fontSize:11, cursor:'pointer', opacity:(s1===''||s2==='')?0.4:1 }}>
                  {saving?'Salvando...':saved?'✓ Salvo!':'💾 Salvar placar'}
                </button>
                {confirmFinish ? (
                  <>
                    <button onClick={finish} disabled={finishing}
                      style={{ background:C.gold, color:'#000', border:'none', borderRadius:8, padding:'7px 14px', fontWeight:900, fontSize:11, cursor:'pointer' }}>
                      {finishing?'Encerrando...':'✓ Confirmar'}
                    </button>
                    <button onClick={()=>setConfirmFinish(false)}
                      style={{ background:'rgba(255,255,255,0.08)', color:C.textMuted, border:`1px solid ${C.border}`, borderRadius:8, padding:'7px 10px', fontWeight:900, fontSize:11, cursor:'pointer' }}>
                      ✕
                    </button>
                  </>
                ) : (
                  <button onClick={()=>{ if(s1===''||s2==='')return; setConfirmFinish(true) }}
                    disabled={s1===''||s2===''}
                    style={{ background:C.gold, color:'#000', border:'none', borderRadius:8, padding:'7px 14px', fontWeight:900, fontSize:11, cursor:'pointer', opacity:(s1===''||s2==='')?0.4:1 }}>
                    ✓ Encerrar
                  </button>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function KnockoutTab() {
  const [activeRound, setActiveRound] = useState('r2')
  const [matches, setMatches] = useState({})
  const [msg, setMsg] = useState('')

  useEffect(() => {
    supabase.from('bracket_matches').select('*').then(({ data }) => {
      const map = {}
      data?.forEach(m => { map[m.id] = m })
      setMatches(map)
    })
  }, [])

  const recalcTotals = async () => {
    const { data: ps } = await supabase.from('participants').select('id')
    for (const p of ps || []) {
      const { data: g } = await supabase.from('predictions').select('points').eq('participant_id',p.id).not('points','is',null)
      const { data: k } = await supabase.from('knockout_predictions').select('points').eq('participant_id',p.id).not('points','is',null)
      const total = [...(g||[]),...(k||[])].reduce((s,x)=>s+(x.points||0),0)
      const exact = [...(g||[]),...(k||[])].filter(x=>x.points===3).length
      const result = [...(g||[]),...(k||[])].filter(x=>x.points===1).length
      await supabase.from('participants').update({ total_points:total, exact_hits:exact, result_hits:result }).eq('id',p.id)
    }
  }

  const saveMatch = async (id, team1, team2, score1, score2) => {
    const payload = { team1, team2, score1:score1??null, score2:score2??null, updated_at:new Date().toISOString() }
    if (matches[id]) {
      await supabase.from('bracket_matches').update(payload).eq('id',id)
    } else {
      await supabase.from('bracket_matches').insert([{ id, round:id.split('_')[0], position:parseInt(id.split('_')[1]), ...payload, is_finished:false }])
    }
    setMatches(m => ({ ...m, [id]: { ...(m[id]||{}), id, ...payload, is_finished:m[id]?.is_finished||false } }))
  }

  const finishMatch = async (id, team1, team2, score1, score2) => {
    await supabase.from('bracket_matches').update({ team1, team2, score1, score2, is_finished:true, updated_at:new Date().toISOString() }).eq('id',id)
    setMatches(m => ({ ...m, [id]: { ...(m[id]||{}), team1, team2, score1, score2, is_finished:true } }))
    const { data: preds } = await supabase.from('knockout_predictions').select('id,score1,score2,participant_id').eq('match_id',id)
    for (const p of preds||[]) {
      const pts = calcPoints(p.score1,p.score2,score1,score2)
      await supabase.from('knockout_predictions').update({ points:pts }).eq('id',p.id)
    }
    await recalcTotals()
    setMsg('✅ Encerrado e pontos calculados!')
    setTimeout(()=>setMsg(''),3000)
  }

  const resetMatch = async (id) => {
    await supabase.from('bracket_matches').update({ score1:null, score2:null, is_finished:false, updated_at:new Date().toISOString() }).eq('id',id)
    setMatches(m => ({ ...m, [id]: { ...(m[id]||{}), score1:null, score2:null, is_finished:false } }))
    await supabase.from('knockout_predictions').update({ points:null }).eq('match_id',id)
    await recalcTotals()
  }

  const roundMatches = Array.from({ length: KO_ROUNDS.find(r=>r.id===activeRound)?.count||0 }, (_,i) => ({
    id: `${activeRound}_${i+1}`,
    label: `${KO_ROUNDS.find(r=>r.id===activeRound)?.label} · Jogo ${i+1}`,
  }))

  return (
    <div>
      {msg && <div style={{ background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.3)', borderRadius:10, padding:'10px 14px', marginBottom:12, color:C.green, fontSize:12 }}>{msg}</div>}
      <p style={{ color:C.textMuted, fontSize:11, marginBottom:12 }}>Selecione os times, salve o placar parcial e encerre quando terminar.</p>
      <div style={{ display:'flex', gap:5, marginBottom:14, overflowX:'auto' }}>
        {KO_ROUNDS.map(r => (
          <button key={r.id} onClick={()=>setActiveRound(r.id)} style={{
            flexShrink:0, padding:'6px 12px', border:'none', borderRadius:8,
            fontWeight:800, fontSize:11, cursor:'pointer', fontFamily:'Nunito,sans-serif',
            background: activeRound===r.id?C.gold:'rgba(255,255,255,0.08)',
            color: activeRound===r.id?'#000':C.textMuted,
          }}>{r.label}</button>
        ))}
      </div>
      {roundMatches.map(m => (
        <KOMatchRow key={m.id} matchId={m.id} label={m.label}
          db={matches[m.id]||{}}
          onSave={saveMatch} onFinish={finishMatch} onReset={resetMatch}
        />
      ))}
    </div>
  )
}

// ── ADMIN PRINCIPAL ────────────────────────────────────────────────────  ──────
export default function Admin(){
  const [authed,setAuthed]=useState(false)
  const [pwd,setPwd]=useState('')
  const [pwdErr,setPwdErr]=useState('')
  const [matches,setMatches]=useState([])
  const [loading,setLoading]=useState(false)
  const [tab,setTab]=useState('results')
  const [recalcMsg,setRecalcMsg]=useState('')
  const [confirmZero,setConfirmZero]=useState(false)
  const [zeroing,setZeroing]=useState(false)

  const zeroAll = async() => {
  setZeroing(true); setConfirmZero(false)
  // ✅ .not('id','is',null) funciona para qualquer tipo de id
  await supabase.from('predictions').update({points:null}).not('id','is',null)
  await supabase.from('knockout_predictions').update({points:null}).not('id','is',null)
  await supabase.from('participants').update({
    total_points:0, exact_hits:0, result_hits:0, predictions_count:0
  }).not('id','is',null)
  await supabase.from('matches').update({
    score1:null, score2:null, is_finished:false
  }).not('id','is',null)
  setMatches(prev=>prev.map(m=>({...m,score1:null,score2:null,is_finished:false})))
  setZeroing(false)
  setRecalcMsg('✅ Tudo zerado!')
  setTimeout(()=>setRecalcMsg(''),3000)
}

  const auth=(e)=>{
    e.preventDefault()
    if(pwd===ADMIN_PASSWORD){setAuthed(true);loadMatches()}
    else setPwdErr('Senha incorreta.')
  }

  const loadMatches=async()=>{
    setLoading(true)
    const{data,error}=await supabase.from('matches').select('*').order('match_date')
    if(!error) setMatches(data||[])
    setLoading(false)
  }

  const saveResult=async(matchId,score1,score2)=>{
    await supabase.from('matches').update({score1,score2,updated_at:new Date().toISOString()}).eq('id',matchId)
    setMatches(prev=>prev.map(m=>m.id===matchId?{...m,score1,score2}:m))
  }

  const finishMatch=async(matchId,score1,score2)=>{
    await supabase.from('matches').update({score1,score2,is_finished:true,updated_at:new Date().toISOString()}).eq('id',matchId)
    setMatches(prev=>prev.map(m=>m.id===matchId?{...m,score1,score2,is_finished:true}:m))
    const{data:preds}=await supabase.from('predictions').select('id,score1,score2').eq('match_id',matchId)
    for(const p of preds||[]){
      await supabase.from('predictions').update({points:calcPoints(p.score1,p.score2,score1,score2)}).eq('id',p.id)
    }
    await recalcTotals()
    // Reload para garantir sincronismo com o banco
    await loadMatches()
  }

  const resetMatch=async(matchId)=>{
    await supabase.from('matches').update({score1:null,score2:null,is_finished:false}).eq('id',matchId)
    setMatches(prev=>prev.map(m=>m.id===matchId?{...m,score1:null,score2:null,is_finished:false}:m))
    await supabase.from('predictions').update({points:null}).eq('match_id',matchId)
    await recalcTotals()
    await loadMatches()
  }

  const saveStreamUrl=async(matchId,url)=>{
    await supabase.from('matches').update({stream_url:url||null}).eq('id',matchId)
    setMatches(prev=>prev.map(m=>m.id===matchId?{...m,stream_url:url||null}:m))
  }

  const recalcTotals=async()=>{
    const{data:ps}=await supabase.from('participants').select('id')
    for(const p of ps||[]){
      const{data:pr}=await supabase.from('predictions').select('points').eq('participant_id',p.id).not('points','is',null)
      const total=pr?.reduce((s,x)=>s+(x.points||0),0)||0
      const exact=pr?.filter(x=>x.points===3).length||0
      const result=pr?.filter(x=>x.points===1).length||0
      await supabase.from('participants').update({total_points:total,exact_hits:exact,result_hits:result,predictions_count:pr?.length||0}).eq('id',p.id)
    }
  }

  const fullRecalc=async()=>{
    setRecalcMsg('Recalculando...')
    const{data:done}=await supabase.from('matches').select('*').eq('is_finished',true)
    for(const m of done||[]){
      const{data:preds}=await supabase.from('predictions').select('id,score1,score2').eq('match_id',m.id)
      for(const p of preds||[]){
        await supabase.from('predictions').update({points:calcPoints(p.score1,p.score2,m.score1,m.score2)}).eq('id',p.id)
      }
    }
    await recalcTotals()
    setRecalcMsg('✅ Recalculado!')
    setTimeout(()=>setRecalcMsg(''),3000)
  }

  if(!authed) return(
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ width:'100%', maxWidth:360 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:56, marginBottom:8 }}>🔐</div>
          <h1 style={{ color:C.text, fontSize:28, fontWeight:900, margin:0, letterSpacing:1 }}>PAINEL ADMIN</h1>
          <p style={{ color:C.textMuted, fontSize:13, marginTop:4 }}>Bolão da Confia · Copa 2026</p>
        </div>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:24 }}>
          <form onSubmit={auth}>
            <label style={{ color:C.textMuted, fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:8 }}>Senha do Admin</label>
            <input type="password" placeholder="Digite a senha..." value={pwd}
              onChange={e=>{setPwd(e.target.value);setPwdErr('')}} autoFocus
              style={{ width:'100%', padding:'12px 14px', background:'rgba(255,255,255,0.08)', border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:15, outline:'none', boxSizing:'border-box', marginBottom:12 }}/>
            {pwdErr&&<div style={{ color:C.red, fontSize:12, marginBottom:12 }}>{pwdErr}</div>}
            <button type="submit" style={{ width:'100%', padding:'13px', background:C.gold, color:'#000', border:'none', borderRadius:10, fontWeight:900, fontSize:15, cursor:'pointer' }}>
              🔓 Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  )

  return(
    <div style={{ minHeight:'100vh', background:C.bg }}>
      <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:50, background:C.header, borderBottom:`1px solid ${C.border}`, padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ color:C.gold, fontWeight:900, fontSize:18 }}>🏆 ADMIN · COPA 2026</span>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {recalcMsg&&<span style={{ color:C.green, fontSize:11 }}>{recalcMsg}</span>}
          <button onClick={fullRecalc} style={{ background:'rgba(255,255,255,0.08)', border:`1px solid ${C.border}`, color:C.textMuted, borderRadius:8, padding:'6px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>↺ Recalcular</button>
          {confirmZero ? (
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ color:C.red, fontSize:10, fontWeight:700 }}>Zerar tudo?</span>
              <button onClick={zeroAll} disabled={zeroing}
                style={{ background:'rgba(248,113,113,0.2)', border:'1px solid rgba(248,113,113,0.4)', color:C.red, borderRadius:8, padding:'6px 10px', fontSize:11, fontWeight:900, cursor:'pointer' }}>
                {zeroing?'Zerando...':'✓ Sim'}
              </button>
              <button onClick={()=>setConfirmZero(false)}
                style={{ background:'rgba(255,255,255,0.08)', border:`1px solid ${C.border}`, color:C.textMuted, borderRadius:8, padding:'6px 10px', fontSize:11, fontWeight:900, cursor:'pointer' }}>
                Não
              </button>
            </div>
          ) : (
            <button onClick={()=>setConfirmZero(true)}
              style={{ background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)', color:C.red, borderRadius:8, padding:'6px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
              🗑 Zerar tudo
            </button>
          )}
        </div>
      </div>

      <main style={{ paddingTop:64, paddingBottom:32, padding:'72px 16px 32px', maxWidth:520, margin:'0 auto' }}>
        <div style={{ display:'flex', background:'rgba(255,255,255,0.05)', borderRadius:12, padding:4, marginBottom:20, gap:3, overflowX:'auto' }}>
          {[{id:'results',label:'🎯 Grupos'},{id:'knockout',label:'⚔️ Mata-Mata'},{id:'participants',label:'👥 Participantes'}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              flex:1, padding:'9px 6px', border: tab===t.id?`1px solid rgba(245,166,35,0.3)`:'1px solid transparent',
              borderRadius:10, fontWeight:800, fontSize:11, cursor:'pointer', fontFamily:'Nunito,sans-serif',
              background: tab===t.id?'rgba(245,166,35,0.15)':'transparent',
              color: tab===t.id?C.gold:C.textMuted, flexShrink:0,
            }}>{t.label}</button>
          ))}
        </div>
        {tab==='results'&&<ResultsTab matches={matches} loading={loading} onSave={saveResult} onFinish={finishMatch} onReset={resetMatch} onSaveStream={saveStreamUrl}/>}
        {tab==='knockout'&&<KnockoutTab/>}
        {tab==='participants'&&<ParticipantsTab/>}
      </main>
    </div>
  )
}
