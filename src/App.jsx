import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabase'
import { getFlag } from './data/matches'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Predictions from './pages/Predictions'
import Rankings from './pages/Rankings'
import Champion from './pages/Champion'
import Prizes from './pages/Prizes'
import Admin from './pages/Admin'
import Bracket from './pages/Bracket'
import Groups from './pages/Groups'
import KnockoutPredictions from './pages/KnockoutPredictions'
import Profile from './pages/Profile'
import ResetPassword from './pages/ResetPassword'

// ── Confetti particle
function Particle({ x, color, delay }) {
  const shapes = ['circle','rect','triangle']
  const shape  = shapes[Math.floor(Math.random()*3)]
  const size   = 6 + Math.random()*8
  const rot    = Math.random()*360
  const drift  = (Math.random()-0.5)*120
  return (
    <div style={{
      position:'absolute', top:0, left: x+'%',
      width:size, height:size,
      background: shape==='triangle'?'transparent':color,
      borderRadius: shape==='circle'?'50%':'2px',
      borderLeft:  shape==='triangle'?size/2+'px solid transparent':undefined,
      borderRight: shape==='triangle'?size/2+'px solid transparent':undefined,
      borderBottom:shape==='triangle'?size+'px solid '+color:undefined,
      transform: 'rotate('+rot+'deg)',
      animation: 'confettiFall 2.4s '+delay+'s ease-in forwards',
      '--drift': drift+'px',
      opacity:0,
      pointerEvents:'none',
    }}/>
  )
}

