import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import Header, { Avatar } from '../components/Header'
import { Zap, Target, Loader2 } from 'lucide-react'

function RankRow({ p, rank, isMe }) {
  const medals = ['🥇','🥈','🥉']
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:14, background: isMe?'#e8f5ee':'#fff', border: isMe?'1.5px solid rgba(0,150,57,0.25)':'1px solid #E2EAF0', boxShadow:'0 1px 6px rgba(0,40,85,0.04)', marginBottom:6 }}>
      <div style={{ width:32, textAlign:'center', flexShrink:0 }}>
        {medals[rank-1] ? <span style={{ fontSize:22 }}>{medals[rank-1]}</span> : <span style={{ color:'#9BABB8', fontWeight:900, fontSize:14 }}>{rank}º</span>}
      </div>
      <div style={{ width:40, height:40, borderRadius:'50%', background: isMe?'linear-gradient(135deg,#e8f5ee,#c8e6d6)':'#F4F6F9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, border: isMe?'2px solid #009639':'2px solid #E2EAF0', flexShrink:0 }}>
        {p.avatar_emoji}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ color: isMe?'#009639':'#002855', fontWeight:800, fontSize:14, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {p.name} {isMe&&<span style={{ fontSize:11, opacity:.7 }}>(você)</span>}
        </div>
        <div style={{ display:'flex', gap:10, marginTop:2, fontSize:11, color:'#9BABB8' }}>
          <span><Zap size={9} color="#F5A623" /> {p.exact_hits||0} exatos</span>
          <span><Target size={9} color="#009639" /> {p.result_hits||0} result.</span>
        </div>
      </div>
      <div style={{ textAlign:'right', flexShrink:0 }}>
        <div style={{ color: isMe?'#009639':'#002855', fontWeight:900, fontSize:18 }}>{p.total_points||0}</div>
        <div style={{ color:'#9BABB8', fontSize:10 }}>pts</div>
      </div>
    </div>
  )
}

