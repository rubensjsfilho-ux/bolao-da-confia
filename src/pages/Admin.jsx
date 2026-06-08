import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { GROUP_MATCHES, getFlag, formatDate } from '../data/matches'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'

// Fundo e cores do painel — tudo inline para garantir contraste
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
function MatchRow({ match, onSave, onFinish, onReset }){
  const [s1,setS1]=useState(match.score1??'')
  const [s2,setS2]=useState(match.score2??'')
  const [saving,setSaving]=useState(false)
  const [finishing,setFinishing]=useState(false)
  const [resetting,setResetting]=useState(false)
  const [saved,setSaved]=useState(false)

  const save = async()=>{
    if(s1===''||s2==='')return
    setSaving(true)
    await onSave(match.id,parseInt(s1),parseInt(s2))
    setSaving(false);setSaved(true)
    setTimeout(()=>setSaved(false),2500)
  }

  const finish = async()=>{
    if(s1===''||s2==='')return
    if(!window.confirm(`Encerrar ${match.team1} ${s1} x ${s2} ${match.team2}? Isso calculará a pontuação dos participantes.`))return
    setFinishing(true)
    await onFinish(match.id,parseInt(s1),parseInt(s2))
    setFinishing(false)
  }

  const reset = async()=>{
    if(!window.confirm(`Resetar ${match.team1} x ${match.team2}? O placar e a pontuação serão zerados.`))return
    setResetting(true)
    await onReset(match.id)
    setResetting(false)
    setS1('');setS2('')
  }

  return(
    <div style={{ background:C.card, border:`1px solid ${match.is_finished?C.green:C.border}`, borderRadius:12, padding:'12px 14px', marginBottom:10 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
        <span style={{ color:C.textMuted, fontSize:10 }}>Grupo {match.group} · {formatDate(match.date)}</span>
        {match.is_finished
          ? <span style={{ color:C.green, fontSize:10, fontWeight:800 }}>✓ Encerrado</span>
          : match.score1!==null&&match.score2!==null
            ? <span style={{ color:C.gold, fontSize:10, fontWeight:800 }}>⏱ Em andamento</span>
            : null
        }
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:20 }}>{getFlag(match.team1)}</span>
        <span style={{ flex:1, color:C.text, fontSize:12, fontWeight:700 }}>{match.team1}</span>
        <input type="number" min="0" max="20" value={s1} onChange={e=>setS1(e.target.value)}
          disabled={match.is_finished}
          style={{ width:48, height:40, background:'rgba(255,255,255,0.1)', border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:20, fontWeight:900, textAlign:'center', outline:'none', opacity:match.is_finished?.5:1 }}/>
        <span style={{ color:C.textMuted, fontWeight:900 }}>×</span>
        <input type="number" min="0" max="20" value={s2} onChange={e=>setS2(e.target.value)}
          disabled={match.is_finished}
          style={{ width:48, height:40, background:'rgba(255,255,255,0.1)', border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:20, fontWeight:900, textAlign:'center', outline:'none', opacity:match.is_finished?.5:1 }}/>
        <span style={{ flex:1, color:C.text, fontSize:12, fontWeight:700, textAlign:'right' }}>{match.team2}</span>
        <span style={{ fontSize:20 }}>{getFlag(match.team2)}</span>
      </div>
      <div style={{ display:'flex', justifyContent:'flex-end', gap:6, marginTop:10 }}>
        {match.is_finished ? (
          <button onClick={reset} disabled={resetting}
            style={{ background:'rgba(220,53,69,0.15)', color:'#ff6b6b', border:'1px solid rgba(220,53,69,0.3)', borderRadius:8, padding:'7px 14px', fontWeight:900, fontSize:11, cursor:'pointer' }}>
            {resetting?'Resetando...':'↩ Resetar'}
          </button>
        ) : (
          <>
            <button onClick={save} disabled={s1===''||s2===''||saving}
              style={{ background:'rgba(255,255,255,0.1)', color:saved?C.green:C.text, border:`1px solid ${C.border}`, borderRadius:8, padding:'7px 14px', fontWeight:900, fontSize:11, cursor:'pointer', opacity:(s1===''||s2==='')?0.4:1 }}>
              {saving?'Salvando...' : saved?'✓ Salvo!':'💾 Salvar placar'}
            </button>
            <button onClick={finish} disabled={s1===''||s2===''||finishing}
              style={{ background:C.gold, color:'#000', border:'none', borderRadius:8, padding:'7px 14px', fontWeight:900, fontSize:11, cursor:'pointer', opacity:(s1===''||s2==='')?0.4:1 }}>
              {finishing?'Encerrando...':'✓ Encerrar'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ── Aba de resultados ─────────────────────────────────────────────────────────
function ResultsTab({ matches, loading, onSave, onFinish, onReset }){
  const [group,setGroup]=useState('all')
  const [showDone,setShowDone]=useState(false)
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
      {/* Resumo */}
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

      {/* Filtro de grupos */}
      <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:8, marginBottom:8 }}>
        {groups.map(g=>(
          <button key={g} onClick={()=>setGroup(g)} style={{
            flexShrink:0, width:36, height:32, borderRadius:8, border:'none', fontWeight:800, fontSize:11, cursor:'pointer',
            background: group===g ? 'rgba(245,166,35,0.2)' : 'rgba(255,255,255,0.08)',
            color: group===g ? C.gold : C.textMuted,
          }}>{g==='all'?'✦':g}</button>
        ))}
      </div>

      {/* Toggle encerrados */}
      <label style={{ display:'flex', alignItems:'center', gap:8, color:C.textMuted, fontSize:13, marginBottom:14, cursor:'pointer' }}>
        <input type="checkbox" checked={showDone} onChange={e=>setShowDone(e.target.checked)}/>
        Mostrar encerrados ({done})
      </label>

      {loading ? (
        <div style={{ textAlign:'center', padding:40, color:C.textMuted }}>⚽ Carregando...</div>
      ) : filtered.length===0 ? (
        <div style={{ textAlign:'center', padding:40, color:C.textMuted }}>
          <div style={{ fontSize:40, marginBottom:8 }}>✅</div>
          <p>Nenhum jogo pendente neste grupo.</p>
        </div>
      ) : filtered.map(m=><MatchRow key={m.id} match={m} onSave={onSave} onFinish={onFinish} onReset={onReset}/>)}
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
        setMsg(`❌ Erro: ${err.message} — verifique as policies no Supabase.`)
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
          {/* Posição */}
          <span style={{ width:24, textAlign:'center', color:C.gold, fontWeight:900, fontSize:13, flexShrink:0 }}>
            {i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}º`}
          </span>
          {/* Avatar */}
          <div style={{ width:36,height:36,borderRadius:'50%',background:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0,overflow:'hidden' }}>
            {p.avatar_url
              ?<img src={p.avatar_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>{e.target.style.display='none'}}/>
              :<span>{p.avatar_emoji||'⚽'}</span>}
          </div>
          {/* Info */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ color:C.text, fontWeight:800, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</div>
            <div style={{ color:C.textMuted, fontSize:10, marginTop:2 }}>
              ⚡{p.exact_hits||0} exatos · ✓{p.result_hits||0} result.
            </div>
          </div>
          {/* Pontos */}
          <div style={{ textAlign:'right', flexShrink:0, marginRight:6 }}>
            <div style={{ color:C.gold, fontWeight:900, fontSize:20 }}>{p.total_points||0}</div>
            <div style={{ color:C.textMuted, fontSize:9 }}>pts</div>
          </div>
          {/* Botão remover */}
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
              style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:8, padding:'8px', cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              🗑️
            </button>
          )}
        </div>
      ))}

      {parts.length===0&&(
        <div style={{ textAlign:'center', padding:48, color:C.textMuted }}>
          <div style={{ fontSize:40, marginBottom:8 }}>👥</div>
          <p>Nenhum participante ainda.</p>
        </div>
      )}
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
const ALL_TEAMS = ['Brasil','Argentina','França','Alemanha','Espanha','Portugal','Inglaterra','Holanda','Bélgica','Itália','México','Estados Unidos','Uruguai','Japão','Canadá','Austrália','Coreia do Sul','Marrocos','Senegal','Egito','Escócia','Croácia','Suíça','Áustria','Noruega','Turquia','Irã','Colômbia','Paraguai','Gana','Panamá','Argélia','Uzbequistão','Catar','Tunísia','Haiti','África do Sul','Cabo Verde','Equador','Costa do Marfim','Curaçao','RD Congo']

function KnockoutTab() {
  const [activeRound, setActiveRound] = useState('r2')
  const [matches, setMatches] = useState({})
  const [saving, setSaving] = useState({})
  const [msg, setMsg] = useState('')

  useEffect(() => {
    supabase.from('bracket_matches').select('*').then(({ data }) => {
      const map = {}
      data?.forEach(m => { map[m.id] = m })
      setMatches(map)
    })
  }, [])

  const save = async (id, field, value) => {
    setSaving(s => ({...s, [id]:true}))
    const current = matches[id] || { id, round: id.split('_')[0], position: parseInt(id.split('_')[1]) }
    const updated = { ...current, [field]: value }
    if (matches[id]) {
      await supabase.from('bracket_matches').update({ [field]: value, updated_at: new Date().toISOString() }).eq('id', id)
    } else {
      await supabase.from('bracket_matches').insert([updated])
    }
    setMatches(m => ({ ...m, [id]: updated }))

    // Calcular pontos dos palpites se encerrado
    if (field === 'is_finished' && value === true) {
      const m = updated
      if (m.score1 !== null && m.score2 !== null) {
        const { data: preds } = await supabase.from('knockout_predictions').select('id,participant_id,score1,score2').eq('match_id', id)
        for (const p of preds || []) {
          const pts = p.score1===m.score1&&p.score2===m.score2 ? 3 : Math.sign(p.score1-p.score2)===Math.sign(m.score1-m.score2) ? 1 : 0
          await supabase.from('knockout_predictions').update({ points: pts }).eq('id', p.id)
          const { data: part } = await supabase.from('participants').select('total_points').eq('id', p.participant_id).single()
          if (part) await supabase.from('participants').update({ total_points: (part.total_points||0) + pts }).eq('id', p.participant_id)
        }
        setMsg('✅ Resultado salvo e pontos calculados!')
        setTimeout(() => setMsg(''), 3000)
      }
    }
    setSaving(s => ({...s, [id]:false}))
  }

  const roundMatches = Array.from({ length: KO_ROUNDS.find(r=>r.id===activeRound)?.count || 0 }, (_,i) => {
    const id = `${activeRound}_${i+1}`
    return { id, label: `${KO_ROUNDS.find(r=>r.id===activeRound)?.label} ${i+1}` }
  })

  return (
    <div>
      {msg && <div style={{ background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.3)', borderRadius:10, padding:'10px 14px', marginBottom:12, color:C.green, fontSize:12 }}>{msg}</div>}
      <p style={{ color:C.textMuted, fontSize:11, marginBottom:12 }}>Preencha os times de cada confronto. Quando um jogo terminar, insira o placar e marque como encerrado.</p>

      {/* Abas de rodada */}
      <div style={{ display:'flex', gap:5, marginBottom:14, overflowX:'auto' }}>
        {KO_ROUNDS.map(r => (
          <button key={r.id} onClick={() => setActiveRound(r.id)} style={{
            flexShrink:0, padding:'6px 12px', border:'none', borderRadius:8,
            fontWeight:800, fontSize:11, cursor:'pointer', fontFamily:'Nunito,sans-serif',
            background: activeRound===r.id ? C.gold : 'rgba(255,255,255,0.08)',
            color: activeRound===r.id ? '#000' : C.textMuted,
          }}>{r.label}</button>
        ))}
      </div>

      {roundMatches.map(m => {
        const db = matches[m.id] || {}
        return (
          <div key={m.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 14px', marginBottom:10 }}>
            <div style={{ color:C.gold, fontWeight:800, fontSize:11, marginBottom:10 }}>{m.label}</div>

            {/* Time 1 */}
            <div style={{ marginBottom:8 }}>
              <label style={{ color:C.textMuted, fontSize:10, fontWeight:700, display:'block', marginBottom:4 }}>Time 1</label>
              <select value={db.team1||''} onChange={e => save(m.id,'team1',e.target.value)}
                style={{ width:'100%', padding:'8px 10px', background:'rgba(255,255,255,0.08)', border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:13, outline:'none' }}>
                <option value="">Selecionar...</option>
                {ALL_TEAMS.map(t => <option key={t} value={t} style={{background:'#011901'}}>{t}</option>)}
              </select>
            </div>

            {/* Time 2 */}
            <div style={{ marginBottom:10 }}>
              <label style={{ color:C.textMuted, fontSize:10, fontWeight:700, display:'block', marginBottom:4 }}>Time 2</label>
              <select value={db.team2||''} onChange={e => save(m.id,'team2',e.target.value)}
                style={{ width:'100%', padding:'8px 10px', background:'rgba(255,255,255,0.08)', border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:13, outline:'none' }}>
                <option value="">Selecionar...</option>
                {ALL_TEAMS.map(t => <option key={t} value={t} style={{background:'#011901'}}>{t}</option>)}
              </select>
            </div>

            {/* Placar (só se tiver times) */}
            {db.team1 && db.team2 && (
              <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}>
                <input type="number" min="0" max="20" placeholder="0" value={db.score1??''}
                  onChange={e => save(m.id,'score1',parseInt(e.target.value))}
                  style={{ width:52, height:40, background:'rgba(255,255,255,0.1)', border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:20, fontWeight:900, textAlign:'center', outline:'none' }}/>
                <span style={{ color:C.textMuted, fontWeight:900 }}>×</span>
                <input type="number" min="0" max="20" placeholder="0" value={db.score2??''}
                  onChange={e => save(m.id,'score2',parseInt(e.target.value))}
                  style={{ width:52, height:40, background:'rgba(255,255,255,0.1)', border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:20, fontWeight:900, textAlign:'center', outline:'none' }}/>
                <label style={{ display:'flex', alignItems:'center', gap:6, color:C.textMuted, fontSize:11, fontWeight:700, cursor:'pointer', marginLeft:8 }}>
                  <input type="checkbox" checked={db.is_finished||false} onChange={e => save(m.id,'is_finished',e.target.checked)}/>
                  Encerrado
                </label>
              </div>
            )}

            {saving[m.id] && <div style={{ color:C.gold, fontSize:10 }}>Salvando...</div>}
          </div>
        )
      })}
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

  const auth=(e)=>{
    e.preventDefault()
    if(pwd===ADMIN_PASSWORD){setAuthed(true);loadMatches()}
    else setPwdErr('Senha incorreta.')
  }

  const loadMatches=async()=>{
    setLoading(true)
    const{data}=await supabase.from('matches').select('*').order('match_date')
    setMatches(data||[])
    setLoading(false)
  }

  // Só salva o placar parcial, sem encerrar nem pontuar
  const saveResult=async(matchId,score1,score2)=>{
    await supabase.from('matches').update({score1,score2}).eq('id',matchId)
    setMatches(prev=>prev.map(m=>m.id===matchId?{...m,score1,score2}:m))
  }

  // Encerra a partida e calcula pontuação
  const finishMatch=async(matchId,score1,score2)=>{
    await supabase.from('matches').update({score1,score2,is_finished:true}).eq('id',matchId)
    const{data:preds}=await supabase.from('predictions').select('id,score1,score2').eq('match_id',matchId)
    for(const p of preds||[]){
      await supabase.from('predictions').update({points:calcPoints(p.score1,p.score2,score1,score2)}).eq('id',p.id)
    }
    setMatches(prev=>prev.map(m=>m.id===matchId?{...m,score1,score2,is_finished:true}:m))
    await recalcTotals()
  }

  // Reseta placar, reabre partida e zera pontos dos palpites
  const resetMatch=async(matchId)=>{
    await supabase.from('matches').update({score1:null,score2:null,is_finished:false}).eq('id',matchId)
    await supabase.from('predictions').update({points:null}).eq('match_id',matchId)
    setMatches(prev=>prev.map(m=>m.id===matchId?{...m,score1:null,score2:null,is_finished:false}:m))
    await recalcTotals()
  }

  const recalcTotals=async()=>{
    const{data:ps}=await supabase.from('participants').select('id')
    for(const p of ps||[]){
      const{data:pr}=await supabase.from('predictions').select('points,score1,score2').eq('participant_id',p.id).not('points','is',null)
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

  // ── LOGIN ──────────────────────────────────────────────────────────────────
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

  // ── PAINEL ─────────────────────────────────────────────────────────────────
  return(
    <div style={{ minHeight:'100vh', background:C.bg }}>
      {/* Header */}
      <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:50, background:C.header, borderBottom:`1px solid ${C.border}`, padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ color:C.gold, fontWeight:900, fontSize:18 }}>🏆 ADMIN · COPA 2026</span>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {recalcMsg&&<span style={{ color:C.green, fontSize:11 }}>{recalcMsg}</span>}
          <button onClick={fullRecalc} style={{ background:'rgba(255,255,255,0.08)', border:`1px solid ${C.border}`, color:C.textMuted, borderRadius:8, padding:'6px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>↺ Recalcular</button>
        </div>
      </div>

      <main style={{ paddingTop:64, paddingBottom:32, padding:'72px 16px 32px', maxWidth:520, margin:'0 auto' }}>
        {/* Abas */}
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

        {tab==='results'&&<ResultsTab matches={matches} loading={loading} onSave={saveResult} onFinish={finishMatch} onReset={resetMatch}/>}
        {tab==='knockout'&&<KnockoutTab/>}
        {tab==='participants'&&<ParticipantsTab/>}
      </main>
    </div>
  )
}