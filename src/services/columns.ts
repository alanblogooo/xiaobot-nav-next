import type { InferSelectModel } from 'drizzle-orm'
import { categories, columns } from '../../database/drizzle/schema'

export type Category = InferSelectModel<typeof categories>
export type Column = InferSelectModel<typeof columns>

export interface ColumnWithCategory extends Column {
  category?: {
    id: string
    name: string
    createdAt: Date | null
    updatedAt: Date | null
  } | null
}

export type ColumnCreateInput = {
  avatar: string
  name: string
  author: string
  subscribers?: number
  contentCount?: number
  description?: string
  url: string
  categoryId?: string | null
  isPublished: boolean
}

export type ColumnUpdateInput = Partial<ColumnCreateInput>

export interface ColumnsParams {
  pageIndex: number
  pageSize: number
  name?: string
  author?: string
  category?: string
  sortField?: 'createdAt' | 'updatedAt' | 'subscribers' | 'contentCount'
  sortOrder?: 'asc' | 'desc'
  status?: 'published' | 'draft' | 'archived'
}

export const getColumns = async ({
  pageIndex,
  pageSize,
  name,
  author,
  category,
  sortField,
  sortOrder,
  status
}: ColumnsParams) => {
  const response = await fetch(`/api/columns?pageIndex=${pageIndex}&pageSize=${pageSize}${name ? `&name=${name}` : ''}${author ? `&author=${author}` : ''}${category ? `&category=${category}` : ''}${sortField ? `&sortField=${sortField}` : ''}${sortOrder ? `&sortOrder=${sortOrder}` : ''}${status ? `&status=${status}` : ''}`)
  return response.json()
}

export async function createColumn(data: ColumnCreateInput) {
  const response = await fetch("/api/columns", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error("Failed to create column")
  }
  return response.json()
}

export async function updateColumn(id: string, data: ColumnUpdateInput) {
  const response = await fetch(`/api/columns/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error("Failed to update column")
  }
  return response.json()
}

export async function deleteColumn(id: string) {
  const response = await fetch(`/api/columns/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    throw new Error("Failed to delete column")
  }
}

export async function addBatchColumns(urls: string[]) {
  const response = await fetch('/api/columns/batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ urls }),
  });

  if (!response.ok) {
    throw new Error('Failed to batch add columns');
  }

  return response.json();
} 