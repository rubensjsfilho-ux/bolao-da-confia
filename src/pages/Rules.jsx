import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'

// ── Bloco de regra individual ─────────────────────────────────────────────────
function RuleBlock({ icon, color, bg, border, title, children }) {
  return (
    <div style={{
      background: bg,
      border: `1.5px solid ${border}`,
      borderRadius: 16,
      padding: '18px 18px 16px',
      marginBottom: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <span style={{ color, fontWeight: 900, fontSize: 15 }}>{title}</span>
      </div>
      {children}
    </div>
  )
}

// ── Linha de pontuação ────────────────────────────────────────────────────────
function PtsRow({ label, pts, color, bg }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '9px 0', borderBottom: '1px solid rgba(0,0,0,0.05)',
    }}>
      <span style={{ color: '#4A5568', fontSize: 13, lineHeight: 1.4 }}>{label}</span>
      <span style={{
        background: bg, color, borderRadius: 20,
        padding: '4px 14px', fontSize: 13, fontWeight: 900, flexShrink: 0, marginLeft: 8,
      }}>{pts}</span>
    </div>
  )
}

// ── Linha de prazo ────────────────────────────────────────────────────────────
function DeadlineRow({ icon, label, deadline, color, bg }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.05)',
    }}>
      <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ color: '#002855', fontWeight: 800, fontSize: 13 }}>{label}</div>
        <div style={{
          display: 'inline-block', marginTop: 4,
          background: bg, color, borderRadius: 8,
          padding: '3px 10px', fontSize: 11, fontWeight: 800,
        }}>{deadline}</div>
      </div>
    </div>
  )
}

// ── Critério de desempate ─────────────────────────────────────────────────────
function TieRow({ n, text }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
      <div style={{
        width: 26, height: 26, borderRadius: '50%', flexShrink: 0, marginTop: 1,
        background: 'linear-gradient(135deg,#002855,#009639)',
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 900, fontSize: 12,
      }}>{n}</div>
      <span style={{ color: '#4A5568', fontSize: 13, lineHeight: 1.5, paddingTop: 3 }}>{text}</span>
    </div>
  )
}

