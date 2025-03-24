import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/auth",
});

export const login = async (email: any, password: any) => {
  const response = await api.post("/login", { email, password });
  return response.data;
};

export const register = async (
  email: string,
  password: string,
  name: string
) => {
  try {
    const response = await api.post("/register", { email, password, name });

    if (response.status === 201) {
      return response.data;
    } else {
      throw new Error("Erro ao registrar");
    }
  } catch (error) {
    console.error("Erro na requisição de registro:", error);
    throw error;
  }
};

export const getProducts = async (token: string) => {
  try {
    const response = await api.get("/getProduct", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Erro ao buscar dados da home");
    }
  } catch (error) {
    console.error("Erro na requisição de /getProduct:", error);

    throw error;
  }
};

export const insertProduct = async (
  title: any,
  price: any,
  description: any,
  image: any,
  rating: any
) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token não encontrado");
  }

  const response = await api.post(
    "/insertProduct",
    { title, price, description, image, rating },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
