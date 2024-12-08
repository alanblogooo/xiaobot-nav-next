"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface PaginationProps {
  pageIndex: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

const PREV_TEXT = "上一页"
const NEXT_TEXT = "下一页"
const PAGE_TEXT = "第"
const PAGE_UNIT = "页"

export function Pagination({
  pageIndex,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize)
  
  const handlePrevious = React.useCallback(() => {
    if (pageIndex > 0) {
      onPageChange(pageIndex - 1)
    }
  }, [pageIndex, onPageChange])

  const handleNext = React.useCallback(() => {
    if (pageIndex < totalPages - 1) {
      onPageChange(pageIndex + 1)
    }
  }, [pageIndex, totalPages, onPageChange])

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrevious}
        disabled={pageIndex === 0}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        {PREV_TEXT}
      </Button>
      <div className="min-w-[100px] text-center">
        <span className="text-sm text-muted-foreground">
          {PAGE_TEXT} {pageIndex + 1} / {totalPages} {PAGE_UNIT}
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleNext}
        disabled={pageIndex >= totalPages - 1}
      >
        {NEXT_TEXT}
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  )
} 