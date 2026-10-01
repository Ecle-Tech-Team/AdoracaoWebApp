export function extractYouTubeVideoId(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    const host = url.hostname.toLowerCase();
    let id: string | null | undefined;
    if (host === "youtu.be") id = /^\/([^/]+)\/?$/.exec(url.pathname)?.[1];
    else if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(host)) {
      if (url.pathname === "/watch") id = url.searchParams.get("v");
      else id = /^\/(?:embed|shorts)\/([^/]+)\/?$/.exec(url.pathname)?.[1];
    }
    return id && /^[A-Za-z0-9_-]{6,11}$/.test(id) ? id : null;
  } catch { return null; }
}

export function parseLyricsToSlides(lyrics: string): string[] {
  return lyrics.replace(/\r\n?/g, "\n").trim().split(/\n\s*\n+/).map(block => block.trim()).filter(Boolean);
}
