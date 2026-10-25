import type { SmartphoneSubscriptionItem } from "../components/Product";

interface SmartphoneApiItem {
  id: string;
  nome: string;
  stock: number;
  modelo_produto: string;
  description: string;
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

const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:8080"
).replace(/\/+$/, "");

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

const resolveImageUrl = (imagePath: string): string => {
  const normalizedPath = imagePath.trim().replace(/\\/g, "/");

  if (!normalizedPath) {
    return "";
  }

  if (/^https?:\/\//i.test(normalizedPath)) {
    return normalizedPath;
  }

  const fileName = normalizedPath.split("/").pop() ?? "";

  if (!fileName || fileName === "." || fileName === "..") {
    return "";
  }

  return `${API_URL}/uploads/products/${encodeURIComponent(fileName)}`;
};

const mapSmartphone = (
  smartphone: SmartphoneApiItem,
): SmartphoneSubscriptionItem => {
  const imageUrl = resolveImageUrl(smartphone.image_url);

  return {
    id: smartphone.id,
    product: smartphone.nome,
    stock: smartphone.stock,
    description: smartphone.description,
    model: smartphone.modelo_produto,
    image: imageUrl,
    monthlyPrice: smartphone.preco_mensal,
    planType: smartphone.plano,
    benefits: [],
  };
};

const SmartphoneService = {
  async listarPagina(
    page = 0,
    size = 4,
  ): Promise<{
    content: SmartphoneSubscriptionItem[];
    number: number;
    totalElements: number;
    totalPages: number;
    size: number;
  }> {
    const response = await request<SmartphonePageResponse>(
      `/api/smartphones?page=${page}&size=${size}`,
    );

    return {
      ...response,
      content: response.content.map(mapSmartphone),
    };
  },

  async buscarPorId(id: string): Promise<SmartphoneSubscriptionItem> {
    const smartphone = await request<SmartphoneApiItem>(
      `/api/smartphones/${encodeURIComponent(id)}`,
    );

    return mapSmartphone(smartphone);
  },

  async buscarPorNome(nome: string): Promise<SmartphoneSubscriptionItem[]> {
    const smartphones = await request<SmartphoneApiItem[]>(
      `/api/smartphones/buscar?nome=${encodeURIComponent(nome)}`,
    );

    return smartphones.map(mapSmartphone);
  },

  async listarDisponiveis(): Promise<SmartphoneSubscriptionItem[]> {
    const smartphones = await request<SmartphoneApiItem[]>(
      "/api/smartphones/estoque/disponiveis",
    );

    return smartphones.map(mapSmartphone);
  },

  async listarEsgotados(): Promise<SmartphoneSubscriptionItem[]> {
    const smartphones = await request<SmartphoneApiItem[]>(
      "/api/smartphones/estoque/esgotados",
    );

    return smartphones.map(mapSmartphone);
  },

  escutarAtualizacoesEstoque(
    onUpdate: (idsProdutos: string[]) => void,
  ): () => void {
    if (window.location.pathname.includes("/admin")) {
      return () => {};
    }

    const source = new EventSource(
      `${API_URL}/api/smartphones/estoque/eventos`,
    );

    let active = true;

    source.addEventListener(
      "estoque-atualizado",
      (event: MessageEvent<string>) => {
        if (!active) {
          return;
        }

        try {
          const idsProdutos: unknown = JSON.parse(event.data);

          if (
            Array.isArray(idsProdutos) &&
            idsProdutos.every((id) => typeof id === "string")
          ) {
            onUpdate(idsProdutos);
          }
        } catch {
          return;
        }
      },
    );

    return () => {
      if (!active) {
        return;
      }

      active = false;
      source.close();
    };
  },
};

export { SmartphoneService };
export default SmartphoneService;
