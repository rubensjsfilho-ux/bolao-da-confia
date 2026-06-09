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

// ── Popup de gol ──────────────────────────────────────────────────────────────
function GoalPopup({ event, onClose }) {
  useEffect(() => {
    if (!event) return
    const t = setTimeout(onClose, 4500)
    return () => clearTimeout(t)
  }, [event])

  if (!event) return null
  const { team1, team2, score1, score2, scoringTeam } = event
  const isTeam1 = scoringTeam === 1

  return (
    <div style={{ position:'fixed', top:24, left:'50%', transform:'translateX(-50%)', zIndex:9999, pointerEvents:'none' }}>
      <style>{`
        @keyframes goalSlideIn { from{opacity:0;transform:translateX(-50%) translateY(-20px) scale(0.9)} to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)} }
        @keyframes goalPulse { 0%,100%{box-shadow:0 0 0 0 rgba(245,166,35,0.5)} 50%{box-shadow:0 0 0 12px rgba(245,166,35,0)} }
      `}</style>
      <div style={{ background:'linear-gradient(135deg,#011901,#0a2e0a)', border:'2px solid #F5A623', borderRadius:16, padding:'14px 24px', display:'flex', flexDirection:'column', alignItems:'center', gap:8, minWidth:260, animation:'goalSlideIn 0.4s ease, goalPulse 0.8s ease 0.4s 2', boxShadow:'0 8px 32px rgba(0,0,0,0.6)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:22 }}>⚽</span>
          <span style={{ color:'#F5A623', fontWeight:900, fontSize:20, letterSpacing:4 }}>G O L !</span>
          <span style={{ fontSize:22 }}>⚽</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, opacity:isTeam1?1:0.5 }}>
            <span style={{ fontSize:28 }}>{getFlag(team1)}</span>
            <span style={{ color:'#fff', fontSize:10, fontWeight:700, maxWidth:72, textAlign:'center', lineHeight:1.2 }}>{team1}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(245,166,35,0.15)', border:'1px solid rgba(245,166,35,0.3)', borderRadius:10, padding:'6px 14px' }}>
            <span style={{ color:isTeam1?'#F5A623':'rgba(255,255,255,0.6)', fontSize:28, fontWeight:900, minWidth:24, textAlign:'center' }}>{score1}</span>
            <span style={{ color:'rgba(255,255,255,0.4)', fontWeight:900 }}>×</span>
            <span style={{ color:!isTeam1?'#F5A623':'rgba(255,255,255,0.6)', fontSize:28, fontWeight:900, minWidth:24, textAlign:'center' }}>{score2}</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, opacity:!isTeam1?1:0.5 }}>
            <span style={{ fontSize:28 }}>{getFlag(team2)}</span>
            <span style={{ color:'#fff', fontSize:10, fontWeight:700, maxWidth:72, textAlign:'center', lineHeight:1.2 }}>{team2}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── App principal ─────────────────────────────────────────────────────────────
function App() {
  const [participant, setParticipant] = useState(null)
  const [loading, setLoading]         = useState(true)
  const [goalEvent, setGoalEvent]     = useState(null)
  const prevScores = useRef({})

  const loadParticipant = async (userId) => {
    const { data } = await supabase
      .from('participants')
      .select('*')
      .eq('user_id', userId)
      .single()
    if (data) {
      setParticipant({
        id:       data.id,
        name:     data.name,
        avatar:   data.avatar_emoji,
        photoUrl: data.avatar_url,
        isAdmin:  data.is_admin === true,
      })
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) loadParticipant(session.user.id)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) loadParticipant(session.user.id)
      else { setParticipant(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  // ── Realtime: detecta gol ─────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('goal-alerts')
      .on('postgres_changes', { event:'UPDATE', schema:'public', table:'matches' }, (payload) => {
        const match = payload.new
        if (match.is_finished) return
        const prev = prevScores.current[match.id]
        const newS1 = match.score1 ?? null
        const newS2 = match.score2 ?? null
        if (prev && newS1 !== null && newS2 !== null) {
          const scoringTeam =
            newS1 > prev.score1 ? 1 :
            newS2 > prev.score2 ? 2 : null
          if (scoringTeam) {
            setGoalEvent({ team1:match.team1, team2:match.team2, score1:newS1, score2:newS2, scoringTeam })
          }
        }
        prevScores.current[match.id] = { score1:newS1, score2:newS2 }
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    setParticipant(null)
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#F4F6F9', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12 }}>
      <div style={{ fontSize:48, animation:'spin 1s linear infinite' }}>⚽</div>
      <div style={{ color:'#009639', fontWeight:800, fontSize:14 }}>Carregando...</div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const updateParticipant = (updated) => setParticipant(updated)
  const props = { participant, onLogout: logout, onUpdate: updateParticipant }

  return (
    <>
      <GoalPopup event={goalEvent} onClose={() => setGoalEvent(null)} />
      <Routes>
        <Route path="/"               element={!participant ? <Login onLogin={setParticipant}/> : <Navigate to="/dashboard" replace/>} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard"  element={participant ? <Dashboard   {...props}/> : <Navigate to="/" replace/>} />
        <Route path="/palpites"   element={participant ? <Predictions {...props}/> : <Navigate to="/" replace/>} />
        <Route path="/ranking"    element={participant ? <Rankings    {...props}/> : <Navigate to="/" replace/>} />
        <Route path="/campeao"    element={participant ? <Champion    {...props}/> : <Navigate to="/" replace/>} />
        <Route path="/premios"    element={participant ? <Prizes      {...props}/> : <Navigate to="/" replace/>} />
        <Route path="/chaveamento"element={participant ? <Bracket     {...props}/> : <Navigate to="/" replace/>} />
        <Route path="/grupos"     element={participant ? <Groups      {...props}/> : <Navigate to="/" replace/>} />
        <Route path="/mata-mata"  element={participant ? <KnockoutPredictions {...props}/> : <Navigate to="/" replace/>} />
        <Route path="/perfil"     element={participant ? <Profile participant={participant} onUpdate={updateParticipant}/> : <Navigate to="/" replace/>} />
        <Route path="/admin"
          element={!participant ? <Navigate to="/" replace/> : participant.isAdmin ? <Admin /> : <Navigate to="/dashboard" replace/>}
        />
        <Route path="*" element={<Navigate to="/" replace/>} />
      </Routes>
    </>
  )
}

export default App
