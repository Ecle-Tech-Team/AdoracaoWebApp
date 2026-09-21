"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import api from "../../api/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../../../public/logo.svg";
import on from "../../../public/on.svg";
import off from "../../../public/off.svg";

export default function Cadastro() {
  const [nome, setNome] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  // const [confirmSenha, setConfirmSenha] = useState<string>("");
  const [birth, setBirth] = useState<string>("");
  const [typeUser, setTypeUser] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();

    // const specialCharactersRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    // const invalidCharactersRegex = /[^a-zA-Z\s]/;

    const notifySuccess = () => {
      toast.success("Usuário cadastrado com sucesso!", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    };

    const notifyWarn = () => {
      toast.warn("Todos os campos devem ser preenchidos!", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    };

    const notifyError = () => {
      toast.error("Erro no cadastro, Tente novamente.", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    };

    try {
      if (
        nome === "" ||
        email === "" ||
        senha === "" ||
        birth === "" ||
        typeUser === ""
      ) {
        notifyWarn();
        return;
      } else {
        const data = {
          nome,
          email,
          senha,
          birth,
          typeUser,
        };

        api.post("/cadastro", data);

        notifySuccess();

        setTimeout(() => {
          router.push("/pages/login", { scroll: false });
        }, 1500);
      }
    } catch {
      notifyError();
    }
  }
  return (
    <main className="overflow-hidden">
      <div className="bg-azul min-h-screen flex justify-center">
        <div className="flex justify-center items-center">
          <div>
            <Image
              className="mb-10"
              src={logo}
              width={65}
              height={10}
              alt="logo-adoracao-app"
            />
            <div className="flex flex-col justify-center">
              <h4 className="text-lg text-cinza text1">A paz do Senhor!</h4>
              <h1 className="text-4xl text-preto text1">Seja Bem vindo!</h1>
              <p className="mt-3 text-md text-cinza text2">
                Insira as informações abaixo para você <br />
                entrar em sua conta!
              </p>
            </div>

            <div className="flex flex-col mt-10">
              <div className="flex flex-col">
                <label className="text-cinza text1 text-md mt-2 mb-1">
                  Nome
                </label>

                <input
                  className="px-4 py-3.5 w-[40vh] mb-3 text2 rounded-xl text-cinza bg-input border-3 border-amarelo"
                  type="text"
                  placeholder="Digite o Nome..."
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-cinza text1 text-md mt-2 mb-1">
                  Email
                </label>

                <input
                  className="px-4 py-3.5 w-[40vh] mb-3 text2 rounded-xl text-cinza bg-input border-3 border-amarelo"
                  type="text"
                  placeholder="Digite o Email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-cinza text1 text-md mt-2 mb-1">
                  Senha
                </label>

                <input
                  className="px-4 py-3.5 w-[40vh] mb-3 text2 rounded-xl text-cinza bg-input border-3 border-amarelo"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite a Senha..."
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-cinza text1 text-md mt-2 mb-1">
                  Data de Nascimento
                </label>

                <input
                  className="px-4 py-3.5 w-[40vh] mb-3 text2 rounded-xl text-cinza bg-input border-3 border-amarelo"
                  type={"date"}
                  value={birth}
                  onChange={(e) => setBirth(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-cinza text1 text-md mt-2 mb-1">
                  Tipo de Usuário
                </label>

                <select
                  className="px-4 py-3.5 w-[40vh] mb-3 text2 rounded-xl text-cinza bg-input border-3 border-amarelo"
                  value={typeUser}
                  onChange={(e) => setTypeUser(e.target.value)}
                  required
                >
                  <option disabled>Selecione um Tipo</option>
                  <option value="Adorador">Adorador</option>
                  <option value="Cantor">Cantor</option>
                  <option value="Componente">Componente</option>
                  <option value="Músico">Músico</option>
                  <option value="Professor">Professor</option>
                  <option value="Regente">Regente</option>
                </select>
              </div>

              <div className="mt-4 flex justify-center">
                <input className="w-5" type="checkbox" name="" id="" />
                <p className="text-cinza text-lg mt-1 text2 ml-2">
                  Manter Conectado
                </p>
                <button
                  type="button"
                  className="ml-[16vh]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <Image
                    src={showPassword ? on : off}
                    width={40}
                    height={40}
                    alt={showPassword ? "Open" : "Closed"}
                  />
                </button>
              </div>

              <button
                type="submit"
                className="rounded-xl h-12 mt-7 bg-amarelo text-lg text2 text-white active:bg-white active:text-amarelo cursor-pointer"
                onClick={handleRegister}
              >
                Entrar
              </button>
              <ToastContainer />

              <button className="flex justify-center text-lg text2 text-white mt-6">
                Esqueci a senha
              </button>

              <div className="flex justify-center mt-6">
                <p className="text-lg text2 text-cinza">
                  Novo por aqui?
                  <Link
                    href={"/../../pages/cadastro"}
                    className="text1 ml-1 text-amarelo"
                  >
                    Cadastro
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
