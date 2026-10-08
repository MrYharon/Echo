const RULES = [
  { id: "tooShort", name: "Concrete task" },
  { id: "weakVerbs", name: "Vague language" },
  { id: "actionVerb", name: "Action verb" },
  { id: "missingSpecifics", name: "Constraints & format" },
  { id: "multipleAsks", name: "One ask at a time" }
];

const enabledEl = document.getElementById("enabled");
const rulesEl = document.getElementById("rules");

// Sandbox Elements
const sandboxInput = document.getElementById("sandbox-input");
const sandboxScore = document.getElementById("sandbox-score");
const sandboxCount = document.getElementById("sandbox-count");
const sandboxFeedback = document.getElementById("sandbox-feedback");
const btnAutocorrect = document.getElementById("sandbox-autocorrect");
const btnCopy = document.getElementById("sandbox-copy");
const btnClear = document.getElementById("sandbox-clear");

// Tabs
const navTabs = document.querySelectorAll(".nav-tab");
const tabContents = document.querySelectorAll(".tab-content");

navTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    navTabs.forEach((t) => t.classList.remove("active"));
    tabContents.forEach((c) => c.classList.remove("active"));
    tab.classList.add("active");
    const target = document.getElementById("tab-" + tab.dataset.tab);
    if (target) target.classList.add("active");
  });
});

function renderRules(rules) {
  rulesEl.innerHTML = "";
  for (const rule of RULES) {
    const row = document.createElement("div");
    row.className = "rule-row";
    const label = document.createElement("label");
    label.htmlFor = "rule-" + rule.id;
    label.textContent = rule.name;
    const box = document.createElement("input");
    box.type = "checkbox";
    box.id = "rule-" + rule.id;
    box.checked = rules[rule.id] !== false;
    box.addEventListener("change", async () => {
      const { echoRules = {} } = await chrome.storage.local.get("echoRules");
      echoRules[rule.id] = box.checked;
      await chrome.storage.local.set({ echoRules });
      updateSandbox();
    });
    row.appendChild(label);
    row.appendChild(box);
    rulesEl.appendChild(row);
  }
}

let sandboxTimer = null;
function updateSandbox() {
  clearTimeout(sandboxTimer);
  sandboxTimer = setTimeout(() => {
    const text = (sandboxInput.value || "").trim();
    if (!text) {
      sandboxScore.textContent = "Ready";
      sandboxScore.style.color = "var(--accent)";
      sandboxCount.textContent = "0 issues";
      sandboxFeedback.innerHTML = "";
      return;
    }

    if (!window.Echo || !window.Echo.analyzer) return;
    const res = window.Echo.analyzer.analyze(text);
    const grade = window.Echo.analyzer.grade(res.score);

    sandboxScore.textContent = "Score: " + res.score + " (" + grade.label + ")";
    sandboxScore.style.color = grade.color;
    sandboxCount.textContent = res.issues.length + (res.issues.length === 1 ? " issue" : " issues");

    sandboxFeedback.innerHTML = "";
    for (const issue of res.issues) {
      const item = document.createElement("div");
      item.className = "mini-issue";

      let diffHtml = "";
      if (issue.quickFix) {
        if (issue.quickFix.target && issue.quickFix.replacement != null) {
          diffHtml = `
            <div class="mini-diff-box">
              <span class="mini-diff-del">${issue.quickFix.target}</span>
              &rarr;
              <span class="mini-diff-ins">${issue.quickFix.replacement.trim()}</span>
            </div>
          `;
        } else if (issue.quickFix.append) {
          diffHtml = `
            <div class="mini-diff-box">
              <span class="mini-diff-append">+ ${issue.quickFix.append}</span>
            </div>
          `;
        }
      }

      const fixBtnHtml = issue.quickFix
        ? `<button class="mini-apply-btn" type="button">Apply suggestion</button>`
        : "";

      item.innerHTML = `
        <div class="mini-issue-head">
          <span class="mini-issue-name">${issue.ruleName}</span>
          <span class="mini-issue-cat">${issue.category || "QUALITY"}</span>
        </div>
        ${diffHtml}
        <div class="mini-issue-tip">${issue.rationale || issue.tip || issue.message}</div>
        ${fixBtnHtml}
      `;

      const fixBtn = item.querySelector(".mini-apply-btn");
      if (fixBtn && issue.quickFix) {
        fixBtn.addEventListener("click", () => {
          let cur = sandboxInput.value;
          if (issue.quickFix.target && issue.quickFix.replacement != null) {
            sandboxInput.value = cur.replace(issue.quickFix.target, issue.quickFix.replacement);
          } else if (issue.quickFix.append) {
            sandboxInput.value = cur.trim() + " " + issue.quickFix.append;
          }
          updateSandbox();
        });
      }

      sandboxFeedback.appendChild(item);
    }
  }, 200);
}

