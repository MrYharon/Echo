# Echo - Grammarly for AI Prompting

Echo is an open-source browser extension that acts as a real-time prompt engineering layer for ChatGPT, Claude, and Gemini. It analyzes what you type in prompt textboxes, flags prompt weaknesses, and restructures raw, sloppy drafts into production-ready AI specifications.

## How Grammarly Works vs How Echo Works

Grammarly does not rely on a single slow AI call or simplistic regex. It executes a multi-tiered pipeline:
1. **Tier 1 (Instant DOM Tokenizer, <15ms)**: Tracks cursor position and flags low-level tokens without keystroke lag.
2. **Tier 2 (Quality Grading Engine)**: Evaluates input against quality dimensions (Correctness, Clarity, Delivery).
3. **Tier 3 (Semantic Rewrite Engine)**: Feeds intent and context into task-specific small models and instruction-tuned LLMs.

Echo adopts this exact architecture for prompt engineering:
- **Tier 1: DOM Tokenizer & Underlines**: Injects floating coaching badges and inline replacement tags directly into ChatGPT, Claude, and Gemini textboxes.
- **Tier 2: Prompt Quality Grader (0-100)**: Evaluates 5 dimensions: Concrete Task, Action Directives, Specific Constraints, Intent Domain, and Single-Ask Focus.
- **Tier 3: Multi-Tier Prompt Architect & AI Engine**: Rewrites prompts using structured Markdown frameworks (`### Objective`, `### Specifications`, `### Constraints`), concise high-signal directives, or deep-reasoning mode via Chrome on-device AI (`window.ai` / Gemini Nano), cloud LLM APIs (Gemini 1.5, OpenAI), or the local rule-based architect.

## Enhancement Modes

- **Structured**: Deconstructs raw prompts into distinct Markdown sections with an expert persona, explicit requirements, expected output format, and negative constraints.
- **Concise**: Eliminates conversational filler and compresses the ask into a dense, high-signal single directive.
- **Deep Reasoning**: Instructs the LLM to analyze edge cases, evaluate trade-offs, and state assumptions before generating the final output.

## Features

- **Multi-Engine AI Integration**: Supports Chrome's built-in on-device Gemini Nano (`window.ai`), BYOK Gemini 1.5 and OpenAI API keys, with automatic fallback to Echo's local Prompt Architect engine.
- **Real-Time Quality Score**: Live score (0-100 and A-D grade) displayed in a floating pill next to the active input.
- **Inline Replacement Tags**: Squiggly-style suggestions (`"help me" -> "assist by providing"`) clickable right above the input box.
- **IndexedDB History**: Automatically records every prompt enhanced, tracking before-and-after quality scores and token diffs.
- **Prompt Template Manager**: Save and insert reusable prompt snippets directly from the popup.
- **Keyboard Shortcut**: Press `Alt+E` to auto-correct the current prompt immediately.
- **Undo Support**: Easily revert to your original input if needed.
- **100% Private**: Runs entirely in the browser with local storage.

## Landing Page & Demo

A standalone product landing page with a live interactive Prompt Architect sandbox is available in the `landing/` directory (`landing/index.html`).

## Installation

1. Open `chrome://extensions` in Google Chrome (or Edge / Brave).
2. Enable **Developer mode** via the toggle in the top-right corner.
3. Click **Load unpacked** and select the repository directory.
4. Navigate to ChatGPT, Claude, or Gemini and begin typing in the prompt area.

## Project Structure

```
manifest.json          MV3 extension manifest
landing/               Product landing page and live interactive sandbox demo
  index.html           Landing page markup with architecture guide
  style.css            Dark modern CSS styles and glassmorphism cards
  script.js            Interactive browser demo of the Prompt Architect
src/
  ai.js                Multi-tiered AI engine (Chrome Nano, Gemini, OpenAI, local)
  architect.js         Intent classifier and structured prompt framework generator
  autocorrect.js       Correction coordinator with async AI enhancement
  analyzer.js          Rule engine, scoring, and targeted quick-fix definitions
  detector.js          DOM input detector with multi-platform read/write handlers
  db.js                Browser IndexedDB storage client for history and snippets
  ui.js                Floating pill, suggestion panel, mode pills, and toast
  content.js           Content script lifecycle coordination and keyboard listeners
popup/
  popup.html           Toolbar playground, history, templates, and settings
  popup.js             Popup controller, mode switching, and stats tracking
icons/                 Monogram brand icons and SVG asset
scripts/make-icons.ps1 PowerShell script to regenerate extension icons
```

## Supported Platforms

- ChatGPT (`chatgpt.com`, `chat.openai.com`)
- Claude (`claude.ai`)
- Gemini (`gemini.google.com`)
- Generic fallback for web textareas and contenteditable inputs

## License

MIT
