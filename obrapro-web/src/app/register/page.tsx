"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Icon } from "@/components/icon"
import { cn } from "@/lib/utils"

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) throw new Error("Erro ao criar conta. O email já pode existir.")
      router.push("/login?registered=1")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center relative p-6 bg-surface overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-secondary-container/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-primary-fixed-dim/10 rounded-full blur-[100px]" />
      </div>

      <section className="w-full max-w-[440px] space-y-10 z-10">
        {/* Brand */}
        <header className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-primary-container flex items-center justify-center rounded-2xl shadow-lg shadow-primary-container/20">
            <Icon name="architecture" size={32} className="text-primary-fixed" filled />
          </div>
          <div className="space-y-1">
            <h1 className="font-heading font-extrabold text-3xl tracking-tight text-on-surface">Junte-se ao ObraPro</h1>
            <p className="text-on-surface-variant text-sm uppercase tracking-widest font-heading">
              Comece a gerir os seus orçamentos hoje.
            </p>
          </div>
        </header>

        {/* Card */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-[0_40px_60px_rgba(13,28,46,0.06)] p-8 md:p-10 border border-outline-variant/10">
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-heading font-semibold text-on-surface-variant uppercase tracking-wider ml-1">
                Email Profissional
              </label>
              <div className="relative group">
                <Icon name="mail" size={20} className={cn("absolute left-3 top-1/2 -translate-y-1/2 text-outline transition-colors group-focus-within:text-secondary")} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-secondary-container outline-none text-on-surface placeholder:text-outline/60 transition-all"
                  placeholder="joao@empresa.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-heading font-semibold text-on-surface-variant uppercase tracking-wider ml-1">
                Senha
              </label>
              <div className="relative group">
                <Icon name="lock" size={20} className={cn("absolute left-3 top-1/2 -translate-y-1/2 text-outline transition-colors group-focus-within:text-secondary")} />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-secondary-container outline-none text-on-surface placeholder:text-outline/60 transition-all"
                  placeholder="Mín. 8 caracteres"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-error-container text-on-error-container flex items-center gap-3 text-sm font-medium">
                <Icon name="error" size={20} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-3.5 mt-2 rounded-xl font-heading font-bold text-base shadow-lg shadow-primary-container/25 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? "A criar workspace..." : "Criar Workspace"}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            Já utiliza o ObraPro?{" "}
            <Link href="/login" className="text-secondary font-bold hover:underline">
              Fazer Login
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
