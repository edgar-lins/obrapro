import { TopAppBar } from "@/components/top-app-bar"
import { BottomNavBar } from "@/components/bottom-nav-bar"
import CalculateForm from "@/components/CalculateForm"

export default function CalculatePage() {
  return (
    <div className="min-h-screen bg-surface pb-24 md:pb-8">
      <TopAppBar showBackButton backHref="/dashboard" title="Novo Orçamento" showNav isLoggedIn />
      <main className="pt-20 px-4 md:px-6 max-w-3xl mx-auto">
        <CalculateForm />
      </main>
      <BottomNavBar />
    </div>
  )
}
