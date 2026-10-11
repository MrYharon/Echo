# Echo: Universal Prompt Copilot Implementation Plan

> **Objective:** Evolve Echo from a developer-focused prompt compiler into a universal prompt co-pilot—the "Grammarly for LLM Prompts"—supporting code, factual questions, essays/paraphrasing, recipes, and general human inquiries without robotic over-engineering.

---

## Architecture Overview

```
                      ┌────────────────────────────┐
                      │      Raw Human Input       │
                      └─────────────┬──────────────┘
                                    ▼
                      ┌────────────────────────────┐
                      │    Layer 1: Cognitive      │
                      │    Triage Engine           │
                      │    (analyzer.js)           │
                      └──────┬──────┬──────┬───────┘
                             │      │      │
           ┌─────────────────┘      │      └─────────────────┐
           ▼                        ▼                        ▼
  [State 1: Green]         [State 2: Amber]         [State 3: Red]
   Airtight / Direct        Vague / Speculative      Complex / Payload
   (e.g., OSI Layer 3)      (e.g., "what do u think  (e.g., Essay Draft,
                             layer 3 OSI is...")      Barbershop App)
           │                        │                        │
           ▼                        ▼                        ▼
  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
  │ Pass-Through    │      │ Clarifier       │      │ Universal       │
  │ Validation      │      │ Suggestions     │      │ Compiler        │
  │ (No Rewriting)  │      │ (Tighten Query) │      │ (Payload Wrap / │
  │                 │      │                 │      │  Spec Contract) │
  └─────────────────┘      └─────────────────┘      └─────────────────┘
                                    │
                                    ▼
                      ┌────────────────────────────┐
                      │    Output Contract & UI    │
                      │  (Workbench & In-DOM Pill) │
                      └────────────────────────────┘
```

---

## Phased Execution Roadmap

### Phase 1: Cognitive Triage Engine (`src/analyzer.js`)
- [x] **1.1 Intent Depth Classification:**
  - Classify input into one of four cognitive categories:
    1. `direct_query`: Crisp factual or conceptual questions (e.g., *"What is the third layer of the OSI model?"*).
    2. `vague_inquiry`: Speculative or ambiguous questions containing hedging (e.g., *"what do you think...", "or something like that", "maybe..."*).
    3. `text_transform`: Requests to edit, paraphrase, proofread, or rewrite existing prose or essays.
    4. `complex_build`: Multi-sentence task or engineering requests with buried constraints and deliverables.
- [x] **1.2 3-State Traffic-Light Output:**
  - `status: "ready"` (Green): High clarity, direct intent. No compilation required.
  - `status: "vague"` (Amber): Speculative wording detected; needs focused sharpening.
  - `status: "decompile"` (Red): High cognitive load, buried negative boundaries, or unsegregated text payloads.
- [x] **1.3 Diagnostic Rationales:**
  - Provide human-friendly explanations for why a prompt received its status (e.g., *"Prompt is direct and unambiguous"*, *"Speculative phrasing detected—model may provide hedged opinions instead of facts"*).

---

### Phase 2: Universal Intent Envelope Compiler (`src/architect.js`)
- [x] **2.1 Pass-Through Mode (Green Prompts):**
  - Return the prompt cleanly untouched, confirming that no restructuring is needed.
- [x] **2.2 Query Clarifier Mode (Amber Prompts):**
  - Strip speculative hedges and formulate a crisp, definitive inquiry.
  - Provide targeted refinement angles (e.g., *Direct Definition* vs. *Deep Conceptual Breakdown*).
- [x] **2.3 Payload & Transform Mode (Red Prose / Essay Prompts):**
  - Isolate the source draft inside delimited quotes (`Source Draft: """..."""`).
  - Extract user-specified constraints (e.g., *"academic tone"*, *"no pretentious words"*, *"smooth flow"*).
  - Explicitly direct the LLM on editorial role (Academic Editor), register, and retention of original thesis.
- [x] **2.4 Spec Decompilation Mode (Red Engineering / Build Prompts):**
  - Maintain Echo's battle-tested architectural contract compiler for code generation, schema design, and technical features.

---

### Phase 3: Interactive Laboratory Updates (`landing/index.html`, `landing/script.js`)
- [x] **3.1 Diverse Preset Catalog:**
  - Add sample buttons representing all four cognitive states:
    1. *Factual (Green):* *"What is the third layer of the OSI model?"*
    2. *Vague (Amber):* *"what do you think the third layer of the osi model might be or something like that"*
    3. *Essay Paraphrase (Red):* Sociology assignment draft on social media algorithms with negative constraints.
    4. *Engineering Build (Red):* Barbershop appointment booking system with optimistic locking.
- [x] **3.2 Dynamic Laboratory Presentation:**
  - Render the Green state with an affirmative badge: *"Prompt Ready ✓ (No compilation needed)"*.
  - Render Amber suggestions with one-click refinement previews.
  - Render Red decompilations with the syntax-highlighted contract or payload envelope.
- [x] **3.3 Synchronize Website:**
  - Mirror all changes from `Echo/landing/` to `echo-website/` repository and verify live deployment.

---

### Phase 4: In-DOM Extension Ambient Pill (`src/content.js`, `src/popup.js`)
- [x] **4.1 Passive Ambient Indicator:**
  - Display a discrete, non-distracting status indicator (Green dot, Amber pulse, Red badge) directly in the active chatbox of ChatGPT, Claude, and Gemini.
- [x] **4.2 Subtle Interaction Flyout:**
  - Hover or click opens a minimal card:
    - If Green: Confirms readiness (`Prompt Ready ✓`).
    - If Amber: Offers one-click refined query sharpening (`Sharpen`).
    - If Red: Offers one-click prompt compilation (`Compile` or `Structure`).
- [x] **4.3 Shortcut Integration:**
  - Pressing `Alt+E` invokes the optimal action immediately based on the prompt's cognitive status (affirms Green, sharpens Amber, compiles Red).

---

## Ideas Board (Future Full-Scale Platform)

*The following items are deferred for the future server/database rollout and will not block the current single-user expansion:*

* **Micro-Feedback Telemetry:** Inline *"Did this help? [👍] [👎]"* or *"Is this what you meant?"* buttons to collect anonymized user preference data.
* **Echo Central API & Model Training Dataset:** Central database to log prompt compilation outcomes and build proprietary prompt-optimization models.
* **On-Device SLM (Gemini Nano) Integration:** Utilizing Chrome's built-in AI (`window.ai` Prompt API) for local zero-latency deep reasoning.
* **Custom Persona & Tone Presets:** User-configurable default registers (e.g., Default to Graduate Level, Default to Senior Principal Engineer).
