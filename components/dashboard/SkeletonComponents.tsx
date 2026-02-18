import { Card, CardContent } from "@/components/ui/card"

interface SkeletonCardProps {
  height?: string
  width?: string
  className?: string
}

export function SkeletonCard({ height = "h-24", width = "w-full", className = "" }: SkeletonCardProps) {
  return (
    <Card className={`${width} ${height} ${className}`}>
      <CardContent className="p-4 h-full">
        <div className="skeleton h-full rounded-lg"></div>
      </CardContent>
    </Card>
  )
}

interface SkeletonStatsProps {
  count?: number
}

export function SkeletonStats({ count = 3 }: SkeletonStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} height="h-24" />
      ))}
    </div>
  )
}

interface SkeletonExercisesProps {
  count?: number
}

export function SkeletonExercises({ count = 5 }: SkeletonExercisesProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} width="min-w-[140px]" height="h-32" />
      ))}
    </div>
  )
}

interface SkeletonAnalysesProps {
  count?: number
}

export function SkeletonAnalyses({ count = 3 }: SkeletonAnalysesProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} height="h-20" />
      ))}
    </div>
  )
}
