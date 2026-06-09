import { useState } from 'react'
import { supabase } from '../supabase'
import { Loader2, Eye, EyeOff, Check } from 'lucide-react'
import { Logo } from '../components/Header'

export default function ResetPassword({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)

  const validate = () => {
    if (password.length < 6) return 'A senha deve ter pelo menos 6 caracteres.'
    if (password !== confirm) return 'As senhas não coincidem.'
    return ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const v = validate()
    if (v) {
      setError(v)
      return
    }

    try {
      setLoading(true)

      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) throw error

      setSuccess(true)

      setTimeout(() => {
        onDone()
      }, 1800)
    } catch (err: any) {
      setError(err?.message || 'Não foi possível redefinir a senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden">
          <div className="px-8 pt-8 pb-4 flex flex-col items-center">
            <Logo />

            <h1 className="mt-6 text-2xl font-bold text-white text-center">
              Redefinir senha
            </h1>

            <p className="mt-2 text-sm text-zinc-400 text-center">
              Escolha uma nova senha para acessar sua conta.
            </p>
          </div>

          {success ? (
            <div className="px-8 pb-8">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
                  <Check className="h-7 w-7 text-emerald-400" />
                </div>

                <h2 className="text-lg font-semibold text-white">
                  Senha alterada
                </h2>

                <p className="mt-2 text-sm text-zinc-300">
                  Sua senha foi atualizada com sucesso.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Nova senha
                </label>

                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 pr-12 text-white outline-none focus:border-blue-500"
                    placeholder="Digite sua nova senha"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute inset-y-0 right-0 px-4 text-zinc-400 hover:text-white"
                  >
                    {showPw ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Confirmar senha
                </label>

                <input
                  type={showPw ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  placeholder="Repita a nova senha"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition px-4 py-3 font-semibold text-white flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Atualizar senha
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}