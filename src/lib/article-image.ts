export function getArticleImage(a: any): string | null {
  return a?.coverImageUrl || a?.ogImageUrl || null;
}