"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/app/components/auth/AuthProvider";

import logo from "../../../public/logo.svg";
import inicio from "../../../public/icons/Inicio.svg";
import config from "../../../public/icons/config.svg";

export default function MenuLateral() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [logoutError, setLogoutError] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    setLogoutError(false);
    try {
      await signOut();
      router.replace("/pages/login");
    } catch {
      setLogoutError(true);
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <aside className="w-24 lg:w-32 shrink-0 min-h-screen flex flex-col items-center py-8 border-r border-[#edf0f2] bg-white">
      <Image src={logo} width={55} height={55} alt="AdoraçãoApp" />

      <nav className="mt-12 flex flex-col items-center gap-8">
        <Link href="/pages/inicio">
          <Image src={inicio} width={45} height={30} alt="Início" />
        </Link>
        <Link href="/pages/hinos-igreja" className="px-2 text-center text-xs text-[#285775]">Hinos da Igreja</Link>
      </nav>

      <div className="mt-auto flex flex-col items-center gap-5">
        <Link href="/pages/configuracoes">
          <Image src={config} width={45} height={30} alt="Configurações" />
        </Link>
        <button type="button" onClick={() => void handleLogout()} disabled={loggingOut} className="text-sm text-[#285775] disabled:opacity-60">
          {loggingOut ? "Saindo..." : "Sair"}
        </button>
        {logoutError && <p role="alert" className="px-2 text-center text-xs text-red-600">Não foi possível sair. Tente novamente.</p>}
      </div>
    </aside>
  );
}
