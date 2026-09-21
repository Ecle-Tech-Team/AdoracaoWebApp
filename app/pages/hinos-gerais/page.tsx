"use client";

import MenuLateral from "@/app/components/menuLateral/menuLateral";
import HinarioTable from "@/app/components/hinario/HinarioTable";

export default function HinosGeraisPage() {
  return (
    <main className="min-h-screen flex">

      <MenuLateral />

      <div className="flex-1 min-w-0">
        <HinarioTable type="geral" />
      </div>

    </main>
  );
}