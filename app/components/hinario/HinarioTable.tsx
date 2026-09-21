"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Airplay, Funnel, Search } from "lucide-react";

import api from "@/app/api/api";

import Link from "next/link";

type Hymn = {
  _id?: string;
  id?: string | number;
  numero?: string | number;
  titulo?: string;
  nome?: string;
  autor?: string;
};

type HinarioType = "harpa" | "ccb" | "geral";

type Props = {
  type: HinarioType;
};

const CONFIG_KEY = "hinarioSelecionado";

const styles = {
  yellow: {
    header: "bg-[#ffcc69]",
    text: "text-[#ffb632]",
    button: "bg-[#ffbf50]",
    title: "Hinário",
    breadcrumb: "Hinário",
  },

  blue: {
    header: "bg-[#285775]",
    text: "text-[#285775]",
    button: "bg-[#285775]",
    title: "Hinos Gerais",
    breadcrumb: "Hinos Gerais",
  },
};

function normalizeSearchText(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function HinarioTable({ type }: Props) {
  const router = useRouter();

  const [hinos, setHinos] = useState<Hymn[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedHinario, setSelectedHinario] = useState<"harpa" | "ccb">(
    "harpa",
  );

  const isGeneral = type === "geral";

  const theme = isGeneral ? styles.blue : styles.yellow;

  /* =========================
     AUTENTICAÇÃO
  ========================= */

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      router.replace("/");
    }
  }, [router]);

  /* =========================
     LER CONFIGURAÇÃO
  ========================= */

  useEffect(() => {
    if (isGeneral) return;

    const saved = localStorage.getItem(CONFIG_KEY);

    if (saved === "ccb" || saved === "harpa") {
      setSelectedHinario(saved);
    }
  }, [isGeneral]);

  /* =========================
     CARREGAR HINOS
  ========================= */

  useEffect(() => {
    let cancelled = false;

    async function loadHinos() {
      setLoading(true);
      setError("");
      setHinos([]);

      try {
        const endpoint = isGeneral ? "/hinario" : `/hinos/${selectedHinario}`;

        const response = await api.get(endpoint);

        if (cancelled) return;

        const data = response.data;

        setHinos(Array.isArray(data) ? data : (data?.hinos ?? []));
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Não foi possível carregar os hinos.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHinos();

    return () => {
      cancelled = true;
    };
  }, [isGeneral, selectedHinario]);

  /* =========================
     FILTRAGEM
  ========================= */

  const filteredHinos = useMemo(() => {
    const term = normalizeSearchText(search);

    if (!term) return hinos;

    return hinos.filter((hino) => {
      const numero = normalizeSearchText(hino.numero);

      const titulo = normalizeSearchText(hino.titulo ?? hino.nome);

      const autor = normalizeSearchText(hino.autor);

      return (
        numero.includes(term) || titulo.includes(term) || autor.includes(term)
      );
    });
  }, [hinos, search]);

  /* =========================
     PROJEÇÃO
  ========================= */
  async function requestFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.warn("Não foi possível ativar tela cheia:", error);
    }
  }

  async function openProjection(hino: Hymn) {
    const id = hino._id ?? hino.id;

    if (!id) return;

    await requestFullscreen();

    const hinarioProjection = {
      harpa: "harpa_crista",
      ccb: "hinario_ccb",
    } as const;

    const tipo = isGeneral ? "geral" : hinarioProjection[selectedHinario];

    const query = new URLSearchParams({
      id: String(id),
      tipo,
    });

    router.push(`/pages/projecao?${query.toString()}`);
  }

  /* =========================
     RENDER
  ========================= */

  return (
    <main className="min-h-screen bg-white">
      <section className="px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 pb-12">
        {/* BREADCRUMB */}

        <div className="flex mt-8">
          <Link className="text-[#b5b5b5] text-sm text3" href={"/pages/inicio"}>Início</Link>          
            <span className="mx-2 text-[#b5b5b5] text-sm text3">›</span>
            <span className="text-[#b5b5b5] text-sm text3">{theme.breadcrumb}</span>
        </div>

        {/* CABEÇALHO */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mt-4">
          <h1 className="text-4xl md:text-5xl text-[#222222] text1">
            {theme.title}
          </h1>

          <div className="flex items-center gap-5">
            {/* FILTRO */}

            <button
              type="button"
              aria-label="Filtro"
              className="text-[#222222] text-2xl"
            >
              <Funnel strokeWidth={2.5} />
            </button>

            {/* BUSCA */}

            <div className="flex items-center gap-2 border border-[#d5d5d5] px-4 rounded-md w-[255px] h-[36px]">
              <Search color="#a5a5a5" />
              <input
                type="text"
                placeholder="Pesquisar"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full outline-none text-sm text-[#555] placeholder:text-[#a5a5a5] text2"
              />
            </div>
          </div>
        </div>

        {/* ERRO */}

        {error && <p className="mt-5 text-sm text-red-500">{error}</p>}

        {/* TABELA */}

        <div className="mt-6 w-full rounded-xl overflow-hidden shadow-md border border-[#eeeeee]">
          {/* CABEÇALHO DA TABELA */}

          <div
            className={`grid grid-cols-[110px_1fr_1fr_65px] items-center h-[45px] px-6 text-white text-xl text3 ${theme.header}`}
          >
            <span>Número</span>
            <span>Título</span>
            <span>Autor</span>
            <span></span>
          </div>

          {/* CONTEÚDO */}

          <div className="max-h-[calc(100vh-260px)] overflow-y-auto">
            {loading ? (
              <div className="py-10 text-center text-sm text-[#999]">
                Carregando hinos...
              </div>
            ) : filteredHinos.length === 0 ? (
              <div className="py-10 text-center text-sm text-[#999]">
                Nenhum hino encontrado.
              </div>
            ) : (
              filteredHinos.map((hino, index) => (
                <div
                  key={hino._id ?? hino.id ?? index}
                  onClick={() => openProjection(hino)}
                  className="grid grid-cols-[110px_1fr_1fr_65px] items-center min-h-[43px] px-6 border-b border-[#eeeeee] text-l text3 hover:bg-[#fafafa] cursor-pointer transition-colors"
                >
                  <span className={theme.text}>{hino.numero ?? "—"}</span>

                  <span className={theme.text}>
                    {hino.titulo ?? hino.nome ?? "Sem título"}
                  </span>

                  <span className={theme.text}>{hino.autor ?? "—"}</span>

                  <button
                    type="button"
                    onClick={() => openProjection(hino)}
                    aria-label={`Projetar hino ${hino.numero ?? ""}`}
                    className={`w-[48px] h-[28px] rounded-sm flex items-center justify-center text-white ${theme.button}`}
                  >
                    <Airplay size={22} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
