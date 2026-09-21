"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import api from "../../api/api";
import logo from "../../../public/logo.svg";
import on from "../../../public/on.svg";
import off from "../../../public/off.svg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !password) {
      toast.warn("Preencha os campos!", { position: "top-center", autoClose: 1500 });
      return;
    }
    try {
      const response = await api.post("/login", { email, password });
      const userData = response.data.user ?? response.data.usuario ?? {};
      sessionStorage.setItem("nome", userData.nome ?? "");
      sessionStorage.setItem("typeUser", userData.typeUser ?? userData.tipo_usuario ?? "");
      sessionStorage.setItem("id_grupo", String(userData.id_grupo ?? ""));
      sessionStorage.setItem("token", response.data.token);
      sessionStorage.setItem("email", email);
      toast.success("Login realizado com sucesso!", { position: "top-center", autoClose: 900 });
      setTimeout(() => router.push("/pages/inicio"), 950);
    } catch {
      toast.error("Erro no login. Tente novamente.", { position: "top-center", autoClose: 1800 });
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-white flex items-center justify-center px-6">
      <form onSubmit={handleLogin} className="w-full max-w-md">
        <Image className="mb-10" src={logo} width={65} height={65} alt="Logo AdoraçãoApp" />
        <p className="text-lg text-cinza text1">A paz do Senhor!</p>
        <h1 className="text-4xl text-preto text1">Seja bem-vindo!</h1>
        <p className="mt-3 text-md text-cinza text2">Insira as informações abaixo para você<br />entrar em sua conta de mídia.</p>

        <div className="mt-10">
          <label className="text-cinza text1 text-md block mb-1">Email</label>
          <input className="w-full px-4 py-3.5 mb-4 text2 rounded-xl text-preto bg-input border-3 border-amarelo" type="email" placeholder="Digite o Email..." value={email} onChange={e=>setEmail(e.target.value)} />
          <label className="text-cinza text1 text-md block mb-1">Senha</label>
          <div className="relative">
            <input className="w-full px-4 py-3.5 text2 rounded-xl text-preto bg-input border-3 border-amarelo" type={showPassword ? "text" : "password"} placeholder="Digite a Senha..." value={password} onChange={e=>setPassword(e.target.value)} />
            <button type="button" className="absolute right-3 top-2" onClick={()=>setShowPassword(!showPassword)}>
              <Image src={showPassword ? on : off} width={40} height={40} alt="Alternar visibilidade" />
            </button>
          </div>
          <div className="mt-5 flex items-center justify-between">
            <label className="flex items-center gap-2 text-cinza text2"><input className="w-5" type="checkbox" />Manter conectado</label>
          </div>
          <button type="submit" className="w-full rounded-xl h-12 mt-7 bg-amarelo text-lg text2 text-white hover:opacity-90">Entrar</button>
          <button type="button" className="w-full text-lg text2 text-white mt-6">Esqueci a senha</button>
        </div>
      </form>
      <ToastContainer />
    </main>
  );
}
