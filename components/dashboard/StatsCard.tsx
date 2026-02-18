import { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color: string
  delay?: number
}

export function StatsCard({ title, value, icon: Icon, color, delay = 0 }: StatsCardProps) {
  return (
    <Card 
      className="glass-card card-hover stats-card fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Icon className="w-8 h-8" style={{ color }} />
          <span className="stats-number text-3xl font-bold text-white">{value}</span>
        </div>
        <p className="text-[#9E9E9E]">{title}</p>
      </CardContent>
    </Card>
  )
}
