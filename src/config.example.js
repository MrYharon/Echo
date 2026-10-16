var Echo = (typeof globalThis !== "undefined" ? (globalThis.Echo = globalThis.Echo || {}) : {});

Echo.config = {
  GEMINI_API_KEY: "",
  PROVIDER: "gemini",
  MODEL: "gemini-flash-lite-latest"
};

if (typeof module !== "undefined") {
  module.exports = Echo.config;
}
