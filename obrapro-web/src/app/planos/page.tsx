"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { TopAppBar } from "@/components/top-app-bar"
import { BottomNavBar } from "@/components/bottom-nav-bar"
import { Icon } from "@/components/icon"
import { getBillingStatus, createCheckout } from "@/services/api"
import { cn } from "@/lib/utils"

function PlanosContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isLimitReached = searchParams.get("limit") === "1"
  const isSuccess = searchParams.get("success") === "1"
  const isCanceled = searchParams.get("canceled") === "1"

  const [plan, setPlan] = useState<"free" | "pro">("free")
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)

  const token = typeof window !== "undefined" ? localStorage.getItem("obrapro_token") : null

  useEffect(() => {
    if (!token) { router.push("/login"); return }
    async function fetchStatus() {
      try {
        const data = await getBillingStatus(token as string)
        const p = data.plan as "free" | "pro"
        setPlan(p)
        localStorage.setItem("obrapro_plan", p)
      } catch {
        setPlan((localStorage.getItem("obrapro_plan") ?? "free") as "free" | "pro")
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
    } catch (err: unknown) {
      console.error(err)
      alert("Erro ao iniciar checkout.")
      setCheckingOut(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-surface pb-24 md:pb-8">
      <TopAppBar showBackButton backHref="/dashboard" title="Planos" showNav={false} isLoggedIn plan={plan} />

      <main className="pt-20 px-4 md:px-6 max-w-4xl mx-auto">
        {/* Alerts */}
        {isLimitReached && (
          <div className="mb-6 p-4 bg-error-container rounded-2xl flex items-center gap-3">
            <Icon name="warning" size={24} className="text-on-error-container" filled />
            <p className="text-on-error-container font-heading font-medium">
              Você atingiu o limite de obras do plano gratuito. Faça upgrade para continuar.
            </p>
          </div>
        )}
        {isSuccess && (
          <div className="mb-6 p-4 bg-primary-container/20 rounded-2xl flex items-center gap-3">
            <Icon name="check_circle" size={24} className="text-primary" filled />
            <p className="text-primary font-heading font-medium">
              Parabéns! O seu plano Pro está ativo. Obras ilimitadas desbloqueadas.
            </p>
          </div>
        )}
        {isCanceled && (
          <div className="mb-6 p-4 bg-surface-container rounded-2xl flex items-center gap-3">
            <Icon name="info" size={24} className="text-on-surface-variant" />
            <p className="text-on-surface-variant font-heading font-medium">
              Checkout cancelado. Nenhuma cobrança foi efetuada.
            </p>
          </div>
        )}

        {/* Hero */}
        <div className="text-center mb-12 pt-4">
          <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-on-surface tracking-tight mb-3">
            Escolha o seu plano
          </h1>
          <p className="text-on-surface-variant text-lg max-w-md mx-auto">
            Comece gratuitamente. Faça upgrade quando precisar de mais.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Free */}
          <div className={cn(
            "rounded-3xl p-8 border-2 flex flex-col",
            plan === "free" ? "border-secondary-container bg-surface-container-low" : "border-outline-variant/20 bg-surface-container-low"
          )}>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-heading font-bold text-xl text-on-surface">Free</span>
                {plan === "free" && (
                  <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Plano atual
                  </span>
                )}
              </div>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-heading font-extrabold text-on-surface">R$0</span>
                <span className="text-on-surface-variant mb-1">/mês</span>
              </div>
            </div>
            <ul className="space-y-3 flex-1 mb-8">
              {[
                { ok: true, text: "3 obras" },
                { ok: true, text: "Todas as calculadoras" },
                { ok: true, text: "Geração de PDF" },
                { ok: true, text: "Tabela de preços personalizada" },
                { ok: false, text: "Obras ilimitadas" },
                { ok: false, text: "Suporte prioritário" },
              ].map((f, i) => (
                <li key={i} className={cn("flex items-center gap-2.5 text-sm", f.ok ? "text-on-surface" : "text-on-surface-variant/50")}>
                  <Icon name={f.ok ? "check_circle" : "cancel"} size={18} className={f.ok ? "text-primary" : "text-outline-variant"} filled={f.ok} />
                  {f.text}
                </li>
              ))}
            </ul>
            <div className="px-6 py-3 rounded-xl bg-surface-container text-on-surface-variant text-center text-sm font-medium">
              {plan === "free" ? "Plano atual" : "Plano gratuito"}
            </div>
          </div>

          {/* Pro */}
          <div className={cn(
            "rounded-3xl p-8 border-2 flex flex-col relative overflow-hidden",
            plan === "pro" ? "border-primary bg-primary/5" : "border-primary bg-surface-container-low"
          )}>
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-primary text-on-primary rounded-full text-[10px] font-bold uppercase tracking-widest">
                {plan === "pro" ? "Ativo" : "Recomendado"}
              </span>
            </div>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="workspace_premium" size={20} className="text-primary" filled />
                <span className="font-heading font-bold text-xl text-on-surface">Pro</span>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-heading font-extrabold text-on-surface">R$39</span>
                <span className="text-on-surface-variant mb-1">/mês</span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">Cancele quando quiser</p>
            </div>
            <ul className="space-y-3 flex-1 mb-8">
              {["Obras ilimitadas", "Todas as calculadoras", "Geração de PDF profissional", "Tabela de preços personalizada", "Etapas e controlo de gastos", "Suporte prioritário"].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-on-surface">
                  <Icon name="check_circle" size={18} className="text-primary" filled />
                  {f}
                </li>
              ))}
            </ul>
            {plan === "pro" ? (
              <div className="px-6 py-3 rounded-xl bg-primary/10 text-primary text-center text-sm font-bold">
                Plano Pro ativo
              </div>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={checkingOut}
                className="w-full py-4 rounded-xl bg-primary text-on-primary font-heading font-bold text-base hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20"
              >
                {checkingOut ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> A redirecionar...</>
                ) : (
                  <><Icon name="rocket_launch" size={20} /> Fazer upgrade agora</>
                )}
              </button>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10 space-y-6 mb-8">
          <h2 className="font-heading font-bold text-lg text-on-surface">Perguntas frequentes</h2>
          {[
            { q: "Posso cancelar a qualquer momento?", a: "Sim. O cancelamento é imediato e o acesso Pro mantém-se até ao fim do período pago." },
            { q: "O que acontece às minhas obras se cancelar?", a: "As suas obras ficam guardadas. Apenas não poderá criar novas obras até ter menos de 3." },
            { q: "O plano Free é mesmo grátis para sempre?", a: "Sim. O plano Free não tem limite de tempo — pode usar as 3 obras indefinidamente." },
          ].map((faq, i) => (
            <div key={i}>
              <p className="font-heading font-semibold text-on-surface text-sm mb-1">{faq.q}</p>
              <p className="text-sm text-on-surface-variant">{faq.a}</p>
            </div>
          ))}
        </div>
      </main>

      <BottomNavBar />
    </div>
  )
}

export default function PlanosPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PlanosContent />
    </Suspense>
  )
}
