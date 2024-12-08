"use client"

import * as React from "react"
import { Edit2, Trash2, BookOpen, ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Pagination } from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { EditColumnDialog } from "./edit-column-dialog"
import { DeleteColumnDialog } from "./delete-column-dialog"
import { getColumns, updateColumn, type Column } from "@/services/columns"
import { getCategories, type Category } from "@/services/categories"
import { cn } from "@/lib/utils"
import useSWR from 'swr'

type SortField = 'createdAt' | 'updatedAt' | 'subscribers' | 'contentCount';
type SortOrder = 'asc' | 'desc';

interface ColumnsTableProps {
  nameFilter?: string
  authorFilter?: string
  categoryFilter?: string
  sortField: 'createdAt' | 'updatedAt' | 'subscribers' | 'contentCount'
  sortOrder: 'asc' | 'desc'
  onSortChange: (field: 'createdAt' | 'updatedAt' | 'subscribers' | 'contentCount', order: 'asc' | 'desc') => void
  onFilterChange: (filter: { categoryFilter?: string }) => void
}

interface TableRef {
  resetPage: () => void
  resetToDefault: () => void
}

export const ColumnsTable = React.memo(React.forwardRef<TableRef, ColumnsTableProps>(({
  nameFilter,
  authorFilter,
  categoryFilter,
  sortField,
  sortOrder,
  onSortChange,
  onFilterChange,
}, ref) => {
  const [pageIndex, setPageIndex] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(10)
  const [editingColumn, setEditingColumn] = React.useState<Column | null>(null)
  const [deletingColumn, setDeletingColumn] = React.useState<Column | null>(null)
  const [selectedColumns, setSelectedColumns] = React.useState<Set<string>>(new Set())
  const [isUpdating, setIsUpdating] = React.useState(false)
  const [showBatchCategoryDialog, setShowBatchCategoryDialog] = React.useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(null)
  const [recentlyUpdated, setRecentlyUpdated] = React.useState<Map<string, Set<string>>>(new Map())

  // 获取分类列表
  const { data: categories = [] } = useSWR<Category[]>(
    'categories',
    () => getCategories()
  )

  const { data, error, mutate } = useSWR(
    [
      'columns',
      pageIndex,
      pageSize,
      nameFilter,
      authorFilter,
      categoryFilter,
      sortField,
      sortOrder,
    ],
    () =>
      getColumns({
        pageIndex,
        pageSize,
        name: nameFilter,
        author: authorFilter,
        category: categoryFilter,
        sortField,
        sortOrder,
      })
  )

  React.useImperativeHandle(ref, () => ({
    resetPage: () => setPageIndex(0),
    resetToDefault: () => {
      setPageIndex(0)
      mutate()
    },
  }))

  const handleSelectAll = React.useCallback((checked: boolean) => {
    if (checked && data?.data) {
      setSelectedColumns(new Set(data.data.map((column: Column) => column.id)))
    } else {
      setSelectedColumns(new Set())
    }
  }, [data?.data])

  const handleSelectOne = React.useCallback((checked: boolean, columnId: string) => {
    setSelectedColumns(prev => {
      const next = new Set(prev)
      if (checked) {
        next.add(columnId)
      } else {
        next.delete(columnId)
      }
      return next
    })
  }, [])

  const handleBatchPublish = async (publish: boolean) => {
    if (selectedColumns.size === 0) {
      toast.error("请先选择专栏")
      return
    }

    setIsUpdating(true)
    try {
      await Promise.all(
        Array.from(selectedColumns).map(id =>
          updateColumn(id, { isPublished: publish })
        )
      )
      toast.success(publish ? "批量上架成功" : "批量下架成功")
      setSelectedColumns(new Set())
      mutate()
    } catch (error) {
      toast.error(publish ? "批量上架失败" : "批量下架失败")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleBatchUpdateCategory = async () => {
    if (selectedColumns.size === 0) {
      toast.error("请先选择专栏")
      return
    }

    setIsUpdating(true)
    try {
      await Promise.all(
        Array.from(selectedColumns).map(id =>
          updateColumn(id, { categoryId: selectedCategoryId })
        )
      )
      toast.success("批量修改分类成功")
      setSelectedColumns(new Set())
      setShowBatchCategoryDialog(false)
      setSelectedCategoryId(null)
      mutate()
    } catch (error) {
      toast.error("批量修改分类失败")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleBatchDelete = () => {
    if (selectedColumns.size === 0) {
      toast.error("请先选择专栏")
      return
    }

    // 找到第一个选中的专栏作为删除对话框的目标
    const firstSelectedColumn = data?.data.find((column: Column) => selectedColumns.has(column.id))
    if (firstSelectedColumn) {
      setDeletingColumn({
        ...firstSelectedColumn,
        // 添加批量删除标记
        _batch: Array.from(selectedColumns)
      } as any)
    }
  }

  const updateLocalColumn = React.useCallback((updatedColumn: Column, changedFields?: string[]) => {
    if (data?.data) {
      const newData = {
        ...data,
        data: data.data.map((column: Column) =>
          column.id === updatedColumn.id ? updatedColumn : column
        ),
      }
      setRecentlyUpdated(prev => {
        const next = new Map(prev)
        next.set(updatedColumn.id, new Set(changedFields || []))
        return next
      })
      mutate(newData, false)
    }
  }, [data, mutate])

  const isFieldUpdated = React.useCallback((columnId: string, field: string) => {
    return recentlyUpdated.get(columnId)?.has(field) || false
  }, [recentlyUpdated])

  if (error) {
    return <div className="text-center text-red-500">加载失败</div>
  }

  const total = data?.total || 0
  const columns = data?.data || []
  const allSelected = data?.data && data.data.length > 0 && selectedColumns.size === data.data.length

  return (
    <>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            disabled={selectedColumns.size === 0 || isUpdating}
            onClick={handleBatchDelete}
          >
            批量删除
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={selectedColumns.size === 0 || isUpdating}
            onClick={() => handleBatchPublish(true)}
          >
            批量上架
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={selectedColumns.size === 0 || isUpdating}
            onClick={() => handleBatchPublish(false)}
          >
            批量下架
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={selectedColumns.size === 0 || isUpdating}
            onClick={() => setShowBatchCategoryDialog(true)}
          >
            批量修改分类
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-[60px] whitespace-nowrap">头像</TableHead>
              <TableHead className="min-w-[200px] w-[280px]">专栏名称</TableHead>
              <TableHead className="w-[120px] whitespace-nowrap">作者</TableHead>
              <TableHead className="w-[100px] whitespace-nowrap" onClick={() => onSortChange('subscribers', sortOrder === 'desc' ? 'asc' : 'desc')}>
                <div className="flex items-center gap-1 cursor-pointer">
                  <span className={sortField === 'subscribers' ? 'font-bold' : ''}>订阅数</span>
                  {sortField === 'subscribers' ? (
                    sortOrder === 'desc' ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowUpDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="w-[100px] whitespace-nowrap" onClick={() => onSortChange('contentCount', sortOrder === 'desc' ? 'asc' : 'desc')}>
                <div className="flex items-center gap-1 cursor-pointer">
                  <span className={sortField === 'contentCount' ? 'font-bold' : ''}>内容数</span>
                  {sortField === 'contentCount' ? (
                    sortOrder === 'desc' ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowUpDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="w-[120px] whitespace-nowrap">分类</TableHead>
              <TableHead className="w-[100px] whitespace-nowrap text-center">状态</TableHead>
              <TableHead className="w-[120px] whitespace-nowrap" onClick={() => onSortChange('createdAt', sortOrder === 'desc' ? 'asc' : 'desc')}>
                <div className="flex items-center gap-1 cursor-pointer">
                  <span className={sortField === 'createdAt' ? 'font-bold' : ''}>创建时间</span>
                  {sortField === 'createdAt' ? (
                    sortOrder === 'desc' ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowUpDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="w-[120px] whitespace-nowrap" onClick={() => onSortChange('updatedAt', sortOrder === 'desc' ? 'asc' : 'desc')}>
                <div className="flex items-center gap-1 cursor-pointer">
                  <span className={sortField === 'updatedAt' ? 'font-bold' : ''}>更新时间</span>
                  {sortField === 'updatedAt' ? (
                    sortOrder === 'desc' ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowUpDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="w-[80px] text-center">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {columns.map((column: Column) => (
              <TableRow 
                key={column.id}
                className={cn(
                  recentlyUpdated.has(column.id) && "bg-red-50"
                )}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedColumns.has(column.id)}
                    onCheckedChange={(checked: boolean) => handleSelectOne(checked, column.id)}
                    aria-label={`Select ${column.name}`}
                  />
                </TableCell>
                <TableCell className="p-2">
                  {column.avatar ? (
                    <img
                      src={column.avatar}
                      alt={column.name}
                      className="h-10 w-10 min-w-[40px] rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 min-w-[40px] items-center justify-center rounded-full bg-muted">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell className={cn(
                  "font-bold",
                  isFieldUpdated(column.id, 'name') && "text-red-600"
                )}>
                  <a 
                    href={column.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {column.name}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </TableCell>
                <TableCell className={cn(
                  isFieldUpdated(column.id, 'author') && "text-red-600"
                )}>{column.author}</TableCell>
                <TableCell className={cn(
                  isFieldUpdated(column.id, 'subscribers') && "text-red-600"
                )}>{column.subscribers}</TableCell>
                <TableCell className={cn(
                  isFieldUpdated(column.id, 'contentCount') && "text-red-600"
                )}>{column.contentCount}</TableCell>
                <TableCell className={cn(
                  isFieldUpdated(column.id, 'categoryId') && "text-red-600"
                )}>
                  {column.category?.name || "无分类"}
                </TableCell>
                <TableCell className="text-center">
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                    column.isPublished 
                      ? "bg-green-50 text-green-700" 
                      : "bg-red-50 text-red-700",
                    isFieldUpdated(column.id, 'isPublished') && "ring-2 ring-red-500"
                  )}>
                    {column.isPublished ? "已上架" : "已下架"}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(column.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(column.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingColumn(column)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingColumn(column)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination
        pageIndex={pageIndex}
        pageSize={pageSize}
        total={total}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
      />

      {editingColumn && (
        <EditColumnDialog
          column={editingColumn}
          open={!!editingColumn}
          onOpenChange={(open) => !open && setEditingColumn(null)}
          onSuccess={(updatedColumn: Column, changedFields: string[]) => {
            setEditingColumn(null)
            updateLocalColumn(updatedColumn, changedFields)
          }}
        />
      )}

      {deletingColumn && (
        <DeleteColumnDialog
          column={deletingColumn}
          open={!!deletingColumn}
          onOpenChange={(open) => !open && setDeletingColumn(null)}
          onSuccess={() => {
            // 如果是批量删除
            if ((deletingColumn as any)._batch) {
              setSelectedColumns(new Set())
            }
            setDeletingColumn(null)
            mutate()
          }}
        />
      )}

      {showBatchCategoryDialog && (
        <Dialog open={showBatchCategoryDialog} onOpenChange={setShowBatchCategoryDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>批量修改分类</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>选择分类</Label>
                <Select
                  value={selectedCategoryId === null ? "0" : selectedCategoryId}
                  onValueChange={(value) => setSelectedCategoryId(value === "0" ? null : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">无分类</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowBatchCategoryDialog(false)
                  setSelectedCategoryId(null)
                }}
                disabled={isUpdating}
              >
                取消
              </Button>
              <Button
                onClick={handleBatchUpdateCategory}
                disabled={isUpdating}
              >
                保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}))

ColumnsTable.displayName = "ColumnsTable" 