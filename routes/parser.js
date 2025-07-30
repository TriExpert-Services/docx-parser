const express = require('express');
const multer = require('multer');
const { parseDocxToText, parseDocxToHtml } = require('../utils/mammothParser');

const router = express.Router();

// Configuración de multer para manejo de archivos
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB límite
  },
  fileFilter: (req, file, cb) => {
    // Verificar que sea un archivo .docx
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.originalname.toLowerCase().endsWith('.docx')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos .docx'), false);
    }
  }
});

// Endpoint para parsear DOCX a texto plano
router.post('/parse', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload a .docx file'
      });
    }

    console.log(`📄 Processing file: ${req.file.originalname} (${req.file.size} bytes)`);

    const result = await parseDocxToText(req.file.buffer);
    
    res.json({
      success: true,
      filename: req.file.originalname,
      fileSize: req.file.size,
      extractedText: result.value,
      messages: result.messages.length > 0 ? result.messages : undefined,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error parsing DOCX:', error);
    res.status(500).json({
      error: 'Failed to parse DOCX file',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint para parsear DOCX a HTML
router.post('/parse-html', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload a .docx file'
      });
    }

    console.log(`📄 Processing file to HTML: ${req.file.originalname} (${req.file.size} bytes)`);

    const result = await parseDocxToHtml(req.file.buffer);
    
    res.json({
      success: true,
      filename: req.file.originalname,
      fileSize: req.file.size,
      extractedHtml: result.value,
      messages: result.messages.length > 0 ? result.messages : undefined,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error parsing DOCX to HTML:', error);
    res.status(500).json({
      error: 'Failed to parse DOCX file to HTML',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint para parsear desde base64 (útil para n8n)
router.post('/parse-base64', async (req, res) => {
  try {
    const { fileData, filename } = req.body;

    if (!fileData) {
      return res.status(400).json({
        error: 'No file data provided',
        message: 'Please provide fileData in base64 format'
      });
    }

    // Convertir base64 a buffer
    const buffer = Buffer.from(fileData, 'base64');
    
    console.log(`📄 Processing base64 file: ${filename || 'unknown'} (${buffer.length} bytes)`);

    const result = await parseDocxToText(buffer);
    
    res.json({
      success: true,
      filename: filename || 'unknown',
      fileSize: buffer.length,
      extractedText: result.value,
      messages: result.messages.length > 0 ? result.messages : undefined,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error parsing base64 DOCX:', error);
    res.status(500).json({
      error: 'Failed to parse base64 DOCX file',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;