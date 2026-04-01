"use client"

import { useState } from "react"
import { calculateFloor } from "@/services/api"
import { FloorCalculationResponse } from "@/types/calculate"
import Link from "next/link"

export default function CalculateForm() {
  const [floorType, setFloorType] = useState("porcelanato")
  const [area, setArea] = useState("")
  const [removeOldFloor, setRemoveOldFloor] = useState(false)
  const [environment, setEnvironment] = useState("sala")

  const [result, setResult] = useState<FloorCalculationResponse | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const token = localStorage.getItem("obrapro_token")

    if (!token) {
      alert("Precisas de fazer login para calcular uma obra!")
      setLoading(false)
      return
    }

    try {
      const data = await calculateFloor({
        floor_type: floorType,
        area: Number(area),
        remove_old_floor: removeOldFloor,
        environment: environment
      }, token)

      setResult(data)
    } catch (err) {
      alert("Erro ao calcular obra. A tua sessão pode ter expirado.")
    }

    setLoading(false)
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="w-full max-w-2xl mx-auto font-body text-on-surface pb-32">
      
      {/* Botão Voltar */}
      <div className="mb-6 print:hidden">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-secondary font-semibold text-sm hover:opacity-80 transition-opacity">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Voltar ao Painel
        </Link>
      </div>

      {/* Cabeçalho */}
      <div className="mb-8 print:hidden">
        <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight font-headline">Novo Cálculo</h1>
        <p className="text-on-surface-variant text-sm mt-2">Defina as especificações do projeto para uma estimativa precisa.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 print:hidden">
        
        {/* Bloco Principal do Formulário */}
        <div className="bg-surface-container-low rounded-2xl p-1 md:p-2 border border-outline-variant/10 shadow-sm">
          <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 space-y-8">
            
            {/* Tipo de Piso (Botões Visuais) */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-on-surface tracking-wide">Tipo de Revestimento</label>
              <div className="grid grid-cols-3 gap-3">
                
                <button 
                  type="button"
                  onClick={() => setFloorType("porcelanato")}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${floorType === "porcelanato" ? "border-primary-container bg-surface-container-low text-primary" : "border-transparent bg-surface-container-low/50 text-on-surface-variant hover:border-surface-variant"}`}
                >
                  <span className="material-symbols-outlined mb-2" style={{ fontVariationSettings: floorType === "porcelanato" ? "'FILL' 1" : "'FILL' 0" }}>layers</span>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-center">Porcelanato</span>
                </button>

                <button 
                  type="button"
                  onClick={() => setFloorType("ceramica")}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${floorType === "ceramica" ? "border-primary-container bg-surface-container-low text-primary" : "border-transparent bg-surface-container-low/50 text-on-surface-variant hover:border-surface-variant"}`}
                >
                  <span className="material-symbols-outlined mb-2" style={{ fontVariationSettings: floorType === "ceramica" ? "'FILL' 1" : "'FILL' 0" }}>grid_on</span>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-center">Cerâmica</span>
                </button>

                <button 
                  type="button"
                  onClick={() => setFloorType("vinilico")}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${floorType === "vinilico" ? "border-primary-container bg-surface-container-low text-primary" : "border-transparent bg-surface-container-low/50 text-on-surface-variant hover:border-surface-variant"}`}
                >
                  <span className="material-symbols-outlined mb-2" style={{ fontVariationSettings: floorType === "vinilico" ? "'FILL' 1" : "'FILL' 0" }}>view_quilt</span>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-center">Vinílico</span>
                </button>

              </div>
            </div>

            {/* Área Total */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-on-surface tracking-wide" htmlFor="area">Área Total</label>
              <div className="relative group">
                <input 
                  id="area"
                  type="number"
                  min="1"
                  required
                  placeholder="0.00"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant focus:ring-2 focus:ring-secondary-container rounded-xl p-4 text-lg font-semibold text-on-surface transition-all placeholder:text-outline-variant/60 outline-none" 
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-on-surface-variant font-bold text-sm bg-surface-container px-3 py-1.5 rounded-md pointer-events-none">
                  m²
                </div>
              </div>
            </div>

            {/* Ambiente */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-on-surface tracking-wide">Ambiente</label>
              <div className="relative">
                <select 
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant focus:ring-2 focus:ring-secondary-container rounded-xl p-4 appearance-none text-on-surface font-medium outline-none cursor-pointer"
                >
                  <option value="sala">Sala (Área Seca)</option>
                  <option value="cozinha">Cozinha (Área Húmida)</option>
                  <option value="banheiro">Casa de Banho (Área Molhada)</option>
                  <option value="externo">Exterior (Exposto)</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
              </div>
            </div>

            {/* Remover Piso Antigo (Toggle) */}
            <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary-container/20 rounded-lg text-secondary">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>delete_sweep</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Remover Piso Antigo</p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">Inclui demolição e descarte (+30% labor)</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={removeOldFloor}
                  onChange={(e) => setRemoveOldFloor(e.target.checked)}
                />
                <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
              </label>
            </div>

          </div>
        </div>

        {/* Caixa de Informação */}
        <div className="bg-surface-container-highest/50 rounded-2xl p-5 flex items-start gap-4 border border-outline-variant/20">
          <span className="material-symbols-outlined text-primary-container mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
          <p className="text-sm text-on-secondary-container leading-relaxed">
             As estimativas utilizam os valores configurados na sua <Link href="/settings" className="underline font-bold">Tabela de Preços</Link>. A quantidade de material inclui <strong>10% de margem de quebra</strong>.
          </p>
        </div>

        {/* Botão Calcular */}
        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-4 rounded-xl font-headline font-bold text-lg shadow-lg shadow-primary-container/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <span className="material-symbols-outlined">calculate</span>
          )}
          {loading ? "A calcular precisão..." : "Calcular Orçamento"}
        </button>

      </form>

      {/* Resultados do Cálculo (e área de impressão) */}
      {result && (
        <div className="mt-12 rounded-2xl border border-outline-variant/20 bg-white shadow-xl shadow-on-surface/5 overflow-hidden print:border-none print:shadow-none print:mt-0">
          
          {/* Cabeçalho do Resultado */}
          <div className="bg-surface-container-low p-6 md:p-8 border-b border-outline-variant/10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2">Cálculo Finalizado</h2>
                <div className="font-headline font-extrabold text-4xl text-on-surface tracking-tight">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(result.labor_cost)}
                </div>
                <div className="text-sm text-on-surface-variant mt-1 font-medium">Mão de obra total</div>
              </div>
              <div className="p-3 bg-primary-container text-on-primary rounded-xl print:hidden">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-highest rounded-lg text-xs font-bold text-secondary">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                {result.estimated_days} {result.estimated_days === 1 ? 'dia estimado' : 'dias estimados'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-highest rounded-lg text-xs font-bold text-secondary">
                <span className="material-symbols-outlined text-[14px]">aspect_ratio</span>
                {area} m² área base
              </span>
            </div>
          </div>

          {/* Detalhes dos Materiais */}
          <div className="p-6 md:p-8 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant border-b border-outline-variant/20 pb-2">Lista de Materiais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-on-surface-variant mb-2">
                  <span className="material-symbols-outlined text-lg">layers</span>
                  <span className="text-xs font-bold uppercase tracking-wider">Revestimento</span>
                </div>
                <div className="text-2xl font-headline font-extrabold text-on-surface">{result.materials.floor_m2.toFixed(1)} <span className="text-sm text-on-surface-variant font-medium">m²</span></div>
                <div className="text-[10px] text-on-surface-variant uppercase tracking-wide">Piso + 10% Quebra</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-on-surface-variant mb-2">
                  <span className="material-symbols-outlined text-lg">view_in_ar</span>
                  <span className="text-xs font-bold uppercase tracking-wider">Argamassa</span>
                </div>
                <div className="text-2xl font-headline font-extrabold text-on-surface">{result.materials.mortar_bags} <span className="text-sm text-on-surface-variant font-medium">sacos</span></div>
                <div className="text-[10px] text-on-surface-variant uppercase tracking-wide">Rendimento Base</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-on-surface-variant mb-2">
                  <span className="material-symbols-outlined text-lg">water_drop</span>
                  <span className="text-xs font-bold uppercase tracking-wider">Rejunte</span>
                </div>
                <div className="text-2xl font-headline font-extrabold text-on-surface">{result.materials.grout_kg} <span className="text-sm text-on-surface-variant font-medium">kg</span></div>
                <div className="text-[10px] text-on-surface-variant uppercase tracking-wide">Estimativa Padrão</div>
              </div>
            </div>
          </div>

          {/* Botão de PDF */}
          <div className="p-6 md:p-8 bg-surface-container-lowest border-t border-outline-variant/10 print:hidden">
            <button 
              onClick={handlePrint}
              className="w-full bg-surface-container-highest text-secondary py-4 rounded-xl font-headline font-bold text-base hover:bg-surface-container-high active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">picture_as_pdf</span>
              Exportar Orçamento (PDF)
            </button>
          </div>

        </div>
      )}

    </div>
  )
}