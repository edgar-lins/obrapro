"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { TopAppBar } from "@/components/top-app-bar"
import { BottomNavBar } from "@/components/bottom-nav-bar"
import { Icon } from "@/components/icon"
import { getObra, updateObraStatus, updateStageStatus, addExpense } from "@/services/api"
import { serviceIcons, serviceLabels, environmentLabels } from "@/lib/service-icons"
import { cn } from "@/lib/utils"

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)

type ObraStatus = "orcado" | "em_andamento" | "concluido"
type StageStatus = "pendente" | "em_andamento" | "concluido"

const statusOptions: { value: ObraStatus; label: string }[] = [
  { value: "orcado", label: "Orçado" },
  { value: "em_andamento", label: "Em Andamento" },
  { value: "concluido", label: "Concluído" },
]

const stageStatusOptions: { value: StageStatus; label: string; icon: string }[] = [
  { value: "pendente", label: "Pendente", icon: "hourglass_empty" },
  { value: "em_andamento", label: "Em Andamento", icon: "pending" },
  { value: "concluido", label: "Concluído", icon: "check_circle" },
]

const expenseCategories = [
  { value: "material", label: "Material" },
  { value: "mao_de_obra", label: "Mão de Obra" },
  { value: "outro", label: "Outro" },
]

