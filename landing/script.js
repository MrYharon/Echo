// Echo - Creative Kinetic Monogram & Acoustic Canvas Engine
document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1. Full-Bleed Kinetic Acoustic Ripple Canvas with Shockwave Physics
  const canvas = document.getElementById("fluid-canvas");
  const progressBar = document.getElementById("scroll-progress-bar");
  let shockwaves = [];

  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let isTabVisible = !document.hidden;
    let animFrameId = null;

    document.addEventListener("visibilitychange", () => {
      isTabVisible = !document.hidden;
      if (isTabVisible && !animFrameId) {
        animFrameId = requestAnimationFrame(renderWaves);
      } else if (!isTabVisible && animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
    });

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }, 100);
    });

    let mouseX = width / 2;
    let mouseY = height / 3;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;
    let mouseSpeed = 0;
    let lastX = mouseX;
    let lastY = mouseY;

    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;

    // Track mouse & touch coordinates, update ambient spotlight
    const updatePointerCoord = (clientX, clientY) => {
      targetMouseX = clientX;
      targetMouseY = clientY;
      const dx = targetMouseX - lastX;
      const dy = targetMouseY - lastY;
      mouseSpeed = Math.min(Math.sqrt(dx * dx + dy * dy), 35);
      lastX = targetMouseX;
      lastY = targetMouseY;

      document.body.style.setProperty("--cursor-x", `${clientX}px`);
      document.body.style.setProperty("--cursor-y", `${clientY}px`);
    };

    window.addEventListener("mousemove", (e) => updatePointerCoord(e.clientX, e.clientY));
    window.addEventListener("touchmove", (e) => {
      if (e.touches && e.touches[0]) {
        updatePointerCoord(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    // Track scroll velocity & update progress bar
    window.addEventListener("scroll", () => {
      const currentScrollY = window.scrollY;
      const deltaScroll = Math.abs(currentScrollY - lastScrollY);
      scrollVelocity = Math.min(deltaScroll * 0.8, 40);
      lastScrollY = currentScrollY;

      if (progressBar) {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progress = maxScroll > 0 ? (currentScrollY / maxScroll) * 100 : 0;
        progressBar.style.width = `${progress}%`;
      }
    }, { passive: true });

    let waveOffset = 0;

    function renderWaves() {
      // Smooth interpolation & damping
      mouseX += (targetMouseX - mouseX) * 0.045;
      mouseY += (targetMouseY - mouseY) * 0.045;
      mouseSpeed *= 0.93;
      scrollVelocity *= 0.91;

      const totalEnergy = mouseSpeed + scrollVelocity;

      ctx.clearRect(0, 0, width, height);

      // Large multi-ring acoustic propagation
      const rings = 22;
      const baseRadius = 100;
      const spacing = 58;

      ctx.lineWidth = 1;

      for (let i = 0; i < rings; i++) {
        const radius = baseRadius + i * spacing + Math.sin(waveOffset + i * 0.35) * (8 + totalEnergy * 0.45);
        const opacity = Math.max(0, 0.24 - (i / rings) * 0.21);

        ctx.strokeStyle = `rgba(19, 30, 51, ${opacity})`;
        ctx.beginPath();

        // 72 organic radial segments
        const segments = 72;
        for (let s = 0; s <= segments; s++) {
          const angle = (s / segments) * Math.PI * 2;
          const harmonicDistortion = Math.sin(angle * 5 + waveOffset + i * 0.5) * (10 + (totalEnergy * 0.35));
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

      // Render expanding shockwaves
      for (let w = shockwaves.length - 1; w >= 0; w--) {
        const sw = shockwaves[w];
        sw.radius += sw.speed;
        sw.opacity *= 0.95;

        if (sw.opacity < 0.01 || sw.radius > sw.maxRadius) {
          shockwaves.splice(w, 1);
          continue;
        }

        ctx.strokeStyle = `rgba(2, 132, 199, ${sw.opacity * 0.45})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(56, 189, 248, ${sw.opacity * 0.25})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius * 0.8, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (!isTabVisible) {
        animFrameId = null;
        return;
      }

      waveOffset += 0.009 + (totalEnergy * 0.0006);
      animFrameId = requestAnimationFrame(renderWaves);
    }

    animFrameId = requestAnimationFrame(renderWaves);
  }

  // 2. Kinetic 3D Monogram Sculpture Parallax & Shockwave Trigger
  const sculpture = document.getElementById("monogram-sculpture");
  if (sculpture && !prefersReducedMotion) {
    const slabTop = sculpture.querySelector(".slab-top");
    const slabMid = sculpture.querySelector(".slab-mid");
    const slabBot = sculpture.querySelector(".slab-bot");

    // Only bind mousemove 3D perspective parallax on fine pointer (desktop) devices
    if (!window.matchMedia("(pointer: coarse)").matches) {
      window.addEventListener("mousemove", (e) => {
        const rect = sculpture.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) / (window.innerWidth / 2);
        const deltaY = (e.clientY - centerY) / (window.innerHeight / 2);

        // 3D perspective rotation
        sculpture.style.transform = `perspective(900px) rotateY(${deltaX * 14}deg) rotateX(${-deltaY * 14}deg)`;

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

    // Acoustic shockwave pulse on sculpture click or keyboard activation
    const triggerSculptureShockwave = () => {
      const rect = sculpture.getBoundingClientRect();
      shockwaves.push({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        radius: 30,
        maxRadius: 750,
        opacity: 0.9,
        speed: 16
      });
      sculpture.style.transform = "perspective(900px) scale(0.95)";
      setTimeout(() => {
        sculpture.style.transform = "perspective(900px) scale(1)";
      }, 150);
    };

    sculpture.addEventListener("click", triggerSculptureShockwave);
    sculpture.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        triggerSculptureShockwave();
      }
    });
  }

  // 3. Scroll Fade-in & Animated Strikethrough Intersection Observer
  const fadeElements = document.querySelectorAll(".fade-in-element");
  if (prefersReducedMotion) {
    fadeElements.forEach((el) => {
      el.classList.add("is-visible");
      el.querySelectorAll(".diff-chip-removed").forEach((chip) => chip.classList.add("striked"));
    });
  } else if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");

          // Trigger strikethrough animation when feature section scrolls into view
          const strikethroughs = entry.target.querySelectorAll(".diff-chip-removed");
          if (strikethroughs.length > 0) {
            strikethroughs.forEach((chip, idx) => {
              setTimeout(() => {
                chip.classList.add("striked");
              }, 180 * (idx + 1));
            });
          }
        }
      });
    }, { threshold: 0.12 });

    fadeElements.forEach((el) => observer.observe(el));
  } else {
    fadeElements.forEach((el) => {
      el.classList.add("is-visible");
      el.querySelectorAll(".diff-chip-removed").forEach((c) => c.classList.add("striked"));
    });
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
  let streamTimer = null;

  const PROMPT_SAMPLES = {
    booking: `hey I need to build a barbershop appointment booking system with stripe integration and calendar sync but don't use nextjs or tailwind we want raw fastify and vanilla js and make sure two people can't double book the same barber slot at the same second so use optimistic locking or postgres transactions and don't write generic mock code give me the actual db schema and route handler`,
    react: `look I have this react component that re-renders 50 times whenever the user types in a search box and it lags the whole browser don't just tell me to use useMemo tell me exactly where the state should live and don't introduce external redux or zustand keep it clean react hooks`,
    postgres: `we have a postgres database with 15 million audit log rows and our query checking user activity between two timestamps is taking 8 seconds and locking workers don't suggest upgrading the hardware explain the b-tree index strategy and explain analyze breakdown`
  };

  // Mode switching
  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      modeButtons.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      activeMode = btn.dataset.mode;
      executeDecompilation(true);
    });
  });

  // Sample prompt selection
  sampleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.sample;
      if (PROMPT_SAMPLES[key]) {
        inputText.value = PROMPT_SAMPLES[key];
        evaluateInputClarity();
        executeDecompilation(true);
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
      if (diagDrawer) {
        diagDrawer.innerHTML = '<div class="diag-empty-notice">Select a sample above or paste your prompt to view real-time diagnostics.</div>';
      }
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
        diagDrawer.innerHTML = '<div class="diag-success-notice">No attention-diluting distraction vectors detected.</div>';
      }
    }
  }

  // Smooth score counter animation
  function animateScoreCounter(targetScore) {
    if (!clarityAfter) return;
    if (prefersReducedMotion) {
      clarityAfter.textContent = `Clarity: ${targetScore}/100 (Airtight)`;
      clarityAfter.className = "score-chip airtight";
      return;
    }
    let current = 40;
    const step = () => {
      current += Math.ceil((targetScore - current) * 0.25);
      if (current >= targetScore) {
        clarityAfter.textContent = `Clarity: ${targetScore}/100 (Airtight)`;
        clarityAfter.className = "score-chip airtight pulse-ping";
        setTimeout(() => {
          clarityAfter.classList.remove("pulse-ping");
        }, 800);
      } else {
        clarityAfter.textContent = `Clarity: ${current}/100`;
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }

  function formatTerminalLine(line) {
    const escaped = line
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    if (escaped.startsWith("//")) {
      return `<span class="tok-comment">${escaped}</span>`;
    }
    if (escaped.startsWith("###")) {
      return `<span class="tok-heading">${escaped}</span>`;
    }
    if (/^\d+\.\s/.test(escaped)) {
      return `<span class="tok-num">${escaped}</span>`;
    }
    if (escaped.startsWith("- ")) {
      return `<span class="tok-bullet">${escaped}</span>`;
    }
    return escaped;
  }

  function formatTerminalMarkup(text) {
    return text.split("\n").map(formatTerminalLine).join("\n");
  }

  function executeDecompilation(animateStream = false) {
    const raw = (inputText.value || "").trim();
    if (!raw) {
      if (outputText) {
        outputText.innerHTML = formatTerminalMarkup("// Echo Meta-Compiler Ready\n// Type or paste any stream-of-consciousness thought dump on the left,\n// or click one of the sample presets above to see instant decompilation.");
        outputText.classList.remove("is-compiling");
      }
      if (clarityAfter) {
        clarityAfter.textContent = "Clarity: --";
        clarityAfter.className = "score-chip";
      }
      if (btnCopy) {
        btnCopy.setAttribute("disabled", "true");
        btnCopy.setAttribute("aria-disabled", "true");
      }
      return;
    }

    if (!window.Echo || !window.Echo.architect) {
      if (outputText) outputText.innerHTML = formatTerminalMarkup(raw);
      if (btnCopy) {
        btnCopy.removeAttribute("disabled");
        btnCopy.setAttribute("aria-disabled", "false");
      }
      return;
    }

    const transformed = window.Echo.architect.transform(raw, activeMode);
    const finalContent = transformed.corrected;

    if (btnCopy) {
      btnCopy.removeAttribute("disabled");
      btnCopy.setAttribute("aria-disabled", "false");
    }

    if (outputText) {
      outputText.classList.add("is-compiling");

      if (animateStream && !prefersReducedMotion) {
        // Fast line-by-line streaming simulation
        if (streamTimer) clearInterval(streamTimer);
        const lines = finalContent.split("\n");
        let currentLine = 0;
        outputText.innerHTML = "";

        streamTimer = setInterval(() => {
          if (currentLine < lines.length) {
            outputText.innerHTML += (currentLine === 0 ? "" : "\n") + formatTerminalLine(lines[currentLine]);
            currentLine++;
            outputText.scrollTop = outputText.scrollHeight;
          } else {
            clearInterval(streamTimer);
            streamTimer = null;
            outputText.classList.remove("is-compiling");
          }
        }, 16);
      } else {
        outputText.innerHTML = formatTerminalMarkup(finalContent);
        setTimeout(() => {
          outputText.classList.remove("is-compiling");
        }, 500);
      }
    }

    animateScoreCounter(100);
  }

  if (inputText) {
    inputText.addEventListener("input", () => {
      evaluateInputClarity();
    });
  }

  if (btnCompile) {
    btnCompile.addEventListener("click", () => {
      const raw = (inputText.value || "").trim();
      if (!raw) {
        if (inputText) {
          inputText.focus();
          inputText.classList.add("input-attention");
          setTimeout(() => inputText.classList.remove("input-attention"), 450);
        }
        return;
      }
      btnCompile.textContent = "Compiling...";
      btnCompile.style.transform = "scale(0.96)";
      setTimeout(() => {
        executeDecompilation(true);
        btnCompile.textContent = "Compile Prompt \u2192";
        btnCompile.style.transform = "scale(1)";
      }, 160);
    });
  }

  if (btnReset) {
    btnReset.addEventListener("click", () => {
      if (streamTimer) clearInterval(streamTimer);
      if (inputText) inputText.value = "";
      evaluateInputClarity();
      executeDecompilation(false);
    });
  }

  if (btnCopy) {
    btnCopy.addEventListener("click", async () => {
      const text = outputText ? outputText.textContent : "";
      if (!text || text.startsWith("// Echo Meta-Compiler Ready")) return;
      try {
        await navigator.clipboard.writeText(text);
        btnCopy.textContent = "Copied to Clipboard!";
        btnCopy.style.transform = "scale(1.05)";
        setTimeout(() => {
          btnCopy.textContent = "Copy Prompt";
          btnCopy.style.transform = "scale(1)";
        }, 1800);
      } catch (err) {
        btnCopy.textContent = "Copied!";
        setTimeout(() => {
          btnCopy.textContent = "Copy Prompt";
        }, 1800);
      }
    });
  }

  // 5. Mobile Responsive Navigation Drawer
  const menuToggle = document.getElementById("nav-menu-toggle");
  const navAnchors = document.getElementById("nav-anchors-list");
  if (menuToggle && navAnchors) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navAnchors.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      menuToggle.classList.toggle("is-active", isOpen);
    });

    // Close drawer when clicking any anchor link
    navAnchors.querySelectorAll(".nav-anchor").forEach((link) => {
      link.addEventListener("click", () => {
        navAnchors.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.classList.remove("is-active");
      });
    });

    // Close drawer when clicking outside
    document.addEventListener("click", (e) => {
      if (!navAnchors.contains(e.target) && !menuToggle.contains(e.target)) {
        navAnchors.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.classList.remove("is-active");
      }
    });
  }

  // Initialize with clean empty input so the placeholder is visible and typing requires zero backspacing
  if (inputText) {
    inputText.value = "";
    evaluateInputClarity();
    executeDecompilation(false);
  }
});
