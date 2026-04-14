"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { getBillingStatus, createCheckout } from "@/services/api"

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)

export default function PlanosPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isLimitReached = searchParams.get("limit") === "1"
  const isSuccess = searchParams.get("success") === "1"
  const isCanceled = searchParams.get("canceled") === "1"

  const [plan, setPlan] = useState("free")
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)

  const token = typeof window !== "undefined" ? localStorage.getItem("obrapro_token") : null

  useEffect(() => {
    if (!token) { router.push("/login"); return }

    async function fetchStatus() {
      try {
        const data = await getBillingStatus(token as string)
        setPlan(data.plan)
        if (data.plan === "pro") {
          localStorage.setItem("obrapro_plan", "pro")
        }
      } catch {
        // use cached plan
        setPlan(localStorage.getItem("obrapro_plan") ?? "free")
      } finally {
        setLoading(false)
      }
    }
    fetchStatus()
  }, [token, router])

  async function handleUpgrade() {
    if (!token) return
    setCheckingOut(true)
    try {
      const data = await createCheckout(token)
      window.location.href = data.url
    } catch (err: any) {
      console.error(err)
      alert("Erro ao iniciar checkout: " + (err?.message ?? ""))
      setCheckingOut(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen pb-32 md:pb-0">

      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-sm flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="material-symbols-outlined text-on-surface-variant hover:text-on-surface transition-colors">arrow_back</Link>
          <span className="font-headline font-extrabold text-xl tracking-tight text-on-surface">Planos</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link className="font-headline font-bold text-lg tracking-tight text-on-surface-variant hover:bg-surface-container-low transition-colors px-3 py-1 rounded-lg" href="/dashboard">Projetos</Link>
          <Link className="font-headline font-bold text-lg tracking-tight text-on-surface-variant hover:bg-surface-container-low transition-colors px-3 py-1 rounded-lg" href="/calculate">Calcular</Link>
          <Link className="font-headline font-bold text-lg tracking-tight text-on-surface-variant hover:bg-surface-container-low transition-colors px-3 py-1 rounded-lg" href="/settings">Preços</Link>
        </nav>
        <button onClick={() => { localStorage.removeItem("obrapro_token"); router.push("/login") }}
          className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors" title="Sair">logout</button>
      </header>

      <main className="pt-24 px-4 md:px-6 max-w-3xl mx-auto">

        {/* Alerts */}
        {isLimitReached && (
          <div className="mb-8 p-4 bg-error-container/20 text-on-surface border border-error/20 rounded-2xl flex items-start gap-3">
            <span className="material-symbols-outlined text-error mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
            <div>
              <p className="font-bold text-sm">Limite do plano gratuito atingido</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Você atingiu o máximo de 3 obras do plano Free. Faça upgrade para continuar a criar obras.</p>
            </div>
          </div>
        )}
        {isSuccess && (
          <div className="mb-8 p-4 bg-primary-container/20 text-on-surface border border-primary-container/20 rounded-2xl flex items-start gap-3">
            <span className="material-symbols-outlined text-primary mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <div>
              <p className="font-bold text-sm">Upgrade realizado com sucesso!</p>
              <p className="text-xs text-on-surface-variant mt-0.5">O teu plano Pro já está ativo. Obras ilimitadas desbloqueadas.</p>
            </div>
          </div>
        )}
        {isCanceled && (
          <div className="mb-8 p-4 bg-surface-container text-on-surface-variant border border-outline-variant/20 rounded-2xl text-sm">
            Checkout cancelado. Nenhuma cobrança foi efetuada.
          </div>
        )}

        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="font-headline font-extrabold text-4xl md:text-5xl text-on-surface tracking-tight mb-3">
            Escolha o seu plano
          </h1>
          <p className="text-on-surface-variant text-lg max-w-md mx-auto">
            Comece gratuitamente. Faça upgrade quando precisar de mais.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">

          {/* Free */}
          <div className={`rounded-3xl p-8 border-2 flex flex-col ${plan === "free" ? "border-secondary-container bg-surface-container-low" : "border-outline-variant/20 bg-surface-container-low"}`}>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-headline font-bold text-xl text-on-surface">Free</span>
                {plan === "free" && (
                  <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase tracking-wider">Plano atual</span>
                )}
              </div>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-headline font-extrabold text-on-surface">R$0</span>
                <span className="text-on-surface-variant mb-1">/mês</span>
              </div>
            </div>

            <ul className="space-y-3 flex-1 mb-8">
              {[
                { ok: true,  text: "3 obras" },
                { ok: true,  text: "Todas as calculadoras (piso, parede, pintura, demolição)" },
                { ok: true,  text: "Geração de PDF" },
                { ok: true,  text: "Tabela de preços personalizada" },
                { ok: false, text: "Obras ilimitadas" },
                { ok: false, text: "Suporte prioritário" },
              ].map((f, i) => (
                <li key={i} className={`flex items-start gap-2.5 text-sm ${f.ok ? "text-on-surface" : "text-on-surface-variant/50"}`}>
                  <span className={`material-symbols-outlined text-[18px] mt-0.5 shrink-0 ${f.ok ? "text-primary" : "text-outline-variant"}`}
                    style={{ fontVariationSettings: f.ok ? "'FILL' 1" : "'FILL' 0" }}>
                    {f.ok ? "check_circle" : "cancel"}
                  </span>
                  {f.text}
                </li>
              ))}
            </ul>

            <div className="px-6 py-3 rounded-xl bg-surface-container text-on-surface-variant text-center text-sm font-medium">
              {plan === "free" ? "Plano atual" : "Plano gratuito"}
            </div>
          </div>

          {/* Pro */}
          <div className={`rounded-3xl p-8 border-2 flex flex-col relative overflow-hidden ${plan === "pro" ? "border-primary bg-primary/5" : "border-primary bg-surface-container-low"}`}>
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-primary text-on-primary rounded-full text-[10px] font-bold uppercase tracking-widest">
                {plan === "pro" ? "Ativo" : "Recomendado"}
              </span>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                <span className="font-headline font-bold text-xl text-on-surface">Pro</span>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-headline font-extrabold text-on-surface">R$39</span>
                <span className="text-on-surface-variant mb-1">/mês</span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">Cancele quando quiser</p>
            </div>

            <ul className="space-y-3 flex-1 mb-8">
              {[
                "Obras ilimitadas",
                "Todas as calculadoras",
                "Geração de PDF profissional",
                "Tabela de preços personalizada",
                "Etapas e controlo de gastos",
                "Suporte prioritário",
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-on-surface">
                  <span className="material-symbols-outlined text-primary text-[18px] mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  {f}
                </li>
              ))}
            </ul>

            {plan === "pro" ? (
              <div className="px-6 py-3 rounded-xl bg-primary/10 text-primary text-center text-sm font-bold">
                Plano Pro ativo
              </div>
            ) : (
              <button onClick={handleUpgrade} disabled={checkingOut}
                className="w-full py-4 rounded-xl bg-primary text-on-primary font-headline font-bold text-base hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20">
                {checkingOut
                  ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> A redirecionar...</>
                  : <><span className="material-symbols-outlined text-[20px]">rocket_launch</span> Fazer upgrade agora</>
                }
              </button>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10 space-y-6">
          <h2 className="font-headline font-bold text-lg text-on-surface">Perguntas frequentes</h2>
          {[
            {
              q: "Posso cancelar a qualquer momento?",
              a: "Sim. O cancelamento é imediato e o acesso Pro mantém-se até ao fim do período pago.",
            },
            {
              q: "O que acontece às minhas obras se cancelar?",
              a: "As suas obras ficam guardadas. Apenas não poderá criar novas obras até ter menos de 3.",
            },
            {
              q: "O plano Free é mesmo grátis para sempre?",
              a: "Sim. O plano Free não tem limite de tempo — pode usar as 3 obras indefinidamente.",
            },
          ].map((faq, i) => (
            <div key={i}>
              <p className="font-semibold text-on-surface text-sm mb-1">{faq.q}</p>
              <p className="text-sm text-on-surface-variant">{faq.a}</p>
            </div>
          ))}
        </div>

      </main>

      {/* BottomNavBar (Mobile) */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pt-2 pb-6 bg-surface/90 backdrop-blur-lg rounded-t-2xl border-t border-surface-variant/30 shadow-[0_-4px_20px_rgba(13,28,46,0.06)] z-50 md:hidden">
        <Link href="/dashboard" className="flex flex-col items-center justify-center text-on-surface-variant opacity-70 hover:opacity-100 transition-opacity active:scale-90 transition-transform">
          <span className="material-symbols-outlined">folder_open</span>
          <span className="font-headline text-[11px] font-semibold uppercase tracking-wider mt-1">Projetos</span>
        </Link>
        <Link href="/calculate" className="flex flex-col items-center justify-center text-on-surface-variant opacity-70 hover:opacity-100 transition-opacity active:scale-90 transition-transform">
          <span className="material-symbols-outlined">calculate</span>
          <span className="font-headline text-[11px] font-semibold uppercase tracking-wider mt-1">Calcular</span>
        </Link>
        <Link href="/settings" className="flex flex-col items-center justify-center text-on-surface-variant opacity-70 hover:opacity-100 transition-opacity active:scale-90 transition-transform">
          <span className="material-symbols-outlined">settings</span>
          <span className="font-headline text-[11px] font-semibold uppercase tracking-wider mt-1">Preços</span>
        </Link>
      </nav>
    </div>
  )
}