export default function Rankings({ participant, onLogout }) {
  const [ranking,setRanking] = useState([])
  const [loading,setLoading] = useState(true)
  const [live,setLive] = useState(false)

  const fetch = async () => {
    const { data: raw } = await supabase.from('participants').select('id,name,avatar_emoji,avatar_url,total_points,exact_hits,result_hits,predictions_count')
    // Ordenação: pontos → exatos → resultados → menos erros → mais palpites → alfabético
    const data = (raw || []).slice().sort((a, b) => {
      const allZero = (p) => (p.total_points||0) === 0 && (p.exact_hits||0) === 0 && (p.result_hits||0) === 0
      // Se todos têm zero, ordem alfabética
      if (allZero(a) && allZero(b)) return a.name.localeCompare(b.name, 'pt-BR')
      if ((b.total_points||0) !== (a.total_points||0)) return (b.total_points||0) - (a.total_points||0)
      if ((b.exact_hits||0) !== (a.exact_hits||0)) return (b.exact_hits||0) - (a.exact_hits||0)
      if ((b.result_hits||0) !== (a.result_hits||0)) return (b.result_hits||0) - (a.result_hits||0)
      const errorsA = (a.predictions_count||0) - (a.exact_hits||0) - (a.result_hits||0)
      const errorsB = (b.predictions_count||0) - (b.exact_hits||0) - (b.result_hits||0)
      if (errorsA !== errorsB) return errorsA - errorsB
      if ((b.predictions_count||0) !== (a.predictions_count||0)) return (b.predictions_count||0) - (a.predictions_count||0)
      return a.name.localeCompare(b.name, 'pt-BR')
    })
    setRanking(data||[]); setLoading(false)
  }

  useEffect(()=>{
    fetch()
    const ch = supabase.channel('rank-rt').on('postgres_changes',{event:'UPDATE',schema:'public',table:'participants'},fetch).subscribe(s=>setLive(s==='SUBSCRIBED'))
    return ()=>supabase.removeChannel(ch)
  },[])

  const me = ranking.find(p=>p.id===participant.id)
  const myRank = ranking.findIndex(p=>p.id===participant.id)+1

  return (
    <div style={{ minHeight:'100vh', background:'#F4F6F9', paddingBottom:80 }}>
      <Header participant={participant} onLogout={onLogout} />
      <main style={{ paddingTop:70, padding:'70px 12px 80px' }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:16 }}>
          <div>
            <h1 style={{ color:'#002855', fontWeight:900, fontSize:24 }}>Ranking</h1>
            <p style={{ color:'#9BABB8', fontSize:12, marginTop:2 }}>{ranking.length} participante{ranking.length!==1?'s':''}</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, background: live?'rgba(0,150,57,0.08)':'#F4F6F9', border:`1px solid ${live?'rgba(0,150,57,0.2)':'#E2EAF0'}`, borderRadius:20, padding:'5px 10px' }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background: live?'#009639':'#E2EAF0', animation: live?'pulse-g 1.5s infinite':'none' }} />
            <span style={{ color: live?'#009639':'#9BABB8', fontSize:10, fontWeight:700 }}>{live?'Ao vivo':'Conectando...'}</span>
          </div>
        </div>

        {/* Meu desempenho */}
        {me && (
          <div style={{ background:'linear-gradient(135deg,#009639,#007a2e)', borderRadius:16, padding:'16px', marginBottom:16, color:'#fff' }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:1, opacity:.7, marginBottom:10, textTransform:'uppercase' }}>Seu Desempenho</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', textAlign:'center' }}>
              {[[`${myRank}º`,'Posição'],[(me.total_points||0),'Pontos'],[(me.exact_hits||0),'Exatos'],[(me.result_hits||0),'Result.']].map(([v,l])=>(
                <div key={l}>
                  <div style={{ fontWeight:900, fontSize:24 }}>{v}</div>
                  <div style={{ opacity:.7, fontSize:10, marginTop:2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pódio */}
        {ranking.length >= 3 && (
          <div style={{ background:'#fff', borderRadius:16, padding:'16px', border:'1px solid #E2EAF0', marginBottom:16 }}>
            <div style={{ color:'#002855', fontWeight:900, fontSize:14, marginBottom:14 }}>🏆 Pódio</div>
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'center', gap:10 }}>
              {[1,0,2].map(i=>{
                const p=ranking[i]
                const hs=[65,85,50]; const h=i===0?hs[1]:i===1?hs[0]:hs[2]
                const bgs=['rgba(192,192,192,0.12)','rgba(245,166,35,0.12)','rgba(205,127,50,0.10)']
                const borders=['rgba(192,192,192,0.3)','rgba(245,166,35,0.35)','rgba(205,127,50,0.25)']
                const bg=i===0?bgs[1]:i===1?bgs[0]:bgs[2]; const border=i===0?borders[1]:i===1?borders[0]:borders[2]
                return (
                  <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                    {i===0&&<div style={{ fontSize:22, animation:'float 3s ease-in-out infinite' }}>👑</div>}
                    <div style={{ fontSize:26 }}>{p?.avatar_emoji}</div>
                    <div style={{ color: i===0?'#D4890A':'#6B7A8D', fontSize:10, fontWeight:800, textAlign:'center', maxWidth:60, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p?.name}</div>
                    <div style={{ width:'100%', height:h, borderRadius:'10px 10px 0 0', background:bg, border:`1px solid ${border}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', paddingBottom:6 }}>
                      <div style={{ fontWeight:900, fontSize:16, color: i===0?'#D4890A':'#002855' }}>{p?.total_points||0}</div>
                      <div style={{ color:'#9BABB8', fontSize:10 }}>pts</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign:'center', padding:'32px', color:'#9BABB8' }}><Loader2 size={28} className="animate-spin" /></div>
        ) : (
          ranking.map((p,i)=><RankRow key={p.id} p={p} rank={i+1} isMe={p.id===participant.id}/>)
        )}
      </main>
    </div>
  )
}