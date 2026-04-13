"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getPrices, updatePrices } from "@/services/api"

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

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
  })

  useEffect(() => {
    const token = localStorage.getItem("obrapro_token")
    if (!token) {
      router.push("/login")
      return
    }

    async function fetchPrices() {
      try {
        const data = await getPrices(token as string)
        if (data) {
          setPrices({
            porcelain_price: data.porcelain_price,
            ceramic_price: data.ceramic_price,
            vinyl_price: data.vinyl_price,
            other_price: data.other_price,
            porcelain_material_price: data.porcelain_material_price ?? 80,
            ceramic_material_price: data.ceramic_material_price ?? 45,
            vinyl_material_price: data.vinyl_material_price ?? 55,
            other_material_price: data.other_material_price ?? 60,
            acrylic_paint_price: data.acrylic_paint_price ?? 12,
            latex_paint_price: data.latex_paint_price ?? 10,
            enamel_paint_price: data.enamel_paint_price ?? 18,
            paint_material_price: data.paint_material_price ?? 25,
            massa_corrida_price: data.massa_corrida_price ?? 8,
            fundo_price: data.fundo_price ?? 20,
          })
        }
      } catch (err) {
        setMessage({ type: "error", text: "Erro ao carregar os teus preços." })
      } finally {
        setLoading(false)
      }
    }

    fetchPrices()
  }, [router])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: "", text: "" })

    const token = localStorage.getItem("obrapro_token")

    try {
      await updatePrices(prices, token as string)
      setMessage({ type: "success", text: "Preços atualizados com sucesso!" })
    } catch (err) {
      setMessage({ type: "error", text: "Erro ao guardar as alterações." })
    } finally {
      setSaving(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setPrices(prev => ({ ...prev, [name]: Number(value) }))
  }

  function handleDiscard() {
    // Para descartar, recarregamos a página e voltamos a buscar os dados da API
    window.location.reload()
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen pb-32 md:pb-0">
      
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-sm md:shadow-none flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>architecture</span>
          <span className="font-headline font-extrabold text-xl tracking-tight text-on-surface">ObraPro</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link className="font-headline font-bold text-lg tracking-tight text-on-surface-variant hover:bg-surface-container-low transition-colors px-3 py-1 rounded-lg" href="/dashboard">Projetos</Link>
          <Link className="font-headline font-bold text-lg tracking-tight text-on-surface-variant hover:bg-surface-container-low transition-colors px-3 py-1 rounded-lg" href="/calculate">Calcular</Link>
          <Link className="font-headline font-bold text-lg tracking-tight text-primary px-3 py-1 rounded-lg" href="/settings">Preços</Link>
        </nav>

        <div className="flex items-center gap-4">
          <button onClick={() => {
            localStorage.removeItem("obrapro_token")
            router.push("/login")
          }} className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors" title="Sair">logout</button>
          <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden flex items-center justify-center text-primary font-bold">
            OP
          </div>
        </div>
      </header>

      <main className="pt-24 md:pb-32 px-6 max-w-5xl mx-auto">
        <section className="mb-12">
          <h2 className="font-headline font-extrabold text-4xl text-on-surface mb-2">Tabela de Preços</h2>
          <p className="text-on-surface-variant font-body text-lg max-w-2xl">
            Configure a sua base de valores cobrados por metro quadrado (m²). Estes valores serão utilizados por defeito nos próximos orçamentos.
          </p>
        </section>

        {message.text && (
          <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 font-medium ${message.type === 'error' ? 'bg-error-container text-on-error-container' : 'bg-primary-container/20 text-primary-container'}`}>
            <span className="material-symbols-outlined">{message.type === 'error' ? 'error' : 'check_circle'}</span>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Card: Tipos de Piso */}
          <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-container text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>layers</span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-xl text-on-surface">Revestimentos</h3>
                <p className="text-sm text-on-surface-variant font-medium">Defina o valor da instalação por metro quadrado (R$/m²)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface-variant px-1" htmlFor="porcelain">Porcelanato R$/m²</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">R$</span>
                  <input 
                    id="porcelain"
                    name="porcelain_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={prices.porcelain_price}
                    onChange={handleChange}
                    className="w-full bg-surface-container-lowest border-none rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-secondary-container transition-all text-on-surface font-semibold text-lg placeholder:text-outline-variant outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface-variant px-1" htmlFor="ceramic">Cerâmica R$/m²</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">R$</span>
                  <input 
                    id="ceramic"
                    name="ceramic_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={prices.ceramic_price}
                    onChange={handleChange}
                    className="w-full bg-surface-container-lowest border-none rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-secondary-container transition-all text-on-surface font-semibold text-lg placeholder:text-outline-variant outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface-variant px-1" htmlFor="vinyl">Vinílico R$/m²</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">R$</span>
                  <input 
                    id="vinyl"
                    name="vinyl_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={prices.vinyl_price}
                    onChange={handleChange}
                    className="w-full bg-surface-container-lowest border-none rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-secondary-container transition-all text-on-surface font-semibold text-lg placeholder:text-outline-variant outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface-variant px-1" htmlFor="other">Outros R$/m²</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">R$</span>
                  <input 
                    id="other"
                    name="other_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={prices.other_price}
                    onChange={handleChange}
                    className="w-full bg-surface-container-lowest border-none rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-secondary-container transition-all text-on-surface font-semibold text-lg placeholder:text-outline-variant outline-none" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card: Preços de Material */}
          <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-xl text-on-surface">Custo de Material</h3>
                <p className="text-sm text-on-surface-variant font-medium">Preço de compra do material por metro quadrado (R$/m²)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {[
                { label: "Porcelanato R$/m²", name: "porcelain_material_price" },
                { label: "Cerâmica R$/m²", name: "ceramic_material_price" },
                { label: "Vinílico R$/m²", name: "vinyl_material_price" },
                { label: "Outros R$/m²", name: "other_material_price" },
              ].map((field) => (
                <div key={field.name} className="space-y-2">
                  <label className="block text-sm font-semibold text-on-surface-variant px-1">{field.label}</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">R$</span>
                    <input
                      name={field.name}
                      type="number"
                      min="0"
                      step="0.01"
                      value={(prices as any)[field.name]}
                      onChange={handleChange}
                      className="w-full bg-surface-container-lowest border-none rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary-container/50 transition-all text-on-surface font-semibold text-lg placeholder:text-outline-variant outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Mão de Obra — Pintura */}
          <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-secondary-container/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>format_paint</span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-xl text-on-surface">Mão de Obra — Pintura</h3>
                <p className="text-sm text-on-surface-variant font-medium">Valor cobrado por metro quadrado (R$/m²)</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-6">
              {[
                { label: "Tinta Acrílica R$/m²", name: "acrylic_paint_price" },
                { label: "Tinta Látex R$/m²", name: "latex_paint_price" },
                { label: "Tinta Esmalte R$/m²", name: "enamel_paint_price" },
              ].map((field) => (
                <div key={field.name} className="space-y-2">
                  <label className="block text-sm font-semibold text-on-surface-variant px-1">{field.label}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">R$</span>
                    <input name={field.name} type="number" min="0" step="0.01"
                      value={(prices as any)[field.name]} onChange={handleChange}
                      className="w-full bg-surface-container-lowest border-none rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-secondary-container transition-all text-on-surface font-semibold text-lg outline-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Material — Pintura */}
          <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-xl text-on-surface">Material — Pintura</h3>
                <p className="text-sm text-on-surface-variant font-medium">Custo de compra dos materiais de pintura</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-6">
              {[
                { label: "Tinta R$/litro", name: "paint_material_price" },
                { label: "Massa Corrida R$/kg", name: "massa_corrida_price" },
                { label: "Fundo Preparador R$/litro", name: "fundo_price" },
              ].map((field) => (
                <div key={field.name} className="space-y-2">
                  <label className="block text-sm font-semibold text-on-surface-variant px-1">{field.label}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">R$</span>
                    <input name={field.name} type="number" min="0" step="0.01"
                      value={(prices as any)[field.name]} onChange={handleChange}
                      className="w-full bg-surface-container-lowest border-none rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-secondary-container transition-all text-on-surface font-semibold text-lg outline-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Bar (Save / Discard) */}
          <div className="flex flex-col md:flex-row items-center justify-between pt-6 gap-6 pb-8 md:pb-0">
            <div className="flex items-center gap-3 text-on-surface-variant bg-surface-container-highest/50 p-4 rounded-xl border border-outline-variant/10">
              <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
              <p className="text-sm font-medium">As alterações apenas afetarão os novos cálculos. O histórico permanece intacto.</p>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button 
                type="button"
                onClick={handleDiscard}
                className="flex-1 md:flex-none px-8 py-4 rounded-xl font-headline font-bold text-secondary hover:bg-surface-container-high transition-colors"
              >
                Descartar
              </button>
              <button 
                type="submit"
                disabled={saving}
                className="flex-1 md:flex-none px-10 py-4 rounded-xl font-headline font-bold text-on-primary bg-primary-container hover:bg-primary transition-all shadow-lg shadow-primary-container/20 disabled:opacity-50"
              >
                {saving ? "A Guardar..." : "Guardar Preços"}
              </button>
            </div>
          </div>

        </form>
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
        <Link href="/settings" className="flex flex-col items-center justify-center text-primary bg-surface-container-highest rounded-xl px-4 py-1 active:scale-90 transition-transform">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>settings</span>
          <span className="font-headline text-[11px] font-semibold uppercase tracking-wider mt-1">Preços</span>
        </Link>
      </nav>

    </div>
  )
}