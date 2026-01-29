import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { TodoList } from '../todo/TodoList'
import { TodoModal } from '../todo/TodoModal'
import { useCategories } from '../../hooks/useCategories'
import {
  useTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  useToggleComplete,
} from '../../hooks/useTodos'
import { useTodoStore } from '../../store/todoStore'
import type { TodoWithCategory, TodoFormData } from '../../types'

export function RightPanel() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<TodoWithCategory | null>(null)

  const { data: categories } = useCategories()
  const { data: todos, isLoading, isError } = useTodos()

  const createTodo = useCreateTodo()
  const updateTodo = useUpdateTodo()
  const deleteTodo = useDeleteTodo()
  const toggleComplete = useToggleComplete()

  const selectedCategory = useTodoStore((s) => s.selectedCategory)
  const setSelectedCategory = useTodoStore((s) => s.setSelectedCategory)

  const handleAddClick = () => {
    setEditingTodo(null)
    setModalOpen(true)
  }

  const handleEdit = (todo: TodoWithCategory) => {
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
    <>
      <aside className="fixed top-14 right-0 z-30 hidden h-[calc(100vh-3.5rem)] w-80 border-l border-border bg-background lg:block">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <h2 className="text-sm font-semibold">할 일 목록</h2>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleAddClick}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Separator />

          {/* Category filter */}
          <div className="px-4 py-2">
            <Select
              value={selectedCategory ?? 'all'}
              onValueChange={(v) => setSelectedCategory(v === 'all' ? null : v)}
            >
              <SelectTrigger className="h-8 text-xs">
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
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : isError ? (
              <p className="text-sm text-destructive text-center py-8">
                할 일을 불러오지 못했습니다
              </p>
            ) : !todos || todos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                할 일을 추가해보세요
              </p>
            ) : (
              <TodoList
                todos={todos}
                selectedCategory={selectedCategory}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
      </aside>

      <TodoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        todo={editingTodo}
        onSubmit={handleSubmit}
      />
    </>
  )
}
