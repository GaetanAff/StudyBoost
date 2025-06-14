const { GoogleGenerativeAI } = require('@google/generative-ai');
const { ollamaCalls } = require('./ollamaCalls');

// Helper function to get language-specific instructions
function getLanguageInstructions(lang) {
	switch (lang) {
		case 'en':
			return {
				qcmFormatInstruction: "The output must be ONLY a valid JSON list (an array of MCQ objects), without any text or Markdown formatting before or after the JSON list. Start directly with '[' and end with ']'. Each object must contain 'question', 'options' (array of 4 strings), 'correct_answer' (A, B, C, or D), and 'explanation'.",
				flashcardFormatInstruction: "The output must be ONLY a valid JSON list (an array of flashcard objects), without any text or Markdown formatting before or after the JSON list. Start directly with '[' and end with ']'. Each object must contain 'front' and 'back'.",
				shortSummaryPrompt: "Create a short and concise summary (around 150-200 words) of the following text, using Markdown format. Structure the summary with headings (##) and bullet points (-) for optimal readability.",
				longSummaryPrompt: "Create a detailed and well-structured summary of the following text, using Markdown format. Use headings (##), subheadings (###), bullet points (-), and highlight important terms in **bold**. The summary should cover the essential aspects of the text exhaustively.",
				revisionSheetPromptStart: "Create a complete and well-structured revision sheet in Markdown format from the following text.\nThe sheet should include:\n- A relevant main title (## Title).\n- A 'Key Points' section (### Key Points) with a bulleted list of the most important ideas.\n- An 'Important Definitions' section (### Important Definitions) listing key terms and their definitions, if applicable.\n- If the text lends itself to it, a 'Concepts and Relations' section (### Concepts and Relations) describing the relationships between main ideas (can be bullet points or short paragraphs).\nUse Markdown formatting (bold, italics, lists) to improve readability.",
				userQuestionPromptStart: "Based STRICTLY and ONLY on the content of the following text, answer the posed question. If the answer is not found in the text, indicate 'The information is not available in the provided text.' Do not make any assumptions or external searches.",
				openQuestionGeneratePrompt: "Based on the following document, generate one open-ended question that requires a written answer. The question should encourage critical thinking or recall of information from the document. Return ONLY the question as a plain string, without any JSON or Markdown formatting.",
				openQuestionCorrectPromptStart: "Given the following document, the question: '{originalQuestion}', and the user's answer: '{userAnswer}', please evaluate the user's answer. Provide constructive correction and feedback in Markdown. If the answer is correct, acknowledge it. If it's partially correct or incorrect, explain why and provide the correct information based *only* on the document.",
				difficultyLevels: {
					level1: "Very simple questions, mainly for checking reading and superficial understanding of the document (discovery level).",
					level2: "Easy questions, focusing on facts clearly stated in the document.",
					level3: "Medium difficulty questions, which may require connecting some simple information from the document.",
					level4: "Difficult questions, requiring a deeper understanding, interpretation, or synthesis of information from different parts of the document.",
					level5: "Very complex and 'ultra complicated' questions, requiring critical analysis, comparison with implicit concepts, or application of the document's information to hypothetical scenarios."
				}
			};
		case 'de':
			return {
				qcmFormatInstruction: "Die Ausgabe muss NUR eine gültige JSON-Liste sein (ein Array von MCQ-Objekten), ohne Text oder Markdown-Formatierung vor oder nach der JSON-Liste. Beginnen Sie direkt mit '[' und enden Sie mit ']'. Jedes Objekt muss 'question', 'options' (Array mit 4 Strings), 'correct_answer' (A, B, C oder D) und 'explanation' enthalten.",
				flashcardFormatInstruction: "Die Ausgabe muss NUR eine gültige JSON-Liste sein (ein Array von Lernkartenobjekten), ohne Text oder Markdown-Formatierung vor oder nach der JSON-Liste. Beginnen Sie direkt mit '[' und enden Sie mit ']'. Jedes Objekt muss 'front' und 'back' enthalten.",
				shortSummaryPrompt: "Erstellen Sie eine kurze und prägnante Zusammenfassung (ca. 150-200 Wörter) des folgenden Textes im Markdown-Format. Strukturieren Sie die Zusammenfassung mit Überschriften (##) und Aufzählungspunkten (-) für optimale Lesbarkeit.",
				longSummaryPrompt: "Erstellen Sie eine detaillierte und gut strukturierte Zusammenfassung des folgenden Textes im Markdown-Format. Verwenden Sie Überschriften (##), Unterüberschriften (###), Aufzählungspunkte (-) und heben Sie wichtige Begriffe **fett** hervor. Die Zusammenfassung sollte die wesentlichen Aspekte des Textes umfassend abdecken.",
				revisionSheetPromptStart: "Erstellen Sie aus dem folgenden Text ein vollständiges und gut strukturiertes Revisionsblatt im Markdown-Format.\nDas Blatt sollte Folgendes enthalten:\n- Einen relevanten Haupttitel (## Titel).\n- Einen Abschnitt 'Kernpunkte' (### Kernpunkte) mit einer Aufzählung der wichtigsten Ideen.\n- Einen Abschnitt 'Wichtige Definitionen' (### Wichtige Definitionen), der gegebenenfalls Schlüsselbegriffe und deren Definitionen auflistet.\n- Wenn der Text dies zulässt, einen Abschnitt 'Konzepte und Beziehungen' (### Konzepte und Beziehungen), der die Beziehungen zwischen den Hauptideen beschreibt (kann in Form von Aufzählungspunkten oder kurzen Absätzen erfolgen).\nVerwenden Sie Markdown-Formatierung (fett, kursiv, Listen), um die Lesbarkeit zu verbessern.",
				userQuestionPromptStart: "Beantworten Sie die gestellte Frage AUSSCHLIESSLICH und NUR auf der Grundlage des Inhalts des folgenden Textes. Wenn die Antwort nicht im Text enthalten ist, geben Sie an: 'Die Information ist im bereitgestellten Text nicht verfügbar.' Machen Sie keine Annahmen oder externen Recherchen.",
				openQuestionGeneratePrompt: "Generieren Sie auf Basis des folgenden Dokuments eine offene Frage, die eine schriftliche Antwort erfordert. Die Frage sollte kritisches Denken oder das Abrufen von Informationen aus dem Dokument fördern. Geben Sie NUR die Frage als einfachen String zurück, ohne JSON- oder Markdown-Formatierung.",
				openQuestionCorrectPromptStart: "Bewerten Sie angesichts des folgenden Dokuments, der Frage: '{originalQuestion}' und der Antwort des Benutzers: '{userAnswer}' die Antwort des Benutzers. Geben Sie konstruktive Korrekturen und Feedback in Markdown. Wenn die Antwort richtig ist, bestätigen Sie dies. Wenn sie teilweise richtig oder falsch ist, erklären Sie warum und geben Sie die korrekten Informationen NUR auf der Grundlage des Dokuments an.",
				difficultyLevels: {
					level1: "Sehr einfache Fragen, hauptsächlich zur Überprüfung des Lesens und des oberflächlichen Verständnisses des Dokuments (Entdeckungsniveau).",
					level2: "Einfache Fragen, die sich auf klar im Dokument dargelegte Fakten konzentrieren.",
					level3: "Fragen mittlerer Schwierigkeit, die möglicherweise das Verknüpfen einiger einfacher Informationen aus dem Dokument erfordern.",
					level4: "Schwierige Fragen, die ein tieferes Verständnis, Interpretation oder Synthese von Informationen aus verschiedenen Teilen des Dokuments erfordern.",
					level5: "Sehr komplexe und 'ultra komplizierte' Fragen, die kritische Analyse, Vergleich mit impliziten Konzepten oder Anwendung der Informationen des Dokuments auf hypothetische Szenarien erfordern."
				}
			};
		case 'es':
			return {
				qcmFormatInstruction: "La salida debe ser ÚNICAMENTE una lista JSON válida (un array de objetos MCQ), sin ningún texto o formato Markdown antes o después de la lista JSON. Comience directamente con '[' y termine con ']'. Cada objeto debe contener 'question', 'options' (array de 4 cadenas), 'correct_answer' (A, B, C, o D), y 'explanation'.",
				flashcardFormatInstruction: "La salida debe ser ÚNICAMENTE una lista JSON válida (un array de objetos de tarjeta de memoria), sin ningún texto o formato Markdown antes o después de la lista JSON. Comience directamente con '[' y termine con ']'. Cada objeto debe contener 'front' y 'back'.",
				shortSummaryPrompt: "Cree un resumen breve y conciso (alrededor de 150-200 palabras) del siguiente texto, utilizando el formato Markdown. Estructure el resumen con encabezados (##) y viñetas (-) para una legibilidad óptima.",
				longSummaryPrompt: "Cree un resumen detallado y bien estructurado del siguiente texto, utilizando el formato Markdown. Utilice encabezados (##), subencabezados (###), viñetas (-) y resalte los términos importantes en **negrita**. El resumen debe cubrir los aspectos esenciales del texto de manera exhaustiva.",
				revisionSheetPromptStart: "Cree una hoja de revisión completa y bien estructurada en formato Markdown a partir del siguiente texto.\nLa hoja debe incluir:\n- Un título principal pertinente (## Título).\n- Una sección 'Puntos Clave' (### Puntos Clave) con una lista de viñetas de las ideas más importantes.\n- Una sección 'Definiciones Importantes' (### Definiciones Importantes) que liste los términos clave y sus definiciones, si aplica.\n- Si el texto se presta a ello, una sección 'Conceptos y Relaciones' (### Conceptos y Relaciones) que describa las relaciones entre las ideas principales (puede ser en forma de viñetas o párrafos cortos).\nUtilice formato Markdown (negrita, cursiva, listas) para mejorar la legibilidad.",
				userQuestionPromptStart: "Basándose ESTRICTA y ÚNICAMENTE en el contenido del siguiente texto, responda a la pregunta planteada. Si la respuesta no se encuentra en el texto, indique 'La información no está disponible en el texto proporcionado.' No haga suposiciones ni búsquedas externas.",
				openQuestionGeneratePrompt: "Basándose en el siguiente documento, genere una pregunta abierta que requiera una respuesta escrita. La pregunta debe fomentar el pensamiento crítico o la recuperación de información del documento. Devuelva ÚNICAMENTE la pregunta como una cadena de texto simple, sin ningún formato JSON o Markdown.",
				openQuestionCorrectPromptStart: "Dado el siguiente documento, la pregunta: '{originalQuestion}', y la respuesta del usuario: '{userAnswer}', evalúe la respuesta del usuario. Proporcione correcciones constructivas y comentarios en Markdown. Si la respuesta es correcta, reconózcalo. Si es parcialmente correcta o incorrecta, explique por qué y proporcione la información correcta basándose *únicamente* en el documento.",
				difficultyLevels: {
					level1: "Preguntas muy simples, principalmente para verificar la lectura y la comprensión superficial del documento (nivel descubrimiento).",
					level2: "Preguntas fáciles, centradas en hechos claramente enunciados en el documento.",
					level3: "Preguntas de dificultad media, que pueden requerir conectar alguna información simple del documento.",
					level4: "Preguntas difíciles, que requieren una comprensión más profunda, interpretación o síntesis de información de diferentes partes del documento.",
					level5: "Preguntas muy complejas y 'ultra complicadas', que exigen un análisis crítico, la comparación con conceptos implícitos o la aplicación de la información del documento a escenarios hipotéticos."
				}
			};
			// French (default)
		default:
			return {
				qcmFormatInstruction: "La sortie doit être UNIQUEMENT une liste JSON valide (un tableau d'objets QCM), sans aucun texte ou formatage Markdown avant ou après la liste JSON. Commence directement par '[' et termine par ']'. Chaque objet doit contenir 'question', 'options' (tableau de 4 chaînes), 'correct_answer' (A, B, C, ou D), et 'explanation'.",
				flashcardFormatInstruction: "La sortie doit être UNIQUEMENT une liste JSON valide (un tableau d'objets flashcard), sans aucun texte ou formatage Markdown avant ou après la liste JSON. Commence directement par '[' et termine par ']'. Chaque objet doit contenir 'front' et 'back'.",
				shortSummaryPrompt: "Crée un résumé court et concis (environ 150-200 mots) du texte suivant, en utilisant le format Markdown. Structure le résumé avec des titres (##) et des puces (-) pour une lisibilité optimale.",
				longSummaryPrompt: "Crée un résumé détaillé et bien structuré du texte suivant, en utilisant le format Markdown. Utilise des titres (##), des sous-titres (###), des puces (-) et mets en évidence les termes importants en **gras**. Le résumé doit couvrir les aspects essentiels du texte de manière exhaustive.",
				revisionSheetPromptStart: "Crée une fiche de révision complète et bien structurée en format Markdown à partir du texte suivant.\nLa fiche doit inclure :\n- Un titre principal pertinent (## Titre).\n- Une section \"Points Clés\" (### Points Clés) avec une liste à puces des idées les plus importantes.\n- Une section \"Définitions Importantes\" (### Définitions Importantes) listant les termes clés et leurs définitions, si applicable.\n- Si le texte s'y prête, une section \"Concepts et Relations\" (### Concepts et Relations) décrivant les relations entre les idées principales (peut être sous forme de puces ou de courts paragraphes).\nUtilise la mise en forme Markdown (gras, italique, listes) pour améliorer la lisibilité.",
				userQuestionPromptStart: "En te basant STRICTEMENT et UNIQUEMENT sur le contenu du texte suivant, réponds à la question posée. Si la réponse ne se trouve pas dans le texte, indique \"L'information n'est pas disponible dans le texte fourni.\" Ne fais aucune supposition ou recherche externe.",
				openQuestionGeneratePrompt: "En te basant sur le document suivant, génère une question ouverte qui nécessite une réponse rédigée. La question doit encourager la réflexion critique ou le rappel d'informations du document. Retourne UNIQUEMENT la question sous forme de chaîne de caractères simple, sans formatage JSON ou Markdown.",
				openQuestionCorrectPromptStart: "Étant donné le document suivant, la question : '{originalQuestion}', et la réponse de l'utilisateur : '{userAnswer}', veuillez évaluer la réponse de l'utilisateur. Fournissez une correction constructive et des commentaires en Markdown. Si la réponse est correcte, reconnaissez-le. Si elle est partiellement correcte ou incorrecte, expliquez pourquoi et fournissez les informations correctes en vous basant *uniquement* sur le document.",
				difficultyLevels: {
					level1: "Questions très simples, principalement pour vérifier la lecture et la compréhension superficielle du document (niveau découverte).",
					level2: "Questions faciles, portant sur des faits clairement énoncés dans le document.",
					level3: "Questions de difficulté moyenne, pouvant nécessiter de relier quelques informations simples du document.",
					level4: "Questions difficiles, demandant une compréhension plus approfondie, l'interprétation ou la synthèse d'informations de différentes parties du document.",
					level5: "Questions très complexes et \"ultra compliquées\", exigeant une analyse critique, la comparaison avec des concepts implicites, ou l'application des informations du document à des scénarios hypothétiques."
				}
			};
	}
}



