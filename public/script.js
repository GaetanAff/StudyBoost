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
		
		this.dailyInputTokenLimit = 1048576; 
		
		this.currentLanguage = localStorage.getItem('studyboost_language') || 'fr';
		this.translations = window.STUDYBOOST_TRANSLATIONS || {};
                this.usingOllama= false;
                this.availableOllamaModels = [];
                this.selectedOllamaModel = localStorage.getItem('ollama_model') || '';
                this.startingOllama = false;
                this.ollamaStartRetry = 0;

                this.sessions = JSON.parse(localStorage.getItem('studyboost_sessions') || '{}');
                this.currentSessionId = localStorage.getItem('studyboost_current_session') || null;
                this.currentActionIndex = -1; // index of currently displayed action in session history

                this.init();
        }
	
        init() {
                this.setupEventListeners();
                this.checkApiKey();
                this.updateTokenDisplay();
                this.setLanguage(this.currentLanguage);
                this.setInitialDarkMode();

                this.currentSessionId = null;
                this.resetApp();
                this.updateActiveSessionDisplay();
                this.checkOllamaStatusOnLoad();
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
                       document.querySelectorAll('[title-data-lang]').forEach(el => {
                                const key = el.getAttribute('title-data-lang');
                                if (this.translations[lang][key]) {
                                        el.setAttribute('title', this.translations[lang][key]);
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
                        this.updateActiveSessionDisplay();
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
                document.getElementById('useOllama')?.addEventListener('click', () => this.useOllama());
                document.getElementById('useGemini')?.addEventListener('click', () => this.useGemini());
                document.getElementById('languageSwitcher')?.addEventListener('change', (e) => this.setLanguage(e.target.value));
                document.getElementById('testApiKeyBtn')?.addEventListener('click', () => {
                        if (this.usingOllama) {
                                this.testOllamaModel();
                        } else {
                                this.testApiKey();
                        }
                });
                document.getElementById('ollamaModelSelect')?.addEventListener('change', (e) => {
                        this.selectedOllamaModel = e.target.value;
                        localStorage.setItem('ollama_model', this.selectedOllamaModel);
                });
                document.getElementById('sessionBtn')?.addEventListener('click', () => { this.renderSessionHomePage(); });
                document.getElementById('createSessionBtn')?.addEventListener('click', () => {
                        const nameInput = document.getElementById('newSessionName');
                        const name = nameInput.value.trim() || this._('defaultSessionName');
                        nameInput.value = '';
                        this.createSession(name);
                        this.hideModal('sessionModal');
                });
		
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
                document.getElementById('prevResultBtn')?.addEventListener('click', () => this.showPreviousResult());
                document.getElementById('nextResultBtn')?.addEventListener('click', () => this.showNextResult());
		
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

        async fetchOllamaModels(options = {}) {
                const { fromStart = false, silent = false } = options;
                if (!fromStart) {
                        this.showLoading('loadingTextDefault');
                }
                try {
                        const response = await fetch('/api/ollama-models');
                        const result = await response.json();
                        if (response.ok && result.success && Array.isArray(result.models)) {
                                this.availableOllamaModels = result.models;
                                const select = document.getElementById('ollamaModelSelect');
                                if (select) {
                                        select.innerHTML = '';
                                        result.models.forEach(m => {
                                                const opt = document.createElement('option');
                                                opt.value = m;
                                                opt.textContent = m;
                                                select.appendChild(opt);
                                        });
                                        if (!this.selectedOllamaModel) {
                                                this.selectedOllamaModel = result.models[0] || '';
                                        }
                                        select.value = this.selectedOllamaModel;
                                }
                                this.handleOllamaConnectionSuccess();
                        } else {
                                throw new Error(result.error || 'unable to load');
                        }
                } catch (err) {
                        console.error('Erreur récupération modèles Ollama:', err);
                        this.handleOllamaConnectionError(err.message, silent);
                } finally {
                        this.hideLoading();
                }
        }

        async checkOllamaStatusOnLoad() {
                try {
                        const response = await fetch('/api/ollama-models');
                        if (!response.ok) throw new Error('Ollama not responding');
                } catch (error) {
                        console.warn("Ollama n'était pas actif au chargement.");
                        this.handleOllamaConnectionError('', true);
                }
        }

       handleOllamaConnectionError(errorMessage = '', silent = false) {
                const useOllamaBtn = document.getElementById('useOllama');
                if (useOllamaBtn) {
                        useOllamaBtn.classList.add('ollama-off');
                        useOllamaBtn.classList.remove('ollama-starting');
                        useOllamaBtn.innerHTML = `<i class="fas fa-power-off"></i> ${this._('ollamaOffLabel')}`;
                        useOllamaBtn.onclick = () => this.requestOllamaStart();
                }

                if (this.startingOllama && this.ollamaStartRetry === 0) {
                        this.ollamaStartRetry = 1;
                        setTimeout(() => {
                                this.fetchOllamaModels({ fromStart: true });
                        }, 3000);
                        return;
                }

                if (!silent) {
                        if (this.startingOllama) {
                                this.showNotification(this._('ollamaStartFailInstall'), 'error');
                        } else {
                                const msg = errorMessage ? `${this._('ollamaConnectionError')} ${errorMessage}` : this._('ollamaConnectionError');
                                this.showNotification(msg, 'error');
                        }
                }
                this.startingOllama = false;
        }

        handleOllamaConnectionSuccess() {
                const useOllamaBtn = document.getElementById('useOllama');
                if (useOllamaBtn) {
                        useOllamaBtn.classList.remove('ollama-off');
                        useOllamaBtn.classList.remove('ollama-starting');
                        useOllamaBtn.innerHTML = `<i class="fas fa-database"></i> ${this._('ollamaBtnLabel')}`;
                        useOllamaBtn.onclick = () => this.useOllama();
                }
                this.showNotification(this._('notificationUsingOllama'), 'success');
                this.startingOllama = false;
                this.ollamaStartRetry = 0;
        }

        async requestOllamaStart() {
                this.startingOllama = true;
                this.ollamaStartRetry = 0;
                const useOllamaBtn = document.getElementById('useOllama');
                if (useOllamaBtn) {
                        useOllamaBtn.classList.remove('ollama-off');
                        useOllamaBtn.classList.add('ollama-starting');
                        useOllamaBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${this._('ollamaStarting')}`;
                        useOllamaBtn.onclick = null;
                }
                this.showLoading('ollamaStarting');
                this.showNotification(this._('ollamaStartInit'), 'info');

                try {
                        const response = await fetch('/api/start-ollama', { method: 'POST' });
                        await response.json();
                        // We ignore errors here to recheck after a delay
                } catch (error) {
                        console.warn('Ollama start command error:', error);
                }

                setTimeout(() => {
                        this.fetchOllamaModels({ fromStart: true });
                }, 3000);
        }

        async testOllamaModel() {
                if (!this.selectedOllamaModel) return;
                try {
                        const resp = await fetch('/api/generate-Ollama', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                        text: 'ping',
                                        type: 'summary_short',
                                        options: {},
                                        model: this.selectedOllamaModel,
                                        language: this.currentLanguage
                                })
                        });
                        const data = await resp.json();
                        if (resp.ok && data.success) {
                                this.showNotification('Modèle Ollama prêt', 'success');
                        } else {
                                throw new Error(data.error || 'Erreur');
                        }
                } catch(err) {
                        console.error('Test model error', err);
                        this.showNotification('Erreur modèle Ollama: ' + err.message, 'error');
                }
        }

        useOllama() {
                this.usingOllama = true;
                this.fetchOllamaModels();
                const container = document.getElementById('ollamaModelSelectContainer');
                const apiGroup = document.getElementById('apiKeyInput')?.closest('.form-group');
                if (container) container.style.display = 'block';
                if (apiGroup) apiGroup.style.display = 'none';
        }

        useGemini() {
                this.usingOllama = false;
                const container = document.getElementById('ollamaModelSelectContainer');
                const apiGroup = document.getElementById('apiKeyInput')?.closest('.form-group');
                if (container) container.style.display = 'none';
                if (apiGroup) apiGroup.style.display = 'block';
                this.showNotification(this._('notificationUsingGemini'), 'success');
        }

        saveApiKeyAndResetTokens() {
                const container = document.getElementById('ollamaModelSelectContainer');
                const apiGroup = document.getElementById('apiKeyInput')?.closest('.form-group');

                // If Ollama is active, simply confirm the selection
                if (this.usingOllama) {
                        if (container) container.style.display = 'block';
                        if (apiGroup) apiGroup.style.display = 'none';
                        this.showNotification(this._('notificationUsingOllama'), 'success');
                        this.hideModal('apiKeyModal');
                        return;
                }

                // Gemini API key configuration
                if (container) container.style.display = 'none';
                if (apiGroup) apiGroup.style.display = 'block';
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
                const modelSelect = document.getElementById('ollamaModelSelect');
                if (modelSelect && this.selectedOllamaModel) {
                        modelSelect.value = this.selectedOllamaModel;
                }
        }
	
	async handleFileUpload(file) {
		if (!file) return;
		
		if (!this.apiKey && !this.usingOllama) {
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
                                if (this.currentSessionId && this.sessions[this.currentSessionId]) {
                                        this.sessions[this.currentSessionId].currentDocument = this.currentDocument;
                                        this.saveSessions();
                                }
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
		if (!this.apiKey && !this.usingOllama) {
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

                this.lastOptions = options;
		
		this.showLoading('loadingTextSendingRequest'); 
		
		try {
			const requestBody = {
				text: this.currentDocument.text,
				type: type,
				options: options, // This will include numQuestions, numCards, difficultyLevel etc.
				apiKey: this.apiKey,
				language: this.currentLanguage 
			};
                        const requestBodyOllama = {
                                text: this.currentDocument.text,
                                type: type,
                                options: options, // This will include numQuestions, numCards, difficultyLevel etc.
                                model: this.selectedOllamaModel || 'mistral',
                                language: this.currentLanguage
                        };

			if (!this.usingOllama) {
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
					if (result.content.usage) {
						const promptTokens = result.content.usage.promptTokenCount || 0;
						const candidatesTokens = result.content.usage.candidatesTokenCount || 0; 
						this.updateStoredTokens(promptTokens, candidatesTokens);
					}
				} else {
					throw new Error(result.error || `HTTP error ${response.status}`);
				}
			} else {
				const responsePromise = fetch('/api/generate-Ollama', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(requestBodyOllama)
				});
				this.showLoading('loadingTextWaitingForAI'); 
				const response = await responsePromise;
				this.showLoading('loadingTextProcessingResponse');
				const result = await response.json();

				if (response.ok && result.success && result.content && typeof result.content.text !== 'undefined') {
					this.showResults(type, result.content.text); 
					if (result.content.usage) {
						const promptTokens = result.content.usage.promptTokenCount || 0;
						const candidatesTokens = result.content.usage.candidatesTokenCount || 0; 
						this.updateStoredTokens(promptTokens, candidatesTokens);
					}
				} else {
					throw new Error(result.error || `HTTP error ${response.status}`);
				}
			}
			//const responsePromise = fetch('/api/generate', {
			//	method: 'POST',
			//	headers: { 'Content-Type': 'application/json' },
			//	body: JSON.stringify(requestBody)
			//});
			
		} catch (error) {
			console.error('Generation error:', error);
			this.showNotification(this._('notificationErrorGeneration') + error.message, 'error');
		} finally {
			this.hideLoading();
		}
	}
	
        showResults(type, content, fromHistory = false) {
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

                if (!fromHistory && this.currentSessionId && this.sessions[this.currentSessionId]) {
                        const sess = this.sessions[this.currentSessionId];
                        sess.currentDocument = this.currentDocument;
                        sess.actions.push({ type, content, options: this.lastOptions, timestamp: Date.now() });
                        sess.updatedAt = Date.now();
                        this.currentActionIndex = sess.actions.length - 1;
                        this.saveSessions();
                }
                this.updateHistoryButtons();
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
                this.currentActionIndex = -1;
		
		document.getElementById('uploadSection').style.display = 'block';
		document.getElementById('contentSection').style.display = 'none';
		document.getElementById('resultsSection').style.display = 'none';
		document.getElementById('openQuestionInteractionSection').style.display = 'none';
		const fileInput = document.getElementById('fileInput');
                if(fileInput) fileInput.value = '';

                this.showNotification(this._('notificationNewAnalysisReady'), 'info');
                this.updateHistoryButtons();
        }
	
        showModal(modalId) {
                const modalElement = document.getElementById(modalId);
                if (!modalElement) return;
                modalElement.classList.add('show');

                if (modalId === 'apiKeyModal') {
                        this.checkOllamaStatusOnLoad();
                        const container = document.getElementById('ollamaModelSelectContainer');
                        const apiGroup = document.getElementById('apiKeyInput')?.closest('.form-group');
                        if (this.usingOllama) {
                                if (container) container.style.display = 'block';
                                if (apiGroup) apiGroup.style.display = 'none';
                        } else {
                                if (container) container.style.display = 'none';
                                if (apiGroup) apiGroup.style.display = 'block';
                        }
                }
        }

        /* ----- Session Management ----- */
        saveSessions() {
                localStorage.setItem('studyboost_sessions', JSON.stringify(this.sessions));
                localStorage.setItem('studyboost_current_session', this.currentSessionId || '');
        }

        createSession(name) {
                const id = 's' + Date.now();
                const icons = ['📚','📝','📄','🧠','📊','📑','🔖','📌','🗂️','🧩'];
                const icon = icons[Math.floor(Math.random() * icons.length)];
                const timestamp = Date.now();
                this.sessions[id] = {
                        id,
                        name,
                        icon,
                        createdAt: timestamp,
                        updatedAt: timestamp,
                        currentDocument: null,
                        actions: []
                };
                this.currentSessionId = id;
                this.saveSessions();
                this.renderSessionList();
                this.resetApp();
                this.updateActiveSessionDisplay();
        }

        loadSession(id) {
                const sess = this.sessions[id];
                if (!sess) return;
                this.currentSessionId = id;
                this.currentDocument = sess.currentDocument;
                this.currentActionIndex = sess.actions.length - 1;
                const lastAction = sess.actions[this.currentActionIndex];
                if (this.currentDocument) {
                        this.showDocumentProcessed(this.currentDocument.filename, this.currentDocument.text);
                } else {
                        this.resetApp();
                }
                if (lastAction) {
                        this.currentAction = lastAction.type;
                        this.showResults(lastAction.type, lastAction.content, true);
                }
                this.updateHistoryButtons();
                this.saveSessions();
                this.updateActiveSessionDisplay();
        }

        renameSession(id, newName) {
                if (this.sessions[id]) {
                        this.sessions[id].name = newName;
                        this.sessions[id].updatedAt = Date.now();
                        if (this.currentSessionId === id) this.updateActiveSessionDisplay();
                        this.saveSessions();
                        this.renderSessionList();
                }
        }

        deleteSession(id) {
                if (this.sessions[id]) {
                        delete this.sessions[id];
                        if (this.currentSessionId === id) {
                                this.currentSessionId = null;
                                this.resetApp();
                        }
                        this.saveSessions();
                        this.renderSessionList();
                        this.updateActiveSessionDisplay();
                }
        }

        updateActiveSessionDisplay() {
                const el = document.getElementById('activeSessionDisplay');
                if (!el) return;
                if (this.currentSessionId && this.sessions[this.currentSessionId]) {
                        el.textContent = this._('activeSessionPrefix') + this.sessions[this.currentSessionId].name;
                } else {
                        el.textContent = this._('activeSessionPrefix') + this._('noActiveSession');
                }
        }

        renderSessionList() {
                const list = document.getElementById('sessionList');
                if (!list) return;
                list.innerHTML = '';
                const sessionsArr = Object.values(this.sessions);
                if (sessionsArr.length === 0) {
                        list.textContent = this._('noSessionsMessage');
                        return;
                }
                sessionsArr.forEach(sess => {
                        const div = document.createElement('div');
                        div.className = 'session-item';
                        const nameSpan = document.createElement('span');
                        nameSpan.innerHTML = `<strong>${sess.name}</strong> (${sess.actions.length})`;
                        div.appendChild(nameSpan);

                        const openBtn = document.createElement('button');
                        openBtn.className = 'btn-secondary load-session-btn';
                        openBtn.textContent = this._('openSessionBtnLabel');
                        openBtn.dataset.id = sess.id;
                        openBtn.addEventListener('click', () => { this.loadSession(sess.id); this.hideModal('sessionModal'); });
                        div.appendChild(openBtn);

                        const renameBtn = document.createElement('button');
                        renameBtn.className = 'btn-secondary rename-session-btn';
                        renameBtn.textContent = this._('renameSessionBtnLabel');
                        renameBtn.addEventListener('click', () => {
                                const newName = prompt(this._('newSessionNameLabel'), sess.name);
                                if (newName) this.renameSession(sess.id, newName.trim());
                        });
                        div.appendChild(renameBtn);

                        const deleteBtn = document.createElement('button');
                        deleteBtn.className = 'btn-secondary delete-session-btn';
                        deleteBtn.textContent = this._('deleteSessionBtnLabel');
                        deleteBtn.addEventListener('click', () => {
                                if (confirm(this._('deleteSessionBtnLabel') + ' ?')) this.deleteSession(sess.id);
                        });
                        div.appendChild(deleteBtn);

                        list.appendChild(div);
                });
        }

        renderSessionHomePage() {
                const home = document.getElementById('sessionsHomePage');
                if (!home) return;
                home.style.display = 'block';
                ['uploadSection','contentSection','resultsSection'].forEach(id => {
                        const el = document.getElementById(id);
                        if (el) el.style.display = 'none';
                });

                const grid = document.getElementById('sessionsGrid');
                if (!grid) return;
                grid.innerHTML = '';
                const sessionsArr = Object.values(this.sessions);
                if (sessionsArr.length === 0) {
                        grid.innerHTML = `<p>${this._('noSessionsMessage')}</p>`;
                        return;
                }
                sessionsArr.sort((a,b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
                const darkColors = ['#1e1e2f','#22223b','#2a213a','#1f2a48','#282a36'];
                sessionsArr.forEach(sess => {
                        const card = document.createElement('div');
                        card.className = 'session-card';
                        const icon = document.createElement('div');
                        icon.className = 'session-card-icon';
                        icon.textContent = sess.icon || '📄';
                        const title = document.createElement('h3');
                        title.textContent = sess.name;
                        const info = document.createElement('p');
                        const date = new Date(sess.updatedAt || sess.createdAt);
                        info.textContent = `${date.toLocaleDateString()} · ${sess.actions.length} actions`;
                        const menu = document.createElement('button');
                        menu.className = 'session-card-menu btn-icon';
                        menu.innerHTML = '<i class="fas fa-ellipsis-h"></i>';
                        card.appendChild(menu);
                        card.appendChild(icon);
                        card.appendChild(title);
                        card.appendChild(info);
                        if (document.body.classList.contains('dark-mode')) {
                                card.style.background = darkColors[Math.floor(Math.random()*darkColors.length)];
                                card.style.color = '#fff';
                        }
                        card.addEventListener('click', (e) => {
                                if (e.target === menu) return;
                                this.openSessionFromHome(sess.id);
                        });
                        grid.appendChild(card);
                });

                document.getElementById('createSessionHomeBtn').onclick = () => {
                        const name = prompt(this._('newSessionNameLabel')) || this._('defaultSessionName');
                        this.createSession(name.trim());
                        this.renderSessionHomePage();
                };
                const gridBtn = document.getElementById('gridViewBtn');
                const listBtn = document.getElementById('listViewBtn');
                gridBtn.onclick = () => {
                        grid.classList.remove('list-view');
                };
                listBtn.onclick = () => {
                        grid.classList.add('list-view');
                };
        }

        openSessionFromHome(id) {
                this.loadSession(id);
                document.getElementById('sessionsHomePage').style.display = 'none';
                document.getElementById('uploadSection').style.display = 'block';
        }
        hideModal(modalId) {
                const modalElement = document.getElementById(modalId);
                if (modalElement) modalElement.classList.remove('show');
        }
	
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

        updateHistoryButtons() {
                const sess = this.sessions[this.currentSessionId];
                const prevBtn = document.getElementById('prevResultBtn');
                const nextBtn = document.getElementById('nextResultBtn');
                if (!sess || !prevBtn || !nextBtn) return;
                prevBtn.disabled = this.currentActionIndex <= 0;
                nextBtn.disabled = this.currentActionIndex >= sess.actions.length - 1;
        }

        showPreviousResult() {
                const sess = this.sessions[this.currentSessionId];
                if (!sess || this.currentActionIndex <= 0) return;
                this.currentActionIndex--;
                const action = sess.actions[this.currentActionIndex];
                this.currentAction = action.type;
                this.showResults(action.type, action.content, true);
        }

        showNextResult() {
                const sess = this.sessions[this.currentSessionId];
                if (!sess || this.currentActionIndex >= sess.actions.length - 1) return;
                this.currentActionIndex++;
                const action = sess.actions[this.currentActionIndex];
                this.currentAction = action.type;
                this.showResults(action.type, action.content, true);
        }
}

document.addEventListener('DOMContentLoaded', () => {
	new StudyBoostApp();
});
