"use client";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { login } from "@/services/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const router = useRouter();

  const handleLogin = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    try {
      const { token } = await login(email, password);
      localStorage.setItem("token", token);
      router.push('/home');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erro ao fazer login. Verifique seus dados.";
      setError(errorMessage);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-black p-4">
      <form
        className="bg-[#ffffff10] p-[33px] rounded-lg shadow-md flex flex-col items-center border border-[#ffffff4f] max-w-[385px] w-full"
        onSubmit={handleLogin}
      >
        <h1 className="text-2xl mb-[54px] font-black">
          Fak<span className="text-[#ED213A]">E-Store</span>
        </h1>

        {error && <div className="text-red-500 mb-4 font-bold">{error}</div>}

        <div className="w-full">
          <div className="mb-[30px]">
            <label className="font-semibold">E-mail</label>
            <input
              type="email"
              className="border p-2 w-full mb-2 mt-[10px] bg-white rounded-[6px] text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="font-semibold">Senha</label>
            <input
              type="password"
              className="border p-2 w-full mt-[10px] bg-white rounded-[6px] text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="w-full mb-[54px] mt-1">
          <span className="text-[13px] font-semibold">
            Não tem uma conta?{" "}
            <span
              className="text-[#FF5C5C] cursor-pointer"
              onClick={() => router.push('/register')}
            >
              Registre-se
            </span>
          </span>
        </div>

        <button
          type="submit"
          className="bg-gradient-to-r from-[#ED213A] to-[#93291E] text-white rounded w-full p-[12px] font-semibold cursor-pointer"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
