class StudyBoostApp {
    constructor() {
        this.currentDocument = null;
        this.apiKey = localStorage.getItem('gemini_api_key') || '';
        this.currentAction = null;
        this.inputTokensUsed = parseInt(localStorage.getItem('inputTokensUsed') || '0');
        this.outputTokensUsed = parseInt(localStorage.getItem('outputTokensUsed') || '0');
        this.currentQCMData = null;
        this.currentFlashcardsData = null;
        this.generatedOpenQuestion = null; // To store the AI-generated open question

        this.history = [];
        
        this.dailyInputTokenLimit = 1048576;

        this.currentLanguage = localStorage.getItem('studyboost_language') || 'fr';
        this.translations = window.STUDYBOOST_TRANSLATIONS || {};

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkApiKey();
        this.updateTokenDisplay();
        this.setLanguage(this.currentLanguage);
        this.setInitialDarkMode();
        this.loadHistory();
        this.renderHistory();
    }
    
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('studyboost_language', lang);
            document.documentElement.lang = lang;

            document.querySelectorAll('[data-lang]').forEach(el => {
                const key = el.dataset.lang;
                if (this.translations[lang][key]) {
                    el.textContent = this.translations[lang][key];
                }
            });
             document.querySelectorAll('[placeholder-data-lang]').forEach(el => {
                const key = el.getAttribute('placeholder-data-lang');
                if (this.translations[lang][key]) {
                    el.placeholder = this.translations[lang][key];
                }
            });
            const languageSwitcher = document.getElementById('languageSwitcher');
            if (languageSwitcher) languageSwitcher.value = lang;

