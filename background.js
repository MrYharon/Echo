// Echo - Background Service Worker (Manifest V3)
// Handles external API requests without webpage CSP restrictions and listens for global commands.

const SYSTEM_COMPILER_INSTRUCTION = `You are Echo's Master Prompt Compiler.
Your sole job is to transform raw, unstructured human thought dumps and prompts into high-performance, unambiguous prompts for LLMs.

Rules:
1. IDENTIFY THE CORE OBJECTIVE:
   - Isolate what the user actually wants to accomplish.
   - Ignore conversational filler ("I mean", "you know", "OK", "and stuff", "right?").
   - Distinguish hypothetical examples and analogies from the actual request.

2. EXTRACT NEGATIVE CONSTRAINTS (CRITICAL):
   - Any phrase indicating what NOT to do ("Don't write code", "Keep it simple", "No dependencies") MUST be promoted into an explicit "Constraints" section so the target LLM does not violate it.

3. STRUCTURE AND PRIORITIZE:
   - For structured mode, format with clean Markdown sections:
     ### Objective
     (Clear, authoritative single directive)
     ### Core Tasks / Questions
     (Numbered list of exact asks)
     ### Context & Specifications
     (Technical requirements, technologies, frameworks)
     ### Constraints
     (Explicit negative rules, latency, format boundaries)
   - For concise mode, distill everything into a single dense, high-signal paragraph with zero conversational filler.
   - For deep reasoning mode, instruct the target LLM to explicitly analyze trade-offs, state assumptions, and evaluate edge cases before delivering its answer.

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
  const model = customModel || "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
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
  const model = customModel || "gpt-4o-mini";
  const userPrompt = buildMetaPrompt(rawPrompt, mode);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
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

// Runtime message router
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "ENHANCE_PROMPT") {
    const { rawPrompt, mode = "structured", provider = "auto", apiKey, customModel } = request;

    // Check cache
    const cacheKey = `${mode}:${provider}:${rawPrompt.trim().toLowerCase()}`;
    if (promptCache.has(cacheKey)) {
      sendResponse({ success: true, text: promptCache.get(cacheKey), cached: true, provider });
      return true;
    }

    (async () => {
      try {
        let enhancedText = null;

        if (apiKey && (provider === "gemini" || provider === "auto")) {
          enhancedText = await callGemini(rawPrompt, mode, apiKey, customModel);
        } else if (apiKey && provider === "openai") {
          enhancedText = await callOpenAI(rawPrompt, mode, apiKey, customModel);
        }

        if (enhancedText) {
          promptCache.set(cacheKey, enhancedText);
          sendResponse({ success: true, text: enhancedText, provider });
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
