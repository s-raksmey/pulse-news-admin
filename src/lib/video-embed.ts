export function videoUrlToEmbed(url: string): string | null {
  try {
    // YouTube
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split(/[?&]/)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (url.includes("youtube.com")) {
      const id = new URL(url).searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    // Facebook
    if (url.includes("facebook.com") || url.includes("fb.watch")) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
        url
      )}&show_text=0`;
    }

    // Instagram
    if (url.includes("instagram.com")) {
      const clean = url.replace(/\?.*$/, "").replace(/\/$/, "");
      const m = clean.match(/\/(p|reel)\/([^/]+)/);
      if (!m) return null;
      return `https://www.instagram.com/${m[1]}/${m[2]}/embed`;
    }
  } catch {
    return null;
  }

  return null;
}
