"use client"

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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { updateColumn, type Column } from "@/services/columns"
import { getCategories, type Category } from "@/services/categories"

interface EditColumnDialogProps {
  column: Column | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (column: Column, changedFields: string[]) => void
}

export function EditColumnDialog({
  column,
  open,
  onOpenChange,
  onSuccess,
}: EditColumnDialogProps) {
  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    avatar: "",
    author: "",
    url: "",
    subscribers: 0,
    contentCount: 0,
    categoryId: "0",
    isPublished: false,
  })
  const [initialData, setInitialData] = React.useState<typeof formData | null>(null)
  const [categories, setCategories] = React.useState<Category[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    if (column) {
      const data = {
        name: column.name,
        description: column.description || "",
        avatar: column.avatar,
        author: column.author,
        url: column.url,
        subscribers: column.subscribers,
        contentCount: column.contentCount,
        categoryId: column.categoryId || "0",
        isPublished: column.isPublished,
      }
      setFormData(data)
      setInitialData(data)
    }
  }, [column])

  React.useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error("加载分类失败:", error)
        toast.error("加载分类失败")
      }
    }
    loadCategories()
  }, [])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: id === 'subscribers' || id === 'contentCount' ? parseInt(value) || 0 : value
    }))
  }

  const getChangedFields = () => {
    if (!initialData) return []
    const changedFields: string[] = []
    
    Object.keys(formData).forEach((key) => {
      if (formData[key as keyof typeof formData] !== initialData[key as keyof typeof formData]) {
        changedFields.push(key)
      }
    })
    
    return changedFields
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!column) return

    setIsLoading(true)
    try {
      const updatedColumn = await updateColumn(column.id, {
        name: formData.name,
        description: formData.description,
        avatar: formData.avatar,
        author: formData.author,
        url: formData.url,
        subscribers: formData.subscribers,
        contentCount: formData.contentCount,
        categoryId: formData.categoryId === "0" ? null : formData.categoryId,
        isPublished: formData.isPublished,
      })
      onSuccess(updatedColumn, getChangedFields())
      onOpenChange(false)
      toast.success("更新成功")
    } catch (error) {
      console.error("更新专栏失败:", error)
      toast.error("更新失败")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑专栏</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="avatar">
              专栏头像链接
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="avatar"
              value={formData.avatar}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">
              专栏名称
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author">
              专栏作者
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="author"
              value={formData.author}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">专栏简介</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">
              专栏地址
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="url"
              value={formData.url}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subscribers">订阅数量</Label>
              <Input
                id="subscribers"
                type="number"
                min="0"
                value={formData.subscribers}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contentCount">内容数量</Label>
              <Input
                id="contentCount"
                type="number"
                min="0"
                value={formData.contentCount}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">专栏分类</Label>
            <Select 
              value={formData.categoryId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
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
          <div className="flex items-center justify-between">
            <Label htmlFor="published">上架状态</Label>
            <Switch
              id="published"
              checked={formData.isPublished}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: checked }))}
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