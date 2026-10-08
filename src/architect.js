var Echo = window.Echo = window.Echo || {};

Echo.architect = (function () {
  const FILLER_RE = /^(hey|hi|hello|please\s+)?(can\s+you\s+please\s+help\s+me|could\s+you\s+please\s+help\s+me|can\s+you\s+help\s+me|could\s+you\s+help\s+me|help\s+me\s+to|help\s+me|assist\s+me\s+with|assist\s+me|can\s+you\s+please|could\s+you\s+please|please\s+can\s+you|would\s+you\s+be\s+able\s+to|i\s+want\s+you\s+to|i\s+need\s+you\s+to|i\s+would\s+like\s+you\s+to|i'd\s+like\s+you\s+to|hey\s+can\s+you|hi\s+can\s+you|hello\s+can\s+you|can\s+you|could\s+you)\s+(please\s+)?/i;

  const INTENT_PATTERNS = {
    debug: /\b(bug|error|broken|crash|crashing|fails|failed|exception|not\s+working|cannot|cant|undefined|null|none|issue\s+with|traceback|syntax\s+error)\b/i,
    refactor: /\b(refactor|clean\s+up|optimize|optimization|performance|speed\s+up|simplify|code\s+review|audit|review\s+code)\b/i,
    code_feature: /\b(code|script|implement|build|develop|create|write\s+a\s+(python|js|javascript|typescript|react|sql|api|function|class|component|endpoint|service|scraper))\b/i,
    architecture: /\b(architecture|system\s+design|database\s+schema|data\s+model|microservice|scale|scaling|infrastructure)\b/i,
    explain: /\b(explain|how\s+does|how\s+to|what\s+is|understand|difference\s+between|vs|compare|comparison|pros\s+and\s+cons|overview)\b/i,
    writing: /\b(email|letter|article|blog|essay|copy|headline|tagline|memo|proposal|pitch|outreach|newsletter)\b/i
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
      { re: /\b(don't|do not)\s+write\s+(any\s+)?code(\s+yet)?\b/i, rule: "Do NOT write any code; focus strictly on conceptual planning and architecture." },
      { re: /\b(just\s+want\s+to|only\s+want\s+to)\s+plan\b/i, rule: "Focus strictly on architectural planning, trade-offs, and design decisions." },
      { re: /\b(keep\s+it\s+simple|keep\s+it\s+clean)\b/i, rule: "Prioritize simplicity and avoid unnecessary engineering overhead." },
      { re: /\bno\s+(dependencies|third-party|libraries)\b/i, rule: "Avoid external dependencies and third-party libraries." },
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
    // Strip conversational stream of consciousness prefixes
    text = text.replace(/^(OK|okay|I mean|you know|listen|look|so|well)[,\s]+/i, "");
    const filler = text.match(FILLER_RE);
    if (filler) {
      text = text.slice(filler[0].length).trim();
    }
    // Remove inline conversational fluff
    text = text.replace(/\b(I mean|you know|right\?|and stuff right|and stuff)\b/gi, "");
    text = text.replace(/\s+/g, " ").trim();
    if (text.length > 0) {
      text = text.charAt(0).toUpperCase() + text.slice(1);
    }
    // Clean trailing punctuation
    text = text.replace(/[.?!]+$/, "");
    return text;
  }

  function buildStructuredPrompt(subject, intent, rawFull = "") {
    const extractedConstraints = extractNegativeConstraints(rawFull || subject);
    const extractedQuestions = extractQuestions(rawFull || subject);

    // If conversational thought dump has extracted questions or constraints
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
4. Trade-offs: Document pros and cons of the proposed design versus alternatives.`;

      case "explain":
        return `Provide a clear, in-depth technical explanation:

### Topic
${subject}.

### Structure
1. Core Concepts: Define fundamental principles and mechanics without superficial analogies.
2. Comparison / Key Dimensions: Highlight trade-offs, advantages, and limitations.
3. Practical Application: Provide a real-world code or system scenario illustrating usage.
4. Summary: Conclude with 3-5 concise bullet points covering key takeaways.`;

      case "writing":
        return `Draft a polished, high-impact document:

### Objective
${subject}.

### Guidelines
- Tone: Direct, professional, and conversational without generic corporate filler.
- Structure: Engaging opening hook, clearly stated value proposition, and frictionless call-to-action.
- Length: Keep concise and respect reader attention.
- Constraints: Avoid clichés, buzzwords, and passive sentence structures.`;

      default:
        return `Execute the following task with precision:

### Objective
${subject}.

### Requirements
1. Provide a direct, structured solution addressing all facets of the request.
2. Organize the output using clear headings, bullet points, and numbered steps.
3. Highlight critical assumptions and actionable next steps.

### Constraints
- Avoid conversational throat-clearing and generic pleasantries.
- Deliver production-ready, high-density information.`;
    }
  }

  function extractTopic(subject, intent) {
    let s = subject.trim();
    switch (intent) {
      case "debug":
        return s.replace(/^(fix\s+(my\s+|the\s+)?|debug\s+(my\s+|the\s+)?|resolve\s+(my\s+|the\s+)?)/i, "");
      case "explain":
        return s.replace(/^(explain\s+(how\s+|what\s+|why\s+)?|what\s+is\s+|how\s+does\s+|how\s+to\s+)/i, "");
      case "code_feature":
        return s.replace(/^(write\s+(a\s+|an\s+)?|build\s+(a\s+|an\s+)?|create\s+(a\s+|an\s+)?|make\s+(a\s+|an\s+)?|code\s+(a\s+|an\s+)?)/i, "");
      case "writing":
        return s.replace(/^(write\s+(a\s+|an\s+)?|draft\s+(a\s+|an\s+)?|compose\s+(a\s+|an\s+)?)/i, "");
      default:
        return s;
    }
  }

  function buildConcisePrompt(subject, intent) {
    const topic = extractTopic(subject, intent);
    switch (intent) {
      case "debug":
        return `Debug the following issue: ${topic}. Identify the root cause, provide the corrected code with explanatory comments, and list verification steps.`;
      case "refactor":
        return `Refactor the following: ${subject}. Optimize for readability, reduced complexity, and modern standards. Provide the clean code without unnecessary boilerplate.`;
      case "code_feature":
        return `Build a production-ready solution for: ${topic}. Include robust error handling, types, and concise inline comments.`;
      case "explain":
        return `Explain ${topic} clearly. Detail the core mechanics, practical trade-offs, and summarize key takeaways in bullet points.`;
      case "writing":
        return `Draft a polished ${topic}. Adopt a direct, engaging tone, structure with clear sections, and avoid buzzwords or filler.`;
      default:
        return `${subject}. Provide a structured, step-by-step response with direct actionable recommendations and no fluff.`;
    }
  }

  function buildDeepReasoningPrompt(subject, intent) {
    return `### Complex Problem Statement
${subject}

### Required Step-by-Step Thought Process
Before delivering your final solution, work through the following analysis explicitly:
1. Deconstruct Assumptions: Clarify core requirements, constraints, and implicit assumptions.
2. Evaluate Alternatives: Compare at least two distinct approaches with trade-offs.
3. Recommend Optimal Solution: Detail the chosen implementation with justification.
4. Verification & Edge Cases: Identify failure modes, edge cases, and testing strategies.

### Final Output
Provide the complete, production-grade deliverable below your analysis.`;
  }

  function transform(rawText, mode = "structured") {
    const raw = (rawText || "").trim();
    if (!raw) {
      return { original: raw, corrected: raw, changed: false, mode, intent: "general", changes: [] };
    }

    const clean = cleanBaseText(raw);
    const intent = detectIntent(clean);
    let enhanced = "";

    switch (mode) {
      case "concise":
        enhanced = buildConcisePrompt(clean, intent);
        break;
      case "deep_reasoning":
        enhanced = buildDeepReasoningPrompt(clean, intent);
        break;
      case "structured":
      default:
        enhanced = buildStructuredPrompt(clean, intent, raw);
        break;
    }

    const changes = [
      {
        type: "architect",
        title: `Restructured prompt into ${mode} framework (${intent})`,
        original: raw.substring(0, 40) + "...",
        replacement: enhanced.substring(0, 40) + "..."
      }
    ];

    return {
      original: raw,
      corrected: enhanced,
      changed: raw !== enhanced,
      mode: mode,
      intent: intent,
      changes: changes
    };
  }

  return {
    detectIntent,
    transform
  };
})();