function GoalPopup({ event, onClose }) {
  const [phase, setPhase] = useState('hidden') // hidden → burst → show → exit
  const timerRef = useRef(null)

  useEffect(() => {
    if (!event) { setPhase('hidden'); return }
    setPhase('burst')
    const t1 = setTimeout(() => setPhase('show'),  400)
    const t2 = setTimeout(() => setPhase('exit'),  5500)
    const t3 = setTimeout(() => { setPhase('hidden'); onClose() }, 6100)
    timerRef.current = [t1,t2,t3]
    return () => timerRef.current?.forEach(clearTimeout)
  }, [event])

  if (phase === 'hidden' || !event) return null

  const { team1, team2, score1, score2, scoringTeam, group } = event
  const isTeam1    = scoringTeam === 1
  const scorerTeam = isTeam1 ? team1 : team2
  const scorerFlag = getFlag(scorerTeam)

  const confettiColors = ['#F5A623','#FFD700','#009639','#00c44f','#fff','#1A73E8','#e53535']
  const particles = Array.from({length:38}, (_,i) => ({
    x: Math.random()*100,
    color: confettiColors[i % confettiColors.length],
    delay: Math.random()*0.6,
  }))

  const handleClose = () => {
    timerRef.current?.forEach(clearTimeout)
    setPhase('exit')
    setTimeout(() => { setPhase('hidden'); onClose() }, 500)
  }

  return (
    <div onClick={handleClose} style={{
      position:'fixed', inset:0, zIndex:9999,
      display:'flex', alignItems:'center', justifyContent:'center',
      background: phase==='exit' ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.72)',
      backdropFilter: phase==='exit' ? 'blur(0px)' : 'blur(8px)',
      transition:'background .5s, backdrop-filter .5s',
      cursor:'pointer',
      overflow:'hidden',
    }}>

      {/* Confetti */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
        {particles.map((p,i) => <Particle key={i} {...p}/>)}
      </div>

      {/* Anel de luz pulsante */}
      <div style={{
        position:'absolute',
        width:320, height:320,
        borderRadius:'50%',
        background:'radial-gradient(circle, rgba(245,166,35,0.18) 0%, transparent 70%)',
        animation:'ringPulse 1.2s ease-in-out infinite',
        pointerEvents:'none',
      }}/>

      {/* Card principal */}
      <div onClick={e=>e.stopPropagation()} style={{
        position:'relative',
        background:'linear-gradient(160deg, #0a1f0a 0%, #001833 60%, #000d00 100%)',
        borderRadius:28,
        padding:'0 0 24px',
        textAlign:'center',
        boxShadow:'0 0 0 1.5px rgba(245,166,35,0.6), 0 0 60px rgba(245,166,35,0.25), 0 32px 80px rgba(0,0,0,0.7)',
        maxWidth:310, width:'88%',
        overflow:'hidden',
        transform: phase==='burst'?'scale(0.3) rotate(-8deg)' : phase==='exit'?'scale(0.85) translateY(-20px)':'scale(1) rotate(0deg)',
        opacity: phase==='burst'?0 : phase==='exit'?0:1,
        transition: phase==='burst'
          ? 'transform .45s cubic-bezier(0.175,0.885,0.32,1.4), opacity .3s'
          : phase==='exit'
          ? 'transform .5s ease-in, opacity .5s ease-in'
          : '',
      }}>

        {/* Faixa topo — GOL! */}
        <div style={{
          background:'linear-gradient(90deg, #b8730a, #F5A623, #FFD700, #F5A623, #b8730a)',
          padding:'12px 0 10px',
          marginBottom:20,
          position:'relative',
          overflow:'hidden',
        }}>
          {/* Brilho animado */}
          <div style={{
            position:'absolute', inset:0,
            background:'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)',
            animation:'shimmerBar 1.8s ease-in-out infinite',
          }}/>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, position:'relative' }}>
            <span style={{ fontSize:22, animation:'ballSpin .6s ease-in-out infinite alternate' }}>⚽</span>
            <span style={{ color:'#000', fontWeight:900, fontSize:22, letterSpacing:6, textTransform:'uppercase' }}>GOL!</span>
            <span style={{ fontSize:22, animation:'ballSpin .6s .3s ease-in-out infinite alternate' }}>⚽</span>
          </div>
        </div>

        {/* Quem fez */}
        <div style={{ marginBottom:18, padding:'0 20px' }}>
          <div style={{ fontSize:44, marginBottom:4, animation:'flagBounce .6s ease-in-out infinite alternate' }}>{scorerFlag}</div>
          <div style={{ color:'#fff', fontWeight:900, fontSize:18, letterSpacing:.5, textShadow:'0 2px 12px rgba(245,166,35,0.6)' }}>{scorerTeam}</div>
          {group && <div style={{ color:'rgba(255,255,255,0.35)', fontSize:10, marginTop:2, fontWeight:700, letterSpacing:1 }}>GRUPO {group}</div>}
        </div>

        {/* Placar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, marginBottom:20, padding:'0 20px' }}>
          <div style={{ textAlign:'center', flex:1, opacity:isTeam1?1:0.35 }}>
            <div style={{ fontSize:28 }}>{getFlag(team1)}</div>
            <div style={{ color:'#fff', fontSize:10, fontWeight:700, marginTop:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{team1}</div>
          </div>

          <div style={{
            background:'rgba(245,166,35,0.12)',
            border:'2px solid rgba(245,166,35,0.5)',
            borderRadius:16, padding:'10px 16px',
            boxShadow:'0 0 20px rgba(245,166,35,0.3)',
            flexShrink:0,
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{
                fontWeight:900, fontSize:40, lineHeight:1,
                color: isTeam1 ? '#F5A623' : 'rgba(255,255,255,0.3)',
                textShadow: isTeam1 ? '0 0 20px rgba(245,166,35,0.8)' : 'none',
                transition:'all .3s',
              }}>{score1}</span>
              <span style={{ color:'rgba(255,255,255,0.2)', fontSize:24, fontWeight:300 }}>×</span>
              <span style={{
                fontWeight:900, fontSize:40, lineHeight:1,
                color: !isTeam1 ? '#F5A623' : 'rgba(255,255,255,0.3)',
                textShadow: !isTeam1 ? '0 0 20px rgba(245,166,35,0.8)' : 'none',
                transition:'all .3s',
              }}>{score2}</span>
            </div>
          </div>

          <div style={{ textAlign:'center', flex:1, opacity:!isTeam1?1:0.35 }}>
            <div style={{ fontSize:28 }}>{getFlag(team2)}</div>
            <div style={{ color:'#fff', fontSize:10, fontWeight:700, marginTop:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{team2}</div>
          </div>
        </div>

        {/* Barra de progresso — fecha em 5s */}
        <div style={{ margin:'0 20px 4px', height:3, background:'rgba(255,255,255,0.08)', borderRadius:2, overflow:'hidden' }}>
          {phase==='show' && (
            <div style={{
              height:'100%', borderRadius:2,
              background:'linear-gradient(90deg,#009639,#F5A623)',
              animation:'progressBar 5s linear forwards',
            }}/>
          )}
        </div>
        <div style={{ color:'rgba(255,255,255,0.2)', fontSize:9, letterSpacing:1 }}>TOQUE PARA FECHAR</div>
      </div>

      <style>{`
        @keyframes confettiFall {
          0%   { transform:translateY(-20px) translateX(0) rotate(0deg);   opacity:1 }
          100% { transform:translateY(110vh) translateX(var(--drift)) rotate(720deg); opacity:0 }
        }
        @keyframes ringPulse  { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.3);opacity:0} }
        @keyframes shimmerBar { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        @keyframes ballSpin   { from{transform:rotate(-15deg) scale(1)} to{transform:rotate(15deg) scale(1.15)} }
        @keyframes flagBounce { from{transform:translateY(0) scale(1)} to{transform:translateY(-6px) scale(1.08)} }
        @keyframes progressBar{ from{width:100%} to{width:0%} }
      `}</style>
    </div>
  )
}

