import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Header from '../components/Header'

const TOTAL_SPOTS  = 50
const PRICE        = 20
const DISTRIBUTION = [0.50, 0.30, 0.20]
const MEDALS       = ['🥇','🥈','🥉']
const POSITIONS    = ['1º Lugar','2º Lugar','3º Lugar']

export default function Prizes({ participant, onLogout }) {
  const [count, setCount] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.from('participants').select('*', { count: 'exact', head: true })
      .then(({ count: c }) => setCount(c || 0))
  }, [])

  const pool      = count * PRICE
  const filled    = Math.min(count, TOTAL_SPOTS)
  const remaining = Math.max(TOTAL_SPOTS - count, 0)
  const pct       = Math.round((filled / TOTAL_SPOTS) * 100)

  return (
    <div style={{ minHeight:'100vh', background:'#F4F6F9', paddingBottom:80 }}>
      <Header participant={participant} onLogout={onLogout} />
      <main style={{ padding:'70px 16px 80px', maxWidth:480, margin:'0 auto' }}>

        {/* Hero */}
        <div style={{ background:'linear-gradient(135deg,#002855 0%,#009639 100%)', borderRadius:20, padding:'28px 24px', marginBottom:20, position:'relative', overflow:'hidden', textAlign:'center' }}>
          <div style={{ position:'absolute', right:-20, top:-20, fontSize:120, opacity:.1 }}>🏆</div>
          <div style={{ position:'absolute', left:-20, bottom:-20, fontSize:100, opacity:.08 }}>⚽</div>
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ color:'rgba(255,255,255,0.7)', fontSize:12, fontWeight:700, letterSpacing:2, textTransform:'uppercase', marginBottom:6 }}>Bolão da Confia · Copa 2026</div>
            <div style={{ color:'#F5A623', fontWeight:900, fontSize:15, marginBottom:4 }}>PRÊMIO TOTAL ATUAL</div>
            <div style={{ color:'#fff', fontWeight:900, fontSize:52, lineHeight:1, marginBottom:4 }}>
              R$ {pool.toLocaleString('pt-BR', { minimumFractionDigits:2, maximumFractionDigits:2 })}
            </div>
            <div style={{ color:'rgba(255,255,255,0.6)', fontSize:13 }}>
              {count} participante{count !== 1 ? 's' : ''} × R$ {PRICE},00
            </div>
          </div>
        </div>

        {/* Vagas */}
        <div style={{ background:'#fff', borderRadius:16, padding:'20px', border:'1px solid #E2EAF0', boxShadow:'0 2px 12px rgba(0,40,85,0.06)', marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div style={{ color:'#002855', fontWeight:900, fontSize:16 }}>🎟️ Vagas</div>
            <div style={{ background: remaining === 0 ? 'rgba(220,53,69,0.1)' : 'rgba(0,150,57,0.1)', color: remaining === 0 ? '#C0392B' : '#009639', borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:800 }}>
              {remaining === 0 ? 'ESGOTADO' : `${remaining} restantes`}
            </div>
          </div>

          {/* Barra de progresso */}
          <div style={{ background:'#F4F6F9', borderRadius:999, height:12, marginBottom:10, overflow:'hidden' }}>
            <div style={{ height:'100%', borderRadius:999, background:'linear-gradient(90deg,#009639,#F5A623)', width:`${pct}%`, transition:'width 0.6s ease' }} />
          </div>

          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#9BABB8', fontWeight:700 }}>
            <span>{filled} preenchidas</span>
            <span>{TOTAL_SPOTS} vagas totais</span>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginTop:16 }}>
            {[['🎟️','Valor da Cota',`R$ ${PRICE},00`],['👥','Total de Vagas',`${TOTAL_SPOTS}`],['✅','Confirmados',`${count}`]].map(([icon,label,val])=>(
              <div key={label} style={{ background:'#F4F6F9', borderRadius:12, padding:'12px 8px', textAlign:'center' }}>
                <div style={{ fontSize:22, marginBottom:4 }}>{icon}</div>
                <div style={{ color:'#9BABB8', fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:.8, marginBottom:2 }}>{label}</div>
                <div style={{ color:'#002855', fontWeight:900, fontSize:15 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Premiação */}
        <div style={{ background:'#fff', borderRadius:16, padding:'20px', border:'1px solid #E2EAF0', boxShadow:'0 2px 12px rgba(0,40,85,0.06)', marginBottom:16 }}>
          <div style={{ color:'#002855', fontWeight:900, fontSize:16, marginBottom:4 }}>🏆 Distribuição de Prêmios</div>
          <div style={{ color:'#9BABB8', fontSize:12, marginBottom:16 }}>
            Baseado em {TOTAL_SPOTS} vagas × R$ {PRICE} = R$ {(TOTAL_SPOTS * PRICE).toLocaleString('pt-BR')},00 total
          </div>

          {DISTRIBUTION.map((pct, i) => {
            const maxPrize  = TOTAL_SPOTS * PRICE * pct
            const currPrize = count * PRICE * pct
            const colors    = ['#D4890A','#6B7A8D','#C96A2A']
            const bgs       = ['rgba(245,166,35,0.08)','rgba(107,122,141,0.06)','rgba(205,127,50,0.08)']
            const borders   = ['rgba(245,166,35,0.25)','rgba(107,122,141,0.2)','rgba(205,127,50,0.22)']
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'16px', background:bgs[i], border:`1px solid ${borders[i]}`, borderRadius:14, marginBottom:10 }}>
                <div style={{ fontSize:36, flexShrink:0 }}>{MEDALS[i]}</div>
                <div style={{ flex:1 }}>
                  <div style={{ color:'#002855', fontWeight:900, fontSize:15 }}>{POSITIONS[i]}</div>
                  <div style={{ color:'#9BABB8', fontSize:11, marginTop:2 }}>{pct*100}% do prêmio total</div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ color:colors[i], fontWeight:900, fontSize:20 }}>
                    R$ {currPrize.toLocaleString('pt-BR', { minimumFractionDigits:2 })}
                  </div>
                  <div style={{ color:'#9BABB8', fontSize:10, marginTop:1 }}>
                    até R$ {maxPrize.toLocaleString('pt-BR', { minimumFractionDigits:2 })}
                  </div>
                </div>
              </div>
            )
          })}

          <div style={{ background:'rgba(0,40,85,0.04)', borderRadius:12, padding:'12px 16px', marginTop:4, border:'1px solid #E2EAF0' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ color:'#002855', fontWeight:800, fontSize:13 }}>💰 Prêmio total atual</div>
                <div style={{ color:'#9BABB8', fontSize:11 }}>Aumenta a cada nova entrada!</div>
              </div>
              <div style={{ color:'#009639', fontWeight:900, fontSize:22 }}>
                R$ {pool.toLocaleString('pt-BR', { minimumFractionDigits:2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Regras */}
        <div style={{ background:'#fff', borderRadius:16, padding:'20px', border:'1px solid #E2EAF0', boxShadow:'0 2px 12px rgba(0,40,85,0.06)', marginBottom:16 }}>
          <div style={{ color:'#002855', fontWeight:900, fontSize:16, marginBottom:14 }}>📋 Como funciona</div>
          {[
            ['1','Pague R$ 20,00 ao organizador e confirme sua vaga'],
            ['2','Faça seus palpites antes de cada jogo'],
            ['3','Acumule pontos: 3pts placar exato, 1pt resultado correto'],
            ['4','Palpite extra: campeão (+10), vice (+5) e 3º lugar (+3)'],
            ['5','Os 3 com mais pontos ao final levam os prêmios!'],
          ].map(([n, txt]) => (
            <div key={n} style={{ display:'flex', gap:12, marginBottom:12, alignItems:'flex-start' }}>
              <div style={{ width:26, height:26, borderRadius:'50%', background:'#009639', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:12, flexShrink:0, marginTop:1 }}>{n}</div>
              <div style={{ color:'#6B7A8D', fontSize:13, lineHeight:1.5 }}>{txt}</div>
            </div>
          ))}
        </div>

        <button onClick={() => navigate('/palpites')}
          style={{ width:'100%', background:'#009639', color:'#fff', border:'none', borderRadius:14, padding:'15px', fontWeight:800, fontSize:15, cursor:'pointer', fontFamily:'inherit' }}>
          Fazer Meus Palpites 🎯
        </button>
      </main>
    </div>
  )
}
