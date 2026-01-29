import { useCallback, useState, useRef, useEffect } from 'react'
import { Calendar, Views, type View, type SlotInfo } from 'react-big-calendar'
import withDragAndDrop, { type EventInteractionArgs } from 'react-big-calendar/lib/addons/dragAndDrop'
import { useDrop } from 'react-dnd'
import { addMinutes } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { localizer, messages, formats } from '../../lib/calendar'
import { EventBlock } from './EventBlock'
import {
  useCalendarEvents,
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
  useDeleteCalendarEvent,
} from '../../hooks/useCalendarEvents'
import { useTodos } from '../../hooks/useTodos'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Button } from '../ui/button'
import type { BigCalendarEvent, TodoWithCategory } from '../../types'

import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'

const DnDCalendar = withDragAndDrop<BigCalendarEvent>(Calendar)

interface CalendarViewProps {
  view: string
  onViewChange: (view: string) => void
}

const viewMap: Record<string, View> = {
  today: Views.DAY,
  daily: Views.DAY,
  weekly: Views.WEEK,
  monthly: Views.MONTH,
}

const reverseViewMap: Record<View, string> = {
  [Views.DAY]: 'daily',
  [Views.WEEK]: 'weekly',
  [Views.MONTH]: 'monthly',
  [Views.AGENDA]: 'weekly',
  [Views.WORK_WEEK]: 'weekly',
}

export function CalendarView({ view: activeView, onViewChange }: CalendarViewProps) {
  const [date, setDate] = useState(new Date())
  const [selectSlot, setSelectSlot] = useState<{ start: Date; end: Date } | null>(null)
  const [selectedTodo, setSelectedTodo] = useState<string>('')
  const [selectedEvent, setSelectedEvent] = useState<BigCalendarEvent | null>(null)

  const { data: events, isLoading } = useCalendarEvents()
  const { data: todos } = useTodos()
  const createEvent = useCreateCalendarEvent()
  const updateEvent = useUpdateCalendarEvent()
  const deleteEvent = useDeleteCalendarEvent()

  const view = viewMap[activeView] ?? Views.WEEK

  const handleViewChange = useCallback((newView: View) => {
    onViewChange(reverseViewMap[newView] ?? 'weekly')
  }, [onViewChange])

  // Handle drop from TodoCard
  const containerRef = useRef<HTMLDivElement>(null)
  const [, drop] = useDrop<{ todo: TodoWithCategory }, void, unknown>({
    accept: 'TODO_CARD',
    drop: (item) => {
      // This is a simplified approach - in production you'd calculate the exact time
      // from the mouse position relative to the calendar
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0)
      const end = addMinutes(start, item.todo.estimated_duration)

      createEvent.mutate({
        todo_id: item.todo.id,
        start_time: start,
        end_time: end,
        color: item.todo.category?.color,
      })
    },
  })

  useEffect(() => {
    if (containerRef.current) {
      drop(containerRef.current)
    }
  }, [drop])

  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    setSelectSlot({ start: slotInfo.start, end: slotInfo.end })
    setSelectedTodo('')
  }, [])

  const handleEventDrop = useCallback(
    ({ event, start, end }: EventInteractionArgs<BigCalendarEvent>) => {
      updateEvent.mutate({
        id: event.id,
        start_time: start as Date,
        end_time: end as Date,
      })
    },
    [updateEvent]
  )

  const handleEventResize = useCallback(
    ({ event, start, end }: EventInteractionArgs<BigCalendarEvent>) => {
      console.log('[CalendarView] handleEventResize called:', { eventId: event.id, start, end })
      updateEvent.mutate(
        {
          id: event.id,
          start_time: start as Date,
          end_time: end as Date,
        },
        {
          onSuccess: () => console.log('[CalendarView] Resize update success'),
          onError: (err) => console.error('[CalendarView] Resize update error:', err),
        }
      )
    },
    [updateEvent]
  )

  const handleDeleteEvent = useCallback(
    (id: string) => {
      deleteEvent.mutate(id)
    },
    [deleteEvent]
  )

  const handleSelectEvent = useCallback((event: BigCalendarEvent) => {
    setSelectedEvent(event)
  }, [])

  const handleCreateFromSlot = () => {
    if (!selectSlot || !selectedTodo) return

    const todo = todos?.find((t) => t.id === selectedTodo)
    createEvent.mutate({
      todo_id: selectedTodo,
      start_time: selectSlot.start,
      end_time: selectSlot.end,
      color: todo?.category?.color,
    })
    setSelectSlot(null)
    setSelectedTodo('')
  }

  const eventPropGetter = useCallback((event: BigCalendarEvent) => {
    const color = event.resource.todo?.category?.color ?? event.resource.color ?? '#6366f1'
    return {
      style: {
        backgroundColor: color,
        border: 'none',
        borderRadius: '4px',
      },
    }
  }, [])

  const incompleteTodos = todos?.filter((t) => !t.is_completed) ?? []

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div ref={containerRef} className="h-full calendar-container">
      <DnDCalendar
        localizer={localizer}
        events={events ?? []}
        view={view}
        onView={handleViewChange}
        date={date}
        onNavigate={setDate}
        step={15}
        timeslots={4}
        min={new Date(1970, 0, 1, 0, 0, 0)}
        max={new Date(1970, 0, 1, 23, 59, 59)}
        selectable
        resizable
        draggableAccessor={() => true}
        resizableAccessor={() => true}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        eventPropGetter={eventPropGetter}
        messages={messages}
        formats={formats}
        components={{
          event: ({ event }) => (
            <EventBlock event={event} onDelete={handleDeleteEvent} />
          ),
        }}
        culture="ko"
        className="h-full"
      />

      {/* Slot selection dialog */}
      <Dialog open={!!selectSlot} onOpenChange={() => setSelectSlot(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>할 일 배치</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {selectSlot && (
                <>
                  {selectSlot.start.toLocaleDateString('ko-KR')}{' '}
                  {selectSlot.start.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  {' ~ '}
                  {selectSlot.end.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </>
              )}
            </div>
            <Select value={selectedTodo} onValueChange={setSelectedTodo}>
              <SelectTrigger>
                <SelectValue placeholder="할 일 선택" />
              </SelectTrigger>
              <SelectContent>
                {incompleteTodos.map((todo) => (
                  <SelectItem key={todo.id} value={todo.id}>
                    {todo.category?.icon} {todo.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectSlot(null)}>
                취소
              </Button>
              <Button onClick={handleCreateFromSlot} disabled={!selectedTodo}>
                배치
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event detail dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>일정 상세</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">{selectedEvent.title}</h3>
                {selectedEvent.resource.todo?.category && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: selectedEvent.resource.todo.category.color }}
                    />
                    {selectedEvent.resource.todo.category.name}
                  </p>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                <p>
                  {selectedEvent.start.toLocaleDateString('ko-KR')}{' '}
                  {selectedEvent.start.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  {' ~ '}
                  {selectedEvent.end.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {selectedEvent.resource.todo?.description && (
                <p className="text-sm">{selectedEvent.resource.todo.description}</p>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    handleDeleteEvent(selectedEvent.id)
                    setSelectedEvent(null)
                  }}
                >
                  삭제
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedEvent(null)}>
                  닫기
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
