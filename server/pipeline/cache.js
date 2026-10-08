const crypto = require("crypto");

class PromptCache {
  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  hash(text, mode) {
    return crypto
      .createHash("sha256")
      .update(`${mode}:${text.trim().toLowerCase()}`)
      .digest("hex");
  }

  get(text, mode) {
    const key = this.hash(text, mode);
    if (!this.cache.has(key)) return null;

    // Refresh LRU order
    const val = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  set(text, mode, value) {
    const key = this.hash(text, mode);
    if (this.cache.size >= this.maxSize) {
      // Evict oldest item
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }
}

module.exports = new PromptCache();