if (sandboxInput) {
  sandboxInput.addEventListener("input", updateSandbox);
}

let currentMode = "structured";
const modePills = document.querySelectorAll(".mode-pill");
modePills.forEach((pill) => {
  pill.addEventListener("click", () => {
    modePills.forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
    currentMode = pill.dataset.mode;
  });
});

if (btnAutocorrect) {
  btnAutocorrect.addEventListener("click", async () => {
    const text = (sandboxInput.value || "").trim();
    if (!text || !window.Echo || !window.Echo.autocorrect) return;

    const beforeRes = window.Echo.analyzer ? window.Echo.analyzer.analyze(text) : null;
    const beforeScore = beforeRes ? beforeRes.score : 0;

    btnAutocorrect.textContent = "Enhancing...";
    btnAutocorrect.disabled = true;

    try {
      const corr = await window.Echo.autocorrect.correctWithAI(text, currentMode);
      if (corr && corr.corrected) {
        sandboxInput.value = corr.corrected;
        updateSandbox();

        const afterRes = window.Echo.analyzer ? window.Echo.analyzer.analyze(corr.corrected) : null;
        const afterScore = afterRes ? afterRes.score : 100;

        if (window.Echo.db && window.Echo.db.addHistory) {
          window.Echo.db.addHistory({
            originalText: text,
            correctedText: corr.corrected,
            initialScore: beforeScore,
            finalScore: afterScore,
            platform: "playground",
            changes: corr.changes || []
          }).then(() => {
            loadHistory();
          }).catch(() => {});
        }

        btnAutocorrect.textContent = "Enhanced";
      } else {
        btnAutocorrect.textContent = "Auto-correct";
      }
    } catch (err) {
      console.error("Autocorrect error:", err);
      btnAutocorrect.textContent = "Auto-correct";
    } finally {
      btnAutocorrect.disabled = false;
      setTimeout(() => {
        btnAutocorrect.textContent = "Auto-correct";
      }, 1500);
    }
  });
}

if (btnCopy) {
  btnCopy.addEventListener("click", async () => {
    const text = sandboxInput.value;
    if (!text) return;
    await navigator.clipboard.writeText(text);
    btnCopy.textContent = "Copied";
    setTimeout(() => {
      btnCopy.textContent = "Copy";
    }, 1500);
  });
}

if (btnClear) {
  btnClear.addEventListener("click", () => {
    sandboxInput.value = "";
    updateSandbox();
  });
}

// History Management
const historyList = document.getElementById("history-list");
const btnClearHistory = document.getElementById("btn-clear-history");

async function loadHistory() {
  if (!historyList || !window.Echo || !window.Echo.db) return;
  try {
    const items = await window.Echo.db.getHistory(40);
    if (!items || items.length === 0) {
      historyList.innerHTML = `<div class="history-empty">No prompts recorded yet. Enhancements on ChatGPT, Claude, and Gemini will appear here automatically.</div>`;
      return;
    }
    historyList.innerHTML = "";
    for (const item of items) {
      const card = document.createElement("div");
      card.className = "history-card";

      const timeAgo = formatTimeAgo(item.timestamp);
      const scoreDiff = `${item.initialScore} &rarr; ${item.finalScore}`;

      card.innerHTML = `
        <div class="history-card-header">
          <span class="history-platform-tag">${escapeHtml(item.platform)}</span>
          <span style="color: var(--muted); font-size: 10px;">${timeAgo}</span>
          <span class="history-score-diff">${scoreDiff}</span>
        </div>
        <div class="history-text">${escapeHtml(item.correctedText)}</div>
        <div class="history-actions">
          <button class="btn-mini btn-copy-item" type="button">Copy</button>
          <button class="btn-mini btn-reuse-item" type="button">Reuse</button>
          <button class="btn-mini btn-del-item" type="button" style="color:#f87171;">Delete</button>
        </div>
      `;

      card.querySelector(".btn-copy-item").addEventListener("click", async (e) => {
        await navigator.clipboard.writeText(item.correctedText);
        e.target.textContent = "Copied";
        setTimeout(() => { e.target.textContent = "Copy"; }, 1200);
      });

      card.querySelector(".btn-reuse-item").addEventListener("click", () => {
        sandboxInput.value = item.correctedText;
        updateSandbox();
        // Switch to playground tab
        navTabs.forEach((t) => t.classList.remove("active"));
        tabContents.forEach((c) => c.classList.remove("active"));
        const tabEl = document.querySelector('[data-tab="sandbox"]');
        if (tabEl) tabEl.classList.add("active");
        const targetEl = document.getElementById("tab-sandbox");
        if (targetEl) targetEl.classList.add("active");
      });

      card.querySelector(".btn-del-item").addEventListener("click", async () => {
        await window.Echo.db.deleteHistory(item.id);
        loadHistory();
      });

      historyList.appendChild(card);
    }
  } catch (err) {
    console.error("Echo: failed loading history", err);
  }
}

