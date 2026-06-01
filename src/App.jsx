import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Predictions from './pages/Predictions'
import Rankings from './pages/Rankings'
import Champion from './pages/Champion'
import Admin from './pages/Admin'

function App() {
  const [participant, setParticipant] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('bolao_participant')
    if (stored) {
      try { setParticipant(JSON.parse(stored)) } catch { localStorage.removeItem('bolao_participant') }
    }
    setLoading(false)
  }, [])

  const login = (p) => { setParticipant(p); localStorage.setItem('bolao_participant', JSON.stringify(p)) }
  const logout = () => { setParticipant(null); localStorage.removeItem('bolao_participant') }

  if (loading) return (
    <div className="min-h-screen bg-pitch flex items-center justify-center">
      <div className="text-gold-400 text-4xl font-display tracking-widest animate-pulse">CARREGANDO...</div>
    </div>
  )

  return (
    <Routes>
      <Route path="/"          element={!participant ? <Login onLogin={login} /> : <Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={participant ? <Dashboard  participant={participant} onLogout={logout} /> : <Navigate to="/" replace />} />
      <Route path="/palpites"  element={participant ? <Predictions participant={participant} onLogout={logout} /> : <Navigate to="/" replace />} />
      <Route path="/ranking"   element={participant ? <Rankings   participant={participant} onLogout={logout} /> : <Navigate to="/" replace />} />
      <Route path="/campeao"   element={participant ? <Champion   participant={participant} onLogout={logout} /> : <Navigate to="/" replace />} />
      <Route path="/admin"     element={<Admin />} />
      <Route path="*"          element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
