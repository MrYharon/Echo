var Echo = window.Echo = window.Echo || {};

Echo.db = (function () {
  const DB_NAME = "echo_db";
  const DB_VERSION = 1;
  let dbPromise = null;

  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function (e) {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("history")) {
          const historyStore = db.createObjectStore("history", {
            keyPath: "id",
            autoIncrement: true
          });
          historyStore.createIndex("timestamp", "timestamp", { unique: false });
        }
        if (!db.objectStoreNames.contains("snippets")) {
          const snippetStore = db.createObjectStore("snippets", {
            keyPath: "id",
            autoIncrement: true
          });
          snippetStore.createIndex("createdAt", "createdAt", { unique: false });
        }
      };
      req.onsuccess = function (e) {
        resolve(e.target.result);
      };
      req.onerror = function (e) {
        reject(e.target.error);
      };
    });
    return dbPromise;
  }

  async function addHistory(entry) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("history", "readwrite");
      const store = tx.objectStore("history");
      const record = {
        originalText: entry.originalText || "",
        correctedText: entry.correctedText || "",
        initialScore: typeof entry.initialScore === "number" ? entry.initialScore : 0,
        finalScore: typeof entry.finalScore === "number" ? entry.finalScore : 100,
        platform: entry.platform || "unknown",
        changesCount: Array.isArray(entry.changes) ? entry.changes.length : 0,
        timestamp: entry.timestamp || Date.now()
      };
      const req = store.add(record);
      req.onsuccess = () => resolve(req.result);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async function getHistory(limit = 50) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("history", "readonly");
      const store = tx.objectStore("history");
      const index = store.index("timestamp");
      const req = index.openCursor(null, "prev");
      const results = [];
      req.onsuccess = function (e) {
        const cursor = e.target.result;
        if (cursor && results.length < limit) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async function deleteHistory(id) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("history", "readwrite");
      const store = tx.objectStore("history");
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async function clearHistory() {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("history", "readwrite");
      const store = tx.objectStore("history");
      const req = store.clear();
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async function addSnippet(snippet) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("snippets", "readwrite");
      const store = tx.objectStore("snippets");
      const record = {
        title: snippet.title || "Untitled Snippet",
        content: snippet.content || "",
        tags: Array.isArray(snippet.tags) ? snippet.tags : [],
        createdAt: snippet.createdAt || Date.now()
      };
      const req = store.add(record);
      req.onsuccess = () => resolve(req.result);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async function getSnippets() {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("snippets", "readonly");
      const store = tx.objectStore("snippets");
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async function deleteSnippet(id) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("snippets", "readwrite");
      const store = tx.objectStore("snippets");
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  return {
    open,
    addHistory,
    getHistory,
    deleteHistory,
    clearHistory,
    addSnippet,
    getSnippets,
    deleteSnippet
  };
})();
