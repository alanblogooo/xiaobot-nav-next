"use client"

import * as React from "react"
import { useCallback, useState, useRef } from "react"
import { columnsConfig, BatchActions } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Plus, Upload, Search, RotateCcw } from "lucide-react"
import { CreateColumnDialog } from "@/components/columns/create-column-dialog"
import { EditColumnDialog } from "@/components/columns/edit-column-dialog"
import { DeleteColumnDialog } from "@/components/columns/delete-column-dialog"
import { BatchAddColumnsDialog } from "@/components/columns/batch-add-columns-dialog"
import { useColumns } from "@/hooks/use-columns"
import { useCategories } from "@/hooks/use-categories"
import { Column } from "@prisma/client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// 扩展 Column 类型
interface ExtendedColumn extends Omit<Column, 'category'> {
  category?: {
    id: string
    name: string
    createdAt: Date
    updatedAt: Date
  } | null
  onEdit?: (column: ExtendedColumn) => void
  onDelete?: (column: ExtendedColumn) => void
}

const initialFilters = {
  category: "all",
  status: "all",
  name: "",
  author: "",
}

interface TableRef {
  resetSelection: () => void
}

export default function ColumnsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [batchAddDialogOpen, setBatchAddDialogOpen] = useState(false)
  const [editingColumn, setEditingColumn] = useState<ExtendedColumn | null>(null)
  const [deletingColumn, setDeletingColumn] = useState<ExtendedColumn | null>(null)
  const [filters, setFilters] = useState(initialFilters)
  const [activeFilters, setActiveFilters] = useState(initialFilters)
  const [pageIndex, setPageIndex] = useState(0)
  const pageSize = 10
  const [selectedRows, setSelectedRows] = useState<ExtendedColumn[]>([])
  const tableRef = useRef<TableRef>(null)

  const { data: columns, total, mutate } = useColumns({
    category: activeFilters.category !== "all" ? activeFilters.category : undefined,
    status: activeFilters.status !== "all" ? activeFilters.status : undefined,
    name: activeFilters.name || undefined,
    author: activeFilters.author || undefined,
    pageIndex,
    pageSize,
  })

  const { data: categories } = useCategories()

  const handleEdit = useCallback((column: ExtendedColumn) => {
    setEditingColumn(column)
  }, [])

  const handleDelete = useCallback((column: ExtendedColumn) => {
    setDeletingColumn(column)
  }, [])

  const handleEditSuccess = useCallback(() => {
    setEditingColumn(null)
    mutate()
  }, [mutate])

  const handleDeleteSuccess = useCallback(() => {
    setDeletingColumn(null)
    mutate()
  }, [mutate])

  const handleSearch = useCallback(() => {
    setPageIndex(0)
    setActiveFilters(filters)
  }, [filters])

  const handleReset = useCallback(() => {
    setPageIndex(0)
    setFilters(initialFilters)
    setActiveFilters(initialFilters)
  }, [])

  // 为每一行添加操作回调
  const columnsWithCallbacks = React.useMemo(() => {
    if (!columns) return []
    return columns.map((column: Column) => ({
      ...column,
      onEdit: handleEdit,
      onDelete: handleDelete,
    }))
  }, [columns, handleEdit, handleDelete])

  const handleBatchDelete = async (ids: string[]) => {
    try {
      const response = await fetch("/api/columns/batch", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
      })
      if (!response.ok) throw new Error("删除失败")
      await mutate() // 刷新数据
      setSelectedRows([]) // 清空选择
      // 强制重置表格状态
      tableRef.current?.resetSelection()
    } catch (error) {
      throw error
    }
  }

  const handleBatchPublish = async (ids: string[], publish: boolean) => {
    try {
      const response = await fetch("/api/columns/batch/publish", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids, publish }),
      })
      if (!response.ok) throw new Error("操作失败")
      await mutate() // 刷新数据
      setSelectedRows([]) // 清空选择
      // 强制重置表格状态
      tableRef.current?.resetSelection()
    } catch (error) {
      throw error
    }
  }

  const handleBatchUpdateCategory = async (ids: string[], categoryId: string) => {
    try {
      const response = await fetch("/api/columns/batch/category", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids, categoryId }),
      })
      if (!response.ok) throw new Error("修改分类失败")
      await mutate() // 刷新数据
      setSelectedRows([]) // 清空选择
      // 强制重置表格状态
      tableRef.current?.resetSelection()
    } catch (error) {
      throw error
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">小报童专栏</h2>
          <p className="text-muted-foreground">
            管理你的所有小报童专栏
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setBatchAddDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            批量添加
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            新建
          </Button>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="mt-4 space-y-4">
        <div className="flex items-end gap-4">
          <div className="w-[180px]">
            <Label>分类</Label>
            <Select
              value={filters.category}
              onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                <SelectItem value="no-category">未分类</SelectItem>
                {categories?.map(category => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-[180px]">
            <Label>状态</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="published">已发布</SelectItem>
                <SelectItem value="draft">未发布</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-[180px]">
            <Label>名称</Label>
            <Input
              placeholder="搜索名称"
              value={filters.name}
              onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="w-[180px]">
            <Label>作者</Label>
            <Input
              placeholder="搜索作者"
              value={filters.author}
              onChange={(e) => setFilters(prev => ({ ...prev, author: e.target.value }))}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              查询
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              重置
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <BatchActions
          selectedRows={selectedRows}
          onBatchDelete={handleBatchDelete}
          onBatchPublish={handleBatchPublish}
          onBatchUpdateCategory={handleBatchUpdateCategory}
        />
        <DataTable<ExtendedColumn>
          ref={tableRef}
          columns={columnsConfig}
          data={columnsWithCallbacks}
          pageCount={Math.ceil(total / pageSize)}
          pageIndex={pageIndex}
          pageSize={pageSize}
          total={total}
          onPageChange={setPageIndex}
          onRowSelectionChange={setSelectedRows}
        />
      </div>

      <CreateColumnDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          setCreateDialogOpen(false)
          mutate()
        }}
      />

      <BatchAddColumnsDialog
        open={batchAddDialogOpen}
        onOpenChange={setBatchAddDialogOpen}
        onConfirm={() => {
          setBatchAddDialogOpen(false)
          mutate()
        }}
      />

      {editingColumn && (
        <EditColumnDialog
          open={!!editingColumn}
          onOpenChange={() => setEditingColumn(null)}
          column={editingColumn}
          onSuccess={handleEditSuccess}
        />
      )}

      {deletingColumn && (
        <DeleteColumnDialog
          open={!!deletingColumn}
          onOpenChange={() => setDeletingColumn(null)}
          column={deletingColumn}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  )
} 