function App() {
  const [participant, setParticipant] = useState(null)
  const [loading, setLoading]         = useState(true)
  const [goalEvent, setGoalEvent]     = useState(null)
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false)
  const prevScores = useRef({})

  const loadParticipant = async (userId) => {
    const { data } = await supabase
      .from('participants').select('*').eq('user_id', userId).single()
    if (data) {
      setParticipant({
        id: data.id, name: data.name,
        avatar: data.avatar_emoji, photoUrl: data.avatar_url,
        isAdmin: data.is_admin === true,
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) loadParticipant(session.user.id)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'PASSWORD_RECOVERY') { setIsRecoveringPassword(true); setLoading(false); return }
      if (session) loadParticipant(session.user.id)
      else { setParticipant(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  // ── Realtime: carrega placares iniciais e escuta gols ───────────────────────
  useEffect(() => {
    // 1. Carrega estado atual de TODOS os placares primeiro
    const initAndListen = async () => {
      const { data } = await supabase.from('matches').select('id,score1,score2,team1,team2')
      ;(data || []).forEach(m => {
        prevScores.current[m.id] = {
          score1: m.score1 ?? null,
          score2: m.score2 ?? null,
        }
      })

      // 2. Só assina o canal DEPOIS de ter o estado inicial
      const channel = supabase
        .channel('goal-alerts-app')
        .on('postgres_changes', { event:'UPDATE', schema:'public', table:'matches' }, (payload) => {
          const match = payload.new
          const newS1 = match.score1 ?? null
          const newS2 = match.score2 ?? null
          const prev  = prevScores.current[match.id] || { score1: null, score2: null }

          // Detecta se houve gol (placar aumentou em qualquer lado)
          if (newS1 !== null && newS2 !== null) {
            const prevS1 = prev.score1 ?? -1
            const prevS2 = prev.score2 ?? -1
            const scoringTeam =
              newS1 > prevS1 ? 1 :
              newS2 > prevS2 ? 2 : null

            if (scoringTeam) {
              setGoalEvent({
                team1: match.team1,
                team2: match.team2,
                score1: newS1,
                score2: newS2,
                scoringTeam,
                group: match.group_letter || match.group || '',
              })
            }
          }

          // Atualiza referência com placar novo
          prevScores.current[match.id] = { score1: newS1, score2: newS2 }
        })
        .subscribe()

      return channel
    }

    let channel
    initAndListen().then(ch => { channel = ch })
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [])

  const logout = async () => { await supabase.auth.signOut(); setParticipant(null) }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#F4F6F9', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12 }}>
      <div style={{ fontSize:48, animation:'spin 1s linear infinite' }}>⚽</div>
      <div style={{ color:'#009639', fontWeight:800, fontSize:14 }}>Carregando...</div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (isRecoveringPassword) return (
    <ResetPassword onDone={() => { setIsRecoveringPassword(false); setParticipant(null) }} />
  )

  const updateParticipant = (updated) => setParticipant(updated)
  const props = { participant, onLogout: logout, onUpdate: updateParticipant }

  return (
    <>
      <GoalPopup event={goalEvent} onClose={() => setGoalEvent(null)} />
      <Routes>
        <Route path="/"            element={!participant ? <Login onLogin={setParticipant}/> : <Navigate to="/dashboard" replace/>} />
        <Route path="/reset-password" element={<ResetPassword onDone={() => { setIsRecoveringPassword(false); setParticipant(null) }}/>} />
        <Route path="/dashboard"   element={participant ? <Dashboard   {...props}/> : <Navigate to="/" replace/>} />
        <Route path="/palpites"    element={participant ? <Predictions {...props}/> : <Navigate to="/" replace/>} />
        <Route path="/ranking"     element={participant ? <Rankings    {...props}/> : <Navigate to="/" replace/>} />
        <Route path="/campeao"     element={participant ? <Champion    {...props}/> : <Navigate to="/" replace/>} />
        <Route path="/premios"     element={participant ? <Prizes      {...props}/> : <Navigate to="/" replace/>} />
        <Route path="/chaveamento" element={participant ? <Bracket     {...props}/> : <Navigate to="/" replace/>} />
        <Route path="/grupos"      element={participant ? <Groups      {...props}/> : <Navigate to="/" replace/>} />
        <Route path="/mata-mata"   element={participant ? <KnockoutPredictions {...props}/> : <Navigate to="/" replace/>} />
        <Route path="/perfil"      element={participant ? <Profile participant={participant} onUpdate={updateParticipant}/> : <Navigate to="/" replace/>} />
        <Route path="/admin"       element={!participant ? <Navigate to="/" replace/> : participant.isAdmin ? <Admin /> : <Navigate to="/dashboard" replace/>} />
        <Route path="*"            element={<Navigate to="/" replace/>} />
      </Routes>
    </>
  )
}

export default App
