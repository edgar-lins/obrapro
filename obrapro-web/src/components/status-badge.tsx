import { cn } from "@/lib/utils"

type Status = "orcado" | "em_andamento" | "concluido" | "pendente"

interface StatusBadgeProps {
  status: Status
  className?: string
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  orcado: {
    label: "Orçado",
    className: "bg-secondary-container/40 text-secondary",
  },
  em_andamento: {
    label: "Em Andamento",
    className: "bg-primary-container/30 text-primary",
  },
  concluido: {
    label: "Concluído",
    className: "bg-surface-container-highest text-on-surface-variant",
  },
  pendente: {
    label: "Pendente",
    className: "bg-surface-container text-on-surface-variant",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-heading font-bold uppercase tracking-wide",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
