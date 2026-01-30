import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Category } from '../types'

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order_index')

      if (error) throw error
      return data
    },
  })
}

interface CreateCategoryParams {
  name: string
  color: string
  icon: string
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ name, color, icon }: CreateCategoryParams) => {
      // Get max order_index
      const { data: existing } = await supabase
        .from('categories')
        .select('order_index')
        .order('order_index', { ascending: false })
        .limit(1)

      const nextIndex = existing && existing.length > 0 ? existing[0].order_index + 1 : 0

      const { data, error } = await supabase
        .from('categories')
        .insert({
          name,
          color,
          icon,
          order_index: nextIndex,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

interface UpdateCategoryParams {
  id: string
  name?: string
  color?: string
  icon?: string
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, name, color, icon }: UpdateCategoryParams) => {
      const updates: Record<string, unknown> = {}
      if (name !== undefined) updates.name = name
      if (color !== undefined) updates.color = color
      if (icon !== undefined) updates.icon = icon

      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories'] })
      void queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories'] })
      void queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

export function useCategoryTodoCount(categoryId: string) {
  return useQuery<number>({
    queryKey: ['category-todo-count', categoryId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('todos')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', categoryId)

      if (error) throw error
      return count ?? 0
    },
    enabled: !!categoryId,
  })
}
