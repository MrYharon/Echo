var Echo = window.Echo = window.Echo || {};

Echo.ui = {
  host: null,
  pill: null,
  panel: null,
  input: null,
  styleEl: null,
  open: false,

  CSS: `
.echo-host{position:fixed;z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color-scheme:light;}
.echo-pill{display:flex;align-items:center;gap:6px;padding:5px 10px;border-radius:9999px;background:#111827;color:#fff;font-size:12px;font-weight:600;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.12);user-select:none;}
.echo-pill:hover{filter:brightness(1.15);}
.echo-dot{width:8px;height:8px;border-radius:50%;background:#9ca3af;}
.echo-panel{display:none;margin-top:6px;width:320px;max-height:380px;overflow-y:auto;background:#111827;color:#e5e7eb;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.4);border:1px solid rgba(255,255,255,.12);font-size:13px;}
.echo-panel.echo-open{display:block;}
.echo-panel-header{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.1);font-weight:600;font-size:13px;}
.echo-issue{padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.06);}
.echo-issue:last-child{border-bottom:none;}
.echo-issue-head{display:flex;align-items:center;gap:8px;}
.echo-issue-tag{font-size:10px;font-weight:700;text-transform:uppercase;padding:2px 6px;border-radius:4px;letter-spacing:.03em;}
.echo-tag-error{background:rgba(239,68,68,.18);color:#f87171;}
.echo-tag-warning{background:rgba(234,179,8,.16);color:#facc15;}
.echo-tag-suggestion{background:rgba(96,165,250,.16);color:#93c5fd;}
.echo-issue-name{font-weight:600;}
.echo-issue-msg{color:#d1d5db;margin-top:4px;line-height:1.45;}
.echo-issue-tip{color:#9ca3af;margin-top:4px;line-height:1.4;font-size:12px;}
.echo-empty{display:none;padding:12px;color:#6b7280;text-align:center;font-size:12px;}
.echo-empty.echo-show{display:block;}
.echo-panel.echo-good .echo-empty{display:block;color:#4ade80;}
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
    Echo.ui.host.innerHTML =
      '<div class="echo-pill"><span class="echo-dot"></span><span class="echo-score"></span></div>' +
      '<div class="echo-panel">' +
      '<div class="echo-panel-header"><span>Echo - Prompt Coach</span></div>' +
      '<div class="echo-body"></div>' +
      '<div class="echo-empty">Looking good. No issues detected.</div>' +
      "</div>";

    Echo.ui.pill = Echo.ui.host.querySelector(".echo-pill");
    Echo.ui.panel = Echo.ui.host.querySelector(".echo-panel");
    Echo.ui.scoreEl = Echo.ui.host.querySelector(".echo-score");
    Echo.ui.dotEl = Echo.ui.host.querySelector(".echo-dot");
    Echo.ui.bodyEl = Echo.ui.host.querySelector(".echo-body");

    Echo.ui.pill.addEventListener("click", (e) => {
      e.stopPropagation();
      Echo.ui.toggle();
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
  },

  onDocClick() {
    if (Echo.ui.open) {
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
    const hostWidth = 118;
    let left = rect.right - hostWidth - 8;
    left = Math.max(8, Math.min(left, window.innerWidth - hostWidth - 8));
    let top = rect.top - 40;
    if (top < 8) {
      top = rect.bottom + 8;
    }
    Echo.ui.host.style.left = left + "px";
    Echo.ui.host.style.top = top + "px";
  },

  update(result) {
    if (!Echo.ui.pill) return;
    if (!result || result.empty) {
      Echo.ui.hide();
      return;
    }
    Echo.ui.show();
    const grade = Echo.analyzer.grade(result.score);
    Echo.ui.scoreEl.textContent = grade.label + " " + result.score;
    Echo.ui.dotEl.style.background = grade.color;
    Echo.ui.dotEl.style.boxShadow = "0 0 6px " + grade.color;

    Echo.ui.bodyEl.innerHTML = "";
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
      el.innerHTML =
        '<div class="echo-issue-head"><span class="echo-issue-tag ' +
        tagClass +
        '">' +
        issue.severity +
        '</span><span class="echo-issue-name">' +
        issue.ruleName +
        "</span></div>" +
        '<div class="echo-issue-msg"></div>' +
        '<div class="echo-issue-tip"></div>';
      el.querySelector(".echo-issue-msg").textContent = issue.message;
      el.querySelector(".echo-issue-tip").textContent = "Tip: " + issue.tip;
      Echo.ui.bodyEl.appendChild(el);
    }

    const good = result.issues.length === 0;
    Echo.ui.panel.classList.toggle("echo-good", good);
    if (good) {
      Echo.ui.close();
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
