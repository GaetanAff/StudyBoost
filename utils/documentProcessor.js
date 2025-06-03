const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');

async function processDocument(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  try {
    switch (ext) {
      case '.pdf':
        return await processPDF(filePath);
      case '.doc':
      case '.docx':
        return await processWord(filePath);
      case '.jpg':
      case '.jpeg':
      case '.png':
        return await processImage(filePath);
      default:
        throw new Error('Format de fichier non supporté');
    }
  } catch (error) {
    console.error('Erreur traitement document:', error);
    throw error;
  }
}

async function processPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

async function processWord(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

async function processImage(filePath) {
  const { data: { text } } = await Tesseract.recognize(filePath, 'fra+eng');
  return text;
}

module.exports = { processDocument };
