// Performance monitoring utilities for debugging and optimization

export interface PerformanceMetrics {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  memory?: {
    used: number;
    total: number;
  };
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();

  // Start timing an operation
  start(name: string): void {
    const startTime = performance.now();
    this.metrics.set(name, {
      name,
      startTime,
      memory: this.getMemoryUsage()
    });
  }

  // End timing an operation
  end(name: string): PerformanceMetrics | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`🟡 Performance: No start time found for ${name}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;
    
    const updatedMetric: PerformanceMetrics = {
      ...metric,
      endTime,
      duration,
      memory: this.getMemoryUsage()
    };

    this.metrics.set(name, updatedMetric);
    
    // Log performance info
    if (duration > 1000) {
      // console.warn(`🟡 Performance: ${name} took ${duration.toFixed(2)}ms (slow)`);
    } else {
    }

    return updatedMetric;
  }

  // Get memory usage if available
  private getMemoryUsage(): { used: number; total: number } | undefined {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize
      };
    }
    return undefined;
  }

  // Get all metrics
  getAllMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  // Clear metrics
  clear(): void {
    this.metrics.clear();
  }

  // Get slow operations (> 1 second)
  getSlowOperations(): PerformanceMetrics[] {
    return this.getAllMetrics().filter(m => m.duration && m.duration > 1000);
  }

  // Log summary
  logSummary(): void {
    const allMetrics = this.getAllMetrics();
    const completedMetrics = allMetrics.filter(m => m.duration !== undefined);
    
    console.group('📊 Performance Summary');
    
    if (completedMetrics.length > 0) {
      const totalTime = completedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);
      const avgTime = totalTime / completedMetrics.length;
      
      const slowOps = this.getSlowOperations();
      if (slowOps.length > 0) {
        // console.warn(`Slow operations (>1s): ${slowOps.length}`);
        // slowOps.forEach(op => {
        //   console.warn(`  - ${op.name}: ${op.duration?.toFixed(2)}ms`);
        // });
      }
    }
    console.groupEnd();
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Utility function to measure async operations
export async function measureAsync<T>(
  name: string, 
  operation: () => Promise<T>
): Promise<T> {
  performanceMonitor.start(name);
  try {
    const result = await operation();
    performanceMonitor.end(name);
    return result;
  } catch (error) {
    performanceMonitor.end(name);
    throw error;
  }
}

// Utility function to measure sync operations
export function measureSync<T>(
  name: string, 
  operation: () => T
): T {
  performanceMonitor.start(name);
  try {
    const result = operation();
    performanceMonitor.end(name);
    return result;
  } catch (error) {
    performanceMonitor.end(name);
    throw error;
  }
}

// Log performance metrics on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    performanceMonitor.logSummary();
  });
}
