export interface Category {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CategoryCreateInput = {
  name: string
}

export type CategoryUpdateInput = {
  name: string
}

export async function getCategories() {
  const response = await fetch('/api/categories')
  if (!response.ok) {
    throw new Error('Failed to fetch categories')
  }
  return response.json()
}

export async function createCategory(data: CategoryCreateInput) {
  const response = await fetch('/api/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to create category')
  }
  return response.json()
}

export async function updateCategory(id: string, data: CategoryUpdateInput) {
  const response = await fetch(`/api/categories/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to update category')
  }
  return response.json()
}

export async function deleteCategory(id: string) {
  const response = await fetch(`/api/categories/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete category')
  }
  return response.json()
} 