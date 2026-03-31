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

  if (loading) return <p className="p-8 text-center">A carregar configurações...</p>

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">A Minha Tabela de Preços</h1>
          <Link href="/dashboard" className="text-black font-semibold hover:underline">
            &larr; Voltar ao Painel
          </Link>
        </div>

        <div className="rounded-lg border bg-white p-8 shadow-sm">
          <p className="mb-6 text-gray-600">
            Define aqui o valor que cobras por metro quadrado (m²) para cada tipo de serviço. 
            Estes valores serão usados automaticamente nos teus próximos orçamentos.
          </p>

          {message.text && (
            <div className={`mb-6 rounded p-4 ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSave} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Porcelanato (R$/m²)</label>
                <input
                  type="number"
                  name="porcelain_price"
                  value={prices.porcelain_price}
                  onChange={handleChange}
                  className="w-full rounded border p-2 focus:border-black focus:outline-none"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Cerâmica (R$/m²)</label>
                <input
                  type="number"
                  name="ceramic_price"
                  value={prices.ceramic_price}
                  onChange={handleChange}
                  className="w-full rounded border p-2 focus:border-black focus:outline-none"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Vinílico (R$/m²)</label>
                <input
                  type="number"
                  name="vinyl_price"
                  value={prices.vinyl_price}
                  onChange={handleChange}
                  className="w-full rounded border p-2 focus:border-black focus:outline-none"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Outros (R$/m²)</label>
                <input
                  type="number"
                  name="other_price"
                  value={prices.other_price}
                  onChange={handleChange}
                  className="w-full rounded border p-2 focus:border-black focus:outline-none"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded bg-black px-8 py-3 text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? "A guardar..." : "Guardar Preços"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}