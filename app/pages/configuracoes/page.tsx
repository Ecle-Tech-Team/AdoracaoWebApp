"use client";

import React, { useEffect, useState } from "react";

import MenuLateral from "@/app/components/menuLateral/menuLateral";

type HinarioType = "harpa" | "ccb";

export default function Configuracoes() {
  const [selectedHinario, setSelectedHinario] = useState<HinarioType>("harpa");

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedHinario = localStorage.getItem("hinarioSelecionado");

    if (savedHinario === "harpa" || savedHinario === "ccb") {
      setSelectedHinario(savedHinario);
    }
  }, []);

  function handleHinarioChange(value: HinarioType) {
    setSelectedHinario(value);
    setSaved(false);
  }

  function handleSave() {
    localStorage.setItem("hinarioSelecionado", selectedHinario);

    setSaved(true);
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="flex flex-col md:flex-row">
        <MenuLateral />

        <section className="w-full px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 pb-12">
          {/* BREADCRUMB */}

          <div className="flex mt-8 md:mt-10">
            <span className="text-[#b5b5b5] text-sm text3">
              Início
              <span className="mx-2">›</span>
              Configurações
            </span>
          </div>

          {/* TÍTULO */}

          <h1 className="mt-4 text-4xl md:text-5xl text-[#222222] text1">
            Configurações
          </h1>

          {/* CONTEÚDO */}

          <div className="mt-10 max-w-[850px]">
            <div className="bg-white border border-[#eeeeee] shadow-sm rounded-2xl p-6 md:p-8">
              <h2 className="text-xl md:text-2xl text-[#222222] text1">
                Preferências de hinário
              </h2>

              <p className="mt-2 text-sm md:text-base text-[#999999] text2">
                Selecione o hinário que deseja utilizar na tela de projeção.
              </p>

              {/* OPÇÕES */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                {/* HARPA */}

                <button
                  type="button"
                  onClick={() => handleHinarioChange("harpa")}
                  className={`text-left rounded-xl border-2 p-5 transition-all ${
                    selectedHinario === "harpa"
                      ? "border-[#ffca68] bg-[#fff8e7]"
                      : "border-[#eeeeee] bg-white hover:border-[#ffdf9d]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg text1 text-[#c99c28]">
                      Harpa Cristã
                    </h3>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedHinario === "harpa"
                          ? "border-[#ffbf50]"
                          : "border-[#d5d5d5]"
                      }`}
                    >
                      {selectedHinario === "harpa" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ffbf50]" />
                      )}
                    </div>
                  </div>

                  <p className="mt-3 text-sm text2 text-[#bca46e]">
                    Utilize os hinos da Harpa Cristã para suas projeções.
                  </p>
                </button>

                {/* CCB */}

                <button
                  type="button"
                  onClick={() => handleHinarioChange("ccb")}
                  className={`text-left rounded-xl border-2 p-5 transition-all ${
                    selectedHinario === "ccb"
                      ? "border-[#ffca68] bg-[#fff8e7]"
                      : "border-[#eeeeee] bg-white hover:border-[#ffdf9d]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg text1 text-[#c99c28]">CCB</h3>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedHinario === "ccb"
                          ? "border-[#ffbf50]"
                          : "border-[#d5d5d5]"
                      }`}
                    >
                      {selectedHinario === "ccb" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ffbf50]" />
                      )}
                    </div>
                  </div>

                  <p className="mt-3 text-sm text2 text-[#bca46e]">
                    Utilize os hinos da CCB para suas projeções.
                  </p>
                </button>
              </div>

              {/* BOTÃO SALVAR */}

              <div className="flex items-center justify-between mt-8 gap-4">
                {saved ? (
                  <span className="text-sm text-[#5cac5b] text2">
                    Preferência salva!
                  </span>
                ) : (
                  <span className="text-sm text-[#999999] text2">
                    {selectedHinario === "harpa"
                      ? "Harpa Cristã selecionada"
                      : "CCB selecionado"}
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-xl bg-[#ffca68] hover:bg-[#f5b94d] text-white text1 px-7 py-3 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
