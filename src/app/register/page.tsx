"use client";


export default function RegisterPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-black p-4">
      <form className="bg-[#ffffff10] p-[33px] rounded-lg shadow-md flex flex-col items-center border border-[#ffffff4f] max-w-[385px] w-full">
        <h1 className="text-2xl mb-[54px] font-black">
          Fak<span className="text-[#ED213A]">E-Store</span>{" "}
        </h1>
        <div className="w-full">
          <div className="mb-[30px]">
            <label className="font-semibold">Usuário</label>
            <input
              type="string"
              className="border p-2 w-full  mt-[10px] bg-white rounded-[6px] text-black border-black"
            />
          </div>
          <div className="mb-[30px]">
            <label className="font-semibold">E-mail</label>
            <input
              type="email"
              className="border p-2 w-full mb-2 mt-[10px] bg-white rounded-[6px] text-black border-black"
            />
          </div>
          <div>
            <label className="font-semibold">Senha</label>
            <input
              type="password"
              className="border p-2 w-full  mt-[10px] bg-white rounded-[6px] text-black border-black"
            />
          </div>
        </div>

        <div className=" w-full mb-[54px] mt-1 ">
          <span className="text-[13px] font-semibold">
            Já tem uma conta? <span className="text-[#FF5C5C]">Entre</span>
          </span>
        </div>

        <button
          type="submit"
          className="bg-gradient-to-r from-[#ED213A] to-[#93291E] text-white  rounded w-full p-[12px] font-semibold cursor-pointer"
        >
          Cadastrar
        </button>
      </form>
    </div>
  );
}
