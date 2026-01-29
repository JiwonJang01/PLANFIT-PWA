import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Trash2 } from 'lucide-react'
import type { BigCalendarEvent } from '../../types'

interface EventBlockProps {
  event: BigCalendarEvent
  onDelete?: (id: string) => void
}

export function EventBlock({ event, onDelete }: EventBlockProps) {
  const todo = event.resource.todo
  const categoryColor = todo?.category?.color ?? event.resource.color ?? '#6366f1'

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(event.id)
  }

  return (
    <div
      className="group h-full w-full overflow-hidden rounded px-1.5 py-0.5 text-white"
      style={{ backgroundColor: categoryColor }}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium leading-tight">
            {event.title}
          </p>
          <p className="text-[10px] opacity-80">
            {format(event.start, 'HH:mm', { locale: ko })} - {format(event.end, 'HH:mm', { locale: ko })}
          </p>
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className="shrink-0 rounded p-0.5 opacity-0 transition-opacity hover:bg-white/20 group-hover:opacity-100"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  )
}
