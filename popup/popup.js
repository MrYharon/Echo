const RULES = [
  { id: "tooShort", name: "Concrete task" },
  { id: "weakVerbs", name: "Vague language" },
  { id: "actionVerb", name: "Action verb" },
  { id: "missingSpecifics", name: "Constraints & format" },
  { id: "multipleAsks", name: "One ask at a time" }
];

const enabledEl = document.getElementById("enabled");
const rulesEl = document.getElementById("rules");

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
    });
    row.appendChild(label);
    row.appendChild(box);
    rulesEl.appendChild(row);
  }
}

async function init() {
  const { echoEnabled, echoRules = {} } = await chrome.storage.local.get([
    "echoEnabled",
    "echoRules"
  ]);
  enabledEl.checked = echoEnabled !== false;
  renderRules(echoRules);
}

enabledEl.addEventListener("change", async () => {
  await chrome.storage.local.set({ echoEnabled: enabledEl.checked });
});

init();
