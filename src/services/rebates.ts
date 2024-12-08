export interface InviteCode {
  id: number;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getInviteCode() {
  const response = await fetch('/api/invite-code')
  if (!response.ok) {
    throw new Error('Failed to fetch invite code')
  }
  return response.json()
}

export async function updateInviteCode(code: string) {
  const response = await fetch("/api/invite-code", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  })
  if (!response.ok) {
    throw new Error("更新邀请码失败")
  }
  return response.json()
} 