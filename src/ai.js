var Echo = window.Echo = window.Echo || {};

Echo.ai = {
  PROVIDERS: {
    CHROME_NANO: "chrome_nano",
    GEMINI: "gemini",
    OPENAI: "openai",
    LOCAL_ARCHITECT: "local_architect"
  },

  SYSTEM_INSTRUCTION: `You are Echo Prompt Architect, an elite prompt engineer.
Your task is to transform raw, poorly specified, or vague user prompts into high-performance, production-grade AI prompts.

Guidelines:
1. Preserve the user's authentic core intent, domain specifics, and goals.
2. Remove conversational filler and vague phrasing ("can you help me", "i want you to", "make it good", "please").
3. Inject structured clarity: define the exact role/persona, explicit requirements, expected output format, and negative constraints (what to avoid).
4. Return ONLY the rewritten prompt. Do NOT include any meta commentary, explanations, or introductory conversational filler like "Here is your improved prompt:".`,

  async getSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(
        ["aiProvider", "geminiApiKey", "openaiApiKey", "customModel"],
        (data) => {
          resolve({
            provider: data.aiProvider || "auto",
            geminiApiKey: data.geminiApiKey || "",
            openaiApiKey: data.openaiApiKey || "",
            customModel: data.customModel || ""
          });
        }
      );
    });
  },

  async saveSettings(settings) {
    return new Promise((resolve) => {
      chrome.storage.local.set(
        {
          aiProvider: settings.provider,
          geminiApiKey: settings.geminiApiKey,
          openaiApiKey: settings.openaiApiKey,
          customModel: settings.customModel
        },
        resolve
      );
    });
  },

  async isChromeNanoAvailable() {
    try {
      if (typeof window !== "undefined" && window.ai && window.ai.languageModel) {
        const capabilities = await window.ai.languageModel.capabilities();
        return capabilities && capabilities.available !== "no";
      }
    } catch {
      return false;
    }
    return false;
  },

  buildMetaPrompt(rawPrompt, mode = "structured") {
    let modeGuideline = "";
    if (mode === "concise") {
      modeGuideline = "Format as a single concise, punchy paragraph. Direct and high-signal, zero fluff.";
    } else if (mode === "deep_reasoning") {
      modeGuideline = "Include explicit instructions for the AI to analyze edge cases, evaluate trade-offs, and explain its reasoning step-by-step before concluding.";
    } else {
      modeGuideline = "Structure into clear Markdown sections: ### Objective, ### Context & Specifications, and ### Constraints.";
    }

    return `Raw Prompt:
"""${rawPrompt}"""

Mode Requirement:
${modeGuideline}

Produce the optimized prompt now:`;
  },

  async callBackgroundWorker(rawPrompt, mode, provider, apiKey, customModel) {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage(
          {
            type: "ENHANCE_PROMPT",
            rawPrompt,
            mode,
            provider,
            apiKey,
            customModel
          },
          (res) => {
            if (chrome.runtime.lastError) {
              resolve(null);
              return;
            }
            if (res && res.success && res.text) {
              resolve(res.text);
            } else {
              resolve(null);
            }
          }
        );
      } catch {
        resolve(null);
      }
    });
  },

  async enhance(rawPrompt, mode = "structured") {
    const text = (rawPrompt || "").trim();
    if (!text) return { text: "", provider: "none" };

    const settings = await this.getSettings();

    // 1. Delegate to Background Service Worker (bypasses all webpage CSP headers)
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
      const apiKey = settings.provider === "openai" ? settings.openaiApiKey : (settings.geminiApiKey || "");
      if (apiKey) {
        try {
          const bgResult = await this.callBackgroundWorker(text, mode, settings.provider, apiKey, settings.customModel);
          if (bgResult) return { text: bgResult, provider: settings.provider };
        } catch (err) {
          console.warn("Echo AI: Background proxy failed, checking local options", err);
        }
      }
    }

    // 2. Try Chrome on-device Gemini Nano if available (0ms, 100% private, free)
    if (settings.provider === "chrome_nano" || settings.provider === "auto") {
      try {
        const nanoAvailable = await this.isChromeNanoAvailable();
        if (nanoAvailable) {
          const result = await this.callChromeNano(text, mode);
          if (result) return { text: result, provider: "chrome_nano" };
        }
      } catch (err) {
        console.warn("Echo AI: Chrome Nano failed, falling back", err);
      }
    }

    // 3. Fallback to Echo Intelligent Prompt Architect (deterministic offline)
    if (Echo.architect && Echo.architect.transform) {
      const fallback = Echo.architect.transform(text, mode);
      return { text: fallback.text, provider: "local_architect", changes: fallback.changes };
    }

    return { text, provider: "raw" };
  },

  async callChromeNano(rawPrompt, mode) {
    if (!window.ai || !window.ai.languageModel) return null;
    const session = await window.ai.languageModel.create({
      systemPrompt: this.SYSTEM_INSTRUCTION
    });
    const prompt = this.buildMetaPrompt(rawPrompt, mode);
    const response = await session.prompt(prompt);
    session.destroy();
    return (response || "").trim();
  },

  async callGemini(rawPrompt, mode, apiKey, customModel) {
    const model = customModel || "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const userPrompt = this.buildMetaPrompt(rawPrompt, mode);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: this.SYSTEM_INSTRUCTION }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024
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
  },

  async callOpenAI(rawPrompt, mode, apiKey, customModel) {
    const model = customModel || "gpt-4o-mini";
    const userPrompt = this.buildMetaPrompt(rawPrompt, mode);

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        temperature: 0.3,
        messages: [
          { role: "system", content: this.SYSTEM_INSTRUCTION },
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
};
