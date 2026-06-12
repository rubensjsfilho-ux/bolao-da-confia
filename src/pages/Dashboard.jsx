import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Header from '../components/Header'
import { GROUP_MATCHES, getFlag, isMatchOpen } from '../data/matches'
import { AlertCircle, Users, Trophy, Star, Calendar } from 'lucide-react'

// ── HERO ──────────────────────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return isMobile
}

function Hero({ onPalpites, onJogos }) {
  const isMobile = useIsMobile()
  const [t, setT] = useState({ d:0, h:0, m:0, s:0 })
  useEffect(() => {
    const target = new Date('2026-06-11T22:00:00Z')
    const tick = () => {
      const diff = target - new Date()
      if (diff <= 0) { setT({d:0,h:0,m:0,s:0}); return }
      setT({ d:Math.floor(diff/86400000), h:Math.floor((diff%86400000)/3600000), m:Math.floor((diff%3600000)/60000), s:Math.floor((diff%60000)/1000) })
    }
    tick(); const id = setInterval(tick,1000); return ()=>clearInterval(id)
  },[])
  const started = new Date() >= new Date('2026-06-11T22:00:00Z')

  return (
    <div style={{ position:'relative', overflow:'hidden', background:'#050e05', minHeight:340 }}>

      {/* Fundo com gradiente escuro + efeito radial verde */}
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 30% 60%, rgba(0,100,40,0.35) 0%, transparent 65%), linear-gradient(135deg, #0a1a0a 0%, #050e05 50%, #000 100%)' }}/>

      {/* Linha vertical decorativa esquerda */}
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:4, background:'linear-gradient(to bottom, #00c44f, #F5A623, #009639)' }}/>

      {/* Imagem direita — taça no mobile, banner no desktop */}
      <div style={{ position:'absolute', right:0, top:0, bottom:0, width: isMobile ? '52%' : '60%', zIndex:1 }}>
        {isMobile ? (
          <>
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, #050e05 0%, transparent 45%)', zIndex:2 }}/>
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, #050e05 0%, transparent 30%)', zIndex:2 }}/>
            <img
              src="https://nkbumxaksiibljgpmgak.supabase.co/storage/v1/object/public/avatars/IMG_9719.jpeg"
              alt="Taça Copa 2026"
              style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top', opacity:.95, filter:'drop-shadow(-8px 0 30px rgba(245,166,35,0.6))' }}
              onError={e => { e.target.style.display='none' }}
            />
          </>
        ) : (
          <>
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, #050e05 0%, transparent 20%)', zIndex:2 }}/>
            <img
              src="https://nkbumxaksiibljgpmgak.supabase.co/storage/v1/object/public/avatars/D50C0E83-B5D5-4658-A67B-B1F0546DCCE2.png"
              alt="Bolão da Confia 2026"
              style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center center', opacity:1 }}
              onError={e => { e.target.style.display='none' }}
            />
          </>
        )}
      </div>

      {/* Conteúdo — esquerda */}
      <div style={{ position:'relative', zIndex:3, padding:'28px 16px 24px', width: isMobile ? '62%' : '70%' }}>

        {/* Label topo */}
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:14 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'#00c44f' }}/>
          <span style={{ color:'rgba(255,255,255,0.45)', fontWeight:800, fontSize:9, letterSpacing:3, textTransform:'uppercase' }}>BOLÃO DA CONFIA</span>
        </div>

        {/* COPA DO MUNDO FIFA + 2026 — proporcionais */}
        <div style={{ marginBottom:12 }}>
          <div style={{ color:'#ffffff', fontFamily:'Arial Black, Impact, sans-serif', fontWeight:900, fontSize: isMobile ? 22 : 42, letterSpacing:.5, textTransform:'uppercase', lineHeight:1.1, textShadow:'0 1px 8px rgba(0,0,0,0.6)' }}>COPA DO MUNDO</div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:2 }}>
            <div style={{ color:'#00c44f', fontFamily:'Arial Black, Impact, sans-serif', fontWeight:900, fontSize: isMobile ? 22 : 42, letterSpacing:.5, textTransform:'uppercase', lineHeight:1.1 }}>FIFA</div>
            <div style={{ flex:1, height:2, background:'linear-gradient(to right,rgba(0,196,79,0.4),transparent)', borderRadius:2 }}/>
          </div>
          <span style={{
            fontFamily:'Arial Black, Impact, sans-serif',
            fontWeight:900,
            fontSize: isMobile ? 62 : 110,
            lineHeight:.85,
            letterSpacing:-4,
            background:'linear-gradient(135deg, #F5A623 0%, #FFD700 45%, #F5A623 100%)',
            WebkitBackgroundClip:'text',
            WebkitTextFillColor:'transparent',
            backgroundClip:'text',
            display:'inline-block',
            filter:'drop-shadow(0 2px 10px rgba(245,166,35,0.55))',
          }}>2026</span>
        </div>

        {/* Países sede */}
        <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:16 }}>
          {[['🇺🇸','EUA'],['🇨🇦','CAN'],['🇲🇽','MEX']].map(([flag,name],i)=>(
            <span key={name} style={{ display:'flex', alignItems:'center', gap:3, color:'rgba(255,255,255,0.5)', fontSize:10, fontWeight:700 }}>
              {i>0 && <span style={{ color:'rgba(255,255,255,0.2)', marginRight:2 }}>·</span>}
              <span>{flag}</span><span>{name}</span>
            </span>
          ))}
        </div>

        {/* Countdown ou badge ao vivo */}
        {!started ? (
          <div style={{ display:'flex', gap:5, marginBottom:18 }}>
            {[['D',t.d],['H',t.h],['M',t.m],['S',t.s]].map(([l,v])=>(
              <div key={l} style={{ textAlign:'center', background:'rgba(255,255,255,0.07)', backdropFilter:'blur(8px)', borderRadius:8, padding:'6px 7px', minWidth:38, border:'1px solid rgba(255,255,255,0.10)' }}>
                <div style={{ color:'#F5A623', fontWeight:900, fontSize:17, lineHeight:1, fontFamily:'Arial Black, sans-serif' }}>{String(v).padStart(2,'0')}</div>
                <div style={{ color:'rgba(255,255,255,0.35)', fontSize:8, letterSpacing:1.5, marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(0,196,79,0.18)', borderRadius:20, padding:'5px 12px', marginBottom:18, border:'1px solid rgba(0,196,79,0.4)' }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#00c44f', boxShadow:'0 0 6px #00c44f' }}/>
            <span style={{ color:'#00c44f', fontWeight:800, fontSize:11 }}>Torneio em andamento!</span>
          </div>
        )}

        {/* Botões */}
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <button onClick={onPalpites} style={{ background:'linear-gradient(90deg,#009639,#00c44f)', color:'#fff', border:'none', borderRadius:10, padding:'12px 14px', fontWeight:800, fontSize:12, cursor:'pointer', fontFamily:'Nunito,sans-serif', display:'flex', alignItems:'center', gap:6, boxShadow:'0 4px 20px rgba(0,150,57,0.5)' }}>
            🎯 FAZER PALPITES
          </button>
          <button onClick={onJogos} style={{ background:'rgba(255,255,255,0.07)', color:'#e0e0e0', border:'1px solid rgba(255,255,255,0.13)', borderRadius:10, padding:'10px 14px', fontWeight:800, fontSize:12, cursor:'pointer', fontFamily:'Nunito,sans-serif', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', gap:6 }}>
            📅 VER JOGOS
          </button>
        </div>
      </div>

      {/* Features strip */}
      <div style={{ position:'relative', zIndex:3, display:'grid', gridTemplateColumns:'repeat(4,1fr)', borderTop:'1px solid rgba(255,255,255,0.07)', background:'rgba(0,0,0,0.35)', backdropFilter:'blur(6px)' }}>
        {[
          ['🏆','Prêmios','Exclusivos'],
          ['📊','Ranking','Tempo real'],
          ['🎯','Palpites','72 jogos'],
          ['🔒','100%','Seguro'],
        ].map(([icon,l1,l2])=>(
          <div key={l1} style={{ textAlign:'center', padding:'8px 4px', borderRight:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize:14, marginBottom:2 }}>{icon}</div>
            <div style={{ color:'#ffffff', fontSize:8, fontWeight:800, lineHeight:1.3 }}>{l1}</div>
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:7, fontWeight:600 }}>{l2}</div>
          </div>
        ))}
      </div>
    </div>
  )
}


// ── STATS ─────────────────────────────────────────────────────────────────────
function StatsStrip({ stats, totalParts, myRank }) {
  const navigate = useNavigate()
  const items = [
    { icon:<Users size={20} color="#009639"/>, label:'PARTICIPANTES', val:totalParts, sub:'Ver todos', subc:'#009639', onClick:()=>navigate('/ranking') },
    { icon:<Trophy size={20} color="#1A73E8"/>, label:'SUA POSIÇÃO', val:myRank?`${myRank}º`:'—', sub:myRank?`de ${totalParts}`:'—', subc:'#6B7A8D', onClick:null },
    { icon:<Star size={20} color="#F5A623"/>, label:'SEUS PONTOS', val:stats.points, sub:'Ver pontuação', subc:'#009639', onClick:()=>navigate('/ranking') },
    { icon:<Calendar size={20} color="#7B2FBE"/>, label:'RODADA ATUAL', val:'Grupos', sub:'Em andamento', subc:'#7B2FBE', onClick:null },
  ]
  return (
    <div style={{ background:'#fff', margin:'0 12px', borderRadius:16, padding:'14px 8px', boxShadow:'0 4px 20px rgba(0,40,85,0.10)', border:'1px solid #E2EAF0', display:'grid', gridTemplateColumns:'repeat(4,1fr)', marginTop:-16, position:'relative', zIndex:4 }}>
      {items.map(({icon,label,val,sub,subc,onClick})=>(
        <div key={label} onClick={onClick||undefined} style={{ textAlign:'center', padding:'4px 2px', cursor:onClick?'pointer':'default', borderRadius:8, transition:'background .15s' }}
          onMouseEnter={e=>{ if(onClick) e.currentTarget.style.background='#F4F6F9' }}
          onMouseLeave={e=>{ e.currentTarget.style.background='transparent' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:4 }}>{icon}</div>
          <div style={{ color:'#9BABB8', fontSize:8, fontWeight:700, letterSpacing:.6, textTransform:'uppercase', marginBottom:2 }}>{label}</div>
          <div style={{ color:'#002855', fontWeight:900, fontSize:16, lineHeight:1, marginBottom:2 }}>{val}</div>
          <div style={{ color:subc, fontSize:9, fontWeight:700, textDecoration:onClick?'underline':'none' }}>{sub}</div>
        </div>
      ))}
    </div>
  )
}

// ── DADOS DOS ESCUDOS E JOGADORES ─────────────────────────────────────────────
const CDN = "https://cdn.prod.website-files.com/68f550992570ca0322737dc2/"
// ESPN team IDs → escudos oficiais das seleções
const ESPN_TEAM_IDS = {
  'Brasil':205,'Argentina':2750,'França':587,'Alemanha':481,'Espanha':164,
  'Portugal':2802,'Inglaterra':5159,'Holanda':2576,'Bélgica':2808,
  'México':203,'Estados Unidos':2765,'Uruguai':2774,'Canadá':206,
  'Marrocos':2742,'Senegal':2806,'Escócia':2807,'Croácia':2805,
  'Suíça':2817,'Turquia':2818,'Colômbia':2853,'Paraguai':2735,
  'Equador':2804,'Egito':2788,'Gana':2791,'Panamá':2734,
  'África do Sul':2795,'Argélia':2780,'Tunísia':2816,
  'Costa do Marfim':2786,'Uzbequistão':12513,'Nova Zelândia':2743,
  'Áustria':2782,'Noruega':2797,'Coreia do Sul':17639,'Japão':2796,
  'Austrália':2781,'Irã':2794,'Arábia Saudita':2803,
  'República Tcheca':2785,'República Tch.':2785,'Bósnia e Herz.':3204,
  'Sérvia':18276,'Suécia':2814,'Polônia':2799,'Dinamarca':2787,
  'Hungria':2733,'Romênia':2801,'Geórgia':17858,'Grécia':2792,
  'Eslovênia':2810,'Venezuela':2775,'Peru':2736,'Chile':2752,
  'Bolívia':2751,'Costa Rica':2753,'Jamaica':2731,'Catar':2800,
  'Iraque':3212,'Indonésia':17636,'RD Congo':3210,'Haiti':2793,
  'Curaçao':15985,'Cabo Verde':17859,
}

const CRESTS = Object.fromEntries(
  Object.entries(ESPN_TEAM_IDS).map(([k,v]) => [k, `https://a.espncdn.com/i/teamlogos/soccer/500/${v}.png`])
)

const STARS = {
  'Brasil':         { name:'Vini Jr.',       wiki:'Vinícius_Júnior' },
  'Argentina':      { name:'L. Messi',       wiki:'Lionel_Messi' },
  'França':         { name:'K. Mbappé',      wiki:'Kylian_Mbappé' },
  'Alemanha':       { name:'J. Kimmich',     wiki:'Joshua_Kimmich' },
  'Espanha':        { name:'Pedri',          wiki:'Pedri' },
  'Portugal':       { name:'C. Ronaldo',     wiki:'Cristiano_Ronaldo' },
  'Inglaterra':     { name:'J. Bellingham',  wiki:'Jude_Bellingham' },
  'Holanda':        { name:'V. van Dijk',    wiki:'Virgil_van_Dijk' },
  'Bélgica':        { name:'K. De Bruyne',   wiki:'Kevin_De_Bruyne' },
  'México':         { name:'H. Lozano',      wiki:'Hirving_Lozano' },
  'Estados Unidos': { name:'C. Pulisic',     wiki:'Christian_Pulisic' },
  'Uruguai':        { name:'D. Núñez',       wiki:'Darwin_Núñez' },
  'Canadá':         { name:'A. Davies',      wiki:'Alphonso_Davies' },
  'Marrocos':       { name:'A. Hakimi',      wiki:'Achraf_Hakimi' },
  'Senegal':        { name:'S. Mané',        wiki:'Sadio_Mané' },
  'Escócia':        { name:'A. Robertson',   wiki:'Andrew_Robertson' },
  'Croácia':        { name:'L. Modrić',      wiki:'Luka_Modrić' },
  'Suíça':          { name:'G. Xhaka',       wiki:'Granit_Xhaka' },
  'Turquia':        { name:'H. Çalhanoğlu',  wiki:'Hakan_Çalhanoğlu' },
  'Colômbia':       { name:'L. Díaz',        wiki:'Luis_Díaz_(footballer,_born_1997)' },
  'Paraguai':       { name:'M. Almirón',     wiki:'Miguel_Almirón' },
  'Egito':          { name:'M. Salah',       wiki:'Mohamed_Salah' },
  'Gana':           { name:'T. Partey',      wiki:'Thomas_Partey' },
  'Coreia do Sul':  { name:'Son Heung-min',  wiki:'Son_Heung-min' },
  'Japão':          { name:'T. Endo',        wiki:'Wataru_Endo' },
  'Austrália':      { name:'M. Leckie',      wiki:'Mathew_Leckie' },
  'Irã':            { name:'S. Azmoun',      wiki:'Sardar_Azmoun' },
  'Arábia Saudita': { name:'S. Al-Dawsari',  wiki:'Salem_Al-Dawsari' },
  'África do Sul':  { name:'P. Tau',         wiki:'Percy_Tau' },
  'Noruega':        { name:'E. Haaland',     wiki:'Erling_Haaland' },
  'Áustria':        { name:'D. Alaba',       wiki:'David_Alaba' },
}

const TEAM_COLORS = {
  'Brasil':['#009C3B','#FFDF00'], 'Argentina':['#74ACDF','#fff'],
  'França':['#002395','#ED2939'], 'Alemanha':['#000','#DD0000'],
  'Espanha':['#AA151B','#F1BF00'], 'Portugal':['#006600','#FF0000'],
  'Inglaterra':['#CF091D','#fff'], 'Holanda':['#FF6600','#003DA5'],
  'Bélgica':['#000','#EF3340'], 'México':['#006847','#CE1126'],
  'Estados Unidos':['#002868','#BF0A30'], 'Uruguai':['#5EB6E4','#fff'],
  'Canadá':['#FF0000','#fff'], 'Marrocos':['#C1272D','#006233'],
  'Senegal':['#00853F','#FDEF42'], 'Escócia':['#003DA5','#fff'],
  'Croácia':['#FF0000','#fff'], 'Suíça':['#FF0000','#fff'],
  'Turquia':['#E30A17','#fff'], 'Colômbia':['#FCD116','#003087'],
  'Paraguai':['#D52B1E','#fff'], 'Egito':['#CE1126','#fff'],
  'Gana':['#006B3F','#FCD116'], 'Panamá':['#DA121A','#fff'],
  'Coreia do Sul':['#CD2E3A','#003478'], 'Japão':['#BC002D','#fff'],
  'Austrália':['#FFD700','#006400'], 'Irã':['#239F40','#DA0000'],
  'Noruega':['#EF2B2D','#fff'], 'Áustria':['#ED2939','#fff'],
  'África do Sul':['#007A4D','#FFB612'], 'Argélia':['#006233','#D21034'],
  'Tunísia':['#E70013','#fff'],
}

// ESPN player IDs → headshots com uniforme da seleção
const ESPN_IDS = {
  'Vinícius_Júnior':252107,'Lionel_Messi':45843,'Kylian_Mbappé':188545,
  'Joshua_Kimmich':209819,'Pedri':291743,'Cristiano_Ronaldo':1341,
  'Jude_Bellingham':320097,'Virgil_van_Dijk':195857,'Kevin_De_Bruyne':156616,
  'Hirving_Lozano':192048,'Christian_Pulisic':198710,'Darwin_Núñez':279634,
  'Alphonso_Davies':253537,'Achraf_Hakimi':241649,'Sadio_Mané':158278,
  'Andrew_Robertson':194026,'Luka_Modrić':76762,'Granit_Xhaka':163399,
  'Hakan_Çalhanoğlu':155490,'Luis_Díaz_(footballer,_born_1997)':265892,
  'Miguel_Almirón':197681,'Mohamed_Salah':134771,'Thomas_Partey':216154,
  'Son_Heung-min':149945,'Wataru_Endo':232064,'Mathew_Leckie':142402,
  'Mehdi_Taremi':200503,'Sardar_Azmoun':208889,'Salem_Al-Dawsari':210901,
  'Percy_Tau':226563,'Keagan_Dolly':226563,'Erling_Haaland':253989,
  'Marcel_Sabitzer':196793,'David_Alaba':142765,'Tomáš_Souček':228649,
  'Edin_Džeko':68874,'Robert_Lewandowski':113304,'Viktor_Gyökeres':282406,
  'Dominik_Szoboszlai':284799,'Dušan_Vlahović':272979,
  'Khvicha_Kvaratskhelia':313617,'Riyad_Mahrez':160047,
  'Sébastien_Haller':211117,'Keylor_Navas':132208,
}

function useWikiPhoto(wiki) {
  const id = ESPN_IDS[wiki]
  if (id) return `https://a.espncdn.com/i/headshots/soccer/players/full/${id}.png`
  return null
}

// ── CARROSSEL DE JOGOS DO DIA ─────────────────────────────────────────────────
function TodayCarousel({ participant }) {
  const navigate = useNavigate()
  const [predictions, setPredictions] = useState({})

  const now = new Date()
  const tomorrowEnd = new Date(now)
  tomorrowEnd.setDate(tomorrowEnd.getDate()+1)
  tomorrowEnd.setHours(23,59,59,999)

  const upcoming = GROUP_MATCHES.filter(m => new Date(m.date) > new Date(now.getTime()-3*3600000))
  const todayMatches = upcoming.filter(m => new Date(m.date) <= tomorrowEnd).slice(0,8)
  const displayMatches = todayMatches.length > 0 ? todayMatches : upcoming.slice(0,6)

  useEffect(() => {
    if (!participant?.id) return
    supabase.from('predictions').select('match_id').eq('participant_id', participant.id)
      .then(({ data }) => {
        const map = {}
        data?.forEach(p => { map[p.match_id] = true })
        setPredictions(map)
      })
  }, [participant?.id])

  if (displayMatches.length === 0) return null

  const getDateLabel = (date) => {
    const d = new Date(date)
    const now = new Date()
    const todayStart = new Date(now); todayStart.setHours(0,0,0,0)
    const tomorrowStart = new Date(todayStart); tomorrowStart.setDate(tomorrowStart.getDate()+1)
    const afterTomorrowStart = new Date(tomorrowStart); afterTomorrowStart.setDate(afterTomorrowStart.getDate()+1)
    if (d >= todayStart && d < tomorrowStart) return { label:'HOJE', isToday:true }
    if (d >= tomorrowStart && d < afterTomorrowStart) return { label:'AMANHÃ', isToday:false }
    const weekdays = ['DOM','SEG','TER','QUA','QUI','SEX','SÁB']
    return { label: weekdays[d.getDay()] + ' ' + String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0'), isToday:false }
  }

  const formatTime = (date) => new Date(date).toLocaleTimeString('pt-BR', {
    hour:'2-digit', minute:'2-digit', timeZone:'America/Sao_Paulo'
  })

  const isLocked = (date) => new Date() >= new Date(date)

  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'#009639', animation:'pulse 1.5s infinite' }}/>
          <span style={{ color:'#002855', fontWeight:900, fontSize:13 }}>
            {todayMatches.length > 0 ? 'Jogos de Hoje e Amanhã' : 'Próximos Jogos'}
          </span>
        </div>
        <button onClick={()=>navigate('/palpites')}
          style={{ color:'#009639', fontSize:10, fontWeight:800, background:'none', border:'none', cursor:'pointer', fontFamily:'Nunito,sans-serif' }}>
          Ver todos →
        </button>
      </div>

      <div style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:8, scrollSnapType:'x mandatory', WebkitOverflowScrolling:'touch' }}>
        {displayMatches.map(match => {
          const dl = getDateLabel(match.date)
          return (
            <MatchCard key={match.id} match={match}
              hasPred={!!predictions[match.id]}
              locked={isLocked(match.date)}
              today={dl.isToday}
              dateLabel={dl.label}
              formatTime={formatTime}
              onTap={()=>{ if(!isLocked(match.date)) navigate(`/palpites?match=${match.id}`) }}
            />
          )
        })}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}} ::-webkit-scrollbar{height:0}`}</style>
    </div>
  )
}

// URL base do Supabase Storage
const SUPABASE_URL = 'https://nkbumxaksiibljgpmgak.supabase.co'
const getMatchThumb = (id) => `${SUPABASE_URL}/storage/v1/object/public/matches/match_${id}.png`

function MatchCard({ match, hasPred, locked, today, dateLabel, formatTime, onTap }) {
  const [imgOk, setImgOk] = useState(true)
  const c1 = TEAM_COLORS[match.team1] || ['#1a2a4a','#2a4a6a']
  const c2 = TEAM_COLORS[match.team2] || ['#1a4a2a','#2a6a4a']
  const star1 = STARS[match.team1]
  const star2 = STARS[match.team2]

  let borderColor, statusBg, statusColor, statusText
  if (locked)       { borderColor='#E2EAF0'; statusBg='rgba(155,171,184,0.1)'; statusColor='#9BABB8'; statusText='🔒 Encerrado' }
  else if (hasPred) { borderColor='rgba(0,150,57,0.3)'; statusBg='rgba(0,150,57,0.08)'; statusColor='#009639'; statusText='✓ Palpitado' }
  else              { borderColor='rgba(245,166,35,0.5)'; statusBg='rgba(245,166,35,0.10)'; statusColor='#D4890A'; statusText='⚡ Palpitar' }

  return (
    <div onClick={onTap} style={{
      flexShrink:0, scrollSnapAlign:'start', width:195,
      borderRadius:16, overflow:'hidden', border:`1.5px solid ${borderColor}`,
      boxShadow:'0 4px 16px rgba(0,40,85,0.09)', cursor:locked?'default':'pointer',
      opacity:locked?0.78:1, background:'#fff',
    }}>
      {/* Thumbnail */}
      <div style={{ height:110, position:'relative', overflow:'hidden' }}>

        {/* Imagem do Supabase se disponível */}
        {imgOk ? (
          <>
            <img
              src={getMatchThumb(match.id)}
              alt={`${match.team1} x ${match.team2}`}
              style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top', display:'block' }}
              onError={() => setImgOk(false)}
            />
            {/* Badge data sobre a imagem */}
            <div style={{ position:'absolute', bottom:7, left:7, zIndex:3, background:today?'#009639':'rgba(0,0,0,0.6)', borderRadius:5, padding:'2px 8px' }}>
              <span style={{ color:'#fff', fontSize:7, fontWeight:900 }}>{dateLabel}</span>
            </div>
          </>
        ) : (
          /* Fallback clean caso não tenha imagem */
          <div style={{ height:'100%', display:'flex', position:'relative' }}>
            <div style={{ flex:1, background:`linear-gradient(150deg,${c1[0]},${c1[1]})`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4 }}>
              <span style={{ fontSize:30, filter:'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}>{getFlag(match.team1)}</span>
              <span style={{ color:'rgba(255,255,255,0.9)', fontSize:7, fontWeight:800 }}>{star1?.name||''}</span>
              <div style={{ position:'absolute', bottom:6, left:6, background:today?'#009639':'rgba(0,0,0,0.5)', borderRadius:5, padding:'2px 8px' }}>
                <span style={{ color:'#fff', fontSize:7, fontWeight:900 }}>{dateLabel}</span>
              </div>
            </div>
            <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', zIndex:5, background:'rgba(255,255,255,0.95)', borderRadius:20, padding:'4px 7px', boxShadow:'0 2px 8px rgba(0,0,0,0.2)', display:'flex', flexDirection:'column', alignItems:'center' }}>
              <span style={{ color:'#9BABB8', fontSize:6, fontWeight:900, letterSpacing:1 }}>VS</span>
              <span style={{ color:'#002855', fontSize:11, fontWeight:900, lineHeight:1 }}>{formatTime(match.date)}</span>
            </div>
            <div style={{ flex:1, background:`linear-gradient(150deg,${c2[1]},${c2[0]})`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4 }}>
              <span style={{ fontSize:30, filter:'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}>{getFlag(match.team2)}</span>
              <span style={{ color:'rgba(255,255,255,0.9)', fontSize:7, fontWeight:800 }}>{star2?.name||''}</span>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding:'8px 10px 10px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
          <span style={{ color:'#002855', fontWeight:900, fontSize:10, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{match.team1}</span>
          <span style={{ color:'#9BABB8', fontSize:8, fontWeight:700, padding:'0 4px', flexShrink:0 }}>G{match.group}</span>
          <span style={{ color:'#002855', fontWeight:900, fontSize:10, flex:1, textAlign:'right', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{match.team2}</span>
        </div>
        <div style={{ color:'#9BABB8', fontSize:8, textAlign:'center', marginBottom:7, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>📍 {match.city}</div>
        <div style={{ background:statusBg, borderRadius:8, padding:'5px', textAlign:'center' }}>
          <span style={{ color:statusColor, fontWeight:900, fontSize:10 }}>{statusText}</span>
        </div>
      </div>
    </div>
  )
}
function NewsWidget() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIdx, setCurrentIdx] = useState(0)

  useEffect(() => {
    supabase
      .from('news')
      .select('title, link, source, pub_date, image_url, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setNews(data.map(n => ({ ...n, pubDate: n.pub_date })))
        }
        setLoading(false)
      })
  }, [])
  useEffect(() => {
    if (news.length === 0) return
    const id = setInterval(() => setCurrentIdx(i => (i+1) % Math.min(news.length, 5)), 4000)
    return () => clearInterval(id)
  }, [news.length])

  const formatNewsDate = (d) => {
    if (!d) return ''
    const date = new Date(d)
    return date.toLocaleDateString('pt-BR', { day:'2-digit', month:'short' })
  }

  const visibleNews = news.slice(0, 5)

  return (
    <div style={{ background:'#fff', borderRadius:14, padding:'16px 14px', border:'1px solid #E2EAF0', boxShadow:'0 1px 8px rgba(0,40,85,0.05)', overflow:'hidden' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#002855,#009639)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>📰</div>
          <span style={{ color:'#002855', fontWeight:900, fontSize:14 }}>Notícias da Copa</span>
        </div>
        <div style={{ display:'flex', gap:5 }}>
          {visibleNews.map((_,i) => (
            <div key={i} onClick={() => setCurrentIdx(i)} style={{ width: i===currentIdx?18:7, height:7, borderRadius:4, background:i===currentIdx?'#009639':'#E2EAF0', cursor:'pointer', transition:'all .3s' }}/>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display:'flex', gap:12 }}>
          <div style={{ flex:'0 0 130px', height:110, borderRadius:12, background:'linear-gradient(90deg,#F4F6F9 25%,#e8eaed 50%,#F4F6F9 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite' }}/>
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
            {[80,60,60].map((w,i) => (
              <div key={i} style={{ height:14, width:`${w}%`, borderRadius:6, background:'linear-gradient(90deg,#F4F6F9 25%,#e8eaed 50%,#F4F6F9 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite' }}/>
            ))}
          </div>
          <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
        </div>
      ) : (
        <>
          {/* Notícia destacada — layout horizontal com imagem à esquerda */}
          {visibleNews[currentIdx] && (
            <a href={visibleNews[currentIdx].link} target="_blank" rel="noopener noreferrer"
              style={{ display:'flex', gap:12, borderRadius:12, overflow:'hidden', textDecoration:'none', marginBottom:14, border:'1px solid #E2EAF0', background:'#F8FAFC' }}>
              {/* Ícone lateral */}
              <div style={{ flexShrink:0, width:90, minHeight:100, background:'linear-gradient(135deg,#002855 0%,#009639 100%)', position:'relative', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {visibleNews[currentIdx].image_url
                  ? <img src={visibleNews[currentIdx].image_url} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}/>
                  : <span style={{ fontSize:36, opacity:.7 }}>⚽</span>
                }
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right,transparent 70%,#F8FAFC)' }}/>
              </div>
              {/* Texto */}
              <div style={{ flex:1, padding:'12px 12px 12px 0', display:'flex', flexDirection:'column', justifyContent:'center' }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                  <span style={{ background:'rgba(0,150,57,0.1)', color:'#009639', fontSize:9, fontWeight:800, borderRadius:5, padding:'2px 7px' }}>⚽ COPA 2026</span>
                  {visibleNews[currentIdx].pubDate && <span style={{ color:'#9BABB8', fontSize:9 }}>{formatNewsDate(visibleNews[currentIdx].pubDate)}</span>}
                </div>
                <div style={{ color:'#002855', fontWeight:800, fontSize:13, lineHeight:1.45, marginBottom:4 }}>{visibleNews[currentIdx].title}</div>
                {visibleNews[currentIdx].summary && (
                  <div style={{ color:'#6B7A8D', fontSize:11, lineHeight:1.4, marginBottom:6 }}>{visibleNews[currentIdx].summary}</div>
                )}
                <div style={{ color:'#009639', fontSize:10, fontWeight:700 }}>Ler mais →</div>
              </div>
            </a>
          )}

          {/* Divisor */}
          <div style={{ color:'#9BABB8', fontSize:9, fontWeight:800, letterSpacing:1.2, textTransform:'uppercase', marginBottom:10 }}>Mais notícias</div>

          {/* Lista de outras notícias */}
          {visibleNews.filter((_,i) => i!==currentIdx).slice(0,4).map((item, i) => (
            <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
              style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 0', borderBottom:'1px solid #F4F6F9', textDecoration:'none' }}>
              <div style={{ width:34, height:34, borderRadius:8, background:'linear-gradient(135deg,#F4F6F9,#E2EAF0)', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:16 }}>
                {item.image_url
                  ? <img src={item.image_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  : '⚽'
                }
              </div>
              <div style={{ flex:1 }}>
                <div style={{ color:'#002855', fontSize:12, fontWeight:700, lineHeight:1.4, marginBottom:3 }}>{item.title}</div>
                <div style={{ color:'#9BABB8', fontSize:10 }}>{item.source} · {formatNewsDate(item.pubDate)}</div>
              </div>
              <span style={{ color:'#C8D5E0', fontSize:14, flexShrink:0, marginTop:8 }}>›</span>
            </a>
          ))}
        </>
      )}
    </div>
  )
}


// ── TOP 5 ─────────────────────────────────────────────────────────────────────
function Top5({ participant, ranking, myRank }) {
  const navigate = useNavigate()
  const isInTop5 = ranking.some(p => p.id === participant.id)
  return (
    <div style={{ background:'#fff', borderRadius:14, padding:'14px 12px', border:'1px solid #E2EAF0', boxShadow:'0 1px 8px rgba(0,40,85,0.05)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
        <span style={{ color:'#002855', fontWeight:900, fontSize:13 }}>Top 5</span>
        <button onClick={()=>navigate('/ranking')} style={{ color:'#009639', fontSize:10, fontWeight:800, background:'none', border:'none', cursor:'pointer', fontFamily:'Nunito,sans-serif' }}>Ver ranking</button>
      </div>
      {ranking.map((p,i)=>{
        const isMe=p.id===participant.id
        return (
          <div key={p.id}
            onClick={()=>{ if(!isMe && window.__openParticipantModal) window.__openParticipantModal(p) }}
            style={{ display:'flex', alignItems:'center', gap:7, padding:'6px 8px', borderRadius:10, background:isMe?'#e8f5ee':'transparent', border:isMe?'1px solid rgba(0,150,57,0.2)':'1px solid transparent', marginBottom:4, cursor:isMe?'default':'pointer', transition:'background .15s' }}
            onMouseEnter={e=>{ if(!isMe) e.currentTarget.style.background='#F4F6F9' }}
            onMouseLeave={e=>{ e.currentTarget.style.background=isMe?'#e8f5ee':'transparent' }}
          >
            <div style={{ width:22, height:22, borderRadius:'50%', background:i===0?'#FEF3DC':i===1?'#F4F6F9':i===2?'#FFF0E6':'#F4F6F9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:i<3?14:11, fontWeight:900, color:i===0?'#D4890A':i===1?'#9BABB8':i===2?'#C96A2A':'#9BABB8', flexShrink:0 }}>
              {i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}º`}
            </div>
            <div style={{ width:28, height:28, borderRadius:'50%', overflow:'hidden', background:'#F4F6F9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0, border:isMe?'2px solid #009639':'none' }}>
              {p.avatar_url ? <img src={p.avatar_url} style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : p.avatar_emoji}
            </div>
            <span style={{ flex:1, color:isMe?'#009639':'#002855', fontWeight:800, fontSize:11, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}{isMe?' (você)':''}</span>
            <span style={{ color:isMe?'#009639':'#6B7A8D', fontWeight:900, fontSize:11 }}>{(p.total_points||0).toLocaleString()} <span style={{ fontSize:9 }}>pts</span></span>
            {!isMe && <span style={{ color:'#C8D5E0', fontSize:14, flexShrink:0 }}>›</span>}
          </div>
        )
      })}
      {!isInTop5 && myRank && (
        <div>
          <div style={{ textAlign:'center', color:'#9BABB8', fontSize:9, margin:'6px 0 4px' }}>• • •</div>
          <div style={{ display:'flex', alignItems:'center', gap:7, padding:'6px 8px', borderRadius:10, background:'#e8f5ee', border:'1px solid rgba(0,150,57,0.2)' }}>
            <div style={{ width:22, height:22, borderRadius:'50%', background:'#F4F6F9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:900, color:'#9BABB8', flexShrink:0 }}>{myRank}º</div>
            <div style={{ width:28, height:28, borderRadius:'50%', overflow:'hidden', background:'#F4F6F9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0, border:'2px solid #009639' }}>
              {participant.avatar_url ? <img src={participant.avatar_url} style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : participant.avatar_emoji}
            </div>
            <span style={{ flex:1, color:'#009639', fontWeight:800, fontSize:11, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{participant.name} (você)</span>
            <span style={{ color:'#009639', fontWeight:900, fontSize:11 }}>{(participant.total_points||0).toLocaleString()} <span style={{ fontSize:9 }}>pts</span></span>
          </div>
        </div>
      )}
    </div>
  )
}


// ── DASHBOARD PRINCIPAL ───────────────────────────────────────────────────────
export default function Dashboard({ participant, onLogout }) {
  const navigate = useNavigate()
  const [stats,      setStats]      = useState({ points:0, done:0 })
  const [ranking,    setRanking]    = useState([])
  const [totalParts, setTotalParts] = useState(0)
  const [myRank,     setMyRank]     = useState(null)
  const [myPredIds,  setMyPredIds]  = useState(new Set())

  const fetchData = useCallback(async () => {
    const [{ data: preds }, { data: parts }, { count }] = await Promise.all([
      supabase.from('predictions').select('points,match_id').eq('participant_id', participant.id),
      supabase.from('participants').select('id,name,avatar_emoji,avatar_url,total_points,exact_hits,result_hits,predictions_count'),
      supabase.from('participants').select('*',{count:'exact',head:true}),
    ])
    setStats({ points: preds?.reduce((s,p)=>s+(p.points||0),0)||0, done: preds?.length||0 })
    setMyPredIds(new Set(preds?.map(p=>p.match_id)||[]))
    setTotalParts(count||0)
    // Ordenação igual ao ranking: alfabético sem pontos, depois critérios de desempate
    const sortFn = (a, b) => {
      const allZero = (p) => (p.total_points||0) === 0 && (p.exact_hits||0) === 0 && (p.result_hits||0) === 0
      if (allZero(a) && allZero(b)) return a.name.localeCompare(b.name, 'pt-BR')
      if ((b.total_points||0) !== (a.total_points||0)) return (b.total_points||0) - (a.total_points||0)
      if ((b.exact_hits||0) !== (a.exact_hits||0)) return (b.exact_hits||0) - (a.exact_hits||0)
      if ((b.result_hits||0) !== (a.result_hits||0)) return (b.result_hits||0) - (a.result_hits||0)
      const errA = (a.predictions_count||0)-(a.exact_hits||0)-(a.result_hits||0)
      const errB = (b.predictions_count||0)-(b.exact_hits||0)-(b.result_hits||0)
      if (errA !== errB) return errA - errB
      if ((b.predictions_count||0) !== (a.predictions_count||0)) return (b.predictions_count||0) - (a.predictions_count||0)
      return a.name.localeCompare(b.name, 'pt-BR')
    }
    const sortedParts = (parts||[]).slice().sort(sortFn)
    setRanking(sortedParts.slice(0,5))
    // usa a mesma lista 'parts' para calcular posição do usuário
    const idx = sortedParts.findIndex(p=>p.id===participant.id)
    setMyRank(idx>=0?idx+1:null)
  }, [participant.id])

  useEffect(() => {
    fetchData()
    const ch = supabase.channel('dash-rt').on('postgres_changes',{event:'UPDATE',schema:'public',table:'participants'},fetchData).subscribe()
    return ()=>supabase.removeChannel(ch)
  }, [fetchData])

  const openCount = GROUP_MATCHES.filter(m=>isMatchOpen(m)&&!myPredIds.has(m.id)).length

  return (
    <div style={{ minHeight:'100vh', background:'#F4F6F9', overflowX:'hidden' }}>
      <Header participant={participant} onLogout={onLogout}/>

      {/* Aviso palpites */}
      {openCount>0 && (
        <div style={{ position:'fixed', top:58, left:0, right:0, zIndex:40, background:'#F5A623', padding:'8px 16px', display:'flex', alignItems:'center', gap:8 }}>
          <AlertCircle size={14} color="#002855"/>
          <span style={{ color:'#002855', fontWeight:800, fontSize:12 }}>⚠️ {openCount} jogo{openCount!==1?'s':''} em aberto!</span>
          <button onClick={()=>navigate('/palpites')} style={{ marginLeft:'auto', background:'#002855', color:'#fff', border:'none', borderRadius:8, padding:'4px 10px', fontWeight:800, fontSize:11, cursor:'pointer', fontFamily:'Nunito,sans-serif' }}>PALPITAR AGORA</button>
        </div>
      )}

      <div style={{ paddingTop: openCount>0?96:58 }}>
        <Hero onPalpites={()=>navigate('/palpites')} onJogos={()=>navigate('/palpites')}/>

        <div style={{ padding:'14px 12px 0', display:'flex', flexDirection:'column', gap:0, maxWidth:900, margin:'0 auto', width:'100%' }}>
          <TodayCarousel participant={participant} />
        </div>

        <div style={{ padding:'0 12px 90px', display:'flex', flexDirection:'column', gap:14, maxWidth:900, margin:'0 auto', width:'100%' }}>
          <StatsStrip stats={stats} totalParts={totalParts} myRank={myRank}/>

          <NewsWidget/>
          <Top5 participant={participant} ranking={ranking} myRank={myRank}/>

          {/* Banners */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div style={{ background:'#fff', borderRadius:14, padding:'14px 12px', border:'1px solid #E2EAF0', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', right:-8, bottom:-8, opacity:.12 }}>
                <img src="/images/trophy-multi.webp" style={{ width:80, height:80, objectFit:'contain' }} alt=""/>
              </div>
              <div style={{ color:'#6B7A8D', fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Prêmio para o Campeão</div>
              <div style={{ color:'#009639', fontWeight:900, fontSize:14, lineHeight:1.2, marginBottom:2 }}>Cresce a cada<br/>nova entrada!</div>
              <div style={{ color:'#9BABB8', fontSize:10, margin:'3px 0 10px' }}>50 vagas · R$ 20 cada</div>
              <button onClick={()=>navigate('/premios')} style={{ background:'#009639', color:'#fff', border:'none', borderRadius:8, padding:'6px 10px', fontWeight:800, fontSize:9, cursor:'pointer', fontFamily:'Nunito,sans-serif' }}>VER PRÊMIOS</button>
            </div>

            <div onClick={()=>navigate('/regras')} style={{ borderRadius:14, padding:'14px 12px', background:'linear-gradient(135deg,#002855 0%,#009639 100%)', position:'relative', overflow:'hidden', cursor:'pointer' }}>
              <div style={{ position:'absolute', right:-10, bottom:-10, opacity:.15 }}>
                <img src="/images/trophy.webp" style={{ width:70, height:70, objectFit:'contain', filter:'grayscale(1)' }} alt=""/>
              </div>
              <div style={{ color:'#fff', fontWeight:900, fontSize:13, lineHeight:1.4, position:'relative', zIndex:1 }}>
                Confiabilidade<br/>é nosso DNA.<br/><span style={{ color:'#F5A623' }}>A vitória<br/>pode ser sua!</span>
              </div>
              <button onClick={(e)=>{ e.stopPropagation(); navigate('/regras') }} style={{ marginTop:10, background:'#F5A623', color:'#002855', border:'none', borderRadius:8, padding:'6px 10px', fontWeight:800, fontSize:9, cursor:'pointer', fontFamily:'Nunito,sans-serif', position:'relative', zIndex:1 }}>VER REGRAS</button>
            </div>
          </div>

          {/* Pontuação */}
          <div style={{ background:'#fff', borderRadius:16, padding:'16px', border:'1px solid #E2EAF0', marginBottom:80 }}>
            <div style={{ color:'#002855', fontWeight:900, fontSize:15, marginBottom:12 }}>📋 Pontuação</div>
            {[['Placar exato','#D4890A','rgba(245,166,35,0.10)','+3 pts'],['Resultado correto','#007a2e','rgba(0,150,57,0.08)','+1 pt'],['Campeão correto','#D4890A','rgba(245,166,35,0.10)','+10 pts'],['Vice correto','#007a2e','rgba(0,150,57,0.08)','+5 pts'],['3º lugar correto','#007a2e','rgba(0,150,57,0.08)','+3 pts'],['Resultado errado','#C0392B','rgba(220,53,69,0.07)','0 pts']].map(([l,c,bg,pts])=>(
              <div key={l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:'1px solid #F4F6F9' }}>
                <span style={{ color:'#6B7A8D', fontSize:13 }}>{l}</span>
                <span style={{ background:bg, color:c, borderRadius:20, padding:'3px 12px', fontSize:12, fontWeight:800 }}>{pts}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
