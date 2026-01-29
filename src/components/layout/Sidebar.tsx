import { Calendar, CalendarDays, CalendarRange, CalendarClock, Repeat } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'

const navItems = [
  { id: 'today', label: '오늘', icon: Calendar },
  { id: 'daily', label: '일간', icon: CalendarClock },
  { id: 'weekly', label: '주간', icon: CalendarRange },
  { id: 'monthly', label: '월간', icon: CalendarDays },
] as const

interface SidebarProps {
  activeView: string
  onChangeView: (view: string) => void
  open: boolean
  onClose: () => void
}

export function Sidebar({ activeView, onChangeView, open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-64 border-r border-sidebar-border bg-sidebar transition-transform duration-200',
          'lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="flex flex-col gap-1 p-4">
          <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            캘린더
          </p>
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeView === item.id ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start gap-3',
                activeView === item.id && 'bg-sidebar-accent font-medium'
              )}
              onClick={() => {
                onChangeView(item.id)
                onClose()
              }}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          ))}

          <Separator className="my-3" />

          <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            추적
          </p>
          <Button
            variant={activeView === 'habits' ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start gap-3',
              activeView === 'habits' && 'bg-sidebar-accent font-medium'
            )}
            onClick={() => {
              onChangeView('habits')
              onClose()
            }}
          >
            <Repeat className="h-4 w-4" />
            습관
          </Button>
        </nav>
      </aside>
    </>
  )
}
