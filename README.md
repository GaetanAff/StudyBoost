# 📚 StudyBoost – Application d'Aide à la Révision avec IA

**StudyBoost** est une application web moderne qui transforme vos documents de cours en outils pédagogiques interactifs, grâce à l'intelligence artificielle. Compatible avec l'API **Google Gemini** et les **modèles IA locaux via Ollama**, StudyBoost rend l'apprentissage plus **efficace**, **personnalisé** et **flexible**.

---

## ✨ Nouveautés de la V5

### 💾 Système de Sessions Amélioré

* **Interface de gestion des sessions** : nouveau bouton "Sessions" avec modale dédiée
* **Création et chargement de sessions** : sauvegardez et retrouvez facilement vos analyses précédentes
* **Persistance locale** : toutes les sessions sont stockées dans localStorage
* **Traductions complètes** : libellés de gestion des sessions traduits dans toutes les langues supportées
* **Interface utilisateur mise à jour** : liste stylisée des sessions avec actions intuitives
* **Navigation dans l'historique** : flèches pour parcourir les résultats précédents d'une session

---

## ⭐ Fonctionnalités

* **Support de documents multiples** : PDF, Word, PowerPoint, Images (avec OCR)
* **Choix du moteur IA** : Google Gemini (cloud) ou Ollama (local)
* **Résumé intelligent** au format Markdown
* **QCM personnalisables** avec niveau de difficulté et explications
* **Flashcards interactives** pour une révision active
* **Questions ouvertes** avec correction IA
* **Fiches de révision** exportables
* **Questions libres** sur le contenu
* **Export PDF** de tous les contenus générés
* **Mode sombre** avec sauvegarde locale
* **Interface multilingue** : Français, Anglais, Allemand, Espagnol
* **Suivi de la consommation API** (tokens pour Gemini)

---

## 📋 Prérequis

* **Node.js** (v16 ou supérieur)
* **NPM** ou **Yarn**
* Clé API **Google Gemini** (pour le mode cloud)
* **Ollama** installé avec au moins un modèle (pour le mode local)

---

## 🛠️ Installation

```bash
git clone https://github.com/GaetanAff/StudyBoost.git
cd StudyBoost
npm install
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

1. **Installer Ollama** depuis [ollama.com](https://ollama.com)
2. **Télécharger un modèle** : `ollama pull mistral` ou `ollama pull llama3`
3. **Configurer dans StudyBoost** : Clé API → Ollama → Sélectionner modèle → Tester → Sauvegarder

### ☁️ Google Gemini

1. **Obtenir une clé API** sur [Google AI Studio](https://makersuite.google.com/app)
2. **Configurer dans StudyBoost** : Clé API → Gemini → Coller la clé → Sauvegarder

---

## 🛡️ Sécurité

* Clés API stockées uniquement dans votre navigateur
* Fichiers uploadés supprimés automatiquement après traitement
* Ollama garantit un traitement 100% local

---

## 🤝 Contributions

Les contributions sont les bienvenues ! Ouvrez une issue sur GitHub pour toute suggestion ou problème.

---

## 📞 Support

Pour toute question : [ouvrir une issue sur GitHub](https://github.com/GaetanAff/StudyBoost/issues)

---

Développé avec ❤️ pour rendre la révision plus intelligente et agréable.
**Made by [GaetanAff](https://github.com/GaetanAff)**
