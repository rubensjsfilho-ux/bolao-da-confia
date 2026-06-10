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

function GoalPopup({ event, onClose }) {
  useEffect(() => {
    if (!event) return
    const t = setTimeout(onClose, 5000)
    return () => clearTimeout(t)
  }, [event, onClose])

  if (!event) return null
  const { team1, team2, score1, score2, scoringTeam } = event
  const isTeam1 = scoringTeam === 1

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, zIndex:9999,
      display:'flex', alignItems:'center', justifyContent:'center',
      background:'rgba(0,0,0,0.65)', backdropFilter:'blur(6px)',
      animation:'fdIn .3s ease', cursor:'pointer',
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:'linear-gradient(135deg,#001a00 0%,#002855 100%)',
        borderRadius:24, padding:'28px 32px', textAlign:'center',
        boxShadow:'0 0 0 2px rgba(245,166,35,0.5), 0 24px 60px rgba(0,0,0,0.6)',
        maxWidth:320, width:'90%',
        animation:'popIn .4s cubic-bezier(0.175,0.885,0.32,1.275)',
      }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#F5A623', borderRadius:20, padding:'4px 16px', marginBottom:18 }}>
          <span style={{ fontSize:16 }}>⚽</span>
          <span style={{ color:'#000', fontWeight:900, fontSize:13, letterSpacing:3 }}>G O L !</span>
          <span style={{ fontSize:16 }}>⚽</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:14, marginBottom:16 }}>
          <div style={{ textAlign:'center', opacity:isTeam1?1:0.45, transition:'opacity .3s' }}>
            <div style={{ fontSize:36 }}>{getFlag(team1)}</div>
            <div style={{ color:'#fff', fontSize:11, fontWeight:700, marginTop:4, maxWidth:72, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{team1}</div>
          </div>
          <div style={{ background:'rgba(245,166,35,0.15)', border:'1px solid rgba(245,166,35,0.35)', borderRadius:14, padding:'8px 18px' }}>
            <div style={{ fontWeight:900, fontSize:38, lineHeight:1, letterSpacing:2 }}>
              <span style={{ color:isTeam1?'#F5A623':'rgba(255,255,255,0.4)' }}>{score1}</span>
              <span style={{ color:'rgba(255,255,255,0.25)', margin:'0 6px' }}>×</span>
              <span style={{ color:!isTeam1?'#F5A623':'rgba(255,255,255,0.4)' }}>{score2}</span>
            </div>
          </div>
          <div style={{ textAlign:'center', opacity:!isTeam1?1:0.45, transition:'opacity .3s' }}>
            <div style={{ fontSize:36 }}>{getFlag(team2)}</div>
            <div style={{ color:'#fff', fontSize:11, fontWeight:700, marginTop:4, maxWidth:72, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{team2}</div>
          </div>
        </div>
        <div style={{ color:'rgba(255,255,255,0.35)', fontSize:11 }}>Toque para fechar</div>
      </div>
      <style>{`
        @keyframes fdIn  { from{opacity:0}            to{opacity:1} }
        @keyframes popIn { from{transform:scale(0.5);opacity:0} to{transform:scale(1);opacity:1} }
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

  // ── Realtime: carrega placares iniciais ANTES de escutar mudanças ──────────
  useEffect(() => {
    supabase.from('matches').select('id,score1,score2')
      .then(({ data }) => {
        ;(data || []).forEach(m => {
          prevScores.current[m.id] = {
            score1: m.score1 ?? null,
            score2: m.score2 ?? null,
          }
        })
      })

    const channel = supabase
      .channel('goal-alerts-app')
      .on('postgres_changes', { event:'UPDATE', schema:'public', table:'matches' }, (payload) => {
        const match = payload.new
        if (match.is_finished) return
        const prev  = prevScores.current[match.id]
        const newS1 = match.score1 ?? null
        const newS2 = match.score2 ?? null

        if (newS1 !== null && newS2 !== null && prev) {
          const scoringTeam =
            newS1 > (prev.score1 ?? -1) ? 1 :
            newS2 > (prev.score2 ?? -1) ? 2 : null
          if (scoringTeam) {
            setGoalEvent({ team1:match.team1, team2:match.team2, score1:newS1, score2:newS2, scoringTeam })
          }
        }
        prevScores.current[match.id] = { score1:newS1, score2:newS2 }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
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
