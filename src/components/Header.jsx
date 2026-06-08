import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Target, BarChart3, Gift, LogOut, GitBranch, ShieldCheck, Users } from 'lucide-react'

const NAV = [
  { to:'/dashboard',   label:'Início',      Icon:Home },
  { to:'/palpites',    label:'Palpites',    Icon:Target },
  { to:'/grupos',      label:'Grupos',      Icon:Users },
  { to:'/chaveamento', label:'Chaveamento', Icon:GitBranch },
  { to:'/ranking',     label:'Ranking',     Icon:BarChart3 },
]

export function Avatar({ photoUrl, emoji='⚽', size=36, border=true }) {
  const [imgFailed, setImgFailed] = useState(false)
  const showImg = photoUrl && !imgFailed
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', overflow:'hidden', flexShrink:0, border: border?'2px solid #E2EAF0':'none', background:'linear-gradient(135deg,#e8f5ee,#ddeedd)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*.48 }}>
      {showImg
        ? <img src={photoUrl} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={()=>setImgFailed(true)}/>
        : <span>{emoji||'⚽'}</span>}
    </div>
  )
}

export function Logo({ size='md' }) {
  const big = size==='lg'
  return (
    <div style={{ display:'flex', alignItems:'center', gap:big?12:8 }}>
      <div style={{ width:big?52:40, height:big?52:40, borderRadius:'50%', background:'linear-gradient(135deg,#002855 0%,#009639 60%,#F5A623 100%)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:big?26:20, boxShadow:'0 3px 10px rgba(0,40,85,0.25)', flexShrink:0 }}>⚽</div>
      <div style={{ lineHeight:1.1 }}>
        <div style={{ color:'#002855', fontSize:big?11:9, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', opacity:.65 }}>Bolão da</div>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <span style={{ color:'#002855', fontSize:big?28:22, fontWeight:900, letterSpacing:-0.5 }}>CONFIA</span>
          <div style={{ background:'#1A73E8', color:'#fff', borderRadius:'50%', width:big?20:15, height:big?20:15, display:'flex', alignItems:'center', justifyContent:'center', fontSize:big?11:9, fontWeight:900 }}>✓</div>
        </div>
        {big && <div style={{ color:'#009639', fontSize:9, fontWeight:800, letterSpacing:1.2, textTransform:'uppercase', marginTop:1 }}>Confiabilidade dentro e fora de campo!</div>}
      </div>
    </div>
  )
}

export default function Header({ participant, onLogout }) {
  const { pathname } = useLocation()
  return (
    <>
      <header style={{ position:'fixed', top:0, left:0, right:0, zIndex:50, background:'#fff', borderBottom:'1px solid #E2EAF0', padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 1px 8px rgba(0,40,85,0.06)' }}>
        <Logo />
        {participant && (
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {participant.isAdmin && (
              <Link to="/admin" style={{ display:'flex', alignItems:'center', gap:4, background:'rgba(0,40,85,0.07)', border:'1px solid rgba(0,40,85,0.12)', borderRadius:8, padding:'4px 9px', textDecoration:'none' }}>
                <ShieldCheck size={13} color="#002855" />
                <span style={{ color:'#002855', fontWeight:800, fontSize:10 }}>Admin</span>
              </Link>
            )}
            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
              <Avatar photoUrl={participant.photoUrl} emoji={participant.avatar} size={38} />
              <span style={{ color:'#002855', fontWeight:800, fontSize:12, maxWidth:90, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{participant.name}</span>
            </div>
            <button onClick={onLogout} style={{ background:'none', border:'none', cursor:'pointer', color:'#9BABB8', padding:4, borderRadius:8, display:'flex', alignItems:'center' }} title="Sair">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </header>
      {participant && (
        <nav style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:50, background:'#fff', borderTop:'1px solid #E2EAF0', padding:'6px 4px 10px', display:'flex', justifyContent:'space-around', boxShadow:'0 -2px 12px rgba(0,40,85,0.07)' }}>
          {NAV.map(({ to, label, Icon }) => {
            const active = pathname === to
            return (
              <Link key={to} to={to} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'6px 10px', borderRadius:12, textDecoration:'none', background: active?'rgba(0,150,57,0.08)':'transparent' }}>
                <Icon size={20} color={active?'#009639':'#9BABB8'} strokeWidth={active?2.5:1.8} />
                <span style={{ fontSize:10, fontWeight:700, color:active?'#009639':'#9BABB8', letterSpacing:.3, fontFamily:'Nunito,sans-serif' }}>{label}</span>
              </Link>
            )
          })}
        </nav>
      )}
    </>
  )
}
