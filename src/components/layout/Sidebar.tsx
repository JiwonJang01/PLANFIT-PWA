import { useState } from 'react'
import { Calendar, CalendarDays, CalendarRange, CalendarClock, Repeat, Plus, Pencil, Settings } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { useCategories } from '../../hooks/useCategories'
import { CategoryModal } from '../category/CategoryModal'
import type { Category } from '../../types'

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
  const { data: categories } = useCategories()
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setCategoryModalOpen(true)
  }

  const handleAddCategory = () => {
    setEditingCategory(null)
    setCategoryModalOpen(true)
  }

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

          <Separator className="my-3" />

          <div className="flex items-center justify-between px-3 py-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              카테고리
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleAddCategory}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-1">
            {categories?.map((category) => (
              <div
                key={category.id}
                className="group flex items-center justify-between px-3 py-1.5 rounded-md hover:bg-sidebar-accent transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{category.icon}</span>
                  <span
                    className="text-sm"
                    style={{ color: category.color }}
                  >
                    {category.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleEditCategory(category)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </div>
            ))}

            {(!categories || categories.length === 0) && (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                카테고리가 없습니다
              </p>
            )}
          </div>
        </nav>

        <CategoryModal
          open={categoryModalOpen}
          onOpenChange={setCategoryModalOpen}
          category={editingCategory}
        />
      </aside>
    </>
  )
}
