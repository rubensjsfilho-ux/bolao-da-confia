import { useState, useRef } from 'react'
import { supabase } from '../supabase'
import { Logo } from '../components/Header'
import { Loader2, Camera, X } from 'lucide-react'

const JOIN_CODE = import.meta.env.VITE_JOIN_CODE || 'copa2026'
const AVATARS   = ['⚽','🏆','🌟','🦁','🔥','⚡','🎯','👑','🐆','🦅']

export default function Login({ onLogin }) {
  const [step,    setStep]    = useState('code')
  const [code,    setCode]    = useState('')
  const [name,    setName]    = useState('')
  const [avatar,  setAvatar]  = useState('⚽')
  const [photo,   setPhoto]   = useState(null)   // File object
  const [preview, setPreview] = useState(null)   // Base64 preview
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const fileRef = useRef()

  const inp = { width:'100%', background:'#F4F6F9', border:'1.5px solid #E2EAF0', borderRadius:12, padding:'13px 16px', color:'#002855', fontFamily:'inherit', fontSize:15, outline:'none', boxSizing:'border-box' }

  const submitCode = e => {
    e.preventDefault()
    if (code.trim().toLowerCase() !== JOIN_CODE.toLowerCase()) { setError('Código inválido! Peça ao organizador.'); return }
    setError(''); setStep('name')
  }

  const handlePhotoChange = e => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Foto muito grande. Máximo 5MB.'); return }
    setPhoto(file)
    const reader = new FileReader()
    reader.onload = ev => setPreview(ev.target.result)
    reader.readAsDataURL(file)
    setError('')
  }

  const removePhoto = () => { setPhoto(null); setPreview(null); if (fileRef.current) fileRef.current.value = '' }

  const submitName = async e => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true); setError('')
    try {
      // Verifica se já existe
      const { data: ex } = await supabase.from('participants').select('*').ilike('name', name.trim()).single()
      if (ex) { onLogin({ id: ex.id, name: ex.name, avatar: ex.avatar_emoji, photoUrl: ex.avatar_url }); return }

      // Cria participante
      const { data: nw, error: err } = await supabase
        .from('participants')
        .insert([{ name: name.trim(), avatar_emoji: avatar }])
        .select().single()
      if (err) throw err

      // Upload da foto (se selecionada)
      let photoUrl = null
      if (photo) {
        const ext  = photo.name.split('.').pop()
        const path = `${nw.id}/avatar.${ext}`
        const { error: upErr } = await supabase.storage.from('avatars').upload(path, photo, { upsert: true })
        if (!upErr) {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
          photoUrl = urlData.publicUrl
          await supabase.from('participants').update({ avatar_url: photoUrl }).eq('id', nw.id)
        }
      }

      onLogin({ id: nw.id, name: nw.name, avatar: nw.avatar_emoji, photoUrl })
    } catch { setError('Erro ao entrar. Tente novamente.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#F4F6F9', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:20, position:'relative', overflow:'hidden' }}>
      <svg style={{ position:'absolute', top:0, right:0, width:260, opacity:.12, pointerEvents:'none' }} viewBox="0 0 260 300"><ellipse cx="240" cy="50" rx="170" ry="210" fill="#009639" transform="rotate(-20 240 50)"/></svg>
      <svg style={{ position:'absolute', bottom:0, left:0, width:180, opacity:.10, pointerEvents:'none' }} viewBox="0 0 180 180"><ellipse cx="0" cy="180" rx="150" ry="130" fill="#F5A623"/></svg>

      <div style={{ marginBottom:28, textAlign:'center' }}><Logo size="lg" /></div>

      <div style={{ width:'100%', maxWidth:360, background:'#fff', borderRadius:20, padding:28, boxShadow:'0 4px 24px rgba(0,40,85,0.10)', border:'1px solid #E2EAF0' }}>
        {step === 'code' ? (
          <>
            <h2 style={{ color:'#002855', fontWeight:900, fontSize:22, margin:'0 0 4px' }}>Entrar no Bolão</h2>
            <p style={{ color:'#6B7A8D', fontSize:13, margin:'0 0 20px' }}>Use o código enviado pelo organizador.</p>
            <form onSubmit={submitCode}>
              <label style={{ color:'#002855', fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Código do Bolão</label>
              <input style={inp} value={code} onChange={e=>{setCode(e.target.value);setError('')}} placeholder="Digite o código..." autoFocus />
              {error && <div style={{ color:'#C0392B', background:'rgba(220,53,69,0.07)', borderRadius:10, padding:'8px 12px', fontSize:13, marginTop:10 }}>{error}</div>}
              <button type="submit" style={{ width:'100%', marginTop:16, background:'#009639', color:'#fff', border:'none', borderRadius:12, padding:'13px', fontWeight:800, fontSize:15, cursor:'pointer', fontFamily:'inherit' }}>Continuar →</button>
            </form>
            <div style={{ textAlign:'center', marginTop:12, color:'#9BABB8', fontSize:11 }}>Não tem código? Fale com o organizador.</div>
          </>
        ) : (
          <>
            <h2 style={{ color:'#002855', fontWeight:900, fontSize:22, margin:'0 0 4px' }}>Criar seu Perfil</h2>
            <p style={{ color:'#6B7A8D', fontSize:13, margin:'0 0 20px' }}>Como você quer aparecer no ranking?</p>
            <form onSubmit={submitName}>

              {/* ── Upload de foto ── */}
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:20 }}>
                <div style={{ position:'relative', width:96, height:96 }}>
                  {/* Círculo da foto / placeholder */}
                  <div
                    onClick={() => fileRef.current?.click()}
                    style={{ width:96, height:96, borderRadius:'50%', background: preview ? 'transparent' : 'linear-gradient(135deg,#e8f5ee,#F4F6F9)', border:'3px dashed #009639', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden', position:'relative', transition:'all .2s' }}
                  >
                    {preview
                      ? <img src={preview} alt="foto" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : <div style={{ textAlign:'center' }}>
                          <Camera size={28} color="#009639" />
                          <div style={{ color:'#009639', fontSize:10, fontWeight:700, marginTop:4 }}>Sua foto</div>
                        </div>
                    }
                  </div>
                  {/* Botão remover */}
                  {preview && (
                    <button type="button" onClick={removePhoto}
                      style={{ position:'absolute', top:-4, right:-4, width:24, height:24, borderRadius:'50%', background:'#C0392B', border:'2px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', padding:0 }}>
                      <X size={12} color="#fff" />
                    </button>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display:'none' }} />
                <div style={{ color:'#9BABB8', fontSize:11, marginTop:8 }}>
                  {preview ? '✅ Foto selecionada! Clique para trocar.' : 'Opcional · JPG, PNG ou WEBP até 5MB'}
                </div>
              </div>

              {/* Nome */}
              <label style={{ color:'#002855', fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Seu Nome</label>
              <input style={inp} value={name} onChange={e=>{setName(e.target.value);setError('')}} placeholder="Ex: João Silva" maxLength={25} />

              {/* Avatar emoji (fallback) */}
              {!preview && (
                <>
                  <label style={{ color:'#002855', fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:1, display:'block', margin:'16px 0 8px' }}>Ou escolha um avatar</label>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8 }}>
                    {AVATARS.map(em => (
                      <button key={em} type="button" onClick={()=>setAvatar(em)}
                        style={{ fontSize:22, height:44, borderRadius:12, border: avatar===em?'2.5px solid #009639':'2px solid #E2EAF0', background: avatar===em?'#e8f5ee':'#F4F6F9', cursor:'pointer', transform: avatar===em?'scale(1.08)':'scale(1)', transition:'all .15s' }}>
                        {em}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {error && <div style={{ color:'#C0392B', background:'rgba(220,53,69,0.07)', borderRadius:10, padding:'8px 12px', fontSize:13, marginTop:12 }}>{error}</div>}

              <button type="submit" disabled={!name.trim() || loading}
                style={{ width:'100%', marginTop:18, background:name.trim()?'#009639':'#9BABB8', color:'#fff', border:'none', borderRadius:12, padding:'13px', fontWeight:800, fontSize:15, cursor:name.trim()?'pointer':'default', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                {loading ? <><Loader2 size={16} className="animate-spin" /> Entrando...</> : 'Entrar no Bolão da Confia 🎉'}
              </button>
              <button type="button" onClick={()=>setStep('code')}
                style={{ width:'100%', marginTop:10, background:'transparent', color:'#002855', border:'2px solid #002855', borderRadius:12, padding:'11px', fontWeight:800, fontSize:14, cursor:'pointer', fontFamily:'inherit' }}>← Voltar</button>
            </form>
          </>
        )}
      </div>
      <div style={{ color:'#9BABB8', fontSize:11, marginTop:18 }}>Confiabilidade dentro e fora de campo! ⚽</div>
    </div>
  )
}
