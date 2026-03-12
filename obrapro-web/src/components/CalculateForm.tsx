"use client"

import { useState } from "react"
import { calculateFloor } from "@/services/api"
import { FloorCalculationResponse } from "@/types/calculate"

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

    try {
      const data = await calculateFloor({
        floor_type: floorType,
        area: Number(area),
        remove_old_floor: removeOldFloor,
        environment: environment
      })

      setResult(data)
    } catch (err) {
      alert("Erro ao calcular obra")
    }

    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto mt-10">

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >

        <select
          value={floorType}
          onChange={(e) => setFloorType(e.target.value)}
          className="border p-2 rounded"
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
          className="border p-2 rounded"
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={removeOldFloor}
            onChange={(e) => setRemoveOldFloor(e.target.checked)}
          />
          Remover piso antigo
        </label>

        <select
          value={environment}
          onChange={(e) => setEnvironment(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="sala">Sala</option>
          <option value="cozinha">Cozinha</option>
          <option value="banheiro">Banheiro</option>
          <option value="externo">Externo</option>
        </select>

        <button
          type="submit"
          className="bg-black text-white p-3 rounded"
        >
          {loading ? "Calculando..." : "Calcular obra"}
        </button>

      </form>

      {result && (
        <div className="mt-10 border p-6 rounded">

          <h2 className="text-xl font-bold mb-4">
            Resultado
          </h2>

          <p>
            💰 Mão de obra: R$ {result.labor_cost}
          </p>

          <p>
            📦 Piso: {result.materials.floor_m2} m²
          </p>

          <p>
            📦 Argamassa: {result.materials.mortar_bags} sacos
          </p>

          <p>
            📦 Rejunte: {result.materials.grout_kg} kg
          </p>

          <p className="mt-4">
            ⏱ Tempo estimado: {result.estimated_days} dias
          </p>

        </div>
      )}

    </div>
  )
}