import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { getFlag, formatDate } from '../data/matches'
import { Loader2, ArrowLeft, X } from 'lucide-react'

// ── Lista de jogos (linhas) — usada dentro de qualquer card/modal ─────────────
export function MatchBreakdownList({ participantId, type }) {
  const [rows, setRows] = useState(null) // null = carregando

  useEffect(() => {
    let active = true
    setRows(null)
    const points = type === 'exact' ? 3 : 1
    supabase
      .from('predictions')
      .select('score1,score2,matches(team1,team2,score1,score2,match_date,phase,group_name)')
      .eq('participant_id', participantId)
      .eq('points', points)
      .then(({ data }) => {
        if (!active) return
        const sorted = (data || [])
          .filter(r => r.matches)
          .sort((a, b) => new Date(a.matches.match_date) - new Date(b.matches.match_date))
        setRows(sorted)
      })
    return () => { active = false }
  }, [participantId, type])

  if (rows === null) {
    return (
      <div style={{ textAlign:'center', padding:36 }}>
        <Loader2 size={22} style={{ animation:'spin 1s linear infinite', color:'#9BABB8' }}/>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div style={{ textAlign:'center', padding:'36px 20px', color:'#9BABB8', fontSize:13 }}>
        {type === 'exact' ? 'Nenhum placar exato ainda.' : 'Nenhum resultado certo ainda.'}
      </div>
    )
  }

  return (
    <div>
      {rows.map((r, i) => {
        const m = r.matches
        return (
          <div key={i} style={{
            padding:'12px 16px', borderBottom:'1px solid #F0F4F8',
            display:'flex', alignItems:'center', gap:10,
          }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, fontWeight:700, color:'#002855', flexWrap:'wrap' }}>
                {getFlag(m.team1, 15)} <span>{m.team1}</span>
                <span style={{ color:'#C8D5E0', fontWeight:400 }}>x</span>
                {getFlag(m.team2, 15)} <span>{m.team2}</span>
              </div>
              <div style={{ color:'#9BABB8', fontSize:10, marginTop:3 }}>
                {m.group_name ? `Grupo ${m.group_name} · ` : ''}{m.phase} · {formatDate(m.match_date)}
              </div>
            </div>
            <div style={{ textAlign:'right', flexShrink:0 }}>
              <div style={{ color:'#002855', fontWeight:900, fontSize:15 }}>{m.score1}-{m.score2}</div>
              <div style={{ color: type==='exact' ? '#009639' : '#1A73E8', fontSize:10, fontWeight:700, marginTop:1 }}>
                seu palpite {r.score1}-{r.score2}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Sheet independente (overlay completo) — usada em páginas que não são
//    elas mesmas um modal, como o Perfil ───────────────────────────────────────
export default function MatchBreakdownSheet({ type, participantId, onClose }) {
  if (!type) return null
  const isExact = type === 'exact'

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, zIndex:9999,
      background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)',
      display:'flex', alignItems:'flex-end', justifyContent:'center',
      animation:'fdIn .2s ease',
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        width:'100%', maxWidth:480, maxHeight:'80vh', display:'flex', flexDirection:'column',
        background:'#fff', borderRadius:'20px 20px 0 0', overflow:'hidden',
        animation:'slideUp .3s cubic-bezier(0.25,0.46,0.45,0.94)',
        boxShadow:'0 -8px 40px rgba(0,0,0,0.2)',
      }}>
        <div style={{
          display:'flex', alignItems:'center', gap:10, padding:'16px 16px',
          borderBottom:'1px solid #F0F4F8', flexShrink:0,
        }}>
          <span style={{ fontSize:18 }}>{isExact ? '⚡' : '🎯'}</span>
          <span style={{ color:'#002855', fontWeight:900, fontSize:15, flex:1 }}>
            {isExact ? 'Placares exatos' : 'Resultados certos'}
          </span>
          <button onClick={onClose} style={{ background:'#F4F6F9', border:'none', borderRadius:'50%', width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
            <X size={15} color="#6B7A8D"/>
          </button>
        </div>
        <div style={{ overflowY:'auto' }}>
          <MatchBreakdownList participantId={participantId} type={type}/>
        </div>
      </div>
      <style>{`
        @keyframes fdIn    { from{opacity:0}                  to{opacity:1} }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        @keyframes spin    { from{transform:rotate(0deg)}     to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}
