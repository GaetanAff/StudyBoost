const { GoogleGenerativeAI } = require('@google/generative-ai');

async function generateContent(text, type, options = {}, apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

  let prompt = '';
  
  switch (type) {
    case 'summary_short':
      prompt = `Crée un résumé court et concis du texte suivant en format Markdown. Maximum 200 mots. Utilise des puces et des titres pour structurer:\n\n${text}`;
      break;
      
    case 'summary_long':
      prompt = `Crée un résumé détaillé et structuré du texte suivant en format Markdown. Utilise des titres, sous-titres, puces et mise en forme appropriée:\n\n${text}`;
      break;
      
    case 'qcm':
      const numQuestions = options.numQuestions || 10;
      prompt = `Génère ${numQuestions} questions à choix multiples basées sur ce texte. Format JSON avec: question, options (A,B,C,D), correct_answer, explanation:\n\n${text}`;
      break;
      
    case 'flashcards':
      const numCards = options.numCards || 15;
      prompt = `Crée ${numCards} flashcards basées sur ce texte. Format JSON avec: front (question/concept), back (réponse/définition):\n\n${text}`;
      break;
      
    case 'revision_sheet':
      prompt = `Crée une fiche de révision complète en format Markdown avec: titre, points clés, définitions importantes, schémas conceptuels basés sur:\n\n${text}`;
      break;
      
    case 'question':
      prompt = `Réponds à cette question basée uniquement sur le contenu suivant. Question: ${options.question}\n\nContenu:\n${text}`;
      break;
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Erreur API Gemini:', error);
    throw new Error('Erreur lors de la génération de contenu');
  }
}

module.exports = { generateContent };
