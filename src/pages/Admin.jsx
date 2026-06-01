import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { GROUP_MATCHES, getFlag, formatDate } from '../data/matches'
import { Lock, Loader2, Check, RefreshCw, Trophy } from 'lucide-react'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'

// Calcula pontos de um palpite vs resultado real
function calcPoints(pScore1, pScore2, rScore1, rScore2) {
  if (pScore1 === rScore1 && pScore2 === rScore2) return 3
  const pResult = Math.sign(pScore1 - pScore2)
  const rResult = Math.sign(rScore1 - rScore2)
  if (pResult === rResult) return 1
  return 0
}

// ── Formulário de resultado ───────────────────────────────────────────────────
function MatchResultRow({ match, onSave }) {
  const [s1, setS1] = useState(match.score1 ?? '')
  const [s2, setS2] = useState(match.score2 ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const hasResult = match.score1 !== null && match.score1 !== undefined

  const handleSave = async () => {
    if (s1 === '' || s2 === '') return
    setSaving(true)
    await onSave(match.id, parseInt(s1), parseInt(s2))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div
      className={`card p-4 ${match.is_finished ? 'opacity-70' : ''}`}
    >
      <div className="flex items-center justify-between mb-2 text-xs text-white/40">
        <span>Grupo {match.group} · {formatDate(match.date)}</span>
        {match.is_finished && <span className="text-green-400 font-bold">✓ Encerrado</span>}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2">
          <span className="text-2xl">{getFlag(match.team1)}</span>
          <span className="text-white text-sm font-bold truncate">{match.team1}</span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <input
            className="score-input"
            style={{ width: 56, fontSize: 24 }}
            type="number"
            min="0"
            max="20"
            value={s1}
            onChange={e => setS1(e.target.value)}
          />
          <span className="text-white/30 font-display text-lg">×</span>
          <input
            className="score-input"
            style={{ width: 56, fontSize: 24 }}
            type="number"
            min="0"
            max="20"
            value={s2}
            onChange={e => setS2(e.target.value)}
          />
        </div>

        <div className="flex-1 flex items-center justify-end gap-2">
          <span className="text-white text-sm font-bold truncate text-right">{match.team2}</span>
          <span className="text-2xl">{getFlag(match.team2)}</span>
        </div>
      </div>

      <div className="flex justify-end mt-3">
        <button
          onClick={handleSave}
          disabled={s1 === '' || s2 === '' || saving}
          className="btn-gold text-xs px-4 py-2 flex items-center gap-1 disabled:opacity-40"
        >
          {saving ? (
            <><Loader2 size={13} className="animate-spin" /> Salvando...</>
          ) : saved ? (
            <><Check size={13} /> Salvo & Pontos Calculados!</>
          ) : hasResult ? (
            <>Atualizar Resultado</>
          ) : (
            <>Salvar Resultado</>
          )}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(false)
  const [recalculating, setRecalculating] = useState(false)
  const [recalcMsg, setRecalcMsg] = useState('')
  const [groupFilter, setGroupFilter] = useState('all')
  const [showFinished, setShowFinished] = useState(false)

  const handleAuth = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setAuthed(true)
      fetchMatches()
    } else {
      setAuthError('Senha incorreta.')
    }
  }

  const fetchMatches = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('matches')
      .select('*')
      .order('match_date')
    setMatches(data || [])
    setLoading(false)
  }

  const handleSaveResult = async (matchId, score1, score2) => {
    // Salva resultado no banco
    await supabase
      .from('matches')
      .update({
        score1,
        score2,
        is_finished: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', matchId)

    // Recalcula pontos de todas as previsões deste jogo
    const { data: predictions } = await supabase
      .from('predictions')
      .select('id, score1, score2')
      .eq('match_id', matchId)

    if (predictions?.length) {
      const updates = predictions.map(p => ({
        id: p.id,
        points: calcPoints(p.score1, p.score2, score1, score2),
      }))

      for (const u of updates) {
        await supabase
          .from('predictions')
          .update({ points: u.points })
          .eq('id', u.id)
      }
    }

    // Atualiza a lista local
    setMatches(prev =>
      prev.map(m => m.id === matchId ? { ...m, score1, score2, is_finished: true } : m)
    )

    // Dispara recálculo do total de pontos dos participantes
    await recalcTotals()
  }

  const recalcTotals = async () => {
    // Pega todos participantes
    const { data: parts } = await supabase.from('participants').select('id')
    if (!parts) return

    for (const p of parts) {
      const { data: preds } = await supabase
        .from('predictions')
        .select('points, score1, score2')
        .eq('participant_id', p.id)
        .not('points', 'is', null)

      const total = preds?.reduce((s, x) => s + (x.points || 0), 0) || 0
      const exact = preds?.filter(x => x.points === 3).length || 0
      const result = preds?.filter(x => x.points === 1).length || 0
      const count = preds?.length || 0

      await supabase
        .from('participants')
        .update({
          total_points: total,
          exact_hits: exact,
          result_hits: result,
          predictions_count: count,
        })
        .eq('id', p.id)
    }
  }

  const handleFullRecalc = async () => {
    setRecalculating(true)
    setRecalcMsg('')
    try {
      // Busca todos jogos encerrados
      const { data: finishedMatches } = await supabase
        .from('matches')
        .select('*')
        .eq('is_finished', true)

      for (const m of finishedMatches || []) {
        const { data: preds } = await supabase
          .from('predictions')
          .select('id, score1, score2')
          .eq('match_id', m.id)

        for (const p of preds || []) {
          const pts = calcPoints(p.score1, p.score2, m.score1, m.score2)
          await supabase.from('predictions').update({ points: pts }).eq('id', p.id)
        }
      }

      await recalcTotals()
      setRecalcMsg('✅ Recálculo concluído com sucesso!')
    } catch (err) {
      setRecalcMsg('❌ Erro no recálculo: ' + err.message)
    } finally {
      setRecalculating(false)
      setTimeout(() => setRecalcMsg(''), 4000)
    }
  }

  // Filtra jogos para exibição
  const groups = ['all', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

  // Mescla dados do banco com os dados locais de GROUP_MATCHES
  const enriched = GROUP_MATCHES.map(gm => {
    const dbMatch = matches.find(m => m.id === gm.id)
    return dbMatch ? { ...gm, ...dbMatch } : gm
  })

  let filtered = enriched
  if (groupFilter !== 'all') filtered = filtered.filter(m => m.group === groupFilter)
  if (!showFinished) filtered = filtered.filter(m => !m.is_finished)

  // ── Tela de login admin ───────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-pitch flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-6xl mb-3">🔐</div>
            <h1 className="font-display text-3xl text-white tracking-wider">PAINEL ADMIN</h1>
            <p className="text-white/40 text-sm mt-1">Bolão Copa 2026</p>
          </div>

          <div className="card p-6">
            <form onSubmit={handleAuth}>
              <label className="text-white/60 text-sm font-semibold mb-2 block uppercase tracking-wider">
                Senha do Admin
              </label>
              <input
                className="input-field mb-4"
                type="password"
                placeholder="Digite a senha..."
                value={password}
                onChange={e => { setPassword(e.target.value); setAuthError('') }}
                autoFocus
              />
              {authError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-red-400 text-sm">
                  {authError}
                </div>
              )}
              <button type="submit" className="btn-gold w-full flex items-center justify-center gap-2">
                <Lock size={16} /> Entrar
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // ── Painel admin ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-pitch">
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
        style={{
          background: 'rgba(1,25,1,0.97)',
          borderBottom: '1px solid rgba(255,215,0,0.15)',
        }}
      >
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-gold-400" />
          <span className="font-display text-gold-400 text-xl tracking-wider">ADMIN · COPA 2026</span>
        </div>
        <div className="flex items-center gap-2">
          {recalcMsg && (
            <span className="text-xs text-green-400">{recalcMsg}</span>
          )}
          <button
            onClick={handleFullRecalc}
            disabled={recalculating}
            className="btn-ghost text-xs px-3 py-2 flex items-center gap-1"
          >
            {recalculating
              ? <><Loader2 size={13} className="animate-spin" /> Recalculando...</>
              : <><RefreshCw size={13} /> Recalcular Tudo</>
            }
          </button>
        </div>
      </header>

      <main className="pt-20 pb-8 px-4 max-w-lg mx-auto">
        <div className="pt-2 mb-4">
          <h2 className="font-bold text-white text-lg">Inserir Resultados</h2>
          <p className="text-white/40 text-sm">Ao salvar, os pontos são calculados automaticamente.</p>
        </div>

        {/* Filtros */}
        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-3">
          {groups.map(g => (
            <button
              key={g}
              onClick={() => setGroupFilter(g)}
              className={`flex-shrink-0 w-10 h-9 rounded-xl text-xs font-bold transition-all ${
                groupFilter === g
                  ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40'
                  : 'bg-white/5 text-white/40 hover:bg-white/10'
              }`}
            >
              {g === 'all' ? '✦' : g}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-white/60 text-sm mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={showFinished}
            onChange={e => setShowFinished(e.target.checked)}
            className="rounded"
          />
          Mostrar jogos encerrados
        </label>

        {/* Lista */}
        {loading ? (
          <div className="text-center py-12 text-white/30">
            <Loader2 size={28} className="animate-spin mx-auto mb-2" />
            Carregando...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-white/30">
            <div className="text-5xl mb-3">✅</div>
            <p>Todos os jogos deste grupo já estão encerrados.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(match => (
              <MatchResultRow
                key={match.id}
                match={match}
                onSave={handleSaveResult}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

// ─── EXPORTA função de pontuação para uso no Admin expandido ──────────────────
export { calcPoints }

// ─── PAINEL DE RESULTADO FINAL (componente separado, usado no Admin) ──────────
export function ChampionAdmin() {
  const [result, setResult] = useState({ champion: '', runner_up: '', third_place: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const ALL_TEAMS = ['Brasil','Argentina','França','Alemanha','Espanha','Portugal','Inglaterra','Holanda','Bélgica','Itália','México','Estados Unidos','Uruguai','Japão','Canadá','Austrália','Coreia do Sul','Marrocos','Senegal','Egito','Escócia','Croácia','Suíça','Áustria','Noruega','Polônia','Dinamarca','Sérvia','Turquia','Irã','África do Sul','Equador','Peru','Chile','Costa Rica','Panamá','Haiti','Jamaica','Venezuela','Bolívia','Paraguai','Honduras','El Salvador','Curaçao','Trinidad','Uzbequistão','RD Congo','Cabo Verde']

  useEffect(() => {
    supabase.from('champion_results').select('*').eq('id',1).single().then(({data}) => {
      if (data?.champion) setResult({ champion: data.champion, runner_up: data.runner_up, third_place: data.third_place })
    })
  }, [])

  const save = async () => {
    setSaving(true)
    const { data: existing } = await supabase.from('champion_results').select('id').eq('id',1).single()
    if (existing) {
      await supabase.from('champion_results').update({ ...result, updated_at: new Date().toISOString() }).eq('id',1)
    } else {
      await supabase.from('champion_results').insert([{ id:1, ...result }])
    }
    // Calcular pontos para todos os palpites de campeão
    const { data: preds } = await supabase.from('champion_predictions').select('id, participant_id, champion, runner_up, third_place')
    for (const p of preds || []) {
      const champPts   = p.champion    === result.champion    ? 10 : 0
      const vicePts    = p.runner_up   === result.runner_up   ? 5  : 0
      const thirdPts   = p.third_place === result.third_place ? 3  : 0
      const bonusTotal = champPts + vicePts + thirdPts
      await supabase.from('champion_predictions').update({ champion_points: champPts, runner_up_points: vicePts, third_points: thirdPts }).eq('id', p.id)
      // Atualiza total de pontos do participante somando bônus
      const { data: part } = await supabase.from('participants').select('total_points').eq('id', p.participant_id).single()
      if (part) {
        await supabase.from('participants').update({ total_points: (part.total_points||0) + bonusTotal }).eq('id', p.participant_id)
      }
    }
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000)
  }

  const pos = [['champion','🥇','Campeão'],['runner_up','🥈','Vice-Campeão'],['third_place','🥉','3º Lugar']]
  return (
    <div className="card p-5 mb-6">
      <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">🏆 Resultado Final da Copa</h3>
      {pos.map(([key, icon, label]) => (
        <div key={key} className="mb-4">
          <label className="text-white/60 text-xs uppercase tracking-wider font-bold mb-2 block">{icon} {label}</label>
          <select value={result[key]} onChange={e => setResult(r => ({...r, [key]: e.target.value}))}
            className="input-field" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <option value="">Selecionar time...</option>
            {ALL_TEAMS.map(t => <option key={t} value={t} style={{ background: '#022602' }}>{t}</option>)}
          </select>
        </div>
      ))}
      <button onClick={save} disabled={!result.champion||!result.runner_up||!result.third_place||saving}
        className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-40">
        {saving ? 'Salvando e calculando pontos...' : saved ? '✓ Salvo! Pontos aplicados.' : 'Salvar Resultado Final'}
      </button>
    </div>
  )
}
