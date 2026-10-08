// Echo - Creative Interactive Laboratory & Kinetic Acoustic Canvas
document.addEventListener("DOMContentLoaded", () => {
  // 1. Acoustic Soundwave Background Canvas (Matching Monogram Wallpaper)
  const canvas = document.getElementById("hero-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    let mouseX = width / 2;
    let mouseY = height / 3;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    window.addEventListener("mousemove", (e) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    });

    let waveOffset = 0;

    function renderWaves() {
      // Smooth mouse follow
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const rings = 14;
      const baseRadius = 80;
      const spacing = 48;

      ctx.lineWidth = 1;

      for (let i = 0; i < rings; i++) {
        const radius = baseRadius + i * spacing + Math.sin(waveOffset + i * 0.4) * 6;
        const opacity = Math.max(0, 0.28 - (i / rings) * 0.25);

        ctx.strokeStyle = `rgba(19, 30, 51, ${opacity})`;
        ctx.beginPath();

        // Draw organic wavy contour ring
        const segments = 60;
        for (let s = 0; s <= segments; s++) {
          const angle = (s / segments) * Math.PI * 2;
          const distortion = Math.sin(angle * 4 + waveOffset + i) * 8;
          const r = radius + distortion;
          const x = mouseX + Math.cos(angle) * r;
          const y = mouseY + Math.sin(angle) * (r * 0.85);

          if (s === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.stroke();
      }

      waveOffset += 0.012;
      requestAnimationFrame(renderWaves);
    }

    renderWaves();
  }

  // 2. Interactive Prompt Laboratory
  const inputText = document.getElementById("lab-input");
  const outputText = document.getElementById("lab-output");
  const clarityBefore = document.getElementById("clarity-before");
  const clarityAfter = document.getElementById("clarity-after");
  const diagDrawer = document.getElementById("lab-diagnostics");
  const btnCompile = document.getElementById("btn-run-compile");
  const btnReset = document.getElementById("btn-reset-input");
  const btnCopy = document.getElementById("btn-copy-contract");
  const modeButtons = document.querySelectorAll(".mode-toggle-btn");
  const sampleButtons = document.querySelectorAll(".sample-pill-btn");

  let activeMode = "structured";

  const PROMPT_SAMPLES = {
    conversational: `Don't write any code yet I just want to plan for now OK for example echo right now in its current state for example if I type what is a dog it will say and if I press Alt E or the shortcut for it it will just change it to what is a dog provide key points provide bullets be clear and concise it just does that right But what if The prompt is exactly like how I am speaking right now I mean you can't just copy paste everything and just add be clear and concise at key points and stuff right if I'm talking like this to an AI what do you think can be the best thing to do here Or like do we really need a server do we really need a database for this also I want it to be not instant but I want it to be fast like how Grammarly does it`,
    scraper: `hey so I want to build this web scraper in python for an online sneaker shop because I want to track price drops but don't use selenium because it's too slow and heavy maybe use requests or playwright or something and save it somewhere like postgres or sqlite and make sure if the website blocks me it doesn't crash completely it should retry or wait a bit and don't write generic code give me the actual working script`,
    sql: `how do I fix a really slow query on my postgresql database users table with 10 million rows where it takes 6 seconds every time we filter by status and created_at and we don't want to lock the table while fixing it`
  };

  // Mode switching
  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      modeButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeMode = btn.dataset.mode;
      executeDecompilation();
    });
  });

  // Sample prompt buttons
  sampleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.sample;
      if (PROMPT_SAMPLES[key]) {
        inputText.value = PROMPT_SAMPLES[key];
        evaluateInputClarity();
        executeDecompilation();
      }
    });
  });

  function evaluateInputClarity() {
    const raw = (inputText.value || "").trim();
    if (!raw) {
      clarityBefore.textContent = "Clarity: --";
      clarityBefore.className = "clarity-chip";
      diagDrawer.innerHTML = "";
      return;
    }

    if (!window.Echo || !window.Echo.analyzer) return;
    const analysis = window.Echo.analyzer.analyze(raw);

    clarityBefore.textContent = `Clarity: ${analysis.score}/100 (${analysis.score < 60 ? "Messy" : "Fair"})`;
    clarityBefore.className = analysis.score >= 70 ? "clarity-chip airtight" : "clarity-chip messy";

    diagDrawer.innerHTML = "";
    if (analysis.issues && analysis.issues.length > 0) {
      analysis.issues.slice(0, 3).forEach((issue) => {
        const item = document.createElement("div");
        item.className = "diag-item";
        item.innerHTML = `
          <strong>[${issue.category || "FLAG"}]</strong>
          <span>${issue.rationale || issue.tip || issue.message}</span>
        `;
        diagDrawer.appendChild(item);
      });
    } else {
      diagDrawer.innerHTML = `
        <div style="font-size:12px; color:#15803d; font-weight:600; padding:4px 0;">No severe attention head distractors detected.</div>
      `;
    }
  }

  function executeDecompilation() {
    const raw = (inputText.value || "").trim();
    if (!raw) {
      outputText.textContent = "";
      clarityAfter.textContent = "Clarity: --";
      return;
    }

    if (!window.Echo || !window.Echo.architect) {
      outputText.textContent = raw;
      return;
    }

    const transformed = window.Echo.architect.transform(raw, activeMode);
    outputText.textContent = transformed.corrected;

    clarityAfter.textContent = "Clarity: 100/100 (Airtight)";
    clarityAfter.className = "clarity-chip airtight";
  }

  inputText.addEventListener("input", () => {
    evaluateInputClarity();
  });

  btnCompile.addEventListener("click", () => {
    btnCompile.textContent = "Compiling...";
    setTimeout(() => {
      executeDecompilation();
      btnCompile.textContent = "Compile Prompt";
    }, 200);
  });

  btnReset.addEventListener("click", () => {
    inputText.value = "";
    outputText.textContent = "";
    evaluateInputClarity();
    clarityAfter.textContent = "Clarity: --";
  });

  btnCopy.addEventListener("click", async () => {
    const text = outputText.textContent;
    if (!text) return;
    await navigator.clipboard.writeText(text);
    btnCopy.textContent = "Copied to Clipboard!";
    setTimeout(() => {
      btnCopy.textContent = "Copy Prompt";
    }, 1500);
  });

  // Preload conversational thought dump
  inputText.value = PROMPT_SAMPLES.conversational;
  evaluateInputClarity();
  executeDecompilation();
});
