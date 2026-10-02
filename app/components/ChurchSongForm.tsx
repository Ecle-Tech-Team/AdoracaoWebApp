"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MenuLateral from "./menuLateral/menuLateral";
import YouTubePlayer from "./YouTubePlayer";
import { ChurchSong, ChurchSongInput, createChurchSong, deleteChurchSong, getChurchSong, updateChurchSong } from "@/app/api/churchSongs";
import { extractYouTubeVideoId } from "@/app/lib/churchSongs";

const empty: ChurchSongInput = { titulo: "", autorInformado: "", letra: "", cifra: "", youtubeUrl: "", tipoDireitos: "uso_interno", confirmacaoDireitos: false };
export default function ChurchSongForm({ id }: { id?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<ChurchSongInput>(empty);
  const [original, setOriginal] = useState<ChurchSong | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  useEffect(() => { if (!id) return; let active = true; getChurchSong(id).then(song => { if (!active) return; setOriginal(song); setForm({ titulo: song.titulo, autorInformado: song.autorInformado || "", letra: song.letra || "", cifra: song.cifra || "", youtubeUrl: song.youtube?.url || "", tipoDireitos: song.direitos?.tipo || "uso_interno", confirmacaoDireitos: false }); }).catch(() => { if (active) setError("Não foi possível carregar o hino."); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [id]);
  const videoId = form.youtubeUrl ? extractYouTubeVideoId(form.youtubeUrl) : null;
  const textChanged = !original || form.letra !== (original.letra || "") || form.cifra !== (original.cifra || "");
  const needsRights = Boolean((form.letra.trim() || form.cifra.trim()) && textChanged);
  const set = <K extends keyof ChurchSongInput>(key: K, value: ChurchSongInput[K]) => setForm(current => ({ ...current, [key]: value }));
  async function save(event: React.FormEvent) {
    event.preventDefault(); setError(""); setSuccess("");
    if (form.youtubeUrl && !videoId) { setError("Link do YouTube inválido."); return; }
    if (needsRights && !form.confirmacaoDireitos) { setError("Confirme os direitos de uso da letra ou cifra."); return; }
    setSaving(true);
    try {
      if (id) { await updateChurchSong(id, form); setSuccess("Hino atualizado."); router.push(`/pages/hinos-igreja/${id}`); }
      else { const result = await createChurchSong(form); router.push(`/pages/hinos-igreja/${result.song._id}${result.possibleDuplicate ? "?duplicado=1" : ""}`); }
    } catch (err: unknown) { const response = err as { response?: { data?: { message?: string } } }; setError(response.response?.data?.message || "Não foi possível salvar o hino."); }
    finally { setSaving(false); }
  }
  async function remove() { if (!id || !window.confirm("Remover este hino da biblioteca?")) return; try { await deleteChurchSong(id); router.push("/pages/hinos-igreja"); } catch { setError("Não foi possível remover o hino."); } }
  const input = "w-full rounded-lg border border-gray-300 px-4 py-3 outline-[#285775]";
  return <main className="flex min-h-screen bg-white"><MenuLateral /><section className="w-full max-w-4xl px-6 py-9 sm:px-10"><Link href="/pages/hinos-igreja" className="text-sm text-gray-400">Hinos da Igreja ›</Link><h1 className="mt-4 text-4xl text1">{id ? "Editar hino" : "Novo hino"}</h1>
    {loading ? <p className="mt-8">Carregando...</p> : <form onSubmit={save} className="mt-8 space-y-5"><label className="block">Título *<input required maxLength={200} className={input} value={form.titulo} onChange={e => set("titulo", e.target.value)} /></label><label className="block">Autor informado<input className={input} value={form.autorInformado} onChange={e => set("autorInformado", e.target.value)} /></label><label className="block">Letra<textarea rows={8} className={input} value={form.letra} onChange={e => set("letra", e.target.value)} /></label><label className="block">Cifra<textarea rows={8} className={`${input} font-mono`} value={form.cifra} onChange={e => set("cifra", e.target.value)} /></label><label className="block">Link do YouTube<input type="url" className={input} value={form.youtubeUrl} onChange={e => set("youtubeUrl", e.target.value)} /></label>{form.youtubeUrl && (videoId ? <><p className="text-green-700">✓ Vídeo reconhecido</p><div className="max-w-2xl"><YouTubePlayer videoId={videoId} /></div></> : <p role="alert" className="text-red-600">Link do YouTube inválido.</p>)}<label className="block">Tipo de conteúdo/direitos<select className={input} value={form.tipoDireitos} onChange={e => set("tipoDireitos", e.target.value as ChurchSongInput["tipoDireitos"])}><option value="uso_interno">Uso interno</option><option value="autoral_proprio">Autoral próprio</option><option value="dominio_publico">Domínio público</option><option value="autorizado">Autorizado</option></select></label><label className="flex items-start gap-3"><input type="checkbox" checked={form.confirmacaoDireitos} onChange={e => set("confirmacaoDireitos", e.target.checked)} className="mt-1" /><span>Confirmo que tenho autorização para cadastrar este conteúdo ou utilizá-lo internamente na igreja.</span></label>{error && <p role="alert" className="text-red-600">{error}</p>}{success && <p role="status" className="text-green-700">{success}</p>}<div className="flex flex-wrap gap-4"><button disabled={saving || (needsRights && !form.confirmacaoDireitos)} className="rounded-lg bg-[#285775] px-5 py-3 text-white disabled:opacity-50">{saving ? "Salvando..." : "Salvar hino"}</button>{id && <button type="button" onClick={remove} className="rounded-lg border border-red-300 px-5 py-3 text-red-700">Remover hino</button>}</div></form>}
  </section></main>;
}