// uses gemini AI (original code, untouched)



async function generateContent(text, type, options = {}, apiKey, language = 'fr') {
	const genAI = new GoogleGenerativeAI(apiKey);
	const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Updated model

	let prompt = '';
	const langInstructions = getLanguageInstructions(language);

	let difficultyPromptPart = '';
	if (options.difficultyLevel && (type === 'qcm' || type === 'open_question_generate')) {
		const levels = langInstructions.difficultyLevels;
		let difficultyDescription = '';
		switch (parseInt(options.difficultyLevel)) {
			case 1: difficultyDescription = levels.level1; break;
			case 2: difficultyDescription = levels.level2; break;
			case 3: difficultyDescription = levels.level3; break;
			case 4: difficultyDescription = levels.level4; break;
			case 5: difficultyDescription = levels.level5; break;
			default: difficultyDescription = levels.level3; // Default to medium
		}
		difficultyPromptPart = `\nLe niveau de difficulté demandé pour les questions est : ${difficultyDescription}`;
	}

	switch (type) {
		case 'summary_short':
			prompt = `${langInstructions.shortSummaryPrompt}\n\nTexte:\n${text}`;
			break;

		case 'summary_long':
			prompt = `${langInstructions.longSummaryPrompt}\n\nTexte:\n${text}`;
			break;

		case 'qcm':
			const numQuestions = options.numQuestions || 10;
			prompt = `Génère exactement ${numQuestions} questions à choix multiples (QCM) basées sur le texte suivant.${difficultyPromptPart}
Chaque QCM doit être un objet JSON avec les clés suivantes :
- "question": (string) La question elle-même.
- "options": (array of 4 strings) Une liste de quatre chaînes de caractères représentant les options.
- "correct_answer": (string) La lettre de l'option correcte (A, B, C, ou D).
- "explanation": (string) Une brève explication.

				${langInstructions.qcmFormatInstruction}

Texte de référence :\n\n${text}`;
			break;

		case 'flashcards':
			const numCards = options.numCards || 15;
			prompt = `Crée exactement ${numCards} flashcards basées sur les concepts clés du texte suivant.
Chaque flashcard doit être un objet JSON avec les clés suivantes :
- "front": (string) La question ou le terme clé.
- "back": (string) La réponse ou la définition.

				${langInstructions.flashcardFormatInstruction}

Texte de référence :\n\n${text}`;
			break;

		case 'revision_sheet':
			prompt = `${langInstructions.revisionSheetPromptStart}\n\nTexte de référence :\n\n${text}`;
			break;

		case 'question':
			prompt = `${langInstructions.userQuestionPromptStart}\nQuestion: ${options.question}\n\nContenu de référence:\n${text}`;
			break;

		case 'open_question_generate':
			prompt = `${langInstructions.openQuestionGeneratePrompt}${difficultyPromptPart}\n\nDocument:\n${text}`;
			break;

		case 'open_question_correct':
			if (!options.originalQuestion || !options.userAnswer) {
				throw new Error("Original question and user answer are required for correction.");
			}
			prompt = langInstructions.openQuestionCorrectPromptStart
				.replace('{originalQuestion}', options.originalQuestion)
				.replace('{userAnswer}', options.userAnswer);
			prompt += `\n\nDocument de référence:\n${text}`;
			break;

		default:
			console.error(`Type de contenu non supporté demandé: ${type}`);
			throw new Error(`Le type de contenu '${type}' n'est pas supporté.`);
	}

	try {
		const result = await model.generateContent(prompt);
		const response = await result.response;


		if (!response || typeof response.text !== 'function') {
			console.error('Réponse invalide de API Gemini:', response);
			throw new Error('Réponse invalide ou non textuelle reçue de l\'API Gemini.');
		}

		const generatedText = response.text();
		console.log("réponse de gemini DEBUG : \n",generatedText);
		if (!generatedText && type !== 'qcm' && type !== 'flashcards' && type !== 'open_question_generate') { 
			console.warn('API Gemini a retourné un texte vide pour le type:', type, "Prompt utilisé:", prompt);
		}

		const usageMetadata = response.usageMetadata || { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 };

		return {
			text: generatedText,
			usage: {
				promptTokenCount: usageMetadata.promptTokenCount || 0,
				candidatesTokenCount: usageMetadata.candidatesTokenCount || usageMetadata.totalTokenCount || 0 
			}
		};

	} catch (error) {
		console.error('Erreur lors de l\'appel à API Gemini:', error.message, "\nPrompt utilisé:", prompt, "\nStack:", error.stack); 
		let detailedError = error.message;
		if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
			detailedError = error.response.data.error.message;
		} else if (error.cause) { 
			detailedError += ` (Cause: ${JSON.stringify(error.cause)})`;
		}
		throw new Error(`Erreur API Gemini: ${detailedError}`);
	}
}



