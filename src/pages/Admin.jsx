import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { GROUP_MATCHES, BRACKET_MATCHES, getFlag, formatDate, isMatchOpen } from '../data/matches'

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

// ── Mapa do chaveamento — automação a partir das Oitavas ─────────────────────
// A 2ª Fase é preenchida manualmente pelo admin.
// A partir das Oitavas, o vencedor avança automaticamente.
const BRACKET_ADVANCEMENT = {
  // Oitavas → Quartas (pelos prints do chaveamento)
  'r16_1': { next: 'qf_1', slot: 'team1' }, // W89 → Los Angeles team1
  'r16_2': { next: 'qf_1', slot: 'team2' }, // W90 → Los Angeles team2
  'r16_3': { next: 'qf_2', slot: 'team1' }, // W91 → Boston team1
  'r16_4': { next: 'qf_2', slot: 'team2' }, // W92 → Boston team2
  'r16_5': { next: 'qf_3', slot: 'team1' }, // W93 → Miami team1
  'r16_6': { next: 'qf_3', slot: 'team2' }, // W94 → Miami team2
  'r16_7': { next: 'qf_4', slot: 'team1' }, // W95 → Kansas City team1
  'r16_8': { next: 'qf_4', slot: 'team2' }, // W96 → Kansas City team2
  // Quartas → Semis (pelos prints: QF1+QF2 → SF1, QF3+QF4 → SF2)
  'qf_1':  { next: 'sf_1', slot: 'team1' },
  'qf_2':  { next: 'sf_1', slot: 'team2' },
  'qf_3':  { next: 'sf_2', slot: 'team1' },
  'qf_4':  { next: 'sf_2', slot: 'team2' },
  // Semis → Final (f_2)
  'sf_1':  { next: 'f_2', slot: 'team1' },
  'sf_2':  { next: 'f_2', slot: 'team2' },
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

  const isOpen = isMatchOpen(match) && !match.is_finished
  return(
    <div data-match-open={isOpen?'true':'false'} style={{ background:C.card, border:`1px solid ${match.is_finished?C.green:C.border}`, borderRadius:12, padding:'12px 14px', marginBottom:10 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
        <span style={{ color:C.textMuted, fontSize:10 }}>Grupo {match.group} · {formatDate(match.date)}</span>
        {match.is_finished
          ? <span style={{ color:C.green, fontSize:10, fontWeight:800 }}>✓ Encerrado</span>
          : match.score1!==null&&match.score1!==undefined
            ? <span style={{ color:C.gold, fontSize:10, fontWeight:800 }}>⏱ Em andamento</span>
            : null
        }
      </div>

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
  const [showDone,setShowDone]=useState(true)
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

function KOMatchRow({ matchId, label, db, onSave, onFinish, onReset, onSaveStream }) {
  const [s1, setS1] = useState(db.score1 ?? '')
  const [s2, setS2] = useState(db.score2 ?? '')
  const [streamUrl, setStreamUrl] = useState(db.stream_url || '')
  const [streamSaved, setStreamSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [confirmFinish, setConfirmFinish] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const saveStream = async () => {
    await onSaveStream(matchId, streamUrl.trim())
    setStreamSaved(true)
    setTimeout(() => setStreamSaved(false), 2500)
  }

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
          {/* Campo de link da transmissão */}
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

  // ── Avança time para um slot do bracket ─────────────────────────────────────
  const advanceTeam = async (nextId, slot, team, currentMatches) => {
    const payload = { [slot]: team, updated_at: new Date().toISOString() }
    if (currentMatches[nextId]) {
      await supabase.from('bracket_matches').update(payload).eq('id', nextId)
    } else {
      const round = nextId.split('_')[0]
      const position = parseInt(nextId.split('_')[1])
      await supabase.from('bracket_matches').insert([{
        id: nextId, round, position,
        team1: slot === 'team1' ? team : null,
        team2: slot === 'team2' ? team : null,
        score1: null, score2: null, is_finished: false,
        updated_at: new Date().toISOString(),
      }])
    }
    setMatches(m => ({ ...m, [nextId]: { ...(m[nextId] || { id: nextId }), [slot]: team } }))
  }

  // ── Avança vencedor (e perdedor nas semis → 3º lugar) ────────────────────
  const advanceWinner = async (matchId, score1, score2, team1, team2, currentMatches) => {
    const advancement = BRACKET_ADVANCEMENT[matchId]
    const winner = score1 > score2 ? team1 : team2
    const loser  = score1 > score2 ? team2 : team1

    // Avança o vencedor para a próxima fase
    if (advancement) {
      await advanceTeam(advancement.next, advancement.slot, winner, currentMatches)
    }

    // Semis: perdedor vai para o 3º lugar
    if (matchId === 'sf_1') await advanceTeam('f_1', 'team1', loser, currentMatches)
    if (matchId === 'sf_2') await advanceTeam('f_1', 'team2', loser, currentMatches)
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

    // ── Avança o vencedor automaticamente ────────────────────────────────────
    await advanceWinner(id, score1, score2, team1, team2, matches)

    // Calcula pontos dos palpites
    const { data: preds } = await supabase.from('knockout_predictions').select('id,score1,score2,participant_id').eq('match_id',id)
    for (const p of preds||[]) {
      const pts = calcPoints(p.score1,p.score2,score1,score2)
      await supabase.from('knockout_predictions').update({ points:pts }).eq('id',p.id)
    }
    await recalcTotals()
    setMsg('✅ Encerrado, vencedor avançado e pontos calculados!')
    setTimeout(()=>setMsg(''),3000)
  }

  const resetMatch = async (id) => {
    await supabase.from('bracket_matches').update({ score1:null, score2:null, is_finished:false, updated_at:new Date().toISOString() }).eq('id',id)
    setMatches(m => ({ ...m, [id]: { ...(m[id]||{}), score1:null, score2:null, is_finished:false } }))
    await supabase.from('knockout_predictions').update({ points:null }).eq('match_id',id)
    await recalcTotals()
  }

  const saveStreamUrl = async (id, url) => {
    await supabase.from('bracket_matches').update({ stream_url: url || null }).eq('id', id)
    setMatches(m => ({ ...m, [id]: { ...(m[id]||{}), stream_url: url || null } }))
  }

  const roundMatches = Array.from({ length: KO_ROUNDS.find(r=>r.id===activeRound)?.count||0 }, (_,i) => ({
    id: `${activeRound}_${i+1}`,
    label: `${KO_ROUNDS.find(r=>r.id===activeRound)?.label} · Jogo ${i+1}`,
  }))

  return (
    <div>
      {msg && <div style={{ background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.3)', borderRadius:10, padding:'10px 14px', marginBottom:12, color:C.green, fontSize:12 }}>{msg}</div>}
      <p style={{ color:C.textMuted, fontSize:11, marginBottom:12 }}>Selecione os times, salve o placar parcial e encerre quando terminar. O vencedor avança automaticamente!</p>
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
          onSave={saveMatch} onFinish={finishMatch} onReset={resetMatch} onSaveStream={saveStreamUrl}
        />
      ))}
    </div>
  )
}


// ── ABA BANNERS ───────────────────────────────────────────────────────────────
function BannersTab() {
  const [banners, setBanners]   = useState([])
  const [matches, setMatches]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [saving,  setSaving]    = useState(false)
  const [msg,     setMsg]       = useState('')
  const [form,    setForm]      = useState({ match_id:'', img_mobile:'', img_desktop:'' })

  const load = async () => {
    setLoading(true)
    const [{ data: b }, { data: m }] = await Promise.all([
      supabase.from('banners').select('id,match_id,img_mobile,img_desktop,matches(team1,team2)').order('id'),
      supabase.from('matches').select('id,team1,team2,match_date,is_finished').eq('is_finished',false).order('match_date').limit(30),
    ])
    setBanners(b || [])
    setMatches(m || [])
    setLoading(false)
  }

  useEffect(() => {
    load().then(() => {
      setTimeout(() => {
        const firstOpen = document.querySelector('[data-match-open="true"]')
        if (firstOpen) firstOpen.scrollIntoView({ behavior:'smooth', block:'center' })
      }, 500)
    })
  }, [])

  const add = async () => {
    if (!form.match_id || !form.img_mobile || !form.img_desktop) {
      setMsg('❌ Preencha todos os campos'); setTimeout(()=>setMsg(''),3000); return
    }
    setSaving(true)
    const { error } = await supabase.from('banners').insert([{
      match_id:    parseInt(form.match_id),
      img_mobile:  parseInt(form.img_mobile),
      img_desktop: parseInt(form.img_desktop),
    }])
    if (error) { setMsg('❌ Erro: '+error.message) }
    else { setMsg('✅ Banner adicionado!'); setForm({ match_id:'', img_mobile:'', img_desktop:'' }); load() }
    setSaving(false)
    setTimeout(()=>setMsg(''),3000)
  }

  const remove = async (id) => {
    await supabase.from('banners').delete().eq('id', id)
    load()
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('pt-BR',{ day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit', timeZone:'America/Sao_Paulo' })

  return (
    <div>
      {msg && <div style={{ background: msg.startsWith('✅')?'rgba(74,222,128,0.1)':'rgba(248,113,113,0.1)', border:`1px solid ${msg.startsWith('✅')?'rgba(74,222,128,0.3)':'rgba(248,113,113,0.3)'}`, borderRadius:10, padding:'10px 14px', marginBottom:12, color: msg.startsWith('✅')?C.green:C.red, fontSize:12 }}>{msg}</div>}

      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:'14px', marginBottom:16 }}>
        <div style={{ color:C.gold, fontWeight:800, fontSize:12, marginBottom:12 }}>➕ Novo Banner</div>

        <div style={{ marginBottom:8 }}>
          <label style={{ color:C.textMuted, fontSize:10, fontWeight:700, display:'block', marginBottom:4 }}>PARTIDA</label>
          <select value={form.match_id} onChange={e=>setForm(f=>({...f,match_id:e.target.value}))}
            style={{ width:'100%', padding:'8px 10px', background:'rgba(255,255,255,0.08)', border:`1px solid ${C.border}`, borderRadius:8, color:form.match_id?C.text:C.textMuted, fontSize:12, outline:'none' }}>
            <option value="">Selecionar jogo...</option>
            {matches.map(m=>(
              <option key={m.id} value={m.id} style={{background:'#011901'}}>
                {m.team1} x {m.team2} — {formatDate(m.match_date)}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
          <div>
            <label style={{ color:C.textMuted, fontSize:10, fontWeight:700, display:'block', marginBottom:4 }}>Nº IMG MOBILE</label>
            <input type="number" placeholder="ex: 30" value={form.img_mobile}
              onChange={e=>setForm(f=>({...f,img_mobile:e.target.value}))}
              style={{ width:'100%', padding:'8px 10px', background:'rgba(255,255,255,0.08)', border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:12, outline:'none', boxSizing:'border-box' }}/>
            <div style={{ color:C.textMuted, fontSize:9, marginTop:3 }}>banner_30.png</div>
          </div>
          <div>
            <label style={{ color:C.textMuted, fontSize:10, fontWeight:700, display:'block', marginBottom:4 }}>Nº IMG DESKTOP</label>
            <input type="number" placeholder="ex: 31" value={form.img_desktop}
              onChange={e=>setForm(f=>({...f,img_desktop:e.target.value}))}
              style={{ width:'100%', padding:'8px 10px', background:'rgba(255,255,255,0.08)', border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:12, outline:'none', boxSizing:'border-box' }}/>
            <div style={{ color:C.textMuted, fontSize:9, marginTop:3 }}>banner_31.png</div>
          </div>
        </div>

        <button onClick={add} disabled={saving}
          style={{ width:'100%', padding:'10px', background:C.gold, color:'#000', border:'none', borderRadius:8, fontWeight:900, fontSize:12, cursor:'pointer' }}>
          {saving ? 'Salvando...' : '✓ Adicionar Banner'}
        </button>
      </div>

      <div style={{ color:C.textMuted, fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>
        Banners Ativos ({banners.length})
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:40, color:C.textMuted }}>Carregando...</div>
      ) : banners.length === 0 ? (
        <div style={{ textAlign:'center', padding:32, color:C.textMuted }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🖼️</div>
          <p>Nenhum banner cadastrado.</p>
        </div>
      ) : banners.map(b => (
        <div key={b.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 14px', marginBottom:8, display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ flex:1 }}>
            <div style={{ color:C.text, fontWeight:800, fontSize:13 }}>
              {b.matches?.team1} x {b.matches?.team2}
            </div>
            <div style={{ color:C.textMuted, fontSize:10, marginTop:3 }}>
              📱 banner_{b.img_mobile}.png · 🖥️ banner_{b.img_desktop}.png
            </div>
          </div>
          <button onClick={()=>remove(b.id)}
            style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:8, padding:'8px', cursor:'pointer', flexShrink:0 }}>
            🗑️
          </button>
        </div>
      ))}
    </div>
  )
}

// ── ADMIN PRINCIPAL ───────────────────────────────────────────────────────────
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
      const{data:kp}=await supabase.from('knockout_predictions').select('points').eq('participant_id',p.id).not('points','is',null)
      const all=[...(pr||[]),...(kp||[])]
      const total=all.reduce((s,x)=>s+(x.points||0),0)
      const exact=all.filter(x=>x.points===3).length
      const result=all.filter(x=>x.points===1).length
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
          {[{id:'results',label:'🎯 Grupos'},{id:'knockout',label:'⚔️ Mata-Mata'},{id:'participants',label:'👥 Participantes'},{id:'banners',label:'🖼️ Banners'}].map(t=>(
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
        {tab==='banners'&&<BannersTab/>}
      </main>
    </div>
  )
}
