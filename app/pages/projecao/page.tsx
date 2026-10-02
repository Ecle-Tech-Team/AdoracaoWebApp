"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import logo from "../../../public/logo.svg";
import api from "@/app/api/api";
import YouTubePlayer from "@/app/components/YouTubePlayer";
import { parseLyricsToSlides } from "@/app/lib/churchSongs";

type Slide = {
  label: string;
  text: string;
  isTitle?: boolean;
  number?: string;
  subtitle?: string;
};

const PROJECTION_SETTINGS_KEY = "projectionSettings";

type ProjectionSettings = {
  fontSize: number;
  theme: "dark" | "light";
  showControls: boolean;
};

function normalizeText(value: unknown): string {
  if (typeof value !== "string") return "";

  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p\s*>/gi, "\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
}

function getText(value: unknown): string {
  if (typeof value === "string") {
    return normalizeText(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => getText(item))
      .filter(Boolean)
      .join("\n\n");
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const keys = ["texto", "text", "conteudo", "content", "letra", "lyrics"];

    for (const key of keys) {
      if (record[key]) {
        const text = getText(record[key]);

        if (text) return text;
      }
    }
  }

  return "";
}

function buildSlides(hino: Record<string, unknown>, tipo: string): Slide[] {
  const slides: Slide[] = [];

  const titulo = hino.titulo ?? hino.nome ?? hino.title ?? "Hino";

  const numero = hino.numero ?? hino.numero_hino ?? hino.number ?? "";

  // Define o texto secundário do slide inicial
  let subtitle = "";

  if (tipo === "harpa_crista") {
    subtitle = "Harpa Cristã";
  } else if (tipo === "hinario_ccb") {
    subtitle = "Hinário CCB";
  } else if (tipo === "geral") {
    subtitle = getText(hino.autor ?? hino.author ?? hino.compositor ?? hino.autoria ?? "");
  }

  slides.push({
    label: "Título",
    text: getText(titulo),
    isTitle: true,

    // Número somente para Harpa e CCB
    number: tipo === "geral" ? "" : String(numero),

    // Hinário para Harpa/CCB ou autor para Gerais
    subtitle: getText(subtitle),
  });

  if (tipo === "igreja") {
    return [slides[0], ...parseLyricsToSlides(typeof hino.letra === "string" ? hino.letra : "").map((text, index) => ({ label: `Bloco ${index + 1}`, text }))];
  }

  const versos = hino.versos ?? hino.verses ?? hino.estrofes ?? [];

  const coro = hino.coro ?? hino.coros ?? hino.refrao ?? hino["refrão"];

  const chorus = getText(coro);

  if (Array.isArray(versos)) {
    versos.forEach((verso: unknown, index: number) => {
      const text = getText(verso);

      if (!text) return;

      slides.push({
        label: `Estrofe ${index + 1}`,
        text,
      });

      if (chorus) {
        slides.push({
          label: "Coro",
          text: chorus,
        });
      }
    });
  } else if (versos && typeof versos === "object") {
    const versosOrdenados = Object.entries(versos).sort(
      ([a], [b]) => Number(a) - Number(b),
    );

    versosOrdenados.forEach(([numeroVerso, verso]) => {
      const text = getText(verso);

      if (!text) return;

      slides.push({
        label: `Estrofe ${numeroVerso}`,
        text,
      });

      if (chorus) {
        slides.push({
          label: "Coro",
          text: chorus,
        });
      }
    });
  } else {
    const text = getText(hino.letra ?? hino.texto ?? hino.conteudo);

    if (text) {
      slides.push({
        label: "Letra",
        text,
      });
    }
  }

  return slides;
}

