"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { calculateFloor, calculatePaint, calculateWall, calculateDemolition, createObra } from "@/services/api"
import { CalculationResult, isFloorResult, isPaintResult, isDemolitionResult } from "@/types/calculate"
import Link from "next/link"
import OrcamentoPDF from "@/components/OrcamentoPDF"

type ServiceType = "piso" | "revestimento" | "pintura" | "demolicao"

type EnvironmentItem = {
  id: string
  serviceType: ServiceType
  area: string
  environment: string
  // Piso / Revestimento de parede
  floorType: string
  removeOldFloor: boolean
  // Pintura
  paintType: string
  coats: number
  includeMassaCorrida: boolean
  includeFundo: boolean
  // Demolição
  demolitionType: string
  includeDisposal: boolean
  result?: CalculationResult
}

const FLOOR_OPTIONS = [
  { value: "porcelanato", label: "Porcelanato", icon: "layers" },
  { value: "ceramica", label: "Cerâmica", icon: "grid_on" },
  { value: "vinilico", label: "Vinílico", icon: "view_quilt" },
]

const ENV_OPTIONS = [
  { value: "sala", label: "Sala (Área Seca)" },
  { value: "cozinha", label: "Cozinha (Área Húmida)" },
  { value: "banheiro", label: "Casa de Banho (Área Molhada)" },
  { value: "externo", label: "Exterior (Exposto)" },
]

const PAINT_OPTIONS = [
  { value: "acrilica", label: "Acrílica", icon: "format_paint" },
  { value: "latex", label: "Látex", icon: "water_drop" },
  { value: "esmalte", label: "Esmalte", icon: "brush" },
]

function newEnv(id: string): EnvironmentItem {
  return {
    id,
    serviceType: "piso",
    area: "",
    environment: "sala",
    floorType: "porcelanato",
    removeOldFloor: false,
    paintType: "acrilica",
    coats: 2,
    includeMassaCorrida: false,
    includeFundo: false,
    demolitionType: "manual",
    includeDisposal: false,
  }
}

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)

