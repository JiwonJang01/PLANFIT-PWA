import { create } from 'zustand'

interface TodoStore {
  selectedCategory: string | null
  setSelectedCategory: (categoryId: string | null) => void

  searchQuery: string
  setSearchQuery: (query: string) => void
}

export const useTodoStore = create<TodoStore>((set) => ({
  selectedCategory: null,
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}))
