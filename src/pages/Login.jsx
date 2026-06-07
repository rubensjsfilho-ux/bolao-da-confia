import { useState, useRef } from 'react'
import { supabase } from '../supabase'
import { Logo } from '../components/Header'
import { Loader2, Eye, EyeOff } from 'lucide-react'

const JOIN_CODE = import.meta.env.VITE_JOIN_CODE || 'confia2026'
const AVATARS   = ['⚽','🏆','🌟','🦁','🔥','⚡','🎯','👑','🐆','🦅']

export default function Login({ onLogin }) {
  const [step,    setStep]    = useState('code')    // code | auth
  const [mode,    setMode]    = useState('login')   // login | register
  const [code,    setCode]    = useState('')
  const [email,   setEmail]   = useState('')
  const [password,setPassword]= useState('')
  const [confirm, setConfirm] = useState('')
  const [name,    setName]    = useState('')
  const [avatar,  setAvatar]  = useState('⚽')
  const [photo,   setPhoto]   = useState(null)
  const [preview, setPreview] = useState(null)
  const [showPw,  setShowPw]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [info,    setInfo]    = useState('')
  const fileRef = useRef()

  const inp = { width:'100%', background:'#F4F6F9', border:'1.5px solid #E2EAF0', borderRadius:12, padding:'12px 14px', color:'#002855', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }

  const handlePhoto = e => {
    const f = e.target.files[0]; if (!f) return
    if (f.size > 5*1024*1024) { setError('Foto muito grande. Máx 5MB.'); return }
    setPhoto(f)
    const r = new FileReader(); r.onload = ev => setPreview(ev.target.result); r.readAsDataURL(f)
    setError('')
  }

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  const handleLogin = async e => {
    e.preventDefault()
    if (!email || !password) { setError('Preencha email e senha.'); return }
    setLoading(true); setError('')
    const { error: authErr } = await supabase.auth.signInWithPassword({ email, password })
    if (authErr) {
      setError(authErr.message.includes('Invalid') ? 'Email ou senha incorretos.' : authErr.message)
      setLoading(false)
    }
    // Se OK, o App.jsx detecta via onAuthStateChange e carrega o participante
  }

  // ── CADASTRO ───────────────────────────────────────────────────────────────
  const handleRegister = async e => {
    e.preventDefault()
    if (!name.trim())         { setError('Digite seu nome.');           return }
    if (!email)               { setError('Digite seu email.');          return }
    if (password.length < 6)  { setError('Senha mínima de 6 caracteres.'); return }
    if (password !== confirm) { setError('As senhas não coincidem.');   return }

    setLoading(true); setError('')
    try {
      // 1. Cria usuário no Supabase Auth
      const { data: authData, error: authErr } = await supabase.auth.signUp({ email, password })
      if (authErr) throw authErr

      const userId = authData.user?.id
      if (!userId) throw new Error('Erro ao criar usuário.')

      // 2. Cria participante na tabela
      const { data: part, error: partErr } = await supabase
        .from('participants')
        .insert([{ name: name.trim(), avatar_emoji: avatar, user_id: userId }])
        .select().single()
      if (partErr) throw partErr

      // 3. Upload da foto (opcional)
      let photoUrl = null
      if (photo) {
        const ext  = photo.name.split('.').pop()
        const path = `${part.id}/avatar.${ext}`
        const { error: upErr } = await supabase.storage.from('avatars').upload(path, photo, { upsert:true })
        if (!upErr) {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
          photoUrl = urlData.publicUrl
          await supabase.from('participants').update({ avatar_url: photoUrl }).eq('id', part.id)
        }
      }

      // 4. Se email confirmado instantaneamente, faz login
      if (authData.session) {
        onLogin({ id: part.id, name: part.name, avatar: part.avatar_emoji, photoUrl })
      } else {
        // Email de confirmação enviado
        setInfo('Conta criada! Verifique seu email para confirmar e depois faça login.')
        setMode('login')
      }
    } catch (err) {
      if (err.message?.includes('already registered')) setError('Este email já está cadastrado. Faça login.')
      else setError(err.message || 'Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // ── ESQUECEU A SENHA ───────────────────────────────────────────────────────
  const handleForgotPassword = async () => {
    if (!email) { setError('Digite seu email primeiro.'); return }
    setLoading(true)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    setLoading(false)
    if (err) setError(err.message)
    else setInfo('Email de redefinição enviado! Verifique sua caixa de entrada.')
  }

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', background:'#F4F6F9', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:20, position:'relative', overflowX:'hidden' }}>
      <svg style={{ position:'absolute', top:0, right:0, width:260, opacity:.12, pointerEvents:'none' }} viewBox="0 0 260 300"><ellipse cx="240" cy="50" rx="170" ry="210" fill="#009639" transform="rotate(-20 240 50)"/></svg>
      <svg style={{ position:'absolute', bottom:0, left:0, width:180, opacity:.10, pointerEvents:'none' }} viewBox="0 0 180 180"><ellipse cx="0" cy="180" rx="150" ry="130" fill="#F5A623"/></svg>

      <div style={{ marginBottom:24, textAlign:'center', position:'relative', zIndex:1 }}><Logo size="lg" /></div>

      <div style={{ width:'100%', maxWidth:380, background:'#fff', borderRadius:20, padding:28, boxShadow:'0 4px 24px rgba(0,40,85,0.10)', border:'1px solid #E2EAF0', position:'relative', zIndex:1 }}>

        {/* PASSO 1 — Código */}
        {step === 'code' && (
          <>
            <h2 style={{ color:'#002855', fontWeight:900, fontSize:22, margin:'0 0 4px' }}>Entrar no Bolão</h2>
            <p style={{ color:'#6B7A8D', fontSize:13, margin:'0 0 20px' }}>Use o código enviado pelo organizador.</p>
            <label style={{ color:'#002855', fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Código do Bolão</label>
            <input style={inp} value={code} onChange={e=>{setCode(e.target.value);setError('')}} placeholder="Digite o código..." autoFocus/>
            {error && <div style={{ color:'#C0392B', background:'rgba(220,53,69,0.07)', borderRadius:10, padding:'8px 12px', fontSize:13, marginTop:10 }}>{error}</div>}
            <button onClick={()=>{ setError('');setStep('auth') }}
              style={{ width:'100%', marginTop:16, background:'#009639', color:'#fff', border:'none', borderRadius:12, padding:'13px', fontWeight:800, fontSize:15, cursor:'pointer', fontFamily:'inherit' }}>
              Continuar →
            </button>
            <div style={{ textAlign:'center', marginTop:12, color:'#9BABB8', fontSize:11 }}>Não tem código? Fale com o organizador.</div>
          </>
        )}

        {/* PASSO 2 — Login ou Cadastro */}
        {step === 'auth' && (
          <>
            {/* Toggle */}
            <div style={{ display:'flex', background:'#F4F6F9', borderRadius:12, padding:4, marginBottom:20 }}>
              {[['login','Entrar'],['register','Criar Conta']].map(([m,l])=>(
                <button key={m} onClick={()=>{setMode(m);setError('');setInfo('')}}
                  style={{ flex:1, padding:'9px', border:'none', borderRadius:10, fontWeight:800, fontSize:13, cursor:'pointer', fontFamily:'inherit', background:mode===m?'#fff':'transparent', color:mode===m?'#002855':'#9BABB8', boxShadow:mode===m?'0 1px 6px rgba(0,40,85,0.1)':'none', transition:'all .2s' }}>
                  {l}
                </button>
              ))}
            </div>

            {info && <div style={{ color:'#009639', background:'rgba(0,150,57,0.08)', borderRadius:10, padding:'10px 12px', fontSize:13, marginBottom:14, border:'1px solid rgba(0,150,57,0.2)' }}>{info}</div>}

            {/* LOGIN */}
            {mode === 'login' && (
              <form onSubmit={handleLogin}>
                <label style={{ color:'#002855', fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Email</label>
                <input style={{ ...inp, marginBottom:12 }} type="email" value={email} onChange={e=>{setEmail(e.target.value);setError('')}} placeholder="seu@email.com" autoFocus/>

                <label style={{ color:'#002855', fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Senha</label>
                <div style={{ position:'relative', marginBottom:6 }}>
                  <input style={{ ...inp, paddingRight:44 }} type={showPw?'text':'password'} value={password} onChange={e=>{setPassword(e.target.value);setError('')}} placeholder="Sua senha"/>
                  <button type="button" onClick={()=>setShowPw(s=>!s)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9BABB8', display:'flex' }}>
                    {showPw ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>

                <button type="button" onClick={handleForgotPassword} style={{ background:'none', border:'none', color:'#009639', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', marginBottom:16, padding:0 }}>
                  Esqueci minha senha
                </button>

                {error && <div style={{ color:'#C0392B', background:'rgba(220,53,69,0.07)', borderRadius:10, padding:'8px 12px', fontSize:13, marginBottom:12 }}>{error}</div>}
                <button type="submit" disabled={loading} style={{ width:'100%', background:'#009639', color:'#fff', border:'none', borderRadius:12, padding:'13px', fontWeight:800, fontSize:15, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity:loading?.7:1 }}>
                  {loading ? <><Loader2 size={16} className="animate-spin"/>Entrando...</> : 'Entrar ⚽'}
                </button>
              </form>
            )}

            {/* CADASTRO */}
            {mode === 'register' && (
              <form onSubmit={handleRegister}>
                {/* Foto */}
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:16 }}>
                  <div style={{ position:'relative', width:88, height:88 }}>
                    <div onClick={()=>fileRef.current?.click()} style={{ width:88, height:88, borderRadius:'50%', background:preview?'transparent':'linear-gradient(135deg,#e8f5ee,#F4F6F9)', border:'3px dashed #009639', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden' }}>
                      {preview ? <img src={preview} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <div style={{ textAlign:'center' }}><div style={{ fontSize:26 }}>📷</div><div style={{ color:'#009639', fontSize:9, fontWeight:700, marginTop:2 }}>Sua foto</div></div>}
                    </div>
                    {preview && <button type="button" onClick={()=>{setPreview(null);setPhoto(null)}} style={{ position:'absolute', top:-3, right:-3, width:22, height:22, borderRadius:'50%', background:'#C0392B', border:'2px solid #fff', cursor:'pointer', color:'#fff', fontSize:11, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center', padding:0 }}>✕</button>}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display:'none' }}/>
                  <div style={{ color:'#9BABB8', fontSize:10, marginTop:6, textAlign:'center' }}>{preview?'✅ Clique para trocar':'Opcional · até 5MB'}</div>
                </div>

                <label style={{ color:'#002855', fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Nome</label>
                <input style={{ ...inp, marginBottom:12 }} value={name} onChange={e=>{setName(e.target.value);setError('')}} placeholder="Como quer ser chamado?" maxLength={25} autoFocus/>

                <label style={{ color:'#002855', fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Email</label>
                <input style={{ ...inp, marginBottom:12 }} type="email" value={email} onChange={e=>{setEmail(e.target.value);setError('')}} placeholder="seu@email.com"/>

                <label style={{ color:'#002855', fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Senha</label>
                <div style={{ position:'relative', marginBottom:12 }}>
                  <input style={{ ...inp, paddingRight:44 }} type={showPw?'text':'password'} value={password} onChange={e=>{setPassword(e.target.value);setError('')}} placeholder="Mínimo 6 caracteres"/>
                  <button type="button" onClick={()=>setShowPw(s=>!s)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9BABB8', display:'flex' }}>
                    {showPw ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>

                <label style={{ color:'#002855', fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Confirmar Senha</label>
                <input style={{ ...inp, marginBottom:12 }} type="password" value={confirm} onChange={e=>{setConfirm(e.target.value);setError('')}} placeholder="Repita a senha"/>

                {!preview && (
                  <>
                    <label style={{ color:'#002855', fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:8 }}>Avatar</label>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:6, marginBottom:14 }}>
                      {AVATARS.map(em=>(
                        <button key={em} type="button" onClick={()=>setAvatar(em)} style={{ fontSize:20, height:40, borderRadius:10, border:avatar===em?'2.5px solid #009639':'2px solid #E2EAF0', background:avatar===em?'#e8f5ee':'#F4F6F9', cursor:'pointer', transform:avatar===em?'scale(1.08)':'scale(1)' }}>{em}</button>
                      ))}
                    </div>
                  </>
                )}

                {error && <div style={{ color:'#C0392B', background:'rgba(220,53,69,0.07)', borderRadius:10, padding:'8px 12px', fontSize:13, marginBottom:12 }}>{error}</div>}
                <button type="submit" disabled={loading} style={{ width:'100%', background:'#009639', color:'#fff', border:'none', borderRadius:12, padding:'13px', fontWeight:800, fontSize:15, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity:loading?.7:1 }}>
                  {loading ? <><Loader2 size={16} className="animate-spin"/>Criando conta...</> : 'Criar Conta e Entrar 🎉'}
                </button>
              </form>
            )}

            <button onClick={()=>{setStep('code');setError('');setInfo('')}} style={{ width:'100%', marginTop:12, background:'transparent', color:'#6B7A8D', border:'none', fontSize:13, cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>
              ← Voltar ao código
            </button>
          </>
        )}
      </div>
      <div style={{ color:'#9BABB8', fontSize:11, marginTop:18, position:'relative', zIndex:1 }}>Confiabilidade dentro e fora de campo! ⚽</div>
    </div>
  )
}
