import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { GROUP_MATCHES, getFlag } from '../data/matches'
import { ChevronLeft } from 'lucide-react'

const SUPABASE_URL = 'https://nkbumxaksiibljgpmgak.supabase.co'

// Cores de cada seleção para o visual temático
const TEAM_COLORS = {
  'Brasil':['#009C3B','#FFDF00'],'Argentina':['#74ACDF','#fff'],
  'França':['#002395','#ED2939'],'Alemanha':['#000','#DD0000'],
  'Espanha':['#AA151B','#F1BF00'],'Portugal':['#006600','#FF0000'],
  'Inglaterra':['#CF091D','#fff'],'Holanda':['#FF6600','#003DA5'],
  'Bélgica':['#000','#EF3340'],'México':['#006847','#CE1126'],
  'Estados Unidos':['#002868','#BF0A30'],'Uruguai':['#5EB6E4','#fff'],
  'Canadá':['#FF0000','#fff'],'Marrocos':['#C1272D','#006233'],
  'Senegal':['#00853F','#FDEF42'],'Escócia':['#003DA5','#fff'],
  'Croácia':['#FF0000','#fff'],'Suíça':['#FF0000','#fff'],
  'Turquia':['#E30A17','#fff'],'Colômbia':['#FCD116','#003087'],
  'Paraguai':['#D52B1E','#fff'],'Egito':['#CE1126','#fff'],
  'Gana':['#006B3F','#FCD116'],'Panamá':['#DA121A','#fff'],
  'Coreia do Sul':['#CD2E3A','#003478'],'Japão':['#BC002D','#fff'],
  'Austrália':['#FFD700','#006400'],'Irã':['#239F40','#DA0000'],
  'Noruega':['#EF2B2D','#fff'],'Áustria':['#ED2939','#fff'],
  'África do Sul':['#007A4D','#FFB612'],'Argélia':['#006233','#D21034'],
  'Arábia Saudita':['#006C35','#fff'],'Tunísia':['#E70013','#fff'],
  'Bósnia e Herz.':['#002395','#FCCA00'],'Rep. Tcheca':['#D7141A','#fff'],
  'Suécia':['#006AA7','#FECC02'],'República Tcheca':['#D7141A','#fff'],
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('pt-BR', {
    hour:'2-digit', minute:'2-digit', timeZone:'America/Sao_Paulo'
  })
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day:'2-digit', month:'2-digit', timeZone:'America/Sao_Paulo'
  })
}

// Bubble de mensagem
function MessageBubble({ msg, isMe }) {
  return (
    <div style={{
      display:'flex', flexDirection: isMe ? 'row-reverse' : 'row',
      alignItems:'flex-end', gap:8, marginBottom:12,
    }}>
      {/* Avatar */}
      <div style={{
        width:32, height:32, borderRadius:'50%', flexShrink:0,
        background:'rgba(255,255,255,0.15)', overflow:'hidden',
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:16,
        border:'2px solid rgba(255,255,255,0.2)',
      }}>
        {msg.participant_avatar
          ? <img src={msg.participant_avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>e.target.style.display='none'}/>
          : <span>⚽</span>}
      </div>

      {/* Balão */}
      <div style={{ maxWidth:'72%', display:'flex', flexDirection:'column', alignItems: isMe?'flex-end':'flex-start' }}>
        {!isMe && (
          <span style={{ color:'rgba(255,255,255,0.6)', fontSize:10, fontWeight:700, marginBottom:3, marginLeft:4 }}>
            {msg.participant_name}
          </span>
        )}
        <div style={{
          background: isMe ? 'rgba(0,150,57,0.85)' : 'rgba(255,255,255,0.12)',
          backdropFilter:'blur(10px)',
          borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          padding:'10px 14px',
          border: isMe ? '1px solid rgba(0,200,80,0.3)' : '1px solid rgba(255,255,255,0.1)',
        }}>
          <p style={{ color:'#fff', fontSize:13, lineHeight:1.5, margin:0, wordBreak:'break-word' }}>
            {msg.message}
          </p>
        </div>
        <span style={{ color:'rgba(255,255,255,0.35)', fontSize:9, marginTop:3, marginLeft:4, marginRight:4 }}>
          {formatTime(msg.created_at)}
        </span>
      </div>
    </div>
  )
}

