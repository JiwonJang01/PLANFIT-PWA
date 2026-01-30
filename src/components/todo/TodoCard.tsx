import { useDrag } from 'react-dnd'
import { Clock, MoreHorizontal, Pencil, Trash2, Calendar, GripVertical, CalendarCheck } from 'lucide-react'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import type { TodoWithCategory } from '../../types'

function formatDeadline(deadline: string): string {
  const now = new Date()
  const d = new Date(deadline)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '오늘'
  if (diffDays === 1) return '내일'
  if (diffDays < 0) return `${Math.abs(diffDays)}일 지남`
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function isOverdue(deadline: string): boolean {
  return new Date(deadline) < new Date()
}

interface TodoCardProps {
  todo: TodoWithCategory
  isAssigned?: boolean
  onToggle: (id: string, is_completed: boolean) => void
  onEdit: (todo: TodoWithCategory) => void
  onDelete: (id: string) => void
}

export function TodoCard({ todo, isAssigned = false, onToggle, onEdit, onDelete }: TodoCardProps) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: 'TODO_CARD',
      item: { todo },
      canDrag: !todo.is_completed,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: (item, monitor) => {
        const didDrop = monitor.didDrop()
        console.log('[TodoCard] Drag ended:', { todoId: todo.id, didDrop })
      },
    }),
    [todo]
  )

  return (
    <div
      ref={drag}
      className={`group flex items-start gap-2 rounded-lg border border-border px-3 py-2.5 transition-all hover:bg-accent/50 ${
        todo.is_completed ? 'opacity-60' : 'cursor-grab active:cursor-grabbing'
      } ${isDragging ? 'opacity-30 scale-95 ring-2 ring-primary' : ''}`}
    >
      {/* Drag handle indicator */}
      {!todo.is_completed && (
        <div className="mt-0.5 opacity-40 group-hover:opacity-70 transition-opacity">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      {/* Checkbox */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onToggle(todo.id, !todo.is_completed)
        }}
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground/40 transition-colors hover:border-primary"
        style={
          todo.is_completed && todo.category?.color
            ? { backgroundColor: todo.category.color, borderColor: todo.category.color }
            : todo.category?.color
              ? { borderColor: todo.category.color }
              : undefined
        }
      >
        {todo.is_completed && (
          <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Content - clickable to edit */}
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          console.log('[TodoCard] Content clicked, opening edit for:', todo.id)
          onEdit(todo)
        }}
        onTouchEnd={(e) => {
          e.stopPropagation()
          console.log('[TodoCard] Content touched, opening edit for:', todo.id)
          onEdit(todo)
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2">
          <span className={`text-sm font-medium truncate ${todo.is_completed ? 'line-through text-muted-foreground' : ''}`}>
            {todo.title}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {isAssigned && (
              <span className="flex items-center text-xs text-primary" title="캘린더에 배정됨">
                <CalendarCheck className="h-3.5 w-3.5" />
              </span>
            )}
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {todo.estimated_duration}분
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(todo)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  수정
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(todo.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-0.5">
          {todo.category && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: todo.category.color }}
              />
              {todo.category.name}
            </span>
          )}
          {todo.deadline && (
            <span
              className={`flex items-center gap-0.5 text-xs ${
                !todo.is_completed && isOverdue(todo.deadline)
                  ? 'text-destructive'
                  : 'text-muted-foreground'
              }`}
            >
              <Calendar className="h-3 w-3" />
              {formatDeadline(todo.deadline)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
