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

  // Função simples para abrir a janela de impressão/PDF do navegador
  function handlePrint() {
    window.print()
  }

  return (
    <div className="max-w-xl mx-auto mt-10 w-full px-4">
      
      {/* Escondemos o botão de voltar na hora de imprimir o PDF (print:hidden) */}
      <div className="mb-6 print:hidden">
        <Link href="/dashboard" className="text-gray-600 hover:text-black font-semibold">
          &larr; Voltar ao Painel
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 print:hidden" /* Escondemos o formulário no PDF */
      >
        <select
          value={floorType}
          onChange={(e) => setFloorType(e.target.value)}
          className="border p-3 rounded bg-white"
        >
          <option value="porcelanato">Porcelanato</option>
          <option value="ceramica">Cerâmica</option>
          <option value="vinilico">Vinílico</option>
        </select>

        <input
          type="number"
          placeholder="Área em m²"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="border p-3 rounded"
          min="1"
          required
        />

        <label className="flex items-center gap-2 p-2 cursor-pointer">
          <input
            type="checkbox"
            checked={removeOldFloor}
            onChange={(e) => setRemoveOldFloor(e.target.checked)}
            className="w-5 h-5 cursor-pointer"
          />
          Remover piso antigo
        </label>

        <select
          value={environment}
          onChange={(e) => setEnvironment(e.target.value)}
          className="border p-3 rounded bg-white"
        >
          <option value="sala">Sala</option>
          <option value="cozinha">Cozinha</option>
          <option value="banheiro">Casa de Banho / Banheiro</option>
          <option value="externo">Área Externa</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white p-4 rounded font-bold hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "A calcular..." : "Calcular Obra"}
        </button>
      </form>

      {result && (
        <div className="mt-10 rounded-lg border p-8 shadow-sm bg-white print:border-none print:shadow-none print:p-0">

          {/* Cabeçalho que só aparece bonito no PDF ou no ecrã de resultado */}
          <div className="mb-8 border-b pb-4">
            <h2 className="text-2xl font-bold uppercase tracking-tight">ObraPro</h2>
            <p className="text-gray-500">Orçamento Estimativo - Instalação de {floorType}</p>
          </div>

          <div className="space-y-4 text-lg">
            <p className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-600">💰 Mão de obra (Total)</span>
              <span className="font-bold text-green-600">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(result.labor_cost)}
              </span>
            </p>

            <p className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-600">📦 Piso necessário (c/ 10% quebra)</span>
              <span className="font-semibold">{result.materials.floor_m2.toFixed(2)} m²</span>
            </p>

            <p className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-600">📦 Argamassa estimada</span>
              <span className="font-semibold">{result.materials.mortar_bags} sacos</span>
            </p>

            <p className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-600">📦 Rejunte estimado</span>
              <span className="font-semibold">{result.materials.grout_kg} kg</span>
            </p>

            <p className="flex justify-between pb-2">
              <span className="text-gray-600">⏱ Tempo estimado de serviço</span>
              <span className="font-semibold">{result.estimated_days} {result.estimated_days === 1 ? 'dia' : 'dias'}</span>
            </p>
          </div>

          {/* Botão de gerar PDF (escondido na hora da impressão) */}
          <button
            onClick={handlePrint}
            className="mt-8 w-full bg-green-600 text-white p-4 rounded font-bold hover:bg-green-700 print:hidden"
          >
            📄 Guardar como PDF / Imprimir
          </button>

        </div>
      )}

    </div>
  )
}