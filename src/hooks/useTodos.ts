import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useTodoStore } from '../store/todoStore'
import type { TodoWithCategory, TodoFormData } from '../types'

export function useTodos() {
  const selectedCategory = useTodoStore((s) => s.selectedCategory)

  return useQuery<TodoWithCategory[]>({
    queryKey: ['todos', { categoryId: selectedCategory }],
    queryFn: async () => {
      let query = supabase
        .from('todos')
        .select('*, category:categories(*)')

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory)
      }

      const { data, error } = await query.order('is_completed').order('deadline', { nullsFirst: false })

      if (error) throw error
      return data as TodoWithCategory[]
    },
  })
}

export function useCreateTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: TodoFormData) => {
      const { data, error } = await supabase
        .from('todos')
        .insert({
          title: formData.title,
          description: formData.description || null,
          category_id: formData.category_id || null,
          estimated_duration: formData.estimated_duration,
          priority: formData.priority,
          tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : null,
          deadline: formData.deadline || null,
          is_completed: false,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

export function useUpdateTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: TodoFormData }) => {
      const { data, error } = await supabase
        .from('todos')
        .update({
          title: formData.title,
          description: formData.description || null,
          category_id: formData.category_id || null,
          estimated_duration: formData.estimated_duration,
          priority: formData.priority,
          tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : null,
          deadline: formData.deadline || null,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

export function useDeleteTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('todos').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

export function useToggleComplete() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, is_completed }: { id: string; is_completed: boolean }) => {
      const { data, error } = await supabase
        .from('todos')
        .update({
          is_completed,
          completed_at: is_completed ? new Date().toISOString() : null,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onMutate: async ({ id, is_completed }) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] })

      const previousTodos = queryClient.getQueriesData<TodoWithCategory[]>({ queryKey: ['todos'] })

      queryClient.setQueriesData<TodoWithCategory[]>({ queryKey: ['todos'] }, (old) =>
        old?.map((todo) =>
          todo.id === id
            ? { ...todo, is_completed, completed_at: is_completed ? new Date().toISOString() : null }
            : todo
        )
      )

      return { previousTodos }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousTodos) {
        for (const [queryKey, data] of context.previousTodos) {
          queryClient.setQueryData(queryKey, data)
        }
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}
