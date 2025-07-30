const express = require('express');
const path = require('path');
const metricsCollector = require('../utils/metricsCollector');

const router = express.Router();

// Endpoint para obtener métricas en formato JSON
router.get('/data', (req, res) => {
  try {
    const metrics = metricsCollector.getMetrics();
    res.json({
      success: true,
      metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve metrics',
      message: error.message
    });
  }
});

// Endpoint para la interfaz web de métricas
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/metrics.html'));
});

// Endpoint para resetear métricas (útil para testing)
router.post('/reset', (req, res) => {
  try {
    metricsCollector.reset();
    res.json({
      success: true,
      message: 'Metrics reset successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to reset metrics',
      message: error.message
    });
  }
});

// Endpoint para métricas en formato Prometheus (opcional)
router.get('/prometheus', (req, res) => {
  try {
    const metrics = metricsCollector.getMetrics();
    
    let prometheusMetrics = '';
    prometheusMetrics += `# HELP mammoth_total_requests Total number of requests\n`;
    prometheusMetrics += `# TYPE mammoth_total_requests counter\n`;
    prometheusMetrics += `mammoth_total_requests ${metrics.totalRequests}\n\n`;
    
    prometheusMetrics += `# HELP mammoth_successful_requests Total number of successful requests\n`;
    prometheusMetrics += `# TYPE mammoth_successful_requests counter\n`;
    prometheusMetrics += `mammoth_successful_requests ${metrics.successfulRequests}\n\n`;
    
    prometheusMetrics += `# HELP mammoth_failed_requests Total number of failed requests\n`;
    prometheusMetrics += `# TYPE mammoth_failed_requests counter\n`;
    prometheusMetrics += `mammoth_failed_requests ${metrics.failedRequests}\n\n`;
    
    prometheusMetrics += `# HELP mammoth_files_processed Total number of files processed\n`;
    prometheusMetrics += `# TYPE mammoth_files_processed counter\n`;
    prometheusMetrics += `mammoth_files_processed ${metrics.totalFilesProcessed}\n\n`;
    
    prometheusMetrics += `# HELP mammoth_bytes_processed Total bytes processed\n`;
    prometheusMetrics += `# TYPE mammoth_bytes_processed counter\n`;
    prometheusMetrics += `mammoth_bytes_processed ${metrics.totalBytesProcessed}\n\n`;
    
    prometheusMetrics += `# HELP mammoth_average_processing_time Average processing time in milliseconds\n`;
    prometheusMetrics += `# TYPE mammoth_average_processing_time gauge\n`;
    prometheusMetrics += `mammoth_average_processing_time ${metrics.averageProcessingTime}\n\n`;
    
    prometheusMetrics += `# HELP mammoth_memory_usage_mb Memory usage in MB\n`;
    prometheusMetrics += `# TYPE mammoth_memory_usage_mb gauge\n`;
    prometheusMetrics += `mammoth_memory_usage_mb{type="rss"} ${metrics.memoryUsage.rss}\n`;
    prometheusMetrics += `mammoth_memory_usage_mb{type="heap_used"} ${metrics.memoryUsage.heapUsed}\n`;
    prometheusMetrics += `mammoth_memory_usage_mb{type="heap_total"} ${metrics.memoryUsage.heapTotal}\n\n`;
    
    res.set('Content-Type', 'text/plain');
    res.send(prometheusMetrics);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate Prometheus metrics',
      message: error.message
    });
  }
});

module.exports = router;