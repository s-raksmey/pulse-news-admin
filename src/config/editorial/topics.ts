/**
 * Optional known topics (used only for UI / navigation)
 * NOT used for strict validation anymore
 */
export const SECTION_TOPICS: Record<string, readonly string[]> = {
  world: ["asia", "europe", "africa", "middle-east"],
  tech: ["ai", "startups", "security", "gadgets"],
  business: ["markets", "economy", "companies"],
  politics: ["elections", "policy", "government"],
  sports: ["football", "basketball", "international"],
  culture: ["arts", "movies", "music"],
};

/**
 * ✅ ALLOW ALL TOPICS
 * Topic validity is determined by DB content
 */
export function isValidTopic(
  _section: string,
  topic: string
): boolean {
  return typeof topic === "string" && topic.length > 0;
}
