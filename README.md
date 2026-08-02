# Echo - Prompt Coach

A browser extension that gives real-time prompt-quality feedback before you hit
send on ChatGPT, Gemini, or Claude. Like Grammarly, but for the way you talk to AI.

## What it does

While you type a prompt, Echo shows a live quality score (A-D) next to the input
box and flags issues with concrete tips:

- **Concrete task** - very short prompts with no clear ask
- **Vague language** - words like "help", "something", "stuff", "good"
- **Action verb** - prompts that don't start with a clear instruction verb
- **Constraints & format** - no output format, length, tone, or audience
- **One ask at a time** - prompts bundling multiple questions

Everything runs locally in your browser. No data leaves your machine, no API
calls, no accounts, no cost.

## Install (development)

1. Clone this repo.
2. Open `chrome://extensions`.
3. Enable **Developer mode** (top-right).
4. Click **Load unpacked** and select this folder.
5. Open ChatGPT, Gemini, or Claude and start typing.

## Project structure

```
manifest.json          MV3 manifest (content scripts + popup)
src/detector.js        Finds the prompt input on each platform
src/analyzer.js        Heuristic rule engine + scoring (0-100)
src/ui.js              Floating score pill + suggestion panel
src/content.js         Wiring, debounce, SPA re-detection
popup/                 Toolbar popup (enable toggle + rule toggles)
icons/                 Extension icons
scripts/make-icons.ps1 Icon generator (Windows/PowerShell)
```

## Supported platforms

- ChatGPT (`chatgpt.com`, `chat.openai.com`)
- Claude (`claude.ai`)
- Gemini (`gemini.google.com`)

A generic fallback detects large textareas/contenteditable boxes on other pages.

## Roadmap

- [ ] LLM-backed "Improve prompt" rewrite (phase 2)
- [ ] Word-level inline highlighting in the input
- [ ] Prompt history / before-after score tracking
- [ ] Firefox + Edge packaging
- [ ] Chrome Web Store listing

## License

MIT
