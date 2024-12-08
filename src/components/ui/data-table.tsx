"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  RowSelectionState,
  getPaginationRowModel,
} from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, ChevronsLeft } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[]
  data: TData[]
  pageCount: number
  pageIndex: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onRowSelectionChange?: (rows: TData[]) => void
}

export interface DataTableRef {
  resetSelection: () => void
}

export const DataTable = React.forwardRef<DataTableRef, DataTableProps<any>>(({
  columns,
  data,
  pageCount,
  pageIndex,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onRowSelectionChange,
}, ref) => {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const tableInstance = React.useRef<any>(null)
  const previousSelectionRef = React.useRef<RowSelectionState>({})
  
  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount,
    state: {
      rowSelection,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    enableRowSelection: true,
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater
      setRowSelection(newSelection)
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({
          pageIndex,
          pageSize,
        })
        onPageChange(newState.pageIndex)
        if (newState.pageSize !== pageSize) {
          onPageSizeChange(newState.pageSize)
        }
      }
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  })

  tableInstance.current = table

  // 优化选择状态变化的处理
  React.useEffect(() => {
    // 如果选择状态没有实际变化，直接返回
    if (JSON.stringify(rowSelection) === JSON.stringify(previousSelectionRef.current)) {
      return
    }
    
    previousSelectionRef.current = rowSelection
    
    if (Object.keys(rowSelection).length === 0) {
      onRowSelectionChange?.([])
      return
    }

    // 使用 requestAnimationFrame 来防止过于频繁的更新
    const timeoutId = requestAnimationFrame(() => {
      if (!tableInstance.current) return
      
      const selectedRows = tableInstance.current
        .getRowModel()
        .rows.filter((row: any) => rowSelection[row.id])
        .map((row: any) => row.original)
      
      onRowSelectionChange?.(selectedRows)
    })

    return () => cancelAnimationFrame(timeoutId)
  }, [rowSelection, onRowSelectionChange])

  // 当数据变化时重置选择
  React.useEffect(() => {
    setRowSelection({})
  }, [data])

  // 暴露重置选择的方法
  React.useImperativeHandle(ref, () => ({
    resetSelection: () => {
      setRowSelection({})
    }
  }), [])

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            共 {total} 条数据
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">每页行数</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                onPageSizeChange?.(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={pageIndex === 0}
          >
            上一页
          </Button>
          <div className="text-sm text-muted-foreground">
            第 {pageIndex + 1} / {pageCount} 页
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={pageIndex >= pageCount - 1}
          >
            下一页
          </Button>
        </div>
      </div>
    </div>
  )
})

DataTable.displayName = "DataTable"