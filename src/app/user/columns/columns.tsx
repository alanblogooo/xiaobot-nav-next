"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Column } from "@/services/columns"
import { Button } from "@/components/ui/button"
import { BookOpen, Edit, Trash2, ExternalLink } from "lucide-react"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCategories } from "@/hooks/use-categories"
import { toast } from "sonner"

// 扩展 Column 类型
interface ExtendedColumn extends Omit<Column, 'category'> {
  category?: {
    id: string
    name: string
    createdAt: Date | null
    updatedAt: Date | null
  } | null
  onEdit?: (column: ExtendedColumn) => void
  onDelete?: (column: ExtendedColumn) => void
  _batch?: string[]
}

// 添加批量操作工具栏组件
interface BatchActionsProps {
  selectedRows: ExtendedColumn[]
  onBatchDelete: (ids: string[]) => Promise<void>
  onBatchPublish: (ids: string[], publish: boolean) => Promise<void>
  onBatchUpdateCategory: (ids: string[], categoryId: string) => Promise<void>
}

export function BatchActions({ 
  selectedRows,
  onBatchDelete,
  onBatchPublish,
  onBatchUpdateCategory
}: BatchActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const { data: categories = [] } = useCategories()
  
  const selectedIds = selectedRows.map(row => row.id)

  const handleBatchDelete = async () => {
    try {
      await onBatchDelete(selectedIds)
      toast.success("批量删除成功")
      setShowDeleteDialog(false)
    } catch (error) {
      console.error("批量删除失败:", error)
      toast.error("批量删除失败")
    }
  }

  const handleBatchPublish = async (publish: boolean) => {
    try {
      await onBatchPublish(selectedIds, publish)
      toast.success(publish ? "批量上架成功" : "批量下架成功")
    } catch (error) {
      console.error(publish ? "批量上架失败:" : "批量下架失败:", error)
      toast.error(publish ? "批量上架失败" : "批量下架失败")
    }
  }

  const handleBatchUpdateCategory = async () => {
    if (!selectedCategoryId) {
      toast.error("请选择分类")
      return
    }
    try {
      await onBatchUpdateCategory(selectedIds, selectedCategoryId)
      toast.success("批量修改分类成功")
      setShowCategoryDialog(false)
      setSelectedCategoryId("")
    } catch (error) {
      console.error("批量修改分类失败:", error)
      toast.error("批量修改分类失败")
    }
  }

  if (selectedRows.length === 0) return null

  return (
    <div className="mb-4 flex items-center gap-2">
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setShowDeleteDialog(true)}
      >
        批量删除
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => handleBatchPublish(true)}
      >
        批量上架
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => handleBatchPublish(false)}
      >
        批量下架
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setShowCategoryDialog(true)}
      >
        批量修改分类
      </Button>

      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除选中的 {selectedRows.length} 条数据吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleBatchDelete}>确认</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 修改分类对话框 */}
      <AlertDialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>修改分类</AlertDialogTitle>
            <AlertDialogDescription>
              请选择新的分类
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="选择分类" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category: { id: string; name: string }) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleBatchUpdateCategory}>
              保存
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

BatchActions.displayName = "BatchActions"

export const columnsConfig: ColumnDef<ExtendedColumn>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "avatar",
    header: "头像",
    cell: ({ row }) => {
      const avatar = row.original.avatar
      return avatar ? (
        <div className="relative h-10 w-10">
          <Image
            src={avatar}
            alt={row.original.name}
            fill
            className="rounded-sm object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-muted">
          <BookOpen className="h-5 w-5 text-muted-foreground" />
        </div>
      )
    },
  },
  {
    accessorKey: "name",
    header: "名称",
  },
  {
    accessorKey: "author",
    header: "作者",
  },
  {
    accessorKey: "subscribers",
    header: "订阅数",
  },
  {
    accessorKey: "contentCount",
    header: "内容数",
  },
  {
    accessorKey: "categoryId",
    header: "分类",
    cell: ({ row }) => row.original.category?.name || "未分类",
  },
  {
    accessorKey: "isPublished",
    header: "状态",
    cell: ({ row }) => (
      <span className={row.original.isPublished ? "text-green-500" : "text-gray-500"}>
        {row.original.isPublished ? "已发布" : "未发布"}
      </span>
    ),
  },
  {
    id: "actions",
    header: "操作",
    cell: ({ row }) => {
      const column = row.original
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open(column.url, "_blank")}
            title="访问链接"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => column.onEdit?.(column)}
            title="编辑"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => column.onDelete?.(column)}
            title="删除"
            className="text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
] 