if (btnClearHistory) {
  btnClearHistory.addEventListener("click", async () => {
    if (!window.Echo || !window.Echo.db) return;
    await window.Echo.db.clearHistory();
    loadHistory();
  });
}

function formatTimeAgo(timestamp) {
  if (!timestamp) return "";
  const sec = Math.floor((Date.now() - timestamp) / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return min + "m ago";
  const hr = Math.floor(min / 60);
  if (hr < 24) return hr + "h ago";
  const days = Math.floor(hr / 24);
  return days + "d ago";
}

function escapeHtml(str) {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Snippets Management
const snippetsList = document.getElementById("snippets-list");
const btnToggleNewSnippet = document.getElementById("btn-toggle-new-snippet");
const snippetForm = document.getElementById("snippet-form");
const snippetTitleInput = document.getElementById("snippet-title-input");
const snippetContentInput = document.getElementById("snippet-content-input");
const btnSaveSnippet = document.getElementById("btn-save-snippet");
const btnCancelSnippet = document.getElementById("btn-cancel-snippet");

const DEFAULT_TEMPLATES = [
  {
    title: "Code Review & Refactor",
    content: "Review the following code for bugs, edge cases, and performance bottlenecks. Suggest concrete refactorings with clean code blocks and comments."
  },
  {
    title: "Technical Architecture Proposal",
    content: "Design a modular architecture for the following feature. Detail component boundaries, data flow, API contracts, and trade-offs."
  },
  {
    title: "Executive Summary",
    content: "Summarize the key findings into an executive briefing under 200 words. Highlight impact, metrics, risks, and recommended action items."
  }
];

async function seedDefaultTemplatesIfEmpty() {
  if (!window.Echo || !window.Echo.db) return;
  const existing = await window.Echo.db.getSnippets();
  if (!existing || existing.length === 0) {
    for (const t of DEFAULT_TEMPLATES) {
      await window.Echo.db.addSnippet(t);
    }
  }
}

async function loadSnippets() {
  if (!snippetsList || !window.Echo || !window.Echo.db) return;
  await seedDefaultTemplatesIfEmpty();
  const items = await window.Echo.db.getSnippets();
  snippetsList.innerHTML = "";

  if (!items || items.length === 0) {
    snippetsList.innerHTML = `<div class="history-empty">No prompt templates saved yet. Click "+ New" above to save your first reusable template.</div>`;
    return;
  }

  for (const item of items) {
    const card = document.createElement("div");
    card.className = "history-card";
    card.innerHTML = `
      <div class="history-card-header">
        <span style="font-weight:700; color:var(--accent); font-size:11px;">${escapeHtml(item.title)}</span>
      </div>
      <div class="history-text">${escapeHtml(item.content)}</div>
      <div class="history-actions">
        <button class="btn-mini btn-insert-snippet" type="button">Insert</button>
        <button class="btn-mini btn-copy-snippet" type="button">Copy</button>
        <button class="btn-mini btn-del-snippet" type="button" style="color:#f87171;">Delete</button>
      </div>
    `;

    card.querySelector(".btn-insert-snippet").addEventListener("click", () => {
      sandboxInput.value = item.content;
      updateSandbox();
      navTabs.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));
      const tabEl = document.querySelector('[data-tab="sandbox"]');
      if (tabEl) tabEl.classList.add("active");
      const targetEl = document.getElementById("tab-sandbox");
      if (targetEl) targetEl.classList.add("active");
    });

    card.querySelector(".btn-copy-snippet").addEventListener("click", async (e) => {
      await navigator.clipboard.writeText(item.content);
      e.target.textContent = "Copied";
      setTimeout(() => { e.target.textContent = "Copy"; }, 1200);
    });

    card.querySelector(".btn-del-snippet").addEventListener("click", async () => {
      await window.Echo.db.deleteSnippet(item.id);
      loadSnippets();
    });

    snippetsList.appendChild(card);
  }
}

