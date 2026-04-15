"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { TopAppBar } from "@/components/top-app-bar"
import { BottomNavBar } from "@/components/bottom-nav-bar"
import { Icon } from "@/components/icon"
import { getPrices, updatePrices } from "@/services/api"
import { cn } from "@/lib/utils"

function PriceField({ label, name, value, unit = "m²", onChange }: {
  label: string
  name: string
  value: number
  unit?: string
  onChange: (name: string, value: number) => void
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-heading font-medium text-on-surface-variant">
        {label} <span className="text-outline">/ {unit}</span>
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-heading font-semibold">R$</span>
        <input
          name={name}
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(e) => onChange(name, Number(e.target.value))}
          className="w-full pl-12 pr-4 py-3.5 bg-surface-container rounded-xl text-on-surface font-heading font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all"
          placeholder="0,00"
        />
      </div>
    </div>
  )
}

function SectionCard({ title, description, icon, iconBg, iconColor, children }: {
  title: string
  description: string
  icon: string
  iconBg: string
  iconColor: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10">
      <div className="flex items-center gap-4 mb-8">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", iconBg)}>
          <Icon name={icon} size={24} className={iconColor} filled />
        </div>
        <div>
          <h3 className="font-heading font-bold text-xl text-on-surface">{title}</h3>
          <p className="text-sm text-on-surface-variant font-medium">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const plan = (typeof window !== "undefined" ? localStorage.getItem("obrapro_plan") : "free") as "free" | "pro"

  const [prices, setPrices] = useState({
    porcelain_price: 100,
    ceramic_price: 70,
    vinyl_price: 60,
    other_price: 80,
    porcelain_material_price: 80,
    ceramic_material_price: 45,
    vinyl_material_price: 55,
    other_material_price: 60,
    acrylic_paint_price: 12,
    latex_paint_price: 10,
    enamel_paint_price: 18,
    paint_material_price: 25,
    massa_corrida_price: 8,
    fundo_price: 20,
    wall_porcelain_price: 130,
    wall_ceramic_price: 90,
    wall_other_price: 100,
    demolition_manual_price: 25,
    demolition_mechanical_price: 40,
  })

  useEffect(() => {
    const token = localStorage.getItem("obrapro_token")
    if (!token) { router.push("/login"); return }

    async function fetchPrices() {
      try {
        const data = await getPrices(token as string)
        if (data) setPrices((prev) => ({ ...prev, ...data }))
      } catch {
        setMessage({ type: "error", text: "Erro ao carregar os preços." })
      } finally {
        setLoading(false)
      }
    }
    fetchPrices()
  }, [router])

  function handleChange(name: string, value: number) {
    setPrices((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: "", text: "" })
    const token = localStorage.getItem("obrapro_token")
    try {
      await updatePrices(prices, token as string)
      setMessage({ type: "success", text: "Preços atualizados com sucesso!" })
    } catch {
      setMessage({ type: "error", text: "Erro ao guardar as alterações." })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="bg-surface font-sans text-on-surface min-h-screen pb-32 md:pb-0">
      <TopAppBar showNav isLoggedIn plan={plan} />

      <main className="pt-20 px-4 md:px-6 max-w-5xl mx-auto">
        <section className="mb-10 pt-4">
          <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-on-surface mb-2">Tabela de Preços</h1>
          <p className="text-on-surface-variant text-lg max-w-2xl">
            Configure os valores cobrados por metro quadrado (m²). Serão usados por defeito nos próximos orçamentos.
          </p>
        </section>

        {message.text && (
          <div className={cn(
            "mb-8 p-4 rounded-xl flex items-center gap-3 font-medium",
            message.type === "error"
              ? "bg-error-container text-on-error-container"
              : "bg-primary-container/20 text-primary"
          )}>
            <Icon name={message.type === "error" ? "error" : "check_circle"} size={20} />
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <SectionCard title="Revestimentos" description="Instalação de piso por m²" icon="layers" iconBg="bg-secondary-container" iconColor="text-on-secondary-container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PriceField label="Porcelanato" name="porcelain_price" value={prices.porcelain_price} onChange={handleChange} />
              <PriceField label="Cerâmica" name="ceramic_price" value={prices.ceramic_price} onChange={handleChange} />
              <PriceField label="Vinílico" name="vinyl_price" value={prices.vinyl_price} onChange={handleChange} />
              <PriceField label="Outros" name="other_price" value={prices.other_price} onChange={handleChange} />
            </div>
          </SectionCard>

          <SectionCard title="Custo de Material" description="Preço de compra do material por m²" icon="storefront" iconBg="bg-primary-container/20" iconColor="text-primary">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PriceField label="Porcelanato" name="porcelain_material_price" value={prices.porcelain_material_price} onChange={handleChange} />
              <PriceField label="Cerâmica" name="ceramic_material_price" value={prices.ceramic_material_price} onChange={handleChange} />
              <PriceField label="Vinílico" name="vinyl_material_price" value={prices.vinyl_material_price} onChange={handleChange} />
              <PriceField label="Outros" name="other_material_price" value={prices.other_material_price} onChange={handleChange} />
            </div>
          </SectionCard>

          <SectionCard title="Mão de Obra — Pintura" description="Valor cobrado por m²" icon="format_paint" iconBg="bg-secondary-container/30" iconColor="text-secondary">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PriceField label="Tinta Acrílica" name="acrylic_paint_price" value={prices.acrylic_paint_price} onChange={handleChange} />
              <PriceField label="Tinta Látex" name="latex_paint_price" value={prices.latex_paint_price} onChange={handleChange} />
              <PriceField label="Tinta Esmalte" name="enamel_paint_price" value={prices.enamel_paint_price} onChange={handleChange} />
            </div>
          </SectionCard>

          <SectionCard title="Material — Pintura" description="Custo de compra dos materiais" icon="water_drop" iconBg="bg-primary-container/20" iconColor="text-primary">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PriceField label="Tinta" name="paint_material_price" value={prices.paint_material_price} unit="litro" onChange={handleChange} />
              <PriceField label="Massa Corrida" name="massa_corrida_price" value={prices.massa_corrida_price} unit="kg" onChange={handleChange} />
              <PriceField label="Fundo Preparador" name="fundo_price" value={prices.fundo_price} unit="litro" onChange={handleChange} />
            </div>
          </SectionCard>

          <SectionCard title="Mão de Obra — Revestimento de Parede" description="Valor cobrado por m²" icon="wall" iconBg="bg-secondary-container" iconColor="text-on-secondary-container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PriceField label="Porcelanato" name="wall_porcelain_price" value={prices.wall_porcelain_price} onChange={handleChange} />
              <PriceField label="Cerâmica" name="wall_ceramic_price" value={prices.wall_ceramic_price} onChange={handleChange} />
              <PriceField label="Outros" name="wall_other_price" value={prices.wall_other_price} onChange={handleChange} />
            </div>
          </SectionCard>

          <SectionCard title="Demolição" description="Valor cobrado por m²" icon="construction" iconBg="bg-error-container/30" iconColor="text-error">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PriceField label="Manual" name="demolition_manual_price" value={prices.demolition_manual_price} onChange={handleChange} />
              <PriceField label="Mecânica" name="demolition_mechanical_price" value={prices.demolition_mechanical_price} onChange={handleChange} />
            </div>
          </SectionCard>

          {/* Action Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between pt-4 gap-6 pb-8 md:pb-0">
            <div className="flex items-center gap-3 text-on-surface-variant bg-surface-container-highest/50 p-4 rounded-xl border border-outline-variant/10">
              <Icon name="info" size={20} className="text-primary-container" filled />
              <p className="text-sm font-medium">As alterações apenas afetarão novos cálculos. O histórico permanece intacto.</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 md:flex-none px-8 py-4 rounded-xl font-heading font-bold text-secondary hover:bg-surface-container-high transition-colors"
              >
                Descartar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 md:flex-none px-10 py-4 rounded-xl font-heading font-bold text-on-primary bg-primary-container hover:bg-primary transition-all shadow-lg shadow-primary-container/20 disabled:opacity-50"
              >
                {saving ? "A Guardar..." : "Guardar Preços"}
              </button>
            </div>
          </div>
        </form>
      </main>

      <BottomNavBar />
    </div>
  )
}
