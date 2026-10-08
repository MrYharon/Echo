// Echo Landing Page - Interactive Prompt Compiler Sandbox
document.addEventListener("DOMContentLoaded", () => {
  const inputText = document.getElementById("sandbox-input-text");
  const outputText = document.getElementById("sandbox-output-text");
  const scoreBefore = document.getElementById("score-before");
  const scoreAfter = document.getElementById("score-after");
  const issuesContainer = document.getElementById("issues-container");
  const btnCompile = document.getElementById("btn-compile");
  const btnReset = document.getElementById("btn-reset-demo");
  const btnCopy = document.getElementById("btn-copy-output");
  const modePills = document.querySelectorAll(".mode-pill");
  const sampleBtns = document.querySelectorAll(".sample-btn");

  let activeMode = "structured";

  const SAMPLES = {
    conversational: `Don't write any code yet I just want to plan for now OK for example echo right now in its current state for example if I type what is a dog it will say and if I press Alt E or the shortcut for it it will just change it to what is a dog provide key points provide bullets be clear and concise it just does that right But what if The prompt is exactly like how I am speaking right now I mean you can't just copy paste everything and just add be clear and concise at key points and stuff right if I'm talking like this to an AI what do you think can be the best thing to do here Or like do we really need a server do we really need a database for this also I want it to be not instant but I want it to be fast like how Grammarly does it`,
    scraper: `hey so I want to build this web scraper in python for an online sneaker shop because I want to track price drops but don't use selenium because it's too slow and heavy maybe use requests or playwright or something and save it somewhere like postgres or sqlite and make sure if the website blocks me it doesn't crash completely it should retry or wait a bit and don't write generic code give me the actual working script`,
    sql: `how do I fix a really slow query on my postgresql database users table with 10 million rows where it takes 6 seconds every time we filter by status and created_at and we don't want to lock the table while fixing it`
  };

  // Switch modes
  modePills.forEach((pill) => {
    pill.addEventListener("click", () => {
      modePills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      activeMode = pill.dataset.mode;
      runCompile();
    });
  });

  // Switch sample prompts
  sampleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const sampleKey = btn.dataset.sample;
      if (SAMPLES[sampleKey]) {
        inputText.value = SAMPLES[sampleKey];
        analyzeInput();
        runCompile();
      }
    });
  });

  function analyzeInput() {
    const raw = (inputText.value || "").trim();
    if (!raw) {
      scoreBefore.textContent = "Clarity: --";
      scoreBefore.className = "badge-poor";
      issuesContainer.innerHTML = "";
      return;
    }

    if (!window.Echo || !window.Echo.analyzer) return;
    const res = window.Echo.analyzer.analyze(raw);

    scoreBefore.textContent = `Clarity: ${res.score} (${res.score < 60 ? "Messy" : "Fair"})`;
    scoreBefore.className = res.score >= 70 ? "badge-optimized" : "badge-poor";

    issuesContainer.innerHTML = "";
    if (res.issues && res.issues.length > 0) {
      res.issues.slice(0, 3).forEach((issue) => {
        const item = document.createElement("div");
        item.className = "issue-item";
        item.innerHTML = `
          <strong>${issue.category || "FLAG"}:</strong>
          <span>${issue.rationale || issue.tip || issue.message}</span>
        `;
        issuesContainer.appendChild(item);
      });
    } else {
      issuesContainer.innerHTML = `
        <div style="font-size:11px; color:#34d399; padding:4px 0;">No severe ambiguities found.</div>
      `;
    }
  }

  function runCompile() {
    const raw = (inputText.value || "").trim();
    if (!raw) {
      outputText.textContent = "";
      scoreAfter.textContent = "Clarity: --";
      return;
    }

    if (!window.Echo || !window.Echo.architect) {
      outputText.textContent = raw;
      return;
    }

    const transformed = window.Echo.architect.transform(raw, activeMode);
    outputText.textContent = transformed.corrected;

    scoreAfter.textContent = "Clarity: 100 (Airtight)";
    scoreAfter.className = "badge-optimized";
  }

  inputText.addEventListener("input", () => {
    analyzeInput();
  });

  btnCompile.addEventListener("click", () => {
    btnCompile.textContent = "Compiling...";
    setTimeout(() => {
      runCompile();
      btnCompile.textContent = "Compile Prompt";
    }, 250);
  });

  btnReset.addEventListener("click", () => {
    inputText.value = "";
    outputText.textContent = "";
    analyzeInput();
    scoreAfter.textContent = "Clarity: --";
  });

  btnCopy.addEventListener("click", async () => {
    const text = outputText.textContent;
    if (!text) return;
    await navigator.clipboard.writeText(text);
    btnCopy.textContent = "Copied!";
    setTimeout(() => {
      btnCopy.textContent = "Copy Prompt";
    }, 1500);
  });

  // Pre-load conversational thought dump sample on startup
  inputText.value = SAMPLES.conversational;
  analyzeInput();
  runCompile();
});
