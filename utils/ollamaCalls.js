const fetch = require('node-fetch');

async function generateContentWithOllama(prompt, type = 'default') {
	try {
		// the model is mistral here
		const response = await fetch('http://localhost:11434/api/generate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				model: 'mistral',
				prompt,
				stream: false
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`HTTP ${response.status}: ${errorText}`);
		}

		const result = await response.json();
		if (!result || typeof result.response !== 'string') {
			throw new Error('Invalid or non-textual response from Ollama.');
		}

		return {
			text: result.response,
			usage: {
				promptTokenCount: 0,
				candidatesTokenCount: 0
			}
		};
	} catch (error) {
		console.error('Erreur Ollama:', error.message);
		throw error;
	}
}

module.exports = {
	ollamaCalls: {
		generateContentWithOllama
	}
};