export default function ObraDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = Number(params.id)

  const [obra, setObra] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [expDesc, setExpDesc] = useState("")
  const [expAmount, setExpAmount] = useState("")
  const [expCategory, setExpCategory] = useState("material")
  const [addingExpense, setAddingExpense] = useState(false)

  const token = typeof window !== "undefined" ? localStorage.getItem("obrapro_token") : null
  const plan = (typeof window !== "undefined" ? localStorage.getItem("obrapro_plan") : "free") as "free" | "pro"

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

  async function handleObraStatus(status: ObraStatus) {
    if (!token) return
    setUpdatingStatus(true)
    try {
      await updateObraStatus(id, status, token)
      setObra((prev: any) => ({ ...prev, status }))
    } finally {
      setUpdatingStatus(false)
    }
  }

  async function handleStageStatus(stageId: number, status: StageStatus) {
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

  async function handleAddExpense(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!token || !expDesc || !expAmount) return
    setAddingExpense(true)
    try {
      const exp = await addExpense(id, { description: expDesc, amount: Number(expAmount), category: expCategory }, token)
      setObra((prev: any) => ({ ...prev, expenses: [exp, ...(prev.expenses ?? [])] }))
      setExpDesc("")
      setExpAmount("")
      setExpCategory("material")
      setShowAddExpense(false)
    } catch (err) {
      console.error(err)
    } finally {
      setAddingExpense(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const stages = obra.stages ?? []
  const expenses = obra.expenses ?? []
  const completedStages = stages.filter((s: any) => s.status === "concluido").length
  const progressPercent = stages.length > 0 ? Math.round((completedStages / stages.length) * 100) : 0
  const totalExpenses = expenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0)
  const variance = Number(obra.total_cost) - totalExpenses
  const isUnderBudget = variance >= 0

  return (
    <div className="min-h-screen bg-surface pb-24 md:pb-8">
      <TopAppBar showBackButton backHref="/dashboard" title={obra.name} showNav isLoggedIn plan={plan} />

      <main className="pt-20 px-4 md:px-6 max-w-4xl mx-auto space-y-6 pb-12">
        {/* Hero Card */}
        <div className="bg-surface-container-low rounded-3xl p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-on-surface mb-2">{obra.name}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-on-surface-variant">
              {obra.client_name && (
                <div className="flex items-center gap-2">
                  <Icon name="person" size={18} />
                  <span>{obra.client_name}</span>
                </div>
              )}
              {obra.client_phone && (
                <div className="flex items-center gap-2">
                  <Icon name="phone" size={18} />
                  <span>{obra.client_phone}</span>
                </div>
              )}
            </div>
            {obra.client_address && (
              <div className="flex items-start gap-2 mt-2 text-sm text-on-surface-variant">
                <Icon name="location_on" size={18} className="shrink-0 mt-0.5" />
                <span>{obra.client_address}</span>
              </div>
            )}
            <div className="flex items-center gap-2 mt-2 text-sm text-on-surface-variant">
              <Icon name="calendar_today" size={18} />
              <span>Criada em {new Date(obra.created_at).toLocaleDateString("pt-BR")}</span>
            </div>
          </div>

          {/* Status Selector */}
          <div className="mb-6">
            <label className="text-sm font-heading font-medium text-on-surface-variant mb-3 block">Status da Obra</label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleObraStatus(value)}
                  disabled={updatingStatus}
                  className={cn(
                    "px-4 py-2.5 rounded-full text-sm font-heading font-semibold transition-all",
                    obra.status === value
                      ? value === "orcado"
                        ? "bg-secondary-container text-on-secondary-container ring-2 ring-secondary"
                        : value === "em_andamento"
                          ? "bg-primary-container/50 text-primary ring-2 ring-primary"
                          : "bg-surface-container-highest text-on-surface ring-2 ring-outline"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-heading font-medium text-on-surface-variant">Progresso das Etapas</span>
              <span className="text-sm font-heading font-bold text-on-surface">{completedStages}/{stages.length}</span>
            </div>
            <div className="h-3 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-on-surface-variant mt-1">{progressPercent}% concluído</p>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Estimado", value: fmt(Number(obra.total_cost)), highlight: true },
              { label: "Mão de Obra", value: fmt(Number(obra.labor_cost)) },
              { label: "Material", value: fmt(Number(obra.material_cost)) },
              { label: "Prazo", value: `${obra.estimated_days} dias` },
            ].map((item) => (
              <div key={item.label} className="bg-surface-container-lowest rounded-2xl p-4">
                <span className="text-xs text-on-surface-variant">{item.label}</span>
                <p className={cn("text-xl font-heading font-bold mt-1", item.highlight ? "text-primary" : "text-on-surface")}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stages Card */}
        <div className="bg-surface-container-lowest rounded-3xl p-6">
          <h2 className="text-lg font-heading font-bold text-on-surface mb-4">Etapas</h2>
          <div className="space-y-4">
            {stages.map((stage: any) => (
              <div key={stage.id} className="p-4 bg-surface-container-low rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0">
                    <Icon name={serviceIcons[stage.service_type] ?? "home_work"} size={24} className="text-on-surface-variant" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-heading font-bold text-on-surface">
                          {serviceLabels[stage.service_type] ?? stage.service_type}
                          {stage.floor_type && ` — ${stage.floor_type}`}
                          {stage.paint_type && ` — ${stage.paint_type}`}
                          {stage.demolition_type && ` — ${stage.demolition_type}`}
                        </h3>
                        <p className="text-sm text-on-surface-variant">
                          {environmentLabels[stage.environment] ?? stage.environment} · {stage.area} m²
                        </p>
                      </div>
                      <span className="text-sm font-heading font-bold text-primary shrink-0">
                        {fmt(Number(stage.total_cost))}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {stageStatusOptions.map(({ value, label, icon }) => (
                        <button
                          key={value}
                          onClick={() => handleStageStatus(stage.id, value)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-medium transition-all",
                            stage.status === value
                              ? value === "pendente"
                                ? "bg-surface-container-highest text-on-surface-variant"
                                : value === "em_andamento"
                                  ? "bg-primary-container/30 text-primary"
                                  : "bg-primary-fixed/20 text-primary"
                              : "bg-surface-container text-on-surface-variant/60 hover:bg-surface-container-high"
                          )}
                        >
                          <Icon name={icon} size={14} />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-surface-container-lowest rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-heading font-bold text-on-surface">Gastos Reais</h2>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-sm text-on-surface-variant">
                  Total: <span className="font-heading font-bold text-on-surface">{fmt(totalExpenses)}</span>
                </span>
                {totalExpenses > 0 && (
                  <span className={cn("text-sm font-heading font-medium", isUnderBudget ? "text-primary" : "text-error")}>
                    {isUnderBudget ? "−" : "+"} {fmt(Math.abs(variance))} vs estimado
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowAddExpense(!showAddExpense)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high text-on-surface font-heading font-semibold text-sm hover:bg-surface-container-highest transition-colors"
            >
              <Icon name={showAddExpense ? "close" : "add"} size={18} />
              {showAddExpense ? "Cancelar" : "Adicionar"}
            </button>
          </div>

          {showAddExpense && (
            <form onSubmit={handleAddExpense} className="mb-6 p-4 bg-surface-container-low rounded-2xl space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-heading font-medium text-on-surface-variant">Descrição</label>
                  <input
                    type="text"
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all"
                    placeholder="Ex: Material extra"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-heading font-medium text-on-surface-variant">Valor</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">R$</span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={expAmount}
                      onChange={(e) => setExpAmount(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all"
                      placeholder="0,00"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all"
                >
                  {expenseCategories.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={addingExpense}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-heading font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <Icon name="add" size={18} />
                  {addingExpense ? "A registar..." : "Adicionar"}
                </button>
              </div>
            </form>
          )}

          {expenses.length > 0 ? (
            <div className="space-y-3">
              {expenses.map((exp: any) => (
                <div key={exp.id} className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
                  <div>
                    <p className="font-heading font-medium text-on-surface">{exp.description}</p>
                    <p className="text-sm text-on-surface-variant">
                      {expenseCategories.find(c => c.value === exp.category)?.label ?? exp.category} · {new Date(exp.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <span className="font-heading font-bold text-on-surface">{fmt(Number(exp.amount))}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-on-surface-variant">
              <Icon name="receipt_long" size={48} className="mx-auto mb-3 opacity-50" />
              <p>Nenhum gasto registado ainda</p>
            </div>
          )}
        </div>
      </main>

      <BottomNavBar />
    </div>
  )
}
