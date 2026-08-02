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

  isConnected(input) {
    return Boolean(input && input.isConnected && document.contains(input));
  }
};
