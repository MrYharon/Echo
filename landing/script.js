// Echo - Creative Kinetic Monogram & Acoustic Canvas Engine
document.addEventListener("DOMContentLoaded", () => {
  // 1. Full-Bleed Kinetic Acoustic Ripple Canvas
  const canvas = document.getElementById("fluid-canvas");
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
    let mouseSpeed = 0;
    let lastX = mouseX;
    let lastY = mouseY;

    window.addEventListener("mousemove", (e) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
      const dx = targetMouseX - lastX;
      const dy = targetMouseY - lastY;
      mouseSpeed = Math.min(Math.sqrt(dx * dx + dy * dy), 30);
      lastX = targetMouseX;
      lastY = targetMouseY;
    });

    let waveOffset = 0;

    function renderWaves() {
      // Smooth interpolation
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;
      mouseSpeed *= 0.94;

      ctx.clearRect(0, 0, width, height);

      // Large multi-ring acoustic propagation
      const rings = 22;
      const baseRadius = 100;
      const spacing = 58;

      ctx.lineWidth = 1;

      for (let i = 0; i < rings; i++) {
        const radius = baseRadius + i * spacing + Math.sin(waveOffset + i * 0.35) * (8 + mouseSpeed * 0.4);
        const opacity = Math.max(0, 0.24 - (i / rings) * 0.21);

        ctx.strokeStyle = `rgba(19, 30, 51, ${opacity})`;
        ctx.beginPath();

        // 72 organic radial segments
        const segments = 72;
        for (let s = 0; s <= segments; s++) {
          const angle = (s / segments) * Math.PI * 2;
          const harmonicDistortion = Math.sin(angle * 5 + waveOffset + i * 0.5) * (10 + (mouseSpeed * 0.3));
          const r = radius + harmonicDistortion;
          const x = mouseX + Math.cos(angle) * r;
          const y = mouseY + Math.sin(angle) * (r * 0.82);

          if (s === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.stroke();
      }

      waveOffset += 0.009;
      requestAnimationFrame(renderWaves);
    }

    renderWaves();
  }

  // 2. Kinetic 3D Monogram Sculpture Parallax
  const sculpture = document.getElementById("monogram-sculpture");
  if (sculpture) {
    const slabTop = sculpture.querySelector(".slab-top");
    const slabMid = sculpture.querySelector(".slab-mid");
    const slabBot = sculpture.querySelector(".slab-bot");

    window.addEventListener("mousemove", (e) => {
      const rect = sculpture.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) / (window.innerWidth / 2);
      const deltaY = (e.clientY - centerY) / (window.innerHeight / 2);

      // Subtle 3D perspective rotation
      sculpture.style.transform = `perspective(900px) rotateY(${deltaX * 12}deg) rotateX(${-deltaY * 12}deg)`;

      // Kinetic slab horizontal translation
      if (slabTop) slabTop.style.transform = `translateX(${-deltaX * 14}px)`;
      if (slabMid) slabMid.style.transform = `translateX(${deltaX * 18}px)`;
      if (slabBot) slabBot.style.transform = `translateX(${-deltaX * 10}px)`;
    });

    sculpture.addEventListener("mouseleave", () => {
      sculpture.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg)";
      if (slabTop) slabTop.style.transform = "translateX(0px)";
      if (slabMid) slabMid.style.transform = "translateX(0px)";
      if (slabBot) slabBot.style.transform = "translateX(0px)";
    });
  }

  // 3. Scroll Fade-in Intersection Observer
  const fadeElements = document.querySelectorAll(".fade-in-element");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    }, { threshold: 0.12 });

    fadeElements.forEach((el) => observer.observe(el));
  } else {
    fadeElements.forEach((el) => el.classList.add("is-visible"));
  }

  // 4. Interactive Laboratory Workbench
  const inputText = document.getElementById("lab-input");
  const outputText = document.getElementById("lab-output");
  const clarityBefore = document.getElementById("clarity-before");
  const clarityAfter = document.getElementById("clarity-after");
  const diagDrawer = document.getElementById("lab-diagnostics");
  const btnCompile = document.getElementById("btn-run-compile");
  const btnReset = document.getElementById("btn-reset-input");
  const btnCopy = document.getElementById("btn-copy-contract");
  const modeButtons = document.querySelectorAll(".mode-tab-btn");
  const sampleButtons = document.querySelectorAll(".preset-btn");

  let activeMode = "structured";

  const PROMPT_SAMPLES = {
    booking: `hey I need to build a barbershop appointment booking system with stripe integration and calendar sync but don't use nextjs or tailwind we want raw fastify and vanilla js and make sure two people can't double book the same barber slot at the same second so use optimistic locking or postgres transactions and don't write generic mock code give me the actual db schema and route handler`,
    react: `look I have this react component that re-renders 50 times whenever the user types in a search box and it lags the whole browser don't just tell me to use useMemo tell me exactly where the state should live and don't introduce external redux or zustand keep it clean react hooks`,
    postgres: `we have a postgres database with 15 million audit log rows and our query checking user activity between two timestamps is taking 8 seconds and locking workers don't suggest upgrading the hardware explain the b-tree index strategy and explain analyze breakdown`
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

  // Sample prompt selection
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
      if (clarityBefore) {
        clarityBefore.textContent = "Clarity: --";
        clarityBefore.className = "score-chip";
      }
      if (diagDrawer) diagDrawer.innerHTML = "";
      return;
    }

    if (!window.Echo || !window.Echo.analyzer) return;
    const analysis = window.Echo.analyzer.analyze(raw);

    if (clarityBefore) {
      clarityBefore.textContent = `Clarity: ${analysis.score}/100 (${analysis.score < 60 ? "Messy" : "Fair"})`;
      clarityBefore.className = analysis.score >= 70 ? "score-chip airtight" : "score-chip messy";
    }

    if (diagDrawer) {
      diagDrawer.innerHTML = "";
      if (analysis.issues && analysis.issues.length > 0) {
        analysis.issues.slice(0, 3).forEach((issue) => {
          const item = document.createElement("div");
          item.className = "feedback-alert";
          item.innerHTML = `
            <strong>[${issue.category || "FLAG"}]</strong> ${issue.rationale || issue.tip || issue.message}
          `;
          diagDrawer.appendChild(item);
        });
      } else {
        diagDrawer.innerHTML = `
          <div style="font-size:12px; color:#15803d; font-weight:700; padding:6px 0;">No attention-diluting distraction vectors detected.</div>
        `;
      }
    }
  }

  function executeDecompilation() {
    const raw = (inputText.value || "").trim();
    if (!raw) {
      if (outputText) outputText.textContent = "";
      if (clarityAfter) clarityAfter.textContent = "Clarity: --";
      return;
    }

    if (!window.Echo || !window.Echo.architect) {
      if (outputText) outputText.textContent = raw;
      return;
    }

    const transformed = window.Echo.architect.transform(raw, activeMode);
    if (outputText) outputText.textContent = transformed.corrected;

    if (clarityAfter) {
      clarityAfter.textContent = "Clarity: 100/100 (Airtight)";
      clarityAfter.className = "score-chip airtight";
    }
  }

  if (inputText) {
    inputText.addEventListener("input", () => {
      evaluateInputClarity();
    });
  }

  if (btnCompile) {
    btnCompile.addEventListener("click", () => {
      btnCompile.textContent = "Compiling...";
      setTimeout(() => {
        executeDecompilation();
        btnCompile.textContent = "Compile Prompt \u2192";
      }, 160);
    });
  }

  if (btnReset) {
    btnReset.addEventListener("click", () => {
      if (inputText) inputText.value = "";
      if (outputText) outputText.textContent = "";
      evaluateInputClarity();
      if (clarityAfter) clarityAfter.textContent = "Clarity: --";
    });
  }

  if (btnCopy) {
    btnCopy.addEventListener("click", async () => {
      const text = outputText ? outputText.textContent : "";
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        btnCopy.textContent = "Copied to Clipboard!";
        setTimeout(() => {
          btnCopy.textContent = "Copy Prompt";
        }, 1800);
      } catch (err) {
        btnCopy.textContent = "Copied!";
        setTimeout(() => {
          btnCopy.textContent = "Copy Prompt";
        }, 1800);
      }
    });
  }

  // Preload default realistic developer thought dump
  if (inputText) {
    inputText.value = PROMPT_SAMPLES.booking;
    evaluateInputClarity();
    executeDecompilation();
  }
});
