import { useState, useEffect } from 'react'
import { Loader2, Trash2, AlertTriangle } from 'lucide-react'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog'
import {
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCategoryTodoCount,
} from '../../hooks/useCategories'
import type { Category } from '../../types'

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#64748b', // slate
]

const PRESET_ICONS = [
  '📁', '💼', '🏠', '💪', '📚', '💻', '🎨', '🎵',
  '🎮', '✈️', '🛒', '💰', '❤️', '⭐', '🔥', '💡',
  '📝', '🎯', '🏃', '🍽️', '🌱', '🔧', '📞', '✨',
]

interface CategoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: Category | null // null for create mode
}

export function CategoryModal({ open, onOpenChange, category }: CategoryModalProps) {
  const isEditMode = !!category

  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [icon, setIcon] = useState(PRESET_ICONS[0])
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)

  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()
  const { data: todoCount = 0 } = useCategoryTodoCount(category?.id ?? '')

  const isLoading = createCategory.isPending || updateCategory.isPending || deleteCategory.isPending

  useEffect(() => {
    if (category) {
      setName(category.name)
      setColor(category.color)
      setIcon(category.icon)
    } else {
      setName('')
      setColor(PRESET_COLORS[0])
      setIcon(PRESET_ICONS[0])
    }
  }, [category, open])

  const handleSubmit = () => {
    if (!name.trim()) return

    if (isEditMode && category) {
      updateCategory.mutate(
        { id: category.id, name: name.trim(), color, icon },
        { onSuccess: () => onOpenChange(false) }
      )
    } else {
      createCategory.mutate(
        { name: name.trim(), color, icon },
        { onSuccess: () => onOpenChange(false) }
      )
    }
  }

  const handleDelete = () => {
    if (!category) return
    deleteCategory.mutate(category.id, {
      onSuccess: () => {
        setShowDeleteAlert(false)
        onOpenChange(false)
      },
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? '카테고리 수정' : '새 카테고리'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Preview */}
            <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-muted">
              <span className="text-2xl">{icon}</span>
              <span
                className="text-lg font-medium"
                style={{ color: name ? color : undefined }}
              >
                {name || '카테고리 이름'}
              </span>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="카테고리 이름"
                autoFocus
              />
            </div>

            {/* Color picker */}
            <div className="space-y-2">
              <Label>색상</Label>
              <div className="grid grid-cols-8 gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${
                      color === c ? 'ring-2 ring-offset-2 ring-primary' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Label htmlFor="custom-color" className="text-xs text-muted-foreground">
                  직접 입력:
                </Label>
                <Input
                  id="custom-color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-8 w-16 p-1 cursor-pointer"
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-8 w-24 text-xs font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>

            {/* Icon picker */}
            <div className="space-y-2">
              <Label>아이콘</Label>
              <div className="grid grid-cols-8 gap-2">
                {PRESET_ICONS.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(i)}
                    className={`h-8 w-8 flex items-center justify-center rounded-md text-lg transition-colors hover:bg-accent ${
                      icon === i ? 'bg-accent ring-2 ring-primary' : ''
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Label htmlFor="custom-icon" className="text-xs text-muted-foreground">
                  직접 입력:
                </Label>
                <Input
                  id="custom-icon"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="h-8 w-20 text-center"
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-row justify-between sm:justify-between">
            {isEditMode ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteAlert(true)}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                삭제
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                취소
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!name.trim() || isLoading}
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEditMode ? '저장' : '추가'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              카테고리 삭제
            </AlertDialogTitle>
            <AlertDialogDescription>
              {todoCount > 0 ? (
                <>
                  이 카테고리에 <strong>{todoCount}개의 할 일</strong>이 있습니다.
                  삭제하면 해당 할 일들의 카테고리가 비어있게 됩니다.
                </>
              ) : (
                '이 카테고리를 삭제하시겠습니까?'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
