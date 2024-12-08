"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { deleteColumn, type Column } from "@/services/columns"

interface DeleteColumnDialogProps {
  column: (Column & { _batch?: string[] }) | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteColumnDialog({
  column,
  open,
  onOpenChange,
  onSuccess,
}: DeleteColumnDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDelete = async () => {
    if (!column) return
    setIsDeleting(true)

    try {
      if ('_batch' in column && column._batch) {
        // 批量删除
        await Promise.all(
          column._batch.map(id => deleteColumn(id))
        )
        onOpenChange(false)
        onSuccess?.()
        toast.success(`成功删除 ${column._batch.length} 个专栏`)
      } else {
        // 单个删除
        await deleteColumn(column.id)
        onOpenChange(false)
        onSuccess?.()
        toast.success("删除成功")
      }
    } catch (error) {
      console.error("Failed to delete column:", error)
      toast.error("删除失败")
    } finally {
      setIsDeleting(false)
    }
  }

  if (!column) return null

  const isBatchDelete = '_batch' in column && !!column._batch
  const deleteCount = isBatchDelete ? column._batch!.length : 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isBatchDelete ? "批量删除专栏" : "删除专栏"}</DialogTitle>
          <DialogDescription>
            {isBatchDelete 
              ? `确定要删除选中的 ${deleteCount} 个专栏吗？此操作不可撤销。`
              : `确定要删除专栏 "${column.name}" 吗？此操作不可撤销。`
            }
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            取消
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "删除中..." : "删除"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 