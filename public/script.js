class StudyBoostApp {
    constructor() {
        this.currentDocument = null;
        this.apiKey = localStorage.getItem('gemini_api_key') || '';
        this.currentAction = null;
        this.inputTokensUsed = parseInt(localStorage.getItem('inputTokensUsed') || '0');
        this.outputTokensUsed = parseInt(localStorage.getItem('outputTokensUsed') || '0');
        this.currentQCMData = null; // Pour stocker les données QCM parsées
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkApiKey();
        this.updateTokenDisplay();
    }

    updateTokenDisplay() {
        const inputTokensEl = document.getElementById('inputTokensUsed');
        const outputTokensEl = document.getElementById('outputTokensUsed');
        if (inputTokensEl) inputTokensEl.textContent = this.inputTokensUsed;
        if (outputTokensEl) outputTokensEl.textContent = this.outputTokensUsed;
    }

    updateStoredTokens(inputTokens, outputTokens) {
        this.inputTokensUsed += inputTokens;
        this.outputTokensUsed += outputTokens;
        localStorage.setItem('inputTokensUsed', this.inputTokensUsed.toString());
        localStorage.setItem('outputTokensUsed', this.outputTokensUsed.toString());
        this.updateTokenDisplay();
    }

    setupEventListeners() {
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');

        if (uploadArea) uploadArea.addEventListener('click', () => fileInput.click());
        if (fileInput) fileInput.addEventListener('change', (e) => this.handleFileUpload(e.target.files[0]));

        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                this.handleFileUpload(e.dataTransfer.files[0]);
            });
        }

        document.getElementById('apiKeyBtn')?.addEventListener('click', () => {
            this.showModal('apiKeyModal');
        });

        document.getElementById('saveApiKey')?.addEventListener('click', () => {
            this.saveApiKeyAndResetTokens(); // Modifié pour potentiellement réinitialiser les tokens
        });

        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleAction(action);
            });
        });

        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.hideModal(e.target.closest('.modal').id);
            });
        });

        document.getElementById('submitQuestion')?.addEventListener('click', () => {
            this.submitQuestion();
        });

        document.getElementById('confirmOptions')?.addEventListener('click', () => {
            this.confirmOptions();
        });

        document.getElementById('newAnalysisBtn')?.addEventListener('click', () => {
            this.resetApp();
        });

        document.getElementById('exportBtn')?.addEventListener('click', () => {
            this.exportResults();
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });
    }
    
    saveApiKeyAndResetTokens() {
        const apiKeyInput = document.getElementById('apiKeyInput');
        const newApiKey = apiKeyInput.value.trim();

        if (!newApiKey) {
            this.showNotification('Veuillez entrer une clé API valide', 'error');
            return;
        }

        if (this.apiKey !== newApiKey) {
            this.apiKey = newApiKey;
            localStorage.setItem('gemini_api_key', this.apiKey);
            // Réinitialiser les compteurs de tokens car ils sont liés à l'utilisation d'une clé spécifique
            this.inputTokensUsed = 0;
            this.outputTokensUsed = 0;
            localStorage.setItem('inputTokensUsed', '0');
            localStorage.setItem('outputTokensUsed', '0');
            this.updateTokenDisplay();
            this.showNotification('Nouvelle clé API sauvegardée. Les compteurs de tokens ont été réinitialisés.', 'success');
        } else {
            this.showNotification('Clé API sauvegardée (inchangée).', 'success');
        }
        this.hideModal('apiKeyModal');
    }


    checkApiKey() {
        const apiKeyInput = document.getElementById('apiKeyInput');
        if (this.apiKey && apiKeyInput) {
            apiKeyInput.value = this.apiKey;
        }
    }

    async handleFileUpload(file) {
        if (!file) return;

        if (!this.apiKey) {
            this.showNotification('Veuillez d\'abord configurer votre clé API Gemini', 'error');
            this.showModal('apiKeyModal');
            return;
        }

        this.showLoading('Traitement du document...');

        const formData = new FormData();
        formData.append('document', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.currentDocument = {
                    text: result.text,
                    filename: result.filename
                };
                this.showDocumentProcessed(result.filename, result.text);
            } else {
                throw new Error(result.error || "Erreur inconnue lors de l'upload");
            }
        } catch (error) {
            console.error('Erreur upload:', error);
            this.showNotification(`Erreur lors du traitement du document: ${error.message}`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    showDocumentProcessed(filename, text) {
        const wordCount = text ? text.split(/\s+/).length : 0;
        const pageCount = Math.ceil(wordCount / 250); 

        const docTitleEl = document.getElementById('documentTitle');
        const wordCountEl = document.getElementById('wordCount');
        const pageCountEl = document.getElementById('pageCount');
        const uploadSectionEl = document.getElementById('uploadSection');
        const contentSectionEl = document.getElementById('contentSection');

        if (docTitleEl) docTitleEl.textContent = filename;
        if (wordCountEl) wordCountEl.textContent = `${wordCount} mots`;
        if (pageCountEl) pageCountEl.textContent = `~${pageCount} pages`;

        if (uploadSectionEl) uploadSectionEl.style.display = 'none';
        if (contentSectionEl) contentSectionEl.style.display = 'block';
        
        // Cacher les résultats précédents si un nouveau document est chargé
        const resultsSectionEl = document.getElementById('resultsSection');
        if (resultsSectionEl) resultsSectionEl.style.display = 'none';
    }

    async handleAction(action) {
        if (!this.currentDocument) {
            this.showNotification('Veuillez d\'abord uploader un document.', 'error');
            return;
        }
        if (!this.apiKey) {
            this.showNotification('Veuillez configurer votre clé API Gemini.', 'error');
            this.showModal('apiKeyModal');
            return;
        }

        this.currentAction = action;

        if (action === 'question') {
            this.showModal('questionModal');
            return;
        }

        if (action === 'qcm' || action === 'flashcards') {
            this.showOptionsModal(action);
            return;
        }

        await this.generateContent(action);
    }

    showOptionsModal(action) {
        const modal = document.getElementById('optionsModal');
        const title = document.getElementById('optionsTitle');
        const body = document.getElementById('optionsBody');

        if (!modal || !title || !body) return;

        let optionsHtml = '';

        if (action === 'qcm') {
            title.textContent = 'Options QCM';
            optionsHtml = `
                <div class="form-group">
                    <label for="numQuestionsInput">Nombre de questions (5-20)</label>
                    <input type="number" id="numQuestionsInput" value="10" min="5" max="20" class="form-group input">
                </div>
            `;
        } else if (action === 'flashcards') {
            title.textContent = 'Options Flashcards';
            optionsHtml = `
                <div class="form-group">
                    <label for="numCardsInput">Nombre de flashcards (5-25)</label>
                    <input type="number" id="numCardsInput" value="15" min="5" max="25" class="form-group input">
                </div>
            `;
        }

        body.innerHTML = optionsHtml;
        this.showModal('optionsModal');
    }

    async confirmOptions() {
        const options = {};
        let isValid = true;

        if (this.currentAction === 'qcm') {
            const numInput = document.getElementById('numQuestionsInput');
            options.numQuestions = parseInt(numInput.value);
            if (isNaN(options.numQuestions) || options.numQuestions < 5 || options.numQuestions > 20) {
                this.showNotification('Veuillez entrer un nombre de questions entre 5 et 20.', 'error');
                numInput.focus();
                isValid = false;
            }
        } else if (this.currentAction === 'flashcards') {
            const numInput = document.getElementById('numCardsInput');
            options.numCards = parseInt(numInput.value);
            if (isNaN(options.numCards) || options.numCards < 5 || options.numCards > 25) {
                this.showNotification('Veuillez entrer un nombre de flashcards entre 5 et 25.', 'error');
                numInput.focus();
                isValid = false;
            }
        }
        if (!isValid) return;

        this.hideModal('optionsModal');
        await this.generateContent(this.currentAction, options);
    }

    async submitQuestion() {
        const questionInput = document.getElementById('questionInput');
        const question = questionInput.value.trim();
        if (!question) {
            this.showNotification('Veuillez entrer une question.', 'error');
            return;
        }

        const options = { question };
        this.hideModal('questionModal');
        
        await this.generateContent('question', options);
        
        questionInput.value = '';
    }

    async generateContent(type, options = {}) {
        if (!this.currentDocument || !this.currentDocument.text) {
            this.showNotification('Aucun document chargé pour analyse.', 'error');
            return;
        }
        this.showLoading('Génération du contenu avec l\'IA...');

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: this.currentDocument.text,
                    type: type,
                    options: options,
                    apiKey: this.apiKey
                })
            });

            const result = await response.json();

            if (response.ok && result.success && result.content && typeof result.content.text !== 'undefined') {
                this.showResults(type, result.content.text); 
                if (result.content.usage) { 
                    const promptTokens = result.content.usage.promptTokenCount || 0;
                    const candidatesTokens = result.content.usage.candidatesTokenCount || 0; 
                    this.updateStoredTokens(promptTokens, candidatesTokens);
                }
            } else {
                throw new Error(result.error || `Erreur HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Erreur génération:', error);
            this.showNotification(`Erreur lors de la génération: ${error.message}`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    showResults(type, content) {
        const resultsSection = document.getElementById('resultsSection');
        const resultsTitle = document.getElementById('resultsTitle');
        const resultsContent = document.getElementById('resultsContent');

        if (!resultsSection || !resultsTitle || !resultsContent) return;

        const titles = {
            'summary_short': 'Résumé Court',
            'summary_long': 'Résumé Détaillé',
            'qcm': 'Questions à Choix Multiples',
            'flashcards': 'Flashcards',
            'revision_sheet': 'Fiche de Révision',
            'question': 'Réponse à votre Question'
        };

        resultsTitle.textContent = titles[type] || 'Résultats';
        let html = '';
        this.currentQCMData = null;

        switch (type) {
            case 'summary_short':
            case 'summary_long':
            case 'revision_sheet':
            case 'question':
                html = `<div class="markdown-content">${marked.parse(content)}</div>`;
                break;
            case 'qcm':
                try {
                    // Tenter de nettoyer le contenu si ce n'est pas du JSON pur
                    const cleanedContent = content.trim().startsWith('```json') ? content.substring(content.indexOf('['), content.lastIndexOf(']') + 1) : content;
                    this.currentQCMData = JSON.parse(cleanedContent); 
                    html = this.formatQCM(this.currentQCMData); // Passer les données parsées
                } catch (e) {
                    console.error("Erreur parsing QCM JSON:", e, "Contenu brut:", content);
                    html = `<div class="markdown-content"><p>Erreur de format des QCM reçus de l'IA. Le format JSON attendu n'a pas été respecté. Voici le contenu brut :</p><pre>${content}</pre></div>`;
                    this.showNotification("Les QCM n'ont pas pu être formatés correctement.", "error");
                }
                break;
            case 'flashcards':
                 try {
                    const cleanedContent = content.trim().startsWith('```json') ? content.substring(content.indexOf('['), content.lastIndexOf(']') + 1) : content;
                    this.currentFlashcardsData = JSON.parse(cleanedContent);
                    html = this.formatFlashcards(this.currentFlashcardsData);
                } catch (e) {
                    console.error("Erreur parsing Flashcards JSON:", e, "Contenu brut:", content);
                    html = `<div class="markdown-content"><p>Erreur de format des Flashcards. Le format JSON attendu n'a pas été respecté. Voici le contenu brut :</p><pre>${content}</pre></div>`;
                    this.showNotification("Les Flashcards n'ont pas pu être formatées correctement.", "error");
                }
                break;
        }

        resultsContent.innerHTML = html;
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });

        if (type === 'flashcards' && this.currentFlashcardsData) {
            this.setupFlashcards();
        }
        if (type === 'qcm' && this.currentQCMData) {
            this.setupQCMInteractions();
        }
    }

    formatQCM(qcmDataArray) { // Prend maintenant un tableau d'objets QCM
        let html = '<div class="qcm-container">';
        qcmDataArray.forEach((q, index) => {
            const questionId = `q-${index}`;
            html += `
                <div class="qcm-item" id="${questionId}" data-correct-answer="${q.correct_answer}">
                    <h4>Question ${index + 1}: ${q.question}</h4>
                    <div class="qcm-options">
            `;
            q.options.forEach((option, optIndex) => {
                const optionId = `${questionId}-opt-${optIndex}`;
                const optionLetter = String.fromCharCode(65 + optIndex);
                html += `
                    <label for="${optionId}" class="qcm-option">
                        <input type="radio" name="${questionId}-options" id="${optionId}" value="${optionLetter}">
                        <strong>${optionLetter}.</strong> ${option}
                    </label>
                `;
            });
            html += `
                    </div>
                    <button class="check-answer-btn" data-question-index="${index}">Vérifier ma réponse</button>
                    <div class="qcm-explanation">
                        <strong>Explication:</strong> ${q.explanation || "Aucune explication fournie."}
                    </div>
                </div>
            `;
        });
        html += '</div>';
        return html;
    }
    
    setupQCMInteractions() {
        const qcmContainer = document.querySelector('.qcm-container');
        if (!qcmContainer) return;

        qcmContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('check-answer-btn')) {
                const button = event.target;
                const qcmItem = button.closest('.qcm-item');
                if (!qcmItem) return;

                const selectedOptionInput = qcmItem.querySelector('input[type="radio"]:checked');
                if (!selectedOptionInput) {
                    this.showNotification('Veuillez sélectionner une réponse.', 'info');
                    return;
                }

                const userAnswerLetter = selectedOptionInput.value;
                const correctAnswerLetter = qcmItem.dataset.correctAnswer;

                const allOptionLabels = qcmItem.querySelectorAll('.qcm-option');
                allOptionLabels.forEach(label => {
                    const input = label.querySelector('input[type="radio"]');
                    label.classList.remove('selected', 'correct-answer', 'incorrect-answer'); 
                    
                    if (input.value === correctAnswerLetter) {
                        label.classList.add('correct-answer');
                    }
                    if (input.checked) {
                        label.classList.add('selected');
                        if (input.value !== correctAnswerLetter) {
                            label.classList.add('incorrect-answer');
                        }
                    }
                    input.disabled = true; 
                });

                const explanationDiv = qcmItem.querySelector('.qcm-explanation');
                if (explanationDiv) explanationDiv.classList.add('visible');
                button.disabled = true; 
            }
        });
    }


    formatFlashcards(flashcardsDataArray) { // Prend maintenant un tableau d'objets flashcard
        let html = '<div class="flashcards-container">';
        flashcardsDataArray.forEach((card, index) => {
            html += `
                <div class="flashcard" data-index="${index}">
                    <div class="flashcard-inner">
                        <div class="flashcard-front">
                            <div class="flashcard-content">
                                <h4>${card.front}</h4>
                            </div>
                        </div>
                        <div class="flashcard-back">
                            <div class="flashcard-content">
                                <p>${card.back}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        return html;
    }

    setupFlashcards() {
        document.querySelectorAll('.flashcard').forEach(card => {
            card.addEventListener('click', () => {
                card.classList.toggle('flipped');
            });
        });
    }
    
    exportResults() {
        const resultsContentElement = document.getElementById('resultsContent');
        const titleElement = document.getElementById('resultsTitle');

        if (!resultsContentElement || !titleElement) {
            this.showNotification('Aucun résultat à exporter.', 'error');
            return;
        }
        
        const title = titleElement.textContent;
        
        if (window.jspdf && window.jspdf.jsPDF) {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            doc.setFontSize(18);
            doc.text(title, 14, 22);
            doc.setFontSize(11);

            // Utiliser html method de jsPDF pour un meilleur rendu du HTML (simplifié)
            // Pour un rendu complexe, html2canvas est souvent combiné avec jsPDF, 
            // mais pour du texte structuré, `html` peut suffire.
            // Cela nécessite que le contenu soit bien structuré en HTML.
            // La version actuelle de marked.js et le formatage QCM/Flashcards devraient être gérables.
            
            // Pour éviter les problèmes avec le rendu direct du HTML complexe via `doc.html`,
            // on va garder la version `innerText` pour la simplicité de l'export PDF de base
            // ou alors recommander html2canvas pour une capture d'image.
            // L'export PDF direct de HTML complexe est difficile.
            
            let textContentToExport = "";
            if (this.currentAction === 'qcm' && this.currentQCMData) {
                this.currentQCMData.forEach((q, i) => {
                    textContentToExport += `Question ${i+1}: ${q.question}\n`;
                    q.options.forEach((opt, j) => {
                        textContentToExport += `${String.fromCharCode(65+j)}. ${opt}\n`;
                    });
                    textContentToExport += `Réponse: ${q.correct_answer}\nExplication: ${q.explanation}\n\n`;
                });
            } else if (this.currentAction === 'flashcards' && this.currentFlashcardsData) {
                 this.currentFlashcardsData.forEach((card, i) => {
                    textContentToExport += `Flashcard ${i+1}:\nRecto: ${card.front}\nVerso: ${card.back}\n\n`;
                });
            } else {
                 // Pour les contenus Markdown, on peut essayer de les convertir en texte simple
                 // ou utiliser `doc.html` avec prudence.
                 // `innerText` est le plus simple pour l'instant.
                textContentToExport = resultsContentElement.innerText;
            }

            const lines = doc.splitTextToSize(textContentToExport, 180); // Ajuster la largeur
            doc.text(lines, 14, 32);
            
            doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
            this.showNotification('Résultats exportés en PDF.', 'success');

        } else {
            const textContent = resultsContentElement.innerText;
            navigator.clipboard.writeText(textContent).then(() => {
                this.showNotification('Contenu copié dans le presse-papiers (jsPDF non disponible).', 'info');
            }).catch(err => {
                this.showNotification('Erreur lors de la copie.', 'error');
            });
        }
    }


    resetApp() {
        this.currentDocument = null;
        this.currentAction = null;
        this.currentQCMData = null;
        this.currentFlashcardsData = null;
        
        const uploadSectionEl = document.getElementById('uploadSection');
        const contentSectionEl = document.getElementById('contentSection');
        const resultsSectionEl = document.getElementById('resultsSection');
        const fileInputEl = document.getElementById('fileInput');

        if (uploadSectionEl) uploadSectionEl.style.display = 'block';
        if (contentSectionEl) contentSectionEl.style.display = 'none';
        if (resultsSectionEl) resultsSectionEl.style.display = 'none';
        if (fileInputEl) fileInputEl.value = '';

        this.showNotification('Prêt pour une nouvelle analyse.', 'info');
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('show');
    }

    hideModal(modalId) {
         const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('show');
    }

    showLoading(message) {
        const loadingTextEl = document.getElementById('loadingText');
        const loadingOverlayEl = document.getElementById('loadingOverlay');
        if (loadingTextEl) loadingTextEl.textContent = message;
        if (loadingOverlayEl) loadingOverlayEl.style.display = 'flex';
    }

    hideLoading() {
        const loadingOverlayEl = document.getElementById('loadingOverlay');
        if (loadingOverlayEl) loadingOverlayEl.style.display = 'none';
    }

    showNotification(message, type = 'info') {
        const notificationArea = document.body; // Ou un conteneur dédié si vous en avez un
        const notification = document.createElement('div');
        // Utiliser les classes .success, .error, .info de styles.css si elles existent
        // ou appliquer des styles inline comme précédemment.
        // Pour la simplicité, je reprends le style inline mais l'idéal serait des classes CSS.
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            color: white;
            font-weight: 500;
            z-index: 3000;
            display: flex;
            align-items: center;
            gap: 1rem;
            animation: slideInFromRight 0.3s ease-out;
            background: ${type === 'success' ? 'var(--secondary-color)' : type === 'error' ? '#ef4444' : 'var(--primary-color)'};
            box-shadow: var(--shadow-lg);
        `;
        
        const messageSpan = document.createElement('span');
        messageSpan.textContent = message;
        notification.appendChild(messageSpan);

        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.style.cssText = `
            background: none; border: none; color: white; font-size: 1.5rem; 
            cursor: pointer; opacity: 0.8; padding: 0; margin-left: 1rem;
            line-height: 1;
        `;
        closeButton.onclick = () => notification.remove();
        notification.appendChild(closeButton);
        
        notificationArea.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'fadeOutToRight 0.3s ease-in forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new StudyBoostApp();
});

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
    @keyframes slideInFromRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes fadeOutToRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(styleSheet);
