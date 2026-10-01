var Echo = window.Echo = window.Echo || {};

Echo.ui = {
  host: null,
  pill: null,
  panel: null,
  input: null,
  styleEl: null,
  open: false,
  lastResult: null,
  previousText: null,

  CSS: `
.echo-host {
  position: fixed;
  z-index: 2147483647;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color-scheme: dark;
}
.echo-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px 4px 6px;
  border-radius: 9999px;
  background: #0b1120;
  color: #f8fafc;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(56, 189, 248, 0.25);
  user-select: none;
  transition: all 0.15s ease;
}
.echo-pill:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(56, 189, 248, 0.5);
  background: #0f172a;
}
.echo-pill-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #38bdf8, #0284c7);
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
}
.echo-score-text {
  font-weight: 700;
  letter-spacing: 0.02em;
}
.echo-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 9999px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}
.echo-pill-btn:hover {
  background: #38bdf8;
  color: #082f49;
}
.echo-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 5px;
  max-width: 320px;
}
.echo-word-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #0b1120;
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 9999px;
  padding: 3px 9px;
  font-size: 11px;
  color: #e2e8f0;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  transition: all 0.15s ease;
  user-select: none;
}
.echo-word-tag:hover {
  background: #1e293b;
  border-color: #38bdf8;
  box-shadow: 0 4px 12px rgba(56, 189, 248, 0.25);
  transform: translateY(-1px);
}
.echo-word-target {
  text-decoration: underline wavy #f59e0b 1.5px;
  font-weight: 600;
  color: #fbbf24;
}
.echo-word-arrow {
  color: #64748b;
  font-size: 10px;
}
.echo-word-replacement {
  color: #38bdf8;
  font-weight: 700;
}
.echo-panel {
  display: none;
  margin-top: 8px;
  width: 340px;
  max-height: 480px;
  overflow-y: auto;
  background: #0b1120;
  color: #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(56, 189, 248, 0.2);
  font-size: 13px;
  line-height: 1.45;
}
.echo-panel.echo-open {
  display: block;
}
.echo-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: #0f172a;
  border-top-left-radius: 14px;
  border-top-right-radius: 14px;
}
.echo-brand-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.echo-title {
  font-weight: 700;
  font-size: 13px;
  color: #f8fafc;
}
.echo-badge-sub {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(56, 189, 248, 0.12);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.25);
}
.echo-close-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1;
}
.echo-close-btn:hover {
  color: #f8fafc;
  background: rgba(255, 255, 255, 0.08);
}
.echo-action-banner {
  padding: 12px 14px;
  background: linear-gradient(180deg, rgba(56, 189, 248, 0.08), rgba(2, 132, 199, 0.04));
  border-bottom: 1px solid rgba(56, 189, 248, 0.15);
}
.echo-action-title {
  font-weight: 600;
  font-size: 12px;
  color: #38bdf8;
  margin-bottom: 4px;
}
.echo-action-desc {
  font-size: 11px;
  color: #94a3b8;
  margin-bottom: 10px;
  line-height: 1.4;
}
.echo-action-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}
.echo-btn-primary {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #38bdf8;
  color: #082f49;
  border: none;
  border-radius: 6px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}
.echo-btn-primary:hover {
  background: #7dd3fc;
}
.echo-btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.06);
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  padding: 7px 10px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}
.echo-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}
.echo-issue {
  padding: 11px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.echo-issue:last-child {
  border-bottom: none;
}
.echo-issue-head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.echo-issue-tag {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0.03em;
}
.echo-tag-error {
  background: rgba(248, 113, 113, 0.16);
  color: #f87171;
}
.echo-tag-warning {
  background: rgba(245, 158, 11, 0.16);
  color: #fbbf24;
}
.echo-tag-suggestion {
  background: rgba(56, 189, 248, 0.16);
  color: #38bdf8;
}
.echo-issue-name {
  font-weight: 600;
  color: #f1f5f9;
  font-size: 12px;
}
.echo-issue-msg {
  color: #cbd5e1;
  margin-top: 5px;
  font-size: 12px;
  line-height: 1.4;
}
.echo-issue-tip {
  color: #94a3b8;
  margin-top: 4px;
  font-size: 11px;
  line-height: 1.35;
}
.echo-fix-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  background: rgba(56, 189, 248, 0.1);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.28);
  border-radius: 5px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}
.echo-fix-btn:hover {
  background: #38bdf8;
  color: #082f49;
}
.echo-presets {
  padding: 10px 14px 12px;
  background: #090e1a;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
.echo-presets-title {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.04em;
  margin-bottom: 6px;
}
.echo-chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.echo-chip {
  background: rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  padding: 3px 8px;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}
.echo-chip:hover {
  background: rgba(56, 189, 248, 0.15);
  border-color: rgba(56, 189, 248, 0.4);
  color: #38bdf8;
}
.echo-empty-state {
  display: none;
  padding: 20px 14px;
  text-align: center;
}
.echo-empty-state.echo-show {
  display: block;
}
.echo-empty-title {
  font-weight: 700;
  color: #38bdf8;
  font-size: 13px;
  margin-bottom: 4px;
}
.echo-empty-desc {
  font-size: 11px;
  color: #94a3b8;
  line-height: 1.4;
}
.echo-footer {
  padding: 8px 14px;
  background: #070b14;
  color: #64748b;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  border-bottom-left-radius: 14px;
  border-bottom-right-radius: 14px;
}
`,

  mount(input) {
    if (Echo.ui.input === input && Echo.ui.host && document.contains(Echo.ui.host)) {
      Echo.ui.position();
      return;
    }
    Echo.ui.cleanup();
    Echo.ui.input = input;

    if (!Echo.ui.styleEl) {
      Echo.ui.styleEl = document.createElement("style");
      Echo.ui.styleEl.textContent = Echo.ui.CSS;
      document.head.appendChild(Echo.ui.styleEl);
    }

    Echo.ui.host = document.createElement("div");
    Echo.ui.host.className = "echo-host";
    Echo.ui.host.innerHTML = `
      <div class="echo-pill">
        <div class="echo-pill-brand">E</div>
        <span class="echo-score-text">--</span>
        <button class="echo-pill-btn" type="button">Auto-correct</button>
      </div>
      <div class="echo-strip" style="display:none;"></div>
      <div class="echo-panel">
        <div class="echo-panel-header">
          <div class="echo-brand-group">
            <span class="echo-title">Echo</span>
            <span class="echo-badge-sub">Prompt Coach</span>
          </div>
          <button class="echo-close-btn" type="button" aria-label="Close">x</button>
        </div>
        <div class="echo-action-banner">
          <div class="echo-action-title">Auto-Correct Prompt</div>
          <div class="echo-action-desc">Removes filler prefixes, strengthens action verbs, and sets clear AI output format.</div>
          <div class="echo-action-controls">
            <button class="echo-btn-primary" type="button">Auto-correct</button>
            <button class="echo-btn-secondary" type="button" style="display:none;">Undo</button>
          </div>
        </div>
        <div class="echo-empty-state">
          <div class="echo-empty-title">Prompt Well Formatted</div>
          <div class="echo-empty-desc">Your prompt contains direct instructions and clear context.</div>
        </div>
        <div class="echo-body"></div>
        <div class="echo-presets">
          <div class="echo-presets-title">Quick Output Formats</div>
          <div class="echo-chip-group"></div>
        </div>
        <div class="echo-footer">
          <span>Alt+E to auto-correct</span>
          <span>Local & Private</span>
        </div>
      </div>
    `;

    Echo.ui.pill = Echo.ui.host.querySelector(".echo-pill");
    Echo.ui.stripEl = Echo.ui.host.querySelector(".echo-strip");
    Echo.ui.panel = Echo.ui.host.querySelector(".echo-panel");
    Echo.ui.scoreTextEl = Echo.ui.host.querySelector(".echo-score-text");
    Echo.ui.pillBtn = Echo.ui.host.querySelector(".echo-pill-btn");
    Echo.ui.bodyEl = Echo.ui.host.querySelector(".echo-body");
    Echo.ui.emptyEl = Echo.ui.host.querySelector(".echo-empty-state");
    Echo.ui.actionBanner = Echo.ui.host.querySelector(".echo-action-banner");
    Echo.ui.actionBtn = Echo.ui.host.querySelector(".echo-btn-primary");
    Echo.ui.undoBtn = Echo.ui.host.querySelector(".echo-btn-secondary");
    Echo.ui.closeBtn = Echo.ui.host.querySelector(".echo-close-btn");
    Echo.ui.chipGroup = Echo.ui.host.querySelector(".echo-chip-group");

    // Populate quick format chips
    if (Echo.autocorrect && Echo.autocorrect.getQuickInserts) {
      const inserts = Echo.autocorrect.getQuickInserts();
      Echo.ui.chipGroup.innerHTML = "";
      for (const item of inserts) {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "echo-chip";
        chip.textContent = "+ " + item.label;
        chip.addEventListener("click", (e) => {
          e.stopPropagation();
          Echo.ui.appendConstraint(item.text);
        });
        Echo.ui.chipGroup.appendChild(chip);
      }
    }

    Echo.ui.pill.addEventListener("click", (e) => {
      // If clicked on the Auto-correct button inside pill
      if (e.target.closest(".echo-pill-btn")) {
        e.stopPropagation();
        Echo.ui.triggerAutocorrect();
        return;
      }
      e.stopPropagation();
      Echo.ui.toggle();
    });

    Echo.ui.closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      Echo.ui.close();
    });

    Echo.ui.actionBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      Echo.ui.triggerAutocorrect();
    });

    Echo.ui.undoBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      Echo.ui.triggerUndo();
    });

    document.addEventListener("click", Echo.ui.onDocClick);
    window.addEventListener("resize", Echo.ui.position);
    window.addEventListener("scroll", Echo.ui.position, true);

    document.body.appendChild(Echo.ui.host);
    Echo.ui.position();
  },

  cleanup() {
    if (Echo.ui.host && Echo.ui.host.isConnected) {
      Echo.ui.host.remove();
    }
    document.removeEventListener("click", Echo.ui.onDocClick);
    window.removeEventListener("resize", Echo.ui.position);
    window.removeEventListener("scroll", Echo.ui.position, true);
    Echo.ui.host = null;
    Echo.ui.pill = null;
    Echo.ui.panel = null;
    Echo.ui.input = null;
    Echo.ui.open = false;
    Echo.ui.lastResult = null;
    Echo.ui.previousText = null;
  },

  onDocClick(e) {
    if (Echo.ui.open && Echo.ui.host && !Echo.ui.host.contains(e.target)) {
      Echo.ui.close();
    }
  },

  toggle() {
    Echo.ui.open ? Echo.ui.close() : Echo.ui.openPanel();
  },

  openPanel() {
    Echo.ui.open = true;
    Echo.ui.panel.classList.add("echo-open");
    Echo.ui.position();
  },

  close() {
    Echo.ui.open = false;
    Echo.ui.panel.classList.remove("echo-open");
  },

  position() {
    if (!Echo.ui.host || !Echo.ui.input) return;
    const rect = Echo.ui.input.getBoundingClientRect();
    const hostWidth = 140;
    let left = rect.right - hostWidth - 8;
    left = Math.max(8, Math.min(left, window.innerWidth - hostWidth - 8));
    let top = rect.top - 42;
    if (top < 8) {
      top = rect.bottom + 8;
    }
    Echo.ui.host.style.left = left + "px";
    Echo.ui.host.style.top = top + "px";
  },

  triggerAutocorrect() {
    if (!Echo.ui.input) return;
    const current = Echo.detector.read(Echo.ui.input);
    if (!current || !current.trim()) return;

    const autocorrect = (Echo.autocorrect && Echo.autocorrect.correctFull)
      ? Echo.autocorrect.correctFull(current)
      : null;

    if (!autocorrect || !autocorrect.changed) return;

    Echo.ui.previousText = current;
    Echo.detector.write(Echo.ui.input, autocorrect.corrected);

    Echo.ui.actionBtn.textContent = "Corrected";
    Echo.ui.undoBtn.style.display = "inline-flex";
    setTimeout(() => {
      if (Echo.ui.actionBtn) Echo.ui.actionBtn.textContent = "Auto-correct";
    }, 2000);
  },

  triggerUndo() {
    if (!Echo.ui.input || Echo.ui.previousText == null) return;
    const restoreText = Echo.ui.previousText;
    Echo.ui.previousText = null;
    Echo.detector.write(Echo.ui.input, restoreText);
    Echo.ui.undoBtn.style.display = "none";
  },

  applyIndividualFix(fix) {
    if (!Echo.ui.input || !fix) return;
    Echo.ui.previousText = Echo.detector.read(Echo.ui.input);

    if (fix.append) {
      Echo.detector.append(Echo.ui.input, fix.append);
    } else if (fix.target && fix.replacement != null) {
      Echo.detector.replaceText(Echo.ui.input, fix.target, fix.replacement);
    }
    Echo.ui.undoBtn.style.display = "inline-flex";
  },

  appendConstraint(text) {
    if (!Echo.ui.input || !text) return;
    Echo.ui.previousText = Echo.detector.read(Echo.ui.input);
    Echo.detector.append(Echo.ui.input, text);
    Echo.ui.undoBtn.style.display = "inline-flex";
  },

  update(result) {
    if (!Echo.ui.pill) return;
    Echo.ui.lastResult = result;

    if (!result || result.empty) {
      Echo.ui.hide();
      return;
    }
    Echo.ui.show();

    const grade = Echo.analyzer.grade(result.score);
    Echo.ui.scoreTextEl.textContent = grade.label + " " + result.score;
    Echo.ui.scoreTextEl.style.color = grade.color;

    // Show/hide auto-correct action button on pill
    const canAutocorrect = result.autocorrect && result.autocorrect.changed;
    Echo.ui.pillBtn.style.display = canAutocorrect ? "inline-flex" : "none";

    // Auto-correct banner visibility in drawer
    Echo.ui.actionBanner.style.display = canAutocorrect ? "block" : "none";

    // Render inline squiggly word-fix tags
    if (Echo.ui.stripEl) {
      Echo.ui.stripEl.innerHTML = "";
      const wordIssues = (result.issues || []).filter(
        (i) => i.quickFix && i.quickFix.target && i.quickFix.replacement && !i.quickFix.append
      );
      if (wordIssues.length > 0 && !Echo.ui.open) {
        Echo.ui.stripEl.style.display = "flex";
        for (const wi of wordIssues.slice(0, 3)) {
          const tag = document.createElement("div");
          tag.className = "echo-word-tag";
          tag.title = "Click to replace '" + wi.quickFix.target + "' with '" + wi.quickFix.replacement.trim() + "'";
          tag.innerHTML = `
            <span class="echo-word-target">${Echo.detector.escapeHtml(wi.quickFix.target)}</span>
            <span class="echo-word-arrow">&rarr;</span>
            <span class="echo-word-replacement">${Echo.detector.escapeHtml(wi.quickFix.replacement.trim())}</span>
          `;
          tag.addEventListener("click", (e) => {
            e.stopPropagation();
            Echo.ui.applyIndividualFix(wi.quickFix);
          });
          Echo.ui.stripEl.appendChild(tag);
        }
      } else {
        Echo.ui.stripEl.style.display = "none";
      }
    }

    Echo.ui.bodyEl.innerHTML = "";
    const hasIssues = result.issues && result.issues.length > 0;

    if (hasIssues) {
      Echo.ui.emptyEl.classList.remove("echo-show");
      for (const issue of result.issues) {
        const el = document.createElement("div");
        el.className = "echo-issue";
        const tagClass =
          "echo-tag-" +
          (issue.severity === "error"
            ? "error"
            : issue.severity === "warning"
            ? "warning"
            : "suggestion");

        let fixHtml = "";
        if (issue.quickFix) {
          fixHtml = '<button class="echo-fix-btn" type="button">Apply fix: ' +
            Echo.detector.escapeHtml(issue.quickFix.label) +
            "</button>";
        }

        el.innerHTML =
          '<div class="echo-issue-head"><span class="echo-issue-tag ' +
          tagClass +
          '">' +
          issue.severity +
          '</span><span class="echo-issue-name">' +
          Echo.detector.escapeHtml(issue.ruleName) +
          "</span></div>" +
          '<div class="echo-issue-msg">' +
          Echo.detector.escapeHtml(issue.message) +
          "</div>" +
          '<div class="echo-issue-tip">' +
          Echo.detector.escapeHtml(issue.tip) +
          "</div>" +
          fixHtml;

        const fixBtn = el.querySelector(".echo-fix-btn");
        if (fixBtn) {
          fixBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            Echo.ui.applyIndividualFix(issue.quickFix);
          });
        }

        Echo.ui.bodyEl.appendChild(el);
      }
    } else {
      Echo.ui.emptyEl.classList.add("echo-show");
    }

    Echo.ui.position();
  },

  show() {
    Echo.ui.host.style.display = "block";
  },

  hide() {
    Echo.ui.host.style.display = "none";
    Echo.ui.open = false;
    Echo.ui.panel.classList.remove("echo-open");
  }
};
