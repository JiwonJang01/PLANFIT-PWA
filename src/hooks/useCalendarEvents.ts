import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { CalendarEventWithTodo, BigCalendarEvent } from '../types'

export function useCalendarEvents() {
  return useQuery<BigCalendarEvent[]>({
    queryKey: ['calendar-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*, todo:todos(*, category:categories(*))')
        .order('start_time')

      if (error) throw error

      return (data as CalendarEventWithTodo[]).map((event) => ({
        id: event.id,
        title: event.todo?.title ?? '(삭제된 할 일)',
        start: new Date(event.start_time),
        end: new Date(event.end_time),
        resource: event,
      }))
    },
  })
}

interface CreateEventParams {
  todo_id: string
  start_time: Date
  end_time: Date
  color?: string | null
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ todo_id, start_time, end_time, color }: CreateEventParams) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          todo_id,
          start_time: start_time.toISOString(),
          end_time: end_time.toISOString(),
          color: color ?? null,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
    },
  })
}

interface UpdateEventParams {
  id: string
  start_time?: Date
  end_time?: Date
  color?: string | null
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, start_time, end_time, color }: UpdateEventParams) => {
      const updates: Record<string, unknown> = {}
      if (start_time) updates.start_time = start_time.toISOString()
      if (end_time) updates.end_time = end_time.toISOString()
      if (color !== undefined) updates.color = color

      const { data, error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
    },
  })
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('calendar_events').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
    },
  })
}
