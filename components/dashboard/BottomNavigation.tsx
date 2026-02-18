import { LucideIcon, Home, Clock, Dumbbell, User } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NavigationItemProps {
  icon: LucideIcon
  label: string
  isActive?: boolean
  onClick?: () => void
}

export function NavigationItem({ icon: Icon, label, isActive = false, onClick }: NavigationItemProps) {
  return (
    <Button 
      variant="ghost" 
      className={`nav-item flex-col space-y-1 py-3 px-4 ${isActive ? 'active text-[#E53935]' : 'text-[#9E9E9E] hover:text-white'}`}
      onClick={onClick}
    >
      <Icon className="w-6 h-6" />
      <span className="text-xs">{label}</span>
    </Button>
  )
}

interface BottomNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <nav className="bottom-nav">
      <div className="flex justify-around py-2">
        <NavigationItem
          icon={Home}
          label="Home"
          isActive={activeTab === "home"}
          onClick={() => onTabChange("home")}
        />
        
        <NavigationItem
          icon={Clock}
          label="History"
          isActive={activeTab === "history"}
          onClick={() => onTabChange("history")}
        />
        
        <NavigationItem
          icon={Dumbbell}
          label="Exercises"
          isActive={activeTab === "exercises"}
          onClick={() => onTabChange("exercises")}
        />
        
        <NavigationItem
          icon={User}
          label="Profile"
          isActive={activeTab === "profile"}
          onClick={() => onTabChange("profile")}
        />
      </div>
    </nav>
  )
}
