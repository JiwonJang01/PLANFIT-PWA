import { useState, useMemo } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { TodoList } from './TodoList'
import { TodoModal } from './TodoModal'
import { useCategories } from '../../hooks/useCategories'
import {
  useTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  useToggleComplete,
} from '../../hooks/useTodos'
import { useCalendarEvents } from '../../hooks/useCalendarEvents'
import { useTodoStore } from '../../store/todoStore'
import type { TodoWithCategory, TodoFormData } from '../../types'

export function MobileTodoPanel() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<TodoWithCategory | null>(null)

  const { data: categories } = useCategories()
  const { data: todos, isLoading, isError } = useTodos()
  const { data: calendarEvents } = useCalendarEvents()

  const createTodo = useCreateTodo()
  const updateTodo = useUpdateTodo()
  const deleteTodo = useDeleteTodo()
  const toggleComplete = useToggleComplete()

  const selectedCategory = useTodoStore((s) => s.selectedCategory)
  const setSelectedCategory = useTodoStore((s) => s.setSelectedCategory)

  // Get set of todo IDs that are assigned to calendar
  const assignedTodoIds = useMemo(() => {
    return new Set(calendarEvents?.map((e) => e.resource.todo_id) ?? [])
  }, [calendarEvents])

  const handleAddClick = () => {
    setEditingTodo(null)
    setModalOpen(true)
  }

  const handleEdit = (todo: TodoWithCategory) => {
    console.log('[MobileTodoPanel] handleEdit called:', todo.id, todo.title)
    setEditingTodo(todo)
    setModalOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteTodo.mutate(id)
  }

  const handleToggle = (id: string, is_completed: boolean) => {
    toggleComplete.mutate({ id, is_completed })
  }

  const handleSubmit = (data: TodoFormData) => {
    if (editingTodo) {
      updateTodo.mutate({ id: editingTodo.id, formData: data })
    } else {
      createTodo.mutate(data)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h1 className="text-lg font-semibold">할 일 목록</h1>
        <Button size="sm" onClick={handleAddClick}>
          <Plus className="h-4 w-4 mr-1" />
          추가
        </Button>
      </div>

      {/* Category filter */}
      <div className="px-4 py-2 border-b border-border">
        <Select
          value={selectedCategory ?? 'all'}
          onValueChange={(v) => setSelectedCategory(v === 'all' ? null : v)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="전체 카테고리" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 카테고리</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Todo list area */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <p className="text-sm text-destructive text-center py-8">
            할 일을 불러오지 못했습니다
          </p>
        ) : !todos || todos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">할 일이 없습니다</p>
            <Button variant="outline" onClick={handleAddClick}>
              <Plus className="h-4 w-4 mr-1" />
              첫 번째 할 일 추가하기
            </Button>
          </div>
        ) : (
          <TodoList
            todos={todos}
            selectedCategory={selectedCategory}
            assignedTodoIds={assignedTodoIds}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <TodoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        todo={editingTodo}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
