const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs =require('fs');
const { exec } = require('child_process');
const os = require('os');
require('dotenv').config();

const { processDocument } = require('./utils/documentProcessor');
const { generateContent, ollamaGenerateContent, testApiKey: testApiKeyService } = require('./utils/aiService'); // Ajout de testApiKeyService
const fetch = require('node-fetch');

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
    const allowedTypes = /pdf|doc|docx|odt|ppt|pptx|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Type de fichier non supporté. Formats autorisés : PDF, DOC, DOCX, ODT, PPT, PPTX, JPG, JPEG, PNG.'));
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

app.get('/api/ollama-models', async (req, res) => {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    const data = await response.json();
    const models = Array.isArray(data.models) ? data.models.map(m => m.name) : [];
    res.json({ success: true, models });
  } catch (error) {
    console.error('Erreur lors de la récupération des modèles Ollama:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/start-ollama', (req, res) => {
  console.log('Requête reçue pour démarrer Ollama...');
  const command = os.platform() === 'win32'
    ? 'start /b ollama serve'
    : 'ollama serve > /dev/null 2>&1 &';

  exec(command, (error) => {
    if (error && os.platform() !== 'win32') {
      console.error(`Erreur exec: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: `La commande 'ollama' a échoué. Erreur: ${error.message}`
      });
    }

    console.log('Commande de démarrage d\'Ollama envoyée.');
    res.json({
      success: true,
      message: "La commande de démarrage pour Ollama a été envoyée. Veuillez patienter..."
    });
  });
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


app.post('/api/generate-Ollama', async (req, res) => {
  const requestTimestamp = new Date().toISOString();
  console.log(`[${requestTimestamp}] Requête reçue pour /api/generate-Ollama`);

  try {
    const { text, type, options = {}, model = 'mistral', language = 'fr' } = req.body; // options will include difficultyLevel

    if (!text || !type ) {
      console.log(`[${requestTimestamp}] Paramètres manquants.`);
      return res.status(400).json({ error: 'Paramètres manquants: texte, type ou clé API.' });
    }

    console.log(`[${requestTimestamp}] Appel de generateContent avec type: ${type}, model: ${model}, lang: ${language}, options: ${JSON.stringify(options)}`);
    const generationResult = await ollamaGenerateContent(text, type, options, model, language); // Pass options (including difficultyLevel)
    
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

app.listen(PORT, () => {
  console.log(`🚀 StudyBoost démarré sur http://localhost:${PORT}`);
});
