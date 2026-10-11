var Echo = window.Echo = window.Echo || {};

Echo.triage = {
  // Speculative hedges that trigger Amber state
  VAGUE_PATTERNS: [
    /\b(what\s+do\s+you\s+think\s+(is|are|might\s+be|could\s+be))\b/i,
    /\b(or\s+something\s+like\s+that|or\s+something|or\s+whatever|or\s+stuff)\b/i,
    /\b(might\s+be|could\s+be\s+like|kind\s+of|sort\s+of|i\s+guess|maybe|perhaps)\b/i,
    /\b(tell\s+me\s+about\s+(things|stuff|anything))\b/i,
    /\b(give\s+me\s+some\s+(stuff|things|thoughts|ideas))\b/i
  ],

  // Text transform / Paraphrase patterns that trigger Red Transform state
  TRANSFORM_PATTERNS: [
    /\b(paraphrase|rephrase|rewrite|re-write|proofread|edit\s+this|polish\s+my|clean\s+up\s+my)\b/i,
    /\b(my\s+essay|my\s+draft|my\s+paragraph|this\s+essay|this\s+draft|this\s+paragraph|my\s+paper)\b/i,
    /\b(make\s+this\s+sound|sound\s+more\s+(academic|professional|formal|casual|engaging))\b/i,
    /\b(turn\s+this\s+into|convert\s+this\s+draft)\b/i
  ],

  // Direct interrogative inquiry prefixes that qualify for Green state
  DIRECT_QUERY_RE: /^(what|which|how|why|who|when|where|is|are|can|could|define|explain|list|describe|does|do)\b/i,

  classify(text) {
    const raw = (text || "").trim();
    if (!raw) {
      return {
        status: "empty",
        intent: "empty",
        badge: "Awaiting Input",
        color: "#64748b",
        rationale: "Enter a prompt to analyze clarity and cognitive readiness."
      };
    }

    // 1. Check for Text Transformation / Paraphrase Intent (Red - Transform)
    const isTransform = this.TRANSFORM_PATTERNS.some((re) => re.test(raw));
    if (isTransform) {
      return {
        status: "decompile",
        intent: "text_transform",
        badge: "Draft & Transform Payload",
        color: "#dc2626",
        rationale: "Source draft is mixed with editing instructions. Separating the draft payload from editorial directives prevents the AI from skipping your core arguments."
      };
    }

    // 2. Check for Vague / Speculative Inquiries (Amber - Clarify)
    const isVague = this.VAGUE_PATTERNS.some((re) => re.test(raw));
    if (isVague) {
      // Formulate a clean sharpened query suggestion
      let cleaned = raw
        .replace(/\b(what\s+do\s+you\s+think\s+(the\s+)?)/i, "What is the ")
        .replace(/\b(might\s+be\s+or\s+something\s+like\s+that|or\s+something\s+like\s+that|or\s+something|or\s+whatever)\b/gi, "")
        .replace(/\b(kind\s+of|sort\s+of|i\s+guess|maybe)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim();
      if (!cleaned.endsWith("?")) cleaned += "?";

      return {
        status: "vague",
        intent: "vague_inquiry",
        badge: "Vague Inquiry",
        color: "#b45309",
        rationale: "Speculative phrasing detected. The model may provide conversational hedging instead of a direct, factual answer.",
        suggestion: cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
      };
    }

    // 3. Check for Direct, Airtight Questions (Green - Pass-Through)
    const isDirect = this.DIRECT_QUERY_RE.test(raw);
    const hasNegativeConstraints = /\b(don't|do\s+not|never|no\s+(third-party|libraries|code|orms))\b/i.test(raw);
    const wordCount = raw.split(/\s+/).length;

    if (isDirect && !hasNegativeConstraints && wordCount < 30) {
      return {
        status: "ready",
        intent: "direct_query",
        badge: "Prompt Ready ✓",
        color: "#15803d",
        rationale: "Prompt is direct, concise, and unambiguous. Ready to send without modification."
      };
    }

    // 4. Default to Complex Multi-Task / Specification Build (Red - Spec)
    return {
      status: "decompile",
      intent: "complex_build",
      badge: "Multi-Constraint Specification",
      color: "#dc2626",
      rationale: "Complex multi-requirement prompt. Hoisting negative guardrails and numbering target deliverables will eliminate model hallucination."
    };
  }
};

Echo.rules = {
  tooShort: {
    id: "tooShort",
    name: "Concrete task",
    category: "CONTEXT",
    weight: 40,
    check(text, triage) {
      if (triage && triage.status === "ready") return null;
      if (text.length < 12) {
        return {
          severity: "error",
          category: "CONTEXT",
          rationale: "Under-specified prompts cause the AI to guess scope and hallucinate details.",
          message: "Prompt is too short. Specify the exact task, context, and desired result.",
          tip: "Define what you need, the format, and the context.",
          quickFix: {
            label: "Expand prompt",
            append: "Provide a comprehensive breakdown with clear explanations, code or examples, and key takeaways."
          }
        };
      }
      return null;
    }
  },

  weakVerbs: {
    id: "weakVerbs",
    name: "Vague language",
    category: "CLARITY",
    weight: 20,
    patterns: [
      {
        re: /\b(help me to|help me|assist me with|assist me)\b/i,
        tip: "Replace conversational filler with direct action verbs.",
        replacement: "Provide "
      },
      {
        re: /\b(something good|something nice)\b/i,
        tip: "Specify quality metrics or concrete requirements.",
        replacement: "production-ready specifications"
      },
      {
        re: /\b(something|anything|stuff|things?|whatever)\b/i,
        tip: "Name the specific subject or target data.",
        replacement: "key specifications and components"
      },
      {
        re: /\b(or something like that|or whatever|or stuff)\b/i,
        tip: "Remove speculative placeholders to force factual precision.",
        replacement: ""
      },
      {
        re: /\b(etc(\.|\.\.\.)?|and so on|etcetera)\b/i,
        tip: "List requirements explicitly instead of open-ended placeholders.",
        replacement: "and relevant edge cases"
      }
    ],
    check(text, triage) {
      if (triage && triage.status === "ready") return null;
      for (const p of Echo.rules.weakVerbs.patterns) {
        const m = p.re.exec(text);
        if (m) {
          return {
            severity: "warning",
            category: "CLARITY",
            rationale: "Vague terms dilute attention weights, leading the model to produce generic output.",
            message: 'Vague phrasing detected: "' + m[0] + '".',
            tip: p.tip,
            quickFix: {
              label: p.replacement ? 'Replace with "' + p.replacement + '"' : 'Remove vague suffix',
              target: m[0],
              replacement: p.replacement
            }
          };
        }
      }
      return null;
    }
  },

  actionVerb: {
    id: "actionVerb",
    name: "Action verb",
    category: "DIRECTIVENESS",
    weight: 15,
    VERBS: new Set([
      "write", "create", "draft", "summarize", "explain", "analyze",
      "compare", "contrast", "list", "translate", "fix", "debug",
      "generate", "produce", "design", "plan", "review", "rewrite",
      "improve", "outline", "extract", "classify", "convert", "define",
      "describe", "evaluate", "interpret", "recommend", "refactor",
      "structure", "brainstorm", "simplify", "check", "proofread", "edit",
      "build", "develop", "provide", "implement", "what", "how", "why",
      "who", "when", "where", "which", "is", "are", "can", "could", "paraphrase"
    ]),
    PREFIXES: /\b(please|can you|could you|could i|can i|hey|hi|hello|i want you to|i need you to|so|well)\b/i,
    check(text, triage) {
      if (triage && triage.status === "ready") return null;
      if (text.length < 12) return null;
      const stripped = text.replace(Echo.rules.actionVerb.PREFIXES, "").trim();
      const firstWord = stripped.split(/\s+/)[0];
      if (firstWord && !Echo.rules.actionVerb.VERBS.has(firstWord.toLowerCase())) {
        return {
          severity: "suggestion",
          category: "DIRECTIVENESS",
          rationale: "Starting directly with an action verb primes the LLM to execute without conversational filler.",
          message: 'Start directly with an action verb instead of "' + firstWord + '".',
          tip: "Verbs like build, draft, explain, analyze, or debug ensure focused AI output.",
          quickFix: {
            label: "Remove filler prefix",
            target: text,
            replacement: stripped.charAt(0).toUpperCase() + stripped.slice(1)
          }
        };
      }
      return null;
    }
  },

  missingSpecifics: {
    id: "missingSpecifics",
    name: "Constraints & format",
    category: "SPECIFICATIONS",
    weight: 20,
    FORMAT_RE: /\b(list|table|json|csv|bullets?|headings?|code|markdown|diagram|outline|template|steps?|summary|email|script|essay|report|paragraphs?|sentence|direct|concise)\b/i,
    CONSTRAINT_RE: /\b(word count|words|characters|pages?|length|tone|style|formal|casual|friendly|audience|beginner|expert|deadline|limit|min|max|examples?|in the style of|academic)\b/i,
    check(text, triage) {
      // Do not penalize crisp direct questions for missing output format
      if (triage && triage.status === "ready") return null;
      if (text.length < 35) return null;
      if (
        !Echo.rules.missingSpecifics.FORMAT_RE.test(text) &&
        !Echo.rules.missingSpecifics.CONSTRAINT_RE.test(text)
      ) {
        return {
          severity: "warning",
          category: "SPECIFICATIONS",
          rationale: "LLMs require explicit schema and output constraints to avoid returning unformatted walls of text.",
          message: "No output format or constraints specified.",
          tip: "Specify format (bullet points, code, JSON) and tone/length limits.",
          quickFix: {
            label: "Add recommended format",
            append: "Format with clear sections and concise bullet points."
          }
        };
      }
      return null;
    }
  },

  multipleAsks: {
    id: "multipleAsks",
    name: "One ask at a time",
    category: "STRUCTURE",
    weight: 10,
    check(text, triage) {
      if (triage && triage.status === "ready") return null;
      const questions = (text.match(/\?/g) || []).length;
      if (questions >= 2) {
        return {
          severity: "suggestion",
          category: "STRUCTURE",
          rationale: "Unstructured compound questions cause LLMs to focus on the first ask while ignoring secondary constraints.",
          message: questions + " separate questions bundled together.",
          tip: "Split into distinct prompts or number them explicitly for clearer responses.",
          quickFix: {
            label: "Add numbering instruction",
            append: "Address each question separately under numbered headings."
          }
        };
      }
      return null;
    }
  }
};

Echo.analyzer = {
  RULE_ORDER: ["tooShort", "weakVerbs", "actionVerb", "missingSpecifics", "multipleAsks"],

  grade(score) {
    if (score >= 85) return { label: "A", color: "#15803d" };
    if (score >= 70) return { label: "B", color: "#0284c7" };
    if (score >= 50) return { label: "C", color: "#b45309" };
    return { label: "D", color: "#dc2626" };
  },

  analyze(text, enabledRules) {
    const normalized = (text || "").trim();
    if (!normalized) {
      return {
        score: 0,
        triage: Echo.triage.classify(""),
        issues: [],
        empty: true,
        text: normalized
      };
    }

    const triage = Echo.triage.classify(normalized);
    const issues = [];

    // Evaluate issues based on cognitive triage context
    for (const ruleId of Echo.analyzer.RULE_ORDER) {
      const rule = Echo.rules[ruleId];
      if (!rule) continue;
      if (enabledRules && enabledRules[ruleId] === false) continue;
      const result = rule.check(normalized, triage);
      if (result) {
        issues.push({
          ruleId: ruleId,
          ruleName: rule.name,
          category: result.category || rule.category || "QUALITY",
          rationale: result.rationale || "",
          severity: result.severity,
          message: result.message,
          tip: result.tip,
          quickFix: result.quickFix || null
        });
      }
    }

    let score = 100;
    if (triage.status === "ready") {
      score = 100;
    } else if (triage.status === "vague") {
      score = 60;
    } else {
      for (const issue of issues) {
        score -= Echo.rules[issue.ruleId].weight;
      }
      score = Math.min(score, triage.intent === "text_transform" ? 55 : 45);
    }

    return {
      score: Math.max(0, Math.round(score)),
      triage: triage,
      issues: issues,
      empty: false,
      text: normalized
    };
  }
};
