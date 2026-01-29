import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { useCategories } from '../../hooks/useCategories'
import type { TodoWithCategory, TodoFormData } from '../../types'

interface TodoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  todo?: TodoWithCategory | null
  onSubmit: (data: TodoFormData) => void
}

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120]

const defaultValues: TodoFormData = {
  title: '',
  description: '',
  category_id: '',
  estimated_duration: 30,
  priority: 'medium',
  tags: '',
  deadline: '',
}

export function TodoModal({ open, onOpenChange, todo, onSubmit }: TodoModalProps) {
  const { data: categories } = useCategories()

  const form = useForm<TodoFormData>({ defaultValues, mode: 'onChange' })

  useEffect(() => {
    if (open) {
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
  }, [open, todo, form])

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data)
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{todo ? '할 일 수정' : '새 할 일'}</DialogTitle>
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
                <Select
                  value={String(field.value)}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((min) => (
                      <SelectItem key={min} value={String(min)}>
                        {min >= 60 ? `${min / 60}시간` : `${min}분`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  {([
                    { value: 'high', label: '높음', color: 'bg-red-500' },
                    { value: 'medium', label: '보통', color: 'bg-yellow-500' },
                    { value: 'low', label: '낮음', color: 'bg-blue-500' },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => field.onChange(opt.value)}
                      className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors ${
                        field.value === opt.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${opt.color}`} />
                      {opt.label}
                    </button>
                  ))}
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={!form.formState.isValid}>
              {todo ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
