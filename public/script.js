class StudyBoostApp {
    constructor() {
        this.currentDocument = null;
        this.apiKey = localStorage.getItem('gemini_api_key') || '';
        this.currentAction = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkApiKey();
    }

    setupEventListeners() {
        // Upload functionality
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');

        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileUpload(e.target.files[0]));

        // Drag and drop
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

        // API Key modal
        document.getElementById('apiKeyBtn').addEventListener('click', () => {
            this.showModal('apiKeyModal');
        });

        document.getElementById('saveApiKey').addEventListener('click', () => {
            this.saveApiKey();
        });

        // Action cards
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleAction(action);
            });
        });

        // Modal controls
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.hideModal(e.target.closest('.modal').id);
            });
        });

        // Question modal
        document.getElementById('submitQuestion').addEventListener('click', () => {
            this.submitQuestion();
        });

        // Options modal
        document.getElementById('confirmOptions').addEventListener('click', () => {
            this.confirmOptions();
        });

        // New analysis
        document.getElementById('newAnalysisBtn').addEventListener('click', () => {
            this.resetApp();
        });

        // Export functionality
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportResults();
        });

        // Close modals on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });
    }

    checkApiKey() {
        const apiKeyInput = document.getElementById('apiKeyInput');
        if (this.apiKey) {
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
                this.hideLoading();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Erreur upload:', error);
            this.showNotification('Erreur lors du traitement du document', 'error');
            this.hideLoading();
        }
    }

    showDocumentProcessed(filename, text) {
        const wordCount = text.split(/\s+/).length;
        const pageCount = Math.ceil(wordCount / 250); // Estimation

        document.getElementById('documentTitle').textContent = filename;
        document.getElementById('wordCount').textContent = `${wordCount} mots`;
        document.getElementById('pageCount').textContent = `~${pageCount} pages`;

        document.getElementById('uploadSection').style.display = 'none';
        document.getElementById('contentSection').style.display = 'block';
    }

    async handleAction(action) {
        if (!this.currentDocument) return;

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

        let optionsHtml = '';

        if (action === 'qcm') {
            title.textContent = 'Options QCM';
            optionsHtml = `
                <div class="form-group">
                    <label>Nombre de questions</label>
                    <select id="numQuestions">
                        <option value="5">5 questions</option>
                        <option value="10" selected>10 questions</option>
                        <option value="15">15 questions</option>
                        <option value="20">20 questions</option>
                    </select>
                </div>
            `;
        } else if (action === 'flashcards') {
            title.textContent = 'Options Flashcards';
            optionsHtml = `
                <div class="form-group">
                    <label>Nombre de flashcards</label>
                    <select id="numCards">
                        <option value="10">10 flashcards</option>
                        <option value="15" selected>15 flashcards</option>
                        <option value="20">20 flashcards</option>
                        <option value="25">25 flashcards</option>
                    </select>
                </div>
            `;
        }

        body.innerHTML = optionsHtml;
        this.showModal('optionsModal');
    }

    async confirmOptions() {
        const options = {};

        if (this.currentAction === 'qcm') {
            options.numQuestions = parseInt(document.getElementById('numQuestions').value);
        } else if (this.currentAction === 'flashcards') {
            options.numCards = parseInt(document.getElementById('numCards').value);
        }

        this.hideModal('optionsModal');
        await this.generateContent(this.currentAction, options);
    }

    async submitQuestion() {
        const question = document.getElementById('questionInput').value.trim();
        if (!question) return;

        const options = { question };
        this.hideModal('questionModal');
        
        await this.generateContent('question', options);
        
        document.getElementById('questionInput').value = '';
    }

    async generateContent(type, options = {}) {
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

            if (result.success) {
                this.showResults(type, result.content);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Erreur génération:', error);
            this.showNotification('Erreur lors de la génération de contenu', 'error');
        } finally {
            this.hideLoading();
        }
    }

    showResults(type, content) {
        const resultsSection = document.getElementById('resultsSection');
        const resultsTitle = document.getElementById('resultsTitle');
        const resultsContent = document.getElementById('resultsContent');

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

        switch (type) {
            case 'summary_short':
            case 'summary_long':
            case 'revision_sheet':
            case 'question':
                html = `<div class="markdown-content">${marked.parse(content)}</div>`;
                break;

            case 'qcm':
                html = this.formatQCM(content);
                break;

            case 'flashcards':
                html = this.formatFlashcards(content);
                break;
        }

        resultsContent.innerHTML = html;
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });

        // Setup flashcard interactions
        if (type === 'flashcards') {
            this.setupFlashcards();
        }
    }

    formatQCM(content) {
        try {
            const qcmData = JSON.parse(content);
            let html = '<div class="qcm-container">';

            qcmData.forEach((q, index) => {
                html += `
                    <div class="qcm-question">
                        <h4>Question ${index + 1}: ${q.question}</h4>
                        <div class="qcm-options">
                `;

                q.options.forEach((option, optIndex) => {
                    const letter = String.fromCharCode(65 + optIndex);
                    const isCorrect = q.correct_answer === letter;
                    html += `
                        <div class="qcm-option ${isCorrect ? 'correct' : ''}">
                            <strong>${letter}.</strong> ${option}
                        </div>
                    `;
                });

                html += `
                        </div>
                        <div class="qcm-explanation">
                            <strong>Explication:</strong> ${q.explanation}
                        </div>
                    </div>
                `;
            });

            html += '</div>';
            return html;
        } catch (error) {
            return `<div class="markdown-content">${marked.parse(content)}</div>`;
        }
    }

    formatFlashcards(content) {
        try {
            const flashcardsData = JSON.parse(content);
            let html = '<div class="flashcards-container">';

            flashcardsData.forEach((card, index) => {
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
        } catch (error) {
            return `<div class="markdown-content">${marked.parse(content)}</div>`;
        }
    }

    setupFlashcards() {
        document.querySelectorAll('.flashcard').forEach(card => {
            card.addEventListener('click', () => {
                card.classList.toggle('flipped');
            });
        });
    }

    saveApiKey() {
        const apiKey = document.getElementById('apiKeyInput').value.trim();
        if (!apiKey) {
            this.showNotification('Veuillez entrer une clé API valide', 'error');
            return;
        }

        this.apiKey = apiKey;
        localStorage.setItem('gemini_api_key', apiKey);
        this.hideModal('apiKeyModal');
        this.showNotification('Clé API sauvegardée avec succès', 'success');
    }

    exportResults() {
        const resultsContent = document.getElementById('resultsContent');
        const title = document.getElementById('resultsTitle').textContent;
        
        // Create PDF export
        if (window.jsPDF) {
            const { jsPDF } = window.jsPDF;
            const doc = new jsPDF();
            
            doc.setFontSize(16);
            doc.text(title, 20, 20);
            
            const content = resultsContent.innerText;
            const lines = doc.splitTextToSize(content, 170);
            doc.text(lines, 20, 40);
            
            doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
        } else {
            // Fallback: copy to clipboard
            const textContent = resultsContent.innerText;
            navigator.clipboard.writeText(textContent).then(() => {
                this.showNotification('Contenu copié dans le presse-papiers', 'success');
            });
        }
    }

    resetApp() {
        this.currentDocument = null;
        this.currentAction = null;
        
        document.getElementById('uploadSection').style.display = 'block';
        document.getElementById('contentSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'none';
        
        document.getElementById('fileInput').value = '';
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('show');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }

    showLoading(message) {
        document.getElementById('loadingText').textContent = message;
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;
        
        // Add styles for notifications
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
            animation: slideIn 0.3s ease-out;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StudyBoostApp();
});

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notification button {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        opacity: 0.8;
        padding: 0;
        margin: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .notification button:hover {
        opacity: 1;
    }
`;
document.head.appendChild(style);