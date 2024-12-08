import * as React from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateCategory, type Category } from "@/services/categories"

interface EditCategoryDialogProps {
  category: Category | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditCategoryDialog({
  category,
  open,
  onOpenChange,
  onSuccess,
}: EditCategoryDialogProps) {
  const [name, setName] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    if (category) {
      setName(category.name)
    }
  }, [category])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!category) return

    if (!name.trim()) {
      toast.error("请输入分类名称")
      return
    }

    setIsLoading(true)
    try {
      await updateCategory(category.id, { name: name.trim() })
      onOpenChange(false)
      onSuccess?.()
      toast.success("更新成功")
    } catch (error) {
      console.error("更新分类失败:", error)
      toast.error("更新失败")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑分类</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              分类名称
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 