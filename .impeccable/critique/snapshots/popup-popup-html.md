# Critique Snapshot: Echo Extension Frontend
**Target:** `popup/popup.html` & `src/ui.js`  
**Date:** 2026-10-10  
**Method:** dual-agent (A: ec20b167-5aa0-4cce-9ee5-804de0a6eb72 · B: c0d14d3c-0845-4001-9f4d-04325380a2f3)  
**Overall Health Score:** 35 / 40 (87.5% — High Editorial Polish)

---

## Heuristics Scoring Table
| Heuristic | Score (0–4) | Verdict |
| :--- | :---: | :--- |
| **H1: Visibility of System Status** | 3 / 4 | Clarity score counter & preview staging active; missing kinetic scanline sweep |
| **H2: Match System & Real World** | 3 / 4 | Contract-first architectural taxonomy, minor copy drift to legacy "Auto-correct" |
| **H3: User Control & Freedom** | 4 / 4 | Exemplary preview-first architecture with Esc discard and 5s Undo safety net |
| **H4: Consistency & Standards** | 3 / 4 | Strict JetBrains Mono kickers; button color divergence between popup & in-DOM |
| **H5: Error Prevention** | 4 / 4 | Non-destructive in-DOM text staging prevents draft loss |
| **H6: Recognition Over Recall** | 4 / 4 | Prominent keyboard triggers (Alt+E, Enter, Esc) and visible categorized diffs |
| **H7: Flexibility & Efficiency** | 4 / 4 | Dual-speed interaction for novice chip pickers and keyboard-first power users |
| **H8: Aesthetic & Minimalist Design** | 3 / 4 | Authoritative Swiss contrast; vertical control stacking congestion in 384px popup |
| **H9: Help with Errors & Recovery** | 4 / 4 | Actionable diagnostic rationales with 1-click remedies and instant draft revert |
| **H10: Documentation & Help** | 3 / 4 | Clear empty states; lacks inline tooltip cheatsheet for compilation mode differences |

---

## Priority Improvements
1. **WCAG Contrast Token Alignment:** Replace `--accent-blue` (`#0284c7`, 4.0:1) with `--accent-blue-text` (`#026aa2`, 5.4:1) for sub-18px interactive text on light surfaces.
2. **Action Button Palette Harmonization:** Align `popup.html`'s primary button to Electric Cyan (`#0ea5e9`) with Obsidian ink (`#0b1324`), matching `DESIGN.md` and `src/ui.js`.
3. **Eradicate Linguistic Regression:** Replace `Auto-correct` with `Compile Prompt (Alt+E)` across all state machines.
4. **Decongest Popup Workbench:** Consolidate mode selector and preset chips into a unified segmented control; relocate telemetry stats to prevent vertical scroll crowding.
5. **Add Signature Terminal Laser Sweep:** Introduce the 250ms `@keyframes scanlineSweep` to `.echo-terminal-box` when compiling contracts.