async function testApiKey(apiKey) {
	if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
		// Ce cas devrait être principalement géré par le frontend ou la route du serveur,
		// mais une double vérification ici est une bonne pratique.
		return { success: false, error: 'La clé API ne peut pas être vide.' };
	}
	try {
		const genAI = new GoogleGenerativeAI(apiKey);
		// Utilisation du même modèle que pour les autres opérations pour assurer la cohérence des tests
		const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

		// L'opération countTokens est légère et permet de vérifier si la clé est authentifiée
		// et si le modèle est accessible, sans consommer beaucoup de quota.
		await model.countTokens("test"); // Un texte court et simple suffit

		// Si countTokens ne lève pas d'erreur, la clé est considérée comme fonctionnelle.
		return { success: true };

	} catch (error) {
		// Loggue l'erreur côté serveur pour le débogage
		console.error('Erreur détaillée lors du test de la clé API Gemini (aiService):', error.toString());

		let userFriendlyError = 'Une erreur s\'est produite lors du test de la clé API.';
		// Essayer de donner des messages plus spécifiques basés sur l'erreur de l'SDK
		if (error.message && error.message.includes('API key not valid')) {
			userFriendlyError = 'La clé API fournie n\'est pas valide. Veuillez la vérifier.';
		} else if (error.message && error.message.includes('Permission denied')) {
			userFriendlyError = 'Permission refusée. Vérifiez que votre clé API dispose des autorisations nécessaires.';
		} else if (error.message && error.message.includes('quota')) {
			userFriendlyError = 'Le quota pour cette clé API a été dépassé ou des problèmes de facturation existent.';
		} else if (error.message) {
			// Si l'erreur est d'un autre type mais contient un message, l'utiliser.
			userFriendlyError = error.message;
		}

		return { success: false, error: userFriendlyError };
	}
}



