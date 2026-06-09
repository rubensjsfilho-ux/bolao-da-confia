import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { Logo } from '../components/Header'
import { Loader2, Eye, EyeOff, Check } from 'lucide-react'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [showPw,    setShowPw]    = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState(false)
  const [validLink, setValidLink] = useState(false)

  const inp = { width:'100%', background:'#F4F6F9', border:'1.5px solid #E2EAF0', borderRadius:12, padding:'12px 14px', color:'#002855', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }

  useEffect(() => {
    // O Supabase injeta a sessão via hash na URL ao clicar no link do email
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setValidLink(true)
      else setError('Link inválido ou expirado. Solicite um novo.')
    })
  }, [])

  const handleReset = async () => {
    if (password.length < 6) { setError('Senha mínima de 6 caracteres.'); return }
    if (password !== confirm) { setError('As senhas não coincidem.'); return }
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (err) { setError(err.message); return }
    setSuccess(true)
    setTimeout(() => navigate('/'), 2500)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#F4F6F9', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ marginBottom:24 }}><Logo size="lg" /></div>

      <div style={{ width:'100%', maxWidth:380, background:'#fff', borderRadius:20, padding:28, boxShadow:'0 4px 24px rgba(0,40,85,0.10)', border:'1px solid #E2EAF0' }}>
        <h2 style={{ color:'#002855', fontWeight:900, fontSize:22, margin:'0 0 4px' }}>Nova senha</h2>
        <p style={{ color:'#6B7A8D', fontSize:13, margin:'0 0 20px' }}>Digite sua nova senha abaixo.</p>

        {success ? (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(0,150,57,0.1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
              <Check size={28} color="#009639"/>
            </div>
            <div style={{ color:'#009639', fontWeight:800, fontSize:16 }}>Senha alterada!</div>
            <div style={{ color:'#9BABB8', fontSize:13, marginTop:6 }}>Redirecionando para o login...</div>
          </div>
        ) : !validLink ? (
          <div style={{ color:'#C0392B', background:'rgba(220,53,69,0.07)', borderRadius:10, padding:'12px', fontSize:13, textAlign:'center' }}>
            {error || 'Verificando link...'}
            <br/>
            <button onClick={() => navigate('/')} style={{ marginTop:12, background:'#009639', color:'#fff', border:'none', borderRadius:10, padding:'9px 20px', fontWeight:800, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
              Voltar ao login
            </button>
          </div>
        ) : (
          <>
            <label style={{ color:'#002855', fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Nova Senha</label>
            <div style={{ position:'relative', marginBottom:12 }}>
              <input style={{ ...inp, paddingRight:44 }} type={showPw?'text':'password'} value={password} onChange={e=>{setPassword(e.target.value);setError('')}} placeholder="Mínimo 6 caracteres"/>
              <button type="button" onClick={()=>setShowPw(s=>!s)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9BABB8', display:'flex' }}>
                {showPw ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>

            <label style={{ color:'#002855', fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Confirmar Senha</label>
            <input style={{ ...inp, marginBottom:16 }} type="password" value={confirm} onChange={e=>{setConfirm(e.target.value);setError('')}} placeholder="Repita a senha"/>

            {error && <div style={{ color:'#C0392B', background:'rgba(220,53,69,0.07)', borderRadius:10, padding:'8px 12px', fontSize:13, marginBottom:12 }}>{error}</div>}

            <button onClick={handleReset} disabled={loading||!password||!confirm} style={{ width:'100%', background:'#009639', color:'#fff', border:'none', borderRadius:12, padding:'13px', fontWeight:800, fontSize:15, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity:loading?.7:1 }}>
              {loading ? <><Loader2 size={16}/>Salvando...</> : 'Salvar nova senha'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
