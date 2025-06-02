# StudyBoost - Application d'aide à la révision avec IA - V3

Une application web moderne et interactive qui transforme vos documents de cours en outils pédagogiques dynamiques grâce à l'IA Google Gemini. StudyBoost vise à rendre l'apprentissage plus efficace et personnalisé.

## 🔥 Nouveautés de la V3 : Interactivité et Personnalisation Accrues !

Cette version majeure introduit des fonctionnalités très attendues pour une expérience utilisateur encore plus riche :

* **Questions Ouvertes avec Correction par l'IA :**
    * Générez des questions ouvertes basées sur le contenu de vos documents.
    * Rédigez vos propres réponses.
    * Soumettez vos réponses pour une évaluation et une correction constructive fournies par l'IA, vous aidant à approfondir votre compréhension.
* **Mode Sombre Intégral :**
    * Activez un thème sombre élégant et reposant pour vos sessions d'étude tardives.
    * La préférence est sauvegardée dans votre navigateur pour une expérience cohérente.
* **Support Multi-langues (Français, Anglais, Allemand, Espagnol) :**
    * Utilisez StudyBoost dans la langue de votre choix.
    * L'interface utilisateur s'adapte dynamiquement, et les instructions pour l'IA peuvent également tenir compte de la langue sélectionnée pour une meilleure pertinence.
    * Votre choix de langue est mémorisé.
* **Compteur de Tokens Amélioré avec Diagramme Circulaire :**
    * Visualisez rapidement votre consommation de tokens d'entrée grâce à un diagramme circulaire (camembert) affichant le pourcentage utilisé par rapport à votre limite journalière de l'API Gemini.
    * Le suivi des tokens d'entrée et de sortie reste disponible numériquement.

##  предыдущие улучшения (V2) :

* **Interface QCM Interactive :**
    * Les utilisateurs peuvent sélectionner une réponse à un QCM et la vérifier instantanément.
    * La bonne réponse et une explication détaillée sont affichées après la vérification.
    * Les options sont désactivées après une tentative pour encourager la réflexion.
* **Options de Génération Flexibles :**
    * Définissez le nombre exact de QCM et de Flashcards que vous souhaitez générer.
* **Suivi de l'Utilisation des Tokens Gemini :**
    * L'application compte les tokens d'entrée et de sortie pour chaque appel à l'API.
    * Le compteur est stocké localement et se réinitialise si la clé API est modifiée.
* **Amélioration des Prompts et Gestion d'Erreurs (V2).**

## 🚀 Fonctionnalités Complètes

* **Upload de documents variés** : PDF, Word, PowerPoint, et même des Images (avec OCR pour l'extraction de texte).
* **Résumés intelligents** : Obtenez des résumés courts et concis ou détaillés et structurés, au format Markdown.
* **QCM personnalisables** : Génération automatique de questions à choix multiples avec options, réponses correctes et explications.
* **Flashcards interactives** : Créez des cartes de révision (recto/verso) pour un apprentissage actif des concepts clés.
* **Questions Ouvertes** : Générez des questions demandant une réponse rédigée et obtenez une correction de l'IA.
* **Fiches de révision complètes** : Des fiches structurées, prêtes à l'emploi et exportables.
* **Questions libres sur le document** : Posez des questions spécifiques sur le contenu de votre document et obtenez des réponses basées sur celui-ci.
* **Export PDF** : Sauvegardez facilement tous les contenus générés (résumés, QCM, fiches) au format PDF.
* **Mode Sombre** : Changez de thème pour un meilleur confort visuel.
* **Support Multi-langues** : Interface disponible en Français, Anglais, Allemand, Espagnol.
* **Suivi des Tokens** : Gardez un œil sur votre utilisation de l'API Gemini avec un affichage numérique et un diagramme circulaire pour les tokens d'entrée.


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