if (btnToggleNewSnippet) {
  btnToggleNewSnippet.addEventListener("click", () => {
    snippetForm.style.display = snippetForm.style.display === "none" ? "block" : "none";
    if (snippetForm.style.display === "block") {
      snippetTitleInput.focus();
    }
  });
}

if (btnCancelSnippet) {
  btnCancelSnippet.addEventListener("click", () => {
    snippetForm.style.display = "none";
    snippetTitleInput.value = "";
    snippetContentInput.value = "";
  });
}

if (btnSaveSnippet) {
  btnSaveSnippet.addEventListener("click", async () => {
    const title = (snippetTitleInput.value || "").trim();
    const content = (snippetContentInput.value || "").trim();
    if (!title || !content || !window.Echo || !window.Echo.db) return;

    await window.Echo.db.addSnippet({ title, content });
    snippetForm.style.display = "none";
    snippetTitleInput.value = "";
    snippetContentInput.value = "";
    loadSnippets();
  });
}

// Hook tab clicks to load history and snippets
navTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    if (tab.dataset.tab === "history") {
      loadHistory();
    } else if (tab.dataset.tab === "snippets") {
      loadSnippets();
    }
  });
});

const statPrompts = document.getElementById("stat-prompts");
const statFixes = document.getElementById("stat-fixes");

function renderStats(stats) {
  if (!stats) stats = { promptsEnhanced: 0, fixesApplied: 0 };
  if (statPrompts) statPrompts.textContent = stats.promptsEnhanced || 0;
  if (statFixes) statFixes.textContent = stats.fixesApplied || 0;
}

// AI Engine Elements
const aiProviderSelect = document.getElementById("ai-provider");
const geminiKeyWrap = document.getElementById("gemini-key-wrap");
const geminiKeyInput = document.getElementById("gemini-key");
const openaiKeyWrap = document.getElementById("openai-key-wrap");
const openaiKeyInput = document.getElementById("openai-key");
const btnSaveAiSettings = document.getElementById("btn-save-ai-settings");
const aiStatusMsg = document.getElementById("ai-status-msg");

function updateAiFieldVisibility(provider) {
  if (provider === "gemini") {
    geminiKeyWrap.style.display = "block";
    openaiKeyWrap.style.display = "none";
  } else if (provider === "openai") {
    geminiKeyWrap.style.display = "none";
    openaiKeyWrap.style.display = "block";
  } else if (provider === "auto") {
    geminiKeyWrap.style.display = "block";
    openaiKeyWrap.style.display = "block";
  } else {
    geminiKeyWrap.style.display = "none";
    openaiKeyWrap.style.display = "none";
  }
}

if (aiProviderSelect) {
  aiProviderSelect.addEventListener("change", () => {
    updateAiFieldVisibility(aiProviderSelect.value);
  });
}

if (btnSaveAiSettings) {
  btnSaveAiSettings.addEventListener("click", async () => {
    const provider = aiProviderSelect.value;
    const geminiKey = (geminiKeyInput.value || "").trim();
    const openaiKey = (openaiKeyInput.value || "").trim();

    if (window.Echo && window.Echo.ai && window.Echo.ai.saveSettings) {
      await window.Echo.ai.saveSettings({
        provider,
        geminiApiKey: geminiKey,
        openaiApiKey: openaiKey
      });
      aiStatusMsg.textContent = "Saved";
      setTimeout(() => {
        aiStatusMsg.textContent = "";
      }, 2000);
    }
  });
}

async function init() {
  const { echoEnabled, echoRules = {}, echoStats = {} } = await chrome.storage.local.get([
    "echoEnabled",
    "echoRules",
    "echoStats"
  ]);
  enabledEl.checked = echoEnabled !== false;
  renderRules(echoRules);
  renderStats(echoStats);
  loadHistory();
  loadSnippets();

  if (window.Echo && window.Echo.ai && window.Echo.ai.getSettings) {
    const aiConfig = await window.Echo.ai.getSettings();
    if (aiProviderSelect) aiProviderSelect.value = aiConfig.provider || "auto";
    if (geminiKeyInput) geminiKeyInput.value = aiConfig.geminiApiKey || "";
    if (openaiKeyInput) openaiKeyInput.value = aiConfig.openaiApiKey || "";
    updateAiFieldVisibility(aiConfig.provider || "auto");
  }
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.echoStats) {
    renderStats(changes.echoStats.newValue);
  }
});

enabledEl.addEventListener("change", async () => {
  await chrome.storage.local.set({ echoEnabled: enabledEl.checked });
});

init();

