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
import { type Category } from "@/services/categories"

interface DeleteCategoryDialogProps {
  category: Category | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteCategoryDialog({
  category,
  open,
  onOpenChange,
  onSuccess,
}: DeleteCategoryDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDelete = async () => {
    if (!category) return
    setIsDeleting(true)
    
    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'DELETE',
      })
      const data = await response.json().catch(() => null)
      
      if (response.status === 204) {
        onOpenChange(false)
        onSuccess?.()
        toast.success("删除成功")
      } else if (data?.error === "CATEGORY_HAS_COLUMNS") {
        toast.error(data.message || "该分类下存在专栏，无法删除。请先移除或修改相关专栏的分类。")
      } else if (data?.error === "Category not found") {
        toast.error("分类不存在或已被删除")
        onOpenChange(false)
      } else {
        toast.error(data?.message || "删除失败，请重试")
      }
    } catch (error) {
      console.error("Failed to delete category:", error)
      toast.error("删除失败，请重试")
    } finally {
      setIsDeleting(false)
    }
  }

  if (!category) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>删除分类</DialogTitle>
          <DialogDescription>
            确定要删除分类 &quot;{category.name}&quot; 吗？此操作不可撤销。
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