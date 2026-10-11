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
  activePreviewData: null,
  currentMode: "structured",

  CSS: `
.echo-host {
  position: fixed;
  z-index: 2147483647;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color-scheme: dark;
  line-height: 1.45;
}

/* Floating Pill */
.echo-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 11px 5px 7px;
  border-radius: 6px;
  background: #0b1324;
  color: #fbfcfd;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 0 0 1px #1e293b;
  user-select: none;
  transition: all 0.15s ease;
}
.echo-pill:hover {
  background: #131e33;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5), 0 0 0 1px #0ea5e9;
}
.echo-pill-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}
.echo-pill-brand svg {
  width: 18px;
  height: 18px;
}
.echo-score-text {
  font-weight: 700;
  letter-spacing: -0.01em;
}
.echo-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(14, 165, 233, 0.12);
  color: #38bdf8;
  border: 1px solid rgba(14, 165, 233, 0.3);
  border-radius: 4px;
  padding: 2px 7px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}
.echo-pill-btn:hover {
  background: #0ea5e9;
  color: #0b1324;
}

/* Inline Word Fix Strip */
.echo-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 5px;
  max-width: 360px;
}
.echo-word-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #0b1324;
  border: 1px solid #1e293b;
  border-radius: 4px;
  padding: 3px 8px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 10.5px;
  color: #e2e8f0;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
  transition: all 0.15s ease;
  user-select: none;
}
.echo-word-tag:hover {
  background: #131e33;
  border-color: #0ea5e9;
  transform: translateY(-1px);
}
.echo-word-target {
  text-decoration: line-through;
  color: #f87171;
}
.echo-word-arrow {
  color: #64748b;
  font-size: 11px;
}
.echo-word-replacement {
  color: #38bdf8;
  font-weight: 700;
}

/* Toast */
.echo-toast {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) translateY(6px);
  opacity: 0;
  pointer-events: none;
  background: #0b1324;
  color: #f8fafc;
  border: 1px solid #0ea5e9;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
  border-radius: 6px;
  padding: 7px 14px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 100;
}
.echo-toast.echo-toast-show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
  pointer-events: auto;
}
.echo-toast-msg {
  color: #38bdf8;
}
.echo-toast-undo {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  border-radius: 3px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}
.echo-toast-undo:hover {
  background: #0ea5e9;
  color: #0b1324;
  border-color: #0ea5e9;
}

/* Panel */
.echo-panel {
  display: none;
  margin-top: 8px;
  width: 380px;
  max-height: 480px;
  overflow-y: auto;
  background: #0b1324;
  color: #e2e8f0;
  border-radius: 8px;
  border: 1px solid #1e293b;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7);
  font-size: 12.5px;
  line-height: 1.45;
  scrollbar-width: thin;
  scrollbar-color: #334155 #0b1324;
}
.echo-panel.echo-open {
  display: block;
}
.echo-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid #1e293b;
  background: #131e33;
}
.echo-brand-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.echo-title {
  font-weight: 800;
  font-size: 13px;
  letter-spacing: -0.01em;
  color: #ffffff;
}
.echo-badge-sub {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 2px 6px;
  border-radius: 3px;
  background: rgba(14, 165, 233, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(14, 165, 233, 0.3);
}
.echo-close-btn {
  background: transparent;
  border: none;
  color: #8a99b0;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 14px;
  line-height: 1;
}
.echo-close-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
}

/* Action Banner */
.echo-action-banner {
  padding: 12px 14px;
  background: #0f172a;
  border-bottom: 1px solid #1e293b;
}
.echo-action-title {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #38bdf8;
  margin-bottom: 4px;
}
.echo-action-desc {
  font-size: 11px;
  color: #8a99b0;
  margin-bottom: 8px;
  line-height: 1.4;
}
.echo-mode-pills {
  display: flex;
  gap: 5px;
  margin-bottom: 10px;
}
.echo-mode-pill {
  padding: 3px 8px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border-radius: 4px;
  border: 1px solid #1e293b;
  background: #0b1324;
  color: #8a99b0;
  cursor: pointer;
  transition: all 0.15s ease;
}
.echo-mode-pill:hover {
  color: #ffffff;
  border-color: #334155;
}
.echo-mode-pill.active {
  background: #131e33;
  color: #38bdf8;
  border-color: #0ea5e9;
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
  background: #0ea5e9;
  color: #0b1324;
  border: none;
  border-radius: 4px;
  padding: 7px 12px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: all 0.15s ease;
}
.echo-btn-primary:hover {
  background: #38bdf8;
}
.echo-btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.06);
  color: #cbd5e1;
  border: 1px solid #1e293b;
  border-radius: 4px;
  padding: 7px 10px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 10.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}
.echo-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

/* Issues List */
.echo-issue {
  padding: 10px 14px;
  border-bottom: 1px solid #1e293b;
  background: #0b1324;
  transition: background 0.15s ease;
}
.echo-issue:hover {
  background: #0f172a;
}
.echo-issue:last-child {
  border-bottom: none;
}
.echo-issue-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.echo-category-badge {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 1px 5px;
  border-radius: 3px;
}
.echo-cat-directiveness {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}
.echo-cat-clarity {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}
.echo-cat-context {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
}
.echo-cat-specifications {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}
.echo-cat-structure {
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
}
.echo-issue-name {
  font-weight: 700;
  color: #ffffff;
  font-size: 11.5px;
}
.echo-diff-box {
  background: #060911;
  border: 1px solid #1e293b;
  border-radius: 4px;
  padding: 6px 8px;
  margin: 5px 0 6px;
  font-size: 10.5px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}
.echo-diff-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.echo-diff-del {
  text-decoration: line-through;
  color: #f87171;
}
.echo-diff-arrow {
  color: #64748b;
  font-size: 11px;
}
.echo-diff-ins {
  color: #38bdf8;
  font-weight: 700;
}
.echo-diff-tag {
  color: #8a99b0;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}
.echo-diff-ins-append {
  color: #4ade80;
  font-weight: 600;
}
.echo-issue-rationale {
  font-size: 11px;
  color: #8a99b0;
  line-height: 1.4;
  margin-bottom: 6px;
}
.echo-issue-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.echo-fix-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(14, 165, 233, 0.12);
  color: #38bdf8;
  border: 1px solid rgba(14, 165, 233, 0.3);
  border-radius: 3px;
  padding: 3px 8px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.12s ease;
}
.echo-fix-btn:hover {
  background: #0ea5e9;
  color: #0b1324;
}

/* Preset Format Chips in Drawer */
.echo-presets {
  padding: 10px 14px 12px;
  background: #0f172a;
  border-top: 1px solid #1e293b;
}
.echo-presets-title {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #52617a;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
}
.echo-chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.echo-chip {
  background: rgba(255, 255, 255, 0.04);
  color: #cbd5e1;
  border: 1px solid #1e293b;
  border-radius: 3px;
  padding: 3px 7px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}
.echo-chip:hover {
  background: #131e33;
  border-color: #0ea5e9;
  color: #38bdf8;
}

/* Empty / Optimal State */
.echo-empty-state {
  display: none;
  padding: 24px 16px;
  text-align: center;
}
.echo-empty-state.echo-show {
  display: block;
}
.echo-empty-title {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-weight: 700;
  color: #4ade80;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 4px;
}
.echo-empty-desc {
  font-size: 11.5px;
  color: #8a99b0;
  line-height: 1.45;
}

/* Live Diff & Preview Inspection Container */
.echo-preview-view {
  display: none;
  padding: 12px 14px;
  background: #0b1324;
}
.echo-preview-view.echo-active {
  display: block;
}
.echo-preview-subhead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.echo-preview-title {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #38bdf8;
}
.echo-preview-badge {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 3px;
  background: rgba(14, 165, 233, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(14, 165, 233, 0.3);
}
.echo-diff-section {
  margin-bottom: 10px;
}
.echo-diff-label {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #52617a;
  margin-bottom: 4px;
}
.echo-diff-chips-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.diff-chip-removed {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  color: #b91c1c;
  background: #fee2e2;
  border: 1px solid #fecdd3;
  border-radius: 3px;
  padding: 2px 7px;
  text-decoration: line-through;
}
.diff-chip-promoted {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  color: #026aa2;
  background: #e0f2fe;
  border: 1px solid rgba(2, 106, 162, 0.3);
  border-radius: 3px;
  padding: 2px 7px;
  font-weight: 700;
}
.echo-terminal-box {
  background: #060911;
  border: 1px solid #1e293b;
  border-radius: 4px;
  padding: 8px 10px;
  max-height: 140px;
  overflow-y: auto;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  line-height: 1.5;
  color: #fbfcfd;
  white-space: pre-wrap;
  word-break: break-word;
  margin-bottom: 10px;
  position: relative;
  overflow: hidden;
}
@keyframes echoScanlineSweep {
  0% { transform: translateY(-100%); opacity: 0; }
  35% { opacity: 0.8; }
  100% { transform: translateY(220%); opacity: 0; }
}
.echo-terminal-box::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #38bdf8, #0ea5e9, transparent);
  box-shadow: 0 0 10px #38bdf8;
  opacity: 0.7;
  animation: echoScanlineSweep 2s ease-in-out infinite;
  pointer-events: none;
}
.echo-preview-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.echo-btn-apply {
  flex: 1;
  background: #0ea5e9;
  color: #0b1324;
  border: none;
  border-radius: 4px;
  padding: 7px 12px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.12s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.echo-btn-apply:hover {
  background: #38bdf8;
}
.echo-btn-discard {
  background: rgba(255, 255, 255, 0.06);
  color: #cbd5e1;
  border: 1px solid #1e293b;
  border-radius: 4px;
  padding: 7px 10px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 10.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.12s ease;
}
.echo-btn-discard:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}
.echo-btn-copy-contract {
  background: rgba(255, 255, 255, 0.06);
  color: #cbd5e1;
  border: 1px solid #1e293b;
  border-radius: 4px;
  padding: 7px 9px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 10.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.12s ease;
}
.echo-btn-copy-contract:hover {
  background: #131e33;
  color: #38bdf8;
  border-color: #0ea5e9;
}

/* Footer */
.echo-footer {
  padding: 8px 14px;
  background: #070b14;
  color: #52617a;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #1e293b;
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
        <div class="echo-pill-brand">
          <svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="128" height="128" rx="8" fill="#131e33" />
            <path d="M 24 24 L 104 24 L 104 42 L 50 42 L 50 48 L 24 48 Z" fill="#0ea5e9" />
            <rect x="24" y="58" width="58" height="15" fill="#fbfcfd" />
            <path d="M 24 86 L 50 86 L 50 92 L 104 92 L 104 110 L 24 110 Z" fill="#0ea5e9" />
          </svg>
        </div>
        <span class="echo-score-text">--</span>
        <button class="echo-pill-btn" type="button">Compile</button>
      </div>

      <div class="echo-strip" style="display:none;"></div>

      <div class="echo-panel">
        <div class="echo-panel-header">
          <div class="echo-brand-group">
            <svg width="18" height="18" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="128" height="128" rx="8" fill="#131e33" />
              <path d="M 24 24 L 104 24 L 104 42 L 50 42 L 50 48 L 24 48 Z" fill="#0ea5e9" />
              <rect x="24" y="58" width="58" height="15" fill="#fbfcfd" />
              <path d="M 24 86 L 50 86 L 50 92 L 104 92 L 104 110 L 24 110 Z" fill="#0ea5e9" />
            </svg>
            <span class="echo-title">Echo</span>
            <span class="echo-badge-sub">Prompt Compiler</span>
          </div>
          <button class="echo-close-btn" type="button" aria-label="Close">&times;</button>
        </div>

        <!-- Mode Bar -->
        <div class="echo-action-banner">
          <div class="echo-action-title">Prompt Architect</div>
          <div class="echo-action-desc">Decompile conversational streams into structured, airtight prompt contracts.</div>
          <div class="echo-mode-pills">
            <button class="echo-mode-pill active" data-mode="structured" type="button">Structured</button>
            <button class="echo-mode-pill" data-mode="concise" type="button">Concise</button>
            <button class="echo-mode-pill" data-mode="deep_reasoning" type="button">Deep</button>
          </div>
          <div class="echo-action-controls">
            <button class="echo-btn-primary" type="button">Compile (Alt+E)</button>
            <button class="echo-btn-secondary" type="button" style="display:none;">Undo</button>
          </div>
        </div>

        <!-- Live Diff & Preview Inspection Container -->
        <div class="echo-preview-view">
          <div class="echo-preview-subhead">
            <span class="echo-preview-title">Prompt Contract Preview</span>
            <span class="echo-preview-badge">Preview First</span>
          </div>

          <div class="echo-diff-section echo-diff-fluff-wrap" style="display:none;">
            <div class="echo-diff-label">Attention Filter (Purged Tokens)</div>
            <div class="echo-diff-chips-wrap echo-diff-fluff-list"></div>
          </div>

          <div class="echo-diff-section echo-diff-bounds-wrap" style="display:none;">
            <div class="echo-diff-label">Enforced Bounds (Hoisted)</div>
            <div class="echo-diff-chips-wrap echo-diff-bounds-list"></div>
          </div>

          <div class="echo-diff-label">Synthesized Contract</div>
          <div class="echo-terminal-box echo-preview-contract-text"></div>

          <div class="echo-preview-actions">
            <button class="echo-btn-apply" type="button">Apply Contract (Enter)</button>
            <button class="echo-btn-discard" type="button">Discard (Esc)</button>
            <button class="echo-btn-copy-contract" type="button">Copy</button>
          </div>
        </div>

        <!-- Standard Feedback / Issues View -->
        <div class="echo-standard-view">
          <div class="echo-empty-state">
            <div class="echo-empty-title">Airtight Structure</div>
            <div class="echo-empty-desc">Your prompt contains direct instructions, clean constraints, and high clarity.</div>
          </div>
          <div class="echo-body"></div>
          <div class="echo-presets">
            <div class="echo-presets-title">Quick Output Formats</div>
            <div class="echo-chip-group"></div>
          </div>
        </div>

        <div class="echo-footer">
          <span>Alt+E to inspect diff</span>
          <span>Local &bull; 100% Private</span>
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

    // Preview View elements
    Echo.ui.previewView = Echo.ui.host.querySelector(".echo-preview-view");
    Echo.ui.standardView = Echo.ui.host.querySelector(".echo-standard-view");
    Echo.ui.previewContractText = Echo.ui.host.querySelector(".echo-preview-contract-text");
    Echo.ui.btnApplyPreview = Echo.ui.host.querySelector(".echo-btn-apply");
    Echo.ui.btnDiscardPreview = Echo.ui.host.querySelector(".echo-btn-discard");
    Echo.ui.btnCopyContract = Echo.ui.host.querySelector(".echo-btn-copy-contract");
    Echo.ui.diffFluffWrap = Echo.ui.host.querySelector(".echo-diff-fluff-wrap");
    Echo.ui.diffFluffList = Echo.ui.host.querySelector(".echo-diff-fluff-list");
    Echo.ui.diffBoundsWrap = Echo.ui.host.querySelector(".echo-diff-bounds-wrap");
    Echo.ui.diffBoundsList = Echo.ui.host.querySelector(".echo-diff-bounds-list");

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

    // Mode pills
    Echo.ui.currentMode = "structured";
    const modePills = Echo.ui.host.querySelectorAll(".echo-mode-pill");
    modePills.forEach((pill) => {
      pill.addEventListener("click", (e) => {
        e.stopPropagation();
        modePills.forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
        Echo.ui.currentMode = pill.dataset.mode;
        // If preview is open, re-compile preview immediately
        if (Echo.ui.previewView && Echo.ui.previewView.classList.contains("echo-active")) {
          Echo.ui.triggerAutocorrect();
        }
      });
    });

    Echo.ui.pill.addEventListener("click", (e) => {
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

    // Preview Action Buttons
    if (Echo.ui.btnApplyPreview) {
      Echo.ui.btnApplyPreview.addEventListener("click", (e) => {
        e.stopPropagation();
        Echo.ui.applyActivePreview();
      });
    }

    if (Echo.ui.btnDiscardPreview) {
      Echo.ui.btnDiscardPreview.addEventListener("click", (e) => {
        e.stopPropagation();
        Echo.ui.discardActivePreview();
      });
    }

    if (Echo.ui.btnCopyContract) {
      Echo.ui.btnCopyContract.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (Echo.ui.activePreviewData && Echo.ui.activePreviewData.corrected) {
          await navigator.clipboard.writeText(Echo.ui.activePreviewData.corrected);
          Echo.ui.btnCopyContract.textContent = "Copied";
          setTimeout(() => {
            if (Echo.ui.btnCopyContract) Echo.ui.btnCopyContract.textContent = "Copy";
          }, 1400);
        }
      });
    }

    document.addEventListener("click", Echo.ui.onDocClick);
    window.addEventListener("resize", Echo.ui.position);
    window.addEventListener("scroll", Echo.ui.position, true);
    window.addEventListener("keydown", Echo.ui.onGlobalKeyDown, true);

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
    window.removeEventListener("keydown", Echo.ui.onGlobalKeyDown, true);
    Echo.ui.host = null;
    Echo.ui.pill = null;
    Echo.ui.panel = null;
    Echo.ui.input = null;
    Echo.ui.open = false;
    Echo.ui.lastResult = null;
    Echo.ui.previousText = null;
    Echo.ui.activePreviewData = null;
  },

  onDocClick(e) {
    if (Echo.ui.open && Echo.ui.host && !Echo.ui.host.contains(e.target)) {
      Echo.ui.close();
    }
  },

  onGlobalKeyDown(e) {
    if (!Echo.ui.open || !Echo.ui.previewView || !Echo.ui.previewView.classList.contains("echo-active")) {
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      Echo.ui.applyActivePreview();
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      Echo.ui.discardActivePreview();
    } else if (e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      Echo.ui.cycleMode();
    } else if (e.key === "1") {
      e.preventDefault();
      Echo.ui.setMode("structured");
    } else if (e.key === "2") {
      e.preventDefault();
      Echo.ui.setMode("concise");
    } else if (e.key === "3") {
      e.preventDefault();
      Echo.ui.setMode("deep_reasoning");
    }
  },

  cycleMode() {
    const modes = ["structured", "concise", "deep_reasoning"];
    const idx = modes.indexOf(Echo.ui.currentMode || "structured");
    const next = modes[(idx + 1) % modes.length];
    Echo.ui.setMode(next);
  },

  setMode(mode) {
    Echo.ui.currentMode = mode;
    const modePills = Echo.ui.host.querySelectorAll(".echo-mode-pill");
    modePills.forEach((p) => {
      p.classList.toggle("active", p.dataset.mode === mode);
    });
    Echo.ui.triggerAutocorrect();
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
    Echo.ui.hideDiffPreview();
  },

  position() {
    if (!Echo.ui.host || !Echo.ui.input) return;
    const rect = Echo.ui.input.getBoundingClientRect();
    const hostWidth = 140;
    let left = rect.right - hostWidth - 8;
    left = Math.max(8, Math.min(left, window.innerWidth - hostWidth - 8));
    let top = rect.top - 44;
    if (top < 8) {
      top = rect.bottom + 8;
    }
    Echo.ui.host.style.left = left + "px";
    Echo.ui.host.style.top = top + "px";
  },

  showToast(message, hasUndo) {
    if (!Echo.ui.host) return;
    let toast = Echo.ui.host.querySelector(".echo-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "echo-toast";
      Echo.ui.host.appendChild(toast);
    }
    toast.innerHTML = `
      <span class="echo-toast-msg">${Echo.detector.escapeHtml(message)}</span>
      ${hasUndo ? '<button class="echo-toast-undo" type="button">Undo</button>' : ''}
    `;
    if (hasUndo) {
      const undoBtn = toast.querySelector(".echo-toast-undo");
      if (undoBtn) {
        undoBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          Echo.ui.triggerUndo();
          Echo.ui.hideToast();
        });
      }
    }
    toast.classList.add("echo-toast-show");
    clearTimeout(Echo.ui.toastTimer);
    Echo.ui.toastTimer = setTimeout(() => {
      Echo.ui.hideToast();
    }, 5000);
  },

  hideToast() {
    const toast = Echo.ui.host ? Echo.ui.host.querySelector(".echo-toast") : null;
    if (toast) {
      toast.classList.remove("echo-toast-show");
    }
  },

  recordStat(key) {
    try {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(["echoStats"], (res) => {
          const stats = (res && res.echoStats) || { promptsEnhanced: 0, fixesApplied: 0 };
          stats[key] = (stats[key] || 0) + 1;
          chrome.storage.local.set({ echoStats: stats });
        });
      }
    } catch (e) {}
  },

  /* Preview First Diff Inspection Execution */
  async triggerAutocorrect() {
    if (!Echo.ui.input) return;
    const current = Echo.detector.read(Echo.ui.input);
    if (!current || !current.trim()) return;

    if (Echo.ui.actionBtn) {
      Echo.ui.actionBtn.textContent = "Compiling...";
      Echo.ui.actionBtn.disabled = true;
    }
    if (Echo.ui.pillBtn) {
      Echo.ui.pillBtn.textContent = "Compiling...";
    }

    try {
      const mode = Echo.ui.currentMode || "structured";
      let autocorrect = null;
      if (Echo.autocorrect && Echo.autocorrect.correctWithAI) {
        autocorrect = await Echo.autocorrect.correctWithAI(current, mode);
      } else if (Echo.autocorrect && Echo.autocorrect.correctFull) {
        autocorrect = Echo.autocorrect.correctFull(current, mode);
      }

      if (!autocorrect) return;

      // Extract semantic changes
      Echo.ui.activePreviewData = {
        original: current,
        corrected: autocorrect.corrected,
        changes: autocorrect.changes || [],
        changed: autocorrect.changed
      };

      Echo.ui.showDiffPreview(Echo.ui.activePreviewData);
    } catch (err) {
      console.warn("Echo compile error:", err);
    } finally {
      if (Echo.ui.actionBtn) {
        Echo.ui.actionBtn.textContent = "Compile (Alt+E)";
        Echo.ui.actionBtn.disabled = false;
      }
      if (Echo.ui.pillBtn) {
        Echo.ui.pillBtn.textContent = "Compile";
      }
    }
  },

  showDiffPreview(data) {
    Echo.ui.openPanel();
    if (!Echo.ui.previewView || !Echo.ui.standardView) return;

    Echo.ui.previewView.classList.add("echo-active");
    Echo.ui.standardView.style.display = "none";

    // Set synthesized contract text
    Echo.ui.previewContractText.textContent = data.corrected;

    // Attention Filter: Purged tokens
    const fluffChanges = (data.changes || []).filter((c) => c.type === "filler" || c.removed);
    if (fluffChanges.length > 0) {
      Echo.ui.diffFluffWrap.style.display = "block";
      Echo.ui.diffFluffList.innerHTML = "";
      for (const fc of fluffChanges) {
        const chip = document.createElement("span");
        chip.className = "diff-chip-removed";
        chip.textContent = "\u00d7 " + (fc.removed || fc.original || "filler token");
        Echo.ui.diffFluffList.appendChild(chip);
      }
    } else {
      Echo.ui.diffFluffWrap.style.display = "none";
    }

    // Enforced Bounds: Hoisted negative rules or constraints
    const boundChanges = (data.changes || []).filter((c) => c.type === "constraint" || c.rule);
    if (boundChanges.length > 0) {
      Echo.ui.diffBoundsWrap.style.display = "block";
      Echo.ui.diffBoundsList.innerHTML = "";
      for (const bc of boundChanges) {
        const chip = document.createElement("span");
        chip.className = "diff-chip-promoted";
        chip.textContent = "\u2713 " + (bc.rule || bc.replacement || bc.title);
        Echo.ui.diffBoundsList.appendChild(chip);
      }
    } else {
      Echo.ui.diffBoundsWrap.style.display = "none";
    }

    Echo.ui.position();
  },

  hideDiffPreview() {
    if (!Echo.ui.previewView || !Echo.ui.standardView) return;
    Echo.ui.previewView.classList.remove("echo-active");
    Echo.ui.standardView.style.display = "block";
  },

  applyActivePreview() {
    if (!Echo.ui.activePreviewData || !Echo.ui.input) return;
    const { original, corrected, changes } = Echo.ui.activePreviewData;

    Echo.ui.previousText = original;
    Echo.detector.write(Echo.ui.input, corrected);

    if (Echo.ui.undoBtn) Echo.ui.undoBtn.style.display = "inline-flex";
    Echo.ui.showToast("Prompt compiled \u2014 original backed up", true);
    Echo.ui.recordStat("promptsEnhanced");

    if (Echo.db && Echo.db.addHistory) {
      const initialScore = Echo.ui.lastResult ? Echo.ui.lastResult.score : 0;
      const finalScore = Echo.analyzer ? Echo.analyzer.analyze(corrected).score : 100;
      Echo.db.addHistory({
        originalText: original,
        correctedText: corrected,
        initialScore: initialScore,
        finalScore: finalScore,
        platform: location.hostname || "web",
        changes: changes || []
      }).catch(() => {});
    }

    Echo.ui.close();
  },

  discardActivePreview() {
    Echo.ui.activePreviewData = null;
    Echo.ui.hideDiffPreview();
    Echo.ui.close();
  },

  triggerUndo() {
    if (!Echo.ui.input || Echo.ui.previousText == null) return;
    const restoreText = Echo.ui.previousText;
    Echo.ui.previousText = null;
    Echo.detector.write(Echo.ui.input, restoreText);
    Echo.ui.undoBtn.style.display = "none";
    Echo.ui.showToast("Reverted original draft", false);
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
    Echo.ui.showToast("Fix applied", true);
    Echo.ui.recordStat("fixesApplied");
  },

  appendConstraint(text) {
    if (!Echo.ui.input || !text) return;
    Echo.ui.previousText = Echo.detector.read(Echo.ui.input);
    Echo.detector.append(Echo.ui.input, text);
    Echo.ui.undoBtn.style.display = "inline-flex";
    Echo.ui.showToast("Output format added", true);
    Echo.ui.recordStat("fixesApplied");
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

    const canAutocorrect = result.autocorrect && result.autocorrect.changed;
    Echo.ui.pillBtn.style.display = canAutocorrect ? "inline-flex" : "none";
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

        const cat = (issue.category || "QUALITY").toLowerCase();
        const catClass = "echo-cat-" + cat;

        let diffHtml = "";
        if (issue.quickFix) {
          if (issue.quickFix.target && issue.quickFix.replacement != null) {
            diffHtml = `
              <div class="echo-diff-box">
                <div class="echo-diff-row">
                  <span class="echo-diff-del">${Echo.detector.escapeHtml(issue.quickFix.target)}</span>
                  <span class="echo-diff-arrow">&rarr;</span>
                  <span class="echo-diff-ins">${Echo.detector.escapeHtml(issue.quickFix.replacement.trim())}</span>
                </div>
              </div>
            `;
          } else if (issue.quickFix.append) {
            diffHtml = `
              <div class="echo-diff-box">
                <div class="echo-diff-row">
                  <span class="echo-diff-tag">+ Add Constraint:</span>
                  <span class="echo-diff-ins-append">${Echo.detector.escapeHtml(issue.quickFix.append)}</span>
                </div>
              </div>
            `;
          }
        }

        let fixActionHtml = "";
        if (issue.quickFix) {
          fixActionHtml = `
            <div class="echo-issue-footer">
              <button class="echo-fix-btn" type="button">Apply suggestion</button>
            </div>
          `;
        }

        el.innerHTML = `
          <div class="echo-issue-head">
            <span class="echo-category-badge ${catClass}">${Echo.detector.escapeHtml(issue.category || "QUALITY")}</span>
            <span class="echo-issue-name">${Echo.detector.escapeHtml(issue.ruleName)}</span>
          </div>
          ${diffHtml}
          <div class="echo-issue-rationale">${Echo.detector.escapeHtml(issue.rationale || issue.tip || issue.message)}</div>
          ${fixActionHtml}
        `;

        const fixBtn = el.querySelector(".echo-fix-btn");
        if (fixBtn && issue.quickFix) {
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
