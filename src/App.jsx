import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Predictions from './pages/Predictions'
import Rankings from './pages/Rankings'
import Champion from './pages/Champion'
import Prizes from './pages/Prizes'
import Admin from './pages/Admin'

function App() {
  const [participant, setParticipant] = useState(null)
  const [loading, setLoading]         = useState(true)

  // Busca o participante pelo user_id do auth
  const loadParticipant = async (userId) => {
    const { data } = await supabase
      .from('participants')
      .select('*')
      .eq('user_id', userId)
      .single()
    if (data) {
      setParticipant({ id: data.id, name: data.name, avatar: data.avatar_emoji, photoUrl: data.avatar_url })
    }
  }

  useEffect(() => {
    // Verifica sessão existente ao abrir o app
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) loadParticipant(session.user.id)
      setLoading(false)
    })

    // Escuta mudanças de auth (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) loadParticipant(session.user.id)
      else { setParticipant(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    setParticipant(null)
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#F4F6F9', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12 }}>
      <div style={{ fontSize:48, animation:'spin 1s linear infinite' }}>⚽</div>
      <div style={{ color:'#009639', fontWeight:800, fontSize:14 }}>Carregando...</div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  )

  const props = { participant, onLogout: logout }
  return (
    <Routes>
      <Route path="/"          element={!participant ? <Login onLogin={setParticipant}/> : <Navigate to="/dashboard" replace/>} />
      <Route path="/dashboard" element={participant ? <Dashboard   {...props}/> : <Navigate to="/" replace/>} />
      <Route path="/palpites"  element={participant ? <Predictions {...props}/> : <Navigate to="/" replace/>} />
      <Route path="/ranking"   element={participant ? <Rankings    {...props}/> : <Navigate to="/" replace/>} />
      <Route path="/campeao"   element={participant ? <Champion    {...props}/> : <Navigate to="/" replace/>} />
      <Route path="/premios"   element={participant ? <Prizes      {...props}/> : <Navigate to="/" replace/>} />
      <Route path="/admin"     element={<Admin />} />
      <Route path="*"          element={<Navigate to="/" replace/>} />
    </Routes>
  )
}

export default App
