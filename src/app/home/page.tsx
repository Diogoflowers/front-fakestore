"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import Papa from "papaparse"; // Biblioteca para ler CSV

export default function HomePage() {
  interface Product {
    title: string;
    price: number;
    description: string;
    image: string;
    rating: number;
  }

  const [data, setData] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null); // Estado para mensagens de erro
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Estado para mensagem de sucesso

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (error || successMessage) {
      timeoutId = setTimeout(() => {
        setError(null);
        setSuccessMessage(null);
      }, 5000); // 5 segundos
    }

    // Limpa o timeout se o componente for desmontado ou se as mensagens mudarem
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [error, successMessage]);


  // Função para buscar os dados da API
  const handleApi = () => {
    axios.get("https://fakestoreapi.com/products").then((response) => {
      const formattedData = response.data.map((item: any) => ({
        title: item.title,
        price: item.price,
        description: item.description,
        image: item.image,
        rating: item.rating.rate,
      }));
      setData(formattedData);
      setError(null); // Limpa o erro ao buscar dados da API
      setSuccessMessage(null); // Limpa a mensagem de sucesso
    });
  };

  // Função para exportar os dados para CSV
  const exportToCSV = () => {
    if (data.length === 0) {
      alert("Nenhum dado disponível para exportar.");
      return;
    }

    // Cabeçalho do CSV
    const headers = "Title,Price,Description,Image,Rating\n";

    // Linhas do CSV
    const rows = data
      .map((item) => {
        return `"${item.title}",${item.price},"${item.description.replace(/"/g, '""')}","${item.image}",${item.rating}`;
      })
      .join("\n");

    // Combina cabeçalho e linhas
    const csv = headers + rows;

    // Cria um blob com o conteúdo CSV
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    // Cria um link para download
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "produtos.csv"; // Nome do arquivo
    link.style.visibility = "hidden";

    // Adiciona o link ao DOM e dispara o download
    document.body.appendChild(link);
    link.click();

    // Remove o link do DOM
    document.body.removeChild(link);
  };

  // Função para importar CSV
  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Limpa o erro e a mensagem de sucesso anteriores
    setError(null);
    setSuccessMessage(null);

    // Lê o arquivo CSV
    Papa.parse(file, {
      header: true, // Usa a primeira linha como cabeçalho
      dynamicTyping: true, // Converte números automaticamente
      complete: (results) => {
        // Verifica se há dados válidos
        if (results.data && results.data.length > 0) {
          const headers = results.meta.fields; // Cabeçalhos do CSV

          // Cabeçalhos esperados
          const expectedHeaders = ["Title", "Price", "Description", "Image", "Rating"];

          // Verifica se os cabeçalhos do CSV correspondem aos esperados
          const isValidHeaders = expectedHeaders.every((header) =>
            headers?.includes(header)
          );

          if (!isValidHeaders) {
            setError("O arquivo CSV não possui os cabeçalhos necessários.");
            return;
          }

          // Verifica se todas as linhas têm dados válidos
          const hasEmptyRows = results.data.some((item: any) => {
            return (
              !item.Title ||
              !item.Price ||
              !item.Description ||
              !item.Image ||
              !item.Rating
            );
          });

          if (hasEmptyRows) {
            setError("O arquivo CSV contém linhas incompletas ou vazias.");
            return;
          }

          // Converte os dados do CSV para o formato esperado
          const importedData = results.data.map((item: any) => ({
            title: item.Title,
            price: item.Price,
            description: item.Description,
            image: item.Image,
            rating: item.Rating,
          }));

          setData(importedData); // Atualiza o estado com os dados importados
          setSuccessMessage("Arquivo CSV importado com sucesso!"); // Exibe mensagem de sucesso
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
        <div className="flex justify-between items-center">
          <div className="flex flex-col justify-center items-center">
            <h1 className="text-3xl font-black">
              Fak<span className="text-[#ED213A]">E-Store</span>{" "}
            </h1>
          </div>
          <div className="flex gap-4">
            <label className="bg-[#ffff] text-black p-3 rounded-2xl font-bold cursor-pointer border">
              Importar CSV
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleImportCSV} // Adiciona o evento de importação
              />
            </label>
            <button
              className="bg-[#ED213A] p-3 rounded-2xl font-bold cursor-pointer border"
              onClick={handleApi}
            >
              Gerar Lista
            </button>
          </div>
        </div>

        {/* Exibe a mensagem de erro, se houver */}
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Exibe a mensagem de sucesso, se houver */}
        {successMessage && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
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
            <div className="flex flex-wrap gap-6">
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
                      <img src="/estrela.png" alt="rating" className="w-4 h-4" />
                      <span className="text-[#565656] font-bold">
                        {item.rating}
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