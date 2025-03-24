"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Papa from "papaparse";
import { getProducts, insertProduct } from "@/services/api";
export default function HomePage() {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); 

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    } else {
      setLoading(false); 
    }
  }, [router]);

  useEffect(() => {
    if (!loading) {
      getData();
    }
  }, [loading]);

  if (loading) {
    return <div>Carregando...</div>; 
  }

  const handleApi = async () => {
    try {
      const response = await axios.get("https://fakestoreapi.com/products");
      const formattedData = response.data.map((item: any) => ({
        title: item.title,
        price: item.price,
        description: item.description.substring(0, 255), 
        image: item.image,
        rating: item.rating.rate,
      }));


      for (const item of formattedData) {
        try {
          await insertProduct(
            item.title,
            item.price,
            item.description,
            item.image,
            item.rating
          );
        } catch (error) {
          console.error("Produto já está na lista!", error);
        }
      }
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token não encontrado");
      }
      getData();
    } catch (error) {
      console.error("Erro ao buscar dados da API:", error);
      setError("Erro ao carregar dados");
      setSuccessMessage(null);
    }
  };

  const getData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token não encontrado.");
        return; 
      }
      const response = await getProducts(token);
      console.log(response.products);
      setData(response.products);
    } catch (error) {
      console.error("Erro ao buscar os dados:", error);
    }
  };


  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const exportToCSV = () => {
    if (data.length === 0) {
      alert("Nenhum dado disponível para exportar.");
      return;
    }

    const headers = "Title,Price,Description,Image,Rate\n";
    const rows = data
      .map((item) => {
        return `"${item.title}",${item.price},"${item.description.replace(
          /"/g,
          '""'
        )}","${item.image}",${item.rate}`;
      })
      .join("\n");
    const csv = headers + rows;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "produtos.csv";
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccessMessage(null);

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: async (results) => {
        if (results.data && results.data.length > 0) {
          const headers = results.meta.fields;
          const expectedHeaders = [
            "Title",
            "Price",
            "Description",
            "Image",
            "Rate",
          ];
          const isValidHeaders = expectedHeaders.every((header) =>
            headers?.includes(header)
          );

          if (!isValidHeaders) {
            setError(
              "O arquivo CSV deve conter os cabeçalhos: Title, Price, Description, Image e Rate."
            );
            return;
          }

          const hasEmptyRows = results.data.some(
            (item: any) =>
              !item.Title ||
              !item.Price ||
              !item.Description ||
              !item.Image ||
              !item.Rate
          );

          if (hasEmptyRows) {
            setError(
              "O arquivo CSV contém linhas incompletas ou vazias. Verifique e tente novamente."
            );
            return;
          }

          const importedData = results.data.map((item: any) => ({
            title: item.Title,
            price: item.Price,
            description: item.Description,
            image: item.Image,
            rating: item.Rate,
          }));

          try {
            await Promise.all(
              importedData.map(async (item) => {
                try {
                  await insertProduct(
                    item.title,
                    item.price,
                    item.description,
                    item.image,
                    item.rating
                  );
                } catch (error) {
                  console.error(
                    `Erro ao inserir o produto "${item.title}":`,
                    error
                  );
                }
              })
            );

            await getData();
            setSuccessMessage("Arquivo CSV importado com sucesso!");
          } catch (error) {
            setError(
              "Erro ao importar os produtos. Verifique os dados e tente novamente."
            );
          }
        } else {
          setError("O arquivo CSV está vazio ou não está no formato correto.");
        }
      },
      error: (error) => {
        setError("Erro ao ler o arquivo CSV: " + error.message);
      },
    });
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-[1280px] w-full mx-auto p-5">
        <div className="flex flex-col items-center justify-center gap-12 md:flex-row md:justify-between md:items-center">
          <div className="flex flex-col justify-center items-center">
            <h1 className="text-3xl font-black">
              Fak<span className="text-[#ED213A]">E-Store</span>{" "}
            </h1>
          </div>
          <div className="flex gap-4 flex-wrap-reverse justify-center ">
            <label className="bg-[#ffff] text-black p-3 rounded-2xl font-bold cursor-pointer border">
              Importar CSV
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleImportCSV} 
              />
            </label>
            <button
              className="bg-[#ED213A] p-3 rounded-2xl font-bold cursor-pointer border"
              onClick={handleApi}
            >
              Gerar Lista
            </button>
            <button onClick={() => logout()} className=" text-white p-3 rounded-2xl font-bold cursor-pointer border">
              logout
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded relative">
            {error}
            <button
              onClick={() => setError(null)} 
              className="absolute top-2 right-2 text-red-700 hover:text-red-900 cursor-pointer"
            >
              &times; 
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded relative">
            {successMessage}
            <button
              onClick={() => setSuccessMessage(null)} 
              className="absolute top-2 right-2 text-green-700 hover:text-green-900 cursor-pointer"
            >
              &times; 
            </button>
          </div>
        )}

        {data.length === 0 ? (
          <div className="mt-[200px] text-[#BBBBBB] font-bold flex flex-col items-center justify-center h-[400px]">
            <p className="mb-4">Tabela de produtos vazia, importe produtos!</p>
            <img
              src="/caixa-vazia.png"
              alt="Ícone de caixa vazia"
              className="mt-10 w-20 h-20"
            />
          </div>
        ) : (
          <div className="mt-[200px] rounded-2xl flex flex-col gap-6">
            <div>
              <button
                className="bg-[#ffffff] text-red-500 border-[1px] font-bold p-2 rounded-2xl cursor-pointer"
                onClick={exportToCSV}
              >
                Exportar CSV
              </button>
            </div>
            <div className="flex flex-wrap gap-6 justify-center">
              {data.map((item, index) => (
                <div
                  key={index}
                  className="w-[280px] h-[400px] bg-white p-5 rounded-2xl"
                >
                  <div className="h-[100px] w-full flex items-center justify-center mb-4">
                    <img src={item.image} alt="image" className="h-full" />
                  </div>
                  <div>
                    <div className="h-[70px] overflow-hidden">
                      <h1 className="text-black font-semibold">{item.title}</h1>
                    </div>

                    <div className="mt-5">
                      <span className="text-[#93291E] font-bold">
                        R${item.price}
                      </span>
                      <div className="h-[95px]">
                        <p className="text-[#555555]">
                          {item.description.length > 90
                            ? `${item.description.substring(0, 90)}...`
                            : item.description}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2 items-center">
                      <img
                        src="/estrela.png"
                        alt="rating"
                        className="w-4 h-4"
                      />
                      <span className="text-[#565656] font-bold">
                        {item.rate}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