// uses ollama (experimental)




async function ollamaGenerateContent(text, type, options = {}, language = 'fr') {
	// const genAI = new GoogleGenerativeAI(apiKey);
	const model = ollamaCalls
	
	// defines prompt
	
	let prompt = '';
	const langInstructions = getLanguageInstructions(language);

	let difficultyPromptPart = '';
	if (options.difficultyLevel && (type === 'qcm' || type === 'open_question_generate')) {
		const levels = langInstructions.difficultyLevels;
		let difficultyDescription = '';
		switch (parseInt(options.difficultyLevel)) {
			case 1: difficultyDescription = levels.level1; break;
			case 2: difficultyDescription = levels.level2; break;
			case 3: difficultyDescription = levels.level3; break;
			case 4: difficultyDescription = levels.level4; break;
			case 5: difficultyDescription = levels.level5; break;
			default: difficultyDescription = levels.level3; // Default to medium
		}
		difficultyPromptPart = `\nLe niveau de difficulté demandé pour les questions est : ${difficultyDescription}`;
	}

	switch (type) {
		case 'summary_short':
			prompt = `${langInstructions.shortSummaryPrompt}\n\nTexte:\n${text}`;
			break;

		case 'summary_long':
			prompt = `${langInstructions.longSummaryPrompt}\n\nTexte:\n${text}`;
			break;

		case 'qcm':
			const numQuestions = options.numQuestions || 10;
			prompt = `Génère exactement ${numQuestions} questions à choix multiples (QCM) basées sur le texte suivant.${difficultyPromptPart}
Chaque QCM doit être un objet JSON avec les clés suivantes :
- "question": (string) La question elle-même.
- "options": (array of 4 strings) Une liste de quatre chaînes de caractères représentant les options.
- "correct_answer": (string) La lettre de l'option correcte (A, B, C, ou D).
- "explanation": (string) Une brève explication.

				${langInstructions.qcmFormatInstruction}

Texte de référence :\n\n${text}`;
			break;

		case 'flashcards':
			const numCards = options.numCards || 15;
			prompt = `Crée exactement ${numCards} flashcards basées sur les concepts clés du texte suivant.
Chaque flashcard doit être un objet JSON avec les clés suivantes :
- "front": (string) La question ou le terme clé.
- "back": (string) La réponse ou la définition.

				${langInstructions.flashcardFormatInstruction}

Texte de référence :\n\n${text}`;
			break;

		case 'revision_sheet':
			prompt = `${langInstructions.revisionSheetPromptStart}\n\nTexte de référence :\n\n${text}`;
			break;

		case 'question':
			prompt = `${langInstructions.userQuestionPromptStart}\nQuestion: ${options.question}\n\nContenu de référence:\n${text}`;
			break;

		case 'open_question_generate':
			prompt = `${langInstructions.openQuestionGeneratePrompt}${difficultyPromptPart}\n\nDocument:\n${text}`;
			break;

		case 'open_question_correct':
			if (!options.originalQuestion || !options.userAnswer) {
				throw new Error("Original question and user answer are required for correction.");
			}
			prompt = langInstructions.openQuestionCorrectPromptStart
				.replace('{originalQuestion}', options.originalQuestion)
				.replace('{userAnswer}', options.userAnswer);
			prompt += `\n\nDocument de référence:\n${text}`;
			break;

		default:
			console.error(`Type de contenu non supporté demandé: ${type}`);
			throw new Error(`Le type de contenu '${type}' n'est pas supporté.`);
	}


	// prompt defined, start to interact with the AI


	try {
		const result = await model.generateContentWithOllama(prompt);

		const generatedText = result.text;
		console.log("réponse de ollama DEBUG : \n", generatedText);
		if (!generatedText && type !== 'qcm' && type !== 'flashcards' && type !== 'open_question_generate') { 
			console.warn('Ollama a retourné un texte vide pour le type:', type, "Prompt utilisé:", prompt);
		}

		return {
			text: generatedText,
			usage: {
				promptTokenCount: 0,
				candidatesTokenCount: 0 
			}
		};

	} catch (error) {
		console.error('Erreur lors de l\'appel Ollama :', error.message, "\nPrompt utilisé:", prompt, "\nStack:", error.stack); 
		let detailedError = error.message;
		if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
			detailedError = error.response.data.error.message;
		} else if (error.cause) { 
			detailedError += ` (Cause: ${JSON.stringify(error.cause)})`;
		}
		throw new Error(`Erreur Ollama: ${detailedError}`);
	}
}





module.exports = { generateContent, ollamaGenerateContent, testApiKey }; // Ajout de testApiKey aux exports
