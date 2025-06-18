# 📚 StudyBoost – Application d'Aide à la Révision avec IA

### Version 5

**StudyBoost** est une application web moderne qui transforme vos documents de cours en outils pédagogiques interactifs, grâce à l'intelligence artificielle. Compatible avec l'API **Google Gemini** et désormais avec les **modèles IA locaux via Ollama**, StudyBoost rend l'apprentissage plus **efficace**, **personnalisé** et **flexible**.

---

## ✨ Nouveautés de la V5

### 💾 Système de Sessions Amélioré

* **Interface de gestion des sessions** : nouveau bouton "Sessions" avec modale dédiée.
* **Création et chargement de sessions** : sauvegardez et retrouvez facilement vos analyses précédentes.
* **Persistance locale** : toutes les sessions sont stockées dans localStorage.
* **Traductions complètes** : libellés de gestion des sessions traduits dans toutes les langues supportées.
* **Interface utilisateur mise à jour** : liste stylisée des sessions avec actions intuitives.
* **Navigation dans l'historique** : flèches pour parcourir les résultats précédents d'une session.

---

## 🔄 Nouveautés de la V4

### Support des Modèles Locaux avec Ollama

* Intégration de **modèles IA locaux** via **Ollama** : plus de contrôle et de confidentialité.
* Endpoint ajouté pour **détecter et lister** les modèles installés.
* Interface mise à jour pour charger dynamiquement cette liste.

### 🧠 Sélection Dynamique du Modèle

* Menu déroulant discret (dans la modale API) pour choisir le modèle Ollama à utiliser.
* Le modèle sélectionné est **mémorisé localement**.
* Les appels à l'IA sont adaptés dynamiquement selon le modèle choisi.

### ⚙️ Améliorations Techniques

* Nouveau fichier `utils/ollamaCalls.js` pour gérer l'API Ollama.
* **Correction d'un bug critique Webpack** (erreur sur `./src` lors du build).
* **Nouveau système de sessions** pour retrouver facilement vos analyses précédentes.

---

## 🚀 Nouveautés de la V3

* **Curseur de difficulté** pour adapter les QCM et questions ouvertes (de *Découverte* à *Expert*).
* **Questions ouvertes corrigées par l'IA** : rédigez, soumettez, recevez une évaluation.
* **Mode sombre intégral** avec sauvegarde locale.
* **Interface multilingue** : Français, Anglais, Allemand, Espagnol.
* **Compteur de tokens avec graphique circulaire** (pour l'API Gemini).

---

## ⭐ Fonctionnalités Clés

* **Support de documents multiples** : PDF, Word, PowerPoint, ODT, Images (avec OCR).
* **Choix du moteur IA** : Google Gemini (cloud) ou Ollama (local).
* **Résumé intelligent** (court ou détaillé, au format Markdown).
* **QCM personnalisables** : niveau de difficulté, réponses, explications.
* **Flashcards interactives** : pour une révision active.
* **Questions ouvertes** avec correction IA.
* **Fiches de révision** exportables, prêtes à l'emploi.
* **Questions libres** sur le contenu de vos documents.
* **Export PDF** de tous les contenus générés.
* **Mode sombre** : confort visuel amélioré.
* **Interface multilingue**.
* **Suivi de la consommation API (Gemini)** : tokens IN/OUT.
* **Gestion avancée des sessions** : créez, sauvegardez et chargez vos sessions de travail.

---

## 📋 Prérequis

* **Node.js** (v16 ou supérieur)
* **NPM** ou **Yarn**
* Clé API **Google Gemini** *(via [Google AI Studio](https://makersuite.google.com/app))* (pour le mode cloud)
* **Ollama** installé et actif avec au moins un modèle (ex: `ollama run llama3`)
* **LibreOffice** installé pour permettre la conversion des fichiers ODT/Word (commande `soffice`)

---

## 🛠️ Installation

```bash
git clone https://github.com/GaetanAff/StudyBoost.git
cd StudyBoost
npm install
# Installer LibreOffice (pour la conversion des documents)
sudo apt-get install libreoffice -y
```

### Lancement

```bash
# En mode développement
npm run dev

# En mode production
npm start
```

Accédez à l'application via : [http://localhost:3000](http://localhost:3000)

---

## 🔧 Configuration

### 📦 Ollama (IA locale recommandée)

1. **Installer Ollama**
   ➜ [Télécharger depuis ollama.com](https://ollama.com)
   ➜ Lancer le service.

2. **Télécharger un modèle**

   ```bash
   ollama pull mistral
   # ou
   ollama pull llama3
   ```

3. **Configurer dans StudyBoost**

   * Cliquez sur **"Clé API"**.
   * Sélectionnez **"Ollama"**.
   * Choisissez un modèle dans la liste déroulante (chargée automatiquement).
   * Cliquez sur **"Tester"** pour vérifier la connexion ou charger le modèle sélectionné.
   * **Sauvegardez.**

### ☁️ Google Gemini

1. **Obtenir une clé API**
   ➜ [Google AI Studio](https://makersuite.google.com/app)

2. **Configurer dans StudyBoost**

   * Cliquez sur **"Clé API"**.
   * Sélectionnez **"Gemini"**.
   * Collez la clé API.
   * **Sauvegardez.**

---

## 🏗️ Structure du Projet

```
studyboost/
├── server.js               # Serveur Express
├── package.json            # Dépendances
├── utils/
│   ├── documentProcessor.js # Traitement des documents
│   ├── aiService.js         # API Google Gemini
│   └── ollamaCalls.js       # API Ollama
├── public/
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── uploads/                # Fichiers temporaires
└── README.md
```

---

## 🚀 Déploiement

```bash
npm run build
npm start
```

---

## 🛡️ Sécurité

* Les **clés API** sont stockées uniquement **dans votre navigateur**.
* Les **fichiers uploadés** sont supprimés automatiquement après traitement.
* L'utilisation d'**Ollama** garantit un **traitement 100% local**.

---

## 🤝 Contributions

Les contributions sont les bienvenues !

* 🐛 Signalez un bug
* 💡 Proposez une fonctionnalité
* 📝 Améliorez la documentation

> Ouvrez une issue sur GitHub pour toute suggestion ou problème.

---

## 📞 Support

Pour toute question ou bug : [ouvrir une issue sur GitHub](https://github.com/GaetanAff/StudyBoost/issues)

---

Développé avec ❤️ pour rendre la révision plus intelligente et agréable.
**Made by [GaetanAff](https://github.com/GaetanAff)**
