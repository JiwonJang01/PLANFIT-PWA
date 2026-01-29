import { CheckSquare, Calendar, Repeat, Settings } from 'lucide-react'
import { cn } from '../../lib/utils'

const tabs = [
  { id: 'todos', label: '할일', icon: CheckSquare },
  { id: 'today', label: '캘린더', icon: Calendar },
  { id: 'habits', label: '습관', icon: Repeat },
  { id: 'settings', label: '설정', icon: Settings },
] as const

interface MobileNavProps {
  activeTab: string
  onChangeTab: (tab: string) => void
}

export function MobileNav({ activeTab, onChangeTab }: MobileNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background lg:hidden">
      <div className="flex h-14 items-center justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs transition-colors',
              activeTab === tab.id
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
            onClick={() => onChangeTab(tab.id)}
          >
            <tab.icon className="h-5 w-5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
