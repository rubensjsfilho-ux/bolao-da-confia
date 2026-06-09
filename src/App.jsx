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
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [event])

  if (!event) return null

  const { team1, team2, score1, score2, scoringTeam } = event
  const isTeam1 = scoringTeam === 1

  return (
    <div style={{
      position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, animation: 'goalSlideIn 0.4s ease',
      pointerEvents: 'none',
    }}>
      <style>{`
        @keyframes goalSlideIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px) scale(0.9); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0)     scale(1);   }
        }
        @keyframes goalPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245,166,35,0.5); }
          50%       { box-shadow: 0 0 0 12px rgba(245,166,35,0); }
        }
      `}</style>
      <div style={{
        background: 'linear-gradient(135deg, #011901 0%, #0a2e0a 100%)',
        border: '2px solid #F5A623',
        borderRadius: 16,
        padding: '14px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        minWidth: 260,
        animation: 'goalPulse 0.8s ease 0.4s 2',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>⚽</span>
          <span style={{ color: '#F5A623', fontWeight: 900, fontSize: 20, letterSpacing: 4 }}>G O L !</span>
          <span style={{ fontSize: 22 }}>⚽</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, opacity: isTeam1 ? 1 : 0.5 }}>
            <span style={{ fontSize: 28 }}>{getFlag(team1)}</span>
            <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>{team1}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{score1}</span>
            <span>×</span>
            <span>{score2}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, opacity: !isTeam1 ? 1 : 0.5 }}>
            <span style={{ fontSize: 28 }}>{getFlag(team2)}</span>
            <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>{team2}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── App principal ─────────────────────────────────────────────────────────────
function App() {
  const [participant, setParticipant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [goalEvent, setGoalEvent] = useState(null)
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false)

  const prevScores = useRef({})

  const loadParticipant = async (userId) => {
    const { data } = await supabase
      .from('participants')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (data) {
      setParticipant({
        id: data.id,
        name: data.name,
        avatar: data.avatar_emoji,
        photoUrl: data.avatar_url,
        isAdmin: data.is_admin === true,
      })
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) loadParticipant(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'PASSWORD_RECOVERY') {
        setIsRecoveringPassword(true)
        setLoading(false)
        return
      }
      if (session) loadParticipant(session.user.id)
      else { setParticipant(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('goal-alerts')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches' }, (payload) => {
        const match = payload.new
        const prev = prevScores.current[match.id]

        if (prev && match.score1 > prev.score1) {
          setGoalEvent({ ...match, scoringTeam: 1 })
        } else if (prev && match.score2 > prev.score2) {
          setGoalEvent({ ...match, scoringTeam: 2 })
        }

        prevScores.current[match.id] = { score1: match.score1, score2: match.score2 }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    setParticipant(null)
  }

  if (loading) return <div>Carregando...</div>

  if (isRecoveringPassword) return <Navigate to="/redefinir-senha" replace />

  const props = { participant, onLogout: logout }

  return (
    <>
      <GoalPopup event={goalEvent} onClose={() => setGoalEvent(null)} />

      <Routes>
        <Route path="/" element={!participant ? <Login onLogin={setParticipant}/> : <Navigate to="/dashboard" replace/>} />
        <Route path="/dashboard" element={<Dashboard {...props}/>}/>
        <Route path="/palpites" element={<Predictions {...props}/>}/>
        <Route path="/ranking" element={<Rankings {...props}/>}/>
        <Route path="/campeao" element={<Champion {...props}/>}/>
        <Route path="/premios" element={<Prizes {...props}/>}/>
        <Route path="/admin" element={<Admin/>}/>
      </Routes>
    </>
  )
}

export default App