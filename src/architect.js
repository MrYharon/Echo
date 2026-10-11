var Echo = window.Echo = window.Echo || {};

Echo.architect = (function () {
  const FILLER_RE = /^(hey|hi|hello|please\s+)?(can\s+you\s+please\s+help\s+me|could\s+you\s+please\s+help\s+me|can\s+you\s+help\s+me|could\s+you\s+help\s+me|help\s+me\s+to|help\s+me|assist\s+me\s+with|assist\s+me|can\s+you\s+please|could\s+you\s+please|please\s+can\s+you|would\s+you\s+be\s+able\s+to|i\s+want\s+you\s+to|i\s+need\s+you\s+to|i\s+would\s+like\s+you\s+to|i'd\s+like\s+you\s+to|hey\s+can\s+you|hi\s+can\s+you|hello\s+can\s+you|can\s+you|could\s+you|so\s+here\s+is\s+a\s+draft\s+for|here\s+is\s+a\s+draft\s+for|here\s+is\s+my\s+draft\s+for|here\s+is\s+my\s+essay|here\s+is\s+a\s+draft)\s+(please\s+)?/i;

  const INTENT_PATTERNS = {
    debug: /\b(bug|error|broken|crash|crashing|fails|failed|exception|not\s+working|cannot|cant|undefined|null|none|issue\s+with|traceback|syntax\s+error)\b/i,
    refactor: /\b(refactor|clean\s+up|optimize|optimization|performance|speed\s+up|simplify|code\s+review|audit|review\s+code)\b/i,
    code_feature: /\b(code|script|implement|build|develop|create|write\s+a\s+(python|js|javascript|typescript|react|sql|api|function|class|component|endpoint|service|scraper))\b/i,
    architecture: /\b(architecture|system\s+design|database\s+schema|data\s+model|microservice|scale|scaling|infrastructure)\b/i,
    explain: /\b(explain|how\s+does|how\s+to|what\s+is|understand|difference\s+between|vs|compare|comparison|pros\s+and\s+cons|overview)\b/i,
    writing: /\b(email|letter|article|blog|essay|copy|headline|tagline|memo|proposal|pitch|outreach|newsletter|paraphrase|rewrite)\b/i
  };

  function detectIntent(text) {
    for (const [intent, regex] of Object.entries(INTENT_PATTERNS)) {
      if (regex.test(text)) return intent;
    }
    return "general";
  }

  function extractNegativeConstraints(text) {
    const constraints = [];
    const patterns = [
      { re: /\b(don't|do not)\s+write\s+(any\s+)?code(\s+yet)?\b/i, rule: "Do NOT generate code implementations yet; focus strictly on conceptual architecture." },
      { re: /\b(just\s+want\s+to|only\s+want\s+to)\s+plan\b/i, rule: "Focus strictly on architectural planning, trade-offs, and design decisions." },
      { re: /\b(keep\s+it\s+simple|keep\s+it\s+clean)\b/i, rule: "Prioritize simplicity and avoid unnecessary engineering overhead." },
      { re: /\bno\s+(dependencies|third-party|libraries)\b/i, rule: "Do NOT introduce external dependencies or third-party libraries." },
      { re: /\b(don't|do not)\s+use\s+(super\s+)?pretentious(\s+words)?\b/i, rule: "Do NOT use pretentious, convoluted, or unnatural vocabulary; keep prose clear and accessible." },
      { re: /\b(don't|do not)\s+use\s+(nextjs|tailwind|redux|zustand|orms?)\b/i, rule: "Avoid specified frameworks/libraries; stick strictly to the stated core stack." },
      { re: /\b(fast|low\s+latency|quick|around\s+one\s+second)\b/i, rule: "Optimize for high performance and sub-second execution speed." }
    ];
    for (const p of patterns) {
      if (p.re.test(text)) {
        constraints.push(p.rule);
      }
    }
    return constraints;
  }

  function extractQuestions(text) {
    const questions = [];
    const sentences = text.split(/(?<=[.?!])\s+/);
    for (const s of sentences) {
      const trimmed = s.trim();
      if (trimmed.includes("?") || /^(what|how|why|do we|is it|can we|should we)\b/i.test(trimmed)) {
        const cleaned = trimmed
          .replace(/\b(OK|right|I mean|you know|and stuff|stuff)\b/gi, "")
          .replace(/\s+/g, " ")
          .trim();
        if (cleaned.length > 10 && !cleaned.toLowerCase().includes("what is a dog")) {
          questions.push(cleaned);
        }
      }
    }
    return questions;
  }

  function cleanBaseText(raw) {
    let text = (raw || "").trim();
    text = text.replace(/^(OK|okay|I mean|you know|listen|look|so|well)[,\s]+/i, "");
    const filler = text.match(FILLER_RE);
    if (filler) {
      text = text.slice(filler[0].length).trim();
    }
    text = text.replace(/\b(I mean|you know|right\?|and stuff right|and stuff)\b/gi, "");
    text = text.replace(/\s+/g, " ").trim();
    if (text.length > 0) {
      text = text.charAt(0).toUpperCase() + text.slice(1);
    }
    text = text.replace(/[.?!]+$/, "");
    return text;
  }

  // Extracts source payload and editorial envelope for essay/writing transformation
  function extractTransformPayload(raw) {
    let text = (raw || "").trim();

    // Look for payload introduction markers: "basically ... can you rewrite" or "draft for [topic] ... can you rewrite"
    let contextSubject = "Writing Draft";
    const contextMatch = text.match(/\b(draft\s+for\s+my\s+([^,.]+)|assignment\s+about\s+([^,.]+)|essay\s+about\s+([^,.]+))\b/i);
    if (contextMatch) {
      contextSubject = (contextMatch[2] || contextMatch[3] || contextMatch[4] || "Academic Essay").trim();
    }

    // Extract core payload by separating preamble from instructions
    let draftPayload = text;
    const basicallyMatch = text.match(/\bbasically\s+([^?]+?)(?=\s+can\s+you|\s+rewrite|\s+please|\s+make\s+this|$)/i);
    if (basicallyMatch && basicallyMatch[1].length > 20) {
      draftPayload = basicallyMatch[1].trim();
    } else {
      // Fallback: strip conversational lead
      draftPayload = draftPayload
        .replace(/^.*?\b(here\s+is\s+(a\s+)?draft\s+.*?:|here\s+is\s+my\s+draft\s+.*?:)\s*/i, "")
        .replace(/\b(can\s+you\s+rewrite\s+this|rewrite\s+this|make\s+this\s+sound).*$/i, "")
        .trim();
    }

    // Capitalize draft payload
    if (draftPayload.length > 0) {
      draftPayload = draftPayload.charAt(0).toUpperCase() + draftPayload.slice(1);
      if (!draftPayload.endsWith(".")) draftPayload += ".";
    }

    // Determine target tone
    let tone = "Formal Academic";
    if (/\b(academic|scholarly|formal|paper|college)\b/i.test(text)) {
      tone = "Formal Academic";
    } else if (/\b(casual|friendly|conversational)\b/i.test(text)) {
      tone = "Accessible Conversational";
    } else if (/\b(executive|business|professional)\b/i.test(text)) {
      tone = "Executive Professional";
    }

    const negativeConstraints = extractNegativeConstraints(text);

    return {
      contextSubject,
      draftPayload,
      tone,
      negativeConstraints
    };
  }

  function buildTransformPrompt(raw, mode = "structured") {
    const { contextSubject, draftPayload, tone, negativeConstraints } = extractTransformPayload(raw);

    const constraintsList = [
      `Tone & Register: ${tone}; objective, cohesive, and rhetorically articulate.`,
      "Fidelity: Preserve all original arguments, logic, and thesis points intact.",
      ...negativeConstraints,
      "Flow: Ensure natural sentence transitions and strong paragraph cohesion."
    ];

    if (mode === "concise") {
      return `Act as an editor. Paraphrase the following text into ${tone.toLowerCase()} prose with smooth flow. Retain all core arguments and avoid pretentious jargon:

"""
${draftPayload}
"""`;
    }

    if (mode === "deep_reasoning") {
      return `Act as a Senior Editorial Stylist and Academic Rhetorician. Analyze and rewrite the following draft:

### Source Draft
"""
${draftPayload}
"""

### Editorial Analysis Steps
1. Identify rhetorical weaknesses, informal phrasing, and structural bottlenecks in the draft.
2. Outline the improved argumentative structure.
3. Deliver the finalized, publication-ready revision adhering strictly to a ${tone.toLowerCase()} register.`;
    }

    // Default: Structured Intent Envelope
    return `### Role & Objective
Act as a Professional Editor. Paraphrase and elevate the following draft for a ${contextSubject} into clean, compelling ${tone.toLowerCase()} prose.

### Source Draft (To Paraphrase)
"""
${draftPayload}
"""

### Editorial Guidelines
${constraintsList.map((c, i) => `${i + 1}. ${c}`).join("\n")}

### Output Deliverable
- Polished, cohesive final draft ready for submission.`;
  }

  function buildClarifierPrompt(raw, triage, mode = "structured") {
    const suggestion = triage.suggestion || cleanBaseText(raw);

    if (mode === "concise") {
      return suggestion;
    }

    return `### Clarified Objective
${suggestion}

### Required Coverage
1. Direct, authoritative definition addressing the core concept immediately.
2. Key architectural mechanics and active protocols.
3. Common practical applications and notable trade-offs.`;
  }

  function buildStructuredPrompt(subject, intent, rawFull = "") {
    const extractedConstraints = extractNegativeConstraints(rawFull || subject);
    const extractedQuestions = extractQuestions(rawFull || subject);

    if (extractedQuestions.length > 0 || extractedConstraints.length > 0) {
      const tasksBlock = extractedQuestions.length > 0
        ? `\n\n### Core Tasks & Questions\n${extractedQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`
        : "";

      const constraintList = [
        ...extractedConstraints,
        "Keep explanations direct, actionable, and avoid conversational filler."
      ];
      const constraintsBlock = `\n\n### Constraints\n${constraintList.map((c) => `- ${c}`).join("\n")}`;

      return `### Objective\n${subject}.${tasksBlock}${constraintsBlock}`;
    }

    switch (intent) {
      case "debug":
        return `Act as a Senior Software Engineer. Debug and resolve the following issue:

### Objective
${subject}.

### Requirements
1. Identify the root cause of the error or unexpected behavior.
2. Provide the corrected code with clear inline explanations.
3. Explain edge cases and verification steps to prevent this issue from recurring.

### Constraints
- Keep explanations direct and avoid unnecessary boilerplate.
- Ensure the fix adheres to modern best practices.`;

      case "refactor":
        return `Act as a Principal Engineer. Conduct a rigorous code refactoring:

### Objective
${subject}.

### Refactoring Goals
1. Improve readability, maintainability, and architectural separation of concerns.
2. Eliminate redundant logic and optimize computational complexity.
3. Preserve existing behavior and interface contracts.

### Deliverables
- Before vs. After comparison highlighting key improvements.
- Clean, production-ready code with type annotations and error handling.`;

      case "code_feature":
        return `Act as a Senior Full-Stack Engineer. Implement the following technical feature:

### Objective
${subject}.

### Technical Specifications
1. Provide clean, modular, and production-ready code.
2. Include comprehensive error handling, input validation, and boundary checks.
3. Add explanatory inline comments on complex logic or architectural decisions.

### Deliverables
- Fully working implementation with all necessary imports and types.
- Brief summary of key design choices and trade-offs.`;

      case "architecture":
        return `Act as a Principal System Architect. Design a scalable technical architecture:

### Objective
${subject}.

### Architectural Requirements
1. Component Boundaries: Detail the core modules, services, and data flows.
2. Data & Storage: Recommend database schemas, indexing strategies, and caching layers.
3. Reliability & Scalability: Address fault tolerance, rate limiting, and failure modes.

### Deliverables
- System architecture specification with clear component responsibilities.
- Trade-off evaluation comparing the proposed solution against alternatives.`;

      case "explain":
        return `Act as a Principal Technical Educator. Explain the following concept with depth and precision:

### Concept to Explain
${subject}.

### Explanation Structure
1. High-Level Summary: Explain the core concept directly in 2-3 sentences.
2. Internal Mechanics: Detail how the system or concept works step by step.
3. Practical Application: Provide a concrete, real-world example illustrating the concept in use.
4. Edge Cases & Common Pitfalls: Highlight frequent misconceptions or performance gotchas.`;

      default:
        return `### Objective
${subject}.

### Instructions
1. Provide a comprehensive, structured response addressing the core requirements.
2. Emphasize clarity, actionable insights, and practical depth.
3. Highlight critical edge cases, assumptions, and practical recommendations.`;
    }
  }

  function transform(rawText, mode = "structured") {
    const raw = (rawText || "").trim();
    if (!raw) {
      return {
        original: raw,
        corrected: raw,
        changed: false,
        mode,
        intent: "general",
        status: "empty",
        badge: "Awaiting Input",
        changes: []
      };
    }

    // Run cognitive triage via Echo.triage if available
    const triage = (Echo.triage && Echo.triage.classify)
      ? Echo.triage.classify(raw)
      : { status: "decompile", intent: detectIntent(raw), badge: "Decompile" };

    // 1. Pass-Through Mode (Green Prompts): Prompt is already direct and clear
    if (triage.status === "ready") {
      return {
        original: raw,
        corrected: raw,
        changed: false,
        mode: mode,
        intent: triage.intent,
        status: triage.status,
        badge: triage.badge,
        rationale: triage.rationale,
        changes: []
      };
    }

    // 2. Query Clarifier Mode (Amber Prompts): Vague or speculative inquiry
    if (triage.status === "vague") {
      const clarified = buildClarifierPrompt(raw, triage, mode);
      return {
        original: raw,
        corrected: clarified,
        changed: raw !== clarified,
        mode: mode,
        intent: triage.intent,
        status: triage.status,
        badge: triage.badge,
        suggestion: triage.suggestion,
        rationale: triage.rationale,
        changes: [
          {
            type: "clarify",
            title: "Sharpened speculative inquiry into direct query",
            original: raw,
            replacement: clarified
          }
        ]
      };
    }

    // 3. Payload & Transform Mode (Red Prose / Essay Prompts)
    if (triage.intent === "text_transform") {
      const transformed = buildTransformPrompt(raw, mode);
      return {
        original: raw,
        corrected: transformed,
        changed: raw !== transformed,
        mode: mode,
        intent: triage.intent,
        status: triage.status,
        badge: triage.badge,
        rationale: triage.rationale,
        changes: [
          {
            type: "transform",
            title: "Segregated essay payload from editorial directives",
            original: raw.substring(0, 50) + "...",
            replacement: transformed.substring(0, 50) + "..."
          }
        ]
      };
    }

    // 4. Spec Decompilation Mode (Red Engineering / Build Prompts)
    const clean = cleanBaseText(raw);
    const intent = detectIntent(clean);
    let enhanced = "";

    switch (mode) {
      case "concise":
        enhanced = `${clean}. Provide a structured, step-by-step response with direct actionable recommendations and no fluff.`;
        break;
      case "deep_reasoning":
        enhanced = `### Complex Problem Statement\n${clean}\n\n### Required Step-by-Step Analysis\n1. Deconstruct Assumptions & Constraints\n2. Evaluate Core Architectural Alternatives\n3. Deliver Complete Production-Grade Implementation\n4. Highlight Failure Modes & Verification`;
        break;
      case "structured":
      default:
        enhanced = buildStructuredPrompt(clean, intent, raw);
        break;
    }

    return {
      original: raw,
      corrected: enhanced,
      changed: raw !== enhanced,
      mode: mode,
      intent: intent,
      status: triage.status,
      badge: triage.badge,
      rationale: triage.rationale,
      changes: [
        {
          type: "architect",
          title: `Decompiled prompt into ${mode} specification (${intent})`,
          original: raw.substring(0, 40) + "...",
          replacement: enhanced.substring(0, 40) + "..."
        }
      ]
    };
  }

  return {
    detectIntent,
    transform
  };
})();
