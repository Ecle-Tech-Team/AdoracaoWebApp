"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/components/auth/AuthProvider";

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status, retry } = useAuth();
  const publicPage = pathname === "/pages/login" || pathname === "/pages/cadastro";

  useEffect(() => {
    if (!publicPage && status === "unauthenticated") {
      router.replace("/pages/login");
    }
  }, [publicPage, router, status]);

  if (publicPage || status === "authenticated") return children;
  if (status === "unavailable") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p>Não foi possível verificar sua sessão. Verifique a conexão e tente novamente.</p>
        <button type="button" onClick={() => void retry()} className="rounded-lg bg-amarelo px-5 py-3 text-white">
          Tentar novamente
        </button>
      </main>
    );
  }
  if (status === "forbidden") {
    return <main className="min-h-screen flex items-center justify-center">Acesso não permitido.</main>;
  }
  return <main className="min-h-screen flex items-center justify-center">Verificando sessão...</main>;
}
