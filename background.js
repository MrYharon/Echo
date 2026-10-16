// Echo - Background Service Worker (Manifest V3)
// Handles external API requests without webpage CSP restrictions and listens for global commands.

try {
  importScripts("src/config.local.js");
} catch (e) {
  try {
    importScripts("src/config.example.js");
  } catch (err) {}
}

function getActiveConfig() {
  const cfg = (typeof Echo !== "undefined" && Echo.config) ? Echo.config : {};
  return {
    apiKey: cfg.GEMINI_API_KEY || "",
    openaiKey: cfg.OPENAI_API_KEY || "",
    model: cfg.MODEL || "gemini-flash-lite-latest",
    provider: cfg.PROVIDER || "gemini"
  };
}

const SYSTEM_COMPILER_INSTRUCTION = `You are Echo's Master Prompt Compiler.
Your sole job is to transform raw, unstructured human thought dumps and prompts into high-performance, unambiguous prompts for LLMs.

Rules:
1. DOMAIN & PERSONA ACCURACY (CRITICAL):
   - Identify the user's domain and assign an expert persona tailored to the subject (e.g. if the user wants psychology exam preparation, act as an expert Psychology Professor/Exam Designer; if writing an essay, act as an Essayist/Editor; if law, act as an Attorney).
   - NEVER default to software engineer, developer, or writing code unless the user explicitly requested programming or technical development.

2. PRESERVE ALL CONSTRAINTS AND FORMAT RULES:
   - Faithfully promote all user negative constraints (e.g. no bolding, no dollar signs, specific option format A-D, difficulty level, length limits, anti-patterns).
   - Do NOT inject unrelated technical jargon like "modular code", "error handling", or "types" into non-coding prompts.

3. STRUCTURE AND PRIORITIZE:
   - For structured mode, format with clean Markdown sections:
     ### Objective
     (Clear, authoritative directive)
     ### Core Tasks / Questions
     (Numbered list of exact asks)
     ### Instructions & Specifications
     (Domain guidelines, scenario requirements, format constraints)
     ### Constraints
     (Explicit negative rules, format boundaries)
   - For concise mode, distill everything into a single dense, high-signal paragraph with zero conversational filler.
   - For deep reasoning mode, instruct the target LLM to analyze edge cases, state assumptions, and evaluate trade-offs before delivering its answer.

4. OUTPUT ONLY THE ENHANCED PROMPT:
   - Do NOT include any preamble like "Here is your improved prompt:".
   - Do NOT explain your changes or apologize.`;

// In-memory cache for the service worker lifetime
const promptCache = new Map();

function buildMetaPrompt(rawPrompt, mode = "structured") {
  let modeRequirement = "";
  if (mode === "concise") {
    modeRequirement = "Format: A single concise, punchy paragraph. Direct and high-signal, zero conversational filler.";
  } else if (mode === "deep_reasoning") {
    modeRequirement = "Format: Structured markdown. Explicitly instruct the target LLM to analyze edge cases, state assumptions, and evaluate trade-offs before delivering final output.";
  } else {
    modeRequirement = "Format: Full structured markdown with ### Objective, ### Core Tasks / Questions, ### Context & Specifications, and ### Constraints.";
  }

  return `Raw User Input:
"""${rawPrompt}"""

Mode Requirement:
${modeRequirement}

Decompile and synthesize the optimized prompt now:`;
}

async function callGemini(rawPrompt, mode, apiKey, customModel) {
  const activeCfg = getActiveConfig();
  const effectiveKey = apiKey || activeCfg.apiKey;
  const model = customModel || activeCfg.model || "gemini-flash-lite-latest";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(effectiveKey)}`;
  const userPrompt = buildMetaPrompt(rawPrompt, mode);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: SYSTEM_COMPILER_INSTRUCTION }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1500
      }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const candidate = data.candidates && data.candidates[0];
  const text = candidate && candidate.content && candidate.content.parts && candidate.content.parts[0] && candidate.content.parts[0].text;
  return (text || "").trim();
}

async function callOpenAI(rawPrompt, mode, apiKey, customModel) {
  const activeCfg = getActiveConfig();
  const effectiveKey = apiKey || activeCfg.openaiKey;
  const model = customModel || "gpt-4o-mini";
  const userPrompt = buildMetaPrompt(rawPrompt, mode);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${effectiveKey}`
    },
    body: JSON.stringify({
      model: model,
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_COMPILER_INSTRUCTION },
        { role: "user", content: userPrompt }
      ]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  return (text || "").trim();
}

