import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Header from '../components/Header'
import { GROUP_MATCHES, getFlag, formatDate, isMatchOpen } from '../data/matches'
import { Bell, ChevronRight, AlertCircle, Users, Trophy, Star, Calendar } from 'lucide-react'

// ── HERO ──────────────────────────────────────────────────────────────────────
function Hero({ onPalpites, onJogos }) {
  const [t, setT] = useState({ d:0, h:0, m:0, s:0 })
  useEffect(() => {
    const target = new Date('2026-06-11T22:00:00Z')
    const tick = () => {
      const diff = target - new Date()
      if (diff <= 0) { setT({d:0,h:0,m:0,s:0}); return }
      setT({ d:Math.floor(diff/86400000), h:Math.floor((diff%86400000)/3600000), m:Math.floor((diff%3600000)/60000), s:Math.floor((diff%60000)/1000) })
    }
    tick(); const id = setInterval(tick,1000); return ()=>clearInterval(id)
  },[])
  const started = new Date() >= new Date('2026-06-11T22:00:00Z')

  return (
    <div style={{ position:'relative', overflow:'hidden', background:'#001a0d', minHeight:300 }}>

      {/* Fundo gradiente */}
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(120deg, #003520 0%, #001a0d 45%, #000 100%)' }}/>

      {/* Listra decorativa esquerda */}
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:4, background:'linear-gradient(to bottom, #009639, #F5A623)' }}/>

      {/* Taça — direita, grande, preenchendo toda a altura */}
      <div style={{ position:'absolute', right:0, top:0, bottom:0, width:'48%', zIndex:1 }}>
        {/* Gradiente sobre a taça para fundir com o fundo */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, #001a0d 0%, transparent 40%)', zIndex:2 }}/>
        <img
          src="/images/trophy.webp"
          alt="Taça Copa 2026"
          style={{ width:'100%', height:'100%', objectFit:'contain', objectPosition:'center', opacity:.85, filter:'drop-shadow(-12px 0 40px rgba(245,166,35,0.35))' }}
          onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }}
        />
        <div style={{ display:'none', width:'100%', height:'100%', alignItems:'center', justifyContent:'center', fontSize:120 }}>🏆</div>
      </div>

      {/* Conteúdo — esquerda */}
      <div style={{ position:'relative', zIndex:3, padding:'26px 16px 22px', width:'60%' }}>

        {/* Label topo */}
        <div style={{ color:'rgba(255,255,255,0.5)', fontWeight:800, fontSize:9, letterSpacing:3, textTransform:'uppercase', marginBottom:12 }}>
          BOLÃO DA CONFIA
        </div>

        {/* Tipografia "2 COPA / 6 DO MUNDO" */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
          {/* Números grandes */}
          <div style={{ lineHeight:.88, flexShrink:0 }}>
            <div style={{ color:'#ffffff', fontFamily:'Arial Black, Impact, sans-serif', fontWeight:900, fontSize:80, letterSpacing:-3, lineHeight:.9 }}>2</div>
            <div style={{ color:'#F5A623', fontFamily:'Arial Black, Impact, sans-serif', fontWeight:900, fontSize:80, letterSpacing:-3, lineHeight:.9 }}>6</div>
          </div>
          {/* Texto Copa do Mundo */}
          <div style={{ lineHeight:1.15 }}>
            <div style={{ color:'#ffffff', fontFamily:'Arial Black, sans-serif', fontWeight:900, fontSize:20, letterSpacing:-.5, textTransform:'uppercase' }}>COPA</div>
            <div style={{ color:'#F5A623', fontFamily:'Arial Black, sans-serif', fontWeight:900, fontSize:20, letterSpacing:-.5, textTransform:'uppercase' }}>DO MUNDO</div>
          </div>
        </div>

        {/* Países sede */}
        <div style={{ display:'flex', gap:5, alignItems:'center', marginBottom:14 }}>
          {[['🇺🇸','EUA'],['🇨🇦','CAN'],['🇲🇽','MEX']].map(([flag,name],i)=>(
            <span key={name} style={{ display:'flex', alignItems:'center', gap:3, color:'rgba(255,255,255,0.55)', fontSize:10, fontWeight:700 }}>
              {i>0 && <span style={{ color:'rgba(255,255,255,0.2)', marginRight:2 }}>·</span>}
              <span>{flag}</span><span>{name}</span>
            </span>
          ))}
        </div>

        {/* Countdown */}
        {!started ? (
          <div style={{ display:'flex', gap:5, marginBottom:18 }}>
            {[['D',t.d],['H',t.h],['M',t.m],['S',t.s]].map(([l,v])=>(
              <div key={l} style={{ textAlign:'center', background:'rgba(255,255,255,0.1)', backdropFilter:'blur(8px)', borderRadius:8, padding:'6px 7px', minWidth:38, border:'1px solid rgba(255,255,255,0.12)' }}>
                <div style={{ color:'#F5A623', fontWeight:900, fontSize:17, lineHeight:1, fontFamily:'Arial Black, sans-serif' }}>{String(v).padStart(2,'0')}</div>
                <div style={{ color:'rgba(255,255,255,0.4)', fontSize:8, letterSpacing:1.5, marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(0,150,57,0.25)', borderRadius:20, padding:'5px 12px', marginBottom:18, border:'1px solid rgba(0,150,57,0.4)' }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80' }}/>
            <span style={{ color:'#4ade80', fontWeight:800, fontSize:11 }}>Torneio em andamento!</span>
          </div>
        )}

        {/* Botões */}
        <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
          <button onClick={onPalpites} style={{ background:'#009639', color:'#fff', border:'none', borderRadius:10, padding:'11px 14px', fontWeight:800, fontSize:12, cursor:'pointer', fontFamily:'Nunito,sans-serif', display:'flex', alignItems:'center', gap:6, boxShadow:'0 4px 16px rgba(0,150,57,0.4)' }}>
            🎯 FAZER PALPITES
          </button>
          <button onClick={onJogos} style={{ background:'rgba(255,255,255,0.08)', color:'#fff', border:'1px solid rgba(255,255,255,0.15)', borderRadius:10, padding:'10px 14px', fontWeight:800, fontSize:12, cursor:'pointer', fontFamily:'Nunito,sans-serif', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', gap:6 }}>
            📅 VER JOGOS
          </button>
        </div>
      </div>
    </div>
  )
}

// ── STATS ─────────────────────────────────────────────────────────────────────
function StatsStrip({ stats, totalParts, myRank }) {
  return (
    <div style={{ background:'#fff', margin:'0 12px', borderRadius:16, padding:'14px 8px', boxShadow:'0 4px 20px rgba(0,40,85,0.10)', border:'1px solid #E2EAF0', display:'grid', gridTemplateColumns:'repeat(4,1fr)', marginTop:-16, position:'relative', zIndex:4 }}>
      {[
        { icon:<Users size={20} color="#009639"/>, label:'PARTICIPANTES', val:totalParts, sub:'Ver todos', subc:'#009639' },
        { icon:<Trophy size={20} color="#1A73E8"/>, label:'SUA POSIÇÃO', val:myRank?`${myRank}º`:'—', sub:myRank?`de ${totalParts}`:'—', subc:'#6B7A8D' },
        { icon:<Star size={20} color="#F5A623"/>, label:'SEUS PONTOS', val:stats.points, sub:'Ver pontuação', subc:'#009639' },
        { icon:<Calendar size={20} color="#7B2FBE"/>, label:'RODADA ATUAL', val:'Grupos', sub:'Em andamento', subc:'#7B2FBE' },
      ].map(({icon,label,val,sub,subc})=>(
        <div key={label} style={{ textAlign:'center', padding:'4px 2px' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:4 }}>{icon}</div>
          <div style={{ color:'#9BABB8', fontSize:8, fontWeight:700, letterSpacing:.6, textTransform:'uppercase', marginBottom:2 }}>{label}</div>
          <div style={{ color:'#002855', fontWeight:900, fontSize:16, lineHeight:1, marginBottom:2 }}>{val}</div>
          <div style={{ color:subc, fontSize:9, fontWeight:700 }}>{sub}</div>
        </div>
      ))}
    </div>
  )
}

// ── PRÓXIMOS JOGOS ────────────────────────────────────────────────────────────
function UpcomingMatches({ onVerTodos }) {
  const now = new Date()
  const next = GROUP_MATCHES.filter(m=>new Date(m.date)>now).slice(0,3)
  const show = next.length>0 ? next : GROUP_MATCHES.slice(0,3)
  return (
    <div style={{ background:'#fff', borderRadius:14, padding:'14px 12px', border:'1px solid #E2EAF0', boxShadow:'0 1px 8px rgba(0,40,85,0.05)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
        <span style={{ color:'#002855', fontWeight:900, fontSize:13 }}>Próximos Jogos</span>
        <button onClick={onVerTodos} style={{ color:'#009639', fontSize:10, fontWeight:800, background:'none', border:'none', cursor:'pointer', fontFamily:'Nunito,sans-serif' }}>Ver tabela</button>
      </div>
      {show.map(m=>(
        <div key={m.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', background:'#F4F6F9', borderRadius:10, marginBottom:8, border:'1px solid #E2EAF0' }}>
          <span style={{ fontSize:22 }}>{getFlag(m.team1)}</span>
          <span style={{ color:'#9BABB8', fontWeight:900, fontSize:10 }}>×</span>
          <span style={{ fontSize:22 }}>{getFlag(m.team2)}</span>
          <div style={{ flex:1 }}>
            <div style={{ color:'#002855', fontWeight:800, fontSize:10 }}>{formatDate(m.date)}</div>
            <div style={{ color:'#9BABB8', fontSize:9 }}>Grupo {m.group} · {m.city}</div>
          </div>
          <Bell size={13} color={isMatchOpen(m)?'#009639':'#E2EAF0'}/>
        </div>
      ))}
      <button onClick={onVerTodos} style={{ width:'100%', marginTop:4, padding:'8px', background:'none', border:'none', cursor:'pointer', color:'#002855', fontWeight:800, fontSize:11, fontFamily:'Nunito,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
        VER TODOS OS JOGOS <ChevronRight size={13}/>
      </button>
    </div>
  )
}

// ── TOP 5 ─────────────────────────────────────────────────────────────────────
function Top5({ participant, ranking }) {
  const navigate = useNavigate()
  return (
    <div style={{ background:'#fff', borderRadius:14, padding:'14px 12px', border:'1px solid #E2EAF0', boxShadow:'0 1px 8px rgba(0,40,85,0.05)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
        <span style={{ color:'#002855', fontWeight:900, fontSize:13 }}>Top 5</span>
        <button onClick={()=>navigate('/ranking')} style={{ color:'#009639', fontSize:10, fontWeight:800, background:'none', border:'none', cursor:'pointer', fontFamily:'Nunito,sans-serif' }}>Ver ranking</button>
      </div>
      {ranking.map((p,i)=>{
        const isMe=p.id===participant.id
        return (
          <div key={p.id} style={{ display:'flex', alignItems:'center', gap:7, padding:'6px 8px', borderRadius:10, background:isMe?'#e8f5ee':'transparent', border:isMe?'1px solid rgba(0,150,57,0.2)':'1px solid transparent', marginBottom:4 }}>
            <div style={{ width:22, height:22, borderRadius:'50%', background:i===0?'#FEF3DC':i===1?'#F4F6F9':i===2?'#FFF0E6':'#F4F6F9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:i<3?14:11, fontWeight:900, color:i===0?'#D4890A':i===1?'#9BABB8':i===2?'#C96A2A':'#9BABB8', flexShrink:0 }}>
              {i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}`}
            </div>
            <div style={{ width:28, height:28, borderRadius:'50%', overflow:'hidden', background:'#F4F6F9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0, border:isMe?'2px solid #009639':'none' }}>
              {p.avatar_url ? <img src={p.avatar_url} style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : p.avatar_emoji}
            </div>
            <span style={{ flex:1, color:isMe?'#009639':'#002855', fontWeight:800, fontSize:11, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}{isMe?' (você)':''}</span>
            <span style={{ color:isMe?'#009639':'#6B7A8D', fontWeight:900, fontSize:11 }}>{(p.total_points||0).toLocaleString()} <span style={{ fontSize:9 }}>pts</span></span>
          </div>
        )
      })}
    </div>
  )
}

// ── DASHBOARD PRINCIPAL ───────────────────────────────────────────────────────
export default function Dashboard({ participant, onLogout }) {
  const navigate = useNavigate()
  const [stats,      setStats]      = useState({ points:0, done:0 })
  const [ranking,    setRanking]    = useState([])
  const [totalParts, setTotalParts] = useState(0)
  const [myRank,     setMyRank]     = useState(null)

  const fetchData = useCallback(async () => {
    const [{ data: preds }, { data: parts }, { count }] = await Promise.all([
      supabase.from('predictions').select('points').eq('participant_id', participant.id),
      supabase.from('participants').select('id,name,avatar_emoji,avatar_url,total_points').order('total_points',{ascending:false}).limit(5),
      supabase.from('participants').select('*',{count:'exact',head:true}),
    ])
    setStats({ points: preds?.reduce((s,p)=>s+(p.points||0),0)||0, done: preds?.length||0 })
    setRanking(parts||[])
    setTotalParts(count||0)
    const { data: all } = await supabase.from('participants').select('id').order('total_points',{ascending:false})
    const idx = all?.findIndex(p=>p.id===participant.id)
    setMyRank(idx!==undefined&&idx>=0?idx+1:null)
  }, [participant.id])

  useEffect(() => {
    fetchData()
    const ch = supabase.channel('dash-rt').on('postgres_changes',{event:'UPDATE',schema:'public',table:'participants'},fetchData).subscribe()
    return ()=>supabase.removeChannel(ch)
  }, [fetchData])

  const openCount = GROUP_MATCHES.filter(m=>isMatchOpen(m)).length

  return (
    <div style={{ minHeight:'100vh', background:'#F4F6F9', overflowX:'hidden' }}>
      <Header participant={participant} onLogout={onLogout}/>

      {/* Aviso palpites */}
      {openCount>0 && (
        <div style={{ position:'fixed', top:58, left:0, right:0, zIndex:40, background:'#F5A623', padding:'8px 16px', display:'flex', alignItems:'center', gap:8 }}>
          <AlertCircle size={14} color="#002855"/>
          <span style={{ color:'#002855', fontWeight:800, fontSize:12 }}>⚠️ {openCount} jogo{openCount!==1?'s':''} em aberto!</span>
          <button onClick={()=>navigate('/palpites')} style={{ marginLeft:'auto', background:'#002855', color:'#fff', border:'none', borderRadius:8, padding:'4px 10px', fontWeight:800, fontSize:11, cursor:'pointer', fontFamily:'Nunito,sans-serif' }}>PALPITAR AGORA</button>
        </div>
      )}

      <div style={{ paddingTop: openCount>0?96:58 }}>
        <Hero onPalpites={()=>navigate('/palpites')} onJogos={()=>navigate('/palpites')}/>

        <div style={{ padding:'0 12px', display:'flex', flexDirection:'column', gap:14, marginTop:0 }}>
          <StatsStrip stats={stats} totalParts={totalParts} myRank={myRank}/>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <UpcomingMatches onVerTodos={()=>navigate('/palpites')}/>
            <Top5 participant={participant} ranking={ranking}/>
          </div>

          {/* Banners */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div style={{ background:'#fff', borderRadius:14, padding:'14px 12px', border:'1px solid #E2EAF0', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', right:-8, bottom:-8, opacity:.12 }}>
                <img src="/images/trophy-multi.webp" style={{ width:80, height:80, objectFit:'contain' }} alt=""/>
              </div>
              <div style={{ color:'#6B7A8D', fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Prêmio para o Campeão</div>
              <div style={{ color:'#009639', fontWeight:900, fontSize:14, lineHeight:1.2, marginBottom:2 }}>Cresce a cada<br/>nova entrada!</div>
              <div style={{ color:'#9BABB8', fontSize:10, margin:'3px 0 10px' }}>50 vagas · R$ 20 cada</div>
              <button onClick={()=>navigate('/premios')} style={{ background:'#009639', color:'#fff', border:'none', borderRadius:8, padding:'6px 10px', fontWeight:800, fontSize:9, cursor:'pointer', fontFamily:'Nunito,sans-serif' }}>VER PRÊMIOS</button>
            </div>

            <div style={{ borderRadius:14, padding:'14px 12px', background:'linear-gradient(135deg,#002855 0%,#009639 100%)', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', right:-10, bottom:-10, opacity:.15 }}>
                <img src="/images/trophy.webp" style={{ width:70, height:70, objectFit:'contain', filter:'grayscale(1)' }} alt=""/>
              </div>
              <div style={{ color:'#fff', fontWeight:900, fontSize:13, lineHeight:1.4, position:'relative', zIndex:1 }}>
                Confiabilidade<br/>é nosso DNA.<br/><span style={{ color:'#F5A623' }}>A vitória<br/>pode ser sua!</span>
              </div>
            </div>
          </div>

          {/* Pontuação */}
          <div style={{ background:'#fff', borderRadius:16, padding:'16px', border:'1px solid #E2EAF0', marginBottom:4 }}>
            <div style={{ color:'#002855', fontWeight:900, fontSize:15, marginBottom:12 }}>📋 Pontuação</div>
            {[['Placar exato','#D4890A','rgba(245,166,35,0.10)','+3 pts'],['Resultado correto','#007a2e','rgba(0,150,57,0.08)','+1 pt'],['Campeão correto','#D4890A','rgba(245,166,35,0.10)','+10 pts'],['Vice correto','#007a2e','rgba(0,150,57,0.08)','+5 pts'],['3º lugar correto','#007a2e','rgba(0,150,57,0.08)','+3 pts'],['Resultado errado','#C0392B','rgba(220,53,69,0.07)','0 pts']].map(([l,c,bg,pts])=>(
              <div key={l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:'1px solid #F4F6F9' }}>
                <span style={{ color:'#6B7A8D', fontSize:13 }}>{l}</span>
                <span style={{ background:bg, color:c, borderRadius:20, padding:'3px 12px', fontSize:12, fontWeight:800 }}>{pts}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
