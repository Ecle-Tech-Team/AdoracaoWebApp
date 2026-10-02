"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MenuLateral from "@/app/components/menuLateral/menuLateral";
import { ChurchSong, getChurchSongs } from "@/app/api/churchSongs";

export default function ChurchSongsPage() {
  const [songs, setSongs] = useState<ChurchSong[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      setLoading(true);
      getChurchSongs(search).then(data => { if (active) setSongs(data); }).catch(() => { if (active) setError("Não foi possível carregar os hinos."); }).finally(() => { if (active) setLoading(false); });
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [search]);
  return <main className="flex min-h-screen bg-white"><MenuLateral /><section className="w-full max-w-6xl px-6 py-9 sm:px-10">
    <Link href="/pages/inicio" className="text-sm text-gray-400">Início › Biblioteca</Link>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm text-[#285775]">Biblioteca da igreja</p><h1 className="text-4xl text-[#222] text1">Hinos da Igreja</h1></div><Link href="/pages/hinos-igreja/novo" className="rounded-lg bg-[#285775] px-5 py-3 text-white">+ Novo Hino</Link></div>
    <input aria-label="Buscar hino" value={search} onChange={e => { setSearch(e.target.value); setError(""); }} placeholder="Buscar hino..." className="mt-8 w-full max-w-md rounded-lg border border-gray-300 px-4 py-3 outline-[#285775]" />
    {loading ? <p className="mt-8">Carregando hinos...</p> : error ? <p role="alert" className="mt-8 text-red-600">{error}</p> : songs.length === 0 ? <div className="mt-8 rounded-xl border p-8"><p>Nenhum hino cadastrado ainda.</p><p className="mt-2 text-gray-500">Cadastre músicas utilizadas pela sua igreja para acessá-las rapidamente durante cultos e ensaios.</p><Link className="mt-5 inline-block text-[#285775] underline" href="/pages/hinos-igreja/novo">+ Cadastrar primeiro hino</Link></div> : <div className="mt-8 overflow-x-auto rounded-xl border"><table className="w-full min-w-[500px] text-left"><thead className="bg-[#eef8ff] text-[#285775]"><tr><th className="p-4">Título</th><th className="p-4">Autor</th><th className="p-4">Ações</th></tr></thead><tbody>{songs.map(song => <tr key={song._id} className="border-t"><td className="p-4">{song.titulo}</td><td className="p-4">{song.autorInformado || "—"}</td><td className="p-4"><Link className="text-[#285775] underline" href={`/pages/hinos-igreja/${song._id}`}>Abrir</Link><Link className="ml-4 text-[#285775] underline" href={`/pages/hinos-igreja/${song._id}/editar`}>Editar</Link></td></tr>)}</tbody></table></div>}
  </section></main>;
}
