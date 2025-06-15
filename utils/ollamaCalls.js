const fetch = require('node-fetch');

async function generateContentWithOllama(prompt, model = 'mistral', onToken) {
        try {
                const response = await fetch('http://localhost:11434/api/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                                model,
                                prompt,
                                stream: Boolean(onToken)
                        })
                });

                if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`HTTP ${response.status}: ${errorText}`);
                }

                if (onToken) {
                        const decoder = new TextDecoder();
                        let buffer = '';
                        let text = '';
                        for await (const chunk of response.body) {
                                buffer += decoder.decode(chunk, { stream: true });
                                let lines = buffer.split('\n');
                                buffer = lines.pop();
                                for (const line of lines) {
                                        if (!line.trim()) continue;
                                        const data = JSON.parse(line);
                                        if (data.done) continue;
                                        text += data.response;
                                        onToken(data.response);
                                }
                        }
                        return { text, usage: { promptTokenCount: 0, candidatesTokenCount: 0 } };
                } else {
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
                }
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
