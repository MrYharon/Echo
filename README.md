# Echo - Prompt Coach

Echo is a browser extension that acts as a real-time Grammarly for AI prompting. It analyzes what you type in ChatGPT, Claude, and Gemini, flags prompt weaknesses, and provides one-click auto-correction directly in the input field.

## Features

- **One-Click Auto-Correct**: Instantly rewrite weak prompts into direct, structured instructions that optimize AI responses.
- **Real-Time Quality Score**: Live score (0-100 and A-D grade) displayed in a lightweight floating pill next to the active input.
- **Targeted Quick-Fixes**: One-click inline fixes for specific issues (filler removal, weak verbs, vague vocabulary).
- **Format & Constraint Presets**: Rapidly inject output specifications (clean code, JSON, numbered steps, concise tone).
- **Keyboard Shortcut**: Press `Alt+E` to auto-correct the current prompt immediately.
- **Undo Support**: Easily revert to your original input if needed.
- **100% Local & Private**: All evaluation and correction logic runs entirely in your browser. No external API calls, tracking, or network overhead.

## Core Rules

1. **Concrete Task**: Detects underspecified or overly brief prompts and guides you to define the goal and context.
2. **Action Verbs**: Replaces conversational filler ("can you please help me with") with direct command verbs ("Build", "Draft", "Explain", "Analyze").
3. **Clarity**: Flags ambiguous terms ("something good", "stuff", "things", "etc") and suggests precise technical criteria.
4. **Constraints & Format**: Prompts for required output formats (code with comments, tables, JSON) and scope limits.
5. **One Ask at a Time**: Identifies cluttered multi-part questions and advises sequential numbering or prompt splitting.

## Installation

1. Open `chrome://extensions` in Google Chrome (or Edge / Brave).
2. Enable **Developer mode** via the toggle in the top-right corner.
3. Click **Load unpacked** and select the repository directory.
4. Navigate to ChatGPT, Claude, or Gemini and begin typing in the prompt area.

## Project Structure

```
manifest.json          MV3 extension manifest
src/detector.js        Detects active input and provides DOM read/write methods
src/autocorrect.js     Heuristic transformation engine for prompt auto-correction
src/analyzer.js        Rule engine, scoring, and targeted quick-fix definitions
src/ui.js              Light blue floating pill, suggestion panel, and controls
src/content.js         Lifecycle coordination, debouncing, and keyboard listeners
popup/                 Extension settings and rule toggles
icons/                 Light blue brand icons and SVG asset
scripts/make-icons.ps1 PowerShell script to regenerate extension icons
```

## Supported Platforms

- ChatGPT (`chatgpt.com`, `chat.openai.com`)
- Claude (`claude.ai`)
- Gemini (`gemini.google.com`)
- Generic fallback for web textareas and contenteditable inputs

## License

MIT