            // Re-translate difficulty labels if modal is open or options are visible
            const difficultyLabelsContainer = document.querySelector('.difficulty-labels');
            if (difficultyLabelsContainer) {
                difficultyLabelsContainer.querySelectorAll('span[data-lang]').forEach(span => {
                    const key = span.dataset.lang;
                     if (this.translations[lang][key]) {
                        span.textContent = this.translations[lang][key];
                    }
                });
            }
        }
    }

    _(key, replacements = {}) {
        let translation = this.translations[this.currentLanguage]?.[key] || this.translations.en?.[key] || key;
        for (const placeholder in replacements) {
            translation = translation.replace(new RegExp(`{${placeholder}}`, 'g'), replacements[placeholder]);
        }
        return translation;
    }

    setInitialDarkMode() {
        const darkModePreference = localStorage.getItem('studyboost_dark_mode');
        const toggleButton = document.getElementById('darkModeToggle');
        const icon = toggleButton.querySelector('i');
        if (darkModePreference === 'enabled') {
            document.body.classList.add('dark-mode');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            toggleButton.setAttribute('aria-label', this._('darkModeToggleLabelLight'));
        } else {
            document.body.classList.remove('dark-mode');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            toggleButton.setAttribute('aria-label', this._('darkModeToggleLabelDark'));
        }
    }

    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const toggleButton = document.getElementById('darkModeToggle');
        const icon = toggleButton.querySelector('i');
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('studyboost_dark_mode', 'enabled');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            toggleButton.setAttribute('aria-label', this._('darkModeToggleLabelLight'));
        } else {
            localStorage.setItem('studyboost_dark_mode', 'disabled');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
             toggleButton.setAttribute('aria-label', this._('darkModeToggleLabelDark'));
        }
    }
    
    updateTokenPieChart() {
        const percentage = Math.min((this.inputTokensUsed / this.dailyInputTokenLimit) * 100, 100);
        const pieChart = document.getElementById('inputTokenPieChart');
        const percentageText = document.getElementById('inputTokensPercentage');
        if (pieChart) {
            pieChart.style.setProperty('--percentage', `${percentage}%`);
        }
        if (percentageText) {
            percentageText.textContent = percentage.toFixed(1);
        }
    }


    updateTokenDisplay() {
        const inputTokensEl = document.getElementById('inputTokensUsed');
        const outputTokensEl = document.getElementById('outputTokensUsed');
        if (inputTokensEl) inputTokensEl.textContent = this.inputTokensUsed;
        if (outputTokensEl) outputTokensEl.textContent = this.outputTokensUsed;
        this.updateTokenPieChart();
    }

    updateStoredTokens(inputTokens, outputTokens) {
        this.inputTokensUsed += inputTokens;
        this.outputTokensUsed += outputTokens;
        localStorage.setItem('inputTokensUsed', this.inputTokensUsed.toString());
        localStorage.setItem('outputTokensUsed', this.outputTokensUsed.toString());
        this.updateTokenDisplay();
    }

    loadHistory() {
        try {
            this.history = JSON.parse(localStorage.getItem('studyboost_history')) || [];
        } catch (e) {
            this.history = [];
        }
    }

    saveHistory() {
        localStorage.setItem('studyboost_history', JSON.stringify(this.history));
    }

    addHistoryEntry(action, details = {}) {
        const entry = {
            timestamp: new Date().toISOString(),
            document: this.currentDocument?.filename || '',
            action,
            details
        };
        this.history.push(entry);
        this.saveHistory();
        this.renderHistory();
    }

    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.renderHistory();
    }

    renderHistory() {
        const container = document.getElementById('historyContainer');
        if (!container) return;
        if (this.history.length === 0) {
            container.innerHTML = `<p>${this._('noHistoryMessage')}</p>`;
            return;
        }
        let html = '<table class="history-table"><thead><tr><th>' + this._('dateLabel') + '</th><th>' + this._('processedDocumentLabel') + '</th><th>' + this._('resultsTitleLabel') + '</th><th>' + this._('detailsLabel') + '</th></tr></thead><tbody>';
        this.history.forEach(entry => {
            const date = new Date(entry.timestamp).toLocaleString();
            const details = entry.details && entry.details.score ? entry.details.score : (entry.details.numQuestions ? entry.details.numQuestions + ' Q' : '');
            html += `<tr><td>${date}</td><td>${entry.document}</td><td>${entry.action}</td><td>${details}</td></tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    }

    replaceEmojiCodes(text) {
        const map = {
            ":)": "🙂",
            ":-(": "🙁",
            ":(": "🙁",
            ":D": "😃",
            ":smile:": "😄",
            ":grin:": "😁",
            ":wink:": "😉",
            ":thumbsup:": "👍",
            ":heart:": "❤️"
        };
        for (const [code, emoji] of Object.entries(map)) {
            text = text.split(code).join(emoji);
        }
        return text;
    }

    setupEventListeners() {
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');

        // Listener pour le clic sur la zone d'upload (pour ouvrir la sélection de fichier)
        if (uploadArea && fileInput) { // S'assurer que fileInput existe aussi
            uploadArea.addEventListener('click', () => fileInput.click());
        }
        // Listener pour le changement de fichier dans l'input
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e.target.files[0]));
        }

        // Listeners pour le glisser-déposer (drag and drop)
        if (uploadArea) {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                uploadArea.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation(); // Bonne pratique d'ajouter stopPropagation aussi
                }, false);
            });
            uploadArea.addEventListener('dragenter', () => uploadArea.classList.add('dragover'));
            uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
            uploadArea.addEventListener('drop', (e) => {
                uploadArea.classList.remove('dragover');
                if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    this.handleFileUpload(e.dataTransfer.files[0]);
                    e.dataTransfer.clearData(); // Bonne pratique
                }
            });
        }

        // Listeners pour les boutons principaux de l'en-tête et des modaux
        document.getElementById('apiKeyBtn')?.addEventListener('click', () => this.showModal('apiKeyModal'));
        document.getElementById('saveApiKey')?.addEventListener('click', () => this.saveApiKeyAndResetTokens());
        document.getElementById('darkModeToggle')?.addEventListener('click', () => this.toggleDarkMode());
        document.getElementById('languageSwitcher')?.addEventListener('change', (e) => this.setLanguage(e.target.value));
        document.getElementById('testApiKeyBtn')?.addEventListener('click', () => this.testApiKey());
        document.getElementById('progressBtn')?.addEventListener('click', () => { this.renderHistory(); this.showModal('progressModal'); });
        document.getElementById('clearHistoryBtn')?.addEventListener('click', () => this.clearHistory());

        // *** AJOUT CRUCIAL : Listener pour le bouton de bascule de visibilité de la clé API ***
        const apiKeyModalElement = document.getElementById('apiKeyModal');
        if (apiKeyModalElement) {
            const toggleButton = apiKeyModalElement.querySelector('.input-toggle');
            if (toggleButton) {
                toggleButton.addEventListener('click', () => {
                    // 'apiKeyInput' est l'ID de votre champ de saisie de la clé API
                    // toggleButton est l'élément bouton sur lequel on a cliqué
                    this.togglePasswordVisibility('apiKeyInput', toggleButton);
                });
            }
        }

        // Listener pour les cartes d'action
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.action) {
                    this.handleAction(e.currentTarget.dataset.action);
                }
            });
        });

        // Listener pour les boutons de fermeture des modaux
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal && modal.id) {
                    this.hideModal(modal.id);
                }
            });
        });

        // Listeners pour les soumissions de formulaires et autres actions spécifiques
        document.getElementById('submitQuestion')?.addEventListener('click', () => this.submitUserQuestion());
        document.getElementById('confirmOptions')?.addEventListener('click', () => this.confirmOptions());
        document.getElementById('newAnalysisBtn')?.addEventListener('click', () => this.resetApp());
        document.getElementById('exportBtn')?.addEventListener('click', () => this.exportResults());
        document.getElementById('submitOpenAnswerBtn')?.addEventListener('click', () => this.submitOpenAnswer());

        // Listener pour fermer un modal en cliquant à l'extérieur de son contenu
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) { // Si le clic est sur le fond du modal lui-même
                    if (modal.id) {
                        this.hideModal(modal.id);
                    }
                }
            });
        });
    }

    togglePasswordVisibility(inputId, toggleButtonElement) {
        const input = document.getElementById(inputId);
        // L'icône est dans un <span> à l'intérieur du bouton
        const iconSpan = toggleButtonElement.querySelector('span');

        if (!input || !iconSpan) {
            console.error("Éléments manquants pour togglePasswordVisibility:", input, iconSpan);
            return;
        }

        if (input.type === 'password') {
            input.type = 'text';
            iconSpan.textContent = this._('hidePasswordIcon'); // Utilise la traduction
            iconSpan.dataset.lang = 'hidePasswordIcon'; // Mettre à jour pour la langue
        } else {
            input.type = 'password';
            iconSpan.textContent = this._('showPasswordIcon'); // Utilise la traduction
            iconSpan.dataset.lang = 'showPasswordIcon'; // Mettre à jour pour la langue
        }
    }
    
    showModal(modalId) {
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
            modalElement.classList.add('show');
        } else {
            console.error(`Modal with id "${modalId}" not found.`); // Message d'erreur si le modal n'existe pas
            return;
        }

        if (modalId === 'apiKeyModal') {
            // Si vous avez une méthode hideApiKeyStatus, appelez-la ici
            if (typeof this.hideApiKeyStatus === 'function') {
                 this.hideApiKeyStatus(); // Efface le statut précédent lors de l'affichage du modal
            }

            const apiKeyInput = document.getElementById('apiKeyInput');
            if (apiKeyInput) {
                apiKeyInput.type = 'password'; // Réinitialise en type password
            }

            const toggleButton = document.querySelector('#apiKeyModal .input-toggle');
            if (toggleButton) {
                const iconSpan = toggleButton.querySelector('span');
                if (iconSpan) {
                    iconSpan.textContent = this._('showPasswordIcon'); // Réinitialise l'icône
                    iconSpan.dataset.lang = 'showPasswordIcon';
                }
            }
        }
        // Vous pourriez avoir d'autres logiques spécifiques pour d'autres modaux ici
        // else if (modalId === 'autreModal') { ... }
    }

    async testApiKey() {
        const apiKeyInput = document.getElementById('apiKeyInput');
        const apiKeyToTest = apiKeyInput.value.trim();

        if (!apiKeyToTest) {
            this.showNotification(this._('notificationEnterValidApiKey'), 'error');
            return;
        }

        this.showLoading(this._('loadingTextTestingKey')); // Utilisation de la nouvelle traduction pour le chargement

        try {
            const response = await fetch('/api/test-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey: apiKeyToTest })
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification(this._('apiKeyTestSuccess'), 'success');
            } else {
                const errorMessage = result.error || 'Erreur inconnue';
                this.showNotification(this._('apiKeyTestFailure') + errorMessage, 'error');
            }
        } catch (error) {
            console.error('Erreur lors du test de la clé API (frontend):', error);
            this.showNotification(this._('apiKeyTestFailure') + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    saveApiKeyAndResetTokens() {
        const apiKeyInput = document.getElementById('apiKeyInput');
        const newApiKey = apiKeyInput.value.trim();

        if (!newApiKey) {
            this.showNotification(this._('notificationEnterValidApiKey'), 'error');
            return;
        }

        if (this.apiKey !== newApiKey) {
            this.apiKey = newApiKey;
            localStorage.setItem('gemini_api_key', this.apiKey);
            this.inputTokensUsed = 0;
            this.outputTokensUsed = 0;
            localStorage.setItem('inputTokensUsed', '0');
            localStorage.setItem('outputTokensUsed', '0');
            this.updateTokenDisplay();
            this.showNotification(this._('notificationApiKeySavedReset'), 'success');
        } else {
            this.showNotification(this._('notificationApiKeyUnchanged'), 'success');
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
            this.showNotification(this._('notificationApiKeyMissing'), 'error');
            this.showModal('apiKeyModal');
            return;
        }

        this.showLoading('loadingTextDocument'); 

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
                throw new Error(result.error || "Unknown upload error");
            }
        } catch (error) {
            console.error('Upload error:', error);
            this.showNotification(this._('notificationErrorUpload') + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    showDocumentProcessed(filename, text) {
        const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
        const pageCount = Math.max(1, Math.ceil(wordCount / 250)); 

        document.getElementById('documentTitle').textContent = `${this._('processedDocumentLabel')}: ${filename}`;
        document.getElementById('wordCount').innerHTML = `${wordCount} ${this._('wordsUnit')}`;
        document.getElementById('pageCount').innerHTML = `~${pageCount} ${this._('pagesUnit')}`;

        document.getElementById('uploadSection').style.display = 'none';
        document.getElementById('contentSection').style.display = 'block';
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('openQuestionInteractionSection').style.display = 'none';
    }

    async handleAction(action) {
        if (!this.currentDocument) {
            this.showNotification(this._('notificationDocumentMissing'), 'error');
            return;
        }
        if (!this.apiKey) {
            this.showNotification(this._('notificationApiKeyMissing'), 'error');
            this.showModal('apiKeyModal');
            return;
        }

        this.currentAction = action;
        document.getElementById('resultsContent').innerHTML = '';
        document.getElementById('openQuestionInteractionSection').style.display = 'none';


        if (action === 'question') {
            this.showModal('questionModal');
            return;
        }

        if (action === 'qcm' || action === 'flashcards' || action === 'open_question_generate') {
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
            title.textContent = this._('optionsQCMTitle');
            optionsHtml = `
                <div class="form-group">
                    <label for="numQuestionsInput">${this._('optionsQCMLabel')}</label>
                    <input type="number" id="numQuestionsInput" value="10" min="5" max="20" class="form-control">
                </div>`;
        } else if (action === 'flashcards') {
            title.textContent = this._('optionsFlashcardsTitle');
            optionsHtml = `
                <div class="form-group">
                    <label for="numCardsInput">${this._('optionsFlashcardsLabel')}</label>
                    <input type="number" id="numCardsInput" value="15" min="5" max="25" class="form-control">
                </div>`;
        } else if (action === 'open_question_generate') {
             title.textContent = this._('actionOpenQuestion'); // Or a more specific title like "Options for Open Questions"
             // No specific options for open_question_generate other than difficulty for now
        }

        if (action === 'qcm' || action === 'open_question_generate') {
            optionsHtml += `
                <div class="form-group">
                    <label for="difficultySlider">${this._('optionsDifficultyLabel')}</label>
                    <input type="range" id="difficultySlider" min="1" max="5" value="3" class="form-control">
                    <div class="difficulty-labels">
                        <span data-lang="difficultyLevel1">${this._('difficultyLevel1')}</span>
                        <span data-lang="difficultyLevel2">${this._('difficultyLevel2')}</span>
                        <span data-lang="difficultyLevel3">${this._('difficultyLevel3')}</span>
                        <span data-lang="difficultyLevel4">${this._('difficultyLevel4')}</span>
                        <span data-lang="difficultyLevel5">${this._('difficultyLevel5')}</span>
                    </div>
                </div>`;
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
                this.showNotification(this._('optionsQCMError'), 'error');
                isValid = false;
            }
        } else if (this.currentAction === 'flashcards') {
            const numInput = document.getElementById('numCardsInput');
            options.numCards = parseInt(numInput.value);
            if (isNaN(options.numCards) || options.numCards < 5 || options.numCards > 25) {
                this.showNotification(this._('optionsFlashcardsError'), 'error');
                isValid = false;
            }
        }

        if (this.currentAction === 'qcm' || this.currentAction === 'open_question_generate') {
            const difficultySlider = document.getElementById('difficultySlider');
            if (difficultySlider) {
                options.difficultyLevel = parseInt(difficultySlider.value);
            }
        }

        if (!isValid) return;

        this.hideModal('optionsModal');
        await this.generateContent(this.currentAction, options);
    }

    async submitUserQuestion() { 
        const questionInput = document.getElementById('questionInput');
        const question = questionInput.value.trim();
        if (!question) {
            this.showNotification(this._('notificationEnterQuestion'), 'error');
            return;
        }
        const options = { question };
        this.hideModal('questionModal');
        await this.generateContent('question', options);
        questionInput.value = '';
    }
    
    async submitOpenAnswer() {
        const userAnswerInput = document.getElementById('userOpenAnswer');
        const userAnswer = userAnswerInput.value.trim();

        if (!userAnswer) {
            this.showNotification(this._('notificationEnterAnswer'), 'error');
            return;
        }
        if (!this.generatedOpenQuestion) {
             this.showNotification(this._('notificationDocumentMissing'), 'error'); // Or a more specific error
            return;
        }

        const options = {
            originalQuestion: this.generatedOpenQuestion,
            userAnswer: userAnswer
        };
        
        await this.generateContent('open_question_correct', options);
    }


    async generateContent(type, options = {}) {
        if (!this.currentDocument || !this.currentDocument.text) {
            this.showNotification(this._('notificationDocumentMissing'), 'error');
            return;
        }
        
        this.showLoading('loadingTextSendingRequest'); 

        try {
            const requestBody = {
                text: this.currentDocument.text,
                type: type,
                options: options, // This will include numQuestions, numCards, difficultyLevel etc.
                apiKey: this.apiKey,
                language: this.currentLanguage 
            };
            
            const responsePromise = fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            this.showLoading('loadingTextWaitingForAI'); 
            const response = await responsePromise;
            
            this.showLoading('loadingTextProcessingResponse');
            const result = await response.json();

            if (response.ok && result.success && result.content && typeof result.content.text !== 'undefined') {
                this.showResults(type, result.content.text);
                this.addHistoryEntry(type, options);
                if (result.content.usage) {
                    const promptTokens = result.content.usage.promptTokenCount || 0;
                    const candidatesTokens = result.content.usage.candidatesTokenCount || 0;
                    this.updateStoredTokens(promptTokens, candidatesTokens);
                }
            } else {
                throw new Error(result.error || `HTTP error ${response.status}`);
            }
        } catch (error) {
            console.error('Generation error:', error);
            this.showNotification(this._('notificationErrorGeneration') + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    showResults(type, content) {
        const resultsSection = document.getElementById('resultsSection');
        const resultsTitle = document.getElementById('resultsTitle');
        const resultsContent = document.getElementById('resultsContent');
        const openQuestionInteractionSection = document.getElementById('openQuestionInteractionSection');
        const generatedOpenQuestionTextEl = document.getElementById('generatedOpenQuestionText');
        const openAnswerFeedbackContentEl = document.getElementById('openAnswerFeedbackContent');
        const openAnswerFeedbackEl = document.getElementById('openAnswerFeedback');

        if (!resultsSection || !resultsTitle || !resultsContent) return;

        const titlesMap = {
            'summary_short': this._('resultsSummaryShort'),
            'summary_long': this._('resultsSummaryLong'),
            'qcm': this._('resultsQCM'),
            'flashcards': this._('resultsFlashcards'),
            'revision_sheet': this._('resultsRevisionSheet'),
            'question': this._('resultsQuestion'),
            'open_question_generate': this._('resultsOpenQuestion'),
            'open_question_correct': this._('resultsOpenQuestionFeedback')
        };
        resultsTitle.textContent = titlesMap[type] || this._('resultsTitleLabel');
        
        let html = '';
        this.currentQCMData = null;
        this.currentFlashcardsData = null;
        
        openQuestionInteractionSection.style.display = 'none';
        resultsContent.style.display = 'block';
        content = this.replaceEmojiCodes(content);

        let parsableJSON; 

        switch (type) {
            case 'summary_short':
            case 'summary_long':
            case 'revision_sheet':
            case 'question':
                html = `<div class="markdown-content">${marked.parse(content)}</div>`;
                resultsContent.innerHTML = html;
                break;
            case 'qcm':
                try {
                    let cleanedContent = content.trim();
                    if (cleanedContent.startsWith('```json')) {
                        cleanedContent = cleanedContent.substring(7, cleanedContent.length - 3).trim();
                    } else if (cleanedContent.startsWith('```')) {
                         cleanedContent = cleanedContent.substring(3, cleanedContent.length - 3).trim();
                    }
                    
                parsableJSON = cleanedContent;
                const arrayMatch = cleanedContent.match(/(\[[\s\S]*\])/);
                if (arrayMatch && arrayMatch[1]) {
                    parsableJSON = arrayMatch[1];
                }

                this.currentQCMData = JSON.parse(parsableJSON);
                this.qcmScore = { total: 0, correct: 0 };
                html = this.formatQCM(this.currentQCMData);
                resultsContent.innerHTML = html;
                this.setupQCMInteractions();
                } catch (e) {
                    console.error("Error parsing QCM JSON:", e, "\nRaw content:", content, "\nAttempted to parse:", parsableJSON || content);
                    html = `<div class="markdown-content"><p>${this._('notificationQCMFormatError')} ${this._('checkConsoleForDetails')}</p><p>Raw output:</p><pre>${content}</pre></div>`;
                    resultsContent.innerHTML = html;
                    this.showNotification(`${this._('notificationQCMFormatError')} ${this._('checkConsoleForDetails')}`, "error");
                }
                break;
            case 'flashcards':
                 try {
                    let cleanedContent = content.trim();
                    if (cleanedContent.startsWith('```json')) {
                        cleanedContent = cleanedContent.substring(7, cleanedContent.length - 3).trim();
                    } else if (cleanedContent.startsWith('```')) {
                         cleanedContent = cleanedContent.substring(3, cleanedContent.length - 3).trim();
                    }
                    
                    parsableJSON = cleanedContent;
                    const arrayMatch = cleanedContent.match(/(\[[\s\S]*\])/);
                    if (arrayMatch && arrayMatch[1]) {
                        parsableJSON = arrayMatch[1];
                    }
                    this.currentFlashcardsData = JSON.parse(parsableJSON);
                    html = this.formatFlashcards(this.currentFlashcardsData);
                    resultsContent.innerHTML = html;
                    this.setupFlashcards();
                } catch (e) {
                    console.error("Error parsing Flashcards JSON:", e, "\nRaw content:", content, "\nAttempted to parse:", parsableJSON || content);
                    html = `<div class="markdown-content"><p>${this._('notificationFlashcardsFormatError')} ${this._('checkConsoleForDetails')}</p><p>Raw output:</p><pre>${content}</pre></div>`;
                    resultsContent.innerHTML = html;
                    this.showNotification(`${this._('notificationFlashcardsFormatError')} ${this._('checkConsoleForDetails')}`, "error");
                }
                break;
            case 'open_question_generate':
                this.generatedOpenQuestion = content; 
                generatedOpenQuestionTextEl.textContent = content;
                document.getElementById('userOpenAnswer').value = ''; 
                openAnswerFeedbackEl.style.display = 'none'; 
                openQuestionInteractionSection.style.display = 'block';
                resultsContent.style.display = 'none'; 
                break;
            case 'open_question_correct':
                openAnswerFeedbackContentEl.innerHTML = `<div class="markdown-content">${marked.parse(content)}</div>`;
                openAnswerFeedbackEl.style.display = 'block';
                openQuestionInteractionSection.style.display = 'block'; 
                resultsContent.style.display = 'none'; 
                break;
        }
        
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }


    formatQCM(qcmDataArray) {
        let html = '<div class="qcm-container">';
        qcmDataArray.forEach((q, index) => {
            const questionId = `q-${index}`;
            html += `
                <div class="qcm-item" id="${questionId}" data-correct-answer="${q.correct_answer}">
                    <h4>${this._('actionQCM')} ${index + 1}: ${q.question}</h4>
                    <div class="qcm-options">`;
            q.options.forEach((option, optIndex) => {
                const optionId = `${questionId}-opt-${optIndex}`;
                const optionLetter = String.fromCharCode(65 + optIndex);
                html += `
                    <label for="${optionId}" class="qcm-option">
                        <input type="radio" name="${questionId}-options" id="${optionId}" value="${optionLetter}">
                        <strong>${optionLetter}.</strong> ${option}
                    </label>`;
            });
            html += `</div>
                    <button class="check-answer-btn" data-question-index="${index}">${this._('checkAnswerBtnLabel')}</button> 
                    <div class="qcm-explanation">
                        <strong>${this._('aiFeedbackTitle').replace(this._('aiFeedbackTitle').split(" ")[0],this._('resultsQCM').split(" ")[0])}:</strong> ${q.explanation || "Aucune explication fournie."}
                    </div>
                </div>`;
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
                    this.showNotification(this._('notificationSelectAnswer'), 'info');
                    return;
                }

                const userAnswerLetter = selectedOptionInput.value;
                const correctAnswerLetter = qcmItem.dataset.correctAnswer;

                qcmItem.querySelectorAll('.qcm-option').forEach(label => {
                    const input = label.querySelector('input[type="radio"]');
                    label.classList.remove('selected', 'correct-answer', 'incorrect-answer'); 
                    if (input.value === correctAnswerLetter) label.classList.add('correct-answer');
                    if (input.checked) {
                        label.classList.add('selected');
                        if (input.value !== correctAnswerLetter) label.classList.add('incorrect-answer');
                    }
                    input.disabled = true; 
                });
                qcmItem.querySelector('.qcm-explanation')?.classList.add('visible');
                button.disabled = true;

                if (!qcmItem.dataset.answered) {
                    this.qcmScore.total++;
                    if (userAnswerLetter === correctAnswerLetter) {
                        this.qcmScore.correct++;
                    }
                    qcmItem.dataset.answered = 'true';
                    if (this.qcmScore.total === this.currentQCMData.length) {
                        this.showNotification(`Score: ${this.qcmScore.correct}/${this.qcmScore.total}`, 'info');
                        const last = this.history[this.history.length - 1];
                        if (last && last.action === 'qcm') {
                            last.details.score = `${this.qcmScore.correct}/${this.qcmScore.total}`;
                            this.saveHistory();
                            this.renderHistory();
                        }
                    }
                }
            }
        });
    }

    formatFlashcards(flashcardsDataArray) {
        let html = '<div class="flashcards-container">';
        flashcardsDataArray.forEach((card, index) => {
            html += `
                <div class="flashcard" data-index="${index}">
                    <div class="flashcard-inner">
                        <div class="flashcard-front"><div class="flashcard-content"><h4>${card.front}</h4></div></div>
                        <div class="flashcard-back"><div class="flashcard-content"><p>${card.back}</p></div></div>
                    </div>
                </div>`;
        });
        html += '</div>';
        return html;
    }

    setupFlashcards() {
        document.querySelectorAll('.flashcard').forEach(card => {
            card.addEventListener('click', () => card.classList.toggle('flipped'));
        });
    }
    
    exportResults() {
        const resultsContentElement = document.getElementById('resultsContent');
        const titleElement = document.getElementById('resultsTitle');

        if (!resultsContentElement || !titleElement ) {
            this.showNotification(this._('notificationNoResultsToExport'), 'error');
            return;
        }
        
        const title = titleElement.textContent;
        let textContentToExport = "";

        if (this.currentAction === 'qcm' && this.currentQCMData) {
            this.currentQCMData.forEach((q, i) => {
                textContentToExport += `Question ${i+1}: ${q.question}\n`;
                q.options.forEach((opt, j) => textContentToExport += `${String.fromCharCode(65+j)}. ${opt}\n`);
                textContentToExport += `Réponse: ${q.correct_answer}\nExplication: ${q.explanation}\n\n`;
            });
        } else if (this.currentAction === 'flashcards' && this.currentFlashcardsData) {
             this.currentFlashcardsData.forEach((card, i) => textContentToExport += `Flashcard ${i+1}:\nRecto: ${card.front}\nVerso: ${card.back}\n\n`);
        } else if (this.currentAction === 'open_question_generate' || this.currentAction === 'open_question_correct') {
            const genQEl = document.getElementById('generatedOpenQuestionText');
            const userAnswerEl = document.getElementById('userOpenAnswer');
            const feedbackEl = document.getElementById('openAnswerFeedbackContent');
            if (genQEl && genQEl.offsetParent !== null) textContentToExport += `${this._('openQuestionGeneratedTitle')} ${genQEl.textContent}\n\n`;
            if (userAnswerEl && userAnswerEl.value && userAnswerEl.offsetParent !== null) textContentToExport += `${this._('yourAnswerLabel')} ${userAnswerEl.value}\n\n`;
            if (feedbackEl && feedbackEl.style.display !== 'none' && feedbackEl.offsetParent !== null) textContentToExport += `${this._('aiFeedbackTitle')}\n${feedbackEl.innerText}\n\n`;
        } else {
            const mdContent = resultsContentElement.querySelector('.markdown-content');
            if (mdContent) { 
                textContentToExport = mdContent.innerText;
            } else {
                textContentToExport = resultsContentElement.innerText;
            }
        }

        if (window.jspdf && window.jspdf.jsPDF) {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text(title, 14, 22);
            doc.setFontSize(11);
            const lines = doc.splitTextToSize(textContentToExport, 180);
            doc.text(lines, 14, 32);
            doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
            this.showNotification(this._('notificationExportedPDF'), 'success');
        } else {
            navigator.clipboard.writeText(textContentToExport).then(() => {
                this.showNotification(this._('notificationCopiedToClipboard'), 'info');
            }).catch(err => this.showNotification(this._('notificationErrorCopy'), 'error'));
        }
    }

    resetApp() {
        this.currentDocument = null;
        this.currentAction = null;
        this.currentQCMData = null;
        this.currentFlashcardsData = null;
        this.generatedOpenQuestion = null;
        
        document.getElementById('uploadSection').style.display = 'block';
        document.getElementById('contentSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('openQuestionInteractionSection').style.display = 'none';
        const fileInput = document.getElementById('fileInput');
        if(fileInput) fileInput.value = '';

        this.showNotification(this._('notificationNewAnalysisReady'), 'info');
    }

    showModal(modalId) { document.getElementById(modalId)?.classList.add('show'); }
    hideModal(modalId) { document.getElementById(modalId)?.classList.remove('show'); }

    showLoading(messageKey) {
        document.getElementById('loadingText').textContent = this._(messageKey) || this._('loadingTextDefault');
        document.getElementById('loadingOverlay').style.display = 'flex';
    }
    hideLoading() { document.getElementById('loadingOverlay').style.display = 'none'; }

    showNotification(message, type = 'info') {
        const notificationArea = document.body; 
        const notification = document.createElement('div');
        notification.className = `notification type-${type} slide-in`;
        
        const messageSpan = document.createElement('span');
        messageSpan.textContent = message;
        notification.appendChild(messageSpan);

        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.className = 'notification-close';
        closeButton.onclick = () => {
            notification.classList.remove('slide-in');
            notification.classList.add('slide-out');
            setTimeout(() => notification.remove(), 300); 
        };
        notification.appendChild(closeButton);
        
        notificationArea.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.remove('slide-in');
                notification.classList.add('slide-out');
                setTimeout(() => notification.remove(), 300); 
            }
        }, 7000); 
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new StudyBoostApp();
});