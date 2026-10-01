var Echo = window.Echo = window.Echo || {};

Echo.detector = {
  PLATFORM_SELECTORS: {
    "chatgpt.com": '#prompt-textarea, [data-testid="prompt-textarea"]',
    "chat.openai.com": '#prompt-textarea, [data-testid="prompt-textarea"]',
    "claude.ai": '[contenteditable="true"][role="textbox"], .ProseMirror',
    "gemini.google.com": '.ql-editor[contenteditable="true"], [contenteditable="true"][role="textbox"]'
  },

  detect() {
    const host = location.hostname;
    const selector = Echo.detector.PLATFORM_SELECTORS[host];
    if (selector) {
      const input = document.querySelector(selector);
      if (input) {
        return { input: input, platform: host };
      }
      return null;
    }
    const generic = Echo.detector.findGeneric();
    return generic ? { input: generic, platform: "generic" } : null;
  },

  findGeneric() {
    const candidates = Array.from(
      document.querySelectorAll('textarea, [contenteditable="true"]')
    );
    return (
      candidates.find((el) => {
        const rect = el.getBoundingClientRect();
        return (
          rect.width > 200 &&
          rect.height > 40 &&
          rect.top > 0 &&
          rect.top < window.innerHeight
        );
      }) || null
    );
  },

  read(input) {
    if (!input) return "";
    if (input.tagName === "TEXTAREA" || input.tagName === "INPUT") {
      return input.value || "";
    }
    return input.innerText || input.textContent || "";
  },

  write(input, newText) {
    if (!input) return false;
    input.focus();

    if (input.tagName === "TEXTAREA" || input.tagName === "INPUT") {
      input.value = newText;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    }

    try {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(input);
      selection.removeAllRanges();
      selection.addRange(range);

      let written = document.execCommand("insertText", false, newText);
      const current = (input.innerText || input.textContent || "").trim();
      if (!written || current !== newText.trim()) {
        if (input.classList && input.classList.contains("ql-editor")) {
          input.innerHTML = `<p>${Echo.detector.escapeHtml(newText)}</p>`;
        } else {
          input.textContent = newText;
        }
        input.dispatchEvent(
          new InputEvent("input", {
            bubbles: true,
            cancelable: true,
            inputType: "insertText",
            data: newText
          })
        );
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
      return true;
    } catch (err) {
      console.error("Echo: failed writing to input", err);
      return false;
    }
  },

  append(input, textToAppend) {
    const current = Echo.detector.read(input);
    const trimmed = current.trim();
    if (!trimmed) {
      return Echo.detector.write(input, textToAppend);
    }
    const separator = current.endsWith("\n") ? "\n" : "\n\n";
    return Echo.detector.write(input, current + separator + textToAppend);
  },

  replaceText(input, target, replacement) {
    const current = Echo.detector.read(input);
    let updated = "";
    if (typeof target === "string") {
      updated = current.replace(target, replacement);
    } else if (target instanceof RegExp) {
      updated = current.replace(target, replacement);
    } else {
      return false;
    }
    return Echo.detector.write(input, updated);
  },

  escapeHtml(str) {
    return (str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  isConnected(input) {
    return Boolean(input && input.isConnected && document.contains(input));
  }
};

