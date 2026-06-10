import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import Header from '../components/Header'
import { Zap, Target, Loader2 } from 'lucide-react'

const openModal = (p) => { if (window.__openParticipantModal) window.__openParticipantModal(p) }

function RankRow({ p, rank, isMe }) {
  const medals = ['🥇','🥈','🥉']
  const posColors = ['#D4890A','#9BABB8','#C96A2A']
  const posColor  = rank <= 3 ? posColors[rank-1] : '#6B7A8D'

  return (
    <div
      onClick={() => !isMe && openModal(p)}
      style={{
        display:'flex', alignItems:'center', gap:10,
        padding:'10px 12px', borderRadius:0,
        background: isMe ? 'rgba(0,150,57,0.05)' : '#fff',
        borderBottom:'1px solid #F0F4F8',
        cursor: isMe ? 'default' : 'pointer',
        transition:'background .15s',
      }}
      onMouseEnter={e=>{ if(!isMe) e.currentTarget.style.background='#F8FAFC' }}
      onMouseLeave={e=>{ e.currentTarget.style.background=isMe?'rgba(0,150,57,0.05)':'#fff' }}
    >
      {/* Posição */}
      <div style={{ width:36, textAlign:'center', flexShrink:0 }}>
        {rank <= 3
          ? <span style={{ fontSize:22 }}>{medals[rank-1]}</span>
          : <div style={{ width:28, height:28, borderRadius:8, background:'#F0F4F8', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto' }}>
              <span style={{ color:'#6B7A8D', fontWeight:900, fontSize:12 }}>{rank}</span>
            </div>
        }
      </div>

      {/* Avatar */}
      <div style={{ width:40, height:40, borderRadius:'50%', overflow:'hidden', background:'#F4F6F9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, border:isMe?'2px solid #009639':'2px solid #E2EAF0', flexShrink:0 }}>
        {p.avatar_url ? <img src={p.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <span>{p.avatar_emoji}</span>}
      </div>

      {/* Nome + stats */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ color:isMe?'#009639':'#002855', fontWeight:800, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {p.name} {isMe && <span style={{ fontSize:11, color:'#009639', opacity:.7 }}>(você)</span>}
        </div>
        <div style={{ display:'flex', gap:10, marginTop:2, fontSize:10, color:'#9BABB8' }}>
          <span style={{ display:'flex', alignItems:'center', gap:2 }}><Zap size={9} color="#F5A623"/> {p.exact_hits||0} exatos</span>
          <span style={{ display:'flex', alignItems:'center', gap:2 }}><Target size={9} color="#009639"/> {p.result_hits||0} result.</span>
        </div>
      </div>

      {/* Pontos */}
      <div style={{ textAlign:'right', flexShrink:0 }}>
        <div style={{ color:isMe?'#009639':'#002855', fontWeight:900, fontSize:18 }}>{p.total_points||0}</div>
        <div style={{ color:'#9BABB8', fontSize:9, textTransform:'uppercase', letterSpacing:.5 }}>pts</div>
      </div>
      {!isMe && <span style={{ color:'#C8D5E0', fontSize:16, flexShrink:0 }}>›</span>}
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
      const z = p=>(p.total_points||0)===0&&(p.exact_hits||0)===0&&(p.result_hits||0)===0
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
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'participants'},loadRanking)
      .subscribe(s=>setLive(s==='SUBSCRIBED'))
    return ()=>supabase.removeChannel(ch)
  }, [])

  const me     = ranking.find(p=>p.id===participant.id)
  const myRank = ranking.findIndex(p=>p.id===participant.id)+1

  return (
    <div style={{ minHeight:'100vh', background:'#F4F6F9', paddingBottom:80 }}>
      <Header participant={participant} onLogout={onLogout}/>

      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#002855 0%,#004080 100%)', padding:'70px 16px 20px' }}>
        <div style={{ color:'rgba(255,255,255,0.5)', fontSize:9, fontWeight:800, letterSpacing:3, textTransform:'uppercase', marginBottom:4 }}>Copa do Mundo 2026</div>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:16 }}>
          <div>
            <h1 style={{ color:'#fff', fontWeight:900, fontSize:28, margin:0, letterSpacing:-0.5, textTransform:'uppercase' }}>RANKING</h1>
            <div style={{ width:40, height:3, background:'#F5A623', borderRadius:2, marginTop:6 }}/>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, background:live?'rgba(0,196,79,0.2)':'rgba(255,255,255,0.1)', border:`1px solid ${live?'rgba(0,196,79,0.4)':'rgba(255,255,255,0.2)'}`, borderRadius:20, padding:'5px 12px' }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:live?'#4ade80':'rgba(255,255,255,0.3)', animation:live?'pulse 1.5s infinite':'none' }}/>
            <span style={{ color:live?'#4ade80':'rgba(255,255,255,0.5)', fontSize:10, fontWeight:700 }}>{live?'Ao vivo':'Conectando...'}</span>
          </div>
        </div>

        {/* Meu desempenho */}
        {me && (
          <div style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:12, padding:'12px 16px' }}>
            <div style={{ color:'rgba(255,255,255,0.5)', fontSize:9, fontWeight:800, letterSpacing:2, textTransform:'uppercase', marginBottom:10 }}>Seu Desempenho</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', textAlign:'center' }}>
              {[[`${myRank}º`,'Posição'],[me.total_points||0,'Pontos'],[me.exact_hits||0,'Exatos'],[me.result_hits||0,'Result.']].map(([v,l])=>(
                <div key={l}>
                  <div style={{ color:'#F5A623', fontWeight:900, fontSize:22 }}>{v}</div>
                  <div style={{ color:'rgba(255,255,255,0.45)', fontSize:9, marginTop:2, textTransform:'uppercase', letterSpacing:.5 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pódio */}
      {ranking.length>=3 && (
        <div style={{ background:'#fff', margin:'14px 12px 0', borderRadius:16, padding:'16px', border:'1px solid #E2EAF0', boxShadow:'0 2px 12px rgba(0,40,85,0.07)' }}>
          <div style={{ color:'#002855', fontWeight:900, fontSize:13, textTransform:'uppercase', letterSpacing:.5, marginBottom:14 }}>🏆 Pódio</div>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'center', gap:10 }}>
            {[1,0,2].map(i=>{
              const p=ranking[i]
              const h=i===0?85:i===1?65:50
              const bgs=['#F5F5F5','#FEF9EC','#FDF3EC']
              const borders=['#D0D0D0','#F5A623','#D4853A']
              const bg=i===0?bgs[1]:i===1?bgs[0]:bgs[2]
              const border=i===0?borders[1]:i===1?borders[0]:borders[2]
              return (
                <div key={i} onClick={()=>p&&openModal(p)} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, cursor:'pointer' }}>
                  {i===0&&<div style={{ fontSize:20, animation:'float 3s ease-in-out infinite' }}>👑</div>}
                  <div style={{ width:46, height:46, borderRadius:'50%', overflow:'hidden', border:`2.5px solid ${border}`, display:'flex', alignItems:'center', justifyContent:'center', background:'#F4F6F9', fontSize:24 }}>
                    {p?.avatar_url?<img src={p.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>:<span>{p?.avatar_emoji}</span>}
                  </div>
                  <div style={{ color:i===0?'#D4890A':'#6B7A8D', fontSize:10, fontWeight:800, textAlign:'center', maxWidth:64, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p?.name}</div>
                  <div style={{ width:'100%', height:h, borderRadius:'10px 10px 0 0', background:bg, border:`1.5px solid ${border}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', paddingBottom:6 }}>
                    <div style={{ fontWeight:900, fontSize:16, color:i===0?'#D4890A':'#002855' }}>{p?.total_points||0}</div>
                    <div style={{ color:'#9BABB8', fontSize:9 }}>pts</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Lista */}
      <div style={{ margin:'14px 12px 0', background:'#fff', borderRadius:16, overflow:'hidden', border:'1px solid #E2EAF0', boxShadow:'0 2px 12px rgba(0,40,85,0.07)' }}>
        {/* Cabeçalho tabela */}
        <div style={{ background:'#1a2a3a', padding:'8px 12px', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, textAlign:'center', flexShrink:0 }}>
            <span style={{ fontSize:9, fontWeight:800, color:'rgba(255,255,255,0.4)', textTransform:'uppercase' }}>POS</span>
          </div>
          <div style={{ width:40, flexShrink:0 }}/>
          <div style={{ flex:1 }}>
            <span style={{ fontSize:9, fontWeight:800, color:'rgba(255,255,255,0.4)', textTransform:'uppercase' }}>PARTICIPANTE</span>
          </div>
          <div style={{ textAlign:'right', flexShrink:0, paddingRight:24 }}>
            <span style={{ fontSize:9, fontWeight:800, color:'rgba(255,255,255,0.4)', textTransform:'uppercase' }}>PTS</span>
          </div>
        </div>

        <div style={{ color:'#9BABB8', fontSize:10, textAlign:'center', padding:'8px', borderBottom:'1px solid #F0F4F8', background:'#FAFBFC' }}>
          Toque em um participante para ver as estatísticas
        </div>

        {loading
          ? <div style={{ textAlign:'center', padding:32 }}><Loader2 size={24} style={{ animation:'spin 1s linear infinite', color:'#002855' }}/></div>
          : ranking.map((p,i)=><RankRow key={p.id} p={p} rank={i+1} isMe={p.id===participant.id}/>)
        }
      </div>

      <div style={{ height:14 }}/>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}
