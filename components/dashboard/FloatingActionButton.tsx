import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FloatingActionButtonProps {
  onClick?: () => void
  icon?: React.ReactNode
}

export function FloatingActionButton({ onClick, icon }: FloatingActionButtonProps) {
  return (
    <Button 
      size="lg"
      onClick={onClick}
      className="fab ripple-button"
    >
      {icon || <Plus className="w-6 h-6" />}
    </Button>
  )
}
