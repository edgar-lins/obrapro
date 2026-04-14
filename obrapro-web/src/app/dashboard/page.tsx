"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getObras } from "@/services/api"

export default function DashboardPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("obrapro_token")
    if (!token) {
      router.push("/login")
      return
    }

    async function fetchProjects() {
      try {
        const data = await getObras(token as string)
        setProjects(data || [])
      } catch (err: any) {
        setError("Erro ao carregar orçamentos.")
        localStorage.removeItem("obrapro_token")
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [router])

  function handleLogout() {
    localStorage.removeItem("obrapro_token")
    router.push("/login")
  }

  const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)

  const statusLabel: Record<string, string> = {
    orcado: "Orçado",
    em_andamento: "Em Andamento",
    concluido: "Concluído",
  }
  const statusColor: Record<string, string> = {
    orcado: "bg-secondary-container/40 text-secondary",
    em_andamento: "bg-primary-container/30 text-primary",
    concluido: "bg-surface-container-highest text-on-surface-variant",
  }
  const serviceIcon: Record<string, string> = {
    piso: "layers",
    revestimento: "wall",
    pintura: "format_paint",
    demolicao: "construction",
  }

  const totalVolume = projects.reduce((acc: number, curr: any) => acc + Number(curr.total_cost), 0)
  const activeJobs = projects.filter((p: any) => p.status === "em_andamento").length
  const totalJobs = projects.length

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="bg-surface font-body text-on-surface selection:bg-primary-fixed-dim/30 min-h-screen pb-24 md:pb-0">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-sm md:shadow-none flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>architecture</span>
          <span className="font-headline font-extrabold text-xl tracking-tight text-on-surface">ObraPro</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link className="font-headline font-bold text-lg tracking-tight text-primary" href="/dashboard">Projetos</Link>
          <Link className="font-headline font-bold text-lg tracking-tight text-on-surface-variant hover:bg-surface-container-low transition-colors px-3 py-1 rounded-lg" href="/calculate">Calcular</Link>
          <Link className="font-headline font-bold text-lg tracking-tight text-on-surface-variant hover:bg-surface-container-low transition-colors px-3 py-1 rounded-lg" href="/settings">Preços</Link>
        </nav>

        <div className="flex items-center gap-4">
          <button onClick={handleLogout} className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors" title="Sair">logout</button>
          <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden flex items-center justify-center text-primary font-bold">
            OP
          </div>
        </div>
      </header>

      <main className="pt-24 md:pb-32 px-6 max-w-7xl mx-auto">
        {/* Dashboard Welcome & Primary Action */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-2">
            <h1 className="font-headline text-on-surface text-4xl font-extrabold tracking-tight">Projetos Ativos</h1>
            <p className="text-on-surface-variant font-body max-w-md">Estimativas de construção com precisão e acompanhamento financeiro para as suas obras.</p>
          </div>
          <Link href="/calculate" className="bg-primary-container text-on-primary hover:bg-primary transition-all px-8 py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-primary-container/10 active:scale-95 w-full md:w-auto">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
            <span className="font-headline font-bold tracking-wide">Novo Orçamento</span>
          </Link>
        </section>

        {error && <div className="mb-8 p-4 bg-error-container text-on-error-container rounded-lg font-medium">{error}</div>}

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16">
          <div className="md:col-span-2 bg-surface-container-low rounded-3xl p-8 flex flex-col justify-between h-48 border border-outline-variant/10">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant font-label font-semibold uppercase tracking-widest text-[11px]">Volume Total</span>
              <span className="material-symbols-outlined text-primary">trending_up</span>
            </div>
            <div>
              <div className="text-4xl font-headline font-extrabold text-on-surface">
                {fmt(totalVolume)}
              </div>
              <div className="text-primary-fixed-dim font-label text-xs mt-1 font-bold">em {totalJobs} {totalJobs === 1 ? "obra" : "obras"}</div>
            </div>
          </div>
          <div className="bg-surface-container rounded-3xl p-8 flex flex-col justify-center items-center text-center border border-outline-variant/10">
            <div className="text-3xl font-headline font-bold text-primary">{activeJobs}</div>
            <div className="text-on-surface-variant font-label text-xs uppercase tracking-wider mt-2">Em Andamento</div>
          </div>
          <div className="bg-primary text-on-primary rounded-3xl p-8 flex flex-col justify-center items-center text-center shadow-lg shadow-primary/20">
            <div className="text-3xl font-headline font-bold text-primary-fixed">
              {projects.filter((p: any) => p.status === "concluido").length}
            </div>
            <div className="text-on-primary/70 font-label text-xs uppercase tracking-wider mt-2">Concluídas</div>
          </div>
        </div>

        {/* Section Label */}
        <div className="flex items-center gap-4 mb-8">
          <h2 className="font-headline text-xl font-bold">Lista de Projetos</h2>
          <div className="h-[1px] flex-grow bg-surface-variant/50"></div>
          <div className="flex gap-2">
            <button className="p-2 bg-surface-container-highest rounded-lg text-secondary"><span className="material-symbols-outlined text-[20px]">grid_view</span></button>
            <button className="p-2 hover:bg-surface-container-low rounded-lg text-on-surface-variant transition-colors"><span className="material-symbols-outlined text-[20px]">list</span></button>
          </div>
        </div>

        {/* Project Grid */}
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-surface-container-low/50 rounded-2xl p-12 border-2 border-dashed border-outline-variant/30">
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-on-surface-variant/40 text-3xl">add_circle</span>
            </div>
            <h3 className="font-headline font-bold text-lg mb-1">Nenhum orçamento</h3>
            <p className="text-on-surface-variant font-medium text-sm text-center px-4 max-w-sm mb-6">Pronto para a próxima obra? Crie a sua primeira estimativa agora.</p>
            <Link href="/calculate" className="bg-primary-container text-on-primary px-6 py-3 rounded-lg font-bold text-sm">
              Começar Cálculo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((obra: any) => {
              const primaryStage = obra.stages?.[0]
              const icon = serviceIcon[primaryStage?.service_type] ?? "home_work"
              const stagesCount = obra.stages?.length ?? 0
              return (
                <Link key={obra.id} href={`/obra/${obra.id}`}
                  className="group bg-surface-container-lowest rounded-2xl p-6 hover:shadow-xl hover:shadow-on-surface/5 transition-all duration-300 border border-outline-variant/20 block">
                  <div className="flex justify-between items-start mb-5">
                    <div className="p-3 bg-surface-container-low rounded-xl group-hover:bg-primary-container/20 transition-colors">
                      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor[obra.status] ?? ""}`}>
                      {statusLabel[obra.status] ?? obra.status}
                    </span>
                  </div>

                  <div className="space-y-1 mb-5">
                    <h3 className="font-headline text-base font-extrabold text-on-surface leading-tight">{obra.name}</h3>
                    {obra.client_name && (
                      <p className="text-on-surface-variant text-xs flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">person</span>
                        {obra.client_name}
                      </p>
                    )}
                    {stagesCount > 0 && (
                      <p className="text-on-surface-variant text-xs flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">list_alt</span>
                        {stagesCount} {stagesCount === 1 ? "etapa" : "etapas"}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-outline-variant/20">
                    <div>
                      <span className="block text-on-surface-variant font-label text-[10px] uppercase tracking-tighter mb-1">Custo Total</span>
                      <span className="text-primary font-extrabold text-base">{fmt(obra.total_cost)}</span>
                    </div>
                    <div>
                      <span className="block text-on-surface-variant font-label text-[10px] uppercase tracking-tighter mb-1">Prazo</span>
                      <span className="text-on-surface font-semibold text-sm">{obra.estimated_days}d úteis</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-1 text-secondary font-label text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver obra
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>

      {/* BottomNavBar (Mobile) */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pt-2 pb-6 bg-surface/90 backdrop-blur-lg rounded-t-2xl border-t border-surface-variant/30 shadow-[0_-4px_20px_rgba(13,28,46,0.06)] z-50 md:hidden">
        <Link href="/dashboard" className="flex flex-col items-center justify-center text-primary bg-surface-container-highest rounded-xl px-4 py-1 active:scale-90 transition-transform">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>folder_open</span>
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

      {/* Contextual FAB (Mobile) */}
      <div className="fixed bottom-24 right-6 z-40 md:hidden">
        <Link href="/calculate" className="w-16 h-16 bg-primary-container text-on-primary rounded-2xl shadow-xl shadow-primary-container/30 flex items-center justify-center active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
        </Link>
      </div>
    </div>
  )
}