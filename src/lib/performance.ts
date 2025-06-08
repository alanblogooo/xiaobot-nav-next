// 性能监控工具
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // 记录查询时间
  recordQueryTime(queryName: string, duration: number) {
    if (!this.metrics.has(queryName)) {
      this.metrics.set(queryName, [])
    }
    const times = this.metrics.get(queryName)!
    times.push(duration)
    
    // 只保留最近100次记录
    if (times.length > 100) {
      times.shift()
    }
  }

  // 获取查询统计信息
  getQueryStats(queryName: string) {
    const times = this.metrics.get(queryName)
    if (!times || times.length === 0) {
      return null
    }

    const avg = times.reduce((sum, time) => sum + time, 0) / times.length
    const min = Math.min(...times)
    const max = Math.max(...times)
    const count = times.length

    return { avg, min, max, count }
  }

  // 获取所有查询统计
  getAllStats() {
    const stats: Record<string, any> = {}
    for (const [queryName] of this.metrics) {
      stats[queryName] = this.getQueryStats(queryName)
    }
    return stats
  }

  // 清除统计数据
  clear() {
    this.metrics.clear()
  }
}

// 查询时间测量装饰器
export function measureQueryTime(queryName: string) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const method = descriptor.value!
    descriptor.value = async function (this: any, ...args: any[]) {
      const start = performance.now()
      try {
        const result = await method.apply(this, args)
        const duration = performance.now() - start
        PerformanceMonitor.getInstance().recordQueryTime(queryName, duration)
        
        // 在开发环境下输出性能信息
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔍 Query [${queryName}] took ${duration.toFixed(2)}ms`)
        }
        
        return result
      } catch (error) {
        const duration = performance.now() - start
        PerformanceMonitor.getInstance().recordQueryTime(`${queryName}_error`, duration)
        throw error
      }
    } as T
  }
}

// 简单的查询时间测量函数
export async function measureQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const start = performance.now()
  try {
    const result = await queryFn()
    const duration = performance.now() - start
    PerformanceMonitor.getInstance().recordQueryTime(queryName, duration)
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Query [${queryName}] took ${duration.toFixed(2)}ms`)
    }
    
    return result
  } catch (error) {
    const duration = performance.now() - start
    PerformanceMonitor.getInstance().recordQueryTime(`${queryName}_error`, duration)
    throw error
  }
} 