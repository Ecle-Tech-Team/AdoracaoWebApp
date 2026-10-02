export default function YouTubePlayer({ videoId, autoplay = false }: { videoId: string; autoplay?: boolean }) {
  if (!/^[A-Za-z0-9_-]{6,11}$/.test(videoId)) return null;
  const src = `https://www.youtube.com/embed/${videoId}${autoplay ? "?autoplay=1" : ""}`;
  return <div className="aspect-video w-full overflow-hidden rounded-lg bg-black"><iframe className="h-full w-full" src={src} title="Vídeo do YouTube" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></div>;
}
