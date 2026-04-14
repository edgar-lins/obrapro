"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { getObra, updateObraStatus, updateStageStatus, addExpense } from "@/services/api"

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)

const statusLabel: Record<string, string> = {
  orcado: "Orçado",
  em_andamento: "Em Andamento",
  concluido: "Concluído",
  pendente: "Pendente",
}

const statusColor: Record<string, string> = {
  orcado: "bg-secondary-container/40 text-secondary",
  em_andamento: "bg-primary-container/30 text-primary",
  concluido: "bg-surface-container-highest text-on-surface-variant line-through",
  pendente: "bg-surface-container text-on-surface-variant",
}

const serviceLabel: Record<string, string> = {
  piso: "Piso",
  revestimento: "Revestimento de Parede",
  pintura: "Pintura",
  demolicao: "Demolição",
}

const serviceIcon: Record<string, string> = {
  piso: "layers",
  revestimento: "wall",
  pintura: "format_paint",
  demolicao: "construction",
}

const environmentLabel: Record<string, string> = {
  sala: "Sala",
  cozinha: "Cozinha",
  banheiro: "Casa de Banho",
  externo: "Exterior",
}

const categoryLabel: Record<string, string> = {
  material: "Material",
  mao_de_obra: "Mão de Obra",
  outro: "Outro",
}

