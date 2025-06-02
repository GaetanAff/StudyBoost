const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Importation des modules de traitement
const { processDocument } = require('./utils/documentProcessor');
const { generateContent } = require('./utils/aiService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuration multer pour l'upload de fichiers
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
      cb(new Error('Type de fichier non supporté'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// Routes principales
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Upload et traitement de document
app.post('/api/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier uploadé' });
    }

    const filePath = req.file.path;
    const extractedText = await processDocument(filePath);
    
    // Nettoyage du fichier temporaire
    fs.unlinkSync(filePath);
    
    res.json({ 
      success: true, 
      text: extractedText,
      filename: req.file.originalname
    });
  } catch (error) {
    console.error('Erreur upload:', error);
    res.status(500).json({ error: 'Erreur lors du traitement du document' });
  }
});

// Appel gemini
app.post('/api/generate', async (req, res) => {
  const requestTimestamp = new Date().toISOString(); // Ajoute ceci
  console.log(`[${requestTimestamp}] Requête reçue pour /api/generate`); // Ajoute ceci

  try {
    const { text, type, options = {}, apiKey } = req.body;

    if (!text || !type || !apiKey) {
      console.log(`[${requestTimestamp}] Paramètres manquants.`); // Ajoute ceci
      return res.status(400).json({ error: 'Paramètres manquants' });
    }

    console.log(`[${requestTimestamp}] Appel de generateContent avec type: ${type}`); // Ajoute ceci
    const result = await generateContent(text, type, options, apiKey);
    console.log(`[${requestTimestamp}] Succès de la génération.`); // Ajoute ceci
    res.json({ success: true, content: result });
  } catch (error) {
    console.error(`[${requestTimestamp}] Erreur génération:`, error.message); // Modifie pour voir le message d'erreur plus clairement
    res.status(500).json({ error: 'Erreur lors de la génération de contenu' });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 StudyBoost démarré sur http://localhost:${PORT}`);
});