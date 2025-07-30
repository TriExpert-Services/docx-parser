const mammoth = require('mammoth');

/**
 * Parsea un archivo DOCX a texto plano usando Mammoth
 * @param {Buffer} buffer - Buffer del archivo DOCX
 * @returns {Promise<Object>} - Resultado con texto extraído y mensajes
 */
async function parseDocxToText(buffer) {
  try {
    const options = {
      // Opciones para mejorar la extracción de texto
      convertImage: mammoth.images.imgElement(function(image) {
        // Manejar imágenes - por ahora las ignoramos
        return image.read("base64").then(function(imageBuffer) {
          return {
            src: "data:" + image.contentType + ";base64," + imageBuffer
          };
        });
      })
    };

    const result = await mammoth.extractRawText(buffer, options);
    
    return {
      value: result.value.trim(),
      messages: result.messages || []
    };
  } catch (error) {
    throw new Error(`Error parsing DOCX to text: ${error.message}`);
  }
}

/**
 * Parsea un archivo DOCX a HTML usando Mammoth
 * @param {Buffer} buffer - Buffer del archivo DOCX
 * @returns {Promise<Object>} - Resultado con HTML extraído y mensajes
 */
async function parseDocxToHtml(buffer) {
  try {
    const options = {
      // Configuraciones para la conversión a HTML
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Title'] => h1:fresh",
        "r[style-name='Strong'] => strong",
        "r[style-name='Emphasis'] => em"
      ],
      convertImage: mammoth.images.imgElement(function(image) {
        return image.read("base64").then(function(imageBuffer) {
          return {
            src: "data:" + image.contentType + ";base64," + imageBuffer
          };
        });
      })
    };

    const result = await mammoth.convertToHtml(buffer, options);
    
    return {
      value: result.value,
      messages: result.messages || []
    };
  } catch (error) {
    throw new Error(`Error parsing DOCX to HTML: ${error.message}`);
  }
}

/**
 * Extrae metadata básica del documento
 * @param {Buffer} buffer - Buffer del archivo DOCX
 * @returns {Promise<Object>} - Información básica del documento
 */
async function extractDocumentInfo(buffer) {
  try {
    // Mammoth no proporciona directamente metadata, pero podemos extraer información básica
    const textResult = await parseDocxToText(buffer);
    const htmlResult = await parseDocxToHtml(buffer);
    
    return {
      textLength: textResult.value.length,
      wordCount: textResult.value.split(/\s+/).filter(word => word.length > 0).length,
      hasImages: htmlResult.value.includes('<img'),
      hasTables: htmlResult.value.includes('<table'),
      messages: [...textResult.messages, ...htmlResult.messages]
    };
  } catch (error) {
    throw new Error(`Error extracting document info: ${error.message}`);
  }
}

module.exports = {
  parseDocxToText,
  parseDocxToHtml,
  extractDocumentInfo
};