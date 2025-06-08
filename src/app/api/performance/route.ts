import { NextResponse } from "next/server"
import { PerformanceMonitor } from "@/lib/performance"

export async function GET() {
  try {
    const monitor = PerformanceMonitor.getInstance()
    const stats = monitor.getAllStats()
    
    return NextResponse.json({
      stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in GET /api/performance:', error)
    return NextResponse.json(
      { 
        error: "Failed to get performance stats",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const monitor = PerformanceMonitor.getInstance()
    monitor.clear()
    
    return NextResponse.json({
      message: "Performance stats cleared",
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in DELETE /api/performance:', error)
    return NextResponse.json(
      { 
        error: "Failed to clear performance stats",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
} 