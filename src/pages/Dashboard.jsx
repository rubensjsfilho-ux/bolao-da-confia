import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Header from '../components/Header'
import { GROUP_MATCHES, getFlag, formatDate, isMatchOpen } from '../data/matches'
import { Users, Trophy, Star, Calendar, Bell, ChevronRight, AlertCircle } from 'lucide-react'

// ── Hero com countdown ────────────────────────────────────────────────────────
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
  }, [])
  const started = new Date() >= new Date('2026-06-11T22:00:00Z')

  return (
    <div style={{ position:'relative', background:'linear-gradient(145deg,#fff 0%,#f0faf5 55%,#e8f4fe 100%)', overflow:'hidden', padding:'20px 16px 24px', marginBottom:0 }}>
      {/* Swoosh verde */}
      <svg style={{ position:'absolute', top:-20, right:-30, width:220, opacity:.18, pointerEvents:'none' }} viewBox="0 0 220 280">
        <ellipse cx="200" cy="60" rx="160" ry="200" fill="#009639" transform="rotate(-25 200 60)" />
      </svg>
      {/* Swoosh azul */}
      <svg style={{ position:'absolute', bottom:-40, right:60, width:160, opacity:.12, pointerEvents:'none' }} viewBox="0 0 160 160">
        <ellipse cx="80" cy="80" rx="100" ry="70" fill="#1A73E8" transform="rotate(30 80 80)" />
      </svg>
      {/* Swoosh dourado */}
      <svg style={{ position:'absolute', bottom:0, right:0, width:120, opacity:.15, pointerEvents:'none' }} viewBox="0 0 120 120">
        <ellipse cx="120" cy="120" rx="90" ry="80" fill="#F5A623" />
      </svg>

      {/* Troféu */}
      <div style={{ position:'absolute', right:8, top:8, fontSize:100, opacity:.22, pointerEvents:'none', filter:'saturate(0.6)' }}>🏆</div>

      {/* Conteúdo */}
      <div style={{ position:'relative', zIndex:1, maxWidth:280 }}>
        <div style={{ color:'#009639', fontWeight:900, fontSize:15, letterSpacing:1, textTransform:'uppercase', marginBottom:4 }}>Copa do Mundo</div>

        {/* 2026 estilizado */}
        <div style={{ display:'flex', alignItems:'flex-end', gap:2, marginBottom:8, lineHeight:1 }}>
          <span style={{ color:'#002855', fontWeight:900, fontSize:68, letterSpacing:-3 }}>20</span>
          <span style={{ color:'#009639', fontWeight:900, fontSize:68, letterSpacing:-3 }}>2</span>
          <div style={{ position:'relative', fontSize:68, fontWeight:900, color:'#F5A623', letterSpacing:-3 }}>
            6
            <span style={{ position:'absolute', top:2, right:-4, fontSize:18 }}>⭐</span>
          </div>
        </div>

        {/* Sedes */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, fontSize:13, color:'#002855', fontWeight:600 }}>
          <span>🇺🇸 EUA</span><span style={{ color:'#E2EAF0' }}>|</span>
          <span>🇨🇦 CANADÁ</span><span style={{ color:'#E2EAF0' }}>|</span>
          <span>🇲🇽 MÉXICO</span>
        </div>

        <p style={{ color:'#002855', fontSize:13, lineHeight:1.5, marginBottom:14, opacity:.8 }}>
          Participe do Bolão da Confia e mostre<br/>que você é craque em palpites!
        </p>

        {/* Countdown */}
        {!started && (
          <div style={{ display:'flex', gap:6, marginBottom:14 }}>
            {[['D',t.d],['H',t.h],['M',t.m],['S',t.s]].map(([l,v]) => (
              <div key={l} style={{ textAlign:'center', background:'rgba(0,40,85,0.06)', borderRadius:8, padding:'6px 10px', minWidth:44 }}>
                <div style={{ color:'#002855', fontWeight:900, fontSize:20, lineHeight:1 }}>{String(v).padStart(2,'0')}</div>
                <div style={{ color:'#6B7A8D', fontSize:9, letterSpacing:1 }}>{l}</div>
              </div>
            ))}
          </div>
        )}
        {started && (
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(0,150,57,0.1)', borderRadius:20, padding:'5px 12px', marginBottom:14 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:'#009639', animation:'pulse-g 1.5s infinite' }} />
            <span style={{ color:'#009639', fontWeight:800, fontSize:12 }}>Torneio em andamento!</span>
          </div>
        )}

        {/* Botões */}
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onPalpites} className="btn-green" style={{ flex:1, fontSize:13, padding:'11px 12px', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            <span>FAZER PALPITES</span> 🎯
          </button>
          <button onClick={onJogos} className="btn-outline" style={{ flex:1, fontSize:13, padding:'11px 12px', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            <span>VER JOGOS</span> 📅
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Stats strip ───────────────────────────────────────────────────────────────
function StatsStrip({ participant, stats, totalParticipants, myRank }) {
  return (
    <div style={{ background:'#fff', borderRadius:16, margin:'0 12px', padding:'16px 8px', boxShadow:'0 2px 12px rgba(0,40,85,0.07)', border:'1px solid #E2EAF0', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:4, position:'relative', zIndex:2, marginTop:-2 }}>
      {[
        { icon:<Users size={22} color="#009639" />, label:'PARTICIPANTES', value: totalParticipants, sub:'Ver todos', subColor:'#009639' },
        { icon:<Trophy size={22} color="#1A73E8" />, label:'SUA POSIÇÃO', value: myRank ? `${myRank}º` : '—', sub: myRank ? `de ${totalParticipants}` : '—', subColor:'#6B7A8D' },
        { icon:<Star size={22} color="#F5A623" />, label:'SEUS PONTOS', value: stats.points, sub:'Ver pontuação', subColor:'#009639' },
        { icon:<Calendar size={22} color="#7B2FBE" />, label:'RODADA ATUAL', value:'Grupos', sub:'Em andamento', subColor:'#7B2FBE' },
      ].map(({ icon, label, value, sub, subColor }) => (
        <div key={label} style={{ textAlign:'center', padding:'4px 2px' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:4 }}>{icon}</div>
          <div style={{ color:'#9BABB8', fontSize:8, fontWeight:700, letterSpacing:.8, textTransform:'uppercase', marginBottom:2 }}>{label}</div>
          <div style={{ color:'#002855', fontWeight:900, fontSize:18, lineHeight:1, marginBottom:2 }}>{value}</div>
          <div style={{ color:subColor, fontSize:9, fontWeight:700 }}>{sub}</div>
        </div>
      ))}
    </div>
  )
}

// ── Próximos Jogos ────────────────────────────────────────────────────────────
function UpcomingMatches({ onVerTodos }) {
  const now = new Date()
  const next = GROUP_MATCHES.filter(m => new Date(m.date) > now).slice(0, 3)
  const display = next.length > 0 ? next : GROUP_MATCHES.slice(0, 3)

  return (
    <div style={{ background:'#fff', borderRadius:16, padding:'16px', boxShadow:'0 2px 12px rgba(0,40,85,0.06)', border:'1px solid #E2EAF0' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <span style={{ color:'#002855', fontWeight:900, fontSize:15 }}>Próximos Jogos</span>
        <button onClick={onVerTodos} style={{ color:'#009639', fontSize:12, fontWeight:800, background:'none', border:'none', cursor:'pointer', fontFamily:'Nunito,sans-serif' }}>Ver tabela completa</button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {display.map(m => {
          const open = isMatchOpen(m)
          return (
            <div key={m.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'#F4F6F9', borderRadius:12, border:'1px solid #E2EAF0' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, flex:1 }}>
                <span style={{ fontSize:28 }}>{getFlag(m.team1)}</span>
                <span style={{ color:'#6B7A8D', fontWeight:900, fontSize:11 }}>X</span>
                <span style={{ fontSize:28 }}>{getFlag(m.team2)}</span>
              </div>
              <div style={{ flex:2, lineHeight:1.3 }}>
                <div style={{ color:'#002855', fontWeight:800, fontSize:11 }}>{formatDate(m.date)}</div>
                <div style={{ color:'#6B7A8D', fontSize:10 }}>Grupo {m.group} · {m.city}</div>
              </div>
              <div>
                <Bell size={14} color={open ? '#009639' : '#E2EAF0'} />
              </div>
            </div>
          )
        })}
      </div>
      <button onClick={onVerTodos} style={{ width:'100%', marginTop:12, padding:'10px', background:'none', border:'none', cursor:'pointer', color:'#002855', fontWeight:800, fontSize:12, fontFamily:'Nunito,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
        VER TODOS OS JOGOS <ChevronRight size={14} />
      </button>
    </div>
  )
}

// ── Top 5 ─────────────────────────────────────────────────────────────────────
function Top5({ participant, ranking }) {
  const navigate = useNavigate()
  return (
    <div style={{ background:'#fff', borderRadius:16, padding:'16px', boxShadow:'0 2px 12px rgba(0,40,85,0.06)', border:'1px solid #E2EAF0' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <span style={{ color:'#002855', fontWeight:900, fontSize:15 }}>Top 5 Participantes</span>
        <button onClick={()=>navigate('/ranking')} style={{ color:'#009639', fontSize:12, fontWeight:800, background:'none', border:'none', cursor:'pointer', fontFamily:'Nunito,sans-serif' }}>Ver ranking completo</button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {ranking.map((p, i) => {
          const isMe = p.id === participant.id
          return (
            <div key={p.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:12, background: isMe ? '#e8f5ee' : 'transparent', border: isMe ? '1px solid rgba(0,150,57,0.2)' : '1px solid transparent' }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background: i===0?'#FEF3DC':i===1?'#F4F6F9':i===2?'#FFF0E6':'#F4F6F9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:900, color: i===0?'#D4890A':i===1?'#6B7A8D':i===2?'#C96A2A':'#6B7A8D', flexShrink:0 }}>
                {i+1}
              </div>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#E2EAF0,#F4F6F9)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                {p.avatar_emoji}
              </div>
              <span style={{ flex:1, color: isMe ? '#009639' : '#002855', fontWeight: isMe ? 800 : 700, fontSize:13 }}>
                {p.name}{isMe && ' (Você)'}
              </span>
              <span style={{ color: isMe ? '#009639' : '#6B7A8D', fontWeight:900, fontSize:13 }}>
                {p.total_points || 0} pts
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Banners ───────────────────────────────────────────────────────────────────
function Banners({ prize }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
      {/* Prêmio */}
      <div style={{ background:'#fff', borderRadius:16, padding:'16px 14px', boxShadow:'0 2px 12px rgba(0,40,85,0.06)', border:'1px solid #E2EAF0', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:4, bottom:-4, fontSize:52, opacity:.2 }}>🥈</div>
        <div style={{ color:'#6B7A8D', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Prêmio para o Campeão</div>
        <div style={{ color:'#009639', fontWeight:900, fontSize:20, lineHeight:1.1 }}>{prize || 'A definir'}</div>
        <div style={{ color:'#6B7A8D', fontSize:10, marginTop:3, marginBottom:10 }}>E muito mais prêmios!</div>
        <button className="btn-green" style={{ fontSize:10, padding:'7px 10px', letterSpacing:.5 }}>VER TODOS OS PRÊMIOS</button>
      </div>

      {/* Slogan */}
      <div style={{ borderRadius:16, padding:'16px 14px', background:'linear-gradient(135deg,#002855 0%,#009639 100%)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:-8, bottom:-8, fontSize:52, opacity:.2 }}>⚽</div>
        <div style={{ color:'#fff', fontWeight:900, fontSize:14, lineHeight:1.3, position:'relative', zIndex:1 }}>
          Confiabilidade<br/>é nosso DNA.<br/>
          <span style={{ color:'#F5A623' }}>A vitória<br/>pode ser sua!</span>
        </div>
      </div>
    </div>
  )
}

// ── Dashboard principal ───────────────────────────────────────────────────────
export default function Dashboard({ participant, onLogout }) {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ points:0, done:0 })
  const [ranking, setRanking] = useState([])
  const [totalParts, setTotalParts] = useState(0)
  const [myRank, setMyRank] = useState(null)
  const openCount = GROUP_MATCHES.filter(isMatchOpen).length

  const fetchData = useCallback(async () => {
    const [{ data: preds }, { data: parts }] = await Promise.all([
      supabase.from('predictions').select('points').eq('participant_id', participant.id),
      supabase.from('participants').select('id,name,avatar_emoji,total_points').order('total_points',{ascending:false}).limit(5),
    ])
    setStats({ points: preds?.reduce((s,p)=>s+(p.points||0),0)||0, done: preds?.length||0 })
    setRanking(parts||[])

    const { count } = await supabase.from('participants').select('*',{count:'exact',head:true})
    setTotalParts(count||0)

    const { data: allParts } = await supabase.from('participants').select('id').order('total_points',{ascending:false})
    const idx = allParts?.findIndex(p=>p.id===participant.id)
    setMyRank(idx !== undefined && idx >= 0 ? idx+1 : null)
  }, [participant.id])

  useEffect(() => {
    fetchData()
    const ch = supabase.channel('dash-rt').on('postgres_changes',{event:'UPDATE',schema:'public',table:'participants'},fetchData).subscribe()
    return () => supabase.removeChannel(ch)
  }, [fetchData])

  return (
    <div style={{ minHeight:'100vh', background:'#F4F6F9', paddingBottom:80 }}>
      <Header participant={participant} onLogout={onLogout} />

      {/* Aviso palpites abertos */}
      {openCount > 0 && (
        <div style={{ position:'fixed', top:58, left:0, right:0, zIndex:40, background:'#F5A623', padding:'8px 16px', display:'flex', alignItems:'center', gap:8 }}>
          <AlertCircle size={14} color="#002855" />
          <span style={{ color:'#002855', fontWeight:800, fontSize:12 }}>⚠️ {openCount} jogo{openCount!==1?'s':''} com palpite em aberto!</span>
          <button onClick={()=>navigate('/palpites')} style={{ marginLeft:'auto', background:'#002855', color:'#fff', border:'none', borderRadius:8, padding:'4px 10px', fontWeight:800, fontSize:11, cursor:'pointer', fontFamily:'Nunito,sans-serif' }}>FAZER AGORA</button>
        </div>
      )}

      <div style={{ paddingTop: openCount > 0 ? 96 : 60 }}>
        <Hero onPalpites={()=>navigate('/palpites')} onJogos={()=>navigate('/palpites')} />

        <div style={{ padding:'0 12px', display:'flex', flexDirection:'column', gap:14, marginTop:14 }}>
          <StatsStrip participant={participant} stats={stats} totalParticipants={totalParts} myRank={myRank} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <UpcomingMatches onVerTodos={()=>navigate('/palpites')} />
            <Top5 participant={participant} ranking={ranking} />
          </div>

          <Banners prize="R$ 5.000,00" />

          {/* Tabela de pontuação */}
          <div style={{ background:'#fff', borderRadius:16, padding:'16px', boxShadow:'0 2px 12px rgba(0,40,85,0.06)', border:'1px solid #E2EAF0' }}>
            <div style={{ color:'#002855', fontWeight:900, fontSize:15, marginBottom:12 }}>📋 Regras de Pontuação</div>
            {[['Placar exato','#D4890A','rgba(245,166,35,0.12)','+3 pts'],['Resultado correto','#007a2e','rgba(0,150,57,0.10)','+1 pt'],['Campeão correto','#D4890A','rgba(245,166,35,0.12)','+10 pts'],['Vice correto','#007a2e','rgba(0,150,57,0.10)','+5 pts'],['3º lugar correto','#007a2e','rgba(0,150,57,0.10)','+3 pts'],['Resultado errado','#C0392B','rgba(220,53,69,0.08)','0 pts']].map(([l,c,bg,pts]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:'1px solid #F4F6F9' }}>
                <span style={{ color:'#6B7A8D', fontSize:13 }}>{l}</span>
                <span style={{ background:bg, color:c, borderRadius:20, padding:'3px 12px', fontSize:12, fontWeight:800 }}>{pts}</span>
              </div>
            ))}
            <div style={{ color:'#9BABB8', fontSize:11, marginTop:10 }}>Palpites de jogos fecham 30 min antes. Palpite Final fecha em 11/06.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
