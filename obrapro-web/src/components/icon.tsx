"use client"

import { cn } from "@/lib/utils"

interface IconProps {
  name: string
  className?: string
  filled?: boolean
  size?: number
}

export function Icon({ name, className, filled = false, size = 24 }: IconProps) {
  return (
    <span
      className={cn("material-symbols-outlined select-none", className)}
      style={{
        fontSize: size,
        fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
      }}
    >
      {name}
    </span>
  )
}
