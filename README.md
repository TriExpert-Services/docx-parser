# Mammoth DOCX Parser Service

Servicio API en Docker para parsear archivos .docx usando la librería Mammoth. Diseñado para integrarse fácilmente con n8n y otros sistemas de automatización.

## 🚀 Características

- **API REST** para parsear archivos .docx
- **Múltiples formatos de salida**: texto plano y HTML
- **Soporte para archivos base64** (ideal para n8n)
- **Docker containerizado** para fácil despliegue
- **Health checks** integrados
- **Manejo de errores robusto**
- **Límites de seguridad** para tamaño de archivos

## 📋 Endpoints Disponibles

### `POST /api/parse`
Parsea un archivo .docx a texto plano.

**Parámetros:**
- `file`: Archivo .docx (multipart/form-data)

**Respuesta:**
```json
{
  "success": true,
  "filename": "documento.docx",
  "fileSize": 12345,
  "extractedText": "Contenido del documento...",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

### `POST /api/parse-html`
Parsea un archivo .docx a HTML.

**Parámetros:**
- `file`: Archivo .docx (multipart/form-data)

### `POST /api/parse-base64`
Parsea un archivo .docx desde datos base64 (útil para n8n).

**Parámetros:**
```json
{
  "fileData": "UEsDBBQAAAAIAB...",
  "filename": "documento.docx"
}
```

### `GET /health`
Health check del servicio.

### `GET /metrics`
Interfaz web para visualizar métricas del servicio en tiempo real.

### `GET /metrics/data`
Obtener métricas en formato JSON.

**Respuesta:**
```json
{
  "success": true,
  "metrics": {
    "totalRequests": 150,
    "successfulRequests": 145,
    "failedRequests": 5,
    "totalFilesProcessed": 145,
    "averageProcessingTime": 1250.5,
    "uptime": {
      "formatted": "2h 30m 15s"
    },
    "memoryUsage": {
      "rss": 85,
      "heapUsed": 45
    }
  }
}
```

### `GET /metrics/prometheus`
Métricas en formato Prometheus para integración con sistemas de monitoreo.

### `GET /`
Información del API y endpoints disponibles.

## 🐳 Uso con Docker

### Construcción y ejecución rápida:

```bash
# Construir la imagen
docker build -t mammoth-parser .

# Ejecutar el contenedor
docker run -p 3330:3330 mammoth-parser
```

### Uso con Docker Compose:

```bash
# Iniciar el servicio
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener el servicio
docker-compose down
```

## 🔧 Integración con n8n

### Método 1: Upload de archivo
1. Usa el nodo **HTTP Request**
2. Configura:
   - **Method**: POST
   - **URL**: `http://localhost:3330/api/parse`
   - **Body**: Form-Data
   - **Key**: `file`, **Value**: (archivo .docx)

### Método 2: Base64 (recomendado para n8n)
1. Usa el nodo **HTTP Request**
2. Configura:
   - **Method**: POST
   - **URL**: `http://localhost:3330/api/parse-base64`
   - **Body**: JSON
   ```json
   {
     "fileData": "{{ $node['Read Binary File'].binary.data }}",
     "filename": "{{ $node['Read Binary File'].binary.fileName }}"
   }
   ```

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Ejecutar en producción
npm start
```

## 📝 Configuración

Variables de entorno disponibles:
- `PORT`: Puerto del servidor (default: 3330)
- `NODE_ENV`: Entorno de ejecución

## 🔒 Seguridad

- Límite de tamaño de archivo: 10MB
- Validación de tipo de archivo
- Headers de seguridad con Helmet
- Usuario no-root en Docker
- Manejo seguro de errores

## 📊 Monitoreo

El servicio incluye:
- **Health check** en `/health`
- **Dashboard de métricas** en `/metrics` con:
  - Estadísticas en tiempo real
  - Gráficos de rendimiento
  - Historial de actividad
  - Uso de memoria y CPU
  - Auto-refresh cada 5 segundos
- **Métricas JSON** en `/metrics/data`
- **Métricas Prometheus** en `/metrics/prometheus`
- **Logs estructurados** con información detallada

### Métricas disponibles:
- Total de requests y tasa de éxito
- Archivos procesados y bytes totales
- Tiempo promedio de procesamiento
- Uso de memoria en tiempo real
- Estadísticas por endpoint
- Historial de actividad reciente
- Uptime del servicio
## ⚡ Rendimiento

- Procesamiento en memoria para mejor rendimiento
- Limits configurables para prevenir sobrecarga
- Cleanup automático de recursos

## 🐛 Troubleshooting

### Error: "Solo se permiten archivos .docx"
- Verifica que el archivo tenga extensión .docx
- Confirma que el MIME type sea correcto

### Error de memoria
- Reduce el tamaño del archivo
- Ajusta los límites en la configuración

### Servicio no responde
- Verifica el health check: `curl http://localhost:3330/health`
- Revisa los logs: `docker-compose logs mammoth-parser`