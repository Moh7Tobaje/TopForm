import { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"

interface AnalysisCardProps {
  exercise: string
  date: string
  score: number
  summary: string
  icon: LucideIcon
  color: string
  onClick?: () => void
}

export function AnalysisCard({ 
  exercise, 
  date, 
  score, 
  summary, 
  icon: Icon, 
  color, 
  onClick 
}: AnalysisCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 85) return "#4CAF50"
    if (score >= 70) return "#FFC107"
    return "#F44336"
  }

  const CircularProgress = ({ value, size = 60, strokeWidth = 4 }: { value: number; size?: number; strokeWidth?: number }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (value / 100) * circumference

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1A1A1A"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getScoreColor(value)}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="circular-progress transition-all duration-1000 ease-out"
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-lg font-bold text-white">{value}</span>
      </div>
    )
  }

  return (
    <Card 
      className="glass-card analysis-card cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon className="w-6 h-6" style={{ color }} />
            </div>
            <div>
              <p className="text-white font-semibold">{exercise}</p>
              <p className="text-[#9E9E9E] text-sm">{date}</p>
              <p className="text-[#9E9E9E] text-sm mt-1">{summary}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <CircularProgress value={score} />
            <ChevronRight className="w-5 h-5 text-[#9E9E9E]" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
