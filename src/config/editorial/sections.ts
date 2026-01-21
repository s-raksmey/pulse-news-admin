export const SECTIONS = [
  "world",
  "tech",
  "business",
  "politics",
  "sports",
  "culture",
  "health",
  "science",
  "education",
  "opinion",
] as const;

export type Section = (typeof SECTIONS)[number];

export function isValidSection(value: string): value is Section {
  return SECTIONS.includes(value as Section);
}
