import type { SmartphoneSubscriptionItem } from "../components/Product";

interface SmartphoneApiItem {
  id: string;
  nome: string;
  stock: number;
  modelo_produto: string;
  image_url: string;
  id_plano: string;
  plano: string;
  preco_mensal: number;
}

interface SmartphonePageResponse {
  content: SmartphoneApiItem[];
  number: number;
  totalElements: number;
  totalPages: number;
  size: number;
}

const API_URL = import.meta.env.VITE_API_URL;

const getAuthorizationHeaders = (): HeadersInit => {
  const token = localStorage.getItem("token");

  return token ? { Authorization: `Bearer ${token}` } : {};
};

const request = async <T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthorizationHeaders(),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Erro na API: ${response.status}`);
  }

  return response.json() as Promise<T>;
};

const mapSmartphone = (
  smartphone: SmartphoneApiItem,
): SmartphoneSubscriptionItem => ({
  id: smartphone.id,
  product: smartphone.nome,
  stock: smartphone.stock,
  description: "",
  model: smartphone.modelo_produto,
  image: smartphone.image_url,
  monthlyPrice: smartphone.preco_mensal,
  planType: smartphone.plano,
  benefits: [],
});

export const SmartphoneService = {
  async listarPagina(
    page: number,
    size: number,
  ): Promise<{
    produtos: SmartphoneSubscriptionItem[];
    totalPages: number;
    totalElements: number;
    currentPage: number;
  }> {
    const data = await request<SmartphonePageResponse>(
      `/api/smartphones?page=${page}&size=${size}`,
    );

    return {
      produtos: data.content.map(mapSmartphone),
      totalPages: data.totalPages,
      totalElements: data.totalElements,
      currentPage: data.number,
    };
  },

  async buscarPorId(id: string): Promise<SmartphoneSubscriptionItem> {
    const data = await request<SmartphoneApiItem>(
      `/api/smartphones/${encodeURIComponent(id)}`,
    );

    return mapSmartphone(data);
  },

  async buscarPorNome(nome: string): Promise<SmartphoneSubscriptionItem[]> {
    const data = await request<SmartphoneApiItem[]>(
      `/api/smartphones/buscar?nome=${encodeURIComponent(nome)}`,
    );

    return data.map(mapSmartphone);
  },

  async listarDisponiveis(): Promise<SmartphoneSubscriptionItem[]> {
    const data = await request<SmartphoneApiItem[]>(
      "/api/smartphones/estoque/disponiveis",
    );

    return data.map(mapSmartphone);
  },

  async listarEsgotados(): Promise<SmartphoneSubscriptionItem[]> {
    const data = await request<SmartphoneApiItem[]>(
      "/api/smartphones/estoque/esgotados",
    );

    return data.map(mapSmartphone);
  },
};

export default SmartphoneService;
