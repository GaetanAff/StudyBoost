const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');
const libre = require('libreoffice-convert');
const util = require('util');
libre.convertAsync = util.promisify(libre.convert);

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
        const convertedPath = await convertToDocx(filePath);
        const text = await processWord(convertedPath);
        fs.unlink(convertedPath, err => {
          if (err) console.error('Erreur suppression fichier converti:', err);
        });
        return text;
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

async function convertToDocx(inputPath) {
  const outputPath = path.join(
    path.dirname(inputPath),
    `${path.parse(inputPath).name}.docx`
  );
  const file = await fs.promises.readFile(inputPath);
  const converted = await libre.convertAsync(file, '.docx', undefined);
  await fs.promises.writeFile(outputPath, converted);
  return outputPath;
}

async function processImage(filePath) {
  const { data: { text } } = await Tesseract.recognize(filePath, 'fra+eng');
  return text;
}

module.exports = { processDocument };