export default function Rules({ participant, onLogout }) {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6F9', paddingBottom: 80 }}>
      <Header participant={participant} onLogout={onLogout} />

      <main style={{ padding: '70px 16px 80px', maxWidth: 520, margin: '0 auto' }}>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div style={{
          borderRadius: 22,
          overflow: 'hidden',
          marginBottom: 20,
          position: 'relative',
          background: 'linear-gradient(145deg, #001833 0%, #002855 45%, #003d1a 100%)',
          padding: '30px 24px 28px',
          textAlign: 'center',
          boxShadow: '0 8px 40px rgba(0,40,85,0.28)',
        }}>
          {/* Decoração de fundo */}
          <div style={{
            position: 'absolute', right: -30, top: -30,
            width: 160, height: 160, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,150,57,0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}/>
          <div style={{
            position: 'absolute', left: -20, bottom: -20,
            width: 120, height: 120, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}/>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 42, marginBottom: 10 }}>📋</div>
            <div style={{
              color: '#F5A623', fontWeight: 900, fontSize: 11,
              letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6,
            }}>Bolão da Confia · Copa 2026</div>
            <div style={{
              color: '#fff', fontWeight: 900, fontSize: 28, lineHeight: 1.15,
              marginBottom: 10, letterSpacing: -0.5,
            }}>Regras do Bolão</div>
            <div style={{
              color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.5,
            }}>
              Tudo que você precisa saber para<br/>palpitar, pontuar e ganhar.
            </div>
          </div>
        </div>

        {/* ── Aviso crítico: prazo do palpite final ─────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(180,50,0,0.07), rgba(220,80,0,0.04))',
          border: '2px solid rgba(220,80,0,0.35)',
          borderRadius: 16, padding: '16px 18px', marginBottom: 20,
          display: 'flex', gap: 14, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 28, flexShrink: 0 }}>⏰</span>
          <div>
            <div style={{ color: '#B83200', fontWeight: 900, fontSize: 14, marginBottom: 4 }}>
              Prazo do Palpite Final
            </div>
            <div style={{ color: '#4A5568', fontSize: 13, lineHeight: 1.5, marginBottom: 8 }}>
              O palpite de <strong>Campeão, Vice e 3º Lugar</strong> precisa ser feito antes do 1º jogo da Copa.
            </div>
            <div style={{
              display: 'inline-block',
              background: '#B83200', color: '#fff',
              borderRadius: 8, padding: '4px 12px',
              fontSize: 12, fontWeight: 900, letterSpacing: 0.5,
            }}>
              ⚠️ Encerra 11/06 às 16h (horário de Brasília)
            </div>
          </div>
        </div>

        {/* ── Prazos dos palpites ───────────────────────────────────────── */}
        <RuleBlock
          icon="🕒" color="#002855" bg="#fff"
          border="#E2EAF0" title="Prazos para palpitar"
        >
          <DeadlineRow
            icon="⚽" label="Palpites de jogos da fase de grupos"
            deadline="Até o apito inicial de cada jogo"
            color="#007a2e" bg="rgba(0,150,57,0.09)"
          />
          <DeadlineRow
            icon="⚔️" label="Palpites do mata-mata"
            deadline="Até o início de cada partida"
            color="#007a2e" bg="rgba(0,150,57,0.09)"
          />
          <DeadlineRow
            icon="🏆" label="Palpite de Campeão / Vice / 3º Lugar"
            deadline="Até 11/06 às 16h (1º jogo da Copa)"
            color="#B83200" bg="rgba(220,80,0,0.10)"
          />
          <div style={{
            marginTop: 10, padding: '8px 12px',
            background: 'rgba(245,166,35,0.08)',
            border: '1px solid rgba(245,166,35,0.22)',
            borderRadius: 10,
          }}>
            <span style={{ color: '#8B5A00', fontSize: 12, fontWeight: 700 }}>
              ⚠️ Após o início do jogo, os palpites são bloqueados automaticamente. Sem exceções.
            </span>
          </div>
        </RuleBlock>

        {/* ── Pontuação: Fase de Grupos ─────────────────────────────────── */}
        <RuleBlock
          icon="🎯" color="#002855" bg="#fff"
          border="#E2EAF0" title="Pontuação — Fase de Grupos"
        >
          <PtsRow label="Placar exato (ex: 2×1 = 2×1)"    pts="+3 pts" color="#D4890A" bg="rgba(245,166,35,0.10)" />
          <PtsRow label="Resultado correto (vitória/empate)" pts="+1 pt"  color="#007a2e" bg="rgba(0,150,57,0.09)" />
          <PtsRow label="Resultado errado"                   pts="0 pts"  color="#C0392B" bg="rgba(220,53,69,0.07)" />
          <div style={{
            marginTop: 10, padding: '8px 12px',
            background: 'rgba(0,40,85,0.04)',
            borderRadius: 10,
          }}>
            <span style={{ color: '#6B7A8D', fontSize: 12 }}>
              São <strong style={{ color: '#002855' }}>72 jogos</strong> na fase de grupos,
              cada um valendo até 3 pontos.
            </span>
          </div>
        </RuleBlock>

        {/* ── Palpite Final (Campeão) ───────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #001833, #003520)',
          border: '1.5px solid rgba(245,166,35,0.25)',
          borderRadius: 16, padding: '18px 18px 16px', marginBottom: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 22 }}>🏆</span>
            <span style={{ color: '#F5A623', fontWeight: 900, fontSize: 15 }}>Palpite Final</span>
            <span style={{
              marginLeft: 'auto', background: 'rgba(245,166,35,0.15)',
              border: '1px solid rgba(245,166,35,0.3)',
              color: '#F5A623', borderRadius: 8, padding: '3px 10px',
              fontSize: 11, fontWeight: 900,
            }}>+18 pts máx</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 10, lineHeight: 1.5 }}>
            Antes do 1º jogo, escolha os 3 melhores do torneio. Cada acerto bônus:
          </div>
          {[
            ['🥇', 'Acertar o Campeão',     '+10 pts', '#F5A623', 'rgba(245,166,35,0.15)'],
            ['🥈', 'Acertar o Vice-Campeão', '+5 pts',  '#E0E0E0', 'rgba(255,255,255,0.08)'],
            ['🥉', 'Acertar o 3º Lugar',     '+3 pts',  '#C96A2A', 'rgba(205,127,50,0.15)'],
          ].map(([medal, label, pts, color, bg]) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>{medal}</span>
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>{label}</span>
              </div>
              <span style={{
                background: bg, color, borderRadius: 20,
                padding: '4px 14px', fontSize: 12, fontWeight: 900,
              }}>{pts}</span>
            </div>
          ))}
          <div style={{
            marginTop: 12, padding: '9px 12px',
            background: 'rgba(245,166,35,0.06)',
            border: '1px solid rgba(245,166,35,0.15)',
            borderRadius: 10,
          }}>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
              💡 Esses pontos somam ao total geral e podem ser decisivos na disputa pelo prêmio.
            </span>
          </div>
        </div>

        {/* ── Critério de desempate ─────────────────────────────────────── */}
        <RuleBlock
          icon="⚖️" color="#002855" bg="#fff"
          border="#E2EAF0" title="Critério de desempate"
        >
          <div style={{ color: '#6B7A8D', fontSize: 12, marginBottom: 12 }}>
            Em caso de empate na pontuação total, aplica-se nesta ordem:
          </div>
          <TieRow n="1" text="Maior número de placares exatos (3 pts)" />
          <TieRow n="2" text="Maior número de resultados corretos (1 pt)" />
          <TieRow n="3" text="Acerto no palpite de Campeão" />
          <TieRow n="4" text="Acerto no palpite de Vice-Campeão" />
        </RuleBlock>

        {/* ── Participação e pagamento ──────────────────────────────────── */}
        <RuleBlock
          icon="💰" color="#002855" bg="#fff"
          border="#E2EAF0" title="Participação e pagamento"
        >
          {[
            ['🎟️', 'Cota por participante', 'R$ 20,00'],
            ['👥', 'Vagas disponíveis',      'Até 50 participantes'],
            ['💳', 'Pagamento',              'Direto ao organizador'],
            ['🔐', 'Acesso ao bolão',        'Código liberado após pagamento confirmado'],
          ].map(([icon, label, value]) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '9px 0', borderBottom: '1px solid rgba(0,0,0,0.05)', gap: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span style={{ color: '#6B7A8D', fontSize: 13 }}>{label}</span>
              </div>
              <span style={{ color: '#002855', fontWeight: 800, fontSize: 13, textAlign: 'right', flexShrink: 0, maxWidth: '50%' }}>
                {value}
              </span>
            </div>
          ))}
          <div style={{
            marginTop: 10, padding: '8px 12px',
            background: 'rgba(0,150,57,0.06)',
            border: '1px solid rgba(0,150,57,0.18)',
            borderRadius: 10,
          }}>
            <span style={{ color: '#007a2e', fontSize: 12, fontWeight: 700 }}>
              ✅ Vaga confirmada somente após pagamento. O organizador libera seu acesso manualmente.
            </span>
          </div>
        </RuleBlock>

        {/* ── Distribuição dos prêmios ──────────────────────────────────── */}
        <RuleBlock
          icon="🏆" color="#002855" bg="#fff"
          border="#E2EAF0" title="Distribuição dos prêmios"
        >
          <div style={{ color: '#6B7A8D', fontSize: 12, marginBottom: 14 }}>
            O prêmio total cresce a cada nova entrada. Distribuição final:
          </div>
          {[
            ['🥇', '1º Lugar', '50%', '#D4890A', 'rgba(245,166,35,0.10)', 'rgba(245,166,35,0.2)'],
            ['🥈', '2º Lugar', '30%', '#6B7A8D', 'rgba(107,122,141,0.06)', 'rgba(107,122,141,0.15)'],
            ['🥉', '3º Lugar', '20%', '#C96A2A', 'rgba(205,127,50,0.08)', 'rgba(205,127,50,0.2)'],
          ].map(([medal, pos, pct, color, bg, border]) => (
            <div key={pos} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px',
              background: bg,
              border: `1px solid ${border}`,
              borderRadius: 12, marginBottom: 8,
            }}>
              <span style={{ fontSize: 26, flexShrink: 0 }}>{medal}</span>
              <span style={{ color: '#002855', fontWeight: 800, fontSize: 14, flex: 1 }}>{pos}</span>
              <span style={{ color, fontWeight: 900, fontSize: 20 }}>{pct}</span>
              <span style={{ color: '#9BABB8', fontSize: 12 }}>do total</span>
            </div>
          ))}
          <div style={{
            padding: '8px 12px', marginTop: 2,
            background: 'rgba(0,40,85,0.04)', borderRadius: 10,
          }}>
            <span style={{ color: '#6B7A8D', fontSize: 12 }}>
              Exemplo: 40 participantes → R$ 800 → 🥇 R$ 400 · 🥈 R$ 240 · 🥉 R$ 160
            </span>
          </div>
        </RuleBlock>

        {/* ── CTAs finais ───────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          <button onClick={() => navigate('/campeao')} style={{
            width: '100%', background: '#F5A623', color: '#002855',
            border: 'none', borderRadius: 14, padding: '14px',
            fontWeight: 900, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 16px rgba(245,166,35,0.35)',
          }}>
            🏆 Fazer Palpite Final
          </button>
          <button onClick={() => navigate('/palpites')} style={{
            width: '100%', background: '#009639', color: '#fff',
            border: 'none', borderRadius: 14, padding: '14px',
            fontWeight: 900, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 16px rgba(0,150,57,0.3)',
          }}>
            🎯 Fazer Meus Palpites
          </button>
          <button onClick={() => navigate('/premios')} style={{
            width: '100%', background: 'transparent', color: '#002855',
            border: '1.5px solid #E2EAF0', borderRadius: 14, padding: '13px',
            fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            💰 Ver Prêmios em Tempo Real
          </button>
        </div>

      </main>
    </div>
  )
}
