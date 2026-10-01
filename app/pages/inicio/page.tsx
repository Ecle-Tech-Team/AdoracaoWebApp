"use client";

import React from "react";
import MenuLateral from "@/app/components/menuLateral/menuLateral";
import Link from "next/link";

const cards = [
  {
    title: "Hinos da Igreja",
    description: "Músicas cadastradas para uso da sua igreja.",
    href: "/pages/hinos-igreja",
    color: "bg-[#eef8ff]", titleColor: "text-[#285775]", descriptionColor: "text-[#7197b4]", image: "/images/hinos-gerais.jpg",
  },
  {
    title: "Hinários",
    description: (
      <>
        Encontre todos os hinos do hinário
        <br />e adore a Deus com alegria!
      </>
    ),
    href: "/pages/hinario",
    color: "bg-[#fff8e7]",
    titleColor: "text-[#c99c28]",
    descriptionColor: "text-[#bca46e]",
    image: "/images/harpa.jpg",
  },
  {
    title: "Eventos",
    description: (
      <>
        Encontre todos os hinos cristãos e
        <br />
        adore a Deus com alegria!
      </>
    ),
    href: "/pages/eventos",
    color: "bg-[#ffe2e2]",
    titleColor: "text-[#ff4b4b]",
    descriptionColor: "text-[#d99b9b]",
    image: "/images/eventos.jpg",
  },
  {
    title: "Hinos Gerais",
    description: (
      <>
        Encontre todos os hinos cristãos e
        <br />
        adore a Deus com alegria!
      </>
    ),
    href: "/pages/hinos-gerais",
    color: "bg-[#eef8ff]",
    titleColor: "text-[#2d5878]",
    descriptionColor: "text-[#7197b4]",
    image: "/images/hinos-gerais.jpg",
  },
  {
    title: "Grupos",
    description: (
      <>
        Veja todos os hinos do grupo de
        <br />
        louvor da igreja.
      </>
    ),
    href: "/pages/grupos",
    color: "bg-[#e2ffe5]",
    titleColor: "text-[#5cac5b]",
    descriptionColor: "text-[#80b77f]",
    image: "/images/grupos.jpg",
  },
  {
    title: "Biblioteca da Igreja",
    description: (
      <>
        Encontre todas as playlists de hinos cristãos
        <br />
        da igreja e adore a Deus com alegria!
      </>
    ),
    href: "/pages/biblioteca",
    color: "bg-[#eeeeee]",
    titleColor: "text-[#222222]",
    descriptionColor: "text-[#555555]",
    image: "/images/biblioteca.jpg",
    wide: true,
  },
];

export default function Inicio() {
  return (
    <main className="min-h-screen bg-white">
      <div className="flex flex-col md:flex-row">
        <MenuLateral />

        <div className="w-full px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 pb-12">
          {/* BREADCRUMB */}

          <div className="flex mt-8 md:mt-10">
            <span className="text-[#b5b5b5] text-sm text3">
              Início <span className="ml-1">›</span>
            </span>
          </div>

          {/* TÍTULO */}

          <h1 className="mt-4 text-4xl md:text-5xl text-[#222222] text1">
            Início
          </h1>

          {/* CARDS */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 max-w-[1100px]">
            {cards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className={`group flex items-center overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 ${
                  card.color
                } ${card.wide ? "md:col-span-2" : ""}`}
              >
                {/* IMAGEM LATERAL */}

                <div
                  className={`shrink-0 w-[110px] sm:w-[130px] md:w-[145px] h-[120px] ${
                    card.wide ? "md:w-[145px]" : ""
                  }`}
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* CONTEÚDO */}

                <div className="flex flex-col justify-center px-5 py-5 sm:px-6">
                  <h2
                    className={`text-xl md:text-2xl text1 ${card.titleColor}`}
                  >
                    {card.title}
                  </h2>

                  <p
                    className={`mt-1 text-sm md:text-base text2 ${
                      card.descriptionColor
                    }`}
                  >
                    {card.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
