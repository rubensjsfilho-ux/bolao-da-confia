import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { Loader2, ArrowLeft, Camera, Check, Zap, Target, Star, Trophy } from 'lucide-react'

const AVATARS = ['⚽','🏆','🌟','🦁','🔥','⚡','🎯','👑','🐆','🦅']

// ── Card de estatísticas ──────────────────────────────────────────────────────
function StatsCard({ participant }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [{ data: me }, { data: all }] = await Promise.all([
        supabase
          .from('participants')
          .select('total_points,exact_hits,result_hits,predictions_count')
          .eq('id', participant.id)
          .single(),
        supabase
          .from('participants')
          .select('id,total_points,exact_hits,result_hits,predictions_count'),
      ])

      if (!me || !all) { setLoading(false); return }

      const sorted = [...all].sort((a, b) => {
        const allZero = (p) => (p.total_points||0) === 0 && (p.exact_hits||0) === 0 && (p.result_hits||0) === 0
        if (allZero(a) && allZero(b)) return 0
        if ((b.total_points||0) !== (a.total_points||0)) return (b.total_points||0) - (a.total_points||0)
        if ((b.exact_hits||0)   !== (a.exact_hits||0))  return (b.exact_hits||0)   - (a.exact_hits||0)
        if ((b.result_hits||0)  !== (a.result_hits||0)) return (b.result_hits||0)  - (a.result_hits||0)
        return 0
      })

      const idx = sorted.findIndex(p => p.id === participant.id)

      setStats({
        total_points:      me.total_points      || 0,
        exact_hits:        me.exact_hits        || 0,
        result_hits:       me.result_hits       || 0,
        predictions_count: me.predictions_count || 0,
        rank:              idx >= 0 ? idx + 1 : null,
        total:             all.length,
      })
      setLoading(false)
    }
    load()
  }, [participant.id])

  if (loading) return (
    <div style={{ background:'#fff', borderRadius:16, padding:'16px', border:'1px solid #E2EAF0', marginBottom:20, display:'flex', alignItems:'center', justifyContent:'center', minHeight:100 }}>
      <Loader2 size={20} color="#9BABB8" style={{ animation:'spin 1s linear infinite' }}/>
    </div>
  )

  if (!stats) return null

  const accuracy = stats.predictions_count > 0
    ? Math.round(((stats.exact_hits + stats.result_hits) / stats.predictions_count) * 100)
    : 0

  const items = [
    { icon: <Trophy size={16} color="#D4890A"/>, label: 'Posição',    value: stats.rank ? `${stats.rank}º` : '—', sub: stats.rank ? `de ${stats.total}` : '—', color: '#D4890A', bg: 'rgba(245,166,35,0.08)' },
    { icon: <Star   size={16} color="#009639"/>, label: 'Pontos',     value: stats.total_points,                  sub: 'total',                                 color: '#009639', bg: 'rgba(0,150,57,0.08)'  },
    { icon: <Zap    size={16} color="#F5A623"/>, label: 'Exatos',     value: stats.exact_hits,                    sub: '+3 pts cada',                           color: '#F5A623', bg: 'rgba(245,166,35,0.08)' },
    { icon: <Target size={16} color="#1A73E8"/>, label: 'Resultados', value: stats.result_hits,                   sub: '+1 pt cada',                            color: '#1A73E8', bg: 'rgba(26,115,232,0.08)' },
  ]

  return (
    <div style={{ background:'#fff', borderRadius:16, border:'1px solid #E2EAF0', overflow:'hidden', marginBottom:20, boxShadow:'0 2px 12px rgba(0,40,85,0.06)' }}>
      <div style={{ background:'linear-gradient(135deg,#002855,#009639)', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ color:'#fff', fontWeight:900, fontSize:13, letterSpacing:.5 }}>📊 Seu Desempenho</span>
        <span style={{ color:'rgba(255,255,255,0.7)', fontSize:11 }}>{stats.predictions_count} palpite{stats.predictions_count !== 1 ? 's' : ''}</span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:'#E2EAF0' }}>
        {items.map(({ icon, label, value, sub, color, bg }) => (
          <div key={label} style={{ background:'#fff', padding:'14px 12px', display:'flex', flexDirection:'column', gap:6 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:28, height:28, borderRadius:8, background:bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                {icon}
              </div>
              <span style={{ color:'#9BABB8', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:.5 }}>{label}</span>
            </div>
            <div style={{ color:'#002855', fontWeight:900, fontSize:24, lineHeight:1 }}>{value}</div>
            <div style={{ color, fontSize:10, fontWeight:700 }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ padding:'12px 16px', borderTop:'1px solid #F4F6F9' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
          <span style={{ color:'#6B7A8D', fontSize:11, fontWeight:700 }}>Aproveitamento</span>
          <span style={{ color: accuracy >= 50 ? '#009639' : accuracy >= 25 ? '#D4890A' : '#C0392B', fontSize:12, fontWeight:900 }}>{accuracy}%</span>
        </div>
        <div style={{ height:6, borderRadius:3, background:'#F4F6F9', overflow:'hidden' }}>
          <div style={{
            height:'100%', borderRadius:3, transition:'width .6s ease',
            width:`${accuracy}%`,
            background: accuracy >= 50 ? 'linear-gradient(90deg,#009639,#00c44f)' : accuracy >= 25 ? 'linear-gradient(90deg,#D4890A,#F5A623)' : '#E2EAF0',
          }}/>
        </div>
        <div style={{ color:'#9BABB8', fontSize:10, marginTop:4 }}>
          {stats.exact_hits} exatos + {stats.result_hits} resultados certos de {stats.predictions_count} palpites
        </div>
      </div>
    </div>
  )
}

// ── Tela de perfil ────────────────────────────────────────────────────────────
export default function Profile({ participant, onUpdate }) {
  const navigate = useNavigate()
  const fileRef  = useRef(null)

  const [name,    setName]    = useState(participant.name    || '')
  const [avatar,  setAvatar]  = useState(participant.avatar  || '⚽')
  const [photo,   setPhoto]   = useState(null)
  const [preview, setPreview] = useState(participant.photoUrl || null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState('')

  const inp = {
    width:'100%', background:'#F4F6F9', border:'1.5px solid #E2EAF0',
    borderRadius:12, padding:'12px 14px', color:'#002855', fontSize:14,
    outline:'none', boxSizing:'border-box', fontFamily:'inherit',
  }

  const handlePhoto = (e) => {
    const f = e.target.files?.[0]; if (!f) return
    if (f.size > 5 * 1024 * 1024) { setError('Foto muito grande. Máx 5MB.'); return }
    setPhoto(f)
    const r = new FileReader()
    r.onload = ev => setPreview(ev.target.result)
    r.readAsDataURL(f)
    setError('')
  }

  const handleSave = async () => {
    if (!name.trim()) { setError('Digite seu nome.'); return }
    setLoading(true); setError(''); setSuccess(false)
    try {
      let photoUrl = participant.photoUrl

      if (photo) {
        const ext  = photo.name.split('.').pop()
        const path = `${participant.id}/avatar.${ext}`
        const { error: upErr } = await supabase.storage.from('avatars').upload(path, photo, { upsert: true })
        if (upErr) throw upErr
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
        photoUrl = urlData.publicUrl
      }

      if (!preview && !photo) photoUrl = null

      const { error: updErr } = await supabase
        .from('participants')
        .update({ name: name.trim(), avatar_emoji: avatar, avatar_url: photoUrl })
        .eq('id', participant.id)
      if (updErr) throw updErr

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
    <div style={{ minHeight:'100vh', background:'#F4F6F9', display:'flex', flexDirection:'column', alignItems:'center', padding:'24px 20px', paddingBottom:40 }}>

      <div style={{ width:'100%', maxWidth:420, display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <button onClick={() => navigate(-1)} style={{ background:'#fff', border:'1px solid #E2EAF0', borderRadius:10, width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
          <ArrowLeft size={18} color="#002855"/>
        </button>
        <span style={{ color:'#002855', fontWeight:900, fontSize:18 }}>Editar Perfil</span>
      </div>

      <div style={{ width:'100%', maxWidth:420 }}>

        <StatsCard participant={participant} />

        <div style={{ background:'#fff', borderRadius:20, padding:28, boxShadow:'0 4px 24px rgba(0,40,85,0.10)', border:'1px solid #E2EAF0' }}>

          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:24 }}>
            <div style={{ position:'relative', width:96, height:96 }}>
              <div
                onClick={() => fileRef.current?.click()}
                style={{ width:96, height:96, borderRadius:'50%', overflow:'hidden', cursor:'pointer', border:'3px solid #009639' }}
              >
                {preview
                  ? <img src={preview} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  : <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#e8f5ee,#F4F6F9)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36 }}>{avatar}</div>
                }
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                style={{ position:'absolute', bottom:0, right:0, width:28, height:28, borderRadius:'50%', background:'#009639', border:'2px solid #fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', padding:0 }}
              >
                <Camera size={14} color="#fff"/>
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display:'none' }}/>
            <div style={{ color:'#9BABB8', fontSize:11, marginTop:8 }}>
              {preview && photo ? '✅ Nova foto selecionada' : 'Clique para adicionar foto'}
            </div>
            {preview && (
              <button
                type="button"
                onClick={() => { setPreview(null); setPhoto(null) }}
                style={{ background:'none', border:'none', color:'#C0392B', fontSize:11, fontWeight:700, cursor:'pointer', marginTop:4 }}
              >
                Remover foto
              </button>
            )}
          </div>

          <label style={{ color:'#002855', fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Nome</label>
          <input
            style={{ ...inp, marginBottom:20 }}
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            placeholder="Como quer ser chamado?"
            maxLength={25}
          />

          {!preview && (
            <>
              <label style={{ color:'#002855', fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:8 }}>Avatar</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:6, marginBottom:20 }}>
                {AVATARS.map(em => (
                  <button
                    key={em} type="button" onClick={() => setAvatar(em)}
                    style={{ fontSize:22, height:44, borderRadius:10, border:avatar===em?'2.5px solid #009639':'2px solid #E2EAF0', background:avatar===em?'#e8f5ee':'#F4F6F9', cursor:'pointer', transform:avatar===em?'scale(1.08)':'scale(1)', transition:'all .15s' }}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </>
          )}

          {error && (
            <div style={{ color:'#C0392B', background:'rgba(220,53,69,0.07)', borderRadius:10, padding:'8px 12px', fontSize:13, marginBottom:12 }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ color:'#009639', background:'rgba(0,150,57,0.08)', borderRadius:10, padding:'8px 12px', fontSize:13, marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>
              <Check size={14}/> Perfil atualizado!
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={loading}
            style={{ width:'100%', background:'#009639', color:'#fff', border:'none', borderRadius:12, padding:'13px', fontWeight:800, fontSize:15, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity:loading ? 0.7 : 1 }}
          >
            {loading ? <><Loader2 size={16} style={{ animation:'spin 1s linear infinite' }}/>Salvando...</> : 'Salvar alterações'}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  )
}