# StudyBoost - Application d'aide à la révision avec IA - V2

Une application web moderne qui transforme vos documents de cours en contenus pédagogiques interactifs grâce à l'IA Google Gemini.

## Ajout de la mise à jour : Amélioration QCM, Options & Suivi Tokens

Cette mise à jour introduit plusieurs améliorations fonctionnelles et d'interface utilisateur pour StudyBoost :

**Fonctionnalités & Améliorations :**

* **Interface QCM Interactive :**
    * Les utilisateurs peuvent désormais sélectionner une réponse à un QCM et la vérifier.
    * La bonne réponse et une explication sont affichées après la vérification.
    * Les options sont désactivées après la tentative pour éviter les modifications.
* **Options de Génération Flexibles :**
    * Le nombre de QCM et de Flashcards à générer peut être défini par l'utilisateur via un champ numérique (au lieu d'une sélection fixe).
    * Validation ajoutée pour s'assurer que le nombre est dans les limites acceptables.
* **Suivi de l'Utilisation des Tokens Gemini :**
    * L'application compte désormais les tokens d'entrée et de sortie utilisés pour chaque appel à l'API Gemini.
    * Le total des tokens utilisés est affiché dans l'interface utilisateur.
    * Ce compteur est stocké dans le `localStorage` et est réinitialisé si la clé API est modifiée.
* **Amélioration des Prompts :**
    * Les prompts envoyés à l'API Gemini pour la génération de QCM et de Flashcards ont été précisés pour garantir un format JSON plus fiable en sortie.
* **Gestion d'Erreurs Améliorée :**
    * Meilleure gestion et affichage des erreurs potentielles lors de la communication avec l'API ou lors du parsing des réponses JSON.

**Modifications Techniques :**

* **Frontend (`public/script.js`, `public/index.html`, `public/styles.css`) :**
    * Mise à jour de la logique pour gérer l'affichage et l'interaction des QCM.
    * Modification du modal d'options pour les champs numériques.
    * Ajout d'éléments HTML et de styles CSS pour le suivi des tokens et la nouvelle interface QCM.
    * Logique de stockage et de mise à jour des compteurs de tokens dans `localStorage`.
* **Backend (`server.js`, `utils/aiService.js`) :**
    * `aiService.js` retourne maintenant le texte généré ainsi que les métadonnées d'utilisation des tokens (`usageMetadata`) de l'API Gemini.
    * `server.js` transmet ces informations complètes au client.

Ces changements visent à rendre StudyBoost plus interactif, informatif et convivial.
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

3. **Démarrer l'application**
```bash
# Mode développement
npm run dev

# Mode production
npm start
```

4. **Ouvrir l'application**
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
