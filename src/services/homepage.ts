import type { ColumnWithCategory } from './columns'
import type { Category } from './categories'

export interface HomepageData {
  columns: {
    data: ColumnWithCategory[]
    total: number
    pageIndex: number
    pageSize: number
  }
  categories: Category[]
  inviteCode: string
}

export interface HomepageParams {
  pageIndex: number
  pageSize: number
  name?: string
  author?: string
  category?: string
  sortField?: 'createdAt' | 'updatedAt' | 'subscribers' | 'contentCount'
  sortOrder?: 'asc' | 'desc'
  status?: 'published' | 'draft' | 'archived'
}

export const getHomepageData = async ({
  pageIndex,
  pageSize,
  name,
  author,
  category,
  sortField,
  sortOrder,
  status
}: HomepageParams): Promise<HomepageData> => {
  const params = new URLSearchParams({
    pageIndex: pageIndex.toString(),
    pageSize: pageSize.toString(),
  })

  if (name) params.append('name', name)
  if (author) params.append('author', author)
  if (category) params.append('category', category)
  if (sortField) params.append('sortField', sortField)
  if (sortOrder) params.append('sortOrder', sortOrder)
  if (status) params.append('status', status)

  const response = await fetch(`/api/homepage?${params}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch homepage data')
  }
  
  return response.json()
} 