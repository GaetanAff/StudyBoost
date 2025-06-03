const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs =require('fs');
require('dotenv').config();

const { processDocument } = require('./utils/documentProcessor');
const { generateContent, testApiKey: testApiKeyService } = require('./utils/aiService'); // Ajout de testApiKeyService
const historyService = require('./utils/historyService');

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

  historyService.addEntry({ type, content: generationResult.text || '', user: 'anonymous' });

  console.log(`[${requestTimestamp}] Succès de la génération.`);
  res.json({ success: true, content: generationResult });

  } catch (error) {
    console.error(`[${requestTimestamp}] Erreur API Gemini ou service:`, error.message, error.stack);
    res.status(500).json({ error: error.message || 'Erreur lors de la génération de contenu par l\'IA.' });
  }
});

app.post('/api/test-key', async (req, res) => {
    const requestTimestamp = new Date().toISOString();
    console.log(`[${requestTimestamp}] Requête reçue pour /api/test-key`);
    try {
        const { apiKey } = req.body;
        if (!apiKey) {
            console.log(`[${requestTimestamp}] Clé API manquante pour le test.`);
            return res.status(400).json({ success: false, error: 'Clé API manquante.' });
        }

        console.log(`[${requestTimestamp}] Appel de testApiKeyService.`);
        const testResult = await testApiKeyService(apiKey); // Appel de la fonction du service

        if (testResult.success) {
            console.log(`[${requestTimestamp}] Test de la clé API réussi.`);
            res.json({ success: true, message: 'Clé API valide et fonctionnelle.' });
        } else {
            console.log(`[${requestTimestamp}] Test de la clé API échoué: ${testResult.error}`);
            // Renvoyer 400 pour une clé invalide, 500 pour d'autres erreurs serveur lors du test.
            // Ici, nous utilisons 400 si le test service lui-même indique un échec lié à la clé.
            res.status(400).json({ success: false, error: testResult.error || 'Clé API invalide ou problème lors du test.' });
        }
    } catch (error) {
        console.error(`[${requestTimestamp}] Erreur serveur lors du test de la clé API:`, error.message);
  res.status(500).json({ success: false, error: error.message || 'Erreur serveur interne lors du test de la clé API.' });
  }
});

app.get('/api/history', (req, res) => {
  res.json(historyService.getHistory());
});

app.put('/api/history/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { content } = req.body;
  const entry = historyService.updateEntry(id, content);
  if (!entry) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.json({ success: true, entry });
});

app.listen(PORT, () => {
  console.log(`🚀 StudyBoost démarré sur http://localhost:${PORT}`);
});