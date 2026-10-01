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
      item.innerHTML = `
        <div class="mini-issue-name">${issue.ruleName}: ${issue.message}</div>
        <div class="mini-issue-tip">Tip: ${issue.tip}</div>
      `;
      sandboxFeedback.appendChild(item);
    }
  }, 200);
}

if (sandboxInput) {
  sandboxInput.addEventListener("input", updateSandbox);
}

if (btnAutocorrect) {
  btnAutocorrect.addEventListener("click", () => {
    const text = (sandboxInput.value || "").trim();
    if (!text || !window.Echo || !window.Echo.autocorrect) return;

    const beforeRes = window.Echo.analyzer ? window.Echo.analyzer.analyze(text) : null;
    const beforeScore = beforeRes ? beforeRes.score : 0;

    const corr = window.Echo.autocorrect.correctFull(text);
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

      btnAutocorrect.textContent = "Corrected";
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

// Hook tab clicks to load history
navTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    if (tab.dataset.tab === "history") {
      loadHistory();
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

