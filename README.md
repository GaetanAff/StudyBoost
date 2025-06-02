# StudyBoost - Application d'aide à la révision avec IA

Une application web moderne qui transforme vos documents de cours en contenus pédagogiques interactifs grâce à l'IA Google Gemini.

## 🚀 Fonctionnalités

- **Upload de documents** : PDF, Word, PowerPoint, Images (OCR)
- **Résumés intelligents** : Courts et détaillés en Markdown
- **QCM personnalisables** : Génération automatique avec explications
- **Flashcards interactives** : Pour la révision active
- **Fiches de révision** : Design et exportables
- **Questions libres** : Posez vos questions sur le contenu
- **Export PDF** : Sauvegardez vos révisions

## 📋 Prérequis

- Node.js (version 16 ou supérieure)
- NPM ou Yarn
- Clé API Google Gemini (gratuite sur Google AI Studio)

## 🛠️ Installation

1. **Cloner le projet**
```bash
git clone https://github.com/GaetanAff/studyboost.git
cd studyboost
```

2. **Installer les dépendances**
```bash
npm install express multer cors dotenv pdf-parse mammoth tesseract.js @google/generative-ai marked jspdf html2canvas nodemon webpack webpack-cli
npm install
```

3. **Créer le fichier .env**
```bash
cp .env.example .env
```

4. **Démarrer l'application**
```bash
# Mode développement
npm run dev

# Mode production
npm start
```

5. **Ouvrir l'application**
```
http://localhost:3000
```

## 🔧 Configuration

1. **Obtenir une clé API Gemini** :
   - Visitez [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Créez un compte Google si nécessaire
   - Générez une nouvelle clé API
   - Copiez la clé

2. **Configurer dans l'application** :
   - Cliquez sur le bouton "Clé API" en haut à droite
   - Collez votre clé API Gemini
   - Cliquez sur "Sauvegarder"

## 📚 Utilisation

1. **Uploader un document**
   - Cliquez sur la zone d'upload ou glissez-déposez vos fichiers
   - Formats supportés : PDF, DOC, DOCX, PPT, PPTX, JPG, PNG

2. **Choisir une action**
   - Résumé court/détaillé
   - Génération de QCM
   - Création de flashcards
   - Fiche de révision
   - Questions libres

3. **Personnaliser les options**
   - Nombre de questions pour les QCM
   - Nombre de flashcards
   - Type de résumé souhaité

4. **Exporter les résultats**
   - Format PDF
   - Copie dans le presse-papiers

## 🏗️ Structure du projet

```
studyboost/
├── server.js              # Serveur Express principal
├── package.json           # Dépendances et scripts
├── utils/
│   ├── documentProcessor.js # Traitement des documents
│   └── aiService.js       # Interface API Gemini
├── public/
│   ├── index.html         # Interface utilisateur
│   ├── styles.css         # Styles CSS
│   └── script.js          # Logique frontend
├── uploads/               # Dossier temporaire (auto-créé)
└── README.md             # Documentation
```

## 🔧 Dépendances principales

- **Backend** : Express, Multer, PDF-Parse, Mammoth, Tesseract.js
- **IA** : @google/generative-ai
- **Frontend** : Vanilla JS, Marked.js, jsPDF

## 🚀 Déploiement

### Déploiement local
```bash
npm run build
npm start
```

### Déploiement sur Heroku
```bash
heroku create studyboost-app
git push heroku main
```

### Déploiement sur Vercel
```bash
vercel --prod
```

## 🛡️ Sécurité

- Les clés API sont stockées localement dans le navigateur
- Les fichiers uploadés sont supprimés après traitement
- Aucune donnée n'est conservée sur le serveur


## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer de nouvelles fonctionnalités
- Améliorer la documentation

## 📞 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Consultez la documentation de l'API Gemini

---

Développé avec ❤️ pour faciliter l'apprentissage et la révision.
