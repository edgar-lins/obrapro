import Link from "next/dist/client/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">
        ObraPro
      </h1>

      <p className="mt-4 text-gray-600">
        Calculadora inteligente de obra
      </p>

      <Link 
        href="/calculate" 
        className="mt-6 rounded bg-black px-6 py-3 text-white"
        >
          Calcular Obra
        </Link>
    </main>
  )
}