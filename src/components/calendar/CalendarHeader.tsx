import { useRef, useState } from 'react'
import { useDrag } from 'react-dnd'
import { format, setHours, setMinutes, addMinutes } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Clock, GripVertical, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '../ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover'
import type { TodoWithCategory, CalendarEventWithTodo } from '../../types'

interface UnassignedTodoCardProps {
  todo: TodoWithCategory
  selectedDate: Date
  onQuickAssign: (todoId: string, start: Date, end: Date) => void
}

function UnassignedTodoCard({ todo, selectedDate, onQuickAssign }: UnassignedTodoCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  const [{ isDragging }, drag] = useDrag({
    type: 'TODO_CARD',
    item: { todo },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const quickTimeOptions = [
    { label: '09:00', hour: 9, minute: 0 },
    { label: '10:00', hour: 10, minute: 0 },
    { label: '11:00', hour: 11, minute: 0 },
    { label: '13:00', hour: 13, minute: 0 },
    { label: '14:00', hour: 14, minute: 0 },
    { label: '15:00', hour: 15, minute: 0 },
    { label: '16:00', hour: 16, minute: 0 },
    { label: '17:00', hour: 17, minute: 0 },
  ]

  const handleQuickAssign = (hour: number, minute: number) => {
    const start = setMinutes(setHours(selectedDate, hour), minute)
    const end = addMinutes(start, todo.estimated_duration)
    onQuickAssign(todo.id, start, end)
    setIsOpen(false)
  }

  return (
    <div
      ref={drag}
      className={`flex-shrink-0 w-40 rounded-lg border border-border bg-card p-2 cursor-grab transition-all hover:shadow-md ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
      style={{
        borderLeftWidth: '3px',
        borderLeftColor: todo.category?.color || '#6366f1',
      }}
    >
      <div className="flex items-start gap-1.5">
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{todo.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {todo.estimated_duration}분
            </span>
            {todo.category && (
              <span className="text-xs text-muted-foreground truncate">
                {todo.category.icon}
              </span>
            )}
          </div>
        </div>
      </div>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-1.5 h-6 text-xs text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3 w-3 mr-1" />
            시간 지정
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="grid grid-cols-4 gap-1">
            {quickTimeOptions.map((opt) => (
              <Button
                key={opt.label}
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => handleQuickAssign(opt.hour, opt.minute)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

interface CalendarHeaderProps {
  selectedDate: Date
  todos: TodoWithCategory[]
  events: CalendarEventWithTodo[]
  onQuickAssign: (todoId: string, start: Date, end: Date, color?: string) => void
  onDateChange: (date: Date) => void
}

export function CalendarHeader({
  selectedDate,
  todos,
  events,
  onQuickAssign,
  onDateChange,
}: CalendarHeaderProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Filter todos: incomplete and not assigned to the selected date
  const assignedTodoIds = new Set(
    events
      .filter((e) => {
        const eventDate = new Date(e.start_time)
        return (
          eventDate.getFullYear() === selectedDate.getFullYear() &&
          eventDate.getMonth() === selectedDate.getMonth() &&
          eventDate.getDate() === selectedDate.getDate()
        )
      })
      .map((e) => e.todo_id)
  )

  const unassignedTodos = todos.filter(
    (todo) => !todo.is_completed && !assignedTodoIds.has(todo.id)
  )

  const handleQuickAssign = (todoId: string, start: Date, end: Date) => {
    const todo = todos.find((t) => t.id === todoId)
    onQuickAssign(todoId, start, end, todo?.category?.color)
  }

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  const goToPrevDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 1)
    onDateChange(newDate)
  }

  const goToNextDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 1)
    onDateChange(newDate)
  }

  const goToToday = () => {
    onDateChange(new Date())
  }

  return (
    <div className="border-b border-border bg-card/50 px-4 py-3">
      {/* Date navigation */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={goToPrevDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-7 px-3 text-sm" onClick={goToToday}>
            오늘
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={goToNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium ml-2">
            {format(selectedDate, 'M월 d일 (EEEE)', { locale: ko })}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          미배정 {unassignedTodos.length}개
        </span>
      </div>

      {/* Unassigned todos */}
      {unassignedTodos.length > 0 ? (
        <div className="relative">
          {/* Scroll buttons */}
          {unassignedTodos.length > 3 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-background/80 backdrop-blur-sm shadow-sm"
                onClick={scrollLeft}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-background/80 backdrop-blur-sm shadow-sm"
                onClick={scrollRight}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Scrollable container */}
          <div
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide px-1 py-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {unassignedTodos.map((todo) => (
              <UnassignedTodoCard
                key={todo.id}
                todo={todo}
                selectedDate={selectedDate}
                onQuickAssign={handleQuickAssign}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-3 text-sm text-muted-foreground">
          모든 할 일이 배정되었습니다
        </div>
      )}
    </div>
  )
}
