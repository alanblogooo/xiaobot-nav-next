import useSWR from 'swr'

interface UseColumnsParams {
  category?: string
  status?: string
  name?: string
  author?: string
  pageIndex?: number
  pageSize?: number
  [key: string]: string | number | undefined
}

export function useColumns(params?: UseColumnsParams) {
  const { data, error, mutate } = useSWR(
    params ? `/api/columns?${new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    )}` : '/api/columns', 
    async (url: string) => {
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error('Failed to fetch columns')
      }
      const json = await res.json()
      return {
        data: json.data || [],
        total: json.total || 0,
        pageIndex: Number(json.pageIndex) || 0,
        pageSize: Number(json.pageSize) || 10
      }
    }
  )

  return {
    data: data?.data || [],
    total: data?.total || 0,
    pageIndex: data?.pageIndex || 0,
    pageSize: data?.pageSize || 10,
    error,
    mutate,
    isLoading: !data && !error
  }
} 