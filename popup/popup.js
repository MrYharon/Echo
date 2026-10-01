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
    const corr = window.Echo.autocorrect.correctFull(text);
    if (corr && corr.corrected) {
      sandboxInput.value = corr.corrected;
      updateSandbox();
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

