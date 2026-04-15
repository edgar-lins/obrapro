"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/icon"

const navItems = [
  { label: "Projetos", href: "/dashboard", icon: "folder_open" },
  { label: "Calcular", href: "/calculate", icon: "calculate" },
  { label: "Preços", href: "/settings", icon: "settings" },
]

export function BottomNavBar() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-surface-container-lowest/80 backdrop-blur-xl border-t border-outline-variant/30 rounded-t-3xl z-50">
      <div className="flex items-center justify-around h-full px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-200",
                isActive ? "text-primary" : "text-on-surface-variant/70"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-16 h-8 rounded-full transition-all duration-200",
                  isActive && "bg-surface-container-highest"
                )}
              >
                <Icon name={item.icon} size={22} filled={isActive} />
              </div>
              <span className={cn("text-xs font-heading font-medium", isActive && "font-semibold")}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
