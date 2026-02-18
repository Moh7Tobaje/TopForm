import { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ExerciseCardProps {
  name: string
  icon: LucideIcon
  color: string
  onClick?: () => void
}

export function ExerciseCard({ name, icon: Icon, color, onClick }: ExerciseCardProps) {
  return (
    <Card 
      className="min-w-[140px] glass-card card-hover exercise-card cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4 text-center">
        <div 
          className="exercise-icon w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <p className="text-white text-sm font-medium">{name}</p>
      </CardContent>
    </Card>
  )
}
