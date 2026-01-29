import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { TodoCard } from './TodoCard'
import type { TodoWithCategory } from '../../types'

interface TodoListProps {
  todos: TodoWithCategory[]
  selectedCategory: string | null
  onToggle: (id: string, is_completed: boolean) => void
  onEdit: (todo: TodoWithCategory) => void
  onDelete: (id: string) => void
}

interface GroupedTodos {
  categoryId: string | null
  categoryName: string
  categoryIcon: string
  todos: TodoWithCategory[]
}

function groupByCategory(todos: TodoWithCategory[]): GroupedTodos[] {
  const map = new Map<string | null, GroupedTodos>()

  for (const todo of todos) {
    const key = todo.category_id
    if (!map.has(key)) {
      map.set(key, {
        categoryId: key,
        categoryName: todo.category?.name ?? '미분류',
        categoryIcon: todo.category?.icon ?? '📋',
        todos: [],
      })
    }
    map.get(key)!.todos.push(todo)
  }

  return Array.from(map.values())
}

export function TodoList({ todos, selectedCategory, onToggle, onEdit, onDelete }: TodoListProps) {
  const [showCompleted, setShowCompleted] = useState(false)

  const activeTodos = todos.filter((t) => !t.is_completed)
  const completedTodos = todos.filter((t) => t.is_completed)

  const renderTodoCards = (items: TodoWithCategory[]) =>
    items.map((todo) => (
      <TodoCard
        key={todo.id}
        todo={todo}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ))

  // If a category is selected, skip grouping
  if (selectedCategory) {
    return (
      <div className="space-y-2">
        {renderTodoCards(activeTodos)}

        {completedTodos.length > 0 && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              {showCompleted ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              완료됨 ({completedTodos.length})
            </button>
            {showCompleted && (
              <div className="space-y-2">{renderTodoCards(completedTodos)}</div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Group by category
  const activeGroups = groupByCategory(activeTodos)

  return (
    <div className="space-y-4">
      {activeGroups.map((group) => (
        <div key={group.categoryId ?? 'none'}>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm">{group.categoryIcon}</span>
            <span className="text-xs font-medium text-muted-foreground">
              {group.categoryName}
            </span>
            <span className="text-xs text-muted-foreground/60">
              {group.todos.length}
            </span>
          </div>
          <div className="space-y-2">
            {renderTodoCards(group.todos)}
          </div>
        </div>
      ))}

      {completedTodos.length > 0 && (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            {showCompleted ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            완료됨 ({completedTodos.length})
          </button>
          {showCompleted && (
            <div className="space-y-2">{renderTodoCards(completedTodos)}</div>
          )}
        </div>
      )}
    </div>
  )
}
