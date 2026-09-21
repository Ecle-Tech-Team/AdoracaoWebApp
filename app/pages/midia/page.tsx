"use client";

import Link from "next/link";
import MenuLateral from "../../components/menuLateral/menuLateral";

const cards = [
  {
    title: "Hinário",
    description:
      "Encontre todos os hinos do hinário e adore a Deus com alegria!",
    href: "/pages/hinario",
    tone: "yellow",
    visual: "harpa",
  },
  {
    title: "Eventos",
    description: "Encontre todos os hinos cristãos e adore a Deus com alegria!",
    href: "#",
    tone: "red",
    visual: "eventos",
  },
  {
    title: "Hinos Gerais",
    description: "Encontre todos os hinos cristãos e adore a Deus com alegria!",
    href: "/pages/hinario?tipo=geral",
    tone: "blue",
    visual: "geral",
  },
  {
    title: "Grupos",
    description: "Veja todos os hinos do grupo de louvor da igreja.",
    href: "#",
    tone: "green",
    visual: "grupos",
  },
  {
    title: "Biblioteca da Igreja",
    description:
      "Encontre todas as playlists de hinos cristãos da igreja e adore a Deus com alegria!",
    href: "#",
    tone: "gray",
    visual: "biblioteca",
    wide: true,
  },
];

export default function MidiaDashboard() {
  return (
    <main className="media-layout">
      <MenuLateral />

      <section className="dashboard-content">
        <div className="breadcrumb">
          Início <span>›</span>
        </div>

        <h1 className="dashboard-title">Início</h1>

        <div className="dashboard-grid">
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className={`dashboard-card tone-${card.tone} ${
                card.wide ? "wide" : ""
              }`}
            >
              <div className={`card-visual visual-${card.visual}`}>
                {card.visual === "harpa" && "♫"}
                {card.visual === "eventos" && "♬"}
                {card.visual === "geral" && "♪"}
                {card.visual === "grupos" && "♩"}
                {card.visual === "biblioteca" && "◉"}
              </div>

              <div className="card-copy">
                <h2>{card.title}</h2>
                <p>{card.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
