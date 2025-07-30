const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const parserRoutes = require('./routes/parser');
const metricsRoutes = require('./routes/metrics');
const metricsCollector = require('./utils/metricsCollector');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de seguridad y configuración
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos
app.use('/public', express.static(path.join(__dirname, 'public')));

// Middleware para recopilar métricas
app.use((req, res, next) => {
  const startTime = Date.now();
  
  // Incrementar contador de requests si es un endpoint de API
  if (req.path.startsWith('/api/')) {
    metricsCollector.incrementRequests(req.path);
  }

  // Interceptar la respuesta para recopilar métricas
  const originalJson = res.json;
  res.json = function(data) {
    const processingTime = Date.now() - startTime;
    
    if (req.path.startsWith('/api/') && data) {
      if (data.success) {
        metricsCollector.recordSuccessfulProcessing(
          req.path,
          data.filename || 'unknown',
          data.fileSize || 0,
          processingTime
        );
      } else if (data.error) {
        metricsCollector.recordError(
          req.path,
          data.error,
          data.message || 'Unknown error'
        );
      }
    }
    
    return originalJson.call(this, data);
  };
  
  next();
});

// Rutas
app.use('/api', parserRoutes);
app.use('/metrics', metricsRoutes);

// Ruta de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Mammoth DOCX Parser Service is running',
    timestamp: new Date().toISOString()
  });
});

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    service: 'Mammoth DOCX Parser API',
    version: '1.0.0',
    endpoints: {
      'POST /api/parse': 'Parse .docx file to text',
      'POST /api/parse-html': 'Parse .docx file to HTML',
      'POST /api/parse-base64': 'Parse .docx file from base64',
      'GET /metrics': 'View metrics dashboard',
      'GET /metrics/data': 'Get metrics data (JSON)',
      'GET /metrics/prometheus': 'Get metrics in Prometheus format',
      'GET /health': 'Health check'
    }
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist`
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Mammoth DOCX Parser Service running on port ${PORT}`);
  console.log(`📝 Health check available at http://localhost:${PORT}/health`);
  console.log(`📄 API documentation at http://localhost:${PORT}/`);
});

module.exports = app;