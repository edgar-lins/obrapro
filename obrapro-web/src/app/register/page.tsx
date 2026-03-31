"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        throw new Error("Erro ao criar conta. O email já pode existir.")
      }

      alert("Conta criada com sucesso! Podes fazer login agora.")
      router.push("/login") // Redireciona para o login
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-3xl font-bold">Criar Conta no ObraPro</h1>
        
        {error && <p className="mb-4 text-sm text-red-500 text-center">{error}</p>}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border p-2 focus:border-black focus:outline-none"
              placeholder="teu@email.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border p-2 focus:border-black focus:outline-none"
              placeholder="******"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded bg-black p-3 text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "A criar conta..." : "Registar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Já tens uma conta?{" "}
          <Link href="/login" className="font-semibold text-black hover:underline">
            Fazer Login
          </Link>
        </p>
      </div>
    </main>
  )
}