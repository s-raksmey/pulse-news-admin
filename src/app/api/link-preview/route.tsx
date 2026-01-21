import type { NextRequest } from "next/server";

function json(data: any) {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}

/* -------------------------
   GET (Editor.js LinkTool)
------------------------- */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return json({ success: 0 });
  }

  return handleLinkPreview(url);
}

/* -------------------------
   POST (Optional support)
------------------------- */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const url = body?.url;

  if (!url) {
    return json({ success: 0 });
  }

  return handleLinkPreview(url);
}

/* -------------------------
   Preview handler
------------------------- */
async function handleLinkPreview(url: string) {
  try {
    // Allow only trusted services
    if (
      !url.includes("youtube.com") &&
      !url.includes("youtu.be") &&
      !url.includes("facebook.com") &&
      !url.includes("instagram.com")
    ) {
      return json({ success: 0 });
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const html = await res.text();

    const title =
      html.match(/<title>(.*?)<\/title>/i)?.[1] ?? url;

    const description =
      html.match(
        /<meta\s+name=["']description["']\s+content=["'](.*?)["']/i
      )?.[1] ?? "";

    const image =
      html.match(
        /<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i
      )?.[1] ?? "";

    return json({
      success: 1,
      meta: {
        title,
        description,
        image: image ? { url: image } : undefined,
      },
    });
  } catch {
    return json({ success: 0 });
  }
}
