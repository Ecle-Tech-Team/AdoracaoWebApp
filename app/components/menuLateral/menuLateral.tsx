"use client";

import Image from "next/image";
import Link from "next/link";

import logo from "../../../public/logo.svg";
import inicio from "../../../public/icons/Inicio.svg";
import config from "../../../public/icons/config.svg";

export default function MenuLateral() {
  return (
    <aside className="w-24 lg:w-32 shrink-0 min-h-screen flex flex-col items-center py-8 border-r border-[#edf0f2] bg-white">
      <Image src={logo} width={55} height={55} alt="AdoraçãoApp" />

      <nav className="mt-12 flex flex-col items-center gap-8">
        <Link href="/pages/inicio">
          <Image src={inicio} width={45} height={30} alt="Início" />
        </Link>
      </nav>

      <Link className="mt-auto" href="/pages/configuracoes">
        <Image src={config} width={45} height={30} alt="Configurações" />
      </Link>
    </aside>
  );
}
