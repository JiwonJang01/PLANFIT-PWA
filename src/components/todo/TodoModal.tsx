import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Clock, Calendar, Tag, Flag, Folder, FileText, Pencil, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { useCategories } from '../../hooks/useCategories'
import type { TodoWithCategory, TodoFormData } from '../../types'

export type TodoModalMode = 'view' | 'edit' | 'create'

interface TodoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  todo?: TodoWithCategory | null
  initialMode?: TodoModalMode
  onSubmit: (data: TodoFormData) => void
  onDelete?: (id: string) => void
}

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120, 180, 240]

const defaultValues: TodoFormData = {
  title: '',
  description: '',
  category_id: '',
  estimated_duration: 30,
  priority: 'medium',
  tags: '',
  deadline: '',
}

const PRIORITY_CONFIG = {
  high: { label: '높음', emoji: '🔴', color: 'bg-red-500' },
  medium: { label: '보통', emoji: '🟡', color: 'bg-yellow-500' },
  low: { label: '낮음', emoji: '🟢', color: 'bg-blue-500' },
} as const

function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`
  }
  return `${minutes}분`
}

function formatDeadline(deadline: string): string {
  try {
    const date = new Date(deadline)
    return format(date, 'yyyy년 M월 d일 HH:mm', { locale: ko })
  } catch {
    return deadline
  }
}

export function TodoModal({
  open,
  onOpenChange,
  todo,
  initialMode,
  onSubmit,
  onDelete,
}: TodoModalProps) {
  const { data: categories } = useCategories()
  const [mode, setMode] = useState<TodoModalMode>('create')

  const form = useForm<TodoFormData>({ defaultValues, mode: 'onChange' })

  // Determine mode when opening
  useEffect(() => {
    if (open) {
      if (initialMode) {
        setMode(initialMode)
      } else if (todo) {
        setMode('edit')
      } else {
        setMode('create')
      }

      if (todo) {
        form.reset({
          title: todo.title,
          description: todo.description ?? '',
          category_id: todo.category_id ?? '',
          estimated_duration: todo.estimated_duration,
          priority: todo.priority,
          tags: todo.tags?.join(', ') ?? '',
          deadline: todo.deadline ? todo.deadline.slice(0, 16) : '',
        })
      } else {
        form.reset(defaultValues)
      }
    }
  }, [open, todo, initialMode, form])

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data)
    onOpenChange(false)
  })

  const handleDelete = () => {
    if (todo && onDelete) {
      onDelete(todo.id)
      onOpenChange(false)
    }
  }

  const handleSwitchToEdit = () => {
    setMode('edit')
  }

  const getTitle = () => {
    if (mode === 'view') return '할 일 상세'
    if (mode === 'edit') return '할 일 수정'
    return '새 할 일'
  }

  const isViewMode = mode === 'view'

  // View Mode Rendering
  if (isViewMode && todo) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{getTitle()}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Title */}
            <div>
              <h2 className="text-xl font-semibold">{todo.title}</h2>
              {todo.is_completed && (
                <Badge variant="secondary" className="mt-1">완료됨</Badge>
              )}
            </div>

            {/* Category */}
            {todo.category && (
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-muted-foreground" />
                <Badge
                  variant="outline"
                  style={{
                    borderColor: todo.category.color,
                    color: todo.category.color,
                  }}
                >
                  {todo.category.icon} {todo.category.name}
                </Badge>
              </div>
            )}

            {/* Duration */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formatDuration(todo.estimated_duration)}</span>
            </div>

            {/* Priority */}
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {PRIORITY_CONFIG[todo.priority].emoji} {PRIORITY_CONFIG[todo.priority].label}
              </span>
            </div>

            {/* Deadline */}
            {todo.deadline && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{formatDeadline(todo.deadline)}</span>
              </div>
            )}

            {/* Tags */}
            {todo.tags && todo.tags.length > 0 && (
              <div className="flex items-start gap-2">
                <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex flex-wrap gap-1">
                  {todo.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {todo.description && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">설명</span>
                </div>
                <p className="text-sm text-muted-foreground pl-6 whitespace-pre-wrap">
                  {todo.description}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex-row justify-between sm:justify-between">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              닫기
            </Button>
            <Button type="button" onClick={handleSwitchToEdit}>
              <Pencil className="h-4 w-4 mr-1" />
              수정하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // Edit/Create Mode Rendering
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              placeholder="할 일 제목"
              {...form.register('title', { required: true })}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>카테고리</Label>
            <Controller
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Estimated Duration */}
          <div className="space-y-2">
            <Label>예상 시간</Label>
            <Controller
              control={form.control}
              name="estimated_duration"
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {DURATION_OPTIONS.map((min) => (
                    <button
                      key={min}
                      type="button"
                      onClick={() => field.onChange(min)}
                      className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                        field.value === min
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      {formatDuration(min)}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>우선순위</Label>
            <Controller
              control={form.control}
              name="priority"
              render={({ field }) => (
                <div className="flex gap-2">
                  {(Object.entries(PRIORITY_CONFIG) as [keyof typeof PRIORITY_CONFIG, typeof PRIORITY_CONFIG[keyof typeof PRIORITY_CONFIG]][]).map(
                    ([value, config]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => field.onChange(value)}
                        className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors ${
                          field.value === value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:bg-accent'
                        }`}
                      >
                        <span>{config.emoji}</span>
                        {config.label}
                      </button>
                    )
                  )}
                </div>
              )}
            />
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label htmlFor="deadline">마감일</Label>
            <Input
              id="deadline"
              type="datetime-local"
              {...form.register('deadline')}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">태그</Label>
            <Input
              id="tags"
              placeholder="쉼표로 구분 (예: 업무, 중요)"
              {...form.register('tags')}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              placeholder="할 일에 대한 상세 설명"
              rows={3}
              {...form.register('description')}
            />
          </div>

          <DialogFooter className="flex-row justify-between sm:justify-between gap-2">
            {mode === 'edit' && todo && onDelete && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                삭제
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                취소
              </Button>
              <Button type="submit" disabled={!form.formState.isValid}>
                {mode === 'edit' ? '저장' : '추가'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
