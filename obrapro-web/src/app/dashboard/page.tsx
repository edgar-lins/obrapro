"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { TopAppBar } from "@/components/top-app-bar"
import { BottomNavBar } from "@/components/bottom-nav-bar"
import { StatusBadge } from "@/components/status-badge"
import { Icon } from "@/components/icon"
import { getObras, getBillingStatus } from "@/services/api"
import { serviceIcons } from "@/lib/service-icons"
import { cn } from "@/lib/utils"

const FREE_LIMIT = 3

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)

export default function DashboardPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState<"free" | "pro">("free")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    const token = localStorage.getItem("obrapro_token")
    if (!token) { router.push("/login"); return }

    const cachedPlan = (localStorage.getItem("obrapro_plan") ?? "free") as "free" | "pro"
    setPlan(cachedPlan)

    async function fetchData() {
      try {
        const [obras, billing] = await Promise.allSettled([
          getObras(token as string),
          getBillingStatus(token as string),
        ])
        if (obras.status === "fulfilled") setProjects(obras.value || [])
        if (billing.status === "fulfilled") {
          const p = billing.value.plan as "free" | "pro"
          setPlan(p)
          localStorage.setItem("obrapro_plan", p)
        }
      } catch {
        localStorage.removeItem("obrapro_token")
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const totalVolume = projects.reduce((sum: number, p: any) => sum + Number(p.total_cost), 0)
  const inProgress = projects.filter((p: any) => p.status === "em_andamento").length
  const completed = projects.filter((p: any) => p.status === "concluido").length
  const totalJobs = projects.length
  const remainingProjects = FREE_LIMIT - totalJobs
  const canCreateNew = plan === "pro" || totalJobs < FREE_LIMIT

  return (
    <div className="min-h-screen bg-surface pb-24 md:pb-8">
      <TopAppBar showNav isLoggedIn plan={plan} />

      <main className="pt-20 px-4 md:px-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-on-surface">Projetos Ativos</h1>
            <p className="text-on-surface-variant mt-1">Gerencie suas obras e orçamentos</p>
          </div>
          <Link
            href="/calculate"
            className={cn(
              "hidden md:inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-heading font-bold transition-all",
              canCreateNew
                ? "bg-gradient-to-r from-primary to-primary-container text-on-primary hover:opacity-90 active:scale-[0.98]"
                : "bg-surface-container-high text-on-surface-variant cursor-not-allowed"
            )}
          >
            <Icon name="add" size={20} />
            Novo Orçamento
          </Link>
        </div>

        {/* Freemium Banner */}
        {plan === "free" && (
          <div className={cn(
            "mb-6 p-4 rounded-2xl flex flex-col md:flex-row md:items-center gap-4",
            remainingProjects > 0 ? "bg-secondary-container/20" : "bg-error-container"
          )}>
            <div className="flex items-center gap-3 flex-1">
              <Icon
                name={remainingProjects > 0 ? "info" : "warning"}
                size={24}
                className={remainingProjects > 0 ? "text-secondary" : "text-on-error-container"}
              />
              <p className={cn("font-heading font-medium", remainingProjects > 0 ? "text-secondary" : "text-on-error-container")}>
                {remainingProjects > 0
                  ? `Você ainda pode criar ${remainingProjects} obra${remainingProjects > 1 ? "s" : ""} no plano gratuito.`
                  : "Você atingiu o limite de obras do plano gratuito."}
              </p>
            </div>
            <Link
              href="/planos"
              className={cn(
                "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-heading font-semibold text-sm transition-colors",
                remainingProjects > 0
                  ? "bg-secondary text-on-primary hover:opacity-90"
                  : "bg-error text-on-error hover:opacity-90"
              )}
            >
              Ver Planos <Icon name="arrow_forward" size={16} />
            </Link>
          </div>
        )}

        {/* Stats Bento */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="col-span-2 bg-surface-container-low rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-fixed/20 flex items-center justify-center">
                <Icon name="account_balance_wallet" size={20} className="text-primary" />
              </div>
              <span className="text-on-surface-variant font-heading font-medium">Volume Total</span>
            </div>
            <p className="text-3xl md:text-4xl font-heading font-bold text-on-surface">{fmt(totalVolume)}</p>
            <p className="text-xs text-on-surface-variant mt-1">em {totalJobs} {totalJobs === 1 ? "obra" : "obras"}</p>
          </div>
          <div className="bg-surface-container-low rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="pending" size={20} className="text-primary" />
              <span className="text-on-surface-variant text-sm font-heading font-medium">Em Andamento</span>
            </div>
            <p className="text-3xl font-heading font-bold text-on-surface">{inProgress}</p>
          </div>
          <div className="bg-primary rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="check_circle" size={20} className="text-primary-fixed" />
              <span className="text-primary-fixed/80 text-sm font-heading font-medium">Concluídas</span>
            </div>
            <p className="text-3xl font-heading font-bold text-primary-fixed">{completed}</p>
          </div>
        </div>

        {/* Projects Section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-bold text-on-surface">Lista de Projetos</h2>
          <div className="hidden md:flex items-center gap-1 p-1 bg-surface-container rounded-xl">
            {(["grid", "list"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  viewMode === mode
                    ? "bg-surface-container-highest text-on-surface"
                    : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                <Icon name={mode === "grid" ? "grid_view" : "view_list"} size={20} />
              </button>
            ))}
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 p-12 border-2 border-dashed border-outline-variant rounded-3xl text-on-surface-variant">
            <Icon name="add_circle" size={48} />
            <div className="text-center">
              <p className="font-heading font-semibold text-lg mb-1">Nenhum orçamento ainda</p>
              <p className="text-sm">Crie o seu primeiro orçamento agora.</p>
            </div>
            <Link href="/calculate" className="px-6 py-3 rounded-xl bg-primary-container text-on-primary font-heading font-bold text-sm">
              Começar Cálculo
            </Link>
          </div>
        ) : (
          <div className={cn("grid gap-4", viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
            {projects.map((obra: any) => {
              const mainService = obra.stages?.[0]?.service_type || "piso"
              return (
                <Link
                  key={obra.id}
                  href={`/obra/${obra.id}`}
                  className="group bg-surface-container-lowest rounded-3xl p-5 hover:shadow-xl hover:shadow-on-surface/5 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center">
                        <Icon name={serviceIcons[mainService] ?? "home_work"} size={24} className="text-on-surface-variant" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                          {obra.name}
                        </h3>
                        {obra.client_name && (
                          <p className="text-sm text-on-surface-variant">{obra.client_name}</p>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={obra.status} />
                  </div>

                  {obra.stages?.length > 0 && (
                    <div className="flex items-center gap-2 mb-4 text-sm text-on-surface-variant">
                      <Icon name="checklist" size={16} />
                      <span>{obra.stages.length} etapa{obra.stages.length !== 1 ? "s" : ""}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30">
                    <div className="flex items-center gap-2">
                      <Icon name="payments" size={16} className="text-on-surface-variant" />
                      <span className="font-heading font-bold text-on-surface">{fmt(Number(obra.total_cost))}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                      <Icon name="schedule" size={16} />
                      <span>{obra.estimated_days}d úteis</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-heading font-semibold">Ver obra</span>
                    <Icon name="arrow_forward" size={16} />
                  </div>
                </Link>
              )
            })}

            {canCreateNew && (
              <Link
                href="/calculate"
                className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-outline-variant rounded-3xl text-on-surface-variant hover:border-primary hover:text-primary transition-colors min-h-[200px]"
              >
                <Icon name="add_circle" size={48} />
                <span className="font-heading font-semibold">Criar novo orçamento</span>
              </Link>
            )}
          </div>
        )}
      </main>

      {canCreateNew && (
        <Link
          href="/calculate"
          className="md:hidden fixed bottom-24 right-6 w-14 h-14 rounded-2xl bg-primary-container flex items-center justify-center shadow-lg shadow-primary/30 active:scale-95 transition-transform z-40"
        >
          <Icon name="add" size={28} className="text-primary-fixed" />
        </Link>
      )}

      <BottomNavBar />
    </div>
  )
}
