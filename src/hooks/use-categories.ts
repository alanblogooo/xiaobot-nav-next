import useSWR from 'swr'
import { Category } from '@/services/columns'

export function useCategories() {
  const { data, error, mutate } = useSWR<Category[]>('/api/categories', async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error('Failed to fetch categories')
    }
    return res.json()
  })

  return {
    data,
    error,
    mutate,
    isLoading: !data && !error,
  }
} 