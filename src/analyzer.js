var Echo = window.Echo = window.Echo || {};

Echo.rules = {
  tooShort: {
    id: "tooShort",
    name: "Concrete task",
    category: "CONTEXT",
    weight: 40,
    check(text) {
      if (text.length < 12) {
        return {
          severity: "error",
          category: "CONTEXT",
          rationale: "Under-specified prompts cause the AI to guess scope and hallucinate details.",
          message:
            "Prompt is too short. Specify the exact task, context, and desired result.",
          tip: 'Define what you need, the format, and the context.',
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
        re: /\b(nice|good|great|better|fine)\b/i,
        tip: "Describe the exact criteria (e.g. robust, responsive, formal).",
        replacement: "high-quality and clean"
      },
      {
        re: /\b(etc(\.|\.\.\.)?|and so on|etcetera)\b/i,
        tip: "List requirements explicitly instead of open-ended placeholders.",
        replacement: "and relevant edge cases"
      }
    ],
    check(text) {
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
              label: 'Replace with "' + p.replacement + '"',
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
      "build", "develop", "provide", "implement"
    ]),
    PREFIXES: /\b(please|can you|could you|could i|can i|hey|hi|hello|i want you to|i need you to)\b/i,
    check(text) {
      if (text.length < 12) return null;
      const stripped = text.replace(Echo.rules.actionVerb.PREFIXES, "").trim();
      const firstWord = stripped.split(/\s+/)[0];
      if (firstWord && !Echo.rules.actionVerb.VERBS.has(firstWord.toLowerCase())) {
        return {
          severity: "suggestion",
          category: "DIRECTIVENESS",
          rationale: "Starting directly with an action verb primes the LLM to execute without conversational filler.",
          message:
            'Start directly with an action verb instead of "' + firstWord + '".',
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
    FORMAT_RE: /\b(list|table|json|csv|bullets?|headings?|code|markdown|diagram|outline|template|steps?|summary|email|script|essay|report|paragraphs?|sentence)\b/i,
    CONSTRAINT_RE: /\b(word count|words|characters|pages?|length|tone|style|formal|casual|friendly|audience|beginner|expert|deadline|limit|min|max|examples?|in the style of)\b/i,
    check(text) {
      if (text.length < 35) return null;
      if (
        !Echo.rules.missingSpecifics.FORMAT_RE.test(text) &&
        !Echo.rules.missingSpecifics.CONSTRAINT_RE.test(text)
      ) {
        const reco = (Echo.autocorrect && Echo.autocorrect.getConstraintRecommendation)
          ? Echo.autocorrect.getConstraintRecommendation(text)
          : "Format with clear sections and concise bullet points.";
        return {
          severity: "warning",
          category: "SPECIFICATIONS",
          rationale: "LLMs require explicit schema and output constraints to avoid returning unformatted walls of text.",
          message: "No output format or constraints specified.",
          tip: "Specify format (bullet points, code, JSON) and tone/length limits.",
          quickFix: {
            label: "Add recommended format",
            append: reco
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
    check(text) {
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
    if (score >= 85) return { label: "A", color: "#38bdf8" }; // Light blue for top quality
    if (score >= 70) return { label: "B", color: "#60a5fa" };
    if (score >= 50) return { label: "C", color: "#f59e0b" };
    return { label: "D", color: "#f87171" };
  },

  analyze(text, enabledRules) {
    const normalized = (text || "").trim();
    if (!normalized) {
      return { score: 0, issues: [], empty: true, text: normalized, autocorrect: null };
    }
    const issues = [];
    for (const ruleId of Echo.analyzer.RULE_ORDER) {
      const rule = Echo.rules[ruleId];
      if (!rule) continue;
      if (enabledRules && enabledRules[ruleId] === false) continue;
      const result = rule.check(normalized);
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
    for (const issue of issues) {
      score -= Echo.rules[issue.ruleId].weight;
    }

    const autocorrect = (Echo.autocorrect && Echo.autocorrect.correctFull)
      ? Echo.autocorrect.correctFull(normalized)
      : null;

    return {
      score: Math.max(0, Math.round(score)),
      issues: issues,
      empty: false,
      text: normalized,
      autocorrect: autocorrect
    };
  }
};

