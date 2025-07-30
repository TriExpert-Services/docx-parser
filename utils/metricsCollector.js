class MetricsCollector {
  constructor() {
    this.metrics = {
      startTime: Date.now(),
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalFilesProcessed: 0,
      totalBytesProcessed: 0,
      averageProcessingTime: 0,
      processingTimes: [],
      largestFileSize: 0,
      smallestFileSize: Infinity,
      requestsByEndpoint: {
        '/api/parse': 0,
        '/api/parse-html': 0,
        '/api/parse-base64': 0
      },
      errorsByType: {},
      hourlyStats: {},
      lastRequests: []
    };
  }

  // Incrementar contador de requests
  incrementRequests(endpoint) {
    this.metrics.totalRequests++;
    if (this.metrics.requestsByEndpoint[endpoint] !== undefined) {
      this.metrics.requestsByEndpoint[endpoint]++;
    }
    
    // Actualizar estadísticas por hora
    const hour = new Date().getHours();
    if (!this.metrics.hourlyStats[hour]) {
      this.metrics.hourlyStats[hour] = 0;
    }
    this.metrics.hourlyStats[hour]++;
  }

  // Registrar procesamiento exitoso
  recordSuccessfulProcessing(endpoint, filename, fileSize, processingTime) {
    this.metrics.successfulRequests++;
    this.metrics.totalFilesProcessed++;
    this.metrics.totalBytesProcessed += fileSize;

    // Actualizar tiempos de procesamiento
    this.metrics.processingTimes.push(processingTime);
    if (this.metrics.processingTimes.length > 100) {
      this.metrics.processingTimes = this.metrics.processingTimes.slice(-100);
    }
    
    // Calcular tiempo promedio
    const sum = this.metrics.processingTimes.reduce((a, b) => a + b, 0);
    this.metrics.averageProcessingTime = sum / this.metrics.processingTimes.length;

    // Actualizar tamaños de archivo
    if (fileSize > this.metrics.largestFileSize) {
      this.metrics.largestFileSize = fileSize;
    }
    if (fileSize < this.metrics.smallestFileSize) {
      this.metrics.smallestFileSize = fileSize;
    }

    // Mantener historial de últimas requests
    this.metrics.lastRequests.unshift({
      timestamp: new Date().toISOString(),
      endpoint,
      filename,
      fileSize,
      processingTime,
      status: 'success'
    });
    
    if (this.metrics.lastRequests.length > 50) {
      this.metrics.lastRequests = this.metrics.lastRequests.slice(0, 50);
    }
  }

  // Registrar error
  recordError(endpoint, errorType, errorMessage) {
    this.metrics.failedRequests++;
    
    if (!this.metrics.errorsByType[errorType]) {
      this.metrics.errorsByType[errorType] = 0;
    }
    this.metrics.errorsByType[errorType]++;

    // Mantener historial de errores
    this.metrics.lastRequests.unshift({
      timestamp: new Date().toISOString(),
      endpoint,
      errorType,
      errorMessage,
      status: 'error'
    });
    
    if (this.metrics.lastRequests.length > 50) {
      this.metrics.lastRequests = this.metrics.lastRequests.slice(0, 50);
    }
  }

  // Obtener todas las métricas
  getMetrics() {
    const uptime = Date.now() - this.metrics.startTime;
    const memoryUsage = process.memoryUsage();
    
    return {
      ...this.metrics,
      uptime: {
        milliseconds: uptime,
        seconds: Math.floor(uptime / 1000),
        minutes: Math.floor(uptime / (1000 * 60)),
        hours: Math.floor(uptime / (1000 * 60 * 60)),
        formatted: this.formatUptime(uptime)
      },
      successRate: this.metrics.totalRequests > 0 
        ? ((this.metrics.successfulRequests / this.metrics.totalRequests) * 100).toFixed(2)
        : 0,
      averageFileSize: this.metrics.totalFilesProcessed > 0
        ? Math.round(this.metrics.totalBytesProcessed / this.metrics.totalFilesProcessed)
        : 0,
      requestsPerHour: this.metrics.totalRequests > 0
        ? (this.metrics.totalRequests / Math.max(1, uptime / (1000 * 60 * 60))).toFixed(2)
        : 0,
      memoryUsage: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024) // MB
      },
      smallestFileSize: this.metrics.smallestFileSize === Infinity ? 0 : this.metrics.smallestFileSize
    };
  }

  // Formatear uptime
  formatUptime(uptime) {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  // Resetear métricas
  reset() {
    const startTime = this.metrics.startTime;
    this.metrics = {
      startTime,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalFilesProcessed: 0,
      totalBytesProcessed: 0,
      averageProcessingTime: 0,
      processingTimes: [],
      largestFileSize: 0,
      smallestFileSize: Infinity,
      requestsByEndpoint: {
        '/api/parse': 0,
        '/api/parse-html': 0,
        '/api/parse-base64': 0
      },
      errorsByType: {},
      hourlyStats: {},
      lastRequests: []
    };
  }
}

// Singleton instance
const metricsCollector = new MetricsCollector();

module.exports = metricsCollector;