export default function CalculateForm() {
  const router = useRouter()
  const [environments, setEnvironments] = useState<EnvironmentItem[]>([newEnv("1")])
  const [obraName, setObraName] = useState("")
  const [clientName, setClientName] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [clientAddress, setClientAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

  const hasResults = environments.every((e) => e.result)
  const isMulti = environments.length > 1

  const totalLabor = environments.reduce((s, e) => s + (e.result?.labor_cost ?? 0), 0)
  const totalMaterial = environments.reduce((s, e) => s + ((e.result as any)?.material_cost ?? 0), 0)
  const totalCost = environments.reduce((s, e) => s + (e.result?.total_cost ?? 0), 0)
  const totalDays = environments.reduce((s, e) => s + (e.result?.estimated_days ?? 0), 0)

  function updateEnv(id: string, patch: Partial<EnvironmentItem>) {
    setEnvironments((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch, result: undefined } : e)))
  }

  function addEnvironment() {
    setEnvironments((prev) => [...prev, newEnv(String(Date.now()))])
  }

  function removeEnvironment(id: string) {
    setEnvironments((prev) => prev.filter((e) => e.id !== id))
  }

  async function handleCalculate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const token = localStorage.getItem("obrapro_token")
    if (!token) {
      alert("Precisas de fazer login para calcular uma obra!")
      setLoading(false)
      return
    }

    try {
      const results = await Promise.all(
        environments.map((env) => {
          const area = Number(env.area)
          if (env.serviceType === "pintura") {
            return calculatePaint(
              { paint_type: env.paintType, area, coats: env.coats, include_massa_corrida: env.includeMassaCorrida, include_fundo: env.includeFundo, environment: env.environment },
              token,
            )
          }
          if (env.serviceType === "revestimento") {
            return calculateWall(
              { floor_type: env.floorType, area, remove_old_floor: env.removeOldFloor, environment: env.environment },
              token,
            )
          }
          if (env.serviceType === "demolicao") {
            return calculateDemolition(
              { area, type: env.demolitionType, include_disposal: env.includeDisposal, environment: env.environment },
              token,
            )
          }
          return calculateFloor(
            { floor_type: env.floorType, area, remove_old_floor: env.removeOldFloor, environment: env.environment },
            token,
            isMulti,
          )
        })
      )

      setEnvironments((prev) =>
        prev.map((env, i) => ({ ...env, result: results[i] }))
      )
    } catch (err: any) {
      console.error("Erro ao calcular:", err)
      const msg = err?.message ?? String(err)
      if (msg.includes("401") || msg.toLowerCase().includes("unauthorized")) {
        localStorage.removeItem("obrapro_token")
        alert("Sessão expirada. Faz login novamente.")
      } else {
        alert(`Erro ao calcular: ${msg}`)
      }
    }

    setLoading(false)
  }

  async function handleSaveObra() {
    const token = localStorage.getItem("obrapro_token")
    if (!token) return

    if (!obraName.trim()) {
      setSaveError("Dá um nome à obra antes de guardar.")
      return
    }
    if (!hasResults) {
      setSaveError("Calcula todos os ambientes antes de guardar.")
      return
    }

    setSaving(true)
    setSaveError("")
    try {
      const stages = environments.map((env) => ({
        service_type: env.serviceType,
        environment: env.environment,
        area: Number(env.area),
        floor_type: env.floorType,
        paint_type: env.paintType,
        coats: env.coats,
        demolition_type: env.demolitionType,
        labor_cost: env.result!.labor_cost,
        material_cost: (env.result as any).material_cost ?? 0,
        total_cost: env.result!.total_cost,
        estimated_days: env.result!.estimated_days,
      }))

      const obra = await createObra({
        name: obraName.trim(),
        client_name: clientName,
        client_phone: clientPhone,
        client_address: clientAddress,
        stages,
      }, token)

      router.push(`/obra/${obra.id}`)
    } catch (err: any) {
      setSaveError(err?.message ?? "Erro ao guardar obra.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
    <div className="w-full max-w-2xl mx-auto font-body text-on-surface pb-32 print:hidden">

      {/* Botão Voltar */}
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-secondary font-semibold text-sm hover:opacity-80 transition-opacity">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Voltar ao Painel
        </Link>
      </div>

      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight font-headline">Novo Orçamento</h1>
        <p className="text-on-surface-variant text-sm mt-2">Adicione um ou mais ambientes e gere um PDF profissional.</p>
      </div>

      <form onSubmit={handleCalculate} className="space-y-6">

        {/* Nome da Obra + Dados do Cliente */}
        <div className="bg-surface-container-low rounded-2xl p-1 md:p-2 border border-outline-variant/10 shadow-sm">
          <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-container/20 rounded-lg text-primary">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>home_work</span>
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">Identificação da Obra</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">Dê um nome à obra para a acompanhar no dashboard</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-on-surface" htmlFor="obraName">
                Nome da Obra <span className="text-error">*</span>
              </label>
              <input id="obraName" type="text" placeholder="Ex: Reforma Apartamento Centro" value={obraName}
                onChange={(e) => setObraName(e.target.value)}
                className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant focus:ring-2 focus:ring-primary-container rounded-xl p-4 text-on-surface font-medium transition-all placeholder:text-outline-variant/60 outline-none" />
            </div>

            <div className="border-t border-outline-variant/20 pt-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                <p className="text-sm font-bold text-on-surface">Dados do Cliente</p>
                <span className="text-[11px] text-on-surface-variant ml-1">— opcional</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-on-surface" htmlFor="clientName">Nome</label>
                <input id="clientName" type="text" placeholder="Ex: João Silva" value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant focus:ring-2 focus:ring-secondary-container rounded-xl p-4 text-on-surface font-medium transition-all placeholder:text-outline-variant/60 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-on-surface" htmlFor="clientPhone">Telefone</label>
                <input id="clientPhone" type="tel" placeholder="(11) 99999-9999" value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant focus:ring-2 focus:ring-secondary-container rounded-xl p-4 text-on-surface font-medium transition-all placeholder:text-outline-variant/60 outline-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-on-surface" htmlFor="clientAddress">Endereço da Obra</label>
              <input id="clientAddress" type="text" placeholder="Ex: Rua das Flores, 123 — São Paulo, SP" value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant focus:ring-2 focus:ring-secondary-container rounded-xl p-4 text-on-surface font-medium transition-all placeholder:text-outline-variant/60 outline-none" />
            </div>
          </div>
        </div>

        {/* Ambientes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline font-bold text-on-surface text-base">Ambientes</h2>
            <span className="text-xs text-on-surface-variant font-medium">{environments.length} {environments.length === 1 ? "ambiente" : "ambientes"}</span>
          </div>

          {environments.map((env, index) => (
            <div key={env.id} className="bg-surface-container-low rounded-2xl p-1 md:p-2 border border-outline-variant/10 shadow-sm">
              <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 space-y-6">

                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary text-xs font-bold flex items-center justify-center">{index + 1}</span>
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      {{ piso: "layers", revestimento: "wall", pintura: "format_paint", demolicao: "construction" }[env.serviceType]}
                    </span>
                    <span className="text-sm font-bold text-on-surface capitalize">
                      {{ piso: "Piso", revestimento: "Revestimento", pintura: "Pintura", demolicao: "Demolição" }[env.serviceType]}
                    </span>
                  </div>
                  {environments.length > 1 && (
                    <button type="button" onClick={() => removeEnvironment(env.id)}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors">
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  )}
                </div>

                {/* Seletor de Serviço */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-on-surface">Tipo de Serviço</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "piso",         label: "Piso",        icon: "layers" },
                      { value: "revestimento", label: "Revestimento", icon: "wall" },
                      { value: "pintura",      label: "Pintura",      icon: "format_paint" },
                      { value: "demolicao",    label: "Demolição",    icon: "construction" },
                    ].map((opt) => (
                      <button key={opt.value} type="button"
                        onClick={() => updateEnv(env.id, { serviceType: opt.value as ServiceType })}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-bold text-sm ${env.serviceType === opt.value ? "border-primary-container bg-surface-container-low text-primary" : "border-transparent bg-surface-container-low/50 text-on-surface-variant hover:border-surface-variant"}`}>
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: env.serviceType === opt.value ? "'FILL' 1" : "'FILL' 0" }}>{opt.icon}</span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Área + Ambiente — sempre visíveis */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-on-surface">Área Total</label>
                    <div className="relative">
                      <input type="number" min="1" required placeholder="0.00"
                        value={env.area} onChange={(e) => updateEnv(env.id, { area: e.target.value })}
                        className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant focus:ring-2 focus:ring-secondary-container rounded-xl p-4 pr-14 text-lg font-semibold text-on-surface transition-all placeholder:text-outline-variant/60 outline-none" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm bg-surface-container px-2 py-1 rounded-md pointer-events-none">m²</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-on-surface">Ambiente</label>
                    <div className="relative">
                      <select value={env.environment} onChange={(e) => updateEnv(env.id, { environment: e.target.value })}
                        className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant focus:ring-2 focus:ring-secondary-container rounded-xl p-4 appearance-none text-on-surface font-medium outline-none cursor-pointer h-[58px]">
                        {ENV_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-sm">expand_more</span>
                    </div>
                  </div>
                </div>

                {/* Campos de Piso / Revestimento de Parede */}
                {(env.serviceType === "piso" || env.serviceType === "revestimento") && (<>
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-on-surface">Tipo de Revestimento</label>
                    <div className="grid grid-cols-3 gap-3">
                      {FLOOR_OPTIONS.map((opt) => (
                        <button key={opt.value} type="button" onClick={() => updateEnv(env.id, { floorType: opt.value })}
                          className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${env.floorType === opt.value ? "border-primary-container bg-surface-container-low text-primary" : "border-transparent bg-surface-container-low/50 text-on-surface-variant hover:border-surface-variant"}`}>
                          <span className="material-symbols-outlined mb-2" style={{ fontVariationSettings: env.floorType === opt.value ? "'FILL' 1" : "'FILL' 0" }}>{opt.icon}</span>
                          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-center">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-secondary-container/20 rounded-lg text-secondary">
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>delete_sweep</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">
                          {env.serviceType === "revestimento" ? "Remover Revestimento Antigo" : "Remover Piso Antigo"}
                        </p>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">Inclui demolição e descarte (+30%)</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={env.removeOldFloor}
                        onChange={(e) => updateEnv(env.id, { removeOldFloor: e.target.checked })} />
                      <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                    </label>
                  </div>
                </>)}

                {/* Campos de Pintura */}
                {env.serviceType === "pintura" && (<>
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-on-surface">Tipo de Tinta</label>
                    <div className="grid grid-cols-3 gap-3">
                      {PAINT_OPTIONS.map((opt) => (
                        <button key={opt.value} type="button" onClick={() => updateEnv(env.id, { paintType: opt.value })}
                          className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${env.paintType === opt.value ? "border-primary-container bg-surface-container-low text-primary" : "border-transparent bg-surface-container-low/50 text-on-surface-variant hover:border-surface-variant"}`}>
                          <span className="material-symbols-outlined mb-2" style={{ fontVariationSettings: env.paintType === opt.value ? "'FILL' 1" : "'FILL' 0" }}>{opt.icon}</span>
                          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-center">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-on-surface">Número de Demãos</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 2, 3].map((n) => (
                        <button key={n} type="button" onClick={() => updateEnv(env.id, { coats: n })}
                          className={`py-3 rounded-xl border-2 font-headline font-bold transition-all ${env.coats === n ? "border-primary-container bg-surface-container-low text-primary" : "border-transparent bg-surface-container-low/50 text-on-surface-variant hover:border-surface-variant"}`}>
                          {n} {n === 1 ? "demão" : "demãos"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { key: "includeMassaCorrida" as const, label: "Massa Corrida", sub: "0,5 kg/m²", icon: "texture" },
                      { key: "includeFundo" as const, label: "Fundo Preparador", sub: "Melhora aderência", icon: "layers_clear" },
                    ].map((toggle) => (
                      <div key={toggle.key} className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-secondary-container/20 rounded-lg text-secondary">
                            <span className="material-symbols-outlined text-[20px]">{toggle.icon}</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-on-surface">{toggle.label}</p>
                            <p className="text-[11px] text-on-surface-variant mt-0.5">{toggle.sub}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={env[toggle.key] as boolean}
                            onChange={(e) => updateEnv(env.id, { [toggle.key]: e.target.checked })} />
                          <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </>)}

                {/* Campos de Demolição */}
                {env.serviceType === "demolicao" && (<>
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-on-surface">Tipo de Demolição</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: "manual",   label: "Manual",   icon: "hardware",     sub: "Ferramentas manuais" },
                        { value: "mecanica", label: "Mecânica", icon: "precision_manufacturing", sub: "Equipamento pesado" },
                      ].map((opt) => (
                        <button key={opt.value} type="button" onClick={() => updateEnv(env.id, { demolitionType: opt.value })}
                          className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${env.demolitionType === opt.value ? "border-primary-container bg-surface-container-low text-primary" : "border-transparent bg-surface-container-low/50 text-on-surface-variant hover:border-surface-variant"}`}>
                          <span className="material-symbols-outlined mb-1 text-[22px]" style={{ fontVariationSettings: env.demolitionType === opt.value ? "'FILL' 1" : "'FILL' 0" }}>{opt.icon}</span>
                          <span className="text-xs font-bold">{opt.label}</span>
                          <span className="text-[10px] text-on-surface-variant mt-0.5">{opt.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-secondary-container/20 rounded-lg text-secondary">
                        <span className="material-symbols-outlined text-[20px]">delete_forever</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">Retirada de Entulho</p>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">Inclui transporte e descarte (+25%)</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={env.includeDisposal}
                        onChange={(e) => updateEnv(env.id, { includeDisposal: e.target.checked })} />
                      <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                    </label>
                  </div>
                </>)}

                {/* Resultado inline do ambiente (após calcular) */}
                {env.result && (
                  <div className="mt-2 pt-4 border-t border-outline-variant/20 space-y-3">
                    <div className={`grid gap-3 ${isDemolitionResult(env.result) ? "grid-cols-2" : "grid-cols-3"}`}>
                      <div className="text-center p-3 bg-surface-container-low rounded-xl">
                        <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Mão de Obra</p>
                        <p className="text-sm font-headline font-extrabold text-on-surface">{fmt(env.result.labor_cost)}</p>
                      </div>
                      {!isDemolitionResult(env.result) && (
                        <div className="text-center p-3 bg-surface-container-low rounded-xl">
                          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Material</p>
                          <p className="text-sm font-headline font-extrabold text-on-surface">{fmt((env.result as any).material_cost)}</p>
                        </div>
                      )}
                      <div className="text-center p-3 bg-primary-container/20 rounded-xl">
                        <p className="text-[10px] uppercase tracking-wider text-primary font-bold mb-1">Total</p>
                        <p className="text-sm font-headline font-extrabold text-primary">{fmt(env.result.total_cost)}</p>
                      </div>
                    </div>
                    {isPaintResult(env.result) && (
                      <div className="flex gap-3 text-xs text-on-surface-variant">
                        <span className="bg-surface-container px-2 py-1 rounded-lg font-medium">{env.result.paint_materials.paint_liters.toFixed(1)} L tinta</span>
                        {env.result.paint_materials.massa_corrida_kg > 0 && <span className="bg-surface-container px-2 py-1 rounded-lg font-medium">{env.result.paint_materials.massa_corrida_kg.toFixed(1)} kg massa corrida</span>}
                        {env.result.paint_materials.fundo_liters > 0 && <span className="bg-surface-container px-2 py-1 rounded-lg font-medium">{env.result.paint_materials.fundo_liters.toFixed(1)} L fundo</span>}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          ))}

          {/* Botão Adicionar Ambiente */}
          <button type="button" onClick={addEnvironment}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-outline-variant/40 text-on-surface-variant font-headline font-bold text-sm hover:border-primary-container hover:text-primary hover:bg-surface-container-low/50 transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">add</span>
            Adicionar Ambiente
          </button>
        </div>

        {/* Info box */}
        <div className="bg-surface-container-highest/50 rounded-2xl p-5 flex items-start gap-4 border border-outline-variant/20">
          <span className="material-symbols-outlined text-primary-container mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
          <p className="text-sm text-on-secondary-container leading-relaxed">
            Os valores utilizam a sua <Link href="/settings" className="underline font-bold">Tabela de Preços</Link>. Material inclui <strong>10% de margem de quebra</strong>.
          </p>
        </div>

        {/* Botão Calcular */}
        <button type="submit" disabled={loading}
          className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-4 rounded-xl font-headline font-bold text-lg shadow-lg shadow-primary-container/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
          {loading
            ? <><div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> A calcular...</>
            : <><span className="material-symbols-outlined">calculate</span> Calcular {isMulti ? "Todos os Ambientes" : "Orçamento"}</>
          }
        </button>

      </form>

      {/* Botão Guardar Obra */}
      {hasResults && (
        <div className="mt-4 space-y-3">
          {saveError && (
            <div className="flex items-center gap-2 p-4 bg-error-container/20 text-error rounded-xl text-sm font-medium">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {saveError}
            </div>
          )}
          <button
            onClick={handleSaveObra}
            disabled={saving}
            className="w-full bg-surface-container-highest border-2 border-primary text-primary py-4 rounded-xl font-headline font-bold text-lg hover:bg-primary hover:text-on-primary active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {saving
              ? <><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div> A guardar...</>
              : <><span className="material-symbols-outlined">save</span> Guardar Obra no Dashboard</>
            }
          </button>
        </div>
      )}

      {/* Resumo Total (múltiplos ambientes) */}
      {hasResults && (
        <div className="mt-10 space-y-4">
          {isMulti && (
            <div className="rounded-2xl overflow-hidden border border-outline-variant/20 bg-white shadow-xl shadow-on-surface/5">
              <div className="p-6 bg-surface-container-low border-b border-outline-variant/10">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-1">Resumo da Obra</h2>
                <p className="font-headline font-extrabold text-4xl text-on-surface">{fmt(totalCost)}</p>
                <p className="text-sm text-on-surface-variant mt-1">Custo total estimado</p>
              </div>
              <div className="grid grid-cols-3 divide-x divide-outline-variant/20">
                <div className="p-5 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Mão de Obra</p>
                  <p className="text-lg font-headline font-extrabold text-on-surface">{fmt(totalLabor)}</p>
                </div>
                <div className="p-5 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Material</p>
                  <p className="text-lg font-headline font-extrabold text-on-surface">{fmt(totalMaterial)}</p>
                </div>
                <div className="p-5 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Prazo</p>
                  <p className="text-lg font-headline font-extrabold text-on-surface">{totalDays} dias</p>
                </div>
              </div>
            </div>
          )}

          {/* Resultado único (1 ambiente) */}
          {!isMulti && environments[0].result && (
            <div className="rounded-2xl overflow-hidden border border-outline-variant/20 bg-white shadow-xl shadow-on-surface/5">
              <div className="p-6 md:p-8 bg-surface-container-low border-b border-outline-variant/10">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2">Cálculo Finalizado</h2>
                <div className="font-headline font-extrabold text-4xl text-on-surface">{fmt(environments[0].result.total_cost)}</div>
                <div className="text-sm text-on-surface-variant mt-1 font-medium">Custo total estimado</div>
                <div className={`grid gap-4 mt-6 pt-6 border-t border-outline-variant/20 ${isDemolitionResult(environments[0].result) ? "grid-cols-1" : "grid-cols-2"}`}>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Mão de Obra</p>
                    <p className="font-semibold text-on-surface">{fmt(environments[0].result.labor_cost)}</p>
                  </div>
                  {!isDemolitionResult(environments[0].result) && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Material</p>
                      <p className="font-semibold text-on-surface">{fmt((environments[0].result as any).material_cost)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Materiais */}
              <div className="p-6 md:p-8">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant border-b border-outline-variant/20 pb-2 mb-6">Lista de Materiais</h3>
                {isFloorResult(environments[0].result) && (
                  <div className="grid grid-cols-3 gap-6">
                    {[
                      { icon: "layers", label: "Revestimento", value: `${environments[0].result.materials.floor_m2.toFixed(1)} m²`, sub: "+10% quebra" },
                      { icon: "view_in_ar", label: "Argamassa", value: `${environments[0].result.materials.mortar_bags} sacos`, sub: "AC II / AC III" },
                      { icon: "water_drop", label: "Rejunte", value: `${environments[0].result.materials.grout_kg} kg`, sub: "Estimativa padrão" },
                    ].map((mat) => (
                      <div key={mat.label} className="space-y-1">
                        <div className="flex items-center gap-2 text-on-surface-variant mb-2">
                          <span className="material-symbols-outlined text-lg">{mat.icon}</span>
                          <span className="text-xs font-bold uppercase tracking-wider">{mat.label}</span>
                        </div>
                        <div className="text-2xl font-headline font-extrabold text-on-surface">{mat.value}</div>
                        <div className="text-[10px] text-on-surface-variant uppercase tracking-wide">{mat.sub}</div>
                      </div>
                    ))}
                  </div>
                )}
                {isPaintResult(environments[0].result) && (
                  <div className="grid grid-cols-3 gap-6">
                    {[
                      { icon: "format_paint", label: "Tinta", value: `${environments[0].result.paint_materials.paint_liters.toFixed(1)} L`, sub: `${environments[0].coats} demão(s)` },
                      ...(environments[0].result.paint_materials.massa_corrida_kg > 0 ? [{ icon: "texture", label: "Massa Corrida", value: `${environments[0].result.paint_materials.massa_corrida_kg.toFixed(1)} kg`, sub: "0,5 kg/m²" }] : []),
                      ...(environments[0].result.paint_materials.fundo_liters > 0 ? [{ icon: "layers_clear", label: "Fundo Preparador", value: `${environments[0].result.paint_materials.fundo_liters.toFixed(1)} L`, sub: "10 m²/L" }] : []),
                    ].map((mat) => (
                      <div key={mat.label} className="space-y-1">
                        <div className="flex items-center gap-2 text-on-surface-variant mb-2">
                          <span className="material-symbols-outlined text-lg">{mat.icon}</span>
                          <span className="text-xs font-bold uppercase tracking-wider">{mat.label}</span>
                        </div>
                        <div className="text-2xl font-headline font-extrabold text-on-surface">{mat.value}</div>
                        <div className="text-[10px] text-on-surface-variant uppercase tracking-wide">{mat.sub}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-6 pb-2 text-xs text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">schedule</span>
                {environments[0].result.estimated_days} {environments[0].result.estimated_days === 1 ? "dia estimado" : "dias estimados"}
              </div>
            </div>
          )}

          {/* Botão PDF */}
          <button onClick={() => window.print()}
            className="w-full bg-primary text-on-primary py-4 rounded-xl font-headline font-bold text-base hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>picture_as_pdf</span>
            Exportar Orçamento (PDF)
          </button>
        </div>
      )}

    </div>

    {/* Componente PDF — oculto na tela, visível apenas na impressão */}
    {hasResults && (
      <OrcamentoPDF
        environments={environments}
        clientName={clientName}
        clientPhone={clientPhone}
        clientAddress={clientAddress}
        totalLabor={totalLabor}
        totalMaterial={totalMaterial}
        totalCost={totalCost}
        totalDays={totalDays}
      />
    )}
    </>
  )
}
