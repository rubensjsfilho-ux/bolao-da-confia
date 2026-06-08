import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { Avatar, Logo } from '../components/Header'
import { Loader2, ArrowLeft, Camera, Check } from 'lucide-react'

const AVATARS = ['⚽','🏆','🌟','🦁','🔥','⚡','🎯','👑','🐆','🦅']

export default function Profile({ participant, onUpdate }) {
  const navigate  = useNavigate()
  const fileRef   = useRef()

  const [name,    setName]    = useState(participant.name || '')
  const [avatar,  setAvatar]  = useState(participant.avatar || '⚽')
  const [photo,   setPhoto]   = useState(null)
  const [preview, setPreview] = useState(participant.photoUrl || null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState('')

  const inp = { width:'100%', background:'#F4F6F9', border:'1.5px solid #E2EAF0', borderRadius:12, padding:'12px 14px', color:'#002855', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }

  const handlePhoto = e => {
    const f = e.target.files[0]; if (!f) return
    if (f.size > 5*1024*1024) { setError('Foto muito grande. Máx 5MB.'); return }
    setPhoto(f)
    const r = new FileReader(); r.onload = ev => setPreview(ev.target.result); r.readAsDataURL(f)
    setError('')
  }

  const handleSave = async () => {
    if (!name.trim()) { setError('Digite seu nome.'); return }
    setLoading(true); setError(''); setSuccess(false)
    try {
      let photoUrl = participant.photoUrl

      // Upload da nova foto se selecionada
      if (photo) {
        const ext  = photo.name.split('.').pop()
        const path = `${participant.id}/avatar.${ext}`
        const { error: upErr } = await supabase.storage.from('avatars').upload(path, photo, { upsert: true })
        if (upErr) throw upErr
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
        photoUrl = urlData.publicUrl
      }

      // Atualiza participante
      const { error: updErr } = await supabase
        .from('participants')
        .update({ name: name.trim(), avatar_emoji: avatar, avatar_url: photoUrl })
        .eq('id', participant.id)
      if (updErr) throw updErr

      // Atualiza estado global
      onUpdate({ ...participant, name: name.trim(), avatar, photoUrl })
      setSuccess(true)
      setTimeout(() => navigate(-1), 1200)
    } catch (err) {
      setError(err.message || 'Erro ao salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#F4F6F9', display:'flex', flexDirection:'column', alignItems:'center', padding:'24px 20px' }}>

      {/* Header */}
      <div style={{ width:'100%', maxWidth:420, display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <button onClick={()=>navigate(-1)} style={{ background:'#fff', border:'1px solid #E2EAF0', borderRadius:10, width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
          <ArrowLeft size={18} color="#002855"/>
        </button>
        <span style={{ color:'#002855', fontWeight:900, fontSize:18 }}>Editar Perfil</span>
      </div>

      <div style={{ width:'100%', maxWidth:420, background:'#fff', borderRadius:20, padding:28, boxShadow:'0 4px 24px rgba(0,40,85,0.10)', border:'1px solid #E2EAF0' }}>

        {/* Foto */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:24 }}>
          <div style={{ position:'relative', width:96, height:96 }}>
            <div onClick={()=>fileRef.current?.click()} style={{ width:96, height:96, borderRadius:'50%', overflow:'hidden', cursor:'pointer', border:'3px solid #009639' }}>
              {preview
                ? <img src={preview} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                : <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#e8f5ee,#F4F6F9)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36 }}>{avatar}</div>
              }
            </div>
            <button type="button" onClick={()=>fileRef.current?.click()} style={{ position:'absolute', bottom:0, right:0, width:28, height:28, borderRadius:'50%', background:'#009639', border:'2px solid #fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', padding:0 }}>
              <Camera size={14} color="#fff"/>
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display:'none' }}/>
          <div style={{ color:'#9BABB8', fontSize:11, marginTop:8 }}>
            {preview && photo ? '✅ Nova foto selecionada' : 'Clique para adicionar foto'}
          </div>
          {preview && (
            <button type="button" onClick={()=>{setPreview(participant.photoUrl||null);setPhoto(null)}} style={{ background:'none', border:'none', color:'#C0392B', fontSize:11, fontWeight:700, cursor:'pointer', marginTop:4 }}>
              Remover foto
            </button>
          )}
        </div>

        {/* Nome */}
        <label style={{ color:'#002855', fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Nome</label>
        <input style={{ ...inp, marginBottom:20 }} value={name} onChange={e=>{setName(e.target.value);setError('')}} placeholder="Como quer ser chamado?" maxLength={25}/>

        {/* Avatar emoji (só aparece se não tiver foto) */}
        {!preview && (
          <>
            <label style={{ color:'#002855', fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:8 }}>Avatar</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:6, marginBottom:20 }}>
              {AVATARS.map(em=>(
                <button key={em} type="button" onClick={()=>setAvatar(em)} style={{ fontSize:22, height:44, borderRadius:10, border:avatar===em?'2.5px solid #009639':'2px solid #E2EAF0', background:avatar===em?'#e8f5ee':'#F4F6F9', cursor:'pointer', transform:avatar===em?'scale(1.08)':'scale(1)', transition:'all .15s' }}>{em}</button>
              ))}
            </div>
          </>
        )}

        {error   && <div style={{ color:'#C0392B', background:'rgba(220,53,69,0.07)', borderRadius:10, padding:'8px 12px', fontSize:13, marginBottom:12 }}>{error}</div>}
        {success && <div style={{ color:'#009639', background:'rgba(0,150,57,0.08)', borderRadius:10, padding:'8px 12px', fontSize:13, marginBottom:12, display:'flex', alignItems:'center', gap:6 }}><Check size={14}/>Perfil atualizado!</div>}

        <button onClick={handleSave} disabled={loading} style={{ width:'100%', background:'#009639', color:'#fff', border:'none', borderRadius:12, padding:'13px', fontWeight:800, fontSize:15, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity:loading?.7:1 }}>
          {loading ? <><Loader2 size={16}/>Salvando...</> : 'Salvar alterações'}
        </button>
      </div>
    </div>
  )
}
