// Interactive Sandbox for Echo Landing Page
document.addEventListener("DOMContentLoaded", () => {
  const demoInput = document.getElementById("demo-input");
  const demoOutput = document.getElementById("demo-output");
  const demoScoreBefore = document.getElementById("demo-score-before");
  const demoScoreAfter = document.getElementById("demo-score-after");
  const demoIssuesContainer = document.getElementById("demo-issues-container");
  const btnEnhance = document.getElementById("btn-demo-enhance");
  const btnReset = document.getElementById("btn-demo-reset");
  const btnCopy = document.getElementById("btn-demo-copy");
  const modePills = document.querySelectorAll(".mode-pill-btn");
  const sampleChips = document.querySelectorAll(".sample-chip");

  let activeMode = "structured";

  const SAMPLES = {
    "react-login": "can you help me write react code for login and make it good etc",
    "python-scrape": "i want you to make a python script to scrape data from ecommerce website and put in database",
    "sql-perf": "how to fix slow sql query on postgresql users table with millions of rows"
  };

  // Switch modes
  modePills.forEach((pill) => {
    pill.addEventListener("click", () => {
      modePills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      activeMode = pill.dataset.mode;
      runEnhance();
    });
  });

  // Switch samples
  sampleChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const sampleKey = chip.dataset.sample;
      if (SAMPLES[sampleKey]) {
        demoInput.value = SAMPLES[sampleKey];
        updateBeforeAnalysis();
        runEnhance();
      }
    });
  });

  function updateBeforeAnalysis() {
    const text = (demoInput.value || "").trim();
    if (!text || !window.Echo || !window.Echo.analyzer) {
      demoScoreBefore.textContent = "Score: --";
      demoIssuesContainer.innerHTML = "";
      return;
    }

    const res = window.Echo.analyzer.analyze(text);
    const grade = window.Echo.analyzer.grade(res.score);
    demoScoreBefore.textContent = `Score: ${res.score} (${grade.label})`;
    demoScoreBefore.style.color = grade.color;

    demoIssuesContainer.innerHTML = "";
    if (res.issues.length === 0) {
      demoIssuesContainer.innerHTML = `
        <div style="font-size:12px; color:#34d399; padding:6px 0;">No critical issues detected.</div>
      `;
    } else {
      res.issues.forEach((issue) => {
        const item = document.createElement("div");
        item.className = "issue-chip";
        item.innerHTML = `
          <span style="font-weight:700;">${issue.ruleName}:</span>
          <span>${issue.message}</span>
        `;
        demoIssuesContainer.appendChild(item);
      });
    }
  }

  function runEnhance() {
    const text = (demoInput.value || "").trim();
    if (!text) {
      demoOutput.textContent = "";
      return;
    }

    if (!window.Echo || !window.Echo.architect) {
      demoOutput.textContent = text;
      return;
    }

    const result = window.Echo.architect.transform(text, activeMode);
    demoOutput.textContent = result.text;

    if (window.Echo.analyzer) {
      const afterRes = window.Echo.analyzer.analyze(result.text);
      demoScoreAfter.textContent = `Score: ${afterRes.score} (Excellent)`;
    }
  }

  demoInput.addEventListener("input", () => {
    updateBeforeAnalysis();
  });

  btnEnhance.addEventListener("click", () => {
    btnEnhance.textContent = "Enhancing...";
    setTimeout(() => {
      runEnhance();
      btnEnhance.textContent = "Enhance with Echo";
    }, 200);
  });

  btnReset.addEventListener("click", () => {
    demoInput.value = "";
    demoOutput.textContent = "";
    updateBeforeAnalysis();
    demoScoreAfter.textContent = "Score: --";
  });

  btnCopy.addEventListener("click", async () => {
    const text = demoOutput.textContent;
    if (!text) return;
    await navigator.clipboard.writeText(text);
    btnCopy.textContent = "Copied!";
    setTimeout(() => {
      btnCopy.textContent = "Copy Prompt";
    }, 1500);
  });

  // Initial run
  updateBeforeAnalysis();
  runEnhance();
});
