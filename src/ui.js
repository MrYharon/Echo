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

  // Dragging state
  userDragged: false,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  panelStartX: 0,
  panelStartY: 0,

  CSS: `
.echo-host {
  position: fixed;
  z-index: 2147483647;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color-scheme: light;
  line-height: 1.45;
}

.echo-host.echo-is-dragging {
  user-select: none;
  cursor: grabbing !important;
}

/* Floating Pill */
.echo-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px 5px 8px;
  border-radius: 8px;
  background: #ffffff;
  color: #0b1324;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(11, 19, 36, 0.08), 0 1px 3px rgba(11, 19, 36, 0.04), 0 0 0 1px #e2e8f0;
  user-select: none;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}
.echo-pill:hover {
  background: #f8fafc;
  box-shadow: 0 6px 20px rgba(2, 132, 199, 0.14), 0 0 0 1px #0284c7;
  transform: translateY(-1px);
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
  border-radius: 4px;
}
.echo-pill.echo-state-ready {
  border-left: 3px solid #15803d;
}
.echo-pill.echo-state-vague {
  border-left: 3px solid #f59e0b;
  animation: echoPulseAmber 2.5s infinite;
}
.echo-pill.echo-state-decompile {
  border-left: 3px solid #0284c7;
}
@keyframes echoPulseAmber {
  0%, 100% { box-shadow: 0 4px 16px rgba(11, 19, 36, 0.08), 0 0 0 1px #e2e8f0; }
  50% { box-shadow: 0 4px 16px rgba(245, 158, 11, 0.2), 0 0 0 1px rgba(245, 158, 11, 0.6); }
}
.echo-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 2px;
  flex-shrink: 0;
}
.echo-status-dot.ready { background: #15803d; }
.echo-status-dot.vague { background: #f59e0b; }
.echo-status-dot.decompile { background: #0284c7; }

.echo-score-text {
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #0b1324;
}
.echo-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #e0f2fe;
  color: #0284c7;
  border: 1px solid rgba(2, 132, 199, 0.25);
  border-radius: 5px;
  padding: 2px 8px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}
.echo-pill-btn:hover {
  background: #0284c7;
  color: #ffffff;
  border-color: #0284c7;
}
.echo-pill-btn.vague-btn {
  background: #fef3c7;
  color: #b45309;
  border-color: #fde68a;
}
.echo-pill-btn.vague-btn:hover {
  background: #f59e0b;
  color: #ffffff;
  border-color: #f59e0b;
}

/* Toast Notification */
.echo-toast {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) translateY(6px);
  opacity: 0;
  pointer-events: none;
  background: #ffffff;
  color: #0b1324;
  border: 1px solid #0284c7;
  box-shadow: 0 12px 32px rgba(11, 19, 36, 0.16);
  border-radius: 8px;
  padding: 8px 14px;
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
  color: #0284c7;
  font-weight: 700;
}
.echo-toast-undo {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #1e293b;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}
.echo-toast-undo:hover {
  background: #0284c7;
  color: #ffffff;
  border-color: #0284c7;
}

/* Panel Modal */
.echo-panel {
  display: none;
  margin-top: 8px;
  width: 380px;
  max-height: 480px;
  overflow-y: auto;
  background: #ffffff;
  color: #0b1324;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 20px 48px rgba(11, 19, 36, 0.14), 0 2px 8px rgba(11, 19, 36, 0.04);
  font-size: 12.5px;
  line-height: 1.45;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f8fafc;
}
.echo-panel.echo-open {
  display: block;
}

/* Draggable Header */
.echo-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  cursor: grab;
  user-select: none;
}
.echo-panel-header:active {
  cursor: grabbing;
}
.echo-brand-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.echo-title {
  font-weight: 800;
  font-size: 13.5px;
  letter-spacing: -0.02em;
  color: #0b1324;
}
.echo-badge-sub {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 2px 6px;
  border-radius: 4px;
  background: #e0f2fe;
  color: #0284c7;
  border: 1px solid rgba(2, 132, 199, 0.2);
}
.echo-header-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}
.echo-drag-hint {
  display: inline-flex;
  align-items: center;
  color: #94a3b8;
  font-size: 13px;
  letter-spacing: -1px;
  cursor: grab;
  padding: 2px 4px;
  border-radius: 4px;
  transition: color 0.15s ease;
}
.echo-drag-hint:hover {
  color: #0284c7;
}
.echo-close-btn {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 15px;
  line-height: 1;
  transition: all 0.15s ease;
}
.echo-close-btn:hover {
  color: #0b1324;
  background: #e2e8f0;
}

/* Mode Bar (Docked under Header) */
.echo-mode-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: #ffffff;
  border-bottom: 1px solid #f1f5f9;
}
.echo-mode-pills {
  display: flex;
  gap: 4px;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 6px;
  width: 100%;
}
.echo-mode-pill {
  flex: 1;
  padding: 4px 8px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  text-align: center;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: #52617a;
  cursor: pointer;
  transition: all 0.15s ease;
}
.echo-mode-pill:hover {
  color: #0b1324;
}
.echo-mode-pill.active {
  background: #ffffff;
  color: #0284c7;
  font-weight: 800;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* Standard Issues / Review View */
.echo-standard-view {
  background: #ffffff;
}
.echo-issue {
  padding: 10px 14px;
  border-bottom: 1px solid #f1f5f9;
  background: #ffffff;
  transition: background 0.15s ease;
}
.echo-issue:hover {
  background: #fafcff;
}
.echo-issue-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
}
.echo-category-badge {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 2px 6px;
  border-radius: 4px;
}
.echo-cat-directiveness {
  background: #fee2e2;
  color: #b91c1c;
}
.echo-cat-clarity {
  background: #fef3c7;
  color: #b45309;
}
.echo-cat-context {
  background: #e0f2fe;
  color: #0284c7;
}
.echo-cat-specifications {
  background: #dcfce7;
  color: #15803d;
}
.echo-cat-structure {
  background: #f3e8ff;
  color: #7e22ce;
}
.echo-issue-name {
  font-weight: 700;
  color: #0b1324;
  font-size: 12px;
}
.echo-diff-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 6px 10px;
  margin: 6px 0;
  font-size: 11px;
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
  color: #dc2626;
}
.echo-diff-arrow {
  color: #94a3b8;
  font-size: 11px;
}
.echo-diff-ins {
  color: #0284c7;
  font-weight: 700;
}
.echo-diff-tag {
  color: #52617a;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}
.echo-diff-ins-append {
  color: #15803d;
  font-weight: 600;
}
.echo-issue-rationale {
  font-size: 11px;
  color: #52617a;
  line-height: 1.45;
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
  background: #e0f2fe;
  color: #0284c7;
  border: 1px solid rgba(2, 132, 199, 0.25);
  border-radius: 4px;
  padding: 3px 8px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.12s ease;
}
.echo-fix-btn:hover {
  background: #0284c7;
  color: #ffffff;
}

/* Primary Action Bar in Review Mode */
.echo-review-action-row {
  padding: 10px 14px;
  background: #ffffff;
  border-top: 1px solid #f1f5f9;
  display: flex;
  gap: 8px;
}
.echo-btn-compile-main {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #0284c7;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 8px 14px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}
.echo-btn-compile-main:hover {
  background: #0369a1;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.2);
}
.echo-btn-undo-main {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  color: #52617a;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 8px 12px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}
.echo-btn-undo-main:hover {
  background: #f8fafc;
  color: #0b1324;
}

/* Preset Format Chips */
.echo-presets {
  padding: 10px 14px 12px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
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
  background: #ffffff;
  color: #52617a;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 3px 8px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}
.echo-chip:hover {
  background: #e0f2fe;
  border-color: #0284c7;
  color: #0284c7;
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
  color: #15803d;
  font-size: 12.5px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 4px;
}
.echo-empty-desc {
  font-size: 12px;
  color: #52617a;
  line-height: 1.5;
}

/* Live Diff & Contract Preview Inspection View */
.echo-preview-view {
  display: none;
  padding: 12px 14px;
  background: #ffffff;
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
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #0284c7;
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
  color: #991b1b;
  background: #fee2e2;
  border: 1px solid #fecdd3;
  border-radius: 4px;
  padding: 2px 7px;
  text-decoration: line-through;
}
.diff-chip-promoted {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  color: #0369a1;
  background: #e0f2fe;
  border: 1px solid rgba(2, 132, 199, 0.25);
  border-radius: 4px;
  padding: 2px 7px;
  font-weight: 700;
}

/* Contract Code Box */
.echo-terminal-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 9px 12px;
  max-height: 150px;
  overflow-y: auto;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11.5px;
  line-height: 1.5;
  color: #0b1324;
  white-space: pre-wrap;
  word-break: break-word;
  margin-bottom: 10px;
  position: relative;
}
.echo-terminal-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #0284c7, #38bdf8, #0ea5e9);
}

.echo-preview-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.echo-btn-apply {
  flex: 1;
  background: #0284c7;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.echo-btn-apply:hover {
  background: #0369a1;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
}
.echo-btn-discard {
  background: #ffffff;
  color: #52617a;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 8px 10px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}
.echo-btn-discard:hover {
  background: #f8fafc;
  color: #0b1324;
  border-color: #cbd5e1;
}
.echo-btn-copy-contract {
  background: #ffffff;
  color: #52617a;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 8px 10px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}
.echo-btn-copy-contract:hover {
  background: #e0f2fe;
  color: #0284c7;
  border-color: #0284c7;
}

/* Footer */
.echo-footer {
  padding: 8px 14px;
  background: #f8fafc;
  color: #64748b;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #e2e8f0;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
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
            <rect width="128" height="128" rx="28" fill="#131e33" />
            <path d="M 0 35 Q 35 15, 65 30 T 128 20" fill="none" stroke="#223b6b" stroke-width="2" opacity="0.4" />
            <path d="M 0 65 Q 40 45, 75 60 T 128 50" fill="none" stroke="#223b6b" stroke-width="2" opacity="0.3" />
            <path d="M 0 95 Q 30 75, 70 90 T 128 80" fill="none" stroke="#223b6b" stroke-width="2" opacity="0.4" />
            <path d="M 28 26 L 100 26 L 100 40 L 49 40 L 49 45 L 28 45 Z" fill="#ffffff" />
            <rect x="28" y="57" width="52" height="14" fill="#ffffff" />
            <path d="M 28 83 L 49 83 L 49 88 L 100 88 L 100 102 L 28 102 Z" fill="#ffffff" />
          </svg>
        </div>
        <span class="echo-status-dot ready"></span>
        <span class="echo-score-text">--</span>
        <button class="echo-pill-btn" type="button">Compile</button>
      </div>

      <div class="echo-panel">
        <div class="echo-panel-header" title="Drag to move pop-up">
          <div class="echo-brand-group">
            <svg width="20" height="20" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="128" height="128" rx="28" fill="#131e33" />
              <path d="M 0 35 Q 35 15, 65 30 T 128 20" fill="none" stroke="#223b6b" stroke-width="2" opacity="0.4" />
              <path d="M 0 65 Q 40 45, 75 60 T 128 50" fill="none" stroke="#223b6b" stroke-width="2" opacity="0.3" />
              <path d="M 0 95 Q 30 75, 70 90 T 128 80" fill="none" stroke="#223b6b" stroke-width="2" opacity="0.4" />
              <path d="M 28 26 L 100 26 L 100 40 L 49 40 L 49 45 L 28 45 Z" fill="#ffffff" />
              <rect x="28" y="57" width="52" height="14" fill="#ffffff" />
              <path d="M 28 83 L 49 83 L 49 88 L 100 88 L 100 102 L 28 102 Z" fill="#ffffff" />
            </svg>
            <span class="echo-title">Echo</span>
            <span class="echo-badge-sub">Compiler</span>
          </div>
          <div class="echo-header-controls">
            <span class="echo-drag-hint" title="Drag to reposition">⋮⋮</span>
            <button class="echo-close-btn" type="button" aria-label="Close">&times;</button>
          </div>
        </div>

        <!-- Mode Bar -->
        <div class="echo-mode-bar">
          <div class="echo-mode-pills">
            <button class="echo-mode-pill active" data-mode="structured" type="button">Structured</button>
            <button class="echo-mode-pill" data-mode="concise" type="button">Concise</button>
            <button class="echo-mode-pill" data-mode="deep_reasoning" type="button">Deep</button>
          </div>
        </div>

        <!-- Live Contract Preview View -->
        <div class="echo-preview-view">
          <div class="echo-preview-subhead">
            <span class="echo-preview-title">Compiled Prompt Contract</span>
          </div>

          <div class="echo-diff-section echo-diff-fluff-wrap" style="display:none;">
            <div class="echo-diff-label">Purged Filler Tokens</div>
            <div class="echo-diff-chips-wrap echo-diff-fluff-list"></div>
          </div>

          <div class="echo-diff-section echo-diff-bounds-wrap" style="display:none;">
            <div class="echo-diff-label">Enforced Bounds</div>
            <div class="echo-diff-chips-wrap echo-diff-bounds-list"></div>
          </div>

          <div class="echo-diff-label">Synthesized Contract</div>
          <div class="echo-terminal-box echo-preview-contract-text"></div>

          <div class="echo-preview-actions">
            <button class="echo-btn-apply" type="button">Apply to Chat (Enter)</button>
            <button class="echo-btn-discard" type="button">Back (Esc)</button>
            <button class="echo-btn-copy-contract" type="button">Copy</button>
          </div>
        </div>

        <!-- Standard Review / Issues View -->
        <div class="echo-standard-view">
          <div class="echo-empty-state">
            <div class="echo-empty-title">Airtight Prompt &check;</div>
            <div class="echo-empty-desc">Your prompt contains direct instructions and clean specifications. Ready to send.</div>
          </div>
          <div class="echo-body"></div>
          <div class="echo-review-action-row">
            <button class="echo-btn-compile-main" type="button">Compile Contract (Alt+E)</button>
            <button class="echo-btn-undo-main" type="button" style="display:none;">Undo</button>
          </div>
          <div class="echo-presets">
            <div class="echo-presets-title">Quick Output Formats</div>
            <div class="echo-chip-group"></div>
          </div>
        </div>

        <div class="echo-footer">
          <span>Alt+E to compile</span>
          <span>Local &bull; 100% Private</span>
        </div>
      </div>
    `;

    Echo.ui.pill = Echo.ui.host.querySelector(".echo-pill");
    Echo.ui.statusDotEl = Echo.ui.host.querySelector(".echo-status-dot");
    Echo.ui.panel = Echo.ui.host.querySelector(".echo-panel");
    Echo.ui.panelHeader = Echo.ui.host.querySelector(".echo-panel-header");
    Echo.ui.badgeSub = Echo.ui.host.querySelector(".echo-badge-sub");
    Echo.ui.scoreTextEl = Echo.ui.host.querySelector(".echo-score-text");
    Echo.ui.pillBtn = Echo.ui.host.querySelector(".echo-pill-btn");
    Echo.ui.bodyEl = Echo.ui.host.querySelector(".echo-body");
    Echo.ui.emptyEl = Echo.ui.host.querySelector(".echo-empty-state");
    Echo.ui.actionBtn = Echo.ui.host.querySelector(".echo-btn-compile-main");
    Echo.ui.undoBtn = Echo.ui.host.querySelector(".echo-btn-undo-main");
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

    // Draggable header listeners
    Echo.ui.panelHeader.addEventListener("mousedown", Echo.ui.onDragStart);
    Echo.ui.panelHeader.addEventListener("touchstart", Echo.ui.onDragStart, { passive: false });

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
        // If preview is active, immediately recompile preview
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
          try {
            await navigator.clipboard.writeText(Echo.ui.activePreviewData.corrected);
            Echo.ui.btnCopyContract.textContent = "Copied \u2713";
            setTimeout(() => {
              if (Echo.ui.btnCopyContract) Echo.ui.btnCopyContract.textContent = "Copy";
            }, 1400);
          } catch (err) {
            console.warn("Echo copy failed:", err);
          }
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
    Echo.ui.onDragEnd();

    Echo.ui.host = null;
    Echo.ui.pill = null;
    Echo.ui.panel = null;
    Echo.ui.input = null;
    Echo.ui.open = false;
    Echo.ui.lastResult = null;
    Echo.ui.previousText = null;
    Echo.ui.activePreviewData = null;
    Echo.ui.userDragged = false;
  },

  /* Dragging handlers */
  onDragStart(e) {
    if (e.target.closest("button") || e.target.closest(".echo-close-btn")) {
      return;
    }
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    Echo.ui.isDragging = true;
    Echo.ui.dragStartX = clientX;
    Echo.ui.dragStartY = clientY;

    const rect = Echo.ui.host.getBoundingClientRect();
    Echo.ui.panelStartX = rect.left;
    Echo.ui.panelStartY = rect.top;

    Echo.ui.host.classList.add("echo-is-dragging");

    window.addEventListener("mousemove", Echo.ui.onDragMove, { passive: false });
    window.addEventListener("mouseup", Echo.ui.onDragEnd);
    window.addEventListener("touchmove", Echo.ui.onDragMove, { passive: false });
    window.addEventListener("touchend", Echo.ui.onDragEnd);
  },

  onDragMove(e) {
    if (!Echo.ui.isDragging || !Echo.ui.host) return;
    if (e.cancelable) e.preventDefault();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const dx = clientX - Echo.ui.dragStartX;
    const dy = clientY - Echo.ui.dragStartY;

    let newLeft = Echo.ui.panelStartX + dx;
    let newTop = Echo.ui.panelStartY + dy;

    const hostW = Echo.ui.host.offsetWidth || 380;
    const hostH = Echo.ui.host.offsetHeight || 300;

    newLeft = Math.max(8, Math.min(newLeft, window.innerWidth - hostW - 8));
    newTop = Math.max(8, Math.min(newTop, window.innerHeight - hostH - 8));

    Echo.ui.host.style.left = newLeft + "px";
    Echo.ui.host.style.top = newTop + "px";
    Echo.ui.userDragged = true;
  },

  onDragEnd() {
    Echo.ui.isDragging = false;
    if (Echo.ui.host) {
      Echo.ui.host.classList.remove("echo-is-dragging");
    }
    window.removeEventListener("mousemove", Echo.ui.onDragMove);
    window.removeEventListener("mouseup", Echo.ui.onDragEnd);
    window.removeEventListener("touchmove", Echo.ui.onDragMove);
    window.removeEventListener("touchend", Echo.ui.onDragEnd);
  },

  onDocClick(e) {
    if (Echo.ui.open && Echo.ui.host && !Echo.ui.host.contains(e.target)) {
      Echo.ui.close();
    }
  },

  onGlobalKeyDown(e) {
    if (!Echo.ui.open) return;

    if (Echo.ui.previewView && Echo.ui.previewView.classList.contains("echo-active")) {
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
    } else if (e.key === "Escape") {
      Echo.ui.close();
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
    if (Echo.ui.userDragged) return; // Keep user's manually dragged position

    const rect = Echo.ui.input.getBoundingClientRect();
    const panelWidth = 380;
    const pillWidth = 150;
    let left = Echo.ui.open ? (rect.right - panelWidth) : (rect.right - pillWidth - 12);
    left = Math.max(12, Math.min(left, window.innerWidth - (Echo.ui.open ? panelWidth : pillWidth) - 12));

    let top = rect.top - 46;
    if (Echo.ui.open) {
      const estimatedHeight = 360;
      if (rect.top - estimatedHeight - 12 > 0) {
        top = rect.top - estimatedHeight - 12;
      } else {
        top = rect.bottom + 12;
      }
    } else if (top < 8) {
      top = rect.bottom + 8;
    }
    top = Math.max(8, Math.min(top, window.innerHeight - 60));

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
    }, 4500);
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

  /* Preview First Diff Execution */
  async triggerAutocorrect() {
    if (!Echo.ui.input) return;
    const current = Echo.detector.read(Echo.ui.input);
    if (!current || !current.trim()) return;

    // Check triage status
    const triage = (Echo.triage && Echo.triage.classify)
      ? Echo.triage.classify(current)
      : { status: "decompile" };

    if (triage.status === "ready") {
      Echo.ui.showToast("Prompt is already airtight and direct \u2713", false);
      return;
    }

    if (triage.status === "vague" && triage.suggestion) {
      Echo.ui.previousText = current;
      Echo.detector.write(Echo.ui.input, triage.suggestion);
      if (Echo.ui.undoBtn) Echo.ui.undoBtn.style.display = "inline-flex";
      Echo.ui.showToast("Query sharpened \u2713", true);
      Echo.ui.recordStat("fixesApplied");
      return;
    }

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
        Echo.ui.actionBtn.textContent = "Compile Contract (Alt+E)";
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

    // Set contract text
    Echo.ui.previewContractText.textContent = data.corrected;

    // Purged tokens
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

    // Enforced Bounds
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
  },

  triggerUndo() {
    if (!Echo.ui.input || Echo.ui.previousText == null) return;
    const restoreText = Echo.ui.previousText;
    Echo.ui.previousText = null;
    Echo.detector.write(Echo.ui.input, restoreText);
    if (Echo.ui.undoBtn) Echo.ui.undoBtn.style.display = "none";
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
    if (Echo.ui.undoBtn) Echo.ui.undoBtn.style.display = "inline-flex";
    Echo.ui.showToast("Fix applied \u2713", true);
    Echo.ui.recordStat("fixesApplied");
  },

  appendConstraint(text) {
    if (!Echo.ui.input || !text) return;
    Echo.ui.previousText = Echo.detector.read(Echo.ui.input);
    Echo.detector.append(Echo.ui.input, text);
    if (Echo.ui.undoBtn) Echo.ui.undoBtn.style.display = "inline-flex";
    Echo.ui.showToast("Output format added \u2713", true);
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

    // 3-State Traffic-Light Cognitive Triage
    const currentText = Echo.ui.input ? Echo.detector.read(Echo.ui.input) : "";
    const triage = (result && result.triage)
      ? result.triage
      : ((Echo.triage && Echo.triage.classify)
          ? Echo.triage.classify(currentText)
          : { status: "decompile", badge: "Decompile" });

    // Update Pill styling based on triage state
    Echo.ui.pill.classList.remove("echo-state-ready", "echo-state-vague", "echo-state-decompile");
    Echo.ui.statusDotEl.className = "echo-status-dot " + triage.status;

    if (triage.status === "ready") {
      Echo.ui.pill.classList.add("echo-state-ready");
      Echo.ui.scoreTextEl.textContent = "Ready \u2713";
      Echo.ui.scoreTextEl.style.color = "#15803d";
      Echo.ui.pillBtn.style.display = "none";
      if (Echo.ui.badgeSub) Echo.ui.badgeSub.textContent = "Ready";
    } else if (triage.status === "vague") {
      Echo.ui.pill.classList.add("echo-state-vague");
      Echo.ui.scoreTextEl.textContent = triage.intent === "empty_ping" ? "Ping" : "Clarify";
      Echo.ui.scoreTextEl.style.color = "#b45309";
      Echo.ui.pillBtn.textContent = "Sharpen";
      Echo.ui.pillBtn.className = "echo-pill-btn vague-btn";
      Echo.ui.pillBtn.style.display = "inline-flex";
      if (Echo.ui.badgeSub) Echo.ui.badgeSub.textContent = triage.intent === "empty_ping" ? "Incomplete" : "Clarify";
    } else {
      Echo.ui.pill.classList.add("echo-state-decompile");
      const grade = Echo.analyzer.grade(result.score);
      Echo.ui.scoreTextEl.textContent = grade.label + " " + result.score;
      Echo.ui.scoreTextEl.style.color = "#0284c7";
      Echo.ui.pillBtn.textContent = triage.intent === "text_transform" ? "Structure" : "Compile";
      Echo.ui.pillBtn.className = "echo-pill-btn";
      Echo.ui.pillBtn.style.display = "inline-flex";
      if (Echo.ui.badgeSub) Echo.ui.badgeSub.textContent = "Compiler";
    }

    Echo.ui.bodyEl.innerHTML = "";

    // Render interactive thought completion chips if provided by AI or triage
    if (triage.completions && triage.completions.length > 0) {
      const compWrap = document.createElement("div");
      compWrap.className = "echo-issue";
      compWrap.style.background = "#f0f9ff";
      compWrap.style.border = "1px solid #bae6fd";
      compWrap.style.borderRadius = "8px";
      compWrap.style.margin = "8px 14px";
      compWrap.innerHTML = `
        <div style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;color:#0284c7;text-transform:uppercase;margin-bottom:6px;">
          Complete Your Task:
        </div>
        <div style="font-size:11.5px;color:#0369a1;margin-bottom:8px;">
          ${Echo.detector.escapeHtml(triage.rationale || "State what you need directly in this prompt to save a back-and-forth round trip.")}
        </div>
        <div class="echo-comp-chips" style="display:flex;flex-wrap:wrap;gap:6px;"></div>
      `;
      const chipsContainer = compWrap.querySelector(".echo-comp-chips");
      for (const comp of triage.completions) {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "echo-chip";
        chip.style.background = "#ffffff";
        chip.style.borderColor = "#0284c7";
        chip.style.color = "#0284c7";
        chip.style.fontWeight = "700";
        chip.textContent = comp.label;
        chip.addEventListener("click", (e) => {
          e.stopPropagation();
          Echo.ui.appendConstraint(comp.insertText || comp.text);
        });
        chipsContainer.appendChild(chip);
      }
      Echo.ui.bodyEl.appendChild(compWrap);
    }

    const hasIssues = result.issues && result.issues.length > 0;

    if (hasIssues && triage.status !== "ready") {
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