export default function MatchChat({ participant }) {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [match, setMatch] = useState(null)
  const [dbMatch, setDbMatch] = useState(null)
  const [bannerUrl, setBannerUrl] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const mId = parseInt(matchId)

  // Dados estáticos do jogo
  useEffect(() => {
    const m = GROUP_MATCHES.find(m => m.id === mId)
    setMatch(m)
  }, [mId])

  // Dados do banco (placar, banner)
  useEffect(() => {
    supabase.from('matches').select('*').eq('id', mId).single()
      .then(({ data }) => setDbMatch(data))

    // Busca banner desse jogo
    supabase.from('banners').select('img_mobile,img_desktop').eq('match_id', mId).single()
      .then(({ data }) => {
        if (data) {
          const isMobile = window.innerWidth < 768
          const file = isMobile ? data.img_mobile : data.img_desktop
          setBannerUrl(`${SUPABASE_URL}/storage/v1/object/public/matches/banner_${file}.png?v=2`)
        }
      })
  }, [mId])

  // Carrega mensagens
  const loadMessages = useCallback(async () => {
    const { data } = await supabase
      .from('match_chat')
      .select('*')
      .eq('match_id', mId)
      .order('created_at', { ascending: true })
      .limit(200)
    if (!data) return
    setMessages(prev => {
      const sameLength = prev.length === data.length
      const sameLast = sameLength && prev.length > 0
        ? prev[prev.length - 1].id === data[data.length - 1].id
        : sameLength
      return sameLast ? prev : data
    })
  }, [mId])

  useEffect(() => { loadMessages() }, [loadMessages])

  // Realtime — escuta novas mensagens
  useEffect(() => {
    const channel = supabase.channel(`chat-${mId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'match_chat',
        filter: `match_id=eq.${mId}`
      }, payload => {
        setMessages(prev => prev.some(m => m.id === payload.new.id) ? prev : [...prev, payload.new])
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [mId])

  // Rede de segurança: se o realtime cair silenciosamente (comum no mobile —
  // app em 2º plano, troca de rede, etc.), garante que o chat sincroniza sozinho
  useEffect(() => {
    const interval = setInterval(() => { loadMessages() }, 5000)
    return () => clearInterval(interval)
  }, [loadMessages])

  // Atualiza assim que o usuário volta pro app/aba (ex: trocou de app e voltou)
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') loadMessages()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [loadMessages])

  // Scroll automático ao receber mensagem
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages])

  const send = async () => {
    const msg = text.trim()
    if (!msg || sending || !participant) return
    setSending(true)
    setText('')

    const { data, error } = await supabase.from('match_chat').insert([{
      match_id:          mId,
      participant_id:    participant.id,
      participant_name:  participant.name,
      participant_avatar: participant.photoUrl || participant.avatar_url || null,
      message:           msg,
    }]).select().single()

    if (!error && data) {
      // Mostra a mensagem na hora, sem depender do realtime
      setMessages(prev => prev.some(m => m.id === data.id) ? prev : [...prev, data])
    } else if (error) {
      // Falhou — devolve o texto pro usuário tentar de novo
      setText(msg)
      console.error('Erro ao enviar mensagem:', error)
    }

    setSending(false)
    inputRef.current?.focus()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  // Cores temáticas do jogo
  const c1 = match ? (TEAM_COLORS[match.team1] || ['#1a3a2a','#2a5a3a']) : ['#002855','#009639']
  const c2 = match ? (TEAM_COLORS[match.team2] || ['#1a2a4a','#2a4a6a']) : ['#003366','#006699']
  const isLive = dbMatch && !dbMatch.is_finished && dbMatch.score1 !== null

  return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      background:`linear-gradient(160deg, ${c1[0]} 0%, #0a0a0a 45%, ${c2[0]} 100%)`,
      position:'relative', overflow:'hidden',
    }}>

      {/* Fundo temático — imagem do banner com blur */}
      {bannerUrl && (
        <div style={{ position:'fixed', inset:0, zIndex:0, overflow:'hidden' }}>
          <img src={bannerUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', filter:'blur(20px) brightness(0.25)', transform:'scale(1.1)' }}/>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)' }}/>
        </div>
      )}

      {/* Header */}
      <div style={{
        position:'fixed', top:0, left:0, right:0, zIndex:50,
        background:'rgba(0,0,0,0.7)', backdropFilter:'blur(20px)',
        borderBottom:'1px solid rgba(255,255,255,0.1)',
        padding:'12px 16px',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={() => navigate(-1)}
            style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:10, padding:'8px', cursor:'pointer', display:'flex', color:'#fff' }}>
            <ChevronLeft size={18} color="#fff"/>
          </button>

          {match && (
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                <span style={{ fontSize:22 }}>{getFlag(match.team1)}</span>
                {dbMatch?.is_finished ? (
                  <span style={{ color:'#fff', fontWeight:900, fontSize:16 }}>
                    {dbMatch.score1} × {dbMatch.score2}
                  </span>
                ) : isLive ? (
                  <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <div style={{ width:7, height:7, borderRadius:'50%', background:'#ef4444', animation:'blink 1s infinite' }}/>
                    <span style={{ color:'#ef4444', fontWeight:800, fontSize:12 }}>AO VIVO</span>
                    <span style={{ color:'#fff', fontWeight:900, fontSize:16 }}>
                      {dbMatch.score1} × {dbMatch.score2}
                    </span>
                  </div>
                ) : (
                  <span style={{ color:'rgba(255,255,255,0.5)', fontSize:13 }}>VS</span>
                )}
                <span style={{ fontSize:22 }}>{getFlag(match.team2)}</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ color:'rgba(255,255,255,0.5)', fontSize:10 }}>
                  {match.team1} · {match.team2}
                </span>
                <span style={{ color:'rgba(255,255,255,0.3)', fontSize:10 }}>·</span>
                <span style={{ color:'rgba(255,255,255,0.5)', fontSize:10 }}>
                  {match.city} · {formatDate(match.date)}
                </span>
              </div>
            </div>
          )}

          <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:10, padding:'4px 10px', textAlign:'center' }}>
            <div style={{ color:'#fff', fontWeight:900, fontSize:12 }}>{messages.length}</div>
            <div style={{ color:'rgba(255,255,255,0.5)', fontSize:8 }}>msgs</div>
          </div>
        </div>
      </div>

      {/* Lista de mensagens */}
      <div style={{
        flex:1, overflowY:'auto', position:'relative', zIndex:1,
        padding:'80px 14px 80px',
      }}>
        {messages.length === 0 ? (
          <div style={{ textAlign:'center', marginTop:60 }}>
            <div style={{ fontSize:48, marginBottom:12 }}>💬</div>
            <div style={{ color:'rgba(255,255,255,0.6)', fontWeight:700, fontSize:15 }}>Seja o primeiro a comentar!</div>
            <div style={{ color:'rgba(255,255,255,0.35)', fontSize:12, marginTop:4 }}>Compartilhe sua opinião sobre o jogo</div>
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isMe={msg.participant_id === participant?.id}
            />
          ))
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input de mensagem */}
      <div style={{
        position:'fixed', bottom:0, left:0, right:0, zIndex:50,
        background:'rgba(0,0,0,0.75)', backdropFilter:'blur(20px)',
        borderTop:'1px solid rgba(255,255,255,0.1)',
        padding:'12px 14px 24px',
        display:'flex', gap:10, alignItems:'flex-end',
      }}>
        {/* Avatar do usuário */}
        <div style={{ width:36, height:36, borderRadius:'50%', flexShrink:0, overflow:'hidden', background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, border:'2px solid rgba(255,255,255,0.2)' }}>
          {participant?.photoUrl || participant?.avatar_url
            ? <img src={participant.photoUrl || participant.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
            : <span>{participant?.avatar || '⚽'}</span>}
        </div>

        {/* Campo de texto */}
        <div style={{ flex:1, background:'rgba(255,255,255,0.1)', borderRadius:20, border:'1px solid rgba(255,255,255,0.15)', display:'flex', alignItems:'center', padding:'2px 6px 2px 14px' }}>
          <textarea
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value.slice(0, 300))}
            onKeyDown={handleKey}
            placeholder="Comente o jogo..."
            rows={1}
            style={{
              flex:1, background:'transparent', border:'none', outline:'none',
              color:'#fff', fontSize:14, fontFamily:'Nunito,sans-serif',
              resize:'none', lineHeight:1.5, padding:'8px 0',
              maxHeight:80, overflowY:'auto',
            }}
          />
          {text.length > 250 && (
            <span style={{ color: text.length >= 300 ? '#ef4444' : 'rgba(255,255,255,0.4)', fontSize:9, flexShrink:0 }}>
              {300-text.length}
            </span>
          )}
        </div>

        {/* Botão enviar */}
          <button
          onClick={send}
          disabled={!text.trim() || sending}
          style={{
            width:42, height:42, borderRadius:'50%', border:'none', cursor:'pointer',
            background: text.trim() ? 'linear-gradient(135deg,#009639,#00c44f)' : 'rgba(255,255,255,0.1)',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
            boxShadow: text.trim() ? '0 4px 16px rgba(0,150,57,0.4)' : 'none',
            transition:'all .2s', fontSize:18,
          }}>
          <span style={{ color: text.trim() ? '#fff' : 'rgba(255,255,255,0.3)' }}>➤</span>
        </button>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }
        textarea::placeholder { color: rgba(255,255,255,0.35); }
        ::-webkit-scrollbar { width: 0; }
      `}</style>
    </div>
  )
}
