const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');
const libre = require('libreoffice-convert');
libre.convertAsync = require('util').promisify(libre.convert);
const libreOptions = process.env.SOFFICE_PATH ? { sofficeBinaryPaths: [process.env.SOFFICE_PATH] } : {};

async function processDocument(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  try {
    switch (ext) {
      case '.pdf':
        return await processPDF(filePath);
      case '.doc':
      case '.docx':
        return await processWord(filePath);
      case '.odt':
        return await processODT(filePath);
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

async function processODT(filePath) {
  const ext = '.docx';
  const inputPath = filePath;
  const outputPath = path.join(__dirname, '../uploads/output.docx');

  const odtBuf = await fs.promises.readFile(inputPath);
  const docxBuf = await libre.convertAsync(odtBuf, ext, libreOptions);
  fs.writeFileSync(outputPath, docxBuf);
  const text = await processWord(outputPath);
  fs.unlink(outputPath, () => {});
  return text;
}

async function processImage(filePath) {
  const { data: { text } } = await Tesseract.recognize(filePath, 'fra+eng');
  return text;
}

module.exports = { processDocument };
