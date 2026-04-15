"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/icon"

interface TopAppBarProps {
  showNav?: boolean
  showBackButton?: boolean
  backHref?: string
  title?: string
  plan?: "free" | "pro"
  isLoggedIn?: boolean
}

export function TopAppBar({
  showNav = true,
  showBackButton = false,
  backHref = "/dashboard",
  title,
  plan = "free",
  isLoggedIn = false,
}: TopAppBarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { label: "Projetos", href: "/dashboard" },
    { label: "Calcular", href: "/calculate" },
    { label: "Preços", href: "/settings" },
  ]

  function handleLogout() {
    localStorage.removeItem("obrapro_token")
    localStorage.removeItem("obrapro_plan")
    router.push("/login")
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface-container-lowest/80 backdrop-blur-xl border-b border-outline-variant/30 z-50">
      <div className="max-w-7xl mx-auto h-full px-4 md:px-6 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-3">
          {showBackButton ? (
            <Link
              href={backHref}
              className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <Icon name="arrow_back" size={20} />
              {title && (
                <span className="font-heading font-semibold text-on-surface truncate max-w-[200px]">
                  {title}
                </span>
              )}
            </Link>
          ) : (
            <Link href={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center">
                <Icon name="architecture" size={20} className="text-primary-fixed" />
              </div>
              <span className="font-heading font-bold text-xl text-on-surface">ObraPro</span>
            </Link>
          )}
        </div>

        {/* Center: Desktop Nav (logged in) */}
        {showNav && isLoggedIn && (
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 rounded-xl font-heading font-medium text-sm transition-all duration-200",
                    isActive
                      ? "text-primary bg-primary-fixed/20"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        )}

        {/* Center: Landing nav */}
        {showNav && !isLoggedIn && (
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#funcionalidades" className="text-on-surface-variant hover:text-on-surface font-heading text-sm transition-colors">
              Funcionalidades
            </Link>
            <Link href="#precos" className="text-on-surface-variant hover:text-on-surface font-heading text-sm transition-colors">
              Preços
            </Link>
          </nav>
        )}

        {/* Right */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link
                href="/planos"
                className={cn(
                  "hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-heading font-semibold",
                  plan === "pro"
                    ? "bg-primary-container text-primary-fixed"
                    : "bg-secondary-container/40 text-secondary"
                )}
              >
                {plan === "pro" && <Icon name="workspace_premium" size={14} />}
                {plan === "pro" ? "Pro" : "Free"}
              </Link>
              <button
                onClick={handleLogout}
                className="hidden md:flex p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors"
                title="Sair"
              >
                <Icon name="logout" size={20} />
              </button>
              <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center">
                <span className="text-sm font-heading font-bold text-primary-fixed">OP</span>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden md:block px-4 py-2 text-on-surface-variant hover:text-on-surface font-heading text-sm transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-heading font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Começar Agora
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
