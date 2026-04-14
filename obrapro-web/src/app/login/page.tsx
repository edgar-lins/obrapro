"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        throw new Error("Email ou senha incorretos.")
      }

      const data = await res.json()
      localStorage.setItem("obrapro_token", data.token)
      localStorage.setItem("obrapro_plan", data.plan ?? "free")
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center relative p-6 bg-surface overflow-hidden">
      {/* Elementos de Fundo (Blur) */}
      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-secondary-container/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-primary-fixed-dim/10 rounded-full blur-[100px]"></div>
      </div>

      <section className="w-full max-w-[440px] space-y-12 z-10">
        {/* Identidade da Marca */}
        <header className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-primary-container flex items-center justify-center rounded-xl shadow-lg shadow-primary-container/20">
            <span className="material-symbols-outlined text-primary-fixed text-4xl">architecture</span>
          </div>
          <div className="space-y-1">
            <h1 className="font-headline font-extrabold text-3xl tracking-tight text-on-surface">ObraPro</h1>
            <p className="text-on-surface-variant font-label text-sm uppercase tracking-widest">Precision Construction Calculation</p>
          </div>
        </header>

        {/* Cartão de Login */}
        <div className="bg-white rounded-xl shadow-[0_40px_60px_rgba(13,28,46,0.06)] p-8 md:p-10 border border-outline-variant/10">
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="font-headline font-bold text-xl text-on-surface">Bem-vindo de volta</h2>
              <p className="text-on-surface-variant text-sm">Introduz as tuas credenciais para aceder aos teus orçamentos.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                {/* Input Email */}
                <div className="space-y-1.5">
                  <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider ml-1" htmlFor="login-email">Endereço de Email</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">mail</span>
                    <input 
                      id="login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-secondary-container transition-all outline-none text-on-surface placeholder:text-outline/60" 
                      placeholder="nome@empresa.com" 
                    />
                  </div>
                </div>

                {/* Input Password */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                    <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="login-password">Senha</label>
                    <a className="text-xs font-semibold text-secondary hover:text-on-secondary-container transition-colors" href="#">Esqueceu?</a>
                  </div>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">lock</span>
                    <input 
                      id="login-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-secondary-container transition-all outline-none text-on-surface placeholder:text-outline/60" 
                      placeholder="••••••••" 
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-error-container text-on-error-container flex items-center gap-3 text-sm font-medium">
                  <span className="material-symbols-outlined">error</span>
                  {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-3.5 rounded-lg font-headline font-bold text-base shadow-lg shadow-primary-container/25 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "A entrar..." : "Entrar"}
                {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
              </button>
            </form>

            <div className="flex items-center gap-4 py-2">
              <div className="h-px flex-1 bg-outline-variant/30"></div>
              <span className="text-xs font-semibold text-outline uppercase tracking-widest">ou</span>
              <div className="h-px flex-1 bg-outline-variant/30"></div>
            </div>

            <p className="text-center text-sm text-on-surface-variant pt-2">
              Ainda não tem uma conta? 
              <Link href="/register" className="text-secondary font-bold hover:underline ml-1">Criar uma conta</Link>
            </p>
          </div>
        </div>

        {/* Rodapé */}
        <footer className="flex flex-col items-center gap-6 text-on-surface-variant/60 pt-4">
          <div className="flex gap-8 text-xs font-semibold uppercase tracking-widest">
            <a className="hover:text-secondary transition-colors" href="#">Ajuda</a>
            <a className="hover:text-secondary transition-colors" href="#">Privacidade</a>
          </div>
          <div className="text-[11px] text-center max-w-[300px]">
            © 2026 ObraPro Technologies. Motor de cálculo profissional certificado para arquitetura de alta precisão.
          </div>
        </footer>
      </section>
    </main>
  )
}