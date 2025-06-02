const { GoogleGenerativeAI } = require('@google/generative-ai');

async function generateContent(text, type, options = {}, apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

  let prompt = '';
  
  switch (type) {
    case 'summary_short':
      prompt = `Crée un résumé court et concis (environ 150-200 mots) du texte suivant, en utilisant le format Markdown. Structure le résumé avec des titres (##) et des puces (-) pour une lisibilité optimale.\n\nTexte:\n${text}`;
      break;
      
    case 'summary_long':
      prompt = `Crée un résumé détaillé et bien structuré du texte suivant, en utilisant le format Markdown. Utilise des titres (##), des sous-titres (###), des puces (-) et mets en évidence les termes importants en **gras**. Le résumé doit couvrir les aspects essentiels du texte de manière exhaustive.\n\nTexte:\n${text}`;
      break;
      
    case 'qcm':
      const numQuestions = options.numQuestions || 10;
      prompt = `Génère exactement ${numQuestions} questions à choix multiples (QCM) basées sur le texte suivant.
Chaque QCM doit être un objet JSON avec les clés suivantes :
- "question": (string) La question elle-même.
- "options": (array of 4 strings) Une liste de quatre chaînes de caractères représentant les options. Par exemple : ["Option A", "Option B", "Option C", "Option D"].
- "correct_answer": (string) La lettre de l'option correcte (par exemple, "A", "B", "C", ou "D"). Cette lettre doit correspondre à l'une des options fournies.
- "explanation": (string) Une brève explication justifiant pourquoi la réponse est correcte, en se basant sur le texte.

La sortie doit être UNIQUEMENT une liste JSON valide (un tableau d'objets QCM), sans aucun texte ou formatage Markdown avant ou après la liste JSON. Commence directement par '[' et termine par ']'.

Texte de référence :\n\n${text}`;
      break;
      
    case 'flashcards':
      const numCards = options.numCards || 15;
      prompt = `Crée exactement ${numCards} flashcards (cartes mémoire) basées sur les concepts clés du texte suivant.
Chaque flashcard doit être un objet JSON avec les clés suivantes :
- "front": (string) La question, le terme clé ou le concept à deviner (recto de la carte).
- "back": (string) La réponse, la définition ou l'explication correspondante (verso de la carte).

La sortie doit être UNIQUEMENT une liste JSON valide (un tableau d'objets flashcard), sans aucun texte ou formatage Markdown avant ou après la liste JSON. Commence directement par '[' et termine par ']'.

Texte de référence :\n\n${text}`;
      break;
      
    case 'revision_sheet':
      prompt = `Crée une fiche de révision complète et bien structurée en format Markdown à partir du texte suivant.
La fiche doit inclure :
- Un titre principal pertinent (## Titre).
- Une section "Points Clés" (### Points Clés) avec une liste à puces des idées les plus importantes.
- Une section "Définitions Importantes" (### Définitions Importantes) listant les termes clés et leurs définitions, si applicable.
- Si le texte s'y prête, une section "Concepts et Relations" (### Concepts et Relations) décrivant les relations entre les idées principales (peut être sous forme de puces ou de courts paragraphes).
Utilise la mise en forme Markdown (gras, italique, listes) pour améliorer la lisibilité.

Texte de référence :\n\n${text}`;
      break;
      
    case 'question':
      prompt = `En te basant STRICTEMENT et UNIQUEMENT sur le contenu du texte suivant, réponds à la question posée. Si la réponse ne se trouve pas dans le texte, indique "L'information n'est pas disponible dans le texte fourni." Ne fais aucune supposition ou recherche externe.
Question: ${options.question}

Contenu de référence:\n${text}`;
      break;
    default:
        console.error(`Type de contenu non supporté demandé: ${type}`);
        throw new Error(`Le type de contenu '${type}' n'est pas supporté.`);
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Vérifier si response ou response.text() est nul ou vide
    if (!response || typeof response.text !== 'function') {
        console.error('Réponse invalide de API Gemini:', response);
        throw new Error('Réponse invalide ou non textuelle reçue de l\'API Gemini.');
    }
    
    const generatedText = response.text();
    if (!generatedText && type !== 'qcm' && type !== 'flashcards') { // Le JSON peut être vide si aucune question n'est générée
        console.warn('API Gemini a retourné un texte vide pour le type:', type);
        // Pour QCM/Flashcards, un JSON vide "[]" est techniquement valide si 0 questions sont demandées ou si l'IA ne peut en générer
    }

    const usageMetadata = response.usageMetadata || { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 };

    return {
      text: generatedText,
      usage: {
        promptTokenCount: usageMetadata.promptTokenCount || 0,
        // Gemini peut retourner candidatesTokenCount ou totalTokenCount. Prioriser candidatesTokenCount si présent.
        candidatesTokenCount: usageMetadata.candidatesTokenCount || usageMetadata.totalTokenCount || 0 
      }
    };

  } catch (error) {
    console.error('Erreur lors de l\'appel à API Gemini:', error.message);
    let detailedError = error.message;
    if (error.cause) { // Le SDK JS utilise parfois error.cause pour les détails de l'API
        console.error('Cause de l\'erreur:', error.cause);
        if (error.cause.message) detailedError += ` (Cause: ${error.cause.message})`;
    }
    // Tenter de récupérer des informations plus spécifiques si c'est une erreur structurée de l'API
    if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
        detailedError = error.response.data.error.message;
    }
    throw new Error(`Erreur API Gemini: ${detailedError}`);
  }
}

module.exports = { generateContent };
