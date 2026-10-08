class MultiParagraphAnalyzer {
  constructor() {
    this.TECH_PATTERNS = {
      languages: /\b(python|javascript|typescript|golang|go|rust|java|c\+\+|c#|ruby|php|sql|bash|shell)\b/gi,
      frameworks: /\b(react|next\.js|nextjs|vue|angular|svelte|node\.js|nodejs|express|fastapi|django|flask|spring\s+boot|rails|laravel)\b/gi,
      databases: /\b(postgres|postgresql|mysql|sqlite|mongodb|redis|dynamodb|cassandra|supabase|prisma|elasticsearch)\b/gi,
      infrastructure: /\b(docker|kubernetes|k8s|aws|gcp|azure|terraform|kafka|rabbitmq|graphql|grpc|rest\s+api|websocket)\b/gi
    };
  }

  extractEntities(text) {
    const entities = {
      languages: [],
      frameworks: [],
      databases: [],
      infrastructure: []
    };

    for (const [category, regex] of Object.entries(this.TECH_PATTERNS)) {
      const matches = text.match(regex) || [];
      const unique = Array.from(new Set(matches.map((m) => m.toLowerCase().trim())));
      entities[category] = unique;
    }

    return entities;
  }

  detectAmbiguities(text, entities) {
    const issues = [];
    const lower = text.toLowerCase();

    // Check for unstated database
    const mentionsStorage = /\b(store|save|database|persist|record|db)\b/i.test(lower);
    if (mentionsStorage && entities.databases.length === 0) {
      issues.push({
        type: "missing_prerequisite",
        category: "Storage",
        message: "Prompt requests data storage or database operations without naming a target engine (e.g., PostgreSQL, Redis, MongoDB).",
        recommendation: "Specify the exact database engine and schema expectations."
      });
    }

    // Check for unstated API protocol
    const mentionsApi = /\b(api|endpoint|backend\s+service|microservice)\b/i.test(lower);
    if (mentionsApi && !/\b(rest|graphql|grpc|webhook|websocket)\b/i.test(lower)) {
      issues.push({
        type: "missing_prerequisite",
        category: "API Protocol",
        message: "Prompt asks to build or consume an API without specifying the protocol (REST, GraphQL, gRPC).",
        recommendation: "Define the communication protocol and serialization format (e.g., REST with JSON)."
      });
    }

    // Check for missing failure & error-handling bounds
    const mentionsNetworkOrScraping = /\b(scrape|crawler|fetch|http|request|external\s+service)\b/i.test(lower);
    const mentionsErrorHandling = /\b(retry|backoff|error\s+handling|exception|fault|timeout)\b/i.test(lower);
    if (mentionsNetworkOrScraping && !mentionsErrorHandling) {
      issues.push({
        type: "unspecified_edge_case",
        category: "Reliability",
        message: "Network operations or web scraping requested without retry policies or error-handling guidelines.",
        recommendation: "Instruct the AI to handle rate limits, network timeouts, and non-200 HTTP responses."
      });
    }

    // Check for conflicting speed vs simplicity constraints
    const wantsRealtime = /\b(realtime|real-time|instant|low\s+latency|sub-millisecond)\b/i.test(lower);
    const rejectsInfra = /\b(no\s+redis|no\s+cache|simple\s+script|single\s+file|no\s+dependencies)\b/i.test(lower);
    if (wantsRealtime && rejectsInfra) {
      issues.push({
        type: "contradiction",
        category: "Architecture",
        message: "Prompt demands ultra-low latency real-time performance while simultaneously restricting caching or external dependencies.",
        recommendation: "Clarify whether an in-memory store or caching layer is permissible for performance."
      });
    }

    return issues;
  }

  analyze(rawText) {
    const text = (rawText || "").trim();
    if (!text) {
      return {
        wordCount: 0,
        paragraphCount: 0,
        entities: {},
        ambiguities: [],
        clarityScore: 0
      };
    }

    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    const words = text.split(/\s+/).filter(Boolean);
    const entities = this.extractEntities(text);
    const ambiguities = this.detectAmbiguities(text, entities);

    // Compute clarity score penalizing ambiguities and reward explicit entities
    let score = 90;
    score -= ambiguities.length * 15;
    if (words.length < 15) score -= 25;
    if (entities.languages.length > 0 || entities.frameworks.length > 0) score += 5;

    return {
      wordCount: words.length,
      paragraphCount: paragraphs.length,
      paragraphs: paragraphs,
      entities: entities,
      ambiguities: ambiguities,
      clarityScore: Math.max(10, Math.min(100, score))
    };
  }
}

module.exports = new MultiParagraphAnalyzer();
