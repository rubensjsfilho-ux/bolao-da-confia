import { useState } from 'react'
import { supabase } from '../supabase'
import { Loader2, Eye, EyeOff, Check } from 'lucide-react'
import { Logo } from '../components/Header'

export default function ResetPassword({ onDone }) {
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)

  const inp = {
    width: '100%', background: '#F4F6F9', border: '1.5px solid #E2EAF0',
    borderRadius: 12, padding: '12px 14px', color: '#002855', fontSize: 14,
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  }

  const handleSubmit = async () => {
    if (password.length < 6)  { setError('A senha deve ter no mínimo 6 caracteres.'); return }
    if (password !== confirm)  { setError('As senhas não coincidem.'); return }

    setLoading(true); setError('')
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (err) {
      setError(err.message || 'Erro ao redefinir senha. Tente novamente.')
    } else {
      setSuccess(true)
      setTimeout(async () => {
        await supabase.auth.signOut()
        onDone()
      }, 2000)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#F4F6F9',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 20, position: 'relative', overflowX: 'hidden',
    }}>
      <svg style={{ position:'absolute', top:0, right:0, width:260, opacity:.12, pointerEvents:'none' }} viewBox="0 0 260 300">
        <ellipse cx="240" cy="50" rx="170" ry="210" fill="#009639" transform="rotate(-20 240 50)"/>
      </svg>
      <svg style={{ position:'absolute', bottom:0, left:0, width:180, opacity:.10, pointerEvents:'none' }} viewBox="0 0 180 180">
        <ellipse cx="0" cy="180" rx="150" ry="130" fill="#F5A623"/>
      </svg>

      <div style={{ marginBottom: 24, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Logo size="lg" />
      </div>

      <div style={{
        width: '100%', maxWidth: 380, background: '#fff',
        borderRadius: 20, padding: 28,
        boxShadow: '0 4px 24px rgba(0,40,85,0.10)',
        border: '1px solid #E2EAF0', position: 'relative', zIndex: 1,
      }}>
        {success ? (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(0,150,57,0.1)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Check size={32} color="#009639" />
            </div>
            <h2 style={{ color: '#002855', fontWeight: 900, fontSize: 22, margin: '0 0 8px' }}>
              Senha redefinida!
            </h2>
            <p style={{ color: '#6B7A8D', fontSize: 13, margin: '0 0 4px' }}>
              Sua nova senha foi salva com sucesso.
            </p>
            <p style={{ color: '#9BABB8', fontSize: 12 }}>
              Redirecionando para o login...
            </p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 8 }}>🔑</div>
              <h2 style={{ color: '#002855', fontWeight: 900, fontSize: 22, margin: '0 0 4px', textAlign: 'center' }}>
                Nova senha
              </h2>
              <p style={{ color: '#6B7A8D', fontSize: 13, margin: 0, textAlign: 'center' }}>
                Escolha uma senha segura para sua conta.
              </p>
            </div>

            <label style={{ color: '#002855', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>
              Nova Senha
            </label>
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <input
                style={{ ...inp, paddingRight: 44 }}
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="Mínimo 6 caracteres"
                autoFocus
              />
              <button type="button" onClick={() => setShowPw(s => !s)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9BABB8', display: 'flex', padding: 0 }}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <label style={{ color: '#002855', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>
              Confirmar Nova Senha
            </label>
            <input
              style={{ ...inp, marginBottom: 20 }}
              type="password"
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setError('') }}
              placeholder="Repita a nova senha"
            />

            {password.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{
                      flex: 1, height: 4, borderRadius: 2,
                      background: password.length >= i * 3
                        ? (password.length >= 9 ? '#009639' : password.length >= 6 ? '#F5A623' : '#E2EAF0')
                        : '#E2EAF0',
                      transition: 'background .2s',
                    }} />
                  ))}
                </div>
                <span style={{ color: password.length >= 9 ? '#009639' : password.length >= 6 ? '#D4890A' : '#C0392B', fontSize: 10, fontWeight: 700 }}>
                  {password.length >= 9 ? '✓ Senha forte' : password.length >= 6 ? '⚠ Senha razoável' : '✗ Senha fraca'}
                </span>
              </div>
            )}

            {error && (
              <div style={{ color: '#C0392B', background: 'rgba(220,53,69,0.07)', borderRadius: 10, padding: '8px 12px', fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%', background: '#009639', color: '#fff',
                border: 'none', borderRadius: 12, padding: '13px',
                fontWeight: 800, fontSize: 15, cursor: 'pointer',
                fontFamily: 'inherit', display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Salvando...</>
                : 'Salvar nova senha'
              }
            </button>
          </>
        )}
      </div>

      <div style={{ color: '#9BABB8', fontSize: 11, marginTop: 18, position: 'relative', zIndex: 1 }}>
        Confiabilidade dentro e fora de campo! ⚽
      </div>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  )
}
