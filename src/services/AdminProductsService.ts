import type { AdminProductFormData } from "../schemas/AdminProductsSchema";

const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:8080"
).replace(/\/+$/, "");

const PRODUCTS_ENDPOINT = `${API_URL}/api/admin/produtos`;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export interface AdminProduct {
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

export interface AdminPlan {
  id: string;
  tipo: string;
  preco_mensal: number;
}

export interface AdminProductPage {
  content: AdminProduct[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

interface UploadedImage {
  url: string;
}

const getToken = (): string | null => {
  return localStorage.getItem("token");
};

const request = async <T>(url: string, init: RequestInit = {}): Promise<T> => {
  const token = getToken();

  if (!token) {
    throw new Error("Sua sessão expirou. Entre novamente como administrador.");
  }

  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `Falha na requisição (HTTP ${response.status}).`;

    try {
      const body: unknown = await response.json();

      if (
        typeof body === "object" &&
        body !== null &&
        "detail" in body &&
        typeof body.detail === "string"
      ) {
        message = body.detail;
      } else if (
        typeof body === "object" &&
        body !== null &&
        "message" in body &&
        typeof body.message === "string"
      ) {
        message = body.message;
      } else if (
        typeof body === "object" &&
        body !== null &&
        "title" in body &&
        typeof body.title === "string"
      ) {
        message = body.title;
      } else if (
        typeof body === "object" &&
        body !== null &&
        "error" in body &&
        typeof body.error === "string"
      ) {
        message = body.error;
      }
    } catch {
      // A resposta pode não conter JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

export const listarProdutosAdmin = (
  search: string,
  page: number,
  signal?: AbortSignal,
): Promise<AdminProductPage> => {
  const params = new URLSearchParams({
    page: String(page),
    size: "10",
  });

  if (search.trim()) {
    params.set("search", search.trim());
  }

  return request<AdminProductPage>(
    `${PRODUCTS_ENDPOINT}?${params.toString()}`,
    { signal },
  );
};

export const listarPlanosAdmin = (
  signal?: AbortSignal,
): Promise<AdminPlan[]> => {
  return request<AdminPlan[]>(`${PRODUCTS_ENDPOINT}/planos`, { signal });
};

export const buscarProdutoAdmin = (
  id: string,
  signal?: AbortSignal,
): Promise<AdminProduct> => {
  return request<AdminProduct>(
    `${PRODUCTS_ENDPOINT}/${encodeURIComponent(id)}`,
    { signal },
  );
};

export const enviarImagemProduto = async (
  arquivo: File,
  modeloProduto: string,
): Promise<UploadedImage> => {
  const tiposPermitidos = ["image/png", "image/jpeg", "image/webp"];

  if (!tiposPermitidos.includes(arquivo.type)) {
    throw new Error("Formato não permitido. Utilize PNG, JPEG ou WebP.");
  }

  if (arquivo.size === 0 || arquivo.size > MAX_IMAGE_SIZE) {
    throw new Error(
      "A imagem deve ter tamanho maior que zero e no máximo 5 MB.",
    );
  }

  if (!modeloProduto.trim()) {
    throw new Error("Informe o modelo do produto antes de enviar a imagem.");
  }

  const formData = new FormData();

  formData.append("arquivo", arquivo);
  formData.append("modelo_produto", modeloProduto.trim());

  return request<UploadedImage>(`${PRODUCTS_ENDPOINT}/imagens`, {
    method: "POST",
    body: formData,
  });
};

export const criarProdutoAdmin = (
  produto: AdminProductFormData,
): Promise<AdminProduct> => {
  return request<AdminProduct>(PRODUCTS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(produto),
  });
};

export const atualizarProdutoAdmin = (
  id: string,
  produto: AdminProductFormData,
): Promise<AdminProduct> => {
  return request<AdminProduct>(
    `${PRODUCTS_ENDPOINT}/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(produto),
    },
  );
};

export const excluirProdutoAdmin = (id: string): Promise<void> => {
  return request<void>(`${PRODUCTS_ENDPOINT}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
};
