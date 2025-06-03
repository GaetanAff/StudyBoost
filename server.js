const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs =require('fs');
require('dotenv').config();

const { processDocument } = require('./utils/documentProcessor');
const { generateContent } = require('./utils/aiService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|ppt|pptx|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Type de fichier non supporté. Formats autorisés : PDF, DOC, DOCX, PPT, PPTX, JPG, JPEG, PNG.'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier uploadé' });
    }

    const filePath = req.file.path;
    const extractedText = await processDocument(filePath);
    
    fs.unlink(filePath, (err) => { 
        if (err) console.error("Erreur lors de la suppression du fichier temporaire:", err);
    });
    
    res.json({ 
      success: true, 
      text: extractedText,
      filename: req.file.originalname
    });
  } catch (error) {
    console.error('Erreur upload:', error);
    if (error.message.startsWith('Type de fichier non supporté')) {
        return res.status(415).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erreur lors du traitement du document. ' + error.message });
  }
});

app.post('/api/generate', async (req, res) => {
  const requestTimestamp = new Date().toISOString();
  console.log(`[${requestTimestamp}] Requête reçue pour /api/generate`);

  try {
    const { text, type, options = {}, apiKey, language = 'fr' } = req.body; // options will include difficultyLevel

    if (!text || !type || !apiKey) {
      console.log(`[${requestTimestamp}] Paramètres manquants.`);
      return res.status(400).json({ error: 'Paramètres manquants: texte, type ou clé API.' });
    }

    console.log(`[${requestTimestamp}] Appel de generateContent avec type: ${type}, lang: ${language}, options: ${JSON.stringify(options)}`);
    const generationResult = await generateContent(text, type, options, apiKey, language); // Pass options (including difficultyLevel)
    
    console.log(`[${requestTimestamp}] Succès de la génération.`);
    res.json({ success: true, content: generationResult });

  } catch (error) {
    console.error(`[${requestTimestamp}] Erreur API Gemini ou service:`, error.message, error.stack);
    res.status(500).json({ error: error.message || 'Erreur lors de la génération de contenu par l\'IA.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 StudyBoost démarré sur http://localhost:${PORT}`);
});
