export interface Category {
  id: string
  name: string
  color: string
  icon: string
  order_index: number
}

export interface Todo {
  id: string
  title: string
  description: string | null
  category_id: string | null
  estimated_duration: number
  priority: 'high' | 'medium' | 'low'
  tags: string[] | null
  deadline: string | null
  is_completed: boolean
  completed_at: string | null
}

export interface TodoWithCategory extends Todo {
  category: Category | null
}

export interface ChecklistItem {
  id: string
  todo_id: string
  content: string
  is_checked: boolean
  order_index: number
}

export interface CalendarEvent {
  id: string
  todo_id: string
  start_time: string
  end_time: string
  color: string | null
}

export interface CalendarEventWithTodo extends CalendarEvent {
  todo: TodoWithCategory | null
}

export interface BigCalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: CalendarEventWithTodo
}

export interface TodoFormData {
  title: string
  description: string
  category_id: string
  estimated_duration: number
  priority: 'high' | 'medium' | 'low'
  tags: string
  deadline: string
}