export default function ProjecaoPage() {
  const params = useSearchParams();
  const router = useRouter();

  const id = params.get("id");
  const tipo = params.get("tipo") ?? "harpa_crista";
  const mode = params.get("modo") ?? "letra";

  const [slides, setSlides] = useState<Slide[]>([]);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [fontSize, setFontSize] = useState(4);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showControls, setShowControls] = useState(true);
  const [textScale, setTextScale] = useState(1);

  // Indica se as configurações já foram carregadas
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const slide = slides[current];
  const isDark = theme === "dark";

  /*
   * Carrega as configurações salvas
   */
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(PROJECTION_SETTINGS_KEY);

      if (savedSettings) {
        const settings: Partial<ProjectionSettings> = JSON.parse(savedSettings);

        if (
          typeof settings.fontSize === "number" &&
          settings.fontSize >= 1.5 &&
          settings.fontSize <= 8
        ) {
          setFontSize(settings.fontSize);
        }

        if (settings.theme === "dark" || settings.theme === "light") {
          setTheme(settings.theme);
        }

        if (typeof settings.showControls === "boolean") {
          setShowControls(settings.showControls);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar configurações da projeção:", error);
    } finally {
      setSettingsLoaded(true);
    }
  }, []);

  /*
   * Carregamento do hino
   */
  useEffect(() => {
    if (!id) {
      setError("Hino não informado.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadHino() {
      try {
        setLoading(true);
        setError("");

        const endpoint = tipo === "igreja" ? `/hinos-igreja/${id}` :
          tipo === "geral" ? `/hinario/${id}` : `/hinos/${tipo}/id/${id}`;

        console.log("Buscando hino em:", endpoint);

        const response = await api.get(endpoint);

        if (cancelled) return;

        const data = response.data;
        if (tipo === "igreja" && mode === "youtube") {
          if (!data.youtube?.videoId) { setError("Vídeo não cadastrado."); return; }
          setVideoId(data.youtube.videoId);
          return;
        }
        if (tipo === "igreja" && !data.letra) { setError("Letra indisponível."); return; }
        const generatedSlides = buildSlides(data, tipo);

        if (generatedSlides.length === 0) {
          setError("O hino não possui conteúdo para exibição.");
          return;
        }

        setSlides(generatedSlides);
        setCurrent(0);
      } catch (err: unknown) {
        if (cancelled) return;

        console.error("Erro ao carregar hino:", err);

        const failure = err as { response?: { data?: { message?: string } } };
        setError(failure.response?.data?.message ?? "Não foi possível carregar o hino.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHino();

    return () => {
      cancelled = true;
    };
  }, [id, tipo, mode]);

  /*
   * Controles do teclado
   */
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        setCurrent((value) => Math.min(slides.length - 1, value + 1));
      }

      if (event.key === "ArrowLeft") {
        setCurrent((value) => Math.max(0, value - 1));
      }

      if (event.key === "Escape") {
        router.back();
      }

      if (event.key === "+" || event.key === "=") {
        setFontSize((size) => Math.min(8, size + 0.25));
      }

      if (event.key === "-") {
        setFontSize((size) => Math.max(1.5, size - 0.25));
      }

      if (event.key.toLowerCase() === "t") {
        setTheme((value) => (value === "dark" ? "light" : "dark"));
      }

      if (event.key.toLowerCase() === "c") {
        setShowControls((value) => !value);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [slides.length, router]);

  /*
   * Ajuste automático do tamanho do texto
   *
   * Esse Hook fica antes dos returns condicionais.
   */
  useEffect(() => {

    function adjustTextSize() {
      const textElement = document.getElementById("projection-text");

      if (!textElement) return;

      const container = textElement.parentElement;

      if (!container) return;

      let scale = 1;

      textElement.style.fontSize = `${fontSize}rem`;

      while (
        textElement.scrollHeight > container.clientHeight &&
        scale > 0.45
      ) {
        scale -= 0.05;

        textElement.style.fontSize = `${fontSize * scale}rem`;
      }

      setTextScale(Number(scale.toFixed(2)));
    }

    const timeout = setTimeout(adjustTextSize, 100);

    window.addEventListener("resize", adjustTextSize);

    return () => {
      clearTimeout(timeout);

      window.removeEventListener("resize", adjustTextSize);
    };
  }, [fontSize, current, slide?.text, theme]);

  /*
   * Salva as configurações sempre que forem alteradas
   */
  useEffect(() => {
    if (!settingsLoaded) return;

    const settings: ProjectionSettings = {
      fontSize,
      theme,
      showControls,
    };

    try {
      localStorage.setItem(PROJECTION_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Erro ao salvar configurações da projeção:", error);
    }
  }, [fontSize, theme, showControls, settingsLoaded]);

  /*
   * Tela de carregamento
   */
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        Carregando hino...
      </main>
    );
  }

  /*
   * Tela de erro
   */
  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-black px-6 text-center text-white">
        <p>{error}</p>

        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg bg-white/10 px-5 py-3 transition hover:bg-white/20"
        >
          Voltar
        </button>
      </main>
    );
  }

  if (tipo === "igreja" && mode === "youtube" && videoId) {
    return <main className="fixed inset-0 flex h-screen w-screen items-center justify-center bg-black"><div className="w-full max-w-[min(100vw,177.78vh)]"><YouTubePlayer videoId={videoId} /></div><button type="button" onClick={() => { if (!document.fullscreenElement) void document.documentElement.requestFullscreen(); else void document.exitFullscreen(); }} className="fixed left-4 top-4 rounded bg-black/70 px-3 py-2 text-white">Tela cheia</button><button type="button" onClick={() => router.back()} className="fixed right-4 top-4 rounded bg-black/70 px-3 py-2 text-white">Sair</button></main>;
  }

  /*
   * Tela principal da projeção
   */
  return (
    <main
      className={`fixed inset-0 z-50 h-screen w-screen overflow-hidden transition-colors duration-300 ${
        isDark ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      {/* Conteúdo da projeção */}
      <div className="flex h-full w-full items-center justify-center px-[6vw] py-[5vh]">
        {slide && (
          <div className="flex max-h-full w-full flex-col items-start justify-center overflow-hidden text-left">
            {slide.isTitle ? (
              /*
               * Slide inicial do hino
               */
              <div className="flex flex-col items-start text-left">
                {/* Número do hino */}
                {slide.number && (
                  <p
                    className={`mb-4 text-5xl text3 leading-none md:text-6xl ${
                      isDark ? "text-white" : "text-black"
                    }`}
                  >
                    {slide.number}.
                  </p>
                )}

                {/* Título do hino */}
                <p
                  className={`max-w-[1500px] break-words text-5xl text3 leading-[1.15] md:text-6xl lg:text-7xl ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  {slide.text}
                </p>

                {/* Nome do hinário */}
                {slide.subtitle && (
                  <p
                    className={`mt-4 text-2xl text3 md:text-3xl ${
                      isDark ? "text-[#555555]" : "text-[#555555]"
                    }`}
                  >
                    {slide.subtitle}
                  </p>
                )}
              </div>
            ) : (
              /*
               * Slides de versos e coros
               */
              <>
                <p
                  className={`mb-6 text-2xl text3 ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  {slide.label}
                </p>

                <p
                  id="projection-text"
                  className="max-h-full max-w-[1500px] whitespace-pre-line break-words text3 leading-[1.35]"
                  style={{
                    fontSize: `${fontSize * textScale}rem`,
                  }}
                >
                  {slide.text}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Controles inferiores */}
      {showControls && (
        <div
          className={`fixed bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-xl px-4 py-3 shadow-lg ${
            isDark ? "bg-white/10 text-white" : "bg-black/10 text-black"
          }`}
        >
          {/* Diminuir fonte */}
          <button
            type="button"
            onClick={() => setFontSize((size) => Math.max(1.5, size - 0.25))}
            className="rounded-lg px-3 py-2 text-lg transition cursor-pointer hover:bg-white/50"
          >
            A−
          </button>

          {/* Tamanho atual */}
          <span className="min-w-[60px] text-center text-sm">
            {fontSize.toFixed(2)}rem
          </span>

          {/* Aumentar fonte */}
          <button
            type="button"
            onClick={() => setFontSize((size) => Math.min(8, size + 0.25))}
            className="rounded-lg px-3 py-2 text-lg transition cursor-pointer hover:bg-white/50"
          >
            A+
          </button>

          <div className="mx-1 h-6 w-px bg-current opacity-30" />

          {/* Alternar tema */}
          <button
            type="button"
            onClick={() =>
              setTheme((value) => (value === "dark" ? "light" : "dark"))
            }
            className="rounded-lg px-3 py-2 text-sm transition cursor-pointer hover:bg-white/50"
          >
            {isDark ? "☀ Claro" : "☾ Escuro"}
          </button>

          {/* Sair */}
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg px-3 py-2 text-sm transition cursor-pointer hover:bg-white/50"
          >
            Sair
          </button>
        </div>
      )}

      {/* Botão para mostrar ou ocultar controles */}
      <button
        type="button"
        onClick={() => setShowControls((value) => !value)}
        className={`fixed right-5 top-5 rounded-lg px-3 py-2 text-sm transition cursor-pointer ${
          isDark
            ? "text-white hover:bg-white/20"
            : "text-black hover:bg-black/6"
        }`}
      >
        {/* {showControls ? "Ocultar controles" : "Controles"} */}
        {showControls ? (
          <Image src={logo} width={35} height={45} alt="AdoraçãoApp" />
        ) : (
          <Image src={logo} width={35} height={55} alt="AdoraçãoApp" />
        )}
      </button>
    </main>
  );
}
