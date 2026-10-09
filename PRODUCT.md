# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are developers, software engineers, technical architects, and power prompters who interact intensively with Large Language Models (ChatGPT, Claude, Gemini). They frequently dump raw streams-of-consciousness, complex multi-part requirements, and messy technical thoughts into chat boxes, and require clean, precise code and architectural answers without model hallucinations or ignored constraints.

## Product Purpose

Echo bridges the semantic gap between messy human thought dumps and LLM attention heads. It intercepts raw conversational typing and compiles it into structured, high-signal prompt specifications so the model delivers airtight, accurate responses on the first attempt.

## Positioning

An in-DOM, real-time prompt decompiler. Unlike generic prompt tools that merely append boilerplate text strings ("be clear and concise"), Echo analyzes syntactic structure, purges conversational fluff, hoists buried negative constraints ("do NOT use...", "no external dependencies") into priority guardrails, and isolates multi-part queries into numbered checklists.

## Operating Context

- **Browser Environments**: Active in-DOM injection inside ChatGPT, Claude, and Gemini textareas on Chromium browsers (Chrome, Brave, Edge).
- **Triggers**: Native `Alt+E` keyboard shortcut and subtle in-DOM floating compilation pill.
- **Public Showcase**: Standalone interactive website and prompt laboratory hosted at `https://echo.hughdp.tech`.

## Capabilities and Constraints

- **Capabilities**:
  - Conversational noise elimination (purges fillers like "I mean", "you know", "and stuff right").
  - Negative constraint promotion (hoists negative rules to the top of prompt contracts).
  - Deliverable segregation (structures multi-step questions into sequential numbered targets).
  - Three specialized compilation modes: Structured (default), Concise, and Deep Reasoning.
  - Sub-second compilation (< 500ms) with zero perceived latency.
- **Constraints**:
  - 100% private and local-first; prompt text is never transmitted to remote telemetry servers or logged.
  - Manifest V3 browser extension architecture with background service worker.

## Brand Commitments

- **Monogram**: The official geometric stepped 3-slab "E" logo (three sharp, unrounded rectangular slabs with notched offsets and no connecting spine).
- **Palette**: Deep marine navy (`#131e33`), crisp gallery white (`#ffffff` / `#fbfcfd`), and electric cyan (`#0ea5e9` / `#0284c7`).
- **Tone**: Technical, Swiss editorial, high-fashion minimalism; completely free of generic SaaS tropes, neon glows, or bloated boilerplate.

## Evidence on Hand

- `src/analyzer.js`: Heuristic attention-dilution detector and clarity scoring engine.
- `src/architect.js`: Deterministic prompt contract synthesizer and guardrail extractor.
- `landing/`: Live product showcase and interactive prompt laboratory.
- `landing/assets/brand-logo.png`: Official geometric brand emblem.
- `landing/assets/echo-extension.zip`: Packaged installable extension package.
- Live deployment: `https://echo.hughdp.tech`.

## Product Principles

1. **Contracts Over Politeness**: LLMs do not need conversational pleasantries; they require unambiguous, airtight interface contracts.
2. **Negative Guardrails First**: Negative constraints ("what NOT to do") are the most frequently violated bounds; they must always be elevated to top-level instructions.
3. **Local-First Privacy**: Prompts and thoughts belong exclusively to the user; zero remote data harvesting or telemetry.
4. **Frictionless In-DOM Velocity**: Compilation happens directly inside the active chatbox via `Alt+E` in under 500ms without context-switching.
