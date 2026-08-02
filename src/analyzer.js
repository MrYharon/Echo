var Echo = window.Echo = window.Echo || {};

Echo.rules = {
  tooShort: {
    id: "tooShort",
    name: "Concrete task",
    weight: 40,
    check(text) {
      if (text.length < 12) {
        return {
          severity: "error",
          message:
            "Your prompt is very short. Add a concrete task and the result you want back.",
          tip: 'Try: "Write a 200-word product launch email for our customers in a friendly tone."'
        };
      }
      return null;
    }
  },

  weakVerbs: {
    id: "weakVerbs",
    name: "Vague language",
    weight: 20,
    patterns: [
      {
        re: /\b(help me|assist me|assist with)\b/i,
        tip: "Say exactly what to do instead of \"help\"."
      },
      {
        re: /\b(something|anything|stuff|things?|whatever)\b/i,
        tip: "Name the specific subject or data."
      },
      {
        re: /\b(nice|good|great|better|fine)\b/i,
        tip: "Describe the quality you want instead of \"good\"."
      },
      {
        re: /\b(etc(\.|\.\.\.)?|and so on|etcetera)\b/i,
        tip: "List the items explicitly."
      }
    ],
    check(text) {
      for (const p of Echo.rules.weakVerbs.patterns) {
        const m = p.re.exec(text);
        if (m) {
          return {
            severity: "warning",
            message: 'Vague word or phrase: "' + m[0] + '".',
            tip: p.tip
          };
        }
      }
      return null;
    }
  },

  actionVerb: {
    id: "actionVerb",
    name: "Action verb",
    weight: 15,
    VERBS: new Set([
      "write", "create", "draft", "summarize", "explain", "analyze",
      "compare", "contrast", "list", "translate", "fix", "debug",
      "generate", "produce", "design", "plan", "review", "rewrite",
      "improve", "outline", "extract", "classify", "convert", "define",
      "describe", "evaluate", "interpret", "recommend", "refactor",
      "structure", "brainstorm", "simplify", "check", "proofread", "edit"
    ]),
    PREFIXES: /\b(please|can you|could you|could i|can i|hey|hi|hello|i want you to|i need you to)\b/i,
    check(text) {
      if (text.length < 12) return null;
      const stripped = text.replace(Echo.rules.actionVerb.PREFIXES, "").trim();
      const firstWord = stripped.split(/\s+/)[0];
      if (firstWord && !Echo.rules.actionVerb.VERBS.has(firstWord.toLowerCase())) {
        return {
          severity: "suggestion",
          message:
            'Start with a clear action verb. You began with "' + firstWord + '".',
          tip: "Verbs like summarize, write, compare, list, or fix make your intent explicit."
        };
      }
      return null;
    }
  },

  missingSpecifics: {
    id: "missingSpecifics",
    name: "Constraints & format",
    weight: 20,
    FORMAT_RE: /\b(list|table|json|csv|bullets?|headings?|code|markdown|diagram|outline|template|steps?|summary|email|script|essay|report|paragraphs?|sentence)\b/i,
    CONSTRAINT_RE: /\b(word count|words|characters|pages?|length|tone|style|formal|casual|friendly|audience|beginner|expert|deadline|limit|min|max|examples?|in the style of)\b/i,
    check(text) {
      if (text.length < 40) return null;
      if (
        !Echo.rules.missingSpecifics.FORMAT_RE.test(text) &&
        !Echo.rules.missingSpecifics.CONSTRAINT_RE.test(text)
      ) {
        return {
          severity: "warning",
          message: "No output format or constraints found.",
          tip: "Add the format (list, table, JSON, essay) and limits (length, tone, audience)."
        };
      }
      return null;
    }
  },

  multipleAsks: {
    id: "multipleAsks",
    name: "One ask at a time",
    weight: 10,
    check(text) {
      const questions = (text.match(/\?/g) || []).length;
      if (questions >= 2) {
        return {
          severity: "suggestion",
          message:
            questions +
            " questions in one prompt.",
          tip: "Split them into separate prompts, or number them so the AI answers each clearly."
        };
      }
      return null;
    }
  }
};

Echo.analyzer = {
  RULE_ORDER: ["tooShort", "weakVerbs", "actionVerb", "missingSpecifics", "multipleAsks"],

  grade(score) {
    if (score >= 85) return { label: "A", color: "#22c55e" };
    if (score >= 70) return { label: "B", color: "#84cc16" };
    if (score >= 50) return { label: "C", color: "#eab308" };
    return { label: "D", color: "#ef4444" };
  },

  analyze(text, enabledRules) {
    const normalized = (text || "").trim();
    if (!normalized) {
      return { score: 0, issues: [], empty: true, text: normalized };
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
          severity: result.severity,
          message: result.message,
          tip: result.tip
        });
      }
    }
    let score = 100;
    for (const issue of issues) {
      score -= Echo.rules[issue.ruleId].weight;
    }
    return {
      score: Math.max(0, Math.round(score)),
      issues: issues,
      empty: false,
      text: normalized
    };
  }
};
