# Product

<!-- impeccable:product-schema 1 -->

## Platform

Web (Chromium Extension for ChatGPT, Claude, Gemini, DeepSeek, and standalone interactive web laboratory).

## Users

Universal users of Large Language Models: developers writing code, students drafting essays and study guides, researchers exploring complex domains, professionals writing correspondence, and everyday individuals asking factual questions or seeking advice. They interact intensively with conversational AI but frequently struggle with vague outputs, missed negative constraints, ignored nuances, or conversational fluff.

## Product Purpose

Echo is the universal prompt copilot—the "Grammarly for LLM Prompts." It operates directly inside conversational chatboxes to ensure that whatever you ask an AI model, the model understands your exact intent and delivers an accurate, high-signal response on the very first attempt.

## Positioning

An in-DOM cognitive prompt copilot and decompiler. Rather than simply appending generic boilerplate strings ("be clear and concise") or forcing every sentence into a heavy technical specification, Echo evaluates human input across three distinct cognitive states:
1. **Airtight (Green)**: Direct, concise questions (*"What is the third layer of the OSI model?"*) are validated without intrusive rewrites.
2. **Ambiguous / Vague (Amber)**: Speculative or vague inquiries (*"what do you think layer 3 OSI is or whatever"*) receive targeted, one-click clarity refinements.
3. **Complex Mess / Attention Dilution (Red)**: Stream-of-consciousness thought dumps and multi-constraint requests are decompiled into structured prompt contracts, isolating source material (e.g., essay drafts) from instructions and hoisting negative guardrails.

## Operating Context

- **Browser Environments**: Active in-DOM floating co-pilot injected into ChatGPT, Claude, Gemini, DeepSeek, and Perplexity chatboxes across Chromium browsers (Chrome, Brave, Edge).
- **Triggers**: Keyboard shortcut (`Alt+E`) and subtle in-DOM floating status pill with unobtrusive hover cards.
- **Public Showcase & Laboratory**: Hosted at `https://echo.hughdp.tech`.

## Capabilities and Constraints

- **Capabilities**:
  - **Cognitive Prompt Triage**: Instant assessment of prompt readiness (Ready, Needs Clarification, Needs Decompilation).
  - **Payload vs. Instruction Segregation**: Cleanly separates source material (drafts to paraphrase, text to edit) from operational directions.
  - **Negative Constraint Hoisting**: Automatically extracts negative boundaries ("do NOT write code yet", "no third-party libraries", "don't use pretentious words") and elevates them to priority directives.
  - **Vagueness Clarifier**: Identifies speculative phrasing and offers targeted refinements (e.g., Quick Answer vs. Detailed Breakdown).
  - **Noise Elimination**: Purges conversational fillers ("I mean", "you know", "and stuff right") that dilute LLM attention heads.
- **Architecture & Extensibility**:
  - Hybrid intelligence architecture: Fast client-side linguistic parser paired with cloud/API intelligence capabilities for deep contextual refinement.
  - Scalable data telemetry foundation designed to capture user feedback on refinement accuracy to continuously improve prompt compilation models.

## Brand Commitments

- **Monogram**: The official geometric stepped 3-slab "E" emblem (three independent rectangular slabs with notched offsets and zero connecting spine).
- **Palette**: Deep marine navy (`#131e33`), crisp gallery white (`#ffffff` / `#fbfcfd`), and electric cyan (`#0ea5e9` / `#0284c7`).
- **Tone**: Technical, Swiss editorial minimalism; quiet, unobtrusive, and focused on high utility.

## Product Principles

1. **Do No Harm to Good Prompts**: If a prompt is already crisp, clear, and direct, confirm it and get out of the user's way. Never add unnecessary ceremony.
2. **Isolate Payload from Directive**: When a user wants an essay paraphrased or text edited, never treat the draft as an objective—keep the draft clearly delimited from the editing instructions.
3. **Elevate Negative Guardrails**: LLMs consistently violate negative constraints buried in paragraphs; Echo always hoists negative bounds to top-level instructions.
4. **Unobtrusive Ambient Intelligence**: Echo behaves like a quiet co-pilot. It lives as a discreet indicator in the chatbox, offering assistance only when summoned or when ambiguity is high.
