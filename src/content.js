(function () {
  let settings = null;
  let currentInput = null;
  let debounceTimer = null;
  let lastText = null;

  async function loadSettings() {
    const stored = await chrome.storage.local.get(["echoEnabled", "echoRules"]);
    settings = {
      enabled: stored.echoEnabled !== false,
      rules: stored.echoRules || {}
    };
  }

  function scheduleAnalyze() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runAnalyze, 400);
  }

  function runAnalyze() {
    if (!settings || !settings.enabled) return;
    if (!Echo.detector.isConnected(currentInput)) return;
    const text = Echo.detector.read(currentInput);
    if (text === lastText) return;
    lastText = text;
    const result = Echo.analyzer.analyze(text, settings.rules);
    Echo.ui.update(result);
  }

  function handleKeyDown(e) {
    if (e.altKey && (e.key === "e" || e.key === "E")) {
      if (Echo.ui && Echo.ui.triggerAutocorrect) {
        e.preventDefault();
        Echo.ui.triggerAutocorrect();
      }
    }
  }

  function bindInput(input) {
    currentInput = input;
    Echo.ui.mount(input);
    input.addEventListener("input", scheduleAnalyze);
    input.addEventListener("keyup", scheduleAnalyze);
    input.addEventListener("keydown", handleKeyDown);
    runAnalyze();
  }

  function findAndBind() {
    if (!settings || !settings.enabled) return;
    const detected = Echo.detector.detect();
    if (!detected) return;
    if (currentInput === detected.input && Echo.detector.isConnected(currentInput)) {
      Echo.ui.position();
      return;
    }
    bindInput(detected.input);
  }

  function tick() {
    if (!settings) return;
    if (!settings.enabled) {
      if (currentInput) {
        currentInput.removeEventListener("keydown", handleKeyDown);
        Echo.ui.cleanup();
        currentInput = null;
      }
      return;
    }
    if (!Echo.detector.isConnected(currentInput)) {
      findAndBind();
    }
  }

  function init() {
    loadSettings().then(() => {
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== "local") return;
        let changed = false;
        if (changes.echoEnabled) {
          settings.enabled = changes.echoEnabled.newValue !== false;
          changed = true;
        }
        if (changes.echoRules) {
          settings.rules = changes.echoRules.newValue || {};
          changed = true;
        }
        if (changed) {
          lastText = null;
          tick();
        }
      });
      chrome.runtime.onMessage.addListener((request) => {
        if (request.type === "TRIGGER_AUTOCORRECT") {
          if (Echo.ui && Echo.ui.triggerAutocorrect) {
            Echo.ui.triggerAutocorrect();
          }
        }
      });
      setInterval(tick, 1000);
      tick();
    });
  }

  init();
})();
