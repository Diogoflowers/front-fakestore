"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/services/api";

export default function RegisterPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password || !name) {
      setErrorMessage("Por favor, preencha todos os campos.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Por favor, insira um e-mail válido.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await register(email, password, name);
      console.log("Registro bem-sucedido:", response);

      alert("Registro bem-sucedido!");
      router.push("/login");
    } catch (error: any) {
      console.error("Erro ao registrar:", error);

      if (error.response?.status === 409) {
        setErrorMessage("Este e-mail já está cadastrado.");
      } else if (error.response?.status === 400) {
        setErrorMessage("Dados inválidos. Verifique as informações.");
      } else {
        setErrorMessage("Erro ao registrar. Verifique os dados e tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-black p-4">
      <form
        className="bg-[#ffffff10] p-[33px] rounded-lg shadow-md flex flex-col items-center border border-[#ffffff4f] max-w-[385px] w-full"
        onSubmit={handleRegister}
      >
        <h1 className="text-2xl mb-[54px] font-black">
          Fak<span className="text-[#ED213A]">E-Store</span>
        </h1>

        {errorMessage && (
          <div className="text-red-500 mb-4 text-sm font-bold">{errorMessage}</div>
        )}

        <div className="w-full">
          <div className="mb-[30px]">
            <label className="font-semibold">Usuário</label>
            <input
              type="text"
              className="border p-2 w-full mt-[10px] bg-white rounded-[6px] text-black border-black"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-[30px]">
            <label className="font-semibold">E-mail</label>
            <input
              type="email"
              className="border p-2 w-full mb-2 mt-[10px] bg-white rounded-[6px] text-black border-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="font-semibold">Senha</label>
            <input
              type="password"
              className="border p-2 w-full mt-[10px] bg-white rounded-[6px] text-black border-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="w-full mb-[54px] mt-1">
          <span className="text-[13px] font-semibold">
            Já tem uma conta?{" "}
            <span
              className="text-[#FF5C5C] cursor-pointer"
              onClick={() => router.push("/login")}
            >
              Entre
            </span>
          </span>
        </div>

        <button
          type="submit"
          className={`bg-gradient-to-r from-[#ED213A] to-[#93291E] text-white rounded w-full p-[12px] font-semibold cursor-pointer ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isLoading}
        >
          {isLoading ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>
    </div>
  );
}