export default function ObraPage() {
  const router = useRouter()
  const params = useParams()
  const id = Number(params.id)

  const [obra, setObra] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Expense form
  const [expDescription, setExpDescription] = useState("")
  const [expAmount, setExpAmount] = useState("")
  const [expCategory, setExpCategory] = useState("outro")
  const [addingExpense, setAddingExpense] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)

  const token = typeof window !== "undefined" ? localStorage.getItem("obrapro_token") : null

  useEffect(() => {
    if (!token) { router.push("/login"); return }

    async function load() {
      try {
        const data = await getObra(id, token as string)
        setObra(data)
      } catch {
        router.push("/dashboard")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, router, token])

  async function handleObraStatus(status: string) {
    if (!token) return
    setUpdatingStatus(true)
    try {
      await updateObraStatus(id, status, token)
      setObra((prev: any) => ({ ...prev, status }))
    } finally {
      setUpdatingStatus(false)
    }
  }

  async function handleStageStatus(stageId: number, status: string) {
    if (!token) return
    try {
      await updateStageStatus(id, stageId, status, token)
      setObra((prev: any) => ({
        ...prev,
        stages: prev.stages.map((s: any) => s.id === stageId ? { ...s, status } : s),
      }))
    } catch (err) {
      console.error(err)
    }
  }

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !expDescription || !expAmount) return
    setAddingExpense(true)
    try {
      const exp = await addExpense(id, {
        description: expDescription,
        amount: Number(expAmount),
        category: expCategory,
      }, token)
      setObra((prev: any) => ({
        ...prev,
        expenses: [exp, ...(prev.expenses ?? [])],
      }))
      setExpDescription("")
      setExpAmount("")
      setExpCategory("outro")
      setShowExpenseForm(false)
    } catch (err) {
      console.error(err)
    } finally {
      setAddingExpense(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  const totalExpenses = (obra.expenses ?? []).reduce((s: number, e: any) => s + Number(e.amount), 0)
  const stagesTotal = obra.stages?.length ?? 0
  const stagesDone = obra.stages?.filter((s: any) => s.status === "concluido").length ?? 0
  const progressPct = stagesTotal > 0 ? Math.round((stagesDone / stagesTotal) * 100) : 0

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen pb-32 md:pb-0">

      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-sm flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="material-symbols-outlined text-on-surface-variant hover:text-on-surface transition-colors">arrow_back</Link>
          <span className="font-headline font-extrabold text-xl tracking-tight text-on-surface truncate max-w-[200px] md:max-w-none">{obra.name}</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link className="font-headline font-bold text-lg tracking-tight text-primary" href="/dashboard">Projetos</Link>
          <Link className="font-headline font-bold text-lg tracking-tight text-on-surface-variant hover:bg-surface-container-low transition-colors px-3 py-1 rounded-lg" href="/calculate">Calcular</Link>
          <Link className="font-headline font-bold text-lg tracking-tight text-on-surface-variant hover:bg-surface-container-low transition-colors px-3 py-1 rounded-lg" href="/settings">Preços</Link>
        </nav>
        <div className="flex items-center gap-4">
          <button onClick={() => { localStorage.removeItem("obrapro_token"); router.push("/login") }}
            className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors" title="Sair">logout</button>
        </div>
      </header>

      <main className="pt-24 px-4 md:px-6 max-w-4xl mx-auto space-y-6 pb-12">

        {/* Hero — Status + Financeiro */}
        <div className="bg-surface-container-low rounded-3xl p-6 md:p-8 border border-outline-variant/10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start gap-4 justify-between">
            <div className="space-y-1">
              <h1 className="font-headline font-extrabold text-2xl md:text-3xl text-on-surface">{obra.name}</h1>
              {obra.client_name && (
                <p className="text-on-surface-variant text-sm flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">person</span>
                  {obra.client_name}
                  {obra.client_phone && <span className="ml-2 opacity-70">{obra.client_phone}</span>}
                </p>
              )}
              {obra.client_address && (
                <p className="text-on-surface-variant text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-xs">location_on</span>
                  {obra.client_address}
                </p>
              )}
              <p className="text-on-surface-variant text-xs mt-2">
                Criada em {new Date(obra.created_at).toLocaleDateString("pt-BR")}
              </p>
            </div>

            {/* Status selector */}
            <div className="flex flex-wrap gap-2 shrink-0">
              {["orcado", "em_andamento", "concluido"].map((s) => (
                <button key={s}
                  onClick={() => handleObraStatus(s)}
                  disabled={updatingStatus}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${obra.status === s ? statusColor[s] + " ring-2 ring-offset-1 ring-current" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}>
                  {statusLabel[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Progresso das Etapas</span>
              <span className="text-sm font-bold text-primary">{stagesDone}/{stagesTotal} concluídas</span>
            </div>
            <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }}></div>
            </div>
          </div>

          {/* Financial summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-outline-variant/20">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Total Estimado</p>
              <p className="text-xl font-headline font-extrabold text-primary">{fmt(obra.total_cost)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Mão de Obra</p>
              <p className="text-base font-semibold text-on-surface">{fmt(obra.labor_cost)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Material</p>
              <p className="text-base font-semibold text-on-surface">{fmt(obra.material_cost)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Prazo</p>
              <p className="text-base font-semibold text-on-surface">{obra.estimated_days}d úteis</p>
            </div>
          </div>
        </div>

        {/* Etapas */}
        <div className="bg-surface-container-low rounded-3xl border border-outline-variant/10 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10">
            <h2 className="font-headline font-bold text-lg text-on-surface">Etapas da Obra</h2>
            <p className="text-sm text-on-surface-variant mt-0.5">Atualize o status de cada etapa conforme o trabalho avança</p>
          </div>
          <div className="divide-y divide-outline-variant/10">
            {(obra.stages ?? []).map((stage: any) => (
              <div key={stage.id} className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {serviceIcon[stage.service_type] ?? "home_work"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-on-surface text-sm">
                    {serviceLabel[stage.service_type] ?? stage.service_type}
                    {stage.floor_type && ` — ${stage.floor_type}`}
                    {stage.paint_type && ` — ${stage.paint_type}`}
                    {stage.demolition_type && ` — ${stage.demolition_type}`}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {environmentLabel[stage.environment] ?? stage.environment} · {stage.area} m² · {fmt(stage.total_cost)}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {["pendente", "em_andamento", "concluido"].map((s) => (
                    <button key={s}
                      onClick={() => handleStageStatus(stage.id, s)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${stage.status === s ? statusColor[s].replace("line-through", "") + " ring-2 ring-offset-1 ring-current" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}>
                      {statusLabel[s]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gastos Reais */}
        <div className="bg-surface-container-low rounded-3xl border border-outline-variant/10 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10 flex justify-between items-start gap-4">
            <div>
              <h2 className="font-headline font-bold text-lg text-on-surface">Gastos Reais</h2>
              <p className="text-sm text-on-surface-variant mt-0.5">
                Registado: <strong className="text-on-surface">{fmt(totalExpenses)}</strong>
                {totalExpenses > 0 && obra.total_cost > 0 && (
                  <span className={`ml-2 font-bold ${totalExpenses > obra.total_cost ? "text-error" : "text-primary"}`}>
                    ({totalExpenses > obra.total_cost ? "+" : ""}{fmt(totalExpenses - obra.total_cost)} vs estimado)
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => setShowExpenseForm(!showExpenseForm)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-container/20 text-primary rounded-xl text-sm font-bold hover:bg-primary-container/40 transition-colors shrink-0">
              <span className="material-symbols-outlined text-[18px]">{showExpenseForm ? "close" : "add"}</span>
              {showExpenseForm ? "Cancelar" : "Adicionar"}
            </button>
          </div>

          {showExpenseForm && (
            <form onSubmit={handleAddExpense} className="p-6 bg-surface-container-lowest border-b border-outline-variant/10 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Descrição</label>
                  <input type="text" placeholder="Ex: Compra de cerâmica" value={expDescription}
                    onChange={(e) => setExpDescription(e.target.value)} required
                    className="w-full bg-surface-container-low border-none ring-1 ring-outline-variant rounded-xl p-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary-container" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Valor (R$)</label>
                  <input type="number" min="0.01" step="0.01" placeholder="0,00" value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)} required
                    className="w-full bg-surface-container-low border-none ring-1 ring-outline-variant rounded-xl p-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary-container" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Categoria</label>
                  <select value={expCategory} onChange={(e) => setExpCategory(e.target.value)}
                    className="w-full bg-surface-container-low border-none ring-1 ring-outline-variant rounded-xl p-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary-container">
                    <option value="material">Material</option>
                    <option value="mao_de_obra">Mão de Obra</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={addingExpense}
                className="px-6 py-3 bg-primary-container text-on-primary rounded-xl font-bold text-sm hover:bg-primary transition-colors disabled:opacity-50">
                {addingExpense ? "A registar..." : "Registar Gasto"}
              </button>
            </form>
          )}

          <div className="divide-y divide-outline-variant/10">
            {(obra.expenses ?? []).length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant text-sm">
                Nenhum gasto registado ainda.
              </div>
            ) : (
              (obra.expenses ?? []).map((exp: any) => (
                <div key={exp.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{exp.description}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {categoryLabel[exp.category] ?? exp.category} · {new Date(exp.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <p className="font-bold text-on-surface shrink-0">{fmt(Number(exp.amount))}</p>
                </div>
              ))
            )}
          </div>
        </div>

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
    </div>
  )
}
