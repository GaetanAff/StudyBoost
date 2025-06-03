const fs = require('fs');
const path = require('path');

const historyFile = path.join(__dirname, '..', 'history.json');

function loadHistory() {
    if (!fs.existsSync(historyFile)) return [];
    try {
        const data = fs.readFileSync(historyFile, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        console.error('Erreur lecture historique:', e);
        return [];
    }
}

function saveHistory(history) {
    try {
        fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
    } catch (e) {
        console.error('Erreur sauvegarde historique:', e);
    }
}

function getHistory() {
    return loadHistory();
}

function addEntry({ type, content, user = 'anonymous' }) {
    const history = loadHistory();
    const entry = {
        id: Date.now(),
        date: new Date().toISOString(),
        type,
        user,
        versions: [{ content, timestamp: new Date().toISOString() }]
    };
    history.push(entry);
    saveHistory(history);
    return entry;
}

function updateEntry(id, newContent) {
    const history = loadHistory();
    const entry = history.find(e => e.id === id);
    if (!entry) return null;
    entry.versions.push({ content: newContent, timestamp: new Date().toISOString() });
    saveHistory(history);
    return entry;
}

module.exports = { getHistory, addEntry, updateEntry };
