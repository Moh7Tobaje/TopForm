import { Video, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface EmptyStateProps {
  title?: string
  subtitle?: string
  buttonText?: string
  onButtonClick?: () => void
}

export function EmptyState({ 
  title = "No analyses yet",
  subtitle = "Upload your first video to get started",
  buttonText = "Start Your First Analysis",
  onButtonClick
}: EmptyStateProps) {
  return (
    <Card className="glass-card border-[#2A2A2A] rounded-2xl p-12 text-center">
      <CardContent className="p-0">
        <div className="flex flex-col items-center space-y-6">
          <div className="w-24 h-24 bg-[#E53935]/20 rounded-full flex items-center justify-center">
            <Video className="w-12 h-12 text-[#E53935]" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">{title}</h3>
            <p className="text-[#9E9E9E] text-lg">{subtitle}</p>
          </div>
          
          <Button 
            size="lg"
            onClick={onButtonClick}
            className="bg-[#E53935] hover:bg-[#B71C1C] text-white px-8 py-4 rounded-xl"
          >
            <Upload className="w-5 h-5 mr-2" />
            {buttonText}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
