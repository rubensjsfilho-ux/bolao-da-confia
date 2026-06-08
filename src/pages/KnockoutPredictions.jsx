import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Header from '../components/Header'
import { Check, Lock, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

const FLAGS = {
  'Brasil':'🇧🇷','Argentina':'🇦🇷','França':'🇫🇷','Alemanha':'🇩🇪','Espanha':'🇪🇸',
  'Portugal':'🇵🇹','Inglaterra':'🏴','Holanda':'🇳🇱','Bélgica':'🇧🇪','Itália':'🇮🇹',
  'México':'🇲🇽','Estados Unidos':'🇺🇸','Uruguai':'🇺🇾','Japão':'🇯🇵','Canadá':'🇨🇦',
  'Austrália':'🇦🇺','Coreia do Sul':'🇰🇷','Marrocos':'🇲🇦','Senegal':'🇸🇳','Egito':'🇪🇬',
  'Escócia':'🏴','Croácia':'🇭🇷','Suíça':'🇨🇭','Áustria':'🇦🇹','Noruega':'🇳🇴',
  'Turquia':'🇹🇷','Irã':'🇮🇷','Colômbia':'🇨🇴','Paraguai':'🇵🇾','Gana':'🇬🇭','Panamá':'🇵🇦',
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

// ── Card de palpite individual ─────────────────────────────────────────────────
function KnockoutMatchCard({ match, dbMatch, prediction, onSave, participantId }) {
  const [s1, setS1] = useState(prediction?.score1 ?? '')
  const [s2, setS2] = useState(prediction?.score2 ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [open, setOpen] = useState(false)

  const team1 = dbMatch?.team1
  const team2 = dbMatch?.team2
  const hasTeams = team1 && team2
  const isLocked = dbMatch?.is_finished
  const hasPred = prediction !== null && prediction !== undefined
  const isFinal = match.label?.includes('FINAL') || match.label?.includes('3º')

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', timeZone:'America/Sao_Paulo' }) +
      ' · ' + d.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit', timeZone:'America/Sao_Paulo' })
  }

  const handleSave = async () => {
    if (s1 === '' || s2 === '' || !participantId) return
    setSaving(true)
    try {
      const data = {
        participant_id: participantId,
        match_id: match.id,
        score1: parseInt(s1),
        score2: parseInt(s2),
        updated_at: new Date().toISOString(),
      }
      if (hasPred) {
        await supabase.from('knockout_predictions')
          .update({ score1: parseInt(s1), score2: parseInt(s2), updated_at: new Date().toISOString() })
          .eq('participant_id', participantId).eq('match_id', match.id)
      } else {
        await supabase.from('knockout_predictions').insert([data])
      }
      setSaved(true)
      setTimeout(() => { setSaved(false); setOpen(false) }, 1500)
      onSave?.()
    } catch (e) {
      console.error(e)
    }
    setSaving(false)
  }

  // Status visual
  let borderColor, statusText, statusColor
  if (isLocked)      { borderColor='#E2EAF0'; statusText='🔒 Encerrado';  statusColor='#9BABB8' }
  else if (!hasTeams){ borderColor='#E2EAF0'; statusText='⏳ Indefinido'; statusColor='#9BABB8' }
  else if (hasPred)  { borderColor='rgba(0,150,57,0.3)'; statusText='✓ Palpitado'; statusColor='#009639' }
  else               { borderColor='rgba(245,166,35,0.4)'; statusText='⚡ Palpitar'; statusColor='#D4890A' }

  return (
    <div style={{ background:'#fff', borderRadius:14, border:`1.5px solid ${borderColor}`, marginBottom:8, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,40,85,0.06)' }}>
      {/* Header clicável */}
      <div onClick={() => hasTeams && !isLocked && setOpen(o => !o)}
        style={{ padding:'10px 14px', display:'flex', alignItems:'center', gap:8, cursor: hasTeams && !isLocked ? 'pointer' : 'default' }}>

        {/* Times */}
        <div style={{ flex:1, minWidth:0 }}>
          {isFinal && <div style={{ fontSize:9, fontWeight:900, color:'#F5A623', letterSpacing:1, textTransform:'uppercase', marginBottom:3 }}>{match.label}</div>}
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:18 }}>{team1 ? getFlag(team1) : '🏳️'}</span>
            <span style={{ fontSize:11, fontWeight:700, color: team1 ? '#002855' : '#9BABB8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {team1 || (match.info?.split(' × ')[0] || 'A definir')}
            </span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:3 }}>
            <span style={{ fontSize:18 }}>{team2 ? getFlag(team2) : '🏳️'}</span>
            <span style={{ fontSize:11, fontWeight:700, color: team2 ? '#002855' : '#9BABB8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {team2 || (match.info?.split(' × ')[1] || 'A definir')}
            </span>
          </div>
          {match.date && <div style={{ color:'#9BABB8', fontSize:9, marginTop:4 }}>📍 {match.city} · {formatDate(match.date)}</div>}
        </div>

        {/* Palpite atual se existir */}
        {hasPred && !open && (
          <div style={{ background:'rgba(0,150,57,0.08)', borderRadius:8, padding:'4px 10px', textAlign:'center', flexShrink:0 }}>
            <div style={{ color:'#002855', fontWeight:900, fontSize:16 }}>{prediction.score1} × {prediction.score2}</div>
          </div>
        )}

        {/* Status + seta */}
        <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
          <span style={{ color:statusColor, fontWeight:800, fontSize:10 }}>{statusText}</span>
          {hasTeams && !isLocked && (open ? <ChevronUp size={14} color="#9BABB8"/> : <ChevronDown size={14} color="#9BABB8"/>)}
        </div>
      </div>

      {/* Formulário de palpite */}
      {open && hasTeams && !isLocked && (
        <div style={{ borderTop:'1px solid #F4F6F9', padding:'12px 14px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
            <div style={{ flex:1, textAlign:'center' }}>
              <div style={{ fontSize:22, marginBottom:4 }}>{getFlag(team1)}</div>
              <div style={{ fontSize:10, fontWeight:700, color:'#002855', marginBottom:6 }}>{team1}</div>
              <input type="number" min="0" max="20" value={s1} onChange={e=>setS1(e.target.value)}
                style={{ width:56, height:44, background:'#F4F6F9', border:'1.5px solid #E2EAF0', borderRadius:10, fontSize:22, fontWeight:900, textAlign:'center', color:'#002855', outline:'none', fontFamily:'Nunito,sans-serif' }}/>
            </div>
            <div style={{ color:'#9BABB8', fontWeight:900, fontSize:18 }}>×</div>
            <div style={{ flex:1, textAlign:'center' }}>
              <div style={{ fontSize:22, marginBottom:4 }}>{getFlag(team2)}</div>
              <div style={{ fontSize:10, fontWeight:700, color:'#002855', marginBottom:6 }}>{team2}</div>
              <input type="number" min="0" max="20" value={s2} onChange={e=>setS2(e.target.value)}
                style={{ width:56, height:44, background:'#F4F6F9', border:'1.5px solid #E2EAF0', borderRadius:10, fontSize:22, fontWeight:900, textAlign:'center', color:'#002855', outline:'none', fontFamily:'Nunito,sans-serif' }}/>
            </div>
          </div>
          <button onClick={handleSave} disabled={s1===''||s2===''||saving}
            style={{ width:'100%', background: saved?'#009639':'#002855', color:'#fff', border:'none', borderRadius:10, padding:'11px', fontWeight:900, fontSize:13, cursor:'pointer', fontFamily:'Nunito,sans-serif', opacity:s1===''||s2===''?0.5:1 }}>
            {saving ? 'Salvando...' : saved ? '✓ Salvo!' : hasPred ? 'Atualizar Palpite' : 'Confirmar Palpite'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── PÁGINA PRINCIPAL ──────────────────────────────────────────────────────────
export default function KnockoutPredictions({ participant, onLogout }) {
  const [activeRound, setActiveRound] = useState('r2')
  const [dbMatches, setDbMatches] = useState({})
  const [predictions, setPredictions] = useState({})
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const load = useCallback(async () => {
    setLoading(true)
    const [matchRes, predRes] = await Promise.all([
      supabase.from('bracket_matches').select('*'),
      participant?.id ? supabase.from('knockout_predictions').select('*').eq('participant_id', participant.id) : { data: [] }
    ])
    const mmap = {}
    matchRes.data?.forEach(m => { mmap[m.id] = m })
    setDbMatches(mmap)

    const pmap = {}
    predRes.data?.forEach(p => { pmap[p.match_id] = p })
    setPredictions(pmap)
    setLoading(false)
  }, [participant?.id])

  useEffect(() => { load() }, [load])

  const current = ROUNDS.find(r => r.id === activeRound)

  // Gera lista de matches da rodada atual
  const roundMatches = Array.from({ length: current.matchCount }, (_, i) => {
    const id = `${activeRound}_${i+1}`
    // Info estática de datas (mesma do Bracket.jsx)
    const staticInfo = {
      r2:  [
        {city:'Los Angeles',city:'Los Angeles',date:'2026-06-28T19:00:00Z',info:'1º A × 2º B'},
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
      r16: [
        {city:'Filadélfia',date:'2026-07-04T21:00:00Z'},{city:'Houston',date:'2026-07-04T17:00:00Z'},
        {city:'Nova York/NJ',date:'2026-07-05T17:00:00Z'},{city:'Seattle',date:'2026-07-05T21:00:00Z'},
        {city:'Dallas',date:'2026-07-06T16:00:00Z'},{city:'Los Angeles',date:'2026-07-06T21:00:00Z'},
        {city:'Vancouver',date:'2026-07-07T16:00:00Z'},{city:'Kansas City',date:'2026-07-07T21:00:00Z'},
      ],
      qf: [
        {city:'Boston',date:'2026-07-09T20:00:00Z'},{city:'Los Angeles',date:'2026-07-09T16:00:00Z'},
        {city:'Miami',date:'2026-07-10T21:00:00Z'},{city:'Kansas City',date:'2026-07-11T21:00:00Z'},
      ],
      sf: [
        {city:'Dallas',date:'2026-07-14T20:00:00Z'},{city:'Atlanta',date:'2026-07-15T20:00:00Z'},
      ],
      f: [
        {city:'Miami',date:'2026-07-18T21:00:00Z',label:'🥉 3º Lugar'},
        {city:'Nova Jersey',date:'2026-07-19T20:00:00Z',label:'🏆 FINAL'},
      ],
    }
    const info = staticInfo[activeRound]?.[i] || {}
    return { id, ...info, label: info.label || `${current.short} ${i+1}` }
  })

  const totalPreds = ROUNDS.reduce((acc, r) => {
    return acc + Array.from({ length: r.matchCount }, (_, i) => `${r.id}_${i+1}`)
      .filter(id => predictions[id] && dbMatches[id]?.team1).length
  }, 0)

  const totalAvailable = Object.keys(dbMatches).filter(id => dbMatches[id]?.team1 && !dbMatches[id]?.is_finished).length

  return (
    <div style={{ minHeight:'100vh', background:'#F4F6F9', paddingBottom:80 }}>
      <Header participant={participant} onLogout={onLogout} />

      {/* Cabeçalho */}
      <div style={{ paddingTop:58, background:'linear-gradient(135deg,#002855,#7B2FBE)', padding:'70px 16px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
          <span style={{ fontSize:28 }}>🎯</span>
          <div>
            <h1 style={{ color:'#fff', fontWeight:900, fontSize:22, margin:0 }}>Palpites · Mata-Mata</h1>
            <p style={{ color:'rgba(255,255,255,0.6)', fontSize:12, margin:0 }}>Palpite em cada confronto</p>
          </div>
        </div>
        {totalAvailable > 0 && (
          <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:10, padding:'8px 12px', display:'flex', gap:16 }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ color:'#F5A623', fontWeight:900, fontSize:18 }}>{totalPreds}</div>
              <div style={{ color:'rgba(255,255,255,0.6)', fontSize:9, textTransform:'uppercase', letterSpacing:.5 }}>Feitos</div>
            </div>
            <div style={{ width:1, background:'rgba(255,255,255,0.2)' }}/>
            <div style={{ textAlign:'center' }}>
              <div style={{ color:'#4ade80', fontWeight:900, fontSize:18 }}>{totalAvailable - totalPreds}</div>
              <div style={{ color:'rgba(255,255,255,0.6)', fontSize:9, textTransform:'uppercase', letterSpacing:.5 }}>Pendentes</div>
            </div>
            <div style={{ width:1, background:'rgba(255,255,255,0.2)' }}/>
            <div style={{ textAlign:'center' }}>
              <div style={{ color:'#fff', fontWeight:900, fontSize:18 }}>{totalAvailable}</div>
              <div style={{ color:'rgba(255,255,255,0.6)', fontSize:9, textTransform:'uppercase', letterSpacing:.5 }}>Disponíveis</div>
            </div>
          </div>
        )}
      </div>

      {/* Abas de rodada */}
      <div style={{ background:'#002855', borderBottom:'1px solid rgba(255,255,255,0.08)', padding:'8px 10px', display:'flex', gap:6, overflowX:'auto', position:'sticky', top:58, zIndex:30 }}>
        {ROUNDS.map(r => {
          const roundPreds = Array.from({ length: r.matchCount }, (_, i) => `${r.id}_${i+1}`)
            .filter(id => predictions[id] && dbMatches[id]?.team1).length
          const roundAvail = Array.from({ length: r.matchCount }, (_, i) => `${r.id}_${i+1}`)
            .filter(id => dbMatches[id]?.team1).length
          const active = activeRound === r.id
          return (
            <button key={r.id} onClick={() => setActiveRound(r.id)} style={{
              flexShrink:0, padding:'7px 12px', border:'none', borderRadius:20,
              fontWeight:800, fontSize:11, cursor:'pointer', fontFamily:'Nunito,sans-serif',
              background: active ? '#7B2FBE' : 'rgba(255,255,255,0.08)',
              color: active ? '#fff' : 'rgba(255,255,255,0.5)',
            }}>
              {r.short}
              {roundAvail > 0 && <span style={{ marginLeft:4, fontSize:9, opacity:.8 }}>{roundPreds}/{roundAvail}</span>}
            </button>
          )
        })}
      </div>

      <main style={{ padding:'14px 12px' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:48 }}>
            <Loader2 size={28} style={{ animation:'spin 1s linear infinite', margin:'0 auto 8px', display:'block', color:'#7B2FBE' }}/>
            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <>
            {/* Aviso se rodada não liberada */}
            {roundMatches.every(m => !dbMatches[m.id]?.team1) && (
              <div style={{ background:'rgba(123,47,190,0.08)', border:'1px solid rgba(123,47,190,0.2)', borderRadius:14, padding:'16px', textAlign:'center', marginBottom:14 }}>
                <div style={{ fontSize:32, marginBottom:8 }}>⏳</div>
                <div style={{ color:'#7B2FBE', fontWeight:800, fontSize:14 }}>Rodada ainda não liberada</div>
                <div style={{ color:'#9BABB8', fontSize:12, marginTop:4 }}>
                  O admin irá preencher os times após a fase anterior.
                </div>
              </div>
            )}

            {roundMatches.map(m => (
              <KnockoutMatchCard
                key={m.id}
                match={m}
                dbMatch={dbMatches[m.id]}
                prediction={predictions[m.id]}
                participantId={participant?.id}
                onSave={load}
              />
            ))}
          </>
        )}
      </main>
    </div>
  )
}
