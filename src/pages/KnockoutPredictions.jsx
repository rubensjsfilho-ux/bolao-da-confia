import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import Header from '../components/Header'
import { Check, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

const FLAGS = {
  'Brasil':'🇧🇷','Argentina':'🇦🇷','França':'🇫🇷','Alemanha':'🇩🇪','Espanha':'🇪🇸',
  'Portugal':'🇵🇹','Inglaterra':'🏴','Holanda':'🇳🇱','Bélgica':'🇧🇪','México':'🇲🇽',
  'Estados Unidos':'🇺🇸','Uruguai':'🇺🇾','Japão':'🇯🇵','Canadá':'🇨🇦','Austrália':'🇦🇺',
  'Coreia do Sul':'🇰🇷','Marrocos':'🇲🇦','Senegal':'🇸🇳','Egito':'🇪🇬','Escócia':'🏴',
  'Croácia':'🇭🇷','Suíça':'🇨🇭','Áustria':'🇦🇹','Noruega':'🇳🇴','Turquia':'🇹🇷',
  'Irã':'🇮🇷','Colômbia':'🇨🇴','Paraguai':'🇵🇾','Gana':'🇬🇭','Panamá':'🇵🇦',
  'Argélia':'🇩🇿','Uzbequistão':'🇺🇿','Catar':'🇶🇦','Tunísia':'🇹🇳','Haiti':'🇭🇹',
}
const getFlag = t => FLAGS[t] || '🏳️'

const ROUNDS = [
  { id:'r2',  label:'2ª Fase',         short:'2ª Fase',  matchCount:16 },
  { id:'r16', label:'Oitavas de Final', short:'Oitavas',  matchCount:8  },
  { id:'qf',  label:'Quartas de Final', short:'Quartas',  matchCount:4  },
  { id:'sf',  label:'Semifinais',       short:'Semis',    matchCount:2  },
  { id:'f',   label:'Final',            short:'Final',    matchCount:2  },
]

function KnockoutMatchCard({ match, dbMatch, prediction, onSave, participantId }) {
  const [s1,setS1]       = useState(prediction?.score1??'')
  const [s2,setS2]       = useState(prediction?.score2??'')
  const [saving,setSaving] = useState(false)
  const [saved,setSaved]   = useState(false)
  const [open,setOpen]     = useState(false)

  const team1    = dbMatch?.team1
  const team2    = dbMatch?.team2
  const hasTeams = team1 && team2
  const isLocked = dbMatch?.is_finished
  const hasPred  = prediction !== null && prediction !== undefined
  const isFinal  = match.label?.includes('FINAL') || match.label?.includes('3º')

  const formatDate = (d) => {
    if (!d) return ''
    const dt = new Date(d)
    return dt.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',timeZone:'America/Sao_Paulo'}) +
      ' · ' + dt.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',timeZone:'America/Sao_Paulo'})
  }

  const handleSave = async () => {
    if (s1===''||s2===''||!participantId) return
    setSaving(true)
    try {
      const payload = { participant_id:participantId, match_id:match.id, score1:parseInt(s1), score2:parseInt(s2), updated_at:new Date().toISOString() }
      if (hasPred) await supabase.from('knockout_predictions').update({ score1:parseInt(s1), score2:parseInt(s2), updated_at:new Date().toISOString() }).eq('participant_id',participantId).eq('match_id',match.id)
      else         await supabase.from('knockout_predictions').insert([payload])
      setSaved(true); setTimeout(()=>{ setSaved(false); setOpen(false) },1500); onSave?.()
    } catch(e){ console.error(e) }
    setSaving(false)
  }

  let borderColor, statusText, statusColor
  if (isLocked)       { borderColor='#E2EAF0'; statusText='🔒 Encerrado';  statusColor='#9BABB8' }
  else if (!hasTeams) { borderColor='#E2EAF0'; statusText='⏳ Indefinido'; statusColor='#9BABB8' }
  else if (hasPred)   { borderColor='rgba(0,150,57,0.3)'; statusText='✓ Palpitado'; statusColor='#009639' }
  else                { borderColor='rgba(245,166,35,0.5)'; statusText='⚡ Palpitar'; statusColor='#D4890A' }

  return (
    <div style={{ background:'#fff', borderRadius:12, border:`1.5px solid ${borderColor}`, marginBottom:8, overflow:'hidden', boxShadow:'0 1px 6px rgba(0,40,85,0.06)' }}>
      <div onClick={()=>hasTeams&&!isLocked&&setOpen(o=>!o)}
        style={{ padding:'12px 14px', display:'flex', alignItems:'center', gap:10, cursor:hasTeams&&!isLocked?'pointer':'default' }}>

        <div style={{ flex:1, minWidth:0 }}>
          {isFinal && <div style={{ fontSize:9, fontWeight:900, color:'#F5A623', letterSpacing:1, textTransform:'uppercase', marginBottom:4 }}>{match.label}</div>}
          {/* Time 1 */}
          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:6 }}>
            <span style={{ fontSize:22 }}>{team1?getFlag(team1):'🏳️'}</span>
            <span style={{ fontSize:13, fontWeight:800, color:team1?'#002855':'#9BABB8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {team1||(match.info?.split(' × ')[0]||'A definir')}
            </span>
          </div>
          {/* Time 2 */}
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <span style={{ fontSize:22 }}>{team2?getFlag(team2):'🏳️'}</span>
            <span style={{ fontSize:13, fontWeight:800, color:team2?'#002855':'#9BABB8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {team2||(match.info?.split(' × ')[1]||'A definir')}
            </span>
          </div>
          {match.date && <div style={{ color:'#9BABB8', fontSize:9, marginTop:6 }}>📍 {match.city} · {formatDate(match.date)}</div>}
        </div>

        {hasPred && !open && (
          <div style={{ background:statusColor==='#009639'?'rgba(0,150,57,0.08)':'#F4F6F9', border:`1px solid ${statusColor==='#009639'?'rgba(0,150,57,0.2)':'#E2EAF0'}`, borderRadius:10, padding:'6px 14px', textAlign:'center', flexShrink:0 }}>
            <div style={{ color:'#002855', fontWeight:900, fontSize:20 }}>{prediction.score1} × {prediction.score2}</div>
          </div>
        )}

        <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
          <span style={{ color:statusColor, fontWeight:800, fontSize:10 }}>{statusText}</span>
          {hasTeams&&!isLocked&&(open?<ChevronUp size={14} color="#9BABB8"/>:<ChevronDown size={14} color="#9BABB8"/>)}
        </div>
      </div>

      {open&&hasTeams&&!isLocked&&(
        <div style={{ borderTop:'1px solid #F0F4F8', padding:'14px', background:'#FAFBFC' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
            <div style={{ flex:1, textAlign:'center' }}>
              <div style={{ fontSize:28, marginBottom:4 }}>{getFlag(team1)}</div>
              <div style={{ fontSize:11, fontWeight:700, color:'#002855', marginBottom:8 }}>{team1}</div>
              <input type="number" min="0" max="20" value={s1} onChange={e=>setS1(e.target.value)}
                style={{ width:60, height:52, background:'#fff', border:'1.5px solid #E2EAF0', borderRadius:12, fontSize:24, fontWeight:900, textAlign:'center', color:'#002855', outline:'none', fontFamily:'Nunito,sans-serif', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}/>
            </div>
            <div style={{ color:'#C8D5E0', fontWeight:900, fontSize:24 }}>×</div>
            <div style={{ flex:1, textAlign:'center' }}>
              <div style={{ fontSize:28, marginBottom:4 }}>{getFlag(team2)}</div>
              <div style={{ fontSize:11, fontWeight:700, color:'#002855', marginBottom:8 }}>{team2}</div>
              <input type="number" min="0" max="20" value={s2} onChange={e=>setS2(e.target.value)}
                style={{ width:60, height:52, background:'#fff', border:'1.5px solid #E2EAF0', borderRadius:12, fontSize:24, fontWeight:900, textAlign:'center', color:'#002855', outline:'none', fontFamily:'Nunito,sans-serif', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}/>
            </div>
          </div>
          <button onClick={handleSave} disabled={s1===''||s2===''||saving}
            style={{ width:'100%', background:saved?'#009639':'#002855', color:'#fff', border:'none', borderRadius:10, padding:'12px', fontWeight:900, fontSize:14, cursor:'pointer', fontFamily:'Nunito,sans-serif', opacity:s1===''||s2===''?0.4:1 }}>
            {saving?'Salvando...':saved?'✓ Salvo!':hasPred?'Atualizar Palpite':'Confirmar Palpite'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function KnockoutPredictions({ participant, onLogout }) {
  const [activeRound,setActiveRound] = useState('r2')
  const [dbMatches,  setDbMatches]   = useState({})
  const [predictions,setPredictions] = useState({})
  const [loading,    setLoading]     = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const [matchRes, predRes] = await Promise.all([
      supabase.from('bracket_matches').select('*'),
      participant?.id ? supabase.from('knockout_predictions').select('*').eq('participant_id',participant.id) : { data:[] }
    ])
    const mmap={}; matchRes.data?.forEach(m=>{mmap[m.id]=m}); setDbMatches(mmap)
    const pmap={}; predRes.data?.forEach(p=>{pmap[p.match_id]=p}); setPredictions(pmap)
    setLoading(false)
  }, [participant?.id])

  useEffect(()=>{ load() },[load])

  const current = ROUNDS.find(r=>r.id===activeRound)
  const roundMatches = Array.from({ length:current.matchCount },(_,i) => {
    const id = `${activeRound}_${i+1}`
    const staticInfo = {
      r2:[
        {city:'Los Angeles',date:'2026-06-28T19:00:00Z',info:'1º A × 2º B'},
        {city:'Kansas City',date:'2026-06-28T22:00:00Z',info:'1º C × 2º D'},
        {city:'Boston',date:'2026-06-29T17:30:00Z',info:'1º E × 3º ABCDF'},
        {city:'Monterrey',date:'2026-06-29T22:00:00Z',info:'1º F × 2º C'},
        {city:'Dallas',date:'2026-06-30T16:00:00Z',info:'2º D × 3º ABCEG'},
        {city:'Nova York/NJ',date:'2026-06-30T18:00:00Z',info:'1º I × 3º CDFGH'},
        {city:'Seattle',date:'2026-07-01T16:00:00Z',info:'1º G × 3º ABCIJ'},
        {city:'Guadalajara',date:'2026-07-01T19:00:00Z',info:'1º H × 2º E'},
        {city:'Vancouver',date:'2026-07-01T22:00:00Z',info:'2º I × 3º DFGHJ'},
        {city:'Filadélfia',date:'2026-07-02T16:00:00Z',info:'1º B × 2º A'},
        {city:'Miami',date:'2026-07-02T19:00:00Z',info:'1º J × 2º F'},
        {city:'Cidade do México',date:'2026-07-02T22:00:00Z',info:'2º G × 3º EGHIKL'},
        {city:'Atlanta',date:'2026-07-03T16:00:00Z',info:'1º K × 2º J'},
        {city:'Houston',date:'2026-07-03T19:00:00Z',info:'2º H × 3º BCDIL'},
        {city:'Toronto',date:'2026-07-03T22:00:00Z',info:'1º D × 2º K'},
        {city:'San Francisco',date:'2026-07-04T16:00:00Z',info:'2º L × 1º L'},
      ],
      r16:[
        {city:'Filadélfia',date:'2026-07-04T21:00:00Z'},{city:'Houston',date:'2026-07-04T17:00:00Z'},
        {city:'Nova York/NJ',date:'2026-07-05T17:00:00Z'},{city:'Seattle',date:'2026-07-05T21:00:00Z'},
        {city:'Dallas',date:'2026-07-06T16:00:00Z'},{city:'Los Angeles',date:'2026-07-06T21:00:00Z'},
        {city:'Vancouver',date:'2026-07-07T16:00:00Z'},{city:'Kansas City',date:'2026-07-07T21:00:00Z'},
      ],
      qf:[
        {city:'Boston',date:'2026-07-09T20:00:00Z'},{city:'Los Angeles',date:'2026-07-09T16:00:00Z'},
        {city:'Miami',date:'2026-07-10T21:00:00Z'},{city:'Kansas City',date:'2026-07-11T21:00:00Z'},
      ],
      sf:[{city:'Dallas',date:'2026-07-14T20:00:00Z'},{city:'Atlanta',date:'2026-07-15T20:00:00Z'}],
      f:[{city:'Miami',date:'2026-07-18T21:00:00Z',label:'🥉 3º Lugar'},{city:'Nova Jersey',date:'2026-07-19T20:00:00Z',label:'🏆 FINAL'}],
    }
    const info = staticInfo[activeRound]?.[i]||{}
    return { id, ...info, label:info.label||`${current.short} ${i+1}` }
  })

  const totalPreds = ROUNDS.reduce((acc,r)=>acc+Array.from({length:r.matchCount},(_,i)=>`${r.id}_${i+1}`).filter(id=>predictions[id]&&dbMatches[id]?.team1).length,0)
  const totalAvail  = Object.keys(dbMatches).filter(id=>dbMatches[id]?.team1&&!dbMatches[id]?.is_finished).length

  return (
    <div style={{ minHeight:'100vh', background:'#F4F6F9', paddingBottom:80 }}>
      <Header participant={participant} onLogout={onLogout}/>

      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#002855 0%,#4a1080 100%)', padding:'70px 16px 20px' }}>
        <div style={{ color:'rgba(255,255,255,0.5)', fontSize:9, fontWeight:800, letterSpacing:3, textTransform:'uppercase', marginBottom:4 }}>Copa do Mundo 2026</div>
        <h1 style={{ color:'#fff', fontWeight:900, fontSize:24, margin:'0 0 4px', letterSpacing:-0.5, textTransform:'uppercase' }}>PALPITES · MATA-MATA</h1>
        <div style={{ width:40, height:3, background:'#F5A623', borderRadius:2, marginBottom:14 }}/>
        {totalAvail>0&&(
          <div style={{ display:'flex', gap:8 }}>
            {[[totalPreds,'Feitos','#F5A623'],[totalAvail-totalPreds,'Pendentes','#4ade80'],[totalAvail,'Disponíveis','#93c5fd']].map(([v,l,c])=>(
              <div key={l} style={{ background:'rgba(255,255,255,0.1)', borderRadius:10, padding:'8px 10px', textAlign:'center', flex:1 }}>
                <div style={{ color:c, fontWeight:900, fontSize:18 }}>{v}</div>
                <div style={{ color:'rgba(255,255,255,0.4)', fontSize:9, textTransform:'uppercase', letterSpacing:.5, marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Abas de rodada */}
      <div style={{ background:'#002855', borderBottom:'1px solid rgba(255,255,255,0.1)', padding:'10px 10px', display:'flex', gap:6, overflowX:'auto', position:'sticky', top:58, zIndex:30 }}>
        {ROUNDS.map(r=>{
          const rPreds=Array.from({length:r.matchCount},(_,i)=>`${r.id}_${i+1}`).filter(id=>predictions[id]&&dbMatches[id]?.team1).length
          const rAvail=Array.from({length:r.matchCount},(_,i)=>`${r.id}_${i+1}`).filter(id=>dbMatches[id]?.team1).length
          const active=activeRound===r.id
          return (
            <button key={r.id} onClick={()=>setActiveRound(r.id)} style={{
              flexShrink:0, padding:'8px 14px', border:'none', borderRadius:20,
              fontWeight:800, fontSize:11, cursor:'pointer', fontFamily:'Nunito,sans-serif',
              background: active?'#F5A623':'rgba(255,255,255,0.1)',
              color: active?'#000':'rgba(255,255,255,0.6)',
            }}>
              {r.short}
              {rAvail>0&&<span style={{ marginLeft:4, fontSize:9, opacity:.7 }}>{rPreds}/{rAvail}</span>}
            </button>
          )
        })}
      </div>

      <main style={{ padding:'14px 12px' }}>
        {loading?(
          <div style={{ textAlign:'center', padding:48 }}>
            <Loader2 size={28} style={{ animation:'spin 1s linear infinite', margin:'0 auto', display:'block', color:'#002855' }}/>
            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
          </div>
        ):(
          <>
            {roundMatches.every(m=>!dbMatches[m.id]?.team1)&&(
              <div style={{ background:'#fff', border:'1px solid #E2EAF0', borderRadius:14, padding:'24px', textAlign:'center', marginBottom:14, boxShadow:'0 1px 6px rgba(0,40,85,0.06)' }}>
                <div style={{ fontSize:36, marginBottom:8 }}>⏳</div>
                <div style={{ color:'#002855', fontWeight:800, fontSize:14 }}>Rodada ainda não liberada</div>
                <div style={{ color:'#9BABB8', fontSize:12, marginTop:4 }}>O admin irá preencher os times após a fase anterior.</div>
              </div>
            )}
            {roundMatches.map(m=>(
              <KnockoutMatchCard key={m.id} match={m} dbMatch={dbMatches[m.id]} prediction={predictions[m.id]} participantId={participant?.id} onSave={load}/>
            ))}
          </>
        )}
      </main>
    </div>
  )
}
