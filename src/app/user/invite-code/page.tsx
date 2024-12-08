"use client"

import * as React from "react"
import { toast, Toaster } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { getInviteCode, updateInviteCode } from "@/services/rebates"
import useSWR from "swr"

export default function InviteCodePage() {
  const [isUpdating, setIsUpdating] = React.useState(false)
  const { data: inviteCode, mutate } = useSWR('inviteCode', getInviteCode)
  const [code, setCode] = React.useState("")

  // 当获取到数据时，更新输入框的值
  React.useEffect(() => {
    if (inviteCode?.code) {
      setCode(inviteCode.code)
    }
  }, [inviteCode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    try {
      await updateInviteCode(code)
      toast.success("邀请码已更新")
      mutate()
    } catch (error) {
      console.error("更新邀请码失败:", error)
      toast.error("更新邀请码失败")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Toaster position="top-right" />
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-2xl font-bold">🔗 邀请码管理</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4 mt-6">
        <div className="space-y-2">
          <Label htmlFor="invite-code">邀请码</Label><br></br>
          <p className="text-sm text-gray-500">邀请码是小报童邀请返利的唯一标识</p>
          <Input
            id="invite-code"
            placeholder="请输入邀请码"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="font-mono"
          />
        </div>
        <Button type="submit" disabled={isUpdating}>
          {isUpdating ? "保存中..." : "保存"}
        </Button>
      </form>
    </div>
  )
} 