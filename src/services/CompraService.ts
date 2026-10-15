const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:8080"
).replace(/\/+$/, "");

export interface ItemCompra {
  productId: string;
  quantity: number;
  planMonths: number;
}

export interface CompraResponse {
  mensagem: string;
  totalItens: number;
}

export const CompraService = {
  async concluirCompra(items: ItemCompra[]): Promise<CompraResponse> {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Sua sessão expirou. Faça login novamente.");
    }

    const response = await fetch(`${API_URL}/api/compras`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      let message = "Não foi possível concluir sua assinatura.";

      try {
        const data: { message?: string; detail?: string } =
          await response.json();

        message = data.message ?? data.detail ?? message;
      } catch {
        if (response.status === 401 || response.status === 403) {
          message = "Sua sessão expirou. Faça login novamente.";
        }
      }

      throw new Error(message);
    }

    return response.json() as Promise<CompraResponse>;
  },
};