const COACH_SYSTEM_INSTRUCTION = `You are Echo Cognitive Prompt Coach.
Your mission is to evaluate user prompts in real time, determine whether they will cause LLM hallucination, conversational stalling, or wasted round-trip turns, and coach the user to make them direct and airtight.

EVALUATION RULES:
1. "ready" (Score 85-100, Grade A): The prompt has a clear action verb AND a specific topic/payload. It can be answered in one turn without clarification.
2. "incomplete" (Score 20-50, Grade D): Empty pings or conversational pleasantries without a task payload (e.g., "can you help me with something?", "can I ask a question?", "hello are you there?"). These waste an entire conversational turn.
3. "vague" (Score 50-70, Grade C): Prompts with ambiguous pronouns, missing referents, or unspecified scope (e.g., "but what about the others?", "how does it work?", "tell me about stuff").
4. "complex" (Score 60-80, Grade B/C): Multi-task prompts or text transformation requests (e.g., "rewrite this essay...") that need explicit constraints, tone, or format.

Respond ONLY with a valid JSON object matching this schema, without code fences:
{
  "status": "ready" | "vague" | "incomplete" | "complex",
  "score": 0-100,
  "grade": "A" | "B" | "C" | "D",
  "intent": "empty_ping" | "vague_inquiry" | "direct_query" | "text_transform" | "complex_build",
  "critique": "Concise 1-2 sentence coaching advice explaining why this prompt succeeds or fails",
  "completions": [
    { "label": "+ short label", "insertText": " text to append" }
  ],
  "compiledContract": "Airtight rewritten prompt with clear directives and constraints"
}`;

async function callGeminiCoach(rawPrompt, apiKey, customModel) {
  const activeCfg = getActiveConfig();
  const effectiveKey = apiKey || activeCfg.apiKey;
  const model = customModel || activeCfg.model || "gemini-flash-lite-latest";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(effectiveKey)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: COACH_SYSTEM_INSTRUCTION }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: `Evaluate this prompt for clarity and round-trip efficiency:\n"""${rawPrompt}"""` }]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1000,
        responseMimeType: "application/json"
      }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini Coach error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text;
  return JSON.parse(text);
}

async function callOpenAICoach(rawPrompt, apiKey, customModel) {
  const activeCfg = getActiveConfig();
  const effectiveKey = apiKey || activeCfg.openaiKey;
  const model = customModel || "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${effectiveKey}`
    },
    body: JSON.stringify({
      model: model,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: COACH_SYSTEM_INSTRUCTION },
        { role: "user", content: `Evaluate this prompt for clarity and round-trip efficiency:\n"""${rawPrompt}"""` }
      ]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI Coach error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  return JSON.parse(text);
}

// Runtime message router
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "COACH_EVALUATE_PROMPT") {
    const activeCfg = getActiveConfig();
    const effectiveKey = request.apiKey || activeCfg.apiKey;
    const effectiveModel = request.customModel || activeCfg.model;
    const effectiveProvider = (!request.provider || request.provider === "auto") ? activeCfg.provider : request.provider;
    const cacheKey = `coach:${effectiveProvider}:${request.rawPrompt.trim().toLowerCase()}`;

    if (promptCache.has(cacheKey)) {
      sendResponse({ success: true, evaluation: promptCache.get(cacheKey), cached: true });
      return true;
    }

    (async () => {
      try {
        let evaluation = null;
        if (effectiveKey && (effectiveProvider === "gemini" || effectiveProvider === "auto")) {
          evaluation = await callGeminiCoach(request.rawPrompt, effectiveKey, effectiveModel);
        } else if (effectiveKey && effectiveProvider === "openai") {
          evaluation = await callOpenAICoach(request.rawPrompt, effectiveKey, effectiveModel);
        }

        if (evaluation) {
          promptCache.set(cacheKey, evaluation);
          sendResponse({ success: true, evaluation });
        } else {
          sendResponse({ success: false, error: "No API key configured for AI evaluation" });
        }
      } catch (err) {
        console.error("Echo Coach Error:", err);
        sendResponse({ success: false, error: err.message || "Evaluation failed" });
      }
    })();

    return true;
  }

  if (request.type === "ENHANCE_PROMPT") {
    const { rawPrompt, mode = "structured" } = request;
    const activeCfg = getActiveConfig();
    const effectiveKey = request.apiKey || (activeCfg.provider === "openai" ? activeCfg.openaiKey : activeCfg.apiKey);
    const effectiveModel = request.customModel || activeCfg.model;
    const effectiveProvider = (!request.provider || request.provider === "auto") ? activeCfg.provider : request.provider;

    // Check cache
    const cacheKey = `${mode}:${effectiveProvider}:${rawPrompt.trim().toLowerCase()}`;
    if (promptCache.has(cacheKey)) {
      sendResponse({ success: true, text: promptCache.get(cacheKey), cached: true, provider: effectiveProvider });
      return true;
    }

    (async () => {
      try {
        let enhancedText = null;

        if (effectiveKey && (effectiveProvider === "gemini" || effectiveProvider === "auto")) {
          enhancedText = await callGemini(rawPrompt, mode, effectiveKey, effectiveModel);
        } else if (effectiveKey && effectiveProvider === "openai") {
          enhancedText = await callOpenAI(rawPrompt, mode, effectiveKey, effectiveModel);
        }

        if (enhancedText) {
          promptCache.set(cacheKey, enhancedText);
          sendResponse({ success: true, text: enhancedText, provider: effectiveProvider });
        } else {
          sendResponse({ success: false, error: "No provider or API key available" });
        }
      } catch (err) {
        console.error("Echo Background Error:", err);
        sendResponse({ success: false, error: err.message || "Compilation failed" });
      }
    })();

    return true; // Keep channel open for async response
  }
});

// Global shortcut command handler
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-autocorrect") {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: "TRIGGER_AUTOCORRECT" }).catch(() => {});
    }
  }
});
