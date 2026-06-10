import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import Header from '../components/Header'
import { Zap, Target, Loader2 } from 'lucide-react'

// Abre o modal de estatísticas via Header global
const openModal = (p) => { if (window.__openParticipantModal) window.__openParticipantModal(p) }

function RankRow({ p, rank, isMe }) {
  const medals = ['🥇','🥈','🥉']
  return (
    <div
      onClick={() => !isMe && openModal(p)}
      style={{
        display:'flex', alignItems:'center', gap:10,
        padding:'10px 12px', borderRadius:14,
        background: isMe ? '#e8f5ee' : '#fff',
        border: isMe ? '1.5px solid rgba(0,150,57,0.25)' : '1px solid #E2EAF0',
        boxShadow:'0 1px 6px rgba(0,40,85,0.04)', marginBottom:6,
        cursor: isMe ? 'default' : 'pointer',
        transition:'transform .15s, box-shadow .15s',
      }}
      onMouseEnter={e=>{ if(!isMe){ e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(0,40,85,0.10)' }}}
      onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 1px 6px rgba(0,40,85,0.04)' }}
    >
      {/* Posição */}
      <div style={{ width:32, textAlign:'center', flexShrink:0 }}>
        {medals[rank-1]
          ? <span style={{ fontSize:22 }}>{medals[rank-1]}</span>
          : <span style={{ color:'#9BABB8', fontWeight:900, fontSize:14 }}>{rank}º</span>
        }
      </div>

      {/* Avatar */}
      <div style={{ width:40, height:40, borderRadius:'50%', overflow:'hidden', background:isMe?'linear-gradient(135deg,#e8f5ee,#c8e6d6)':'#F4F6F9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, border:isMe?'2px solid #009639':'2px solid #E2EAF0', flexShrink:0 }}>
        {p.avatar_url ? <img src={p.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <span>{p.avatar_emoji}</span>}
      </div>

      {/* Nome + stats */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ color:isMe?'#009639':'#002855', fontWeight:800, fontSize:14, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {p.name} {isMe && <span style={{ fontSize:11, opacity:.7 }}>(você)</span>}
        </div>
        <div style={{ display:'flex', gap:10, marginTop:2, fontSize:11, color:'#9BABB8' }}>
          <span><Zap size={9} color="#F5A623"/> {p.exact_hits||0} exatos</span>
          <span><Target size={9} color="#009639"/> {p.result_hits||0} result.</span>
        </div>
      </div>

      {/* Pontos */}
      <div style={{ textAlign:'right', flexShrink:0 }}>
        <div style={{ color:isMe?'#009639':'#002855', fontWeight:900, fontSize:18 }}>{p.total_points||0}</div>
        <div style={{ color:'#9BABB8', fontSize:10 }}>pts</div>
      </div>

      {!isMe && <div style={{ color:'#C8D5E0', fontSize:16, flexShrink:0 }}>›</div>}
    </div>
  )
}

export default function Rankings({ participant, onLogout }) {
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)
  const [live,    setLive]    = useState(false)

  const loadRanking = async () => {
    const { data: raw } = await supabase
      .from('participants')
      .select('id,name,avatar_emoji,avatar_url,total_points,exact_hits,result_hits,predictions_count')
    const data = (raw||[]).slice().sort((a,b) => {
      const z = p => (p.total_points||0)===0&&(p.exact_hits||0)===0&&(p.result_hits||0)===0
      if (z(a)&&z(b)) return a.name.localeCompare(b.name,'pt-BR')
      if ((b.total_points||0)!==(a.total_points||0)) return (b.total_points||0)-(a.total_points||0)
      if ((b.exact_hits||0)!==(a.exact_hits||0))     return (b.exact_hits||0)-(a.exact_hits||0)
      if ((b.result_hits||0)!==(a.result_hits||0))   return (b.result_hits||0)-(a.result_hits||0)
      const eA=(a.predictions_count||0)-(a.exact_hits||0)-(a.result_hits||0)
      const eB=(b.predictions_count||0)-(b.exact_hits||0)-(b.result_hits||0)
      if (eA!==eB) return eA-eB
      if ((b.predictions_count||0)!==(a.predictions_count||0)) return (b.predictions_count||0)-(a.predictions_count||0)
      return a.name.localeCompare(b.name,'pt-BR')
    })
    setRanking(data); setLoading(false)
  }

  useEffect(() => {
    loadRanking()
    const ch = supabase.channel('rank-rt')
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'participants'}, loadRanking)
      .subscribe(s => setLive(s==='SUBSCRIBED'))
    return () => supabase.removeChannel(ch)
  }, [])

  const me     = ranking.find(p => p.id === participant.id)
  const myRank = ranking.findIndex(p => p.id === participant.id) + 1

  return (
    <div style={{ minHeight:'100vh', background:'#0a0f1a', paddingBottom:80 }}>
      <Header participant={participant} onLogout={onLogout}/>

      {/* Hero FIFA-style */}
      <div style={{ background:'linear-gradient(135deg,#001a3a 0%,#002855 50%,#004d1a 100%)', padding:'70px 16px 24px', position:'relative', overflow:'hidden' }}>
        {/* Decoração */}
        <div style={{ position:'absolute', top:-40, right:-40, width:200, height:200, borderRadius:'50%', background:'rgba(0,150,57,0.08)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:-20, left:-20, width:140, height:140, borderRadius:'50%', background:'rgba(245,166,35,0.06)', pointerEvents:'none' }}/>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16, position:'relative', zIndex:1 }}>
          <div>
            <div style={{ color:'rgba(255,255,255,0.5)', fontSize:9, fontWeight:800, letterSpacing:3, textTransform:'uppercase', marginBottom:4 }}>Copa do Mundo 2026</div>
            <h1 style={{ color:'#fff', fontWeight:900, fontSize:32, margin:0, letterSpacing:-1, textTransform:'uppercase' }}>RANKING</h1>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:12, margin:'4px 0 0' }}>{ranking.length} participante{ranking.length!==1?'s':''}</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, background:live?'rgba(0,196,79,0.15)':'rgba(255,255,255,0.08)', border:`1px solid ${live?'rgba(0,196,79,0.4)':'rgba(255,255,255,0.15)'}`, borderRadius:20, padding:'6px 12px' }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:live?'#00c44f':'rgba(255,255,255,0.3)', animation:live?'pulse-g 1.5s infinite':'none' }}/>
            <span style={{ color:live?'#00c44f':'rgba(255,255,255,0.5)', fontSize:10, fontWeight:700 }}>{live?'Ao vivo':'Conectando...'}</span>
          </div>
        </div>

        {/* Card meu desempenho */}
        {me && (
          <div style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:16, padding:'14px 16px', position:'relative', zIndex:1 }}>
            <div style={{ color:'rgba(255,255,255,0.5)', fontSize:9, fontWeight:800, letterSpacing:2, textTransform:'uppercase', marginBottom:10 }}>Seu Desempenho</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', textAlign:'center' }}>
              {[[`${myRank}º`,'Posição'],[me.total_points||0,'Pontos'],[me.exact_hits||0,'Exatos'],[me.result_hits||0,'Result.']].map(([v,l])=>(
                <div key={l}>
                  <div style={{ color:'#F5A623', fontWeight:900, fontSize:24 }}>{v}</div>
                  <div style={{ color:'rgba(255,255,255,0.5)', fontSize:9, marginTop:2, textTransform:'uppercase', letterSpacing:.5 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <main style={{ padding:'16px 12px 80px' }}>

        {/* Pódio */}
        {ranking.length >= 3 && (
          <div style={{ background:'#fff', borderRadius:16, padding:'16px', border:'1px solid #E2EAF0', marginBottom:16, boxShadow:'0 2px 12px rgba(0,40,85,0.08)' }}>
            <div style={{ color:'#002855', fontWeight:900, fontSize:14, marginBottom:14 }}>🏆 Pódio</div>
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'center', gap:10 }}>
              {[1,0,2].map(i => {
                const p = ranking[i]
                const h = i===0?85:i===1?65:50
                const bgs     = ['rgba(192,192,192,0.12)','rgba(245,166,35,0.14)','rgba(205,127,50,0.10)']
                const borders = ['rgba(192,192,192,0.3)','rgba(245,166,35,0.4)','rgba(205,127,50,0.25)']
                const bg     = i===0?bgs[1]:i===1?bgs[0]:bgs[2]
                const border = i===0?borders[1]:i===1?borders[0]:borders[2]
                return (
                  <div key={i} onClick={() => p && openModal(p)} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, cursor:'pointer' }}>
                    {i===0 && <div style={{ fontSize:22, animation:'float 3s ease-in-out infinite' }}>👑</div>}
                    <div style={{ width:48, height:48, borderRadius:'50%', overflow:'hidden', border:`2px solid ${border}`, display:'flex', alignItems:'center', justifyContent:'center', background:'#F4F6F9', fontSize:26 }}>
                      {p?.avatar_url ? <img src={p.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <span>{p?.avatar_emoji}</span>}
                    </div>
                    <div style={{ color:i===0?'#D4890A':'#6B7A8D', fontSize:10, fontWeight:800, textAlign:'center', maxWidth:60, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p?.name}</div>
                    <div style={{ width:'100%', height:h, borderRadius:'10px 10px 0 0', background:bg, border:`1px solid ${border}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', paddingBottom:6 }}>
                      <div style={{ fontWeight:900, fontSize:16, color:i===0?'#D4890A':'#002855' }}>{p?.total_points||0}</div>
                      <div style={{ color:'#9BABB8', fontSize:10 }}>pts</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Dica clique */}
        <div style={{ color:'#9BABB8', fontSize:11, textAlign:'center', marginBottom:12 }}>
          Toque em um participante para ver suas estatísticas
        </div>

        {/* Lista */}
        {loading
          ? <div style={{ textAlign:'center', padding:'32px', color:'#9BABB8' }}><Loader2 size={28} style={{ animation:'spin 1s linear infinite' }}/></div>
          : ranking.map((p,i) => <RankRow key={p.id} p={p} rank={i+1} isMe={p.id===participant.id}/>)
        }
      </main>

      <style>{`
        @keyframes pulse-g { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}
