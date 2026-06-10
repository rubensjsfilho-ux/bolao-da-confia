import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Target, BarChart3, ShieldCheck, Users, Zap, LogOut, X, Trophy, Star, Zap as ZapIcon } from 'lucide-react'
import { supabase } from '../supabase'

const NAV = [
  { to:'/dashboard', label:'Início',   Icon:Home },
  { to:'/palpites',  label:'Palpites', Icon:Target },
  { to:'/grupos',    label:'Grupos',   Icon:Users },
  { to:'/mata-mata', label:'Mata-Mata',Icon:Zap },
  { to:'/ranking',   label:'Ranking',  Icon:BarChart3 },
]

export function Avatar({ photoUrl, emoji='⚽', size=36, border=true }) {
  const [imgFailed, setImgFailed] = useState(false)
  const showImg = photoUrl && !imgFailed
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', overflow:'hidden', flexShrink:0, border:border?'2px solid #E2EAF0':'none', background:'linear-gradient(135deg,#e8f5ee,#ddeedd)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*.48 }}>
      {showImg
        ? <img src={photoUrl} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={()=>setImgFailed(true)}/>
        : <span>{emoji||'⚽'}</span>}
    </div>
  )
}

export function Logo({ size='md', clickable=false }) {
  const navigate = useNavigate()
  const big = size==='lg'
  return (
    <div
      style={{ cursor: clickable ? 'pointer' : 'default', display:'flex', alignItems:'center' }}
      onClick={clickable ? () => navigate('/dashboard') : undefined}
    >
      <img
        src="/logo-bolao.png"
        alt="Bolão da Confia"
        style={{
          height: big ? 72 : 52,
          maxWidth: big ? 320 : 200,
          width: 'auto',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </div>
  )
}

// ── Modal de estatísticas de participante ─────────────────────────────────────
export function ParticipantModal({ participant: p, onClose }) {
  const [stats, setStats] = useState(null)
  const [rank,  setRank]  = useState(null)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!p) return
    const load = async () => {
      const [{ data: me }, { data: all }] = await Promise.all([
        supabase.from('participants').select('total_points,exact_hits,result_hits,predictions_count').eq('id', p.id).single(),
        supabase.from('participants').select('id,total_points,exact_hits,result_hits,predictions_count'),
      ])
      if (!me || !all) return
      const sorted = [...all].sort((a, b) => {
        const z = x => (x.total_points||0)===0&&(x.exact_hits||0)===0&&(x.result_hits||0)===0
        if (z(a)&&z(b)) return a.name?.localeCompare(b.name,'pt-BR')||0
        if ((b.total_points||0)!==(a.total_points||0)) return (b.total_points||0)-(a.total_points||0)
        if ((b.exact_hits||0)!==(a.exact_hits||0))     return (b.exact_hits||0)-(a.exact_hits||0)
        return (b.result_hits||0)-(a.result_hits||0)
      })
      const idx = sorted.findIndex(x => x.id === p.id)
      setRank(idx >= 0 ? idx+1 : null)
      setTotal(all.length)
      setStats(me)
    }
    load()
  }, [p?.id])

  if (!p) return null

  const accuracy = stats && stats.predictions_count > 0
    ? Math.round(((stats.exact_hits + stats.result_hits) / stats.predictions_count) * 100)
    : 0

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, zIndex:9998,
      background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)',
      display:'flex', alignItems:'flex-end', justifyContent:'center',
      animation:'fdIn .25s ease',
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        width:'100%', maxWidth:480,
        background:'#fff', borderRadius:'20px 20px 0 0',
        padding:'0 0 32px', overflow:'hidden',
        animation:'slideUp .3s cubic-bezier(0.25,0.46,0.45,0.94)',
        boxShadow:'0 -8px 40px rgba(0,0,0,0.2)',
      }}>
        {/* Header colorido */}
        <div style={{ background:'linear-gradient(135deg,#002855,#009639)', padding:'20px 20px 24px', position:'relative' }}>
          <button onClick={onClose} style={{ position:'absolute', top:14, right:14, background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'50%', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <X size={16} color="#fff"/>
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:64, height:64, borderRadius:'50%', overflow:'hidden', border:'3px solid rgba(255,255,255,0.3)', background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, flexShrink:0 }}>
              {p.avatar_url
                ? <img src={p.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                : p.avatar_emoji || '⚽'
              }
            </div>
            <div>
              <div style={{ color:'#fff', fontWeight:900, fontSize:20 }}>{p.name}</div>
              {rank && <div style={{ color:'rgba(255,255,255,0.7)', fontSize:13, marginTop:2 }}>
                {rank}º lugar de {total} participantes
              </div>}
            </div>
          </div>
        </div>

        {/* Stats */}
        {!stats ? (
          <div style={{ padding:32, textAlign:'center', color:'#9BABB8' }}>Carregando...</div>
        ) : (
          <div style={{ padding:'0 16px' }}>
            {/* Grid de métricas */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:'#E2EAF0', marginTop:1 }}>
              {[
                { icon:'🏆', label:'Posição',    value: rank ? `${rank}º` : '—',  sub: rank ? `de ${total}` : '—',       color:'#D4890A' },
                { icon:'⭐', label:'Pontos',     value: stats.total_points||0,     sub:'total',                           color:'#009639' },
                { icon:'⚡', label:'Exatos',     value: stats.exact_hits||0,       sub:'+3 pts cada',                     color:'#F5A623' },
                { icon:'🎯', label:'Resultados', value: stats.result_hits||0,      sub:'+1 pt cada',                      color:'#1A73E8' },
              ].map(({ icon, label, value, sub, color }) => (
                <div key={label} style={{ background:'#fff', padding:'16px 14px' }}>
                  <div style={{ fontSize:20, marginBottom:6 }}>{icon}</div>
                  <div style={{ color:'#9BABB8', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:.5, marginBottom:4 }}>{label}</div>
                  <div style={{ color:'#002855', fontWeight:900, fontSize:26, lineHeight:1 }}>{value}</div>
                  <div style={{ color, fontSize:10, fontWeight:700, marginTop:3 }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Barra de aproveitamento */}
            <div style={{ padding:'14px 0 0' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ color:'#6B7A8D', fontSize:12, fontWeight:700 }}>Aproveitamento</span>
                <span style={{ color: accuracy>=50?'#009639':accuracy>=25?'#D4890A':'#C0392B', fontWeight:900, fontSize:13 }}>{accuracy}%</span>
              </div>
              <div style={{ height:8, borderRadius:4, background:'#F4F6F9', overflow:'hidden' }}>
                <div style={{
                  height:'100%', borderRadius:4, width:`${accuracy}%`, transition:'width .6s ease',
                  background: accuracy>=50?'linear-gradient(90deg,#009639,#00c44f)':accuracy>=25?'linear-gradient(90deg,#D4890A,#F5A623)':'#E2EAF0',
                }}/>
              </div>
              <div style={{ color:'#9BABB8', fontSize:11, marginTop:6 }}>
                {stats.exact_hits} exatos + {stats.result_hits} resultados certos de {stats.predictions_count} palpites
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fdIn    { from{opacity:0}                    to{opacity:1} }
        @keyframes slideUp { from{transform:translateY(100%)}   to{transform:translateY(0)} }
      `}</style>
    </div>
  )
}

export default function Header({ participant, onLogout }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [modalP, setModalP] = useState(null)

  // Expõe a função globalmente para outros componentes usarem
  useEffect(() => {
    window.__openParticipantModal = (p) => setModalP(p)
    return () => { delete window.__openParticipantModal }
  }, [])

  return (
    <>
      <ParticipantModal participant={modalP} onClose={() => setModalP(null)} />

      <header style={{ position:'fixed', top:0, left:0, right:0, zIndex:50, background:'#fff', borderBottom:'1px solid #E2EAF0', padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 1px 8px rgba(0,40,85,0.06)' }}>
        {/* Logo clicável */}
        <div onClick={() => navigate('/dashboard')} style={{ cursor:'pointer' }}>
          <Logo />
        </div>

        {participant && (
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {participant.isAdmin && (
              <Link to="/admin" style={{ display:'flex', alignItems:'center', gap:4, background:'rgba(0,40,85,0.07)', border:'1px solid rgba(0,40,85,0.12)', borderRadius:8, padding:'4px 9px', textDecoration:'none' }}>
                <ShieldCheck size={13} color="#002855"/>
                <span style={{ color:'#002855', fontWeight:800, fontSize:10 }}>Admin</span>
              </Link>
            )}
            <div onClick={() => navigate('/perfil')} style={{ display:'flex', alignItems:'center', gap:7, cursor:'pointer', padding:'4px 6px', borderRadius:10, transition:'background .15s' }}
              onMouseEnter={e=>e.currentTarget.style.background='#F4F6F9'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <Avatar photoUrl={participant.photoUrl} emoji={participant.avatar} size={38}/>
              <span style={{ color:'#002855', fontWeight:800, fontSize:12, maxWidth:90, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{participant.name}</span>
            </div>
            <button onClick={onLogout} style={{ background:'none', border:'none', cursor:'pointer', color:'#9BABB8', padding:4, borderRadius:8, display:'flex', alignItems:'center' }} title="Sair">
              <LogOut size={16}/>
            </button>
          </div>
        )}
      </header>

      {participant && (
        <nav style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:50, background:'#fff', borderTop:'1px solid #E2EAF0', padding:'6px 4px 10px', display:'flex', justifyContent:'space-around', boxShadow:'0 -2px 12px rgba(0,40,85,0.07)' }}>
          {NAV.map(({ to, label, Icon }) => {
            const active = pathname === to
            return (
              <Link key={to} to={to} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'6px 10px', borderRadius:12, textDecoration:'none', background:active?'rgba(0,150,57,0.08)':'transparent' }}>
                <Icon size={20} color={active?'#009639':'#9BABB8'} strokeWidth={active?2.5:1.8}/>
                <span style={{ fontSize:10, fontWeight:700, color:active?'#009639':'#9BABB8', letterSpacing:.3, fontFamily:'Nunito,sans-serif' }}>{label}</span>
              </Link>
            )
          })}
        </nav>
      )}
    </>
  )
}
