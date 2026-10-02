"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import MenuLateral from "@/app/components/menuLateral/menuLateral";
import YouTubePlayer from "@/app/components/YouTubePlayer";
import { ChurchSong, getChurchSong } from "@/app/api/churchSongs";
export default function Page() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const router = useRouter();
  const [song, setSong] = useState<ChurchSong | null>(null);
  const [tab, setTab] = useState<"letra" | "cifra" | "youtube">("letra");
  const [error, setError] = useState("");
  useEffect(() => { let active = true; getChurchSong(id).then(data => { if (active) setSong(data); }).catch(() => { if (active) setError("Não foi possível abrir o hino."); }); return () => { active = false; }; }, [id]);
  const project = (mode: string) => `/pages/projecao?${new URLSearchParams({ tipo: "igreja", id, modo: mode })}`;
  async function startProjection(mode: string) {
    try { if (!document.fullscreenElement) await document.documentElement.requestFullscreen(); } catch { /* Browser may deny fullscreen; projection still opens. */ }
    router.push(project(mode));
  }
  return <main className="flex min-h-screen bg-white"><MenuLateral /><section className="w-full max-w-5xl px-6 py-9 sm:px-10"><Link href="/pages/hinos-igreja" className="text-sm text-gray-400">Hinos da Igreja ›</Link>{error ? <p role="alert" className="mt-8 text-red-600">{error}</p> : !song ? <p className="mt-8">Carregando hino...</p> : <>{params.get("duplicado") === "1" && <p role="status" className="mt-5 rounded-lg bg-amber-50 p-4 text-amber-900">Hino salvo. Há títulos semelhantes nesta igreja.</p>}<div className="mt-4 flex flex-wrap justify-between gap-4"><div><h1 className="text-4xl text1">{song.titulo}</h1><p className="mt-2 text-gray-500">Autor: {song.autorInformado || "Não informado"}</p></div><Link href={`/pages/hinos-igreja/${id}/editar`} className="text-[#285775] underline">Editar</Link></div><div className="mt-8 flex flex-wrap gap-2">{(["letra", "cifra", "youtube"] as const).map(option => <button key={option} onClick={() => setTab(option)} className={`rounded-lg px-5 py-2 capitalize ${tab === option ? "bg-[#285775] text-white" : "bg-[#eef8ff] text-[#285775]"}`}>{option === "youtube" ? "YouTube" : option}</button>)}</div><div className="mt-6 min-h-40 rounded-xl border p-6">{tab === "letra" ? <p className="whitespace-pre-wrap">{song.letra || "Letra indisponível"}</p> : tab === "cifra" ? <pre className="whitespace-pre-wrap font-mono">{song.cifra || "Cifra indisponível"}</pre> : song.youtube?.videoId ? <YouTubePlayer videoId={song.youtube.videoId} /> : <p>Vídeo não cadastrado</p>}</div><div className="mt-6 flex flex-wrap gap-3">{song.letra && <button type="button" onClick={() => void startProjection("letra")} className="rounded-lg bg-[#285775] px-5 py-3 text-white">Projetar letra</button>}{song.youtube?.videoId && <button type="button" onClick={() => void startProjection("youtube")} className="rounded-lg bg-[#285775] px-5 py-3 text-white">Projetar YouTube</button>}</div></>}</section></main>;
}
