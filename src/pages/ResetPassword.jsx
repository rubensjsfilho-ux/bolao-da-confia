import { useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

export default function ResetPassword({ onDone }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setError('')
    if (password.length < 6) return setError('A senha deve ter pelo menos 6 caracteres.')
    if (password !== confirm)  return setError('As senhas não coincidem.')

    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (err) return setError(err.message)

    setSuccess(true)
    onDone?.()
    setTimeout(() => navigate('/'), 2500)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F4F6F9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: 36,
        width: '100%',
        maxWidth: 400,
        boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}>
        {/* Cabeçalho */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔒</div>
          <h2 style={{ margin: '0 0 6px', color: '#1a1a1a', fontWeight: 900, fontSize: 22 }}>
            Redefinir senha
          </h2>
          <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
            Digite sua nova senha abaixo
          </p>
        </div>

        {success ? (
          <div style={{
            background: '#e6f9ee',
            border: '1.5px solid #009639',
            borderRadius: 12,
            padding: 18,
            textAlign: 'center',
            color: '#007a2f',
            fontWeight: 700,
            fontSize: 15,
          }}>
            ✅ Senha alterada com sucesso!<br />
            <span style={{ fontWeight: 400, fontSize: 13 }}>Redirecionando para o login...</span>
          </div>
        ) : (
          <>
            {/* Campo nova senha */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#444' }}>Nova senha</label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{
                  border: '1.5px solid #ddd',
                  borderRadius: 10,
                  padding: '12px 14px',
                  fontSize: 15,
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#009639'}
                onBlur={e  => e.target.style.borderColor = '#ddd'}
              />
            </div>

            {/* Campo confirmar senha */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#444' }}>Confirmar nova senha</label>
              <input
                type="password"
                placeholder="Repita a nova senha"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{
                  border: '1.5px solid #ddd',
                  borderRadius: 10,
                  padding: '12px 14px',
                  fontSize: 15,
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#009639'}
                onBlur={e  => e.target.style.borderColor = '#ddd'}
              />
            </div>

            {/* Erro */}
            {error && (
              <div style={{
                background: '#fff0f0',
                border: '1px solid #f5c6cb',
                borderRadius: 8,
                padding: '10px 14px',
                color: '#c0392b',
                fontSize: 13,
                textAlign: 'center',
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Botão */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                background: loading ? '#aaa' : 'linear-gradient(135deg, #009639 0%, #006d2a 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '14px 0',
                fontSize: 16,
                fontWeight: 800,
                cursor: loading ? 'not-allowed' : 'pointer',
                width: '100%',
                letterSpacing: 0.5,
                boxShadow: loading ? 'none' : '0 4px 12px rgba(0,150,57,0.3)',
                transition: 'all 0.2s',
              }}
            >
              {loading ? '⏳ Salvando...' : 'Salvar nova senha'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}