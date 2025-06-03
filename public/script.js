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
        this.translations = {
            // French (Default)
            fr: {
                appTitle: "StudyBoost - IA pour la Révision",
                appTitleShort: "StudyBoost",
                inputTokensLabel: "Tokens Entrée",
                outputTokensLabel: "Tokens Sortie",
                apiKeyBtnLabel: "Clé API",
                darkModeToggleLabelLight: "Mode Clair",
                darkModeToggleLabelDark: "Mode Sombre",
                uploadTitle: "Uploadez vos documents",
                uploadSubtitle: "PDF, Word, PowerPoint, Images (OCR)",
                uploadPlaceholder: "Cliquez ou glissez vos fichiers ici",
                processedDocumentLabel: "Document traité",
                wordsUnit: "mots",
                pagesUnit: "pages",
                actionSummaryShort: "Résumé Court",
                actionSummaryShortDesc: "Version condensée rapide",
                actionSummaryLong: "Résumé Détaillé",
                actionSummaryLongDesc: "Structuré et complet",
                actionQCM: "QCM",
                actionQCMDesc: "Questions à choix multiples",
                actionFlashcards: "Flashcards",
                actionFlashcardsDesc: "Cartes de révision",
                actionOpenQuestion: "Questions Ouvertes",
                actionOpenQuestionDesc: "Générer une question ouverte et vérifier votre réponse",
                actionRevisionSheet: "Fiche de Révision",
                actionRevisionSheetDesc: "Fiche complète et design",
                actionAskQuestion: "Poser une Question",
                actionAskQuestionDesc: "Questions libres sur le contenu",
                resultsTitleLabel: "Résultats",
                exportBtnLabel: "Exporter",
                newAnalysisBtnLabel: "Nouvelle Analyse",
                apiKeyModalTitle: "Configuration API Gemini",
                apiKeyInputLabel: "Clé API Google Gemini",
                apiKeyInputPlaceholder: "Entrez votre clé API Gemini",
                apiKeyModalDesc1: "Obtenez votre clé sur",
                saveBtnLabel: "Sauvegarder",
                askUserQuestionModalTitle: "Poser une Question",
                yourQuestionOnDocLabel: "Votre question sur le document",
                userQuestionPlaceholder: "Posez votre question...",
                submitUserQuestionBtnLabel: "Poser la Question",
                optionsModalTitle: "Options",
                generateBtnLabel: "Générer",
                loadingTextDefault: "Traitement en cours...",
                loadingTextDocument: "Traitement du document...",
                loadingTextGenerating: "Génération du contenu avec l'IA...",
                loadingTextSendingRequest: "Envoi de la requête à l'IA...",
                loadingTextWaitingForAI: "En attente de la réponse de l'IA...",
                loadingTextProcessingResponse: "Traitement de la réponse de l'IA...",
                notificationApiKeyMissing: "Veuillez d'abord configurer votre clé API Gemini",
                notificationDocumentMissing: "Veuillez d'abord uploader un document.",
                notificationApiKeySaved: "Clé API sauvegardée.",
                notificationApiKeySavedReset: "Nouvelle clé API sauvegardée. Les compteurs de tokens ont été réinitialisés.",
                notificationApiKeyUnchanged: "Clé API sauvegardée (inchangée).",
                notificationEnterValidApiKey: "Veuillez entrer une clé API valide",
                notificationErrorUpload: "Erreur lors du traitement du document: ",
                notificationErrorGeneration: "Erreur lors de la génération: ",
                notificationNoResultsToExport: "Aucun résultat à exporter.",
                notificationCopiedToClipboard: "Contenu copié dans le presse-papiers (jsPDF non disponible).",
                notificationErrorCopy: "Erreur lors de la copie.",
                notificationExportedPDF: "Résultats exportés en PDF.",
                notificationNewAnalysisReady: "Prêt pour une nouvelle analyse.",
                notificationSelectAnswer: "Veuillez sélectionner une réponse.",
                notificationEnterQuestion: "Veuillez entrer une question.",
                notificationEnterAnswer: "Veuillez entrer votre réponse.",
                notificationQCMFormatError: "Les QCM n'ont pas pu être formatés correctement.",
                notificationFlashcardsFormatError: "Les Flashcards n'ont pas pu être formatées correctement.",
                checkConsoleForDetails: "Vérifiez la console pour plus de détails.",
                optionsQCMTitle: "Options QCM",
                optionsQCMLabel: "Nombre de questions (5-20)",
                optionsQCMError: "Veuillez entrer un nombre de questions entre 5 et 20.",
                optionsFlashcardsTitle: "Options Flashcards",
                optionsFlashcardsLabel: "Nombre de flashcards (5-25)",
                optionsFlashcardsError: "Veuillez entrer un nombre de flashcards entre 5 et 25.",
                openQuestionGeneratedTitle: "Question Générée :",
                yourAnswerLabel: "Votre Réponse :",
                openAnswerPlaceholder: "Écrivez votre réponse ici...",
                submitOpenAnswerBtnLabel: "Soumettre pour Correction",
                aiFeedbackTitle: "Correction de l'IA :",
                resultsSummaryShort: "Résumé Court",
                resultsSummaryLong: "Résumé Détaillé",
                resultsQCM: "Questions à Choix Multiples",
                resultsFlashcards: "Flashcards",
                resultsRevisionSheet: "Fiche de Révision",
                resultsQuestion: "Réponse à votre Question",
                resultsOpenQuestion: "Question Ouverte Générée",
                resultsOpenQuestionFeedback: "Correction de votre Réponse",
                optionsDifficultyLabel: "Niveau de difficulté",
                difficultyLevel1: "Découverte",
                difficultyLevel2: "Facile",
                difficultyLevel3: "Moyen",
                difficultyLevel4: "Difficile",
                difficultyLevel5: "Expert",
                checkAnswerBtnLabel: "Vérifier la réponse",
            },
            en: {
                appTitle: "StudyBoost - AI Study Assistant",
                appTitleShort: "StudyBoost",
                inputTokensLabel: "Input Tokens",
                outputTokensLabel: "Output Tokens",
                apiKeyBtnLabel: "API Key",
                darkModeToggleLabelLight: "Light Mode",
                darkModeToggleLabelDark: "Dark Mode",
                uploadTitle: "Upload your documents",
                uploadSubtitle: "PDF, Word, PowerPoint, Images (OCR)",
                uploadPlaceholder: "Click or drag your files here",
                processedDocumentLabel: "Processed Document",
                wordsUnit: "words",
                pagesUnit: "pages",
                actionSummaryShort: "Short Summary",
                actionSummaryShortDesc: "Quick condensed version",
                actionSummaryLong: "Detailed Summary",
                actionSummaryLongDesc: "Structured and complete",
                actionQCM: "MCQ",
                actionQCMDesc: "Multiple choice questions",
                actionFlashcards: "Flashcards",
                actionFlashcardsDesc: "Revision cards",
                actionOpenQuestion: "Open Questions",
                actionOpenQuestionDesc: "Generate an open question and check your answer",
                actionRevisionSheet: "Revision Sheet",
                actionRevisionSheetDesc: "Complete and designed sheet",
                actionAskQuestion: "Ask a Question",
                actionAskQuestionDesc: "Free-form questions on content",
                resultsTitleLabel: "Results",
                exportBtnLabel: "Export",
                newAnalysisBtnLabel: "New Analysis",
                apiKeyModalTitle: "Gemini API Configuration",
                apiKeyInputLabel: "Google Gemini API Key",
                apiKeyInputPlaceholder: "Enter your Gemini API key",
                apiKeyModalDesc1: "Get your key from",
                saveBtnLabel: "Save",
                askUserQuestionModalTitle: "Ask a Question",
                yourQuestionOnDocLabel: "Your question about the document",
                userQuestionPlaceholder: "Ask your question...",
                submitUserQuestionBtnLabel: "Ask Question",
                optionsModalTitle: "Options",
                generateBtnLabel: "Generate",
                loadingTextDefault: "Processing...",
                loadingTextDocument: "Processing document...",
                loadingTextGenerating: "Generating content with AI...",
                loadingTextSendingRequest: "Sending request to AI...",
                loadingTextWaitingForAI: "Waiting for AI response...",
                loadingTextProcessingResponse: "Processing AI response...",
                notificationApiKeyMissing: "Please configure your Gemini API key first",
                notificationDocumentMissing: "Please upload a document first.",
                notificationApiKeySaved: "API key saved.",
                notificationApiKeySavedReset: "New API key saved. Token counters have been reset.",
                notificationApiKeyUnchanged: "API key saved (unchanged).",
                notificationEnterValidApiKey: "Please enter a valid API key",
                notificationErrorUpload: "Error processing document: ",
                notificationErrorGeneration: "Error during generation: ",
                notificationNoResultsToExport: "No results to export.",
                notificationCopiedToClipboard: "Content copied to clipboard (jsPDF not available).",
                notificationErrorCopy: "Error during copy.",
                notificationExportedPDF: "Results exported to PDF.",
                notificationNewAnalysisReady: "Ready for a new analysis.",
                notificationSelectAnswer: "Please select an answer.",
                notificationEnterQuestion: "Please enter a question.",
                notificationEnterAnswer: "Please enter your answer.",
                notificationQCMFormatError: "MCQs could not be formatted correctly.",
                notificationFlashcardsFormatError: "Flashcards could not be formatted correctly.",
                checkConsoleForDetails: "Check console for details.",
                optionsQCMTitle: "MCQ Options",
                optionsQCMLabel: "Number of questions (5-20)",
                optionsQCMError: "Please enter a number of questions between 5 and 20.",
                optionsFlashcardsTitle: "Flashcard Options",
                optionsFlashcardsLabel: "Number of flashcards (5-25)",
                optionsFlashcardsError: "Please enter a number of flashcards between 5 and 25.",
                openQuestionGeneratedTitle: "Generated Question:",
                yourAnswerLabel: "Your Answer:",
                openAnswerPlaceholder: "Write your answer here...",
                submitOpenAnswerBtnLabel: "Submit for Correction",
                aiFeedbackTitle: "AI Feedback:",
                resultsSummaryShort: "Short Summary",
                resultsSummaryLong: "Detailed Summary",
                resultsQCM: "Multiple Choice Questions",
                resultsFlashcards: "Flashcards",
                resultsRevisionSheet: "Revision Sheet",
                resultsQuestion: "Answer to your Question",
                resultsOpenQuestion: "Generated Open Question",
                resultsOpenQuestionFeedback: "Feedback on your Answer",
                optionsDifficultyLabel: "Difficulty Level",
                difficultyLevel1: "Discovery",
                difficultyLevel2: "Easy",
                difficultyLevel3: "Medium",
                difficultyLevel4: "Hard",
                difficultyLevel5: "Expert",
                checkAnswerBtnLabel: "Check Answer",
            },
            de: {
                appTitle: "StudyBoost - KI-Lernassistent",
                appTitleShort: "StudyBoost",
                inputTokensLabel: "Eingabe-Tokens",
                outputTokensLabel: "Ausgabe-Tokens",
                apiKeyBtnLabel: "API-Schlüssel",
                darkModeToggleLabelLight: "Heller Modus",
                darkModeToggleLabelDark: "Dunkler Modus",
                uploadTitle: "Laden Sie Ihre Dokumente hoch",
                uploadSubtitle: "PDF, Word, PowerPoint, Bilder (OCR)",
                uploadPlaceholder: "Klicken oder ziehen Sie Ihre Dateien hierher",
                processedDocumentLabel: "Verarbeitetes Dokument",
                wordsUnit: "Wörter",
                pagesUnit: "Seiten",
                actionSummaryShort: "Kurze Zusammenfassung",
                actionSummaryShortDesc: "Schnelle komprimierte Version",
                actionSummaryLong: "Detaillierte Zusammenfassung",
                actionSummaryLongDesc: "Strukturiert und vollständig",
                actionQCM: "MC-Fragen",
                actionQCMDesc: "Multiple-Choice-Fragen",
                actionFlashcards: "Lernkarten",
                actionFlashcardsDesc: "Wiederholungskarten",
                actionOpenQuestion: "Offene Fragen",
                actionOpenQuestionDesc: "Generieren Sie eine offene Frage und überprüfen Sie Ihre Antwort",
                actionRevisionSheet: "Revisionsblatt",
                actionRevisionSheetDesc: "Vollständiges und gestaltetes Blatt",
                actionAskQuestion: "Frage stellen",
                actionAskQuestionDesc: "Freiformfragen zum Inhalt",
                resultsTitleLabel: "Ergebnisse",
                exportBtnLabel: "Exportieren",
                newAnalysisBtnLabel: "Neue Analyse",
                apiKeyModalTitle: "Gemini API-Konfiguration",
                apiKeyInputLabel: "Google Gemini API-Schlüssel",
                apiKeyInputPlaceholder: "Geben Sie Ihren Gemini API-Schlüssel ein",
                apiKeyModalDesc1: "Holen Sie sich Ihren Schlüssel von",
                saveBtnLabel: "Speichern",
                askUserQuestionModalTitle: "Frage stellen",
                yourQuestionOnDocLabel: "Ihre Frage zum Dokument",
                userQuestionPlaceholder: "Stellen Sie Ihre Frage...",
                submitUserQuestionBtnLabel: "Frage absenden",
                optionsModalTitle: "Optionen",
                generateBtnLabel: "Generieren",
                loadingTextDefault: "Verarbeitung...",
                loadingTextDocument: "Dokument wird verarbeitet...",
                loadingTextGenerating: "Inhalt wird mit KI generiert...",
                loadingTextSendingRequest: "Anfrage an KI wird gesendet...",
                loadingTextWaitingForAI: "Warten auf KI-Antwort...",
                loadingTextProcessingResponse: "KI-Antwort wird verarbeitet...",
                notificationApiKeyMissing: "Bitte konfigurieren Sie zuerst Ihren Gemini API-Schlüssel",
                notificationDocumentMissing: "Bitte laden Sie zuerst ein Dokument hoch.",
                notificationApiKeySaved: "API-Schlüssel gespeichert.",
                notificationApiKeySavedReset: "Neuer API-Schlüssel gespeichert. Token-Zähler wurden zurückgesetzt.",
                notificationApiKeyUnchanged: "API-Schlüssel gespeichert (unverändert).",
                notificationEnterValidApiKey: "Bitte geben Sie einen gültigen API-Schlüssel ein",
                notificationErrorUpload: "Fehler beim Verarbeiten des Dokuments: ",
                notificationErrorGeneration: "Fehler bei der Generierung: ",
                notificationNoResultsToExport: "Keine Ergebnisse zum Exportieren.",
                notificationCopiedToClipboard: "Inhalt in Zwischenablage kopiert (jsPDF nicht verfügbar).",
                notificationErrorCopy: "Fehler beim Kopieren.",
                notificationExportedPDF: "Ergebnisse als PDF exportiert.",
                notificationNewAnalysisReady: "Bereit für eine neue Analyse.",
                notificationSelectAnswer: "Bitte wählen Sie eine Antwort aus.",
                notificationEnterQuestion: "Bitte geben Sie eine Frage ein.",
                notificationEnterAnswer: "Bitte geben Sie Ihre Antwort ein.",
                notificationQCMFormatError: "MC-Fragen konnten nicht korrekt formatiert werden.",
                notificationFlashcardsFormatError: "Lernkarten konnten nicht korrekt formatiert werden.",
                checkConsoleForDetails: "Überprüfen Sie die Konsole für Details.",
                optionsQCMTitle: "MC-Fragen Optionen",
                optionsQCMLabel: "Anzahl der Fragen (5-20)",
                optionsQCMError: "Bitte geben Sie eine Anzahl von Fragen zwischen 5 und 20 ein.",
                optionsFlashcardsTitle: "Lernkarten Optionen",
                optionsFlashcardsLabel: "Anzahl der Lernkarten (5-25)",
                optionsFlashcardsError: "Bitte geben Sie eine Anzahl von Lernkarten zwischen 5 und 25 ein.",
                openQuestionGeneratedTitle: "Generierte Frage:",
                yourAnswerLabel: "Deine Antwort:",
                openAnswerPlaceholder: "Schreiben Sie Ihre Antwort hier...",
                submitOpenAnswerBtnLabel: "Zur Korrektur einreichen",
                aiFeedbackTitle: "KI-Feedback:",
                resultsSummaryShort: "Kurze Zusammenfassung",
                resultsSummaryLong: "Detaillierte Zusammenfassung",
                resultsQCM: "Multiple-Choice-Fragen",
                resultsFlashcards: "Lernkarten",
                resultsRevisionSheet: "Revisionsblatt",
                resultsQuestion: "Antwort auf Ihre Frage",
                resultsOpenQuestion: "Generierte Offene Frage",
                resultsOpenQuestionFeedback: "Feedback zu Ihrer Antwort",
                optionsDifficultyLabel: "Schwierigkeitsgrad",
                difficultyLevel1: "Entdeckung",
                difficultyLevel2: "Einfach",
                difficultyLevel3: "Mittel",
                difficultyLevel4: "Schwer",
                difficultyLevel5: "Experte",
                checkAnswerBtnLabel: "Antwort überprüfen",
            },
            es: {
                appTitle: "StudyBoost - Asistente de Estudio IA",
                appTitleShort: "StudyBoost",
                inputTokensLabel: "Tokens de Entrada",
                outputTokensLabel: "Tokens de Salida",
                apiKeyBtnLabel: "Clave API",
                darkModeToggleLabelLight: "Modo Claro",
                darkModeToggleLabelDark: "Modo Oscuro",
                uploadTitle: "Sube tus documentos",
                uploadSubtitle: "PDF, Word, PowerPoint, Imágenes (OCR)",
                uploadPlaceholder: "Haz clic o arrastra tus archivos aquí",
                processedDocumentLabel: "Documento Procesado",
                wordsUnit: "palabras",
                pagesUnit: "páginas",
                actionSummaryShort: "Resumen Corto",
                actionSummaryShortDesc: "Versión condensada rápida",
                actionSummaryLong: "Resumen Detallado",
                actionSummaryLongDesc: "Estructurado y completo",
                actionQCM: "PEM", // Preguntas de Elección Múltiple
                actionQCMDesc: "Preguntas de elección múltiple",
                actionFlashcards: "Tarjetas",
                actionFlashcardsDesc: "Tarjetas de revisión",
                actionOpenQuestion: "Preguntas Abiertas",
                actionOpenQuestionDesc: "Generar una pregunta abierta y verificar tu respuesta",
                actionRevisionSheet: "Hoja de Revisión",
                actionRevisionSheetDesc: "Hoja completa y diseñada",
                actionAskQuestion: "Hacer una Pregunta",
                actionAskQuestionDesc: "Preguntas libres sobre el contenido",
                resultsTitleLabel: "Resultados",
                exportBtnLabel: "Exportar",
                newAnalysisBtnLabel: "Nuevo Análisis",
                apiKeyModalTitle: "Configuración API Gemini",
                apiKeyInputLabel: "Clave API Google Gemini",
                apiKeyInputPlaceholder: "Introduce tu clave API Gemini",
                apiKeyModalDesc1: "Obtén tu clave en",
                saveBtnLabel: "Guardar",
                askUserQuestionModalTitle: "Hacer una Pregunta",
                yourQuestionOnDocLabel: "Tu pregunta sobre el documento",
                userQuestionPlaceholder: "Haz tu pregunta...",
                submitUserQuestionBtnLabel: "Enviar Pregunta",
                optionsModalTitle: "Opciones",
                generateBtnLabel: "Generar",
                loadingTextDefault: "Procesando...",
                loadingTextDocument: "Procesando documento...",
                loadingTextGenerating: "Generando contenido con IA...",
                loadingTextSendingRequest: "Enviando solicitud a la IA...",
                loadingTextWaitingForAI: "Esperando respuesta de la IA...",
                loadingTextProcessingResponse: "Procesando respuesta de la IA...",
                notificationApiKeyMissing: "Por favor, configure primero su clave API Gemini",
                notificationDocumentMissing: "Por favor, suba un documento primero.",
                notificationApiKeySaved: "Clave API guardada.",
                notificationApiKeySavedReset: "Nueva clave API guardada. Los contadores de tokens se han reiniciado.",
                notificationApiKeyUnchanged: "Clave API guardada (sin cambios).",
                notificationEnterValidApiKey: "Por favor, ingrese una clave API válida",
                notificationErrorUpload: "Error al procesar el documento: ",
                notificationErrorGeneration: "Error durante la generación: ",
                notificationNoResultsToExport: "No hay resultados para exportar.",
                notificationCopiedToClipboard: "Contenido copiado al portapapeles (jsPDF no disponible).",
                notificationErrorCopy: "Error al copiar.",
                notificationExportedPDF: "Resultados exportados a PDF.",
                notificationNewAnalysisReady: "Listo para un nuevo análisis.",
                notificationSelectAnswer: "Por favor, seleccione una respuesta.",
                notificationEnterQuestion: "Por favor, ingrese una pregunta.",
                notificationEnterAnswer: "Por favor, ingrese su respuesta.",
                notificationQCMFormatError: "Las PEM no se pudieron formatear correctamente.",
                notificationFlashcardsFormatError: "Las tarjetas no se pudieron formatear correctamente.",
                checkConsoleForDetails: "Consulte la consola para más detalles.",
                optionsQCMTitle: "Opciones PEM",
                optionsQCMLabel: "Número de preguntas (5-20)",
                optionsQCMError: "Por favor, ingrese un número de preguntas entre 5 y 20.",
                optionsFlashcardsTitle: "Opciones de Tarjetas",
                optionsFlashcardsLabel: "Número de tarjetas (5-25)",
                optionsFlashcardsError: "Por favor, ingrese un número de tarjetas entre 5 y 25.",
                openQuestionGeneratedTitle: "Pregunta Generada:",
                yourAnswerLabel: "Tu Respuesta:",
                openAnswerPlaceholder: "Escribe tu respuesta aquí...",
                submitOpenAnswerBtnLabel: "Enviar para Corrección",
                aiFeedbackTitle: "Comentarios de la IA:",
                resultsSummaryShort: "Resumen Corto",
                resultsSummaryLong: "Resumen Detallado",
                resultsQCM: "Preguntas de Elección Múltiple",
                resultsFlashcards: "Tarjetas",
                resultsRevisionSheet: "Hoja de Revisión",
                resultsQuestion: "Respuesta a tu Pregunta",
                resultsOpenQuestion: "Pregunta Abierta Generada",
                resultsOpenQuestionFeedback: "Comentarios sobre tu Respuesta",
                optionsDifficultyLabel: "Nivel de dificultad",
                difficultyLevel1: "Descubrimiento",
                difficultyLevel2: "Fácil",
                difficultyLevel3: "Medio",
                difficultyLevel4: "Difícil",
                difficultyLevel5: "Experto",
                checkAnswerBtnLabel: "Verificar respuesta",
            }
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkApiKey();
        this.updateTokenDisplay();
        this.setLanguage(this.currentLanguage); 
        this.setInitialDarkMode();
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

    setupEventListeners() {
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');

        if (uploadArea) uploadArea.addEventListener('click', () => fileInput.click());
        if (fileInput) fileInput.addEventListener('change', (e) => this.handleFileUpload(e.target.files[0]));

        if (uploadArea) {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                uploadArea.addEventListener(eventName, (e) => e.preventDefault(), false);
            });
            uploadArea.addEventListener('dragenter', () => uploadArea.classList.add('dragover'));
            uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
            uploadArea.addEventListener('drop', (e) => {
                uploadArea.classList.remove('dragover');
                this.handleFileUpload(e.dataTransfer.files[0]);
            });
        }

        document.getElementById('apiKeyBtn')?.addEventListener('click', () => this.showModal('apiKeyModal'));
        document.getElementById('saveApiKey')?.addEventListener('click', () => this.saveApiKeyAndResetTokens());
        document.getElementById('darkModeToggle')?.addEventListener('click', () => this.toggleDarkMode());
        document.getElementById('languageSwitcher')?.addEventListener('change', (e) => this.setLanguage(e.target.value));

        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', (e) => this.handleAction(e.currentTarget.dataset.action));
        });

        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => this.hideModal(e.target.closest('.modal').id));
        });

        document.getElementById('submitQuestion')?.addEventListener('click', () => this.submitUserQuestion());
        document.getElementById('confirmOptions')?.addEventListener('click', () => this.confirmOptions());
        document.getElementById('newAnalysisBtn')?.addEventListener('click', () => this.resetApp());
        document.getElementById('exportBtn')?.addEventListener('click', () => this.exportResults());
        document.getElementById('submitOpenAnswerBtn')?.addEventListener('click', () => this.submitOpenAnswer());


        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.hideModal(modal.id);
            });
        });
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