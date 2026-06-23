import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { getFlag, formatDate } from '../data/matches'
import { Loader2, ArrowLeft, X } from 'lucide-react'

const ROUND_LABEL = { r2:'2ª Fase', r16:'Oitavas de Final', qf:'Quartas de Final', sf:'Semifinais', f:'Final' }
const ROUND_ORDER = { r2:1, r16:2, qf:3, sf:4, f:5 }

// ── Lista de jogos (linhas) — usada dentro de qualquer card/modal ─────────────
// Busca tanto a fase de grupos (predictions + matches) quanto o mata-mata
// (knockout_predictions + bracket_matches) e junta tudo numa única lista.
export function MatchBreakdownList({ participantId, type }) {
  const [rows, setRows] = useState(null) // null = carregando

  useEffect(() => {
    let active = true
    setRows(null)
    const points = type === 'exact' ? 3 : 1

    const load = async () => {
      // Fase de grupos — busca separada + junção manual (não depende de
      // o Supabase reconhecer a relação predictions→matches automaticamente)
      const { data: g, error: gErr } = await supabase
        .from('predictions')
        .select('score1,score2,match_id')
        .eq('participant_id', participantId)
        .eq('points', points)
      if (gErr) console.error('[MatchBreakdown] erro ao buscar predictions:', gErr)

      let gRows = []
      if (g?.length) {
        const ids = [...new Set(g.map(r => r.match_id))]
        const { data: gm, error: gmErr } = await supabase.from('matches').select('id,team1,team2,score1,score2,match_date,phase,group_name').in('id', ids)
        if (gmErr) console.error('[MatchBreakdown] erro ao buscar matches:', gmErr)
        const gmMap = {}
        ;(gm || []).forEach(m => { gmMap[m.id] = m })
        gRows = g
          .map(r => ({ pred: r, match: gmMap[r.match_id] }))
          .filter(x => x.match)
          .map(({ pred, match }) => ({
            team1: match.team1, team2: match.team2,
            score1: match.score1, score2: match.score2,
            myScore1: pred.score1, myScore2: pred.score2,
            label: match.group_name ? `Grupo ${match.group_name} · ${match.phase}` : match.phase,
            date: match.match_date,
            sortKey: new Date(match.match_date).getTime(),
          }))
      }

      // Mata-mata (busca separada + junção manual, pra não depender de FK configurada)
      const { data: k, error: kErr } = await supabase
        .from('knockout_predictions')
        .select('score1,score2,match_id')
        .eq('participant_id', participantId)
        .eq('points', points)
      if (kErr) console.error('[MatchBreakdown] erro ao buscar knockout_predictions:', kErr)

      let kRows = []
      if (k?.length) {
        const ids = [...new Set(k.map(r => r.match_id))]
        const { data: bm, error: bmErr } = await supabase.from('bracket_matches').select('id,team1,team2,score1,score2,round').in('id', ids)
        if (bmErr) console.error('[MatchBreakdown] erro ao buscar bracket_matches:', bmErr)
        const bmMap = {}
        ;(bm || []).forEach(m => { bmMap[m.id] = m })
        kRows = k
          .map(r => ({ pred: r, match: bmMap[r.match_id] }))
          .filter(x => x.match)
          .map(({ pred, match }) => ({
            team1: match.team1, team2: match.team2,
            score1: match.score1, score2: match.score2,
            myScore1: pred.score1, myScore2: pred.score2,
            label: ROUND_LABEL[match.round] || 'Mata-mata',
            date: null,
            sortKey: 1e15 + (ROUND_ORDER[match.round] || 9),
          }))
      }

      console.log('[MatchBreakdown]', { participantId, type, points, predictions: g?.length||0, knockout: k?.length||0, gRows: gRows.length, kRows: kRows.length })

      if (!active) return
      setRows([...gRows, ...kRows].sort((a, b) => a.sortKey - b.sortKey))
    }
    load()
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
      {rows.map((m, i) => (
        <div key={i} style={{
          padding:'12px 16px', borderBottom:'1px solid #F0F4F8',
          display:'flex', alignItems:'center', gap:10,
        }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, fontWeight:700, color:'#002855', flexWrap:'wrap' }}>
              {getFlag(m.team1, 20)} <span>{m.team1}</span>
              <span style={{ color:'#C8D5E0', fontWeight:400 }}>x</span>
              {getFlag(m.team2, 20)} <span>{m.team2}</span>
            </div>
            <div style={{ color:'#9BABB8', fontSize:10, marginTop:3 }}>
              {m.label}{m.date ? ` · ${formatDate(m.date)}` : ''}
            </div>
          </div>
          <div style={{ textAlign:'right', flexShrink:0 }}>
            <div style={{ color:'#002855', fontWeight:900, fontSize:15 }}>{m.score1}-{m.score2}</div>
            <div style={{ color: type==='exact' ? '#009639' : '#1A73E8', fontSize:10, fontWeight:700, marginTop:1 }}>
              seu palpite {m.myScore1}-{m.myScore2}
            </div>
          </div>
        </div>
      ))}
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
