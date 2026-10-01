var Echo = window.Echo = window.Echo || {};

Echo.autocorrect = {
  // Conversational filler patterns that dilute prompt effectiveness
  FILLER_PREFIX_RE: /^(hey|hi|hello|please\s+)?(can\s+you\s+please\s+help\s+me|could\s+you\s+please\s+help\s+me|can\s+you\s+help\s+me|could\s+you\s+help\s+me|help\s+me\s+to|help\s+me|assist\s+me\s+with|assist\s+me|can\s+you\s+please|could\s+you\s+please|please\s+can\s+you|would\s+you\s+be\s+able\s+to|i\s+want\s+you\s+to|i\s+need\s+you\s+to|i\s+would\s+like\s+you\s+to|i'd\s+like\s+you\s+to|hey\s+can\s+you|hi\s+can\s+you|hello\s+can\s+you|can\s+you|could\s+you)\s+(please\s+)?/i,

  // Domain detectors for tailored prompt formatting
  DOMAINS: {
    code: /\b(code|script|python|javascript|typescript|react|vue|angular|node|html|css|sql|database|api|endpoint|function|class|method|regex|bug|error|refactor|algorithm|query|backend|frontend|fullstack)\b/i,
    writing: /\b(write|draft|email|letter|article|blog|essay|memo|proposal|newsletter|speech|pitch|resume|cover\s+letter|copy|headline|tagline)\b/i,
    explanation: /\b(explain|teach|how\s+does|how\s+to|what\s+is|understand|difference\s+between|overview|break\s+down|demystify)\b/i,
    analysis: /\b(analyze|review|audit|compare|contrast|evaluate|pros\s+and\s+cons|critique|benchmark|assess)\b/i
  },

  detectDomain(text) {
    for (const [domain, regex] of Object.entries(Echo.autocorrect.DOMAINS)) {
      if (regex.test(text)) return domain;
    }
    return "general";
  },

  // Returns tailored constraints when prompt lacks output structure
  getConstraintRecommendation(text) {
    const domain = Echo.autocorrect.detectDomain(text);
    switch (domain) {
      case "code":
        return "Provide clean, well-commented code with error handling and a brief explanation of key logic.";
      case "writing":
        return "Use a clear, professional tone with logical paragraph flow and no conversational filler.";
      case "explanation":
        return "Explain clearly with a real-world analogy, then summarize key takeaways in bullet points.";
      case "analysis":
        return "Structure the evaluation with clear criteria, trade-offs, and an actionable recommendation.";
      default:
        return "Structure the response with clear steps, direct answers, and bullet points.";
    }
  },

  // Pre-configured format chips for 1-click addition
  getQuickInserts() {
    return [
      {
        id: "code_format",
        label: "Code & comments",
        text: "Provide production-ready code with inline comments and error handling."
      },
      {
        id: "step_by_step",
        label: "Step-by-step",
        text: "Break down the solution into numbered, step-by-step instructions."
      },
      {
        id: "bulleted_summary",
        label: "Bullet summary",
        text: "Format key findings into a concise bulleted summary."
      },
      {
        id: "json_output",
        label: "JSON output",
        text: "Return output strictly as valid JSON with no conversational wrapper."
      },
      {
        id: "concise_tone",
        label: "Concise tone",
        text: "Keep the explanation brief, direct, and focused without unnecessary fluff."
      }
    ];
  },

  // Transform a raw prompt into a structured, high-performing AI prompt
  correctFull(text) {
    const raw = (text || "").trim();
    if (!raw) {
      return { original: raw, corrected: raw, changed: false, changes: [] };
    }

    const changes = [];
    let updated = raw;

    // 1. Strip conversational filler prefix
    const fillerMatch = updated.match(Echo.autocorrect.FILLER_PREFIX_RE);
    if (fillerMatch) {
      const matchedPrefix = fillerMatch[0];
      updated = updated.slice(matchedPrefix.length).trim();
      changes.push({
        type: "prefix",
        title: "Removed filler prefix",
        original: matchedPrefix.trim(),
        replacement: ""
      });
    }

    // Capitalize first character
    if (updated.length > 0) {
      updated = updated.charAt(0).toUpperCase() + updated.slice(1);
    }

    // 2. Upgrade weak starting verbs
    const domain = Echo.autocorrect.detectDomain(updated);
    const weakStarters = [
      {
        re: /^Make\s+(a\s+|an\s+|the\s+)?/i,
        replacement: (m, art) => (domain === "code" ? "Build " : domain === "writing" ? "Draft " : "Create ") + (art || ""),
        title: "Replaced weak verb 'Make' with direct action"
      },
      {
        re: /^Do\s+(a\s+|an\s+|the\s+)?/i,
        replacement: (m, art) => "Execute " + (art || ""),
        title: "Replaced generic 'Do' with directive action"
      },
      {
        re: /^Fix\s+(my\s+|the\s+)?(bug\s+in\s+|error\s+in\s+|issue\s+in\s+)?/i,
        replacement: "Debug and resolve the issue in ",
        title: "Clarified debugging objective"
      },
      {
        re: /^Give\s+me\s+(a\s+|an\s+|the\s+|some\s+)?/i,
        replacement: (m, art) => "Provide " + (art || ""),
        title: "Standardized request to 'Provide'"
      },
      {
        re: /^Tell\s+me\s+(about\s+)?/i,
        replacement: "Explain ",
        title: "Specified explanation directive"
      },
      {
        re: /^Look\s+at\s+(this\s+|the\s+)?/i,
        replacement: "Review and evaluate ",
        title: "Strengthened review request"
      },
      {
        re: /^What\s+is\s+/i,
        replacement: "Explain ",
        title: "Converted question to direct explanation"
      },
      {
        re: /^How\s+does\s+/i,
        replacement: "Explain the mechanics and operation of ",
        title: "Converted question to direct explanation"
      },
      {
        re: /^How\s+to\s+/i,
        replacement: "Demonstrate step-by-step how to ",
        title: "Converted question to direct tutorial"
      }
    ];

    for (const ws of weakStarters) {
      if (ws.re.test(updated)) {
        const prev = updated;
        const rep = typeof ws.replacement === "function" ? ws.replacement : () => ws.replacement;
        updated = updated.replace(ws.re, rep);
        changes.push({
          type: "verb",
          title: ws.title,
          original: prev.substring(0, 15),
          replacement: updated.substring(0, 15)
        });
        break;
      }
    }

    // 3. Replace vague phrasing
    const vagueReplacements = [
      {
        re: /\bhelp me\b/gi,
        rep: "assist by providing",
        title: "Clarified 'help me'"
      },
      {
        re: /\bsomething good\b/gi,
        rep: "high-quality, production-ready specifications",
        title: "Replaced vague 'something good'"
      },
      {
        re: /\bsomething nice\b/gi,
        rep: "a clean, polished implementation",
        title: "Replaced vague 'something nice'"
      },
      {
        re: /\bmake it good\b/gi,
        rep: "Ensure high quality and clean structure",
        title: "Replaced vague 'make it good'"
      },
      {
        re: /\bstuff about\b/gi,
        rep: "essential details regarding",
        title: "Replaced vague 'stuff about'"
      },
      {
        re: /\bthings about\b/gi,
        rep: "core concepts and specifications for",
        title: "Replaced vague 'things about'"
      },
      {
        re: /\betc(\.|\.\.\.)?\b/gi,
        rep: "and associated edge cases",
        title: "Clarified open-ended 'etc'"
      },
      {
        re: /\band so on\b/gi,
        rep: "along with supporting requirements",
        title: "Clarified 'and so on'"
      }
    ];

    for (const vr of vagueReplacements) {
      if (vr.re.test(updated)) {
        updated = updated.replace(vr.re, vr.rep);
        changes.push({
          type: "clarity",
          title: vr.title,
          replacement: vr.rep
        });
      }
    }

    // 4. Ensure trailing punctuation on base sentence
    if (updated && !/[.!?]$/.test(updated)) {
      updated += ".";
    }

    // 5. Append output constraints if missing
    const hasConstraint = Echo.rules.missingSpecifics.CONSTRAINT_RE.test(updated);
    const hasExplicitFormat = /\b(in\s+json|as\s+json|in\s+markdown|bullets?|numbered\s+list|table\s+format|step-by-step|well-commented|error\s+handling|code\s+comments)\b/i.test(updated);
    if ((!hasConstraint || !hasExplicitFormat) && updated.length >= 20) {
      const constraint = Echo.autocorrect.getConstraintRecommendation(updated);
      // Avoid duplicate appending if text already has similar wording
      if (!updated.toLowerCase().includes(constraint.toLowerCase().slice(0, 20))) {
        updated += " " + constraint;
        changes.push({
          type: "constraint",
          title: "Added output constraints and format guidelines",
          replacement: constraint
        });
      }
    }

    const changed = raw !== updated;
    return {
      original: raw,
      corrected: updated,
      changed: changed,
      changes: changes
    };
  }
};
