"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getProjects } from "@/services/api"

export default function DashboardPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // 1. Vai buscar a nossa chave mágica
    const token = localStorage.getItem("obrapro_token")
    
    // Se não tiver token, expulsa para o login!
    if (!token) {
      router.push("/login")
      return
    }

    // 2. Vai ao backend buscar os projetos deste utilizador
    async function fetchProjects() {
      try {
        const data = await getProjects(token as string)
        // O backend pode devolver null se não houver projetos, por isso garantimos um array vazio
        setProjects(data || [])
      } catch (err: any) {
        setError("Erro ao carregar orçamentos. A sessão pode ter expirado.")
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

  if (loading) return <p className="p-8 text-center">A carregar o teu painel...</p>

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">O meu Painel</h1>
          <div className="flex gap-4">
            <Link href="/calculate" className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800">
              + Novo Orçamento
            </Link>
            <button onClick={handleLogout} className="rounded border border-red-500 px-4 py-2 text-red-500 hover:bg-red-50">
              Sair
            </button>
          </div>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {projects.length === 0 ? (
          <div className="rounded-lg border bg-white p-8 text-center shadow-sm">
            <p className="text-gray-500 mb-4">Ainda não fizeste nenhum orçamento.</p>
            <Link href="/calculate" className="text-black font-semibold hover:underline">
              Começa agora a calcular a tua primeira obra!
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <div key={project.id} className="rounded-lg border bg-white p-6 shadow-sm">
                <div className="mb-4 flex justify-between items-start">
                  <span className="inline-block rounded bg-gray-200 px-2 py-1 text-xs font-semibold uppercase tracking-wide">
                    {project.floor_type}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(project.created_at).toLocaleDateString("pt-PT")}
                  </span>
                </div>
                <p className="mb-2 text-lg font-medium">Área: {project.area} m² ({project.environment})</p>
                <p className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(project.labor_cost)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}