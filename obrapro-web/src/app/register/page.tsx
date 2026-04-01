"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        throw new Error("Erro ao criar conta. O email já pode existir.")
      }

      alert("Conta criada com sucesso! Podes fazer login agora.")
      router.push("/login")
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
            <h1 className="font-headline font-extrabold text-3xl tracking-tight text-on-surface">Junte-se ao ObraPro</h1>
            <p className="text-on-surface-variant font-label text-sm uppercase tracking-widest">Comece a gerir os seus orçamentos hoje.</p>
          </div>
        </header>

        {/* Cartão de Registo */}
        <div className="bg-white rounded-xl shadow-[0_40px_60px_rgba(13,28,46,0.06)] p-8 md:p-10 border border-outline-variant/10">
          <div className="space-y-8">
            <form onSubmit={handleRegister} className="space-y-5">
              
              <div className="space-y-1.5">
                <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider ml-1">Email Profissional</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">mail</span>
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-secondary-container outline-none text-on-surface placeholder:text-outline/60" 
                    placeholder="joao@arquitetura.com" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider ml-1">Senha</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">lock</span>
                  <input 
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-secondary-container outline-none text-on-surface placeholder:text-outline/60" 
                    placeholder="Mín. 8 caracteres" 
                  />
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
                className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-3.5 mt-2 rounded-lg font-headline font-bold text-base shadow-lg shadow-primary-container/25 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? "A criar workspace..." : "Criar Workspace"}
              </button>
            </form>

            <p className="text-center text-sm text-on-surface-variant">
              Já utiliza o ObraPro? 
              <Link href="/login" className="text-secondary font-bold hover:underline ml-1">Fazer Login